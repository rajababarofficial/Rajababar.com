import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { syncHandler } from './library/sync';
import { initDbHandler, semanticSearchHandler } from './library/init-db';
import { infoHandler } from './library/info';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Library Routes
app.get('/api/library/sync', syncHandler);
app.get('/api/library/init-db', initDbHandler);
app.get('/api/library/search', semanticSearchHandler);
app.get('/api/library/info', infoHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Export app for Vercel
export default app;

// Start server always
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
