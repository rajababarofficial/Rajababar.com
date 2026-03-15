import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Book as BookIcon,
  Calendar,
  Building2,
  Globe2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Info
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";
import { getDatabase } from "@/src/utils/db";
import ShareButton from "@/src/components/ShareButton";
import SEO from "@/src/components/layout/SEO";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSindhi } = useLanguage();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const db = await getDatabase();
        
        // ID ذريعي ڪتاب ڳوليو
        const query = `SELECT * FROM Books WHERE id = '${id}' OR identifier = '${id}' LIMIT 1`;
        const result = db.exec(query);

        if (result.length > 0) {
          const row = result[0].values[0];
          const columns = result[0].columns;
          const bookData: any = {};
          
          columns.forEach((col, i) => {
            bookData[col] = row[i];
          });

          // --- ARCHIVE.ORG FALLBACK LOGIC ---
          if (!bookData.link || bookData.link.trim() === "") {
            bookData.link = bookData.identifier ? `https://archive.org/details/${bookData.identifier}` : "#";
          }
          if (!bookData.thumbnail || bookData.thumbnail.trim() === "") {
            bookData.thumbnail = bookData.identifier ? `https://archive.org/services/img/${bookData.identifier}` : null;
          }

          setBook(bookData);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
      <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
      <p className={cn("text-brand-secondary", isSindhi && "font-sindhi")}>
        {isSindhi ? "ڪتاب جي معلومات لوڊ ٿي رهي آهي..." : "Loading book details..."}
      </p>
    </div>
  );

  if (!book) return (
    <div className="text-center py-20 bg-brand-bg min-h-screen flex flex-col items-center justify-center gap-6">
      <Info className="w-16 h-16 text-brand-secondary/20" />
      <p className={cn("text-brand-primary text-2xl", isSindhi && "font-sindhi")}>
        {isSindhi ? "ڪتاب نه مليو." : "Book not found."}
      </p>
      <button onClick={() => navigate(-1)} className="text-brand-accent hover:underline">Go Back</button>
    </div>
  );

  const displayTitle = isSindhi ? (book.title_sd || book.title_en) : (book.title_en || book.title_sd);
  const displayAuthor = isSindhi ? (book.author_sd || book.author_en) : (book.author_en || book.author_sd);

  return (
    <div dir={isSindhi ? "rtl" : "ltr"} className="min-h-screen pt-24 pb-12 bg-brand-bg px-4 sm:px-6">
      <SEO 
        title={`${displayTitle} - MHPISSJ Library`}
        description={isSindhi ? `${displayTitle} پاران ${displayAuthor}.` : `${displayTitle} by ${displayAuthor}.`}
      />

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-8 transition-all group py-2"
        >
          {isSindhi ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
          <span className={cn("font-bold text-sm", isSindhi && "font-sindhi text-xl")}>
            {isSindhi ? "واپس وڃو" : "Back"}
          </span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Book Cover */}
          <div className="w-full lg:w-[380px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden shadow-2xl bg-brand-surface border border-brand-border mx-auto max-w-[320px] lg:max-w-full"
            >
              {book.thumbnail ? (
                <img src={book.thumbnail} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-brand-surface text-brand-secondary opacity-30">
                  <BookIcon className="w-20 h-20 mb-4" />
                  <span className="uppercase tracking-widest text-xs font-bold">No Preview</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Details Section */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-brand-accent/20 shadow-sm">
                {book.category || (isSindhi ? "جنرل" : "General")}
              </span>

              <div className="space-y-4">
                <h1 className={cn("text-brand-primary leading-[1.2] font-bold text-4xl sm:text-5xl lg:text-6xl", isSindhi && "font-sindhi")}>
                  {isSindhi ? book.title_sd : book.title_en}
                </h1>
                
                {/* Secondary Title (Opposite Language) */}
                <p className={cn("text-xl text-brand-secondary opacity-60", !isSindhi && "font-sindhi")}>
                  {isSindhi ? book.title_en : book.title_sd}
                </p>

                <div className="pt-4 flex items-center gap-3">
                  <div className="w-10 h-0.5 bg-brand-accent/30" />
                  <p className={cn("text-2xl text-brand-accent font-medium", isSindhi && "font-sindhi")}>
                    <span className="text-brand-secondary/60 text-lg">{isSindhi ? "ليکڪ:" : "Author:"}</span> {displayAuthor}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-brand-surface/30 border border-brand-border rounded-[2rem] backdrop-blur-md shadow-inner">
              <div className="space-y-2">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-brand-accent" /> {isSindhi ? "پبلشر" : "Publisher"}
                </p>
                <p className="text-sm font-bold text-brand-primary truncate">{book.publisher || "---"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-brand-accent" /> {isSindhi ? "سال" : "Year"}
                </p>
                <p className="text-sm font-bold text-brand-primary">{book.year || "---"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2">
                  <Globe2 size={14} className="text-brand-accent" /> {isSindhi ? "ٻولي" : "Language"}
                </p>
                <p className="text-sm font-bold text-brand-primary uppercase tracking-tighter">{book.language || "N/A"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full h-16 bg-brand-accent text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 active:scale-[0.98] transition-all text-lg",
                  isSindhi && "font-sindhi text-2xl"
                )}
              >
                <Download size={22} />
                {isSindhi ? "ڪتاب پڙهو يا ڊائون لوڊ ڪريو" : "Read or Download PDF"}
              </a>

              <div className="grid grid-cols-2 gap-4">
                <ShareButton
                  title={displayTitle}
                  text={`${isSindhi ? 'هي ڪتاب ڏسو' : 'Check out this book'}: ${displayTitle}`}
                  url={window.location.href}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-brand-border hover:bg-brand-surface"
                  label={isSindhi ? "پيج شيئر" : "Share Page"}
                />

                <ShareButton
                  title={displayTitle}
                  text={displayTitle}
                  url={book.link}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-brand-border hover:bg-brand-surface text-brand-accent"
                  isPDF={true}
                  label={isSindhi ? "PDF لنڪ" : "PDF Link"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}