"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Search, HardDrive,
    ChevronLeft, ChevronRight, FileText,
    User, Calendar, Folder, AlertCircle,
    LayoutGrid, List as ListIcon, Filter,
    MoreHorizontal, Settings2, BookOpen,
    SortAsc, SortDesc, ArrowUpDown,
    ExternalLink, FolderOpen
} from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import SEO from '@/src/components/layout/SEO';
import Book3D from '@/src/components/Book3D';

export default function MegaArchive() {
    const { isSindhi } = useLanguage();
    const navigate = useNavigate();
    // --- Initial States (Memory se load karne ke liye) ---
    const [searchTerm, setSearchTerm] = useState(() => {
        return typeof window !== 'undefined' ? sessionStorage.getItem('mega_search') || '' : '';
    });

    const [currentPage, setCurrentPage] = useState(() => {
        return typeof window !== 'undefined' ? Number(sessionStorage.getItem('mega_page')) || 1 : 1;
    });

    const [filters, setFilters] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem('mega_filters');
                return saved ? JSON.parse(saved) : { author: '' };
            } catch (error) {
                console.error("Session parsing error (filters):", error);
                return { author: '' };
            }
        }
        return { author: '' };
    });

    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);
    
    // Sorting: default ID DESC
    const [sortConfig, setSortConfig] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem('mega_sort');
                return saved ? JSON.parse(saved) : { key: 'id', order: 'DESC' };
            } catch (error) {
                console.error("Session parsing error (sort):", error);
                return { key: 'id', order: 'DESC' };
            }
        }
        return { key: 'id', order: 'DESC' };
    });
    
    // View mode: grid/list
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return typeof window !== 'undefined' ? (sessionStorage.getItem('mega_view') as 'grid' | 'list') || 'list' : 'list';
    });

    const [visibleColumns, setVisibleColumns] = useState({
        id: true, title: true, author: true, pages: true, folder: true
    });

    // Available options for filters
    const [filterOptions, setFilterOptions] = useState({
        authors: [] as string[]
    });

    const itemsPerPage = 20;

    // Save view mode to session
    useEffect(() => {
        sessionStorage.setItem('mega_search', searchTerm);
        sessionStorage.setItem('mega_page', String(currentPage));
        sessionStorage.setItem('mega_filters', JSON.stringify(filters));
        sessionStorage.setItem('mega_view', viewMode);
        sessionStorage.setItem('mega_sort', JSON.stringify(sortConfig));
    }, [searchTerm, currentPage, filters, viewMode, sortConfig]);

    // Cache key for sessionStorage
    const CACHE_KEY = 'mega_archive_data';
    const CACHE_TIME_KEY = 'mega_archive_time';
    const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

    // 1. Fetch Data from Postgres API (with local cache)
    const fetchArchiveData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Smart cache check: only use if it matches current page/search/filter/sort
            const cacheKey = `mega_cache_${currentPage}_${searchTerm}_${filters.author}_${sortConfig.key}_${sortConfig.order}`;
            const cached = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
            
            if (cached && cacheTime && Date.now() - Number(cacheTime) < CACHE_DURATION) {
                try {
                    const parsed = JSON.parse(cached);
                    setData(parsed.data || []);
                    setTotalCount(parsed.total || 0);
                    setLoading(false);
                    console.log('📦 Loaded from smart cache:', cacheKey);
                    return;
                } catch (e) {
                    console.error("Cache parsing error:", e);
                    sessionStorage.removeItem(cacheKey);
                }
            }
            
            // Build query with filters
            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('limit', String(itemsPerPage));
            params.set('sortBy', sortConfig.key);
            params.set('sortOrder', sortConfig.order);
            if (searchTerm) params.set('search', searchTerm);
            if (filters.author) params.set('author', filters.author);
            
            console.log('📤 API Request:', { page: currentPage, search: searchTerm, filters, sortConfig });
            const response = await fetch(`/api/archive/list?${params.toString()}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 API Response:', { page: currentPage, total: result.total, dataCount: result.data?.length });
            setData(result.data || []);
            setTotalCount(result.total || 0);
            
            // Cache the result with the dynamic key
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            sessionStorage.setItem(`${cacheKey}_time`, String(Date.now()));
            
            if (result.total === 0) {
                console.warn('⚠️ Archive table is empty in database');
            }
        } catch (error: any) {
            console.error("Archive Fetch Error:", error.message, error.stack);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filters, sortConfig]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchArchiveData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchArchiveData, filters]);

    // Load filter options from API (all unique values from database)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch('/api/archive/filters');
                if (res.ok) {
                    const opts = await res.json();
                    setFilterOptions({
                        authors: opts.authors || []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch filter options:', err);
            }
        };
        fetchFilters();
    }, []);

    const clearFilters = () => {
        setFilters({ author: '' });
        setSearchTerm('');
        setCurrentPage(1);
        sessionStorage.removeItem('mega_search');
        sessionStorage.removeItem('mega_filters');
        sessionStorage.removeItem('mega_page');
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
            <SEO title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"} />

            <PageHeader
                title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"}
                description={isSindhi ? "انسٽيٽيوٽ جي تمام اسڪين ٿيل فائلن جو مڪمل رڪارڊ." : "Complete digital ledger of all scanned artifacts and files."}
                icon={<Database className="w-12 h-12 text-brand-accent" />}
            />

            {/* --- CONTROL BAR --- */}
            <section className="max-w-7xl mx-auto px-4 mt-12 space-y-4" dir="ltr">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full border border-brand-accent/20">
                        <HardDrive size={16} />
                        <span className="text-sm font-bold tracking-widest ">
                            {searchTerm || filters.author
                                ? `Search Result: `
                                : `Total Records: `}
                            <span className="text-brand-primary">{totalCount.toLocaleString()}</span>
                        </span>
                    </div>
                </div>

                <div className="glass p-6 rounded-[2.5rem] border border-brand-border/50 bg-brand-surface/20 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full text-left">
                            <input
                                type="text"
                                placeholder="Search by File Name or Title..."
                                className="w-full pl-12 pr-6 py-4 bg-brand-bg/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={20} />
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowColumnSettings(!showColumnSettings)} className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2", showColumnSettings ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}>
                                <Settings2 size={20} /> <span className="text-xs font-bold  hidden md:inline">Display</span>
                            </button>
                            <button onClick={() => setShowFilters(!showFilters)} className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2", showFilters ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}>
                                <Filter size={20} />
                                <span className="text-xs font-bold hidden md:inline">Filters</span>
                            </button>
                            <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                                <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl", viewMode === 'grid' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}>
                                    <LayoutGrid size={20} />
                                </button>
                                <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl", viewMode === 'list' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}>
                                    <ListIcon size={20} />
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowSortOptions(!showSortOptions)} 
                                className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2", showSortOptions ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}
                                title="Sort Options"
                            >
                                <ArrowUpDown size={20} />
                                <span className="text-xs font-bold hidden md:inline">Sort</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showSortOptions && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-brand-border/30">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                                        {[
                                            { label: 'ID', key: 'id' },
                                            { label: 'Title', key: 'title' },
                                            { label: 'Author', key: 'author' },
                                            { label: 'Pages', key: 'pages' }
                                        ].map((opt) => (
                                            <button 
                                                key={opt.key}
                                                onClick={() => { setSortConfig(prev => ({ ...prev, key: opt.key })); setCurrentPage(1); }}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                                                    sortConfig.key === opt.key ? "bg-brand-accent text-white" : "text-brand-secondary hover:bg-brand-accent/10"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                                        <button 
                                            onClick={() => { setSortConfig(prev => ({ ...prev, order: 'ASC' })); setCurrentPage(1); }}
                                            className={cn(
                                                "p-2 rounded-xl flex items-center gap-2 px-4 transition-all",
                                                sortConfig.order === 'ASC' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary"
                                            )}
                                        >
                                            <SortAsc size={16} /> <span className="text-[10px] font-bold uppercase">Asc</span>
                                        </button>
                                        <button 
                                            onClick={() => { setSortConfig(prev => ({ ...prev, order: 'DESC' })); setCurrentPage(1); }}
                                            className={cn(
                                                "p-2 rounded-xl flex items-center gap-2 px-4 transition-all",
                                                sortConfig.order === 'DESC' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary"
                                            )}
                                        >
                                            <SortDesc size={16} /> <span className="text-[10px] font-bold uppercase">Desc</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showColumnSettings && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="flex flex-wrap gap-2 mt-6 p-4 bg-brand-bg/40 rounded-2xl border border-brand-border/40">
                                    {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((col) => (
                                        <button key={col} onClick={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))} className={cn("px-4 py-2 rounded-full text-[10px] font-bold border transition-all ", visibleColumns[col] ? "bg-brand-accent/20 border-brand-accent text-brand-accent" : "bg-brand-surface border-brand-border text-brand-secondary")}>
                                            {col.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-brand-border/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-brand-secondary uppercase font-bold px-1">Filter by Author</label>
                                        <select
                                            value={filters.author}
                                            onChange={(e) => { setFilters(f => ({ ...f, author: e.target.value })); setCurrentPage(1); }}
                                            className="w-full bg-brand-bg border border-brand-border p-3 rounded-xl text-xs text-brand-primary outline-none"
                                        >
                                            <option value="">All Authors</option>
                                            {filterOptions.authors.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6 pt-4 border-t border-brand-border/20">
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-6 py-2 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white border border-brand-accent/20 rounded-xl text-[10px] font-bold transition-all"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* --- DATA DISPLAY (Grid/List) --- */}
            <section className="max-w-7xl mx-auto px-4 mt-8">
                <div className="min-h-[500px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-pulse">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4.5] bg-brand-surface/40 rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-24 text-center">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                <div className="p-6 bg-brand-surface/50 rounded-full mb-6 border border-brand-border">
                                    <AlertCircle size={48} className="text-brand-secondary/40" />
                                </div>
                                <p className="font-bold text-brand-primary text-lg">No records found</p>
                                <p className="text-brand-secondary text-sm mt-1 max-w-xs">Try adjusting your search filters to find what you're looking for.</p>
                                <button onClick={clearFilters} className="mt-6 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">
                                    Clear all filters
                                </button>
                            </motion.div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {data.map((item) => (
                                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => navigate(`/mega/${item.id}`)} className="group flex flex-col h-full relative cursor-pointer">
                                    <div className="aspect-[3/4.5] relative flex items-center justify-center">
                                        <Book3D
                                            title={item.title || item.file_name}
                                            thumbnailUrl={item.thumb_path}
                                            className="w-full h-full z-10"
                                        />
                                    </div>

                                    <div className="pt-6 pb-2 flex flex-col items-center text-center space-y-4">
                                        <div className="space-y-1 w-full flex flex-col items-center px-2">
                                            <h3 className="text-brand-primary font-black text-lg leading-snug truncate w-full" title={item.title || item.file_name}>
                                                {item.title || item.file_name}
                                            </h3>
                                            <p className="text-brand-secondary text-xs sm:text-sm font-semibold tracking-wide mt-1 truncate w-full" title={item.author || 'Unknown Author'}>
                                                <span className="opacity-60 font-medium">By: </span>
                                                {item.author || 'Unknown Author'}
                                            </p>
                                            <p className="text-brand-secondary/60 text-[10px] truncate w-full px-4" title={item.file_name}>
                                                {item.file_name}
                                            </p>
                                        </div>

                                        <div className="w-[90%] max-w-[300px] bg-brand-surface border border-brand-border/40 rounded-[1.2rem] py-3 px-2 flex flex-row items-center justify-evenly shadow-sm opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1">
                                            <div className="flex flex-col items-center flex-1 overflow-hidden">
                                                <span className="text-brand-accent font-black text-sm lg:text-base">{item.pages || "0"}</span>
                                                <span className="text-brand-secondary text-[9px] tracking-wider mt-1">{isSindhi ? "صفحا" : "Pages"}</span>
                                            </div>
                                            <div className="w-[1px] h-6 bg-brand-border/60"></div>
                                            <a 
                                                href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : "#"} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex flex-col items-center flex-1 overflow-hidden px-1 hover:bg-brand-accent/5 rounded-lg transition-all border border-transparent hover:border-brand-accent/20"
                                            >
                                                <span className="text-brand-accent font-black text-sm lg:text-base truncate w-full text-center flex items-center justify-center gap-1">
                                                    {isSindhi ? "فولڊر" : "Folder"}
                                                    <ExternalLink size={10} className="hidden group-hover:inline-block transition-opacity" />
                                                </span>
                                                <span className="text-brand-secondary text-[9px] tracking-wider mt-1 uppercase font-bold">{isSindhi ? "کوليو" : "Open"}</span>
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* LIST VIEW (Table) */
                        <div className="w-full overflow-x-auto rounded-[2.5rem] border border-brand-border bg-brand-surface/20">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-brand-surface border-b border-brand-border text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                                        {visibleColumns.id && <th className="p-5">ID</th>}
                                        {visibleColumns.title && <th className="p-5">File Details</th>}
                                        {visibleColumns.author && <th className="p-5">Author</th>}
                                        {visibleColumns.pages && <th className="p-5 text-center">Pages</th>}
                                        {visibleColumns.folder && <th className="p-5">Folder Path</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/30">
                                    {data.map((item) => (
                                        <tr key={item.id} onClick={() => navigate(`/mega/${item.id}`)} className="hover:bg-brand-accent/5 transition-colors group cursor-pointer">
                                            {visibleColumns.id && <td className="p-5 text-xs font-mono text-brand-secondary">#{item.id}</td>}
                                            {visibleColumns.title && (
                                                <td className="p-5 max-w-[350px]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-14 bg-brand-surface rounded overflow-hidden flex items-center justify-center shadow-sm border border-brand-border/50 relative shrink-0">
                                                            {item.thumb_path ? (
                                                                <img src={item.thumb_path} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FileText className="w-5 h-5 text-brand-secondary/40" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-bold text-brand-primary truncate" title={item.title || item.file_name}>
                                                                {item.title || item.file_name}
                                                            </span>
                                                            <span className="text-[10px] text-brand-secondary truncate">{item.file_name}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.author && <td className="p-5 text-sm text-brand-primary font-medium">{item.author || '-'}</td>}
                                            {visibleColumns.pages && (
                                                <td className="p-5 text-center">
                                                    <span className="bg-brand-accent/10 px-3 py-1 rounded-full text-xs font-bold text-brand-accent">
                                                        {item.pages || 0}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.folder && (
                                                <td className="p-5">
                                                    <a 
                                                       href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : "#"} 
                                                       target="_blank" 
                                                       rel="noopener noreferrer"
                                                       onClick={(e) => e.stopPropagation()}
                                                       className={cn(
                                                           "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 max-w-fit transition-all",
                                                           item.folder_node 
                                                               ? "border-brand-accent/20 bg-brand-accent/5 text-brand-accent hover:bg-brand-accent hover:text-white" 
                                                               : "border-brand-border/40 bg-brand-bg/30 text-brand-secondary/40 pointer-events-none"
                                                       )}
                                                    >
                                                       <FolderOpen size={12} />
                                                       {isSindhi ? "فولڊر کوليو" : "Open Folder"}
                                                       <ExternalLink size={10} />
                                                    </a>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- ADVANCED PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-16 pb-10" dir="ltr">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                            className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {getPageNumbers().map((p, idx) => (
                            p === '...' ? (
                                <span key={`dots-${idx}`} className="px-2 text-brand-secondary"><MoreHorizontal size={18} /></span>
                            ) : (
                                <button
                                    key={`page-${p}`}
                                    onClick={() => { setCurrentPage(p as number); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                                    className={cn("w-12 h-12 rounded-xl font-bold text-sm border transition-all", currentPage === p ? "bg-brand-accent border-brand-accent text-white shadow-lg" : "bg-brand-surface border-brand-border text-brand-secondary hover:border-brand-accent")}
                                >
                                    {p}
                                </button>
                            )
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                            className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}