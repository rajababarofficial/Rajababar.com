import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mega'
        `);
        console.log('Columns in mega table:', res.rows);
        client.release();
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}
check();
