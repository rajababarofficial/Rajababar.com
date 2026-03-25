# Deployment Guide for Rajababar.com

This guide outlines the steps to deploy the Rajababar.com platform. Since we have transitioned from Supabase to a custom Node.js/PostgreSQL architecture, the deployment strategy focuses on **Vercel** with Serverless Functions and a cloud-hosted Postgres instance.

## 1. Hosting Architecture Overview

The application is structured to run seamlessly on Vercel:
- **Frontend**: The React (Vite) SPA builds into static files served edge-cached via Vercel.
- **Backend API**: The Express application (located in `src/api/server.ts`) is exported entirely and routed through a single Vercel Serverless Function via `api/index.ts`.
- **Database**: PostgreSQL 17 is required. Vercel acts as the middle-man between your Vite frontend and a remote Postgres provider.

## 2. Serverless API Setup (`vercel.json`)

Vercel requires a configuration file to direct root API calls (`/api/*`) to your Serverless handler (`api/index.ts`), while redirecting all SPA frontend routes back to `index.html`. This is already configured efficiently in `vercel.json` in the root repository.

## 3. Remote Postgres Configuration

Because Vercel Serverless Functions spin up and down dynamically, a **Remote PostgreSQL** server is needed (e.g. Neon, Render, Supabase Postgres Plugin, or AWS RDS). `localhost:5432` will **not** work in production on Vercel.

You **MUST** configure these environment variables under your Vercel Project Settings > **Environment Variables**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | The complete Postgres Connection URI provided by your cloud host (e.g. Neon/Render) |
| `GEMINI_API_KEY` | (If using server-side Gemini AI features for the tech suite) |

> [!CAUTION]
> Ensure your provider supports PostgreSQL 17 (or newer) if you utilize the `pgvector` features and remember to add `?sslmode=require` if your host demands it.

## 4. Deploying via Vercel

### Step-by-Step Vercel Setup:
1. **GitHub Connection**: Push this repository to GitHub and connect it within the Vercel Dashboard.
2. **Framework Preset**: Vercel will automatically detect **Vite**.
3. **Build Command**: Leave default (`npm run build`).
4. **Output Directory**: Leave default (`dist`).
5. **Install Command**: Leave default (`npm install`).

Once you input the `DATABASE_URL` into environment variables, hit **Deploy**. Vercel will build the frontend while automatically mounting your API endpoints onto Serverless endpoints under `/api`.

## 5. First Time Initialization & Seeding (Production)

To populate your remote production database once deployed:
1. Copy your remote Postgres `DATABASE_URL` to your local `.env` and temporarily comment out the `localhost` string.
2. Run `npx tsx src/api/seed.ts` locally. It will connect to your remote production database and insert all library content.

## 6. Post-Deployment Checklist

1. [ ] Check the Library `/library` route. Verify the initial local SQLite sync successfully fetches from the Postgres Serverless Function proxy.
2. [ ] Test the "PDF Metadata Extractor" tool with actual files.
3. [ ] Verify that UI directionality (RTL/LTR) is still functioning on `/library/:id`.
