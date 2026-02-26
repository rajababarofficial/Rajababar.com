import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { extractMetadataHandler } from './src/api/extractMetadata';
import { searchBooksHandler } from './src/api/library/search';
import { trendingBooksHandler } from './src/api/library/trending';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route: Extract Metadata
  app.post('/api/extract-metadata', extractMetadataHandler);

  // Library Aggregator Routes
  app.get('/api/library/search', searchBooksHandler);
  app.get('/api/library/trending', trendingBooksHandler);

  // Fonts API for Preview
  app.get('/api/fonts', (req, res) => {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    let fonts: { name: string; category: string; file: string; url: string }[] = [];

    const getCategory = (subdir: string) => {
      const lower = subdir.toLowerCase();
      if (lower.includes('sindhi')) return 'Sindhi';
      if (lower.includes('urdu')) return 'Urdu';
      if (lower.includes('bahij')) return 'Bahij Nassim';
      return subdir.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const scanDir = (dir: string, baseRelativePath: string) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir, { withFileTypes: true });
      items.forEach(item => {
        if (item.isDirectory()) {
          scanDir(path.join(dir, item.name), path.join(baseRelativePath, item.name));
        } else if (item.isFile()) {
          const extension = path.extname(item.name).toLowerCase();
          if (['.ttf', '.otf', '.woff', '.woff2'].includes(extension)) {
            // Determine category from the immediate parent directory name
            const parentDirName = path.basename(dir);
            const category = getCategory(parentDirName);

            const webPath = path.join('fonts', baseRelativePath, item.name).replace(/\\/g, '/');
            fonts.push({
              name: item.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              category: category,
              file: item.name,
              url: `/${webPath}`
            });
          }
        }
      });
    };

    scanDir(fontsDir, '');
    res.json(fonts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
