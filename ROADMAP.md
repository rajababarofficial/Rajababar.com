# Rajababar.com - Project Roadmap

This document outlines the current state of the project, upcoming features, and technical guidelines. It is designed to act as a master guide for the project owner and any future developers assigned to the project.

---

## 🌟 1. Current State (Abhi Tak Kya Kaam Ho Chuka Hai)
Here is a summary of what has already been developed and integrated into the project:

### Frontend & Core Website
- **Framework:** React 19 + Vite + TypeScript.
- **Modern UI:** Built with Tailwind CSS v4, Lucide React (Icons), and Framer Motion (Animations).
- **Core Pages:** Home, About, Projects, Tools, Library, Downloads, Contact.
- **Multilingual UI:** Support for multiple languages, balancing RTL (Right-to-Left) and LTR layouts.

### Library Architecture (Phase 1)
- **Hybrid Database Approach:** 
  - Central Source of Truth: **PostgreSQL 17** (with `pgvector` for semantic search).
  - Client-Side Performance: **SQLite WASM (`sql.js`)** runs in the browser for instant, offline-ready search performance.
- **Data Synchronization:** Server handles incremental data sync to the frontend.
- **Components:** `Library.tsx`, `ArchiveLibrary.tsx`, `Books.tsx`, and `BookDetails.tsx`.

### Utility & Business Tools
- **PDF Metadata Extractor:** A tool to analyze and extract structural data from PDFs (`PdfMetadataExtractor.tsx`).
- **Receipt Generator:** A structured, downloadable template for business receipts, equipped with amount-to-word conversion.
- **Booking Manager:** A consolidated client and real estate property booking management interface.

### Infrastructure & Deployment
- **API Backend:** Express-based backend proxy handling database requests (`src/api`).
- **Deployment Configured:** Ready for Vercel (`vercel.json`), and containerized for VPS/Coolify platforms (`Dockerfile`, `DEPLOYMENT.md`).

---

## 🚀 2. Upcoming Features & Implementation (Kia Implement Karna Hai)

These are the immediate next steps to expand the project. Developers should pick tasks from this list.

### A. Advanced Library Filtration (Database-Driven Filters)
**Objective:** Make the library highly searchable through granular database-backed filters.
- **Implementation Tasks:**
  - Create a Sidebar/Topbar Filter component in `Library.tsx`.
  - Add filters for: **Categories, Authors, Publication Years, and Languages**.
  - Connect the frontend filters to execute live SQLite queries for instant rendering.
  - Connect advanced semantic/AI search utilizing the PostgreSQL `pgvector` backend handler.
  - Implement sorting options (A-Z, Z-A, Newest First, Most Popular).

### B. AI Tools Suite Integration (e.g., AI Image Enhancer)
**Objective:** Turn the website into a robust toolbox by adding powerful AI-driven utilities.
- **1. AI Image Enhancer:**
  - **Tech Plan:** Create a high-quality upload component (Drag & Drop), integrate with a 3rd party AI API (like Replicate, OpenAI, or specialized image APIs), and display results using a Before/After "Split Slider" component.
- **2. AI Background Remover:**
  - Provide a quick tool for users to strip backgrounds from product/portrait photos.
- **3. AI PDF/Document Chat:**
  - Leverage the pre-installed `@google/genai` dependency to allow users to upload text documents and chat with them.
- **Implementation Tasks:**
  - Add these into the existing `/tools` page layout, ensuring clear and responsive UI, error handling, and loading states.

---

## 🛠️ 3. For Developers: Tech Stack & Guidelines
If this project is handed over to another developer, they **must** understand the following architecture:

### Tech Stack Setup
- **Frontend Development:** Do not use 'Create React App' or 'Next.js' unless refactoring. This is a **Vite + React SPA**.
- **Backend Mechanics:** The frontend communicates with local APIs situated in `src/api` via Vite's proxy mechanism or explicit Express routes.
- **Environment Variables:** The project relies on `.env` file configurations (Database connection strings, API keys). Make sure to request the `.env` from the project owner before running the project.

### Starting the Project Locally
1. Run `npm install` to get all dependencies.
2. Ensure you have the `.env` file populated.
3. Run `npm run dev` to start the frontend server and backend API simultaneously.

### Architecture Rules
- All new reusable UI elements must go into `src/components/`.
- All whole-page views must go into `src/pages/`.
- Maintain the premium, dynamic design standard using Tailwind CSS and Framer Motion micro-animations. Avoid generic styling. 

---

## 📈 4. Long Term Vision (Dhoor Ka Plan)
- **User Accounts:** Allow users to register, log in, and save their favorite books or generated AI assets.
- **Premium Tiers:** Introduce Stripe/payment gateways for high-usage AI tools.
- **SEO Enhancements:** Ensure the `generate-sitemap` system successfully propagates pages heavily, possibly considering transition to full SSR later if search visibility demands it.
