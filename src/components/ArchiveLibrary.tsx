"use client";

import React, { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";
import {
  Download,
  Share2,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Book as BookIcon,
  Calendar,
  Globe2,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";

interface ArchiveBook {
  id: string; // Archive Identifier
  title_en: string;
  title_sd: string;
  author_en: string;
  author_sd: string;
  year: string;
  category: string;
  language: string;
  thumbnail: string;
}

interface ArchiveBooksProps {
  csvPath: string;
}

export default function ArchiveBooks({ csvPath }: ArchiveBooksProps) {
  const { isSindhi } = useLanguage();
  const [books, setBooks] = useState<ArchiveBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [view, setView] = useState<"card" | "list">("card");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toast, setToast] = useState<string | null>(null);
  const booksPerPage = 12;

  // Load Archive CSV
  useEffect(() => {
    setLoading(true);
    Papa.parse(csvPath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          id: row["identifier"], // Archive key
          title_en: row["Title (English)"] || row["title"] || "Untitled",
          title_sd: row["Title (Sindhi)"] || "اڻ ڄاتل",
          author_en: row["Author (English)"] || row["creator"] || "Unknown",
          author_sd: row["Author (Sindhi)"] || "اڻ ڄاتل",
          year: row["Year"] || row["date"] || "N/A",
          category: row["Category"] || "Archive",
          language: row["Language"] || "Sindhi",
          // Archive.org Image Service
          thumbnail: `https://archive.org/services/img/${row["identifier"]}`
        }));
        setBooks(data);
        setLoading(false);
      },
      error: (error) => {
        console.error("Archive CSV Error:", error);
        setLoading(false);
      }
    });
  }, [csvPath]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Derived Values
  const categories = useMemo(() => ["All", ...Array.from(new Set(books.map(b => b.category))).filter(Boolean).sort()], [books]);
  const languages = useMemo(() => ["All", ...Array.from(new Set(books.map(b => b.language))).filter(Boolean).sort()], [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title_en.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        book.title_sd.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        book.author_en.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        book.author_sd.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCategory = categoryFilter === "All" || book.category === categoryFilter;
      const matchesLanguage = languageFilter === "All" || book.language === languageFilter;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [books, debouncedSearch, categoryFilter, languageFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, languageFilter]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleShare = async (book: ArchiveBook) => {
    const url = `${window.location.origin}/archive-library/${book.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title_en, url });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          setToast(isSindhi ? "لنڪ ڪاپي ڪئي وئي!" : "Link copied!");
          setTimeout(() => setToast(null), 3000);
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      setToast(isSindhi ? "لنڪ ڪاپي ڪئي وئي!" : "Link copied!");
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-brand-surface/40 border border-brand-border rounded-ios h-[450px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div dir={isSindhi ? "rtl" : "ltr"} className="space-y-8">
      {/* Controls Bar */}
      <div className="glass p-6 rounded-[2rem] space-y-6">
        <div className="flex flex-col xl:flex-row gap-6 items-end xl:items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto flex-1">
            {/* Search */}
            <div className="relative group lg:col-span-2">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary group-focus-within:text-brand-accent transition-colors", isSindhi ? "right-4" : "left-4")} />
              <input
                type="text"
                placeholder={isSindhi ? "آرڪائيو ۾ ڳولهيو..." : "Search archive..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("w-full py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent outline-none text-brand-primary", isSindhi ? "pr-12 pl-4 font-sindhi text-lg" : "pl-12 pr-4")}
              />
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <Filter className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary", isSindhi ? "right-4" : "left-4")} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={cn("w-full py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:border-brand-accent outline-none text-brand-primary appearance-none cursor-pointer", isSindhi ? "pr-10 pl-4 font-sindhi" : "pl-10 pr-4")}
              >
                <option value="All">{isSindhi ? "سڀ ڪيٽيگريون" : "All Categories"}</option>
                {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Language Filter */}
            <div className="relative group">
              <Globe2 className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary", isSindhi ? "right-4" : "left-4")} />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className={cn("w-full py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:border-brand-accent outline-none text-brand-primary appearance-none cursor-pointer", isSindhi ? "pr-10 pl-4 font-sindhi" : "pl-10 pr-4")}
              >
                <option value="All">{isSindhi ? "سڀ ٻوليون" : "All Languages"}</option>
                {languages.filter(l => l !== "All").map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className={cn("px-4 py-2 bg-brand-bg/50 rounded-full border border-brand-border text-sm text-brand-secondary", isSindhi && "font-sindhi")}>
              {filteredBooks.length.toLocaleString()} {isSindhi ? "ڪتاب" : "books"}
            </div>
            <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-ios">
              <button onClick={() => setView("card")} className={cn("p-2 rounded-lg", view === "card" ? "bg-brand-accent text-white" : "text-brand-secondary")}><LayoutGrid className="w-5 h-5" /></button>
              <button onClick={() => setView("list")} className={cn("p-2 rounded-lg", view === "list" ? "bg-brand-accent text-white" : "text-brand-secondary")}><List className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "card" ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedBooks.map((book, idx) => (
              <motion.div key={book.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group flex flex-col h-full bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden hover:border-brand-accent transition-all duration-500 relative">
                <Link to={`/archive-library/${book.id}`} className="relative aspect-[3/4] overflow-hidden bg-brand-bg block">
                  <img src={book.thumbnail} alt={book.title_en} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x400?text=No+Cover" }} />
                  <div className={cn("absolute top-4 flex flex-wrap gap-2", isSindhi ? "right-4" : "left-4")}>
                    <span className="px-3 py-1 bg-brand-accent/90 text-white text-[10px] font-bold uppercase rounded-full border border-white/10">{book.category}</span>
                  </div>
                </Link>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link to={`/archive-library/${book.id}`}>
                      <h3 className={cn("text-lg font-bold text-brand-primary mb-3 line-clamp-2 group-hover:text-brand-accent transition-colors", isSindhi && "font-sindhi text-2xl")}>
                        {isSindhi ? book.title_sd : book.title_en}
                      </h3>
                    </Link>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-brand-secondary group-hover:text-brand-primary transition-colors">
                        <Archive className="w-4 h-4 text-brand-accent" />
                        <span className={cn("line-clamp-1 italic", isSindhi && "font-sindhi text-lg not-italic")}>
                          {isSindhi ? book.author_sd : book.author_en}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs text-brand-secondary"><Calendar className="w-3.5 h-3.5" /><span>{book.year}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <a href={`https://archive.org/details/${book.id}`} target="_blank" rel="noopener noreferrer" className={cn("flex-1 px-6 py-3 bg-brand-accent text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-brand-accent/20 active:scale-95 transition-all", isSindhi && "font-sindhi text-lg")}>
                      <Download className="w-4 h-4" />{isSindhi ? "ڊائون لوڊ" : "Download"}
                    </a>
                    <button onClick={() => handleShare(book)} className="p-3 bg-brand-surface border border-brand-border hover:border-brand-accent rounded-2xl text-brand-secondary active:scale-95 transition-all"><Share2 className="w-5 h-5" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="list" className="overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface/30 glass">
            <div className="overflow-x-auto">
              <table className={cn("w-full", isSindhi ? "text-right" : "text-left")}>
                <thead>
                  <tr className="bg-brand-surface/50 border-b border-brand-border">
                    <th className="p-6 text-xs font-bold text-brand-secondary uppercase">{isSindhi ? "ڪتاب" : "Book"}</th>
                    <th className="p-6 text-xs font-bold text-brand-secondary uppercase">{isSindhi ? "ليکڪ" : "Author"}</th>
                    <th className="p-6 text-xs font-bold text-brand-secondary uppercase">{isSindhi ? "سال" : "Year"}</th>
                    <th className="p-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {displayedBooks.map(book => (
                    <tr key={book.id} className="hover:bg-brand-accent/[0.03] group transition-colors">
                      <td className="p-6">
                        <Link to={`/archive-library/${book.id}`} className="flex items-center gap-5">
                          <div className="w-12 h-16 bg-brand-bg rounded-xl border border-brand-border overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                            <img src={book.thumbnail} className="w-full h-full object-cover" />
                          </div>
                          <div className={cn("font-bold text-brand-primary group-hover:text-brand-accent transition-colors", isSindhi && "font-sindhi text-xl")}>{isSindhi ? book.title_sd : book.title_en}</div>
                        </Link>
                      </td>
                      <td className="p-6">
                        <span className={cn("text-brand-secondary group-hover:text-brand-primary transition-colors", isSindhi && "font-sindhi text-lg")}>{isSindhi ? book.author_sd : book.author_en}</span>
                      </td>
                      <td className="p-6 text-brand-secondary">{book.year}</td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <a href={`https://archive.org/details/${book.id}`} target="_blank" className="px-4 py-2 bg-brand-accent text-white rounded-xl text-xs font-bold">{isSindhi ? "ڊائون لوڊ" : "Download"}</a>
                          <button onClick={() => handleShare(book)} className="p-2 border border-brand-border rounded-xl text-brand-secondary hover:text-brand-accent transition-all"><Share2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 py-10 border-t border-brand-border/30">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className={cn("group flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-[2rem] text-brand-primary disabled:opacity-30 hover:border-brand-accent transition-all font-bold", isSindhi && "font-sindhi text-xl flex-row-reverse")}>
            <ChevronLeft className={cn("w-5 h-5 transition-transform", isSindhi ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1")} />
            <span>{isSindhi ? "پويان" : "Previous"}</span>
          </button>
          <div className="flex items-center gap-3">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i));
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={cn("w-12 h-12 rounded-2xl font-bold transition-all", currentPage === pageNum ? "bg-brand-accent text-white shadow-xl scale-110" : "bg-brand-surface/50 text-brand-secondary border border-brand-border")}>{pageNum}</button>
              );
            })}
          </div>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className={cn("group flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-[2rem] text-brand-primary disabled:opacity-30 hover:border-brand-accent transition-all font-bold", isSindhi && "font-sindhi text-xl flex-row-reverse")}>
            <span>{isSindhi ? "اڳيون" : "Next"}</span>
            <ChevronRight className={cn("w-5 h-5 transition-transform", isSindhi ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
          </button>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={cn("fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-brand-accent text-white rounded-2xl font-bold shadow-2xl flex items-center gap-3", isSindhi && "font-sindhi text-lg")}>
            <Share2 className="w-5 h-5" />{toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}