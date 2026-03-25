import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  console.log('🚀 Seeding remote database at:', process.env.DATABASE_URL);
  
  const client = await pool.connect();
  try {
    // 1. Create Table (just in case)
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

    // 2. Insert Sample Data
    const books = [
      {
        title_en: 'Sample Book 1',
        title_sd: 'نمونو ڪتاب ۱',
        author_en: 'Author One',
        author_sd: 'ليکڪ پهريون',
        category: 'History',
        year: '2020',
        language: 'Sindhi',
        source_name: 'MHPISSJ',
        identifier: 'sample-book-1',
        thumbnail: 'https://archive.org/services/img/sample-book-1'
      },
      {
        title_en: 'The History of Sindh',
        title_sd: 'سنڌ جي تاريخ',
        author_en: 'Dr. M.H Panhwar',
        author_sd: 'ڊاڪٽر ايم ايڇ پنهور',
        category: 'History',
        year: '1983',
        language: 'English',
        source_name: 'Archive.org',
        identifier: 'historyofsindh00panh',
        thumbnail: 'https://archive.org/services/img/historyofsindh00panh'
      }
    ];

    for (const b of books) {
      await client.query(`
        INSERT INTO "Books" (title_en, title_sd, author_en, author_sd, category, year, language, source_name, identifier, thumbnail)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (identifier) DO NOTHING
      `, [b.title_en, b.title_sd, b.author_en, b.author_sd, b.category, b.year, b.language, b.source_name, b.identifier, b.thumbnail]);
    }

    console.log('✅ Seeding complete! Check your library now.');
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
