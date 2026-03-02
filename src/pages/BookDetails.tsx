import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate add kiya
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Book as BookIcon,
  Calendar,
  Building2,
  Globe2,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // Navigation handle karne ke liye
  const { isSindhi } = useLanguage();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState<'page' | 'pdf' | null>(null);

  useEffect(() => {
    const csvPath = "/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv";
    Papa.parse(csvPath, {
      header: true,
      download: true,
      complete: (results) => {
        const found = results.data.find((row: any) => (row["#"] || row["id"]) === id);
        if (found) {
          const bookData = {
            title_en: found["Title (English)"],
            title_sd: found["Title (Sindhi)"],
            author_en: found["Author (English)"],
            author_sd: found["Author (Sindhi)"],
            year: found["Year"],
            publisher: found["Publisher"],
            category: found["Category"],
            language: found["Language"],
            link: found["Link"],
            thumbnail: found["Thumbnail"]
          };
          setBook(bookData);

          // Update SEO Title and Meta Description
          const pageTitle = isSindhi ? `${bookData.title_sd} - سنڌ لئبريري` : `${bookData.title_en} - Sindh Library`;
          document.title = pageTitle;

          const description = isSindhi
            ? `${bookData.title_sd} ليکڪ ${bookData.author_sd}. مفت PDF ڊائون لوڊ ڪريو سنڌ لئبريري تان.`
            : `Download PDF ${bookData.title_en} by ${bookData.author_en} from Sindh Library for free.`;

          let metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', description);
          } else {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            metaDescription.setAttribute('content', description);
            document.head.appendChild(metaDescription);
          }
        }
        setLoading(false);
      }
    });
  }, [id, isSindhi]);

  const handleShare = async (type: 'page' | 'pdf') => {
    const url = type === 'page' ? window.location.href : book.link;
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: isSindhi ? book.title_sd : book.title_en,
          url: url
        });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!book) return <div className="text-center py-20 bg-brand-bg min-h-screen font-sindhi text-brand-primary">ڪتاب نه مليو.</div>;

  return (
    <div dir={isSindhi ? "rtl" : "ltr"} className="min-h-screen pt-24 pb-12 bg-brand-bg px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Updated Back Button: navigate(-1) ensures user returns to their previous scroll/page position */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-8 transition-all group py-2"
        >
          {isSindhi ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
          <span className={cn("font-bold text-sm", isSindhi && "font-sindhi text-2xl")}>
            {isSindhi ? "واپس" : "Back"}
          </span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left: Book Cover */}
          <div className="w-full lg:w-[380px] shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4.5] sm:aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl bg-brand-surface border border-brand-border mx-auto max-w-[320px] lg:max-w-full"
            >
              {book.thumbnail ? (
                <img src={book.thumbnail} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10 bg-brand-bg">
                  <BookIcon className="w-24 h-24 text-brand-primary" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Details Section */}
          <div className="flex-1 space-y-8">

            <span className="inline-block px-3 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-widest rounded-md border border-brand-accent/20">
              {book.category}
            </span>

            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="font-sindhi text-4xl sm:text-5xl lg:text-6xl text-brand-primary leading-[1.3] text-brand-primary">
                  {book.title_sd}
                </h1>
                <p className="font-sindhi text-2xl text-brand-accent">
                  <span className="text-brand-secondary opacity-70">ليکڪ:</span> {book.author_sd}
                </p>
              </div>

              <div dir="ltr" className="space-y-1 border-l-2 border-brand-border/50 pl-4">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-primary/80 tracking-tight">
                  {book.title_en}
                </h2>
                <p className="text-sm sm:text-base text-brand-secondary italic uppercase tracking-wider">
                  by {book.author_en}
                </p>
              </div>
            </div>

            {/* Meta Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-brand-surface/40 border border-brand-border rounded-2xl backdrop-blur-sm">
              <div className="space-y-1">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {isSindhi ? "پبلشر" : "Publisher"}
                </p>
                <p dir="ltr" className={cn("text-sm font-bold text-brand-primary", isSindhi && "text-right md:text-left")}>
                  {book.publisher}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {isSindhi ? "سال" : "Year"}
                </p>
                <p className="text-sm font-bold text-brand-primary">{book.year}</p>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                  <Globe2 className="w-3 h-3" /> {isSindhi ? "ٻولي" : "Language"}
                </p>
                <p className="text-sm font-bold text-brand-primary">{book.language}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full h-16 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-brand-accent/20 active:scale-95 transition-all text-lg",
                  isSindhi && "font-sindhi text-2xl"
                )}
              >
                <Download className="w-5 h-5" />
                {isSindhi ? "ڪتاب ڊائون لوڊ ڪريو" : "Download PDF"}
              </a>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('page')}
                  className="flex items-center justify-center gap-2 h-14 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-all relative overflow-hidden text-xs font-bold text-brand-primary"
                >
                  <AnimatePresence mode="wait">
                    {copiedType === 'page' ? (
                      <motion.div key="c1" initial={{ y: 10 }} animate={{ y: 0 }} className="text-green-500 flex items-center gap-1">
                        <Check className="w-4 h-4" /> {isSindhi ? "ڪاپي ٿي ويو" : "Copied"}
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-brand-accent" />
                        <span className={isSindhi ? "font-sindhi text-lg" : ""}>{isSindhi ? "پيج شيئر" : "Share Page"}</span>
                      </div>
                    )}
                  </AnimatePresence>
                </button>

                <button
                  onClick={() => handleShare('pdf')}
                  className="flex items-center justify-center gap-2 h-14 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-all relative overflow-hidden text-xs font-bold text-brand-primary"
                >
                  <AnimatePresence mode="wait">
                    {copiedType === 'pdf' ? (
                      <motion.div key="c2" initial={{ y: 10 }} animate={{ y: 0 }} className="text-green-500 flex items-center gap-1">
                        <Check className="w-4 h-4" /> {isSindhi ? "ڪاپي ٿي ويو" : "Copied"}
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-brand-accent" />
                        <span className={isSindhi ? "font-sindhi text-lg" : ""}>{isSindhi ? "PDF لنڪ" : "Direct PDF"}</span>
                      </div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}