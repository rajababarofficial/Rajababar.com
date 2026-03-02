import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { BookOpen, Archive, Library as LibIcon, Book as BookPlaceholder, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import SEO from '@/src/components/layout/SEO';

export default function Library() {
  const { isSindhi } = useLanguage();
  const navigate = useNavigate();

  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 4 books per row * 3 rows

  useEffect(() => {
    const fetchAllData = async () => {
      const sindhCsv = "/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv";
      const archiveCsv = "/archive.org/sindh-library.csv";

      try {
        const [res1, res2] = await Promise.all([
          fetch(sindhCsv).then(r => r.text()),
          fetch(archiveCsv).then(r => r.text())
        ]);

        const data1 = Papa.parse(res1, { header: true }).data
          .filter((b: any) => b["Title (Sindhi)"] || b["Title (English)"])
          .map((b: any) => ({
            ...b,
            source: 'sindh',
            displayTitle: isSindhi ? b["Title (Sindhi)"] : (b["Title (English)"] || b["Title (Sindhi)"]),
            displayAuthor: isSindhi ? b["Author (Sindhi)"] : (b["Author (English)"] || b["Author (Sindhi)"]),
            id: b["#"] || b["id"],
            img: b["Thumbnail"]
          }));

        const data2 = Papa.parse(res2, { header: true }).data
          .filter((b: any) => b["title"] || b["identifier"])
          .map((b: any) => ({
            ...b,
            source: 'archive',
            displayTitle: b["title"] || "Untitled",
            displayAuthor: b["creator"] || "Unknown Author",
            id: b["identifier"],
            img: `https://archive.org/services/img/${b["identifier"]}`
          }));

        setAllBooks([...data1, ...data2]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [isSindhi]);

  const totalPages = Math.ceil(allBooks.length / itemsPerPage);
  const currentBooks = allBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination Numbers Logic (Shows 1, 2, 3... up to 7 or current context)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    let start = Math.max(1, currentPage - 3);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'} className="pt-24 pb-20 bg-brand-bg min-h-screen">
      <SEO
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi
          ? "سنڌ جي تمام وڏي لائبريرين جو گڏيل مجموعو. هزارين سنڌي ڪتاب مفت ڊائون لوڊ ڪريو."
          : "The largest collection of Sindh's digital libraries. Download thousands of free Sindhi and English PDF books curated by Raja Babar."}
      />
      <PageHeader
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi ? "سنڌ جي تمام وڏي لائبريرين جو گڏيل مجموعو." : "The largest collection of Sindh's digital libraries."}
        icon={<BookOpen className="w-12 h-12 text-brand-accent" />}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">

        {/* TOP BAR WITH COUNTER & TABS */}
        <div className="glass p-6 rounded-[2rem] border border-brand-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/sindh-library')} className="flex-1 px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-primary font-bold hover:border-brand-accent transition-all flex items-center justify-center gap-2">
              <LibIcon className="w-4 h-4 text-brand-accent" />
              <span className={isSindhi ? "font-sindhi" : ""}>{isSindhi ? "سنڌ لائبريري" : "lib.sindh.org"}</span>
            </button>
            <button onClick={() => navigate('/archive-library')} className="flex-1 px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-primary font-bold hover:border-brand-accent transition-all flex items-center justify-center gap-2">
              <Archive className="w-4 h-4 text-brand-accent" />
              <span className={isSindhi ? "font-sindhi" : ""}>{isSindhi ? "آرڪائيو لائبريري" : "Archive.org"}</span>
            </button>
          </div>
          <div className="px-6 py-3 bg-brand-accent/10 border border-brand-accent/20 rounded-full">
            <p className={cn("text-brand-accent font-bold", isSindhi && "font-sindhi")}>
              {isSindhi ? "ڪُل ڪتاب:" : "Total Books:"} <span className="text-brand-primary ml-2">{allBooks.length.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* 4-COLUMN GRID (3 Rows of 4 = 12 Books) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[3/4.5] bg-brand-surface/50 animate-pulse rounded-2xl" />)
          ) : (
            currentBooks.map((book, i) => (
              <div
                key={`${book.source}-${i}`}
                onClick={() => navigate(book.source === 'sindh' ? `/library/${book.id}` : `/archive-library/${book.id}`)}
                className="group bg-brand-surface rounded-[2rem] border border-brand-border overflow-hidden hover:border-brand-accent transition-all shadow-xl flex flex-col h-full cursor-pointer hover:-translate-y-2"
              >
                <div className="aspect-[3/4.5] relative overflow-hidden bg-brand-bg">
                  <img src={book.img} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-brand-primary font-bold">{book.source.toUpperCase()}</div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className={cn("text-brand-primary font-bold text-sm mb-2 line-clamp-2", isSindhi && "font-sindhi text-lg")}>{book.displayTitle}</h3>
                  <p className={cn("text-brand-secondary text-xs mt-auto", isSindhi && "font-sindhi")}>{book.displayAuthor}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* NUMERIC PAGINATION (1 2 3 ... 7 Style) */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-12 py-8 border-t border-brand-border/30">
            <button
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3 text-brand-secondary hover:text-brand-accent disabled:opacity-20 transition-colors"
            >
              <ChevronLeft className={isSindhi ? "rotate-180" : ""} />
            </button>

            {getPageNumbers().map(num => (
              <button
                key={num}
                onClick={() => { setCurrentPage(num); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={cn(
                  "w-12 h-12 rounded-xl font-bold transition-all shadow-lg",
                  currentPage === num
                    ? "bg-brand-accent text-brand-primary scale-110 shadow-brand-accent/20"
                    : "bg-brand-surface text-brand-secondary border border-brand-border hover:border-brand-accent"
                )}
              >
                {num}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-3 text-brand-secondary hover:text-brand-accent disabled:opacity-20 transition-colors"
            >
              <ChevronRight className={isSindhi ? "rotate-180" : ""} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}