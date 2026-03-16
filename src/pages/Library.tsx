"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Book as BookIcon, 
  ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon,
  Settings2, Building, Calendar, Tag, Globe, Library as LibraryIcon, MoreHorizontal
} from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import { getDatabase } from '@/src/utils/db';
import SEO from '@/src/components/layout/SEO';

export default function Library() {
  const { isSindhi } = useLanguage();
  const navigate = useNavigate();

  // --- Initial States (Memory se load karne ke liye) ---
  const [searchTerm, setSearchTerm] = useState(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('lib_search') || '' : '';
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    return typeof window !== 'undefined' ? Number(sessionStorage.getItem('lib_page')) || 1 : 1;
  });

  const [filters, setFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('lib_filters');
      return saved ? JSON.parse(saved) : { category: '', language: '', year: '', publisher: '', source: '' };
    }
    return { category: '', language: '', year: '', publisher: '', source: '' };
  });

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  const [visibleColumns, setVisibleColumns] = useState({
    icon: false, titleEn: true, titleSd: true, year: true, 
    category: true, publisher: false, language: false, sourceName: true
  });

  const [options, setOptions] = useState({ categories: [], languages: [], years: [], publishers: [], sources: [] });
  const itemsPerPage = 12;

  // --- Save to Session Storage whenever states change ---
  useEffect(() => {
    sessionStorage.setItem('lib_search', searchTerm);
    sessionStorage.setItem('lib_page', String(currentPage));
    sessionStorage.setItem('lib_filters', JSON.stringify(filters));
  }, [searchTerm, currentPage, filters]);

  // 1. Load Filter Options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const db = await getDatabase();
        const getDistinct = (col: string) => {
          const res = db.exec(`SELECT DISTINCT ${col} FROM Books WHERE ${col} IS NOT NULL AND ${col} != '' ORDER BY ${col} ASC`);
          return res.length > 0 ? res[0].values.map(v => String(v[0])) : [];
        };
        setOptions({
          categories: getDistinct('category'),
          languages: getDistinct('language'),
          years: getDistinct('year').sort((a,b) => Number(b) - Number(a)),
          publishers: getDistinct('publisher'),
          sources: getDistinct('source_name')
        });
      } catch (err) { console.error(err); }
    };
    loadOptions();
  }, []);

  // 2. Fetch Logic (Thumbnails + Filters)
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const offset = (currentPage - 1) * itemsPerPage;
      const safeSearch = searchTerm.replace(/'/g, "''").trim();
      
      let whereClauses = [];
      if (safeSearch) whereClauses.push(`(title_en LIKE '%${safeSearch}%' OR title_sd LIKE '%${safeSearch}%' OR author_en LIKE '%${safeSearch}%' OR author_sd LIKE '%${safeSearch}%')`);
      if (filters.category) whereClauses.push(`category = '${filters.category.replace(/'/g, "''")}'`);
      if (filters.language) whereClauses.push(`language = '${filters.language.replace(/'/g, "''")}'`);
      if (filters.year) whereClauses.push(`year = '${filters.year}'`);
      if (filters.publisher) whereClauses.push(`publisher = '${filters.publisher.replace(/'/g, "''")}'`);
      if (filters.source) whereClauses.push(`source_name = '${filters.source.replace(/'/g, "''")}'`);

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      const countRes = db.exec(`SELECT COUNT(*) FROM Books ${whereSql}`);
      setTotalCount(countRes[0].values[0][0] as number);

      const dataResult = db.exec(`SELECT * FROM Books ${whereSql} ORDER BY id DESC LIMIT ${itemsPerPage} OFFSET ${offset}`);
      if (dataResult.length > 0) {
        const rows = dataResult[0].values.map((row: any) => {
          const obj: any = {};
          dataResult[0].columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
          if (!obj.thumbnail && obj.identifier) {
            obj.thumbnail = `https://archive.org/services/img/${obj.identifier}`;
          }
          return obj;
        });
        setBooks(rows);
      } else { setBooks([]); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [currentPage, searchTerm, filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ category: '', language: '', year: '', publisher: '', source: '' });
    setCurrentPage(1);
    sessionStorage.removeItem('lib_search');
    sessionStorage.removeItem('lib_filters');
    sessionStorage.removeItem('lib_page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pt-24 pb-20 bg-brand-bg min-h-screen">
      <SEO title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"} />
      
      <PageHeader
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi ? "ايم. ايڇ پنهور انسٽيٽيوٽ جو مڪمل ڊجيٽل ذخيرو." : "The comprehensive digital repository of MHPISSJ."}
        icon={<BookOpen className="w-12 h-12 text-brand-accent" />}
      />

      {/* --- CONTROL BAR --- */}
      <section className="max-w-7xl mx-auto px-4 mt-12 space-y-4" dir="ltr">
        <div className="flex justify-between items-center mb-2 px-6">
          <div className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full border border-brand-accent/20">
            <LibraryIcon size={16}/>
            <span className="text-sm font-bold tracking-widest uppercase">
              Total Result: <span className="text-brand-primary">{totalCount}</span>
            </span>
          </div>
        </div>

        <div className="glass p-6 rounded-[2.5rem] border border-brand-border/50 bg-brand-surface/20 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full text-left">
              <input 
                type="text"
                placeholder="Search database..."
                className="w-full pl-12 pr-6 py-4 bg-brand-bg/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={20} />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowColumnSettings(!showColumnSettings)} className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2", showColumnSettings ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}>
                <Settings2 size={20}/> <span className="text-xs font-bold uppercase">Display</span>
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-4 rounded-2xl border transition-all", showFilters ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}><Filter size={20}/></button>
              <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl", viewMode === 'grid' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}><LayoutGrid size={20}/></button>
                <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl", viewMode === 'list' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}><ListIcon size={20}/></button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showColumnSettings && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 mt-6 p-4 bg-brand-bg/40 rounded-2xl border border-brand-border/40">
                  {Object.keys(visibleColumns).map((col) => (
                    <button key={col} onClick={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))} className={cn("px-4 py-2 rounded-full text-[10px] font-bold border transition-all uppercase", visibleColumns[col] ? "bg-brand-accent/20 border-brand-accent text-brand-accent" : "bg-brand-surface border-brand-border text-brand-secondary")}>
                      {col}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-brand-border/30">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <select className="bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none" value={filters.category} onChange={e => { setFilters(f => ({...f, category: e.target.value})); setCurrentPage(1); }}>
                    <option value="">Category</option>
                    {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none" value={filters.publisher} onChange={e => { setFilters(f => ({...f, publisher: e.target.value})); setCurrentPage(1); }}>
                    <option value="">Publisher</option>
                    {options.publishers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select className="bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none" value={filters.year} onChange={e => { setFilters(f => ({...f, year: e.target.value})); setCurrentPage(1); }}>
                    <option value="">Year</option>
                    {options.years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select className="bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none" value={filters.source} onChange={e => { setFilters(f => ({...f, source: e.target.value})); setCurrentPage(1); }}>
                    <option value="">Source</option>
                    {options.sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none" value={filters.language} onChange={e => { setFilters(f => ({...f, language: e.target.value})); setCurrentPage(1); }}>
                    <option value="">Language</option>
                    {options.languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {/* Clear Filter Button Added Here */}
                <div className="flex justify-end mt-6 pt-4 border-t border-brand-border/20">
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 rounded-xl text-[10px] font-bold uppercase transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- DISPLAY AREA --- */}
      <section className="max-w-7xl mx-auto px-4 mt-8 min-h-[500px]">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4.5] bg-brand-surface/40 rounded-[2.5rem]" />)}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8" dir={isSindhi ? 'rtl' : 'ltr'}>
              {books.map((book) => (
                <motion.div key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => navigate(`/library/${book.id}`)} className="group bg-brand-surface rounded-[2.5rem] border border-brand-border overflow-hidden hover:border-brand-accent transition-all shadow-xl flex flex-col h-full cursor-pointer hover:-translate-y-2 relative">
                  <div className="aspect-[3/4.5] relative overflow-hidden bg-brand-bg">
                    {book.thumbnail ? <img src={book.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <BookIcon className="w-full h-full p-12 opacity-5" />}
                    {visibleColumns.year && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] text-white font-bold border border-white/10">
                        {book.year}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className={cn("text-brand-primary font-bold text-sm line-clamp-2", isSindhi && "font-sindhi text-lg")}>
                        {isSindhi ? (book.title_sd || book.title_en) : (book.title_en || book.title_sd)}
                      </h3>
                      <p className={cn("text-brand-secondary text-[10px] font-semibold mt-1", isSindhi && "font-sindhi text-xs")}>
                        {isSindhi ? (book.author_sd || book.author_en) : (book.author_en || book.author_sd)}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-brand-border/20 space-y-1">
                      {visibleColumns.category && <div className="flex items-center gap-2 text-brand-secondary"><Tag size={10} className="text-brand-accent"/><span className="text-[9px] font-bold truncate">{book.category}</span></div>}
                      {visibleColumns.publisher && <div className="flex items-center gap-2 text-brand-secondary"><Building size={10} className="text-brand-accent"/><span className="text-[9px] font-bold truncate">{book.publisher}</span></div>}
                      {visibleColumns.sourceName && <div className="inline-block mt-2 px-2 py-0.5 bg-brand-bg border border-brand-border rounded text-[8px] font-bold text-brand-accent">{book.source_name || 'Archive'}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-[2.5rem] border border-brand-border bg-brand-surface/20" dir="ltr">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-brand-surface border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary tracking-widest">
                    {visibleColumns.icon && <th className="p-5">Icon</th>}
                    {visibleColumns.titleEn && <th className="p-5">English Details</th>}
                    {visibleColumns.titleSd && <th className="p-5 text-right">سنڌي تفصيل</th>}
                    {visibleColumns.year && <th className="p-5 text-center">Year</th>}
                    {visibleColumns.category && <th className="p-5">Category</th>}
                    {visibleColumns.publisher && <th className="p-5">Publisher</th>}
                    {visibleColumns.sourceName && <th className="p-5">Source</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {books.map((book) => (
                    <tr key={book.id} onClick={() => navigate(`/library/${book.id}`)} className="hover:bg-brand-accent/5 cursor-pointer transition-colors">
                      {visibleColumns.icon && <td className="p-4"><div className="w-10 h-14 bg-brand-bg rounded overflow-hidden">{book.thumbnail && <img src={book.thumbnail} className="w-full h-full object-cover" />}</div></td>}
                      {visibleColumns.titleEn && <td className="p-5"><div className="text-sm font-bold text-brand-primary line-clamp-1">{book.title_en}</div><div className="text-[10px] text-brand-secondary">{book.author_en}</div></td>}
                      {visibleColumns.titleSd && <td className="p-5 text-right" dir="rtl"><div className="font-sindhi text-xl font-bold text-brand-primary line-clamp-1">{book.title_sd}</div><div className="font-sindhi text-xs text-brand-accent">{book.author_sd}</div></td>}
                      {visibleColumns.year && <td className="p-5 text-center text-xs font-bold">{book.year}</td>}
                      {visibleColumns.category && <td className="p-5 text-xs text-brand-secondary">{book.category}</td>}
                      {visibleColumns.publisher && <td className="p-5 text-xs text-brand-secondary">{book.publisher}</td>}
                      {visibleColumns.sourceName && <td className="p-5"><span className="px-2 py-1 bg-brand-accent/10 text-brand-accent rounded text-[10px] font-bold">{book.source_name}</span></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* --- ADVANCED PAGINATION --- */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-16 pb-10" dir="ltr">
            <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"><ChevronLeft size={20}/></button>
            {getPageNumbers().map((p, idx) => (
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-brand-secondary"><MoreHorizontal size={18}/></span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => handlePageChange(p as number)}
                  className={cn("w-12 h-12 rounded-xl font-bold text-sm border transition-all", currentPage === p ? "bg-brand-accent border-brand-accent text-white shadow-lg" : "bg-brand-surface border-brand-border text-brand-secondary hover:border-brand-accent")}
                >
                  {p}
                </button>
              )
            ))}
            <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"><ChevronRight size={20}/></button>
          </div>
        )}
      </section>
    </div>
  );
}