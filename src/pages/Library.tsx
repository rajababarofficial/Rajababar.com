import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Library as LibraryIcon, ExternalLink, Loader2, BookUp, Flame, Globe, History } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';

interface Book {
    id: string;
    title: string;
    author_name: string;
    first_publish_year?: number | string;
    cover_url?: string;
    link: string;
    source: 'Open Library' | 'Sindh Library';
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function Library() {
    const { isSindhi } = useLanguage();

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 800);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Categorized books on load
    const [popularBooks, setPopularBooks] = useState<Book[]>([]);
    const [sindhBooks, setSindhBooks] = useState<Book[]>([]);

    // Search results
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch OpenLibrary
    const fetchOpenLibrary = async (searchQuery: string, limit = 8): Promise<Book[]> => {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=${limit}`);
            const data = await response.json();
            return (data.docs || []).map((doc: any) => ({
                id: `ol-${doc.key}`,
                title: doc.title,
                author_name: doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Unknown Author',
                first_publish_year: doc.first_publish_year,
                cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
                link: `https://openlibrary.org${doc.key}`,
                source: 'Open Library'
            }));
        } catch (error) {
            console.error('OpenLibrary error:', error);
            return [];
        }
    };

    // Fetch Sindh Library
    const fetchSindhLibrary = async (searchQuery: string = ''): Promise<Book[]> => {
        try {
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = `https://lib.sindh.org/kitaab${searchQuery ? '?q=' + encodeURIComponent(searchQuery) : ''}`;
            const res = await fetch(proxyUrl + encodeURIComponent(targetUrl));
            const data = await res.json();
            const html = data.contents;

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const booksMap = new Map<string, Book>();

            doc.querySelectorAll('a').forEach(aTag => {
                const href = aTag.getAttribute('href');
                const img = aTag.querySelector('img');

                if (href && href.includes('/kitaab/detail/') && img) {
                    const fullLink = href.startsWith('http') ? href : `https://lib.sindh.org${href}`;
                    const imgSrc = img.getAttribute('src') || '';
                    const fullImg = imgSrc.startsWith('http') ? imgSrc : `https://lib.sindh.org${imgSrc}`;

                    let title = aTag.textContent?.replace(/<[^>]*>?/gm, '').trim() || img.getAttribute('alt')?.trim();
                    if (!title || title.length < 2) title = href.split('/').pop()?.replace(/-/g, ' ') || 'Sindhi Book';

                    if (!booksMap.has(fullLink)) {
                        booksMap.set(fullLink, {
                            id: `sl-${fullLink}`,
                            title: title,
                            author_name: 'Sindh Library',
                            cover_url: fullImg,
                            link: fullLink,
                            source: 'Sindh Library'
                        });
                    }
                }
            });
            return Array.from(booksMap.values()).slice(0, 8);
        } catch (error) {
            console.error('Sindh Library error:', error);
            return [];
        }
    };

    const loadInitialData = async () => {
        setInitialLoading(true);
        const [olBooks, slBooks] = await Promise.all([
            fetchOpenLibrary('programming OR science OR history', 8),
            fetchSindhLibrary('')
        ]);
        setPopularBooks(olBooks);
        setSindhBooks(slBooks);
        setInitialLoading(false);
    };

    useEffect(() => {
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setHasSearched(false);
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        const [olResults, slResults] = await Promise.all([
            fetchOpenLibrary(q, 16),
            fetchSindhLibrary(q)
        ]);

        // Merge & alternate results
        const merged: Book[] = [];
        const maxLength = Math.max(olResults.length, slResults.length);
        for (let i = 0; i < maxLength; i++) {
            if (slResults[i]) merged.push(slResults[i]);
            if (olResults[i]) merged.push(olResults[i]);
        }

        setSearchResults(merged);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (debouncedQuery !== undefined) {
            performSearch(debouncedQuery);
        }
    }, [debouncedQuery, performSearch]);

    const titleText = isSindhi ? "دنيا جي لائبريري" : "Global Library Search";
    const descText = isSindhi
        ? "مختلف ويبسائيٽن تي وڃڻ کان بچو. هتي هڪ ئي جڳھ تي توهان دنيا جي مختلف لائبريرين مان آنلائن ڪتاب ڳولي سگهو ٿا."
        : "Search across multiple global libraries from one place including Open Library and Sindh Library.";

    return (
        <div className="pt-24 pb-20 bg-brand-bg min-h-screen">
            <PageHeader
                title={titleText}
                description={descText}
                icon={<LibraryIcon className="w-12 h-12 text-brand-accent" />}
            />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-16 relative z-20">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-brand-secondary group-focus-within:text-brand-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="block w-full pl-12 pr-12 py-4 bg-brand-surface border-2 border-brand-border rounded-ios-lg text-lg focus:outline-none focus:border-brand-accent transition-all shadow-sm text-brand-primary"
                            placeholder={isSindhi ? "ڪتاب يا مصنف جو نالو لکو..." : "Search for books, authors, or topics..."}
                            dir="auto"
                        />
                        {loading && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <Loader2 className="w-5 h-5 animate-spin text-brand-accent" />
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-6 flex items-center justify-center gap-2 flex-wrap text-sm text-brand-secondary">
                        <span>Powered by:</span>
                        <span className="font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 text-xs">OpenLibrary</span>
                        <span className="font-bold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20 text-xs">Sindh Library</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* SEARCH RESULTS */}
                    {hasSearched ? (
                        <motion.div
                            key="search-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <SectionHeader
                                title={isSindhi ? "ڳولها جا نتيجا" : "Search Results"}
                                icon={<Search className="w-5 h-5" />}
                            />
                            {loading ? (
                                <BookSkeletonGrid />
                            ) : searchResults.length > 0 ? (
                                <BookGrid books={searchResults} isSindhi={isSindhi} />
                            ) : (
                                <EmptyState isSindhi={isSindhi} />
                            )}
                        </motion.div>
                    ) : (
                        /* DISCOVER VIEW */
                        <motion.div
                            key="discover-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-16"
                        >
                            {/* Sindh Books Section */}
                            <div>
                                <SectionHeader
                                    title={isSindhi ? "سنڌي ۽ اُردو ڪتاب (Sindh Library)" : "Sindhi & Urdu Books"}
                                    icon={<Flame className="w-5 h-5" />}
                                />
                                {initialLoading ? <BookSkeletonGrid rows={1} /> : <BookGrid books={sindhBooks} isSindhi={isSindhi} />}
                            </div>

                            {/* Global Collection Section */}
                            <div>
                                <SectionHeader
                                    title={isSindhi ? "مشهور عالمي ڪتاب" : "Global Popular Collection"}
                                    icon={<Globe className="w-5 h-5" />}
                                />
                                {initialLoading ? <BookSkeletonGrid rows={1} /> : <BookGrid books={popularBooks} isSindhi={isSindhi} />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

// ---------------- Helper Components ----------------

function SectionHeader({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-brand-border/50">
            <div className="p-2 bg-brand-surface rounded-lg text-brand-accent">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-brand-primary tracking-tight">{title}</h2>
        </div>
    );
}

function BookGrid({ books, isSindhi }: { books: Book[], isSindhi: boolean }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book, idx) => (
                <motion.div
                    key={book.id + idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % 8) * 0.05 }}
                    className="ios-card bg-brand-surface group flex flex-col overflow-hidden hover:border-brand-accent/50"
                >
                    <div className="aspect-[2/3] bg-brand-bg relative overflow-hidden flex items-center justify-center">
                        {book.cover_url ? (
                            <img
                                src={book.cover_url}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        ) : (
                            <BookOpen className="w-12 h-12 text-brand-border" />
                        )}

                        {/* Source Badge */}
                        <div className="absolute top-2 left-2 z-10">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-md shadow-sm border ${book.source === 'Open Library'
                                    ? 'bg-emerald-500/80 text-white border-emerald-400/50'
                                    : 'bg-blue-500/80 text-white border-blue-400/50'
                                }`}>
                                {book.source}
                            </span>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                            <a
                                href={book.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-accent text-white py-2 rounded-lg font-bold flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md text-sm"
                            >
                                {isSindhi ? "وڌيڪ ڏسو" : "View Details"}
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-brand-primary line-clamp-2 mb-1" title={book.title} dir="auto">
                                {book.title}
                            </h3>
                            <p className="text-brand-secondary text-xs line-clamp-1 flex items-center gap-1" dir="auto">
                                {book.author_name}
                            </p>
                        </div>
                        {book.first_publish_year && (
                            <div className="mt-3 pt-3 border-t border-brand-border/50">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
                                    {isSindhi ? 'ڇپيل:' : 'Published:'} {book.first_publish_year}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function BookSkeletonGrid({ rows = 2 }: { rows?: number }) {
    const count = rows * 4;
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="ios-card bg-brand-surface overflow-hidden flex flex-col animate-pulse">
                    <div className="aspect-[2/3] bg-brand-bg/50" />
                    <div className="p-4 flex flex-col gap-2">
                        <div className="h-4 bg-brand-bg rounded w-3/4" />
                        <div className="h-3 bg-brand-bg rounded w-1/2" />
                        <div className="mt-2 pt-2 border-t border-brand-border/50">
                            <div className="h-2 bg-brand-bg rounded w-1/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ isSindhi }: { isSindhi: boolean }) {
    return (
        <div className="text-center bg-brand-surface border border-brand-border rounded-ios-lg py-20 px-4">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-brand-secondary/30" />
            <p className="text-xl font-bold mb-2 text-brand-primary">
                {isSindhi ? "ڪو به نتيجو نه مليو" : "No results found"}
            </p>
            <p className="text-brand-secondary text-sm">
                {isSindhi ? "مھرباني ڪري ڪو ٻيو نالو يا لفظ لکي ڳولھا ڪريو." : "Try adjusting your search terms or keywords."}
            </p>
        </div>
    );
}
