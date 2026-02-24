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

// Lazy load pages
const Home = lazy(() => import('@/src/pages/Home'));
const About = lazy(() => import('@/src/pages/About'));
const Projects = lazy(() => import('@/src/pages/Projects'));
const Tools = lazy(() => import('@/src/pages/Tools'));
const Downloads = lazy(() => import('@/src/pages/Downloads'));
const Contact = lazy(() => import('@/src/pages/Contact'));
const AuthDemo = lazy(() => import('@/src/pages/AuthDemo'));
const Dashboard = lazy(() => import('@/src/pages/Dashboard'));
const PdfMetadataExtractor = lazy(() => import('@/src/pages/tools/PdfMetadataExtractor'));
const ImageEditor = lazy(() => import('@/src/pages/tools/ImageEditor'));
const AdvancePdfExtractor = lazy(() => import('@/src/pages/tools/AdvancePdfExtractor'));

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
                <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
                
                {/* Standard Tool */}
                <Route path="/tools/pdf-metadata" element={<PageWrapper><PdfMetadataExtractor /></PageWrapper>} />
                
                {/* Advance Tool - Naya Route */}
                <Route path="/tools/advance-pdf" element={<PageWrapper><AdvancePdfExtractor /></PageWrapper>} />
                
                <Route path="/tools/image-editor" element={<PageWrapper><ImageEditor /></PageWrapper>} />
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