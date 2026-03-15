import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Library, Search, Loader2, AlertCircle, BookOpen, ExternalLink, Book as BookIcon } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';
import { getDatabase } from '@/src/utils/db';

export default function BooksPage() {
  const { isSindhi } = useLanguage();
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Calling getDatabase()...");
      const db = await getDatabase();
      
      const safeQuery = query.replace(/'/g, "''").trim();
      const sqlQuery = safeQuery
        ? `SELECT * FROM Books WHERE title_en LIKE '%${safeQuery}%' OR title_sd LIKE '%${safeQuery}%' OR author_en LIKE '%${safeQuery}%' OR author_sd LIKE '%${safeQuery}%' LIMIT 50`
        : `SELECT * FROM Books ORDER BY id DESC LIMIT 50`;

      console.log("Running Query:", sqlQuery);
      const result = db.exec(sqlQuery);
      
      if (result.length > 0) {
        const rows = result[0].values.map((row: any) => {
          const obj: any = {};
          result[0].columns.forEach((col: string, i: number) => {
            obj[col] = row[i];
          });
          return obj;
        });
        setBooks(rows);
      } else {
        setBooks([]);
      }
    } catch (err: any) {
      console.error("BooksPage Error:", err);
      setError(isSindhi ? "ڊيٽابيس مان ڪتاب لوڊ نه ٿي سگهيا." : "Failed to load books from database.");
    } finally {
      setLoading(false);
    }
  }, [isSindhi]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'} className="pt-24 pb-20 bg-brand-bg min-h-screen font-sans">
      <PageHeader
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi ? "ايم. ايڇ پنهور انسٽيٽيوٽ پاران هزارين ڪتابن جو مجموعو." : "Collection of books from M. H. Panhwar Institute."}
        icon={<Library className="w-12 h-12 text-brand-accent" />}
      />

      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="relative max-w-2xl mx-auto mb-12">
          <input
            type="text"
            value={searchTerm}
            className={cn("w-full px-6 py-4 bg-brand-surface/20 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary", isSindhi && "font-sindhi text-lg pr-14", !isSindhi && "pl-14")}
            placeholder={isSindhi ? "ڪتاب يا ليکڪ ڳوليو..." : "Search title or author..."}
            onChange={(e) => { setSearchTerm(e.target.value); loadBooks(e.target.value); }}
          />
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-brand-secondary", isSindhi ? "right-5" : "left-5")} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 text-brand-accent animate-spin mb-4" />
            <p className={isSindhi ? "font-sindhi text-xl" : ""}>{isSindhi ? "ڊيٽا لوڊ ٿي رهي آهي..." : "Loading database..."}</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <div key={book.id} className="p-6 bg-brand-surface/40 border border-brand-border rounded-[2rem] hover:border-brand-accent/50 transition-all">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center mb-4 text-brand-accent">
                  {book.thumbnail ? <img src={book.thumbnail} className="w-full h-full object-cover rounded-xl" /> : <BookIcon className="w-5 h-5" />}
                </div>
                <h3 className={cn("text-xl font-bold text-brand-primary mb-2 line-clamp-2", isSindhi && "font-sindhi text-2xl")}>
                  {isSindhi ? (book.title_sd || book.title_en) : (book.title_en || book.title_sd)}
                </h3>
                <p className={cn("text-brand-secondary text-sm mb-4", isSindhi && "font-sindhi text-lg")}>
                  {isSindhi ? (book.author_sd || book.author_en) : (book.author_en || book.author_sd)}
                </p>
                <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
                  <span className="text-xs text-brand-secondary">ID: {book.id}</span>
                  {book.link && (
                    <a href={book.link} target="_blank" className="flex items-center gap-2 text-brand-accent hover:underline font-medium">
                      {isSindhi ? "پڙھو" : "Read More"} <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}