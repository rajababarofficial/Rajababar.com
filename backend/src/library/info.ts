import { Request, Response } from 'express';
import { getPool } from './db';

export const infoHandler = async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();
    try {
      const countRes = await client.query('SELECT COUNT(*) FROM public.mhp');
      res.json({
        total: Number(countRes.rows[0].count),
        server_time: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ Info API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch library info' });
  }
};
