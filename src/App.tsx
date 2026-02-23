/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import Home from '@/src/pages/Home';
import About from '@/src/pages/About';
import Projects from '@/src/pages/Projects';
import Tools from '@/src/pages/Tools';
import Downloads from '@/src/pages/Downloads';
import Contact from '@/src/pages/Contact';
import AuthDemo from '@/src/pages/AuthDemo';
import Dashboard from '@/src/pages/Dashboard';
import PdfMetadataExtractor from '@/src/pages/tools/PdfMetadataExtractor';
import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
              <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
              <Route path="/tools/pdf-metadata" element={<PageWrapper><PdfMetadataExtractor /></PageWrapper>} />
              <Route path="/downloads" element={<PageWrapper><Downloads /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/auth" element={<PageWrapper><AuthDemo /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
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

