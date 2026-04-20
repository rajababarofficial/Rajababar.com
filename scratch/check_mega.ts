import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const res = await pool.query('SELECT COUNT(*) FROM public.mega');
    console.log('Count:', res.rows[0].count);
    
    const sample = await pool.query('SELECT * FROM public.mega LIMIT 1');
    console.log('Sample Row:', sample.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkDb();
