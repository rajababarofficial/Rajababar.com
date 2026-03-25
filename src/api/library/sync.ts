import { Request, Response } from 'express';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
};

export const syncHandler = async (req: Request, res: Response) => {
  try {
    const lastId = Number(req.query.last_id ?? 0);
    const limit  = Math.min(Number(req.query.limit ?? 500), 2000); 

    const client = await getPool().connect();

    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const countRes = await client.query(
        'SELECT COUNT(*) FROM "Books" WHERE CAST(id AS BIGINT) > $1',
        [lastId]
      );
      const totalNew = Number(countRes.rows[0].count);

      const dataRes = await client.query(
        `SELECT
           id, title_en, title_sd,
           author_en, author_sd,
           category, publisher, year, language,
           source_name, identifier, thumbnail, link
         FROM "Books"
         WHERE CAST(id AS BIGINT) > $1
         ORDER BY CAST(id AS BIGINT) ASC
         LIMIT $2`,
        [lastId, limit]
      );

      res.json({
        books:     dataRes.rows,
        total_new: totalNew,
        returned:  dataRes.rows.length,
        has_more:  totalNew > limit,
        next_id:   dataRes.rows.length > 0
          ? dataRes.rows[dataRes.rows.length - 1].id
          : lastId,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ Sync API Error:', err.message);
    res.status(500).json({ error: 'Sync failed', detail: err.message });
  }
};
