import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';
// یہاں فرق دیکھیں - default import استعمال کریں
import vitePluginSitemap from 'vite-plugin-sitemap';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Base routes to be included in the sitemap
  const routes: string[] = [
    '/',
    '/about',
    '/library',
    '/sindh-library',
    '/archive-library',
    '/projects',
    '/tools',
    '/tools/pdf-metadata',
    '/downloads',
    '/contact',
    '/auth',
    '/dashboard',
  ];

  // Dynamically add Sindh Library Books from CSV
  // This helps Google index all the individual book pages
  try {
    const sindhCsvPath = path.resolve(__dirname, 'public/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv');
    if (fs.existsSync(sindhCsvPath)) {
      const sindhData = fs.readFileSync(sindhCsvPath, 'utf-8');
      const lines = sindhData.split(/\r?\n/).slice(1); // skip header
      lines.forEach(line => {
        if (line.trim()) {
          const id = line.split(',')[0];
          if (id && !isNaN(Number(id))) { // ID for lib.sindh is numeric "#"
            routes.push(`/library/${id.trim()}`);
          }
        }
      });
    }
  } catch (err) {
    console.error('Error loading lib.sindh CSV for sitemap:', err);
  }

  // Dynamically add Archive.org Books from CSV
  try {
    const archiveCsvPath = path.resolve(__dirname, 'public/archive.org/sindh-library.csv');
    if (fs.existsSync(archiveCsvPath)) {
      const archiveData = fs.readFileSync(archiveCsvPath, 'utf-8');
      const lines = archiveData.split(/\r?\n/).slice(1); // skip header
      lines.forEach(line => {
        if (line.trim()) {
          const id = line.split(',')[0];
          if (id && id.length > 2) { // Identifier for archive.org (e.g. "san_0097")
             routes.push(`/archive-library/${id.trim()}`);
          }
        }
      });
    }
  } catch (err) {
    console.error('Error loading archive.org CSV for sitemap:', err);
  }

  return {
    plugins: [
      react(), 
      tailwindcss(),
      // Configuring the sitemap plugin
      vitePluginSitemap({
        hostname: 'https://rajababar.com',
        routes: routes,
        exclude: ['/404'],
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
        readable: true,
        outDir: 'dist',
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});