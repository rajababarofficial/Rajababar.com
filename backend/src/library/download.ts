import { Request, Response } from 'express';
import { getPool } from './db';
import { getPresignedDownloadUrl } from './s3';

export const downloadHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await getPool().query(
      'SELECT file_name FROM public.mhp WHERE id = $1', 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const fileKey = result.rows[0].file_name;
    const signedUrl = await getPresignedDownloadUrl(fileKey);

    // Browser ko temporary S3 link par bhej dein
    res.redirect(signedUrl);
  } catch (err: any) {
    console.error('❌ Download error:', err.message);
    res.status(500).json({ error: "Download failed" });
  }
};