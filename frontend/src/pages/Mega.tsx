"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Search, HardDrive,
    ChevronLeft, ChevronRight, FileText,
    AlertCircle, LayoutGrid, List as ListIcon, Filter,
    MoreHorizontal, Settings2, SortAsc, SortDesc, ArrowUpDown,
    ExternalLink, FolderOpen
} from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import SEO from '@/src/components/layout/SEO';
import Book3D from '@/src/components/Book3D';
import { getApiUrl } from '@/src/utils/api';

interface BookMeta {
    Language?: string;
    DateOfPublication?: string;
    PublishedBy?: string;
    ScannedBy?: string;
    DigitizedBy?: string;
    Keywords?: string;
    Website?: string;
    SindhologyCN?: string;
    Note?: string;
}

interface ArchiveItem {
    id: number;
    file_name: string;
    title: string;
    author: string;
    pages: number;
    custom_data: BookMeta;
    thumb_path: string;
    file_node: string;
    folder_node: string;
}

export default function MegaArchive() {
    const { isSindhi } = useLanguage();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState(() =>
        typeof window !== 'undefined' ? sessionStorage.getItem('mega_search') || '' : ''
    );
    const [currentPage, setCurrentPage] = useState(() =>
        typeof window !== 'undefined' ? Number(sessionStorage.getItem('mega_page')) || 1 : 1
    );
    const [filters, setFilters] = useState<{ publisher: string; scannedBy: string; language: string; year: string; customKey: string; customValue: string }>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem('mega_filters');
                return saved ? JSON.parse(saved) : { publisher: '', scannedBy: '', language: '', year: '', customKey: '', customValue: '' };
            } catch { return { publisher: '', scannedBy: '', language: '', year: '', customKey: '', customValue: '' }; }
        }
        return { publisher: '', scannedBy: '', language: '', year: '', customKey: '', customValue: '' };
    });

    const [data, setData] = useState<ArchiveItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ key: string; order: string }>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = sessionStorage.getItem('mega_sort');
                return saved ? JSON.parse(saved) : { key: 'id', order: 'DESC' };
            } catch { return { key: 'id', order: 'DESC' }; }
        }
        return { key: 'id', order: 'DESC' };
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
        typeof window !== 'undefined'
            ? (sessionStorage.getItem('mega_view') as 'grid' | 'list') || 'list'
            : 'list'
    );

    const [visibleColumns, setVisibleColumns] = useState({
        id: true, title: true, author: true, pages: true, language: true, year: true, scannedBy: true, folder: true
    });

    const [filterOptions, setFilterOptions] = useState({
        publishers: [] as string[],
        scannedBy: [] as string[],
        languages: [] as string[],
        years: [] as string[],
        customKeys: [] as string[],
    });

    const [customFieldValues, setCustomFieldValues] = useState<string[]>([]);
    const [isFetchingValues, setIsFetchingValues] = useState(false);

    const itemsPerPage = 20;
    const CACHE_DURATION = 1000 * 60 * 30;

    // Session persistence
    useEffect(() => {
        sessionStorage.setItem('mega_search', searchTerm);
        sessionStorage.setItem('mega_page', String(currentPage));
        sessionStorage.setItem('mega_filters', JSON.stringify(filters));
        sessionStorage.setItem('mega_view', viewMode);
        sessionStorage.setItem('mega_sort', JSON.stringify(sortConfig));
    }, [searchTerm, currentPage, filters, viewMode, sortConfig]);

    // Fetch paginated data
    const fetchArchiveData = useCallback(async () => {
        try {
            setLoading(true);

            const cacheKey = `mega_cache_${currentPage}_${searchTerm}_${filters.publisher}_${filters.scannedBy}_${filters.language}_${filters.year}_${filters.customKey}_${filters.customValue}_${sortConfig.key}_${sortConfig.order}`;
            const cached = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);

            if (cached && cacheTime && Date.now() - Number(cacheTime) < CACHE_DURATION) {
                try {
                    const parsed = JSON.parse(cached);
                    setData(parsed.data || []);
                    setTotalCount(parsed.total || 0);
                    setLoading(false);
                    return;
                } catch { sessionStorage.removeItem(cacheKey); }
            }

            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('limit', String(itemsPerPage));
            params.set('sortBy', sortConfig.key);
            params.set('sortOrder', sortConfig.order);
            if (searchTerm) params.set('search', searchTerm);
            if (filters.publisher) params.set('publisher', filters.publisher);
            if (filters.scannedBy) params.set('scannedBy', filters.scannedBy);
            if (filters.language) params.set('language', filters.language);
            if (filters.year) params.set('year', filters.year);
            if (filters.customKey && filters.customValue) {
                params.set('customKey', filters.customKey);
                params.set('customValue', filters.customValue);
            }

            const response = await fetch(getApiUrl(`/api/archive/list?${params.toString()}`));
            if (!response.ok) throw new Error(`API Error ${response.status}`);

            const result = await response.json();
            console.log('Archive Data Received:', result);
            
            // Handle both { data: [...] } and directly [...]
            const items = result.data || (Array.isArray(result) ? result : []);
            setData(items);
            setTotalCount(result.total || items.length || 0);

            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            sessionStorage.setItem(`${cacheKey}_time`, String(Date.now()));

        } catch (error: any) {
            console.error('Archive Fetch Error:', error.message);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filters, sortConfig]);

    useEffect(() => {
        const t = setTimeout(() => fetchArchiveData(), 500);
        return () => clearTimeout(t);
    }, [fetchArchiveData]);

    // Fetch filter options (authors, languages, years)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch(getApiUrl('/api/archive/filters'));
                if (res.ok) {
                    const opts = await res.json();
                    console.log('Filters Received:', opts);
                    const finalOpts = opts.data || opts;
                    setFilterOptions({
                        publishers: finalOpts.publishers || [],
                        scannedBy: finalOpts.scannedBy || [],
                        languages: finalOpts.languages || [],
                        years: finalOpts.years || [],
                        customKeys: finalOpts.customKeys || [],
                    });
                }
            } catch (err) {
                console.error('Failed to fetch filter options:', err);
            }
        };
        fetchFilters();
    }, []);

    // Fetch values for selected custom key
    useEffect(() => {
        const fetchValues = async () => {
            if (!filters.customKey) {
                setCustomFieldValues([]);
                return;
            }
            try {
                setIsFetchingValues(true);
                const res = await fetch(getApiUrl(`/api/archive/custom-values?key=${encodeURIComponent(filters.customKey)}`));
                if (res.ok) {
                    const values = await res.json();
                    setCustomFieldValues(values || []);
                }
            } catch (err) {
                console.error('Failed to fetch custom values:', err);
            } finally {
                setIsFetchingValues(false);
            }
        };
        fetchValues();
    }, [filters.customKey]);

    const clearFilters = () => {
        setFilters({ publisher: '', scannedBy: '', language: '', year: '', customKey: '', customValue: '' });
        setSearchTerm('');
        setCurrentPage(1);
        ['mega_search', 'mega_filters', 'mega_page'].forEach(k => sessionStorage.removeItem(k));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const activeFilterCount = [filters.publisher, filters.scannedBy, filters.language, filters.year, filters.customValue, searchTerm].filter(Boolean).length;

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
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

    const goToPage = (p: number) => {
        setCurrentPage(p);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div className="pt-24 pb-20 bg-brand-bg min-h-screen">
            <SEO title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"} />

            <PageHeader
                title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"}
                description={isSindhi
                    ? "تمام ڊجيٽائيز ٿيل فائلن جو مڪمل رڪارڊ."
                    : "Complete Records of all digitized Books."}
                icon={<Database className="w-12 h-12 text-brand-accent" />}
            />

            {/* CONTROL BAR */}
            <section className="max-w-7xl mx-auto px-4 mt-12 space-y-4" dir="ltr">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full border border-brand-accent/20">
                        <HardDrive size={16} />
                        <span className="text-sm font-bold tracking-widest">
                            {activeFilterCount > 0 ? 'Search Result: ' : 'Total Records: '}
                            <span className="text-brand-primary">{totalCount.toLocaleString()}</span>
                        </span>
                    </div>
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs font-bold text-brand-accent hover:underline">
                            Clear filters ({activeFilterCount})
                        </button>
                    )}
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
                            <button
                                onClick={() => setShowColumnSettings(!showColumnSettings)}
                                className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2",
                                    showColumnSettings ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}
                            >
                                <Settings2 size={20} />
                                <span className="text-xs font-bold hidden md:inline">Display</span>
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2 relative",
                                    showFilters ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}
                            >
                                <Filter size={20} />
                                <span className="text-xs font-bold hidden md:inline">Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
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
                                className={cn("p-4 rounded-2xl border transition-all flex items-center gap-2",
                                    showSortOptions ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}
                            >
                                <ArrowUpDown size={20} />
                                <span className="text-xs font-bold hidden md:inline">Sort</span>
                            </button>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <AnimatePresence>
                        {showSortOptions && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-brand-border/30">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                                        {[{ label: 'ID', key: 'id' }, { label: 'Title', key: 'title' }, { label: 'Author', key: 'author' }, { label: 'Pages', key: 'pages' }].map((opt) => (
                                            <button
                                                key={opt.key}
                                                onClick={() => { setSortConfig(prev => ({ ...prev, key: opt.key })); setCurrentPage(1); }}
                                                className={cn("px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                                                    sortConfig.key === opt.key ? "bg-brand-accent text-white" : "text-brand-secondary hover:bg-brand-accent/10")}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-2xl">
                                        {[{ label: 'Asc', order: 'ASC', Icon: SortAsc }, { label: 'Desc', order: 'DESC', Icon: SortDesc }].map(({ label, order, Icon }) => (
                                            <button
                                                key={order}
                                                onClick={() => { setSortConfig(prev => ({ ...prev, order })); setCurrentPage(1); }}
                                                className={cn("p-2 rounded-xl flex items-center gap-2 px-4 transition-all",
                                                    sortConfig.order === order ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}
                                            >
                                                <Icon size={16} /> <span className="text-[10px] font-bold">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Column Settings */}
                    <AnimatePresence>
                        {showColumnSettings && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="flex flex-wrap gap-2 mt-6 p-4 bg-brand-bg/40 rounded-2xl border border-brand-border/40">
                                    {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((col) => (
                                        <button
                                            key={col}
                                            onClick={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                                            className={cn("px-4 py-2 rounded-full text-[10px] font-bold border transition-all",
                                                visibleColumns[col]
                                                    ? "bg-brand-accent/20 border-brand-accent text-brand-accent"
                                                    : "bg-brand-surface border-brand-border text-brand-secondary")}
                                        >
                                            {col.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-brand-border/30">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Language */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-brand-secondary font-bold px-1">Language</label>
                                        <select
                                            value={filters.language}
                                            onChange={(e) => { setFilters(f => ({ ...f, language: e.target.value })); setCurrentPage(1); }}
                                            className="w-full bg-brand-bg/80 border border-brand-border p-4 rounded-2xl text-xs text-brand-primary outline-none focus:border-brand-accent transition-all hover:bg-brand-bg select-custom"
                                        >
                                            <option value="">All Languages</option>
                                            {filterOptions.languages.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>

                                    {/* Year */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-brand-secondary font-bold px-1">Year</label>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => { setFilters(f => ({ ...f, year: e.target.value })); setCurrentPage(1); }}
                                            className="w-full bg-brand-bg/80 border border-brand-border p-4 rounded-2xl text-xs text-brand-primary outline-none focus:border-brand-accent transition-all hover:bg-brand-bg select-custom"
                                        >
                                            <option value="">All Years</option>
                                            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>

                                    {/* Advanced Custom Filter - Category Selection */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-brand-secondary font-bold px-1">Advanced Category</label>
                                        <select
                                            value={filters.customKey}
                                            onChange={(e) => { setFilters(f => ({ ...f, customKey: e.target.value, customValue: '' })); setCurrentPage(1); }}
                                            className="w-full bg-brand-bg/80 border border-brand-border p-4 rounded-2xl text-xs text-brand-primary outline-none focus:border-brand-accent transition-all hover:bg-brand-bg select-custom"
                                        >
                                            <option value="">Select Category...</option>
                                            {filterOptions.customKeys.map(k => (
                                                <option key={k} value={k}>{k}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Advanced Custom Filter - Value Selection */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-brand-secondary font-bold px-1">Value Selection</label>
                                        <select
                                            disabled={!filters.customKey || isFetchingValues}
                                            value={filters.customValue}
                                            onChange={(e) => { setFilters(f => ({ ...f, customValue: e.target.value })); setCurrentPage(1); }}
                                            className={cn(
                                                "w-full bg-brand-bg/80 border border-brand-border p-4 rounded-2xl text-xs text-brand-primary outline-none focus:border-brand-accent transition-all hover:bg-brand-bg select-custom",
                                                (!filters.customKey || isFetchingValues) && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <option value="">{isFetchingValues ? 'Loading...' : filters.customKey ? 'Select Value...' : 'Waiting for Category...'}</option>
                                            {customFieldValues.map(v => <option key={v} value={v}>{v}</option>)}
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

            {/* DATA DISPLAY */}
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
                                <p className="text-brand-secondary text-sm mt-1 max-w-xs">Try adjusting your search filters.</p>
                                <button onClick={clearFilters} className="mt-6 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">
                                    Clear all filters
                                </button>
                            </motion.div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {data.map((item) => {
                                const meta = item.custom_data || {};
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => navigate(`/mega/${item.id}`)}
                                        className="group flex flex-col h-full relative cursor-pointer"
                                    >
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
                                                <p className="text-brand-secondary text-xs font-semibold tracking-wide mt-1 truncate w-full">
                                                    <span className="opacity-60 font-medium">By: </span>
                                                    {item.author || 'Unknown Author'}
                                                </p>

                                                {/* custom_data badges */}
                                                <div className="flex flex-wrap justify-center gap-1 mt-2">
                                                    {meta.Language && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                            {meta.Language}
                                                        </span>
                                                    )}
                                                    {meta.DateOfPublication && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                            {meta.DateOfPublication}
                                                        </span>
                                                    )}
                                                    {meta.ScannedBy && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                            {meta.ScannedBy}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-brand-secondary/60 text-[10px] truncate w-full px-4 mt-1" title={item.file_name}>
                                                    {item.file_name}
                                                </p>
                                            </div>

                                            <div className="w-[90%] max-w-[300px] bg-brand-surface border border-brand-border/40 rounded-[1.2rem] py-3 px-2 flex flex-row items-center justify-evenly shadow-sm">
                                                <div className="flex flex-col items-center flex-1">
                                                    <span className="text-brand-accent font-black text-sm">{item.pages || '0'}</span>
                                                    <span className="text-brand-secondary text-[9px] tracking-wider mt-1">{isSindhi ? "صفحا" : "Pages"}</span>
                                                </div>
                                                <div className="w-[1px] h-6 bg-brand-border/60" />

                                                <a
                                                    href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex flex-col items-center flex-1 px-1 hover:bg-brand-accent/5 rounded-lg transition-all"
                                                >
                                                    <span className="text-brand-accent font-black text-sm flex items-center gap-1">
                                                        {isSindhi ? "فولڊر" : "Folder"}
                                                        <ExternalLink size={10} />
                                                    </span>
                                                    <span className="text-brand-secondary text-[9px] tracking-wider mt-1 uppercase font-bold">{isSindhi ? "کوليو" : "Open"}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        /* LIST VIEW */
                        <div className="w-full overflow-x-auto rounded-[2.5rem] border border-brand-border bg-brand-surface/20">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-brand-surface border-b border-brand-border text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                                        {visibleColumns.id && <th className="p-5">ID</th>}
                                        {visibleColumns.title && <th className="p-5">File Details</th>}
                                        {visibleColumns.author && <th className="p-5">Author</th>}
                                        {visibleColumns.pages && <th className="p-5 text-center">Pages</th>}
                                        {visibleColumns.language && <th className="p-5">Language</th>}
                                        {visibleColumns.year && <th className="p-5">Year</th>}
                                        {visibleColumns.scannedBy && <th className="p-5">Scanned By</th>}
                                        {visibleColumns.folder && <th className="p-5">Folder</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/30">
                                    {data.map((item) => {
                                        const meta = item.custom_data || {};
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => navigate(`/mega/${item.id}`)}
                                                className="hover:bg-brand-accent/5 transition-colors cursor-pointer"
                                            >
                                                {visibleColumns.id && (
                                                    <td className="p-5 text-xs font-mono text-brand-secondary">#{item.id}</td>
                                                )}
                                                {visibleColumns.title && (
                                                    <td className="p-5 max-w-[350px]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-14 bg-brand-surface rounded overflow-hidden flex items-center justify-center shadow-sm border border-brand-border/50 shrink-0">
                                                                {item.thumb_path
                                                                    ? <img src={item.thumb_path} alt="" className="w-full h-full object-cover" />
                                                                    : <FileText className="w-5 h-5 text-brand-secondary/40" />
                                                                }
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-bold text-brand-primary truncate" title={item.title || item.file_name}>
                                                                    {item.title || item.file_name}
                                                                </span>
                                                                <span className="text-[10px] text-brand-secondary truncate">{item.file_name}</span>
                                                                {meta.PublishedBy && (
                                                                    <span className="text-[10px] text-brand-secondary/60 truncate mt-0.5">{meta.PublishedBy}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.author && (
                                                    <td className="p-5 text-sm text-brand-primary font-medium">{item.author || '-'}</td>
                                                )}
                                                {visibleColumns.pages && (
                                                    <td className="p-5 text-center">
                                                        <span className="bg-brand-accent/10 px-3 py-1 rounded-full text-xs font-bold text-brand-accent">
                                                            {item.pages || 0}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.language && (
                                                    <td className="p-5">
                                                        {meta.Language && (
                                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                {meta.Language}
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.year && (
                                                    <td className="p-5 text-sm text-brand-secondary font-mono">
                                                        {meta.DateOfPublication || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.scannedBy && (
                                                    <td className="p-5">
                                                        {meta.ScannedBy ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center shrink-0">
                                                                    <span className="text-[8px] font-black text-brand-accent">
                                                                        {meta.ScannedBy.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-brand-secondary truncate max-w-[120px]" title={meta.ScannedBy}>
                                                                    {meta.ScannedBy}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-brand-secondary/30 text-xs">—</span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.folder && (
                                                    <td className="p-5">
                                                        <a
                                                            href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : '#'}
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-16 pb-10" dir="ltr">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                            className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {getPageNumbers().map((p, idx) =>
                            p === '...' ? (
                                <span key={`dots-${idx}`} className="px-2 text-brand-secondary"><MoreHorizontal size={18} /></span>
                            ) : (
                                <button
                                    key={`page-${p}`}
                                    onClick={() => goToPage(p as number)}
                                    className={cn(
                                        "w-12 h-12 rounded-xl font-bold text-sm border transition-all",
                                        currentPage === p
                                            ? "bg-brand-accent border-brand-accent text-white shadow-lg"
                                            : "bg-brand-surface border-brand-border text-brand-secondary hover:border-brand-accent"
                                    )}
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(currentPage + 1)}
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