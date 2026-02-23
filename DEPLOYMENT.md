# Deployment Guide for Rajababar.com

This guide outlines the steps to deploy the Rajababar.com platform with its Supabase backend.

## 1. Production Build Optimization

The project uses Vite, which handles most optimizations automatically. To create a production-ready build:

```bash
npm run build
```

**Optimizations included:**
- Tree-shaking of unused code.
- CSS minification and purging.
- Asset hashing for cache busting.
- Code splitting for faster initial loads.

## 2. Environment Variables

You **MUST** configure these variables in your hosting provider's dashboard (e.g., Vercel, Netlify, Cloudflare Pages):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anonymous API Key |
| `GEMINI_API_KEY` | (If using server-side Gemini features) |

> [!CAUTION]
> Never commit actual keys to your repository. Use the provider's "Environment Variables" settings.

## 3. Secure Configuration

### Supabase Row Level Security (RLS)
Ensure you have run the `supabase/schema.sql` script in your Supabase SQL Editor. This enables RLS, ensuring users can only access their own data.

### Content Security Policy (CSP)
When deploying, configure your headers to allow connections to Supabase:
- `connect-src 'self' https://*.supabase.co`

## 4. PWA Support (Progressive Web App)

To enable PWA support, follow these steps:

1. **Install Vite PWA Plugin:**
   ```bash
   npm install -D vite-plugin-pwa
   ```

2. **Update `vite.config.ts`:**
   Add the `VitePWA` plugin with your manifest configuration (icons, theme color, etc.).

3. **Register Service Worker:**
   The plugin will automatically generate and register the service worker in production.

## 5. Hosting Recommendations

### Vercel (Recommended)
- **Best for:** React/Vite apps.
- **Setup:** Connect your GitHub repo. It will auto-detect Vite and set the build command to `npm run build` and output directory to `dist`.

### Netlify
- **Best for:** Simple static hosting with powerful "Forms" and "Functions" support.
- **Setup:** Similar to Vercel. Ensure "Build command" is `npm run build` and "Publish directory" is `dist`.

### Cloudflare Pages
- **Best for:** Global performance and edge functions.
- **Setup:** Extremely fast deployment directly from GitHub.

## 6. Post-Deployment Checklist

1. [ ] Verify Supabase Auth redirect URLs match your production domain.
2. [ ] Test the "PDF Metadata Extractor" with real files.
3. [ ] Check the "User Dashboard" for correct data fetching.
4. [ ] Verify SSL/HTTPS is active (standard on most modern hosts).
