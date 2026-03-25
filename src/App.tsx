/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Scroll to Top Component
import ScrollToTop from "./components/ScrollToTop";

// Lazy load pages
const Home = lazy(() => import('@/src/pages/Home'));
const About = lazy(() => import('@/src/pages/About'));
const Projects = lazy(() => import('@/src/pages/Projects'));
const Tools = lazy(() => import('@/src/pages/Tools'));
const Downloads = lazy(() => import('@/src/pages/Downloads'));
const Contact = lazy(() => import('@/src/pages/Contact'));

// Library Pages
const Library = lazy(() => import('@/src/pages/Library')); // All in one page

// Detail Pages
const BookDetails = lazy(() => import('@/src/pages/BookDetails'));

// Tools Sub-pages
const PdfMetadataExtractor = lazy(() => import('@/src/pages/tools/PdfMetadataExtractor'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Home & About */}
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />

                {/* --- Library Routes --- */}

                {/* 1. Main Library (Integrated Postgres/SQLite) */}
                <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
                <Route path="/library/:id" element={<PageWrapper><BookDetails /></PageWrapper>} />

                {/* Tools & Projects */}
                <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
                <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
                <Route path="/tools/pdf-metadata" element={<PageWrapper><PdfMetadataExtractor /></PageWrapper>} />

                {/* Other Pages */}
                <Route path="/downloads" element={<PageWrapper><Downloads /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
    </div>
  );
}

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}