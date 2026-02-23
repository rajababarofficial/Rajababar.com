import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { extractMetadataHandler } from './src/api/extractMetadata';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route: Extract Metadata
  app.post('/api/extract-metadata', extractMetadataHandler);

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
