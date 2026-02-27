/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import { motion, AnimatePresence } from 'motion/react';
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
const AuthDemo = lazy(() => import('@/src/pages/AuthDemo'));
const Dashboard = lazy(() => import('@/src/pages/Dashboard'));

// Library Pages
const Library = lazy(() => import('@/src/pages/Library'));
const BookDetails = lazy(() => import('@/src/pages/BookDetails'));

// Tools Sub-pages
const PdfMetadataExtractor = lazy(() => import('@/src/pages/tools/PdfMetadataExtractor'));

export default function App() {
  return (
    <Router>
      {/* ScrollToTop hamesha Router ke andar aur Routes se pehle hona chahiye */}
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

                {/* Library Routes */}
                <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
                <Route path="/library/:id" element={<PageWrapper><BookDetails /></PageWrapper>} />

                {/* Tools & Projects */}
                <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
                <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
                <Route path="/tools/pdf-metadata" element={<PageWrapper><PdfMetadataExtractor /></PageWrapper>} />

                {/* Other Pages */}
                <Route path="/downloads" element={<PageWrapper><Downloads /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                <Route path="/auth" element={<PageWrapper><AuthDemo /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

/**
 * Loading Fallback component for Suspense
 */
function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
    </div>
  );
}

/**
 * PageWrapper provides consistent entry/exit animations for all pages
 */
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