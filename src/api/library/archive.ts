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
    const year = (req.query.year as string || '').trim();
    const employee = (req.query.employee as string || '').trim();
    const month = (req.query.month as string || '').trim();
    const offset = (page - 1) * limit;

    const client = await getPool().connect();
    
    try {
      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];
      
      // Search (File Name only)
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`"File Name" ILIKE $${params.length}`);
      }
      
      // Year filter - partial match
      if (year) {
        params.push(`%${year}%`);
        conditions.push(`"Year"::text ILIKE $${params.length}`);
      }
      
      // Employee filter - partial match
      if (employee) {
        params.push(`%${employee}%`);
        conditions.push(`"Employee_Name" ILIKE $${params.length}`);
      }
      
      // Month filter - partial match
      if (month) {
        params.push(`%${month}%`);
        conditions.push(`"Month"::text ILIKE $${params.length}`);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

// Get unique filter options from entire database
export const archiveFiltersHandler = async (req: Request, res: Response) => {
  try {
    const client = await getPool().connect();
    
    try {
      // Get all unique years, employees, months
      const [yearResult, employeeResult, monthResult] = await Promise.all([
        client.query(`SELECT DISTINCT "Year"::text as value FROM "Archive" WHERE "Year" IS NOT NULL ORDER BY value DESC`),
        client.query(`SELECT DISTINCT "Employee_Name" as value FROM "Archive" WHERE "Employee_Name" IS NOT NULL ORDER BY value`),
        client.query(`SELECT DISTINCT "Month" as value FROM "Archive" WHERE "Month" IS NOT NULL ORDER BY value`)
      ]);

      res.json({
        years: yearResult.rows.map((r: any) => r.value),
        employees: employeeResult.rows.map((r: any) => r.value),
        months: monthResult.rows.map((r: any) => r.value)
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ Archive Filters API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch filter options', detail: err.message });
  }
};