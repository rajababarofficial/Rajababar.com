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

// Lazy load Public pages
const Home = lazy(() => import('@/src/pages/public/Home'));
const Search = lazy(() => import('@/src/pages/public/Search'));
const BookDetails = lazy(() => import('@/src/pages/public/BookDetails'));
const About = lazy(() => import('@/src/pages/About'));
const Contact = lazy(() => import('@/src/pages/Contact'));
const Projects = lazy(() => import('@/src/pages/Projects'));
const Tools = lazy(() => import('@/src/pages/Tools'));
const Downloads = lazy(() => import('@/src/pages/Downloads'));
const Mega = lazy(() => import('@/src/pages/Mega'));
const MegaDetails = lazy(() => import('@/src/pages/MegaDetails'));
const PdfMetadataExtractor = lazy(() => import('@/src/pages/tools/PdfMetadataExtractor'));

// Lazy load Admin pages
const Login = lazy(() => import('@/src/pages/admin/Login'));
const Dashboard = lazy(() => import('@/src/pages/admin/Dashboard'));
const ManageBooks = lazy(() => import('@/src/pages/admin/ManageBooks'));
const ManageCategories = lazy(() => import('@/src/pages/admin/ManageCategories'));

// Layouts & Protection
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Login (No Layout) */}
          <Route path="/login" element={<Login />} />

          {/* Admin Section (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/books" element={<ManageBooks />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
            </Route>
          </Route>

          {/* Public Section */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                    <Route path="/library" element={<PageWrapper><Search /></PageWrapper>} />
                    <Route path="/library/:id" element={<PageWrapper><BookDetails /></PageWrapper>} />
                    <Route path="/mega" element={<PageWrapper><Mega /></PageWrapper>} />
                    <Route path="/mega/:id" element={<PageWrapper><MegaDetails /></PageWrapper>} />
                    <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
                    <Route path="/tools" element={<PageWrapper><Tools /></PageWrapper>} />
                    <Route path="/tools/pdf-metadata" element={<PageWrapper><PdfMetadataExtractor /></PageWrapper>} />
                    <Route path="/downloads" element={<PageWrapper><Downloads /></PageWrapper>} />
                    <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                    <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                    {/* Add other public routes here */}
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Suspense>
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