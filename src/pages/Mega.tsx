"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Search, HardDrive,
    ChevronLeft, ChevronRight, FileText,
    User, Calendar, Folder, AlertCircle,
    LayoutGrid, List as ListIcon, Filter
} from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import SEO from '@/src/components/layout/SEO';

export default function MegaArchive() {
    const { isSindhi } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // View mode: grid/list
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return typeof window !== 'undefined' ? (sessionStorage.getItem('mega_view') as 'grid' | 'list') || 'list' : 'list';
    });

    // Filter states
    const [filters, setFilters] = useState({
        fileName: '',
        year: '',
        employee: '',
        month: ''
    });

    // Available options for filters
    const [filterOptions, setFilterOptions] = useState({
        years: [] as string[],
        employees: [] as string[],
        months: [] as string[]
    });

    const itemsPerPage = 20;

    // Save view mode to session
    useEffect(() => {
        sessionStorage.setItem('mega_view', viewMode);
    }, [viewMode]);

    // Cache key for sessionStorage
    const CACHE_KEY = 'mega_archive_data';
    const CACHE_TIME_KEY = 'mega_archive_time';
    const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

    // 1. Fetch Data from Postgres API (with local cache)
    const fetchArchiveData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Check cache first (only for page 1 without filters)
            const isFirstPage = currentPage === 1 && !searchTerm && !filters.year && !filters.employee && !filters.month;
            if (isFirstPage) {
                const cached = sessionStorage.getItem(CACHE_KEY);
                const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
                if (cached && cacheTime && Date.now() - Number(cacheTime) < CACHE_DURATION) {
                    const parsed = JSON.parse(cached);
                    setData(parsed.data || []);
                    setTotalCount(parsed.total || 0);
                    setLoading(false);
                    console.log('📦 Loaded from cache');
                    return;
                }
            }
            
            // Build query with filters
            const params = new URLSearchParams();
            params.set('page', String(currentPage));
            params.set('limit', String(itemsPerPage));
            if (searchTerm) params.set('search', searchTerm);
            if (filters.year) params.set('year', filters.year);
            if (filters.employee) params.set('employee', filters.employee);
            if (filters.month) params.set('month', filters.month);
            
            console.log('📤 API Request:', { page: currentPage, search: searchTerm, filters });
            const response = await fetch(`/api/archive/list?${params.toString()}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('📥 API Response:', { page: currentPage, total: result.total, dataCount: result.data?.length });
            setData(result.data || []);
            setTotalCount(result.total || 0);
            
            // Cache first page data
            if (isFirstPage) {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
                sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
            }
            
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
    }, [currentPage, searchTerm, filters]);

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
                        years: opts.years || [],
                        employees: opts.employees || [],
                        months: opts.months || []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch filter options:', err);
            }
        };
        fetchFilters();
    }, []);

    const clearFilters = () => {
        setFilters({ fileName: '', year: '', employee: '', month: '' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="pt-24 pb-20 bg-brand-bg min-h-screen">
            <SEO title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"} />

            <PageHeader
                title={isSindhi ? "ميگا آرڪائيو" : "Mega Archive"}
                description={isSindhi ? "انسٽيٽيوٽ جي تمام اسڪين ٿيل فائلن جو مڪمل رڪارڊ." : "Complete digital ledger of all scanned artifacts and files."}
                icon={<Database className="w-12 h-12 text-brand-accent" />}
            />

            {/* --- STATS & SEARCH --- */}
            <section className="max-w-7xl mx-auto px-4 mt-12 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-full border border-brand-accent/20">
                        <HardDrive size={16} />
                        <span className="text-sm font-bold tracking-widest uppercase">
                            Total Records: <span className="text-brand-primary">{totalCount.toLocaleString()}</span>
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by File Name..."
                                className="w-full pl-12 pr-6 py-3 bg-brand-surface/50 border border-brand-border rounded-xl outline-none focus:border-brand-accent text-brand-primary text-sm"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className={cn("p-3 rounded-xl border transition-all flex items-center gap-2", showFilters ? "bg-brand-accent text-white" : "bg-brand-surface border-brand-border text-brand-primary")}>
                            <Filter size={20} />
                            <span className="text-xs font-bold">Filters</span>
                        </button>
                        <div className="flex bg-brand-bg/50 p-1 border border-brand-border rounded-xl">
                            <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg", viewMode === 'grid' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}>
                                <LayoutGrid size={20} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg", viewMode === 'list' ? "bg-brand-accent text-white shadow-lg" : "text-brand-secondary")}>
                                <ListIcon size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass p-4 rounded-xl border border-brand-border bg-brand-surface/30">
                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-brand-secondary uppercase">Year</label>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => { setFilters(f => ({ ...f, year: e.target.value })); setCurrentPage(1); }}
                                            className="px-3 py-2 bg-brand-surface/50 border border-brand-border rounded-lg text-sm min-w-[120px]"
                                        >
                                            <option value="">All Years</option>
                                            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-brand-secondary uppercase">Employee</label>
                                        <select
                                            value={filters.employee}
                                            onChange={(e) => { setFilters(f => ({ ...f, employee: e.target.value })); setCurrentPage(1); }}
                                            className="px-3 py-2 bg-brand-surface/50 border border-brand-border rounded-lg text-sm min-w-[150px]"
                                        >
                                            <option value="">All Employees</option>
                                            {filterOptions.employees.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-brand-secondary uppercase">Month</label>
                                        <select
                                            value={filters.month}
                                            onChange={(e) => { setFilters(f => ({ ...f, month: e.target.value })); setCurrentPage(1); }}
                                            className="px-3 py-2 bg-brand-surface/50 border border-brand-border rounded-lg text-sm min-w-[120px]"
                                        >
                                            <option value="">All Months</option>
                                            {filterOptions.months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={clearFilters} className="px-4 py-2 text-brand-accent text-xs font-bold hover:underline">
                                        Clear Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- DATA DISPLAY (Grid/List) --- */}
                <div className="glass overflow-hidden rounded-[2rem] border border-brand-border/50 bg-brand-surface/20 shadow-2xl backdrop-blur-xl mt-6">
                    {loading ? (
                        <div className="p-8">
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className={viewMode === 'grid' ? "h-48 bg-brand-surface/40 rounded-xl animate-pulse" : "h-16 bg-brand-surface/40 rounded-lg animate-pulse"}></div>
                                ))}
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-24 text-center">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                                <div className="p-6 bg-brand-surface/50 rounded-full mb-6 border border-brand-border">
                                    <AlertCircle size={48} className="text-brand-secondary/40" />
                                </div>
                                <p className="font-bold text-brand-primary text-lg">No records found</p>
                                <p className="text-brand-secondary text-sm mt-1 max-w-xs">Try adjusting your search filters to find what you're looking for.</p>
                                <button onClick={() => setSearchTerm('')} className="mt-6 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">
                                    Clear all filters
                                </button>
                            </motion.div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.map((item) => (
                                    <motion.div key={item.ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-surface/30 border border-brand-border/50 rounded-xl p-4 hover:border-brand-accent/50 transition-all">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-brand-primary truncate" title={item['File Name']}>
                                                    {item['File Name']}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-brand-accent" />
                                                <span className="text-brand-primary font-semibold">{item.Employee_Name || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-brand-secondary pt-2 border-t border-brand-border/30 mt-2">
                                                <Calendar size={10} />
                                                <span>{item.Year} {item.Month}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* LIST VIEW (Table) - Default Columns: ID, File Name, Employee, Year, Month */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-brand-surface/50 border-b border-brand-border text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">File Name</th>
                                        <th className="p-4">Employee</th>
                                        <th className="p-4">Year</th>
                                        <th className="p-4">Month</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/20">
                                    {data.map((item) => (
                                        <tr key={item.ID} className="hover:bg-brand-accent/5 transition-colors">
                                            <td className="p-4 text-xs font-mono text-brand-secondary">#{item.ID}</td>
                                            <td className="p-4 max-w-[250px]">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} className="text-brand-accent" />
                                                    <span className="text-sm text-brand-primary truncate" title={item['File Name']}>{item['File Name']}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-brand-primary">{item.Employee_Name || '-'}</td>
                                            <td className="p-4 text-xs text-brand-primary font-bold">{item.Year || '-'}</td>
                                            <td className="p-4 text-xs text-brand-secondary">{item.Month || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="p-2 bg-brand-surface border border-brand-border rounded-lg text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-xs font-bold text-brand-secondary px-4">
                            Page <span className="text-brand-accent">{currentPage}</span> of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="p-2 bg-brand-surface border border-brand-border rounded-lg text-brand-secondary disabled:opacity-20 hover:border-brand-accent transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}