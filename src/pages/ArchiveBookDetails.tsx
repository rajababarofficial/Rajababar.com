import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Link ki jagah useNavigate
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
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";

export default function ArchiveBookDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // History navigate karne ke liye
  const { isSindhi } = useLanguage();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState<'page' | 'archive' | null>(null);

  useEffect(() => {
    const csvPath = "/archive.org/sindh-library.csv";
    Papa.parse(csvPath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        const found = results.data.find((row: any) => 
          String(row.identifier || row.id).trim() === String(id).trim()
        );
        if (found) {
          setBook(found);
        }
        setLoading(false);
      }
    });
  }, [id]);

  const handleShare = async (type: 'page' | 'archive') => {
    const url = type === 'page' ? window.location.href : `https://archive.org/details/${book.identifier}`;
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: isSindhi ? book["Title (Sindhi)"] : book["Title (English)"],
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
  
  if (!book) return <div className="text-center py-20 bg-brand-bg min-h-screen font-sindhi text-white">ڪتاب نه مليو.</div>;

  const archiveThumbnail = `https://archive.org/services/img/${book.identifier}`;

  return (
    <div dir={isSindhi ? "rtl" : "ltr"} className="min-h-screen pt-24 pb-12 bg-brand-bg px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Modern Back Button - navigate(-1) ensures position is kept */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-8 transition-all group py-2"
        >
          {isSindhi ? (
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          )}
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
              className="relative aspect-[3/4.5] rounded-[2rem] overflow-hidden shadow-2xl bg-brand-surface border border-brand-border mx-auto max-w-[320px] lg:max-w-full"
            >
              <img 
                src={archiveThumbnail} 
                className="w-full h-full object-cover" 
                alt="Book Cover"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x600?text=No+Cover")} 
              />
            </motion.div>
          </div>

          {/* Right: Details Section */}
          <div className="flex-1 space-y-8 text-white">
            
            <span className="inline-block px-3 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-widest rounded-md border border-brand-accent/20">
              Archive ID: {book.identifier}
            </span>

            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="font-sindhi text-4xl sm:text-5xl lg:text-6xl text-brand-primary leading-[1.3] text-white">
                  {book["Title (Sindhi)"] || book["Title (English)"]}
                </h1>
                <p className="font-sindhi text-2xl text-brand-accent">
                  <span className="text-brand-secondary opacity-70">ليکڪ:</span> {book["Author (Sindhi)"] || book["Author (English)"]}
                </p>
              </div>

              <div dir="ltr" className="space-y-1 border-l-2 border-brand-border/50 pl-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white/80 tracking-tight">
                  {book["Title (English)"]}
                </h2>
                <p className="text-sm sm:text-base text-brand-secondary italic uppercase tracking-wider">
                  by {book["Author (English)"]}
                </p>
              </div>
            </div>

            {/* Meta Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-brand-surface/40 border border-brand-border rounded-2xl backdrop-blur-sm">
               <div className="space-y-1">
                  <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {isSindhi ? "پبلشر" : "Publisher"}
                  </p>
                  <p dir="ltr" className={cn("text-sm font-bold text-white", isSindhi && "text-right md:text-left")}>
                    {book.Publisher || "N/A"}
                  </p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {isSindhi ? "سال" : "Year"}
                  </p>
                  <p className="text-sm font-bold text-white">{book.Year || "N/A"}</p>
               </div>
               <div className="space-y-1 col-span-2 md:col-span-1">
                  <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-tighter opacity-60 flex items-center gap-1">
                    <Globe2 className="w-3 h-3" /> {isSindhi ? "ٻولي" : "Language"}
                  </p>
                  <p className="text-sm font-bold text-white uppercase">{book.Language || "Sindhi"}</p>
               </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <a 
                href={`https://archive.org/download/${book.identifier}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "w-full h-16 bg-brand-accent text-white rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-brand-accent/20 active:scale-95 transition-all text-lg hover:brightness-110",
                  isSindhi && "font-sindhi text-2xl"
                )}
              >
                <Download className="w-5 h-5" />
                {isSindhi ? "ڪتاب ڊائون لوڊ ڪريو" : "Download PDF"}
              </a>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleShare('page')}
                  className="flex items-center justify-center gap-2 h-14 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-all relative overflow-hidden text-xs font-bold text-white"
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

                <a 
                  href={`https://archive.org/details/${book.identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-14 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-all text-xs font-bold text-white"
                >
                  <BookOpen className="w-4 h-4 text-brand-accent" />
                  <span className={isSindhi ? "font-sindhi text-lg" : ""}>{isSindhi ? "آن لائن پڙهو" : "Read Online"}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}