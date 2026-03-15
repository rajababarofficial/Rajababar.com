import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, Book as BookIcon, ChevronLeft, ChevronRight, Loader2, X, Globe, Calendar, Building, Tag } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import { getDatabase } from '@/src/utils/db';
import SEO from '@/src/components/layout/SEO';

export default function Library() {
  const { isSindhi } = useLanguage();
  const navigate = useNavigate();

  // Data States
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter Options (Dynamic from DB)
  const [options, setOptions] = useState({
    categories: [] as string[],
    languages: [] as string[],
    years: [] as string[],
    publishers: [] as string[]
  });

  // Active Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    year: '',
    publisher: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  // 1. Load Dynamic Filter Options once
// 1. Load and Sort Options from DB
useEffect(() => {
  const loadOptions = async () => {
    try {
      const db = await getDatabase();
      
      const getDistinct = (col: string, order: 'ASC' | 'DESC' = 'ASC') => {
        const query = `
          SELECT DISTINCT ${col} 
          FROM Books 
          WHERE ${col} IS NOT NULL AND ${col} != '' AND ${col} != 'null'
          ORDER BY ${col} ${order}
        `;
        const res = db.exec(query);
        return res.length > 0 ? res[0].values.map(v => String(v[0])) : [];
      };

      setOptions({
        categories: getDistinct('category', 'ASC'), // A to Z
        languages: getDistinct('language', 'ASC'),   // A to Z
        years: getDistinct('year', 'DESC'),        // 2026 to 1900
        publishers: getDistinct('publisher', 'ASC') // A to Z
      });
    } catch (err) {
      console.error("Filter Load Error:", err);
    }
  };
  loadOptions();
}, []);

// 2. Filter Search Logic (Type to search inside filter)
// Har filter ke liye ek local search state
const [filterSearch, setFilterSearch] = useState({
  cat: '',
  pub: '',
  yr: ''
});

// UI mein Publisher Filter ka misal (Searchable):
<div className="space-y-2 relative">
  <label className="text-[10px] uppercase font-bold text-brand-secondary flex items-center gap-2">
    <Building size={12}/> {isSindhi ? "پبلشر" : "Publisher"}
  </label>
  
  {/* Search Input inside Filter */}
  <input 
    type="text"
    placeholder={isSindhi ? "پبلشر ڳوليو..." : "Search Publisher..."}
    className="w-full bg-brand-bg/50 border border-brand-border p-2 text-xs rounded-t-xl outline-none focus:border-brand-accent"
    value={filterSearch.pub}
    onChange={(e) => setFilterSearch(prev => ({ ...prev, pub: e.target.value }))}
  />

  <select 
    className="w-full bg-brand-bg border border-brand-border p-3 rounded-b-xl text-brand-primary outline-none focus:border-brand-accent h-32" 
    size={5} // Isse dropdown hamesha khula nazar ayega search ke niche
    value={filters.publisher} 
    onChange={(e) => updateFilter('publisher', e.target.value)}
  >
    <option value="">{isSindhi ? "سڀ پبلشر" : "All Publishers"}</option>
    {options.publishers
      .filter(p => p.toLowerCase().includes(filterSearch.pub.toLowerCase()))
      .map((p, idx) => (
        <option key={idx} value={p}>{p}</option>
      ))
    }
  </select>
</div>

  // 2. Main Fetch Function
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const offset = (currentPage - 1) * itemsPerPage;
      const safeSearch = searchTerm.replace(/'/g, "''").trim();

      let whereClauses = [];
      if (safeSearch) {
        whereClauses.push(`(title_en LIKE '%${safeSearch}%' OR title_sd LIKE '%${safeSearch}%' OR author_en LIKE '%${safeSearch}%' OR author_sd LIKE '%${safeSearch}%')`);
      }
      if (filters.category) whereClauses.push(`category = '${filters.category.replace(/'/g, "''")}'`);
      if (filters.language) whereClauses.push(`language = '${filters.language.replace(/'/g, "''")}'`);
      if (filters.year) whereClauses.push(`year = '${filters.year.replace(/'/g, "''")}'`);
      if (filters.publisher) whereClauses.push(`publisher = '${filters.publisher.replace(/'/g, "''")}'`);

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Count total matching
      const countResult = db.exec(`SELECT COUNT(*) FROM Books ${whereSql}`);
      setTotalCount(countResult[0].values[0][0] as number);

      // Fetch Paginated Data
      const dataQuery = `SELECT * FROM Books ${whereSql} ORDER BY id DESC LIMIT ${itemsPerPage} OFFSET ${offset}`;
      const dataResult = db.exec(dataQuery);
      
      if (dataResult.length > 0) {
        const rows = dataResult[0].values.map((row: any) => {
          const obj: any = {};
          dataResult[0].columns.forEach((col: string, i: number) => { obj[col] = row[i]; });

          // Archive.org Fallback
          if (!obj.link) obj.link = obj.identifier ? `https://archive.org/details/${obj.identifier}` : "#";
          if (!obj.thumbnail) obj.thumbnail = obj.identifier ? `https://archive.org/services/img/${obj.identifier}` : null;
          
          return obj;
        });
        setBooks(rows);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("DB Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'} className="pt-24 pb-20 bg-brand-bg min-h-screen">
      <SEO title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"} description="Explore 50,000+ digital books." />
      
      <PageHeader
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi ? "ايم. ايڇ پنهور انسٽيٽيوٽ جو مڪمل ڊجيٽل ذخيرو." : "The comprehensive digital repository of MHPISSJ."}
        icon={<BookOpen className="w-12 h-12 text-brand-accent" />}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
        
        {/* SEARCH & DYNAMIC FILTERS BAR */}
        <div className="glass p-6 rounded-[2.5rem] border border-brand-border/50 shadow-2xl bg-brand-surface/20 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input 
                type="text"
                placeholder={isSindhi ? "ڪتاب، ليکڪ يا موضوع ڳوليو..." : "Search title, author or topic..."}
                className={cn("w-full px-6 py-4 bg-brand-bg/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary transition-all", isSindhi && "font-sindhi text-lg pr-12", !isSindhi && "pl-12")}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-brand-secondary", isSindhi ? "right-4" : "left-4")} size={22} />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn("px-6 py-4 rounded-2xl border transition-all flex items-center gap-2 font-bold", showFilters ? "bg-brand-accent text-white border-brand-accent" : "bg-brand-surface text-brand-primary border-brand-border hover:border-brand-accent")}
            >
              <Filter size={20} />
              <span className={isSindhi ? "font-sindhi" : ""}>{isSindhi ? "فلٽر" : "Filters"}</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-brand-border/50">
                  
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-brand-secondary flex items-center gap-2"><Tag size={12}/> {isSindhi ? "ڪيٽيگري" : "Category"}</label>
                    <select className="w-full bg-brand-bg border border-brand-border p-3 rounded-xl text-brand-primary outline-none focus:border-brand-accent" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                      <option value="">{isSindhi ? "سڀ ڪيٽيگريون" : "All Categories"}</option>
                      {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-brand-secondary flex items-center gap-2"><Globe size={12}/> {isSindhi ? "ٻولي" : "Language"}</label>
                    <select className="w-full bg-brand-bg border border-brand-border p-3 rounded-xl text-brand-primary outline-none focus:border-brand-accent" value={filters.language} onChange={(e) => updateFilter('language', e.target.value)}>
                      <option value="">{isSindhi ? "سڀ ٻوليون" : "All Languages"}</option>
                      {options.languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-brand-secondary flex items-center gap-2"><Calendar size={12}/> {isSindhi ? "سال" : "Year"}</label>
                    <select className="w-full bg-brand-bg border border-brand-border p-3 rounded-xl text-brand-primary outline-none focus:border-brand-accent" value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
                      <option value="">{isSindhi ? "سڀ سال" : "All Years"}</option>
                      {options.years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  {/* Publisher */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-brand-secondary flex items-center gap-2"><Building size={12}/> {isSindhi ? "پبلشر" : "Publisher"}</label>
                    <select className="w-full bg-brand-bg border border-brand-border p-3 rounded-xl text-brand-primary outline-none focus:border-brand-accent" value={filters.publisher} onChange={(e) => updateFilter('publisher', e.target.value)}>
                      <option value="">{isSindhi ? "سڀ پبلشر" : "All Publishers"}</option>
                      {options.publishers.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                </div>
                <button onClick={() => { setFilters({category:'', language:'', year:'', publisher:''}); setSearchTerm(''); }} className="mt-4 text-xs text-brand-accent hover:underline flex items-center gap-1">
                  <X size={14}/> {isSindhi ? "فلٽر ختم ڪريو" : "Clear All Filters"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STATS */}
        <div className="flex justify-end">
          <div className="px-4 py-2 bg-brand-surface border border-brand-border rounded-full shadow-sm">
            <p className={cn("text-xs font-bold text-brand-secondary", isSindhi && "font-sindhi")}>
              {isSindhi ? "موجود ڪتاب:" : "Total Results:"} <span className="text-brand-accent ml-1">{totalCount.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* BOOK GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.5] bg-brand-surface/40 animate-pulse rounded-[2.5rem] border border-brand-border" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index % 12) * 0.03 }}
                onClick={() => navigate(`/library/${book.id}`)}
                className="group bg-brand-surface rounded-[2.5rem] border border-brand-border overflow-hidden hover:border-brand-accent transition-all shadow-xl flex flex-col h-full cursor-pointer hover:-translate-y-2"
              >
                <div className="aspect-[3/4.5] relative overflow-hidden bg-brand-bg flex items-center justify-center">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title_en} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  ) : (
                    <div className="flex flex-col items-center text-brand-border group-hover:text-brand-accent transition-colors">
                      <BookIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] text-white font-bold border border-white/10">
  {(book.language || 'PDF').charAt(0).toUpperCase() + (book.language || 'PDF').slice(1).toLowerCase()}
</div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className={cn("text-brand-primary font-bold text-sm mb-2 line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors", isSindhi && "font-sindhi text-lg")}>
                    {isSindhi ? (book.title_sd || book.title_en) : (book.title_en || book.title_sd)}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-brand-border/30">
                    <p className={cn("text-brand-secondary text-[10px] font-semibold truncate", isSindhi && "font-sindhi text-xs")}>
                      {isSindhi ? (book.author_sd || book.author_en) : (book.author_en || book.author_sd)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-brand-surface/20 rounded-[3rem] border border-dashed border-brand-border">
            <p className={cn("text-brand-secondary text-xl font-bold", isSindhi && "font-sindhi text-2xl")}>{isSindhi ? "ڪوبه ڪتاب نه مليو." : "No books found."}</p>
          </div>
        )}

{/* PAGINATION */}
{!loading && totalPages > 1 && (
  <div className="flex flex-wrap justify-center items-center gap-2 mt-16 py-8 border-t border-brand-border/30">
    
    {/* Previous */}
    <button
      disabled={currentPage === 1}
      onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
      className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-surface text-brand-secondary disabled:opacity-20 border border-brand-border"
    >
      <ChevronLeft className={isSindhi ? "rotate-180" : ""} />
    </button>

    {/* First Page */}
    {currentPage > 3 && (
      <button
        onClick={() => { setCurrentPage(1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
        className={cn("w-12 h-12 rounded-xl font-bold border", currentPage === 1 ? "bg-brand-accent text-white scale-110" : "bg-brand-surface text-brand-secondary border-brand-border")}
      >
        1
      </button>
    )}

    {/* Left Ellipsis */}
    {currentPage > 4 && <span className="px-2 text-brand-secondary">...</span>}

    {/* Middle Pages */}
    {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
      .filter(p => p > 0 && p <= totalPages)
      .map(p => (
        <button
          key={p}
          onClick={() => { setCurrentPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
          className={cn("w-12 h-12 rounded-xl font-bold border transition-all", currentPage === p ? "bg-brand-accent text-white scale-110" : "bg-brand-surface text-brand-secondary border-brand-border")}
        >
          {p}
        </button>
      ))
    }

    {/* Right Ellipsis */}
    {currentPage < totalPages - 3 && <span className="px-2 text-brand-secondary">...</span>}

    {/* Last Page */}
    {currentPage < totalPages - 2 && (
      <button
        onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
        className={cn("w-12 h-12 rounded-xl font-bold border", currentPage === totalPages ? "bg-brand-accent text-white scale-110" : "bg-brand-surface text-brand-secondary border-brand-border")}
      >
        {totalPages}
      </button>
    )}

    {/* Next */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
      className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-surface text-brand-secondary disabled:opacity-20 border border-brand-border"
    >
      <ChevronRight className={isSindhi ? "rotate-180" : ""} />
    </button>
    
  </div>
)}
      </section>
    </div>
  );
}