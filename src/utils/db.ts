/**
 * db.ts — Client-Side SQLite + PostgreSQL Sync Engine
 *
 * Flow:
 *  1. Pehli baar: /api/library/init-db se poora DB download (compressed SQLite)
 *  2. Baad mein: sirf naye records /api/library/sync?last_id=X se
 *  3. Sab IndexedDB mein save — offline bhi kaam kare
 *  4. pgvector search: /api/library/search?q=... se semantic results
 */

import initSqlJs from 'sql.js';

let dbInstance: any = null;

const DB_STORE_NAME = 'books_db_store_v2';  // v2 → fresh start agar purana schema alag ho
const DB_KEY = 'sqlite_db';
const META_KEY = 'sqlite_meta';         // { lastSync, version }
const SYNC_INTERVAL = 1000 * 60 * 30;        // 30 min mein dobara sync

// ─────────────────────────────────────────────
// IndexedDB helpers
// ─────────────────────────────────────────────

const openIDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_STORE_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('keyvalue');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbPut = async (key: string, value: any) => {
  const idb = await openIDB();
  return new Promise<void>((resolve, reject) => {
    const tx = idb.transaction('keyvalue', 'readwrite');
    tx.objectStore('keyvalue').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const idbGet = async <T>(key: string): Promise<T | null> => {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const req = idb.transaction('keyvalue', 'readonly').objectStore('keyvalue').get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
};

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

const getLocalMaxId = (db: any): number => {
  try {
    const res = db.exec('SELECT MAX(id) FROM Books');
    if (res.length > 0 && res[0].values[0][0] !== null)
      return Number(res[0].values[0][0]);
  } catch (_) { }
  return 0;
};

const getLocalCount = (db: any): number => {
  try {
    const res = db.exec('SELECT COUNT(*) FROM Books');
    return Number(res[0]?.values[0][0] ?? 0);
  } catch (_) { return 0; }
};

/** Books ko batch mein SQLite mein insert karo */
const insertBooks = (db: any, books: any[]) => {
  if (!books.length) return;
  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO Books (
      id, title_en, title_sd, author_en, author_sd,
      category, publisher, year, language, source_name,
      identifier, thumbnail, link
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const b of books) {
    stmt.run([
      b.id, b.title_en, b.title_sd, b.author_en, b.author_sd,
      b.category, b.publisher, b.year, b.language, b.source_name,
      b.identifier, b.thumbnail, b.link ?? null
    ]);
  }
  stmt.free();
  db.run('COMMIT');
};

// ─────────────────────────────────────────────
// SYNC  (sirf naye records Postgres se)
// ─────────────────────────────────────────────

export const syncWithPostgres = async (db: any): Promise<boolean> => {
  try {
    let lastId = getLocalMaxId(db);
    const meta = await idbGet<{ lastSync: number }>('META_KEY');
    const now = Date.now();

    // 30 min se pehle dobara sync na karo
    if (meta && now - meta.lastSync < SYNC_INTERVAL) {
      console.log('⏩ Sync skipped — too soon');
      return false;
    }

    console.log(`🔄 Syncing… (local max id = ${lastId})`);
    
    let totalInserted = 0;
    let offset = 0;
    let lastSync = meta ? meta.lastSync : 0;
    
    while (true) {
      const res = await fetch(`/api/library/sync?last_id=${lastId}&last_sync=${lastSync}&offset=${offset}&_t=${Date.now()}`);
      if (!res.ok) {
        console.error('❌ Sync API failed:', res.status, await res.text());
        break;
      }

      const { books = [], total_new, has_more, next_offset } = await res.json();

      if (books.length > 0) {
        console.log(`📥 ${books.length} records fetched! Inserting...`);
        
        // Ensure no `undefined` bypasses the query bindings
        const safeBooks = books.map((b: any) => ({
          ...b,
          title_en: b.title_en ?? null,
          title_sd: b.title_sd ?? null,
          author_en: b.author_en ?? null,
          author_sd: b.author_sd ?? null,
          category: b.category ?? null,
          publisher: b.publisher ?? null,
          year: b.year ?? null,
          language: b.language ?? null,
          source_name: b.source_name ?? null,
          identifier: b.identifier ?? null,
          thumbnail: b.thumbnail ?? null,
          link: b.link ?? null,
        }));

        try {
          insertBooks(db, safeBooks);
          totalInserted += safeBooks.length;
          offset = next_offset;
        } catch (insertErr) {
          console.error('❌ Error in insertBooks:', insertErr);
          throw insertErr;
        }
      } else {
        break;
      }

      if (!has_more) {
        break;
      }
    }

    if (totalInserted > 0) {
      const updated = db.export();
      await idbPut(DB_KEY, updated);
      console.log(`✅ Sync complete. Total Synced: ${totalInserted}. Local total: ${getLocalCount(db)}`);
      await idbPut(META_KEY, { lastSync: now, localCount: getLocalCount(db) });
      return true;
    } else {
      console.log(`✅ Already up to date. Local total: ${getLocalCount(db)}`);
      await idbPut(META_KEY, { lastSync: now, localCount: getLocalCount(db) });
      return false;
    }

  } catch (err) {
    console.error('❌ Sync error:', err);
    return false;
  }
};

// ─────────────────────────────────────────────
// INIT  (pehli baar full DB load)
// ─────────────────────────────────────────────

const fetchInitialDb = async (): Promise<Uint8Array> => {
  console.log('📥 Fetching initial DB from server…');

  // Option A: Server se prebuilt SQLite file (fastest)
  const res = await fetch('/api/library/init-db', { headers: { Accept: 'application/octet-stream' } });
  if (!res.ok) throw new Error(`init-db failed: ${res.status}`);

  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
};

// ─────────────────────────────────────────────
// PUBLIC: getDatabase
// ─────────────────────────────────────────────

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({ locateFile: f => f.includes('sql-wasm.wasm') ? '/sql-wasm-browser.wasm' : `/${f}` });

  // 1. IndexedDB se load karo
  let dbBuffer = await idbGet<Uint8Array>(DB_KEY);

  if (!dbBuffer) {
    // 2. Server se initial snapshot lo
    try {
      dbBuffer = await fetchInitialDb();
    } catch (e) {
      console.warn('⚠️ init-db failed, empty DB se shuru…');
      // Empty DB banana agar server bhi nahi mila
      const empty = new SQL.Database();
      empty.run(`
        CREATE TABLE IF NOT EXISTS Books (
          id INTEGER PRIMARY KEY,
          title_en TEXT, title_sd TEXT,
          author_en TEXT, author_sd TEXT,
          category TEXT, publisher TEXT,
          year TEXT, language TEXT,
          source_name TEXT, identifier TEXT,
          thumbnail TEXT, link TEXT
        )
      `);
      dbBuffer = empty.export();
      empty.close();
    }
    await idbPut(DB_KEY, dbBuffer);
    await idbPut(META_KEY, { lastSync: 0, localCount: 0 });
  }

  dbInstance = new SQL.Database(dbBuffer);
  console.log(`📦 DB ready — ${getLocalCount(dbInstance)} books locally`);
  return dbInstance;
};

// ─────────────────────────────────────────────
// PUBLIC: pgvector semantic search
// (SQLite mein nahi, seedha server pe)
// ─────────────────────────────────────────────

export interface BookResult {
  id: number;
  title_en: string;
  title_sd: string;
  author_en: string;
  author_sd: string;
  category: string;
  publisher: string;
  year: string;
  language: string;
  source_name: string;
  identifier: string;
  thumbnail: string;
  link: string;
  similarity?: number;   // pgvector se aata hai
}

export const semanticSearch = async (query: string, limit = 20): Promise<BookResult[]> => {
  if (!query.trim()) return [];
  const res = await fetch(`/api/library/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) return [];
  const { results } = await res.json();
  return results ?? [];
};
