import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { syncHandler } from './library/sync';
import { initDbHandler, semanticSearchHandler } from './library/init-db';
import { infoHandler } from './library/info';
import { archiveListHandler, archiveFiltersHandler, archiveDetailsHandler, archiveCustomFieldValuesHandler } from './library/archive';
import { downloadProxyHandler } from './library/download';
import { loginHandler } from './library/auth';
import { authMiddleware } from './middleware/authMiddleware';
import { addBookHandler, editBookHandler, deleteBookHandler } from './library/crud';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/login', loginHandler);

// Library Routes (Public)
app.get('/api/library/sync', syncHandler);
app.get('/api/library/init-db', initDbHandler);
app.get('/api/library/search', semanticSearchHandler);
app.get('/api/library/info', infoHandler);
app.get('/api/library/download', downloadProxyHandler);

// Library Routes (Protected - Admin)
app.post('/api/library/add', authMiddleware, addBookHandler);
app.put('/api/library/edit/:id', authMiddleware, editBookHandler);
app.delete('/api/library/delete/:id', authMiddleware, deleteBookHandler);

// Archive Routes
app.get('/api/archive/list', archiveListHandler);
app.get('/api/archive/filters', archiveFiltersHandler);
app.get('/api/archive/details', archiveDetailsHandler);
app.get('/api/archive/custom-values', archiveCustomFieldValuesHandler);

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
