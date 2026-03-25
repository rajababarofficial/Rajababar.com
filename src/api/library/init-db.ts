/**
 * api/library/init-db.ts
 */

import { Request, Response } from 'express';
import { Pool }              from 'pg';
import initSqlJs             from 'sql.js';
import path                  from 'path';
import fs                    from 'fs';

let _pool: Pool | null = null;
const getPool = () => {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return _pool;
};

export const initDbHandler = async (req: Request, res: Response) => {
  try {
    const staticDb = path.join(process.cwd(), 'public', 'database', 'books.db');
    if (fs.existsSync(staticDb)) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="books.db"');
      res.setHeader('Cache-Control', 'public, max-age=3600'); 
      return res.sendFile(staticDb);
    }

    const client = await getPool().connect();
    console.log('📡 Connected to Postgres (Remote)...');
    let rows: any[] = [];
    try {
      // Auto-create table if missing
      console.log('🏗️ Ensuring "books" table exists in Postgres...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Books" (
          id SERIAL PRIMARY KEY,
          title_en TEXT NOT NULL,
          title_sd TEXT,
          author_en TEXT,
          author_sd TEXT,
          category TEXT,
          publisher TEXT,
          year TEXT,
          language TEXT,
          source_name TEXT,
          identifier TEXT UNIQUE,
          thumbnail TEXT,
          link TEXT
        )
      `);

      console.log('📊 Fetching all books from Postgres...');
      const r = await client.query(`
        SELECT id, title_en, title_sd, author_en, author_sd,
               category, publisher, year, language, source_name,
               identifier, thumbnail, link
        FROM "Books" ORDER BY id ASC
      `);
      rows = r.rows;
      console.log(`📥 Found ${rows.length} books in Postgres.`);
      
      if (rows.length === 0) {
        console.warn('⚠️ Postgres database is empty! Please add some records to "books" table.');
      }
    } finally {
      client.release();
    }

    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');
    const SQL = await initSqlJs({ locateFile: f => path.join(wasmPath, f) });
    const db  = new SQL.Database();

    db.run(`
      CREATE TABLE Books (
        id INTEGER PRIMARY KEY,
        title_en TEXT, title_sd TEXT,
        author_en TEXT, author_sd TEXT,
        category TEXT, publisher TEXT,
        year TEXT, language TEXT,
        source_name TEXT, identifier TEXT,
        thumbnail TEXT, link TEXT
      )
    `);
    db.run('CREATE INDEX idx_books_id ON Books(id)');

    db.run('BEGIN');
    const stmt = db.prepare(`
      INSERT INTO Books VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    for (const b of rows) {
      stmt.run([
        b.id, b.title_en, b.title_sd, b.author_en, b.author_sd,
        b.category, b.publisher, b.year, b.language, b.source_name,
        b.identifier, b.thumbnail, b.link ?? null
      ]);
    }
    stmt.free();
    db.run('COMMIT');

    const buffer = Buffer.from(db.export());
    db.close();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="books.db"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err: any) {
    console.error('❌ init-db error:', err.message);
    res.status(500).json({ error: 'init-db failed', detail: err.message });
  }
};

export const semanticSearchHandler = async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  const limit = Math.min(Number(req.query.limit ?? 20), 100);

  if (!query) return res.status(400).json({ error: 'q required' });

  try {
    const client = await getPool().connect();
    try {
      const textRes = await client.query(
        `SELECT
           id, title_en, title_sd, author_en, author_sd,
           category, publisher, year, language,
           source_name, identifier, thumbnail, link,
           ts_rank(
             to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(author_en,'')),
             plainto_tsquery('english', $1)
           ) AS similarity
         FROM "Books"
         WHERE
           to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(author_en,'') || ' ' || coalesce(title_sd,''))
           @@ plainto_tsquery('english', $1)
           OR title_sd ILIKE $2
           OR title_en ILIKE $2
           OR author_en ILIKE $2
         ORDER BY similarity DESC
         LIMIT $3`,
        [query, `%${query}%`, limit]
      );

      res.json({
        results: textRes.rows,
        mode:    'fulltext',
        count:   textRes.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ Search error:', err.message);
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
};
