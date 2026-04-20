/**
 * api/library/archive.ts
 */

import { Request, Response } from 'express';
import { Pool } from 'pg';

let pool: Pool | null = null;
const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
};

export const archiveListHandler = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const search = (req.query.search as string || '').trim();
    const author = (req.query.author as string || '').trim();
    const offset = (page - 1) * limit;

    const client = await getPool().connect();
    
    try {
      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];
      
      // Search (Across file_name, title, author)
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(file_name ILIKE $${params.length} OR title ILIKE $${params.length} OR author ILIKE $${params.length})`);
      }
      
      // Author filter
      if (author) {
        params.push(author);
        conditions.push(`author = $${params.length}`);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) FROM public.mega ${whereClause}`,
        params
      );
      const total = Number(countResult.rows[0].count);

      // Get paginated data
      const dataResult = await client.query(
        `SELECT id, file_name, title, author, pages, custom_data, thumb_path, file_node, folder_node FROM public.mega ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.json({
        data: dataResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } finally {
      client.release();
    }

  } catch (err: any) {
    console.error('❌ Mega Archive API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch mega archive data', detail: err.message });
  }
};

// Get unique filter options from entire database
export const archiveFiltersHandler = async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();
    
    try {
      // Get unique authors
      const authorResult = await client.query(
        `SELECT DISTINCT author as value FROM public.mega WHERE author IS NOT NULL AND author != '' ORDER BY value`
      );

      res.json({
        authors: authorResult.rows.map((r: any) => r.value),
        // Placeholder for other filters if needed later
        years: [],
        months: []
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ Mega Filters API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch filter options', detail: err.message });
  }
};