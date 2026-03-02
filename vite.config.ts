import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
// یہاں فرق دیکھیں - default import استعمال کریں
import vitePluginSitemap from 'vite-plugin-sitemap';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // sitemap plugin کو صحیح طریقے سے کال کریں
      vitePluginSitemap({
        hostname: 'https://rajababar.com',
        routes: [
          '/',
          '/about',
          '/library',
          '/tools',
          '/downloads',
          '/contact',
        ],
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