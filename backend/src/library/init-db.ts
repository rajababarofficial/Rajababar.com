import { Request, Response } from 'express';
import { getPool } from './db';
import initSqlJs from 'sql.js';
import path from 'path';

export const initDbHandler = async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();
    let rows: any[] = [];
    try {
      const r = await client.query(`
        SELECT id, title_en, title_sd, author_en, author_sd,
               category, publisher, year, language, source_name,
               identifier, thumbnail, file_name 
        FROM public.mhp ORDER BY id ASC
      `);
      rows = r.rows;
    } finally {
      client.release();
    }

    const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');
    const SQL = await initSqlJs({ locateFile: f => path.join(wasmPath, f) });
    const db = new SQL.Database();

    db.run(`
      CREATE TABLE Books (
        id INTEGER PRIMARY KEY,
        title_en TEXT, title_sd TEXT,
        author_en TEXT, author_sd TEXT,
        category TEXT, publisher TEXT,
        year TEXT, language TEXT,
        source_name TEXT, identifier TEXT,
        thumbnail TEXT, s3_key TEXT, s3_url TEXT
      )
    `);

    db.run('BEGIN');
    const stmt = db.prepare(`INSERT INTO Books VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    
    for (const b of rows) {
      // Hamara naya Proxy Link
      const proxyLink = `${process.env.APP_URL}/api/library/download/${b.id}`;
      
      stmt.run([
        b.id, b.title_en, b.title_sd, b.author_en, b.author_sd,
        b.category, b.publisher, b.year, b.language, b.source_name,
        b.identifier, b.thumbnail, 
        b.file_name, // s3_key
        proxyLink    // s3_url
      ]);
    }
    stmt.free();
    db.run('COMMIT');

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="books.db"');
    res.send(Buffer.from(db.export()));
    db.close();

  } catch (err: any) {
    res.status(500).json({ error: 'init-db failed', detail: err.message });
  }
};