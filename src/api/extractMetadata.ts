import { exiftool } from 'exiftool-vendored';
import formidable from 'formidable';
import fs from 'fs';
import { Request, Response } from 'express';

export const extractMetadataHandler = async (req: Request, res: Response) => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const metadata = await exiftool.read(file.filepath);
      
      // Clean up: remove the temporary file
      fs.unlink(file.filepath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });

      res.json({
        success: true,
        metadata: metadata,
      });
    } catch (error) {
      console.error('ExifTool error:', error);
      res.status(500).json({ error: 'Failed to extract metadata' });
    }
  });
};
