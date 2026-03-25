# RAJABABAR.COM - Premium Tech Solutions

A modern personal brand and SaaS platform showcase built with React, TypeScript, and Express. This platform features high-performance digital tools, project portfolios, and a **Next-Gen Digital Library** featuring an integrated PostgreSQL and SQLite hybrid architecture.

## 🚀 Features

- **Next-Gen Digital Library (PostgreSQL + SQLite WASM)**: A highly optimized hybrid architecture. The Node.js/Express server acts as the source of truth connected to a PostgreSQL 17 database. The frontend client syncs incrementally with a local SQLite WASM database via IndexedDB for instantaneous, offline-ready search performance. Both English and Sindhi content is supported concurrently with intelligent RTL/LTR display handling.
- **Bulk PDF Metadata Extractor**: Extracts metadata (Title, Author, Producer, etc.) from multiple PDFs simultaneously using server-side ExifTool processing.
- **Dynamic Results Table**: Configure and filter metadata columns dynamically within the library.
- **Project Portfolio**: Scannable grid of latest work and ongoing developments.
- **Office Management System Demo**: A featured enterprise solution showcase.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Database (Client)**: SQLite WASM, IndexedDB (for instantaneous search)
- **Database (Server)**: PostgreSQL 17
- **Backend**: Node.js, Express (API Server on port 3002)
- **Deployment**: Vercel (Serverless Functions for the API)
- **Icons**: Lucide React
- **Processing**: ExifTool, Formidable

## 📦 Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment (`.env`)**:
   Create a `.env` file in the root based on `.env.example`:
   ```env
   DATABASE_URL="postgres://postgres:YourPassword@localhost:5432/postgres"
   POSTGRES_DB="postgres"
   POSTGRES_USER="postgres"
   POSTGRES_PASSWORD="YourPassword"
   POSTGRES_HOST="localhost"
   POSTGRES_PORT=5432
   PORT=3002
   GEMINI_API_KEY="your_gemini_key"
   ```
4. **Seed Database (Local Postgres)**:
   ```bash
   npx tsx src/api/seed.ts
   ```

## 💻 Development

Start the frontend (Vite) and the backend (API Server) simultaneously:
1. Start the API Server:
   ```bash
   npx tsx src/api/server.ts
   ```
2. Start the Frontend App:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` and the API will be proxied via Vite from `http://localhost:3002`.

---

Built with ❤️ by [Raja Babar](https://rajababar.com)
Contact: contact@rajababar.com
Social: @rajababarofficial
