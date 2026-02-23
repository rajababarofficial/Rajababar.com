# RAJABABAR.COM - Premium Tech Solutions

A modern personal brand and SaaS platform showcase built with React, TypeScript, and Express. This platform features high-performance digital tools, project portfolios, and enterprise-grade demonstrations.

## 🚀 Features

- **Full-screen Immersive Hero**: A cinematic personal introduction with glassmorphism UI.
- **Bulk PDF Metadata Extractor**: A powerful tool that extracts embedded metadata (Title, Author, Producer, etc.) from multiple PDFs simultaneously using server-side ExifTool processing.
- **Dynamic Results Table**: Configure and filter metadata columns dynamically before exporting to CSV.
- **Office Management System Demo**: A featured enterprise solution showcase.
- **Project Portfolio**: Scannable grid of latest work and ongoing developments.
- **Secure Architecture**: Full-stack implementation with Express backend for sensitive processing.
- **Supabase Integration**: Built-in support for authentication and tool usage logging.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Backend**: Node.js, Express
- **Processing**: ExifTool (via exiftool-vendored), Formidable
- **Database/Auth**: Supabase
- **Deployment**: Optimized for modern cloud environments

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 💻 Development

Start the full-stack development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🏗️ Build

To build the application for production:
```bash
npm run build
```

## 🔒 Privacy & Security

The Bulk PDF Metadata Extractor uses secure server-side processing. Files are temporarily processed to extract metadata and immediately deleted from the server to ensure user privacy.

---

Built with ❤️ by [Raja Babar](https://rajababar.com)
