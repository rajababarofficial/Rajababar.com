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
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return pool;
};

export const archiveListHandler = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const search = (req.query.search as string || '').trim();
    const language = (req.query.language as string || '').trim();
    const year = (req.query.year as string || '').trim();
    const customKey = (req.query.customKey as string || '').trim();
    const customValue = (req.query.customValue as string || '').trim();
    const sortBy = (req.query.sortBy as string || 'id');
    const sortOrder = (req.query.sortOrder as string || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const allowedSortFields = ['id', 'file_name', 'title', 'author', 'pages'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';

    const client = await getPool().connect();

    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(file_name ILIKE $${params.length} OR title ILIKE $${params.length} OR author ILIKE $${params.length})`);
      }





      if (language) {
        params.push(language);
        conditions.push(`custom_data->>'Language' ILIKE $${params.length}`);
      }

      if (year) {
        params.push(year);
        conditions.push(`custom_data->>'DateOfPublication' ILIKE $${params.length}`);
      }

      if (customKey && customValue) {
        params.push(customValue);
        conditions.push(`custom_data->>'${customKey}' ILIKE $${params.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await client.query(
        `SELECT COUNT(*) FROM public.mega ${whereClause}`,
        params
      );
      const total = Number(countResult.rows[0].count);

      let orderBySql = '';
      const fallbackTitle = `LOWER(COALESCE(NULLIF(title, ''), NULLIF(file_name, '')))`;

      if (finalSortBy === 'title') {
        orderBySql = `${fallbackTitle} ${sortOrder} NULLS LAST`;
      } else if (finalSortBy === 'author') {
        orderBySql = `LOWER(NULLIF(author, '')) ${sortOrder} NULLS LAST`;
      } else if (finalSortBy === 'file_name') {
        orderBySql = `LOWER(file_name) ${sortOrder} NULLS LAST`;
      } else {
        orderBySql = `${finalSortBy} ${sortOrder} NULLS LAST`;
      }

      const dataResult = await client.query(
        `SELECT id, file_name, title, author, pages, custom_data, thumb_path, file_node, folder_node
         FROM public.mega ${whereClause}
         ORDER BY ${orderBySql}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      res.json({
        data: dataResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sortBy: finalSortBy,
        sortOrder,
      });

    } finally {
      client.release();
    }

  } catch (err: any) {
    console.error('❌ Mega Archive API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch mega archive data', detail: err.message });
  }
};

export const archiveFiltersHandler = async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const [publisherResult, scannedByResult, languageResult, yearResult, keysResult] = await Promise.all([
      pool.query(
        `SELECT DISTINCT custom_data->>'PublishedBy' as value
         FROM public.mega
         WHERE custom_data->>'PublishedBy' IS NOT NULL AND custom_data->>'PublishedBy' != ''
         ORDER BY value`
      ),
      pool.query(
        `SELECT DISTINCT custom_data->>'ScannedBy' as value
         FROM public.mega
         WHERE custom_data->>'ScannedBy' IS NOT NULL AND custom_data->>'ScannedBy' != ''
         ORDER BY value`
      ),
      pool.query(
        `SELECT DISTINCT custom_data->>'Language' as value
         FROM public.mega
         WHERE custom_data->>'Language' IS NOT NULL
           AND custom_data->>'Language' != ''
         ORDER BY value`
      ),
      pool.query(
        `SELECT DISTINCT custom_data->>'DateOfPublication' as value
         FROM public.mega
         WHERE custom_data->>'DateOfPublication' IS NOT NULL
           AND custom_data->>'DateOfPublication' != ''
           AND custom_data->>'DateOfPublication' != 'Unknown'
         ORDER BY value DESC`
      ),
      pool.query(
        `SELECT DISTINCT jsonb_object_keys(custom_data) as key
         FROM public.mega
         WHERE custom_data IS NOT NULL AND jsonb_typeof(custom_data) = 'object'
         ORDER BY key`
      ),
    ]);

    res.json({
      publishers: publisherResult.rows.map((r: any) => r.value),
      scannedBy: scannedByResult.rows.map((r: any) => r.value),
      languages: languageResult.rows.map((r: any) => r.value),
      years: yearResult.rows.map((r: any) => r.value),
      customKeys: keysResult.rows.map((r: any) => r.key),
    });

  } catch (err: any) {
    console.error('❌ Mega Filters API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch filter options', detail: err.message });
  }
};

export const archiveDetailsHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const client = await getPool().connect();

    try {
      const result = await client.query(
        `SELECT id, file_name, title, author, pages, custom_data, thumb_path, file_node, folder_node
         FROM public.mega WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(result.rows[0]);

    } finally {
      client.release();
    }

  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch item details', detail: err.message });
  }
};

export const archiveCustomFieldValuesHandler = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    const client = await getPool().connect();

    try {
      // Use a whitelist or be careful about direct string interpolation in identifiers
      // But since we're using ->> with a dynamic string, we're relatively safe from SQLi 
      // if we ensure 'key' doesn't contain malicious characters. 
      // However, $1 doesn't work for JSONB key names in some versions of PG drivers for the key itself.
      // Better way: use jsonb_extract_path_text
      const result = await client.query(
        `SELECT DISTINCT custom_data ->> $1 as value
         FROM public.mega
         WHERE custom_data ->> $1 IS NOT NULL AND custom_data ->> $1 != ''
         ORDER BY value`,
        [key]
      );

      res.json(result.rows.map((r: any) => r.value));

    } finally {
      client.release();
    }

  } catch (err: any) {
    console.error('❌ Mega Custom Values API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch custom values', detail: err.message });
  }
};