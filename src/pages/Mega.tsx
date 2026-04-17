"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Search, Filter, HardDrive,
    ChevronLeft, ChevronRight, FileText,
    User, Calendar, Folder, MoreHorizontal, AlertCircle,
    ExternalLink
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
    const itemsPerPage = 20;

    // 1. Fetch Data from Postgres API
    const fetchArchiveData = useCallback(async () => {
        try {
            setLoading(true);
            // Yahan aap apna Postgres API endpoint call karenge
            const response = await fetch(`/api/archive/list?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
            
            if (!response.ok) {
                throw new Error("API not available");
            }

            const result = await response.json();
            setData(result.data || []);
            setTotalCount(result.total || 0);
        } catch (error) {
            console.error("Archive Fetch Error:", error);
            // FALLBACK: Sample Data for Demonstration (Updated to match DB schema)
            const sampleData = [
                { ID: 101, 'File Name': 'Historical_Records_1947.pdf', Path: 'Archives/National/Sindh', Employee_Name: 'Raja Babar', Designation: 'Digital Lead', Folder: 'History', Year: 2024, Month: 'January', Is_Master: 1, Created_At: '2024-01-15' },
                { ID: 102, 'File Name': 'Cultural_Heritage_Survey.docx', Path: 'Archives/Heritage/V1', Employee_Name: 'Ahmed Ali', Designation: 'Assistant', Folder: 'Culture', Year: 2023, Month: 'December', Is_Master: 0, Created_At: '2023-12-10' },
                { ID: 103, 'File Name': 'Old_Manuscript_Scan_001.jpg', Path: 'Scanning/Queue', Employee_Name: 'Sana Khan', Designation: 'Registrar', Folder: 'Manuscripts', Year: 2024, Month: 'February', Is_Master: 1, Created_At: '2024-02-20' },
                { ID: 104, 'File Name': 'Govt_Gazette_1990.pdf', Path: 'Public/Records', Employee_Name: 'Raja Babar', Designation: 'Digital Lead', Folder: 'Legal', Year: 1990, Month: 'July', Is_Master: 0, Created_At: '1990-07-05' },
            ];
            
            // Filter sample data based on search term
            const filtered = sampleData.filter(item => 
                item['File Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Employee_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Designation?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setData(filtered);
            setTotalCount(filtered.length);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchArchiveData();
        }, 500); // Search debounce to prevent rapid API calls

        return () => clearTimeout(delayDebounceFn);
    }, [fetchArchiveData]);

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

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by filename, employee, or designation..."
                            className="w-full pl-12 pr-6 py-3 bg-brand-surface/50 border border-brand-border rounded-xl outline-none focus:border-brand-accent text-brand-primary text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={18} />
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="glass overflow-hidden rounded-[2rem] border border-brand-border/50 bg-brand-surface/20 shadow-2xl backdrop-blur-xl mt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-brand-surface/50 border-b border-brand-border text-[10px] font-bold text-brand-secondary tracking-widest uppercase">
                                    <th className="p-6">ID</th>
                                    <th className="p-6">File Name & Detailed Path</th>
                                    <th className="p-6">Employee & Designation</th>
                                    <th className="p-6">Category</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Timeline</th>
                                    <th className="p-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/20">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="p-8 bg-brand-surface/5">
                                                <div className="h-4 bg-brand-border/20 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.ID} className="hover:bg-brand-accent/5 transition-all group duration-300">
                                            <td className="p-6 text-xs font-mono text-brand-secondary">
                                                <span className="px-2 py-1 bg-brand-surface rounded">#{item.ID}</span>
                                            </td>
                                            <td className="p-6 max-w-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 p-2 bg-brand-accent/10 rounded-lg text-brand-accent group-hover:scale-110 transition-transform">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="text-sm font-bold text-brand-primary truncate block group-hover:text-brand-accent transition-colors" title={item['File Name']}>
                                                            {item['File Name']}
                                                        </span>
                                                        <span className="text-[10px] text-brand-secondary/60 truncate flex items-center gap-1" title={item.Path}>
                                                            <Folder size={10} className="text-brand-accent/50" /> {item.Path}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-primary/10 flex items-center justify-center text-[10px] border border-brand-border font-bold">
                                                        {item.Employee_Name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-brand-primary font-bold">{item.Employee_Name}</span>
                                                        <span className="text-[9px] text-brand-secondary uppercase tracking-tighter">{item.Designation || 'Digital Registrar'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
                                                    <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
                                                        {item.Folder || 'General'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border",
                                                    item.Status === 'Completed' 
                                                        ? "bg-green-500/20 text-green-500 border-green-500/30" 
                                                        : item.Status === 'Pending'
                                                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                                                        : "bg-brand-surface text-brand-secondary border-brand-border"
                                                )}>
                                                    {item.Status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-xs text-brand-secondary">
                                                    <Calendar size={12} className="text-brand-accent/50" />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-brand-primary">{item.Year}</span>
                                                        <span className="opacity-60 text-[10px]">{item.Month}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="p-2 hover:bg-brand-accent/10 rounded-lg text-brand-secondary hover:text-brand-accent transition-colors group/btn">
                                                    <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-24 text-center">
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="p-6 bg-brand-surface/50 rounded-full mb-6 border border-brand-border">
                                                    <AlertCircle size={48} className="text-brand-secondary/40" />
                                                </div>
                                                <p className="font-bold text-brand-primary text-lg">No records found</p>
                                                <p className="text-brand-secondary text-sm mt-1 max-w-xs">Try adjusting your search filters to find what you're looking for.</p>
                                                <button 
                                                    onClick={() => setSearchTerm('')}
                                                    className="mt-6 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline"
                                                >
                                                    Clear all filters
                                                </button>
                                            </motion.div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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