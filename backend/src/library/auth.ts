import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getPool } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_keep_it_secure';

export const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // In a real app, you would fetch the user from a database.
    // For this demonstration, we'll use credentials from environment variables.
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const hashedAdminPassword = process.env.ADMIN_PASSWORD_HASH; // Pre-hashed password stored in .env

    if (username !== adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!hashedAdminPassword) {
      console.error('❌ ADMIN_PASSWORD_HASH is not set in .env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const isMatch = await bcrypt.compare(password, hashedAdminPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ success: true, token });
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
