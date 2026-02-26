"use client";

import React, { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
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
  Building2,
  Globe2,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/src/context/LanguageContext";

interface Book {
  id: string;
  title_en: string;
  title_sd: string;
  author_en: string;
  author_sd: string;
  year: string;
  publisher: string;
  category: string;
  language: string;
  link: string;
  thumbnail: string;
}

interface BooksProps {
  csvPath?: string;
}

export default function Books({ csvPath = "/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv" }: BooksProps) {
  const { isSindhi } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [view, setView] = useState<"card" | "list">("card");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [languageFilter, setLanguageFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const booksPerPage = 12;

  // Load CSV
  useEffect(() => {
    setLoading(true);
    Papa.parse(csvPath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any, i: number) => ({
          id: row["#"] || (i + 1).toString(),
          title_en: row["Title (English)"] || "Untitled",
          title_sd: row["Title (Sindhi)"] || "اڻ ڄاتل",
          author_en: row["Author (English)"] || "Unknown",
          author_sd: row["Author (Sindhi)"] || "اڻ ڄاتل",
          year: row["Year"] || "N/A",
          publisher: row["Publisher"] || "N/A",
          category: row["Category"] || "General",
          language: row["Language"] || "Sindhi",
          link: row["Link"] || "#",
          thumbnail: row["Thumbnail"] || ""
        }));
        setBooks(data);
        setLoading(false);
      },
      error: (error) => {
        console.error("CSV Parsing Error:", error);
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

  // Reset to first page when filters change
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
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="glass p-6 rounded-[2rem] space-y-6">
        <div className="flex flex-col xl:flex-row gap-6 items-end xl:items-center justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto flex-1">
            {/* Search */}
            <div className="relative group lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary group-focus-within:text-brand-accent transition-colors" />
              <input
                type="text"
                placeholder={isSindhi ? "ڪتاب يا ليکڪ ڳولهيو..." : "Search books or authors..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all outline-none text-brand-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all outline-none text-brand-primary appearance-none cursor-pointer"
              >
                <option value="All">{isSindhi ? "تمام درجا" : "All Categories"}</option>
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="relative group">
              <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-bg/50 border border-brand-border rounded-ios focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all outline-none text-brand-primary appearance-none cursor-pointer"
              >
                <option value="All">{isSindhi ? "تمام ٻوليون" : "All Languages"}</option>
                {languages.filter(l => l !== "All").map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggles & Stats */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="px-4 py-2 bg-brand-bg/50 rounded-full border border-brand-border text-sm text-brand-secondary font-medium whitespace-nowrap">
              {filteredBooks.length.toLocaleString()} {isSindhi ? "ڪتاب" : "books"}
            </div>
            <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-ios">
              <button
                onClick={() => setView("card")}
                className={`p-2 rounded-lg transition-all ${view === "card" ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" : "text-brand-secondary hover:text-brand-primary"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" : "text-brand-secondary hover:text-brand-primary"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "card" && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {displayedBooks.map((book, idx) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group flex flex-col h-full bg-brand-surface border border-brand-border rounded-[2.5rem] overflow-hidden hover:border-brand-accent transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/10 relative"
              >
                {/* Book Cover Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-bg">
                  <AnimatePresence mode="wait">
                    {book.thumbnail ? (
                      <motion.img
                        key={book.thumbnail}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={book.thumbnail}
                        alt={isSindhi ? book.title_sd : book.title_en}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-border">
                        <BookIcon className="w-16 h-16 opacity-20" />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-60" />

                  {/* Category & Lang Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-brand-accent/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                      {book.category}
                    </span>
                    <span className="px-3 py-1 bg-brand-surface/80 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-brand-border shadow-lg">
                      {book.language}
                    </span>
                  </div>

                  {/* Quick Action Floating */}
                  <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold text-brand-primary mb-3 line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors ${isSindhi ? "font-sindhi text-xl" : "font-sans"}`}>
                      {isSindhi ? book.title_sd : book.title_en}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-brand-secondary group-hover:text-brand-primary transition-colors">
                        <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
                          <BookIcon className="w-4 h-4 text-brand-accent" />
                        </div>
                        <span className={`line-clamp-1 italic ${isSindhi ? "font-sindhi text-lg" : ""}`}>
                          {isSindhi ? book.author_sd : book.author_en}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs text-brand-secondary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{book.year}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-secondary">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{book.publisher}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3">
                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-brand-accent/20 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      {isSindhi ? "ڊائون لوڊ" : "Download"}
                    </a>
                    <button
                      className="p-3 bg-brand-surface border border-brand-border hover:border-brand-accent rounded-2xl text-brand-secondary hover:text-brand-accent active:scale-95 transition-all"
                      title="Share Book"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* List View */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface/30 glass"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/50 border-b border-brand-border">
                  <th className="p-6 text-xs font-bold text-brand-secondary uppercase tracking-widest">{isSindhi ? "ڪتاب" : "Book Details"}</th>
                  <th className="p-6 text-xs font-bold text-brand-secondary uppercase tracking-widest">{isSindhi ? "ليکڪ" : "Author"}</th>
                  <th className="p-6 text-xs font-bold text-brand-secondary uppercase tracking-widest hidden md:table-cell">{isSindhi ? "سال" : "Year"}</th>
                  <th className="p-6 text-xs font-bold text-brand-secondary uppercase tracking-widest hidden lg:table-cell">{isSindhi ? "ٻولي" : "Language"}</th>
                  <th className="p-6 text-xs font-bold text-brand-secondary uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {displayedBooks.map(book => (
                  <tr key={book.id} className="hover:bg-brand-accent/[0.03] group transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-16 bg-brand-bg rounded-xl border border-brand-border overflow-hidden shrink-0 group-hover:scale-110 transition-transform shadow-md">
                          {book.thumbnail && <img src={book.thumbnail} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className={`font-bold text-brand-primary group-hover:text-brand-accent transition-colors ${isSindhi ? "font-sindhi text-lg" : ""}`}>
                            {isSindhi ? book.title_sd : book.title_en}
                          </div>
                          <div className="text-xs text-brand-secondary mt-1">{book.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-brand-secondary group-hover:text-brand-primary transition-colors ${isSindhi ? "font-sindhi text-lg" : ""}`}>
                        {isSindhi ? book.author_sd : book.author_en}
                      </span>
                    </td>
                    <td className="p-6 text-brand-secondary hidden md:table-cell font-medium">{book.year}</td>
                    <td className="p-6 hidden lg:table-cell">
                      <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-full text-[10px] text-brand-secondary font-bold group-hover:border-brand-accent/30 transition-colors">
                        {book.language}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={book.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          {isSindhi ? "ڊائون لوڊ" : "Download"}
                        </a>
                        <button className="p-2 bg-brand-surface border border-brand-border hover:border-brand-accent rounded-xl text-brand-secondary hover:text-brand-accent transition-all">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {filteredBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 flex flex-col items-center justify-center gap-6 text-brand-secondary glass rounded-[3rem] border-2 border-dashed border-brand-border/50"
        >
          <div className="w-24 h-24 rounded-full bg-brand-surface flex items-center justify-center border border-brand-border">
            <Search className="w-10 h-10 opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-primary">{isSindhi ? "ڪا به نتيجہ نه مليا" : "No results found"}</p>
            <p className="text-brand-secondary mt-1">{isSindhi ? "مھرباني ڪري ٻيو ڪجهه ڳولهيو" : "Try adjusting your search or filters"}</p>
          </div>
          <button
            onClick={() => { setSearch(""); setCategoryFilter("All"); setLanguageFilter("All"); }}
            className="px-8 py-3 bg-brand-surface border border-brand-border rounded-full hover:border-brand-accent transition-all font-bold text-sm"
          >
            {isSindhi ? "فلٽر ختم ڪريو" : "Clear all filters"}
          </button>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 py-10 border-t border-brand-border/30">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="group flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-[2rem] text-brand-primary disabled:opacity-30 hover:border-brand-accent hover:shadow-xl hover:shadow-brand-accent/5 transition-all duration-500 font-bold active:scale-95"
          >
            <ChevronLeft className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${isSindhi ? "rotate-180" : ""}`} />
            <span>{isSindhi ? "پويان" : "Previous"}</span>
          </button>

          <div className="flex items-center gap-3">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-12 h-12 rounded-2xl font-bold transition-all duration-500 ${currentPage === pageNum ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/30 scale-110" : "bg-brand-surface/50 text-brand-secondary hover:text-brand-primary border border-brand-border hover:border-brand-accent"}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="group flex items-center gap-3 px-8 py-4 bg-brand-surface border border-brand-border rounded-[2rem] text-brand-primary disabled:opacity-30 hover:border-brand-accent hover:shadow-xl hover:shadow-brand-accent/5 transition-all duration-500 font-bold active:scale-95"
          >
            <span>{isSindhi ? "اڳيون" : "Next"}</span>
            <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isSindhi ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}