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
    const offset = (page - 1) * limit;

    const client = await getPool().connect();
    
    try {
      // Table already exists with user's schema:
      // "ID", "Source_Table", "Employee_Name", "Path", "Folder", "Status", 
      // "Year", "Month", "File_Hash", "Storage_Link", "Is_Master", "Created_At", 
      // "File Name", "Designation"

      // Build WHERE clause for search
      let whereClause = '';
      const params: any[] = [];
      const searchFields = ['"File Name"', '"Employee_Name"', '"Path"', '"Designation"', '"Folder"', '"Source_Table"', '"Status"'];
      
      if (search) {
        const searchConditions = searchFields.map((field) => {
          params.push(`%${search}%`);
          return `${field} ILIKE $${params.length}`;
        });
        whereClause = `WHERE ${searchConditions.join(' OR ')}`;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) FROM "Archive" ${whereClause}`,
        params
      );
      const total = Number(countResult.rows[0].count);

      // Get paginated data - order by ID DESC
      const dataResult = await client.query(
        `SELECT "ID", "File Name", "Path", "Employee_Name", "Designation", "Folder", "Status", "Year", "Month", "Source_Table", "Created_At" FROM "Archive" ${whereClause} ORDER BY "ID" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      // Map to match frontend expectations (ID instead of ID)
      const mappedData = dataResult.rows.map((row: any) => ({
        ID: row.ID,
        'File Name': row['File Name'],
        Path: row.Path,
        Employee_Name: row.Employee_Name,
        Designation: row.Designation,
        Folder: row.Folder,
        Status: row.Status,
        Year: row.Year,
        Month: row.Month,
        Source_Table: row.Source_Table,
        Created_At: row.Created_At
      }));

      res.json({
        data: mappedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });

    } finally {
      client.release();
    }

  } catch (err: any) {
    console.error('❌ Archive API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch archive data', detail: err.message });
  }
};