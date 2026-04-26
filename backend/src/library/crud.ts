import { Request, Response } from 'express';
import { getPool } from './db';

/**
 * POST /api/library/add
 * Protected: Admin Only
 */
export const addBookHandler = async (req: Request, res: Response) => {
  const { 
    title_en, title_sd, author_en, author_sd, 
    category, publisher, year, language, 
    source_name, identifier, thumbnail, link 
  } = req.body;

  try {
    const client = await getPool().connect();
    try {
      // Basic insert. Postgres handles SERIAL id.
      const result = await client.query(
        `INSERT INTO public.mhp 
        (title_en, title_sd, author_en, author_sd, category, publisher, year, language, source_name, identifier, thumbnail, link) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING id`,
        [title_en, title_sd, author_en, author_sd, category, publisher, year, language, source_name, identifier, thumbnail, link]
      );

      // Reset sequence if needed (user mentioned setval)
      // await client.query("SELECT setval('mhp_id_seq', (SELECT MAX(id) FROM public.mhp))");

      res.status(201).json({ success: true, id: result.rows[0].id });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Add Book Error:', error.message);
    res.status(500).json({ error: 'Failed to add book', details: error.message });
  }
};

/**
 * PUT /api/library/edit/:id
 * Protected: Admin Only
 */
export const editBookHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const fields = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID is required' });
  if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'No fields to update' });

  try {
    const client = await getPool().connect();
    try {
      const keys = Object.keys(fields);
      const values = Object.values(fields);
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      
      const result = await client.query(
        `UPDATE public.mhp SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Edit Book Error:', error.message);
    res.status(500).json({ error: 'Failed to update book', details: error.message });
  }
};

/**
 * DELETE /api/library/delete/:id
 * Protected: Admin Only
 */
export const deleteBookHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'ID is required' });

  try {
    const client = await getPool().connect();
    try {
      const result = await client.query('DELETE FROM public.mhp WHERE id = $1', [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ success: true, message: 'Book deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ Delete Book Error:', error.message);
    res.status(500).json({ error: 'Failed to delete book', details: error.message });
  }
};
