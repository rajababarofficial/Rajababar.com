import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Database,
  Calendar,
  Building2,
  FolderOpen,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Info,
  FileText,
  Clock,
  HardDrive,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";
import ShareButton from "@/src/components/ShareButton";
import SEO from "@/src/components/layout/SEO";
import Book3D from "@/src/components/Book3D";

export default function MegaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSindhi } = useLanguage();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/archive/details?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch item details");
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching archival details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-4">
      <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
      <p className={cn("text-brand-secondary", isSindhi && "font-sindhi")}>
        {isSindhi ? "معلومات لوڊ ٿي رهي آهي..." : "Loading archival record details..."}
      </p>
    </div>
  );

  if (!item) return (
    <div className="text-center py-20 bg-brand-bg min-h-screen flex flex-col items-center justify-center gap-6">
      <Info className="w-16 h-16 text-brand-secondary/20" />
      <p className={cn("text-brand-primary text-2xl", isSindhi && "font-sindhi")}>
        {isSindhi ? "رڪارڊ نه مليو." : "Archival record not found."}
      </p>
      <button onClick={() => navigate(-1)} className="text-brand-accent hover:underline">Go Back</button>
    </div>
  );

  const displayTitle = item.title || item.file_name;
  const displayAuthor = item.author || "Unknown";

  return (
    <div dir="ltr" className="min-h-screen pt-24 pb-12 bg-brand-bg px-4 sm:px-6">
      <SEO 
        title={`${displayTitle} - Mega Archive`}
        description={`Archival record of ${displayTitle} from the Institute's ledger.`}
      />

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-8 transition-all group py-2"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Archive</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Visualization (Book3D if book-like, else Icon) */}
          <div className="w-full lg:w-[380px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden mx-auto max-w-[320px] lg:max-w-full flex items-center justify-center p-4 bg-brand-surface/20 border border-brand-border/40"
            >
              <Book3D 
                title={displayTitle} 
                thumbnailUrl={item.thumb_path} 
                className="w-full h-full"
              />
            </motion.div>
          </div>

          {/* Right: Details Section */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-brand-accent/20 shadow-sm">
                  Mega Archive
                </span>
                <span className="inline-block px-4 py-1.5 bg-brand-border/10 text-brand-secondary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-brand-border/20 shadow-sm">
                  #{item.id}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-brand-primary leading-[1.2] font-bold text-4xl sm:text-5xl lg:text-6xl">
                  {displayTitle}
                </h1>
                
                <p className="text-lg text-brand-accent font-medium">
                  <span className="text-brand-secondary/60 text-sm">Author/Attributed:</span> {displayAuthor}
                </p>
              </div>
            </div>

            {/* Meta Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-brand-surface/30 border border-brand-border rounded-[2rem] backdrop-blur-md shadow-inner">
               <div className="space-y-2 text-left">
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-brand-accent" /> Total Pages
                </p>
                <p className="text-sm font-bold text-brand-primary truncate">{item.pages || "---"}</p>
              </div>
              <a 
                href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "space-y-2 text-left block group transition-all",
                  !item.folder_node && "pointer-events-none opacity-50"
                )}
              >
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2 group-hover:text-brand-accent">
                  <FolderOpen size={14} className="text-brand-accent" /> {isSindhi ? "فولڊر لنڪ" : "Folder Link"}
                </p>
                <p className="text-sm font-bold text-brand-primary truncate flex items-center gap-2">
                   {isSindhi ? "فولڊر کوليو" : "Open Folder"}
                   <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </a>
              <a 
                href={item.file_node ? `https://mega.nz/fm/${item.file_node}` : "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "space-y-2 text-left block group transition-all",
                  !item.file_node && "pointer-events-none opacity-50"
                )}
              >
                <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest flex items-center gap-2 group-hover:text-brand-accent">
                  <HardDrive size={14} className="text-brand-accent" /> {isSindhi ? "فائيل لنڪ" : "File Link"}
                </p>
                <p className="text-sm font-bold text-brand-primary truncate flex items-center gap-2">
                   {isSindhi ? "فائيل کوليو" : "Open File"}
                   <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </a>
            </div>

            <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border/50">
                <h4 className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-3">System File Name</h4>
                <code className="text-xs text-brand-accent break-all bg-brand-surface p-3 rounded-lg block font-mono">
                    {item.file_name}
                </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              {/* placeholder if link exists in custom_data or logic */}
              <button
                disabled
                className="w-full h-16 bg-brand-surface text-brand-secondary rounded-2xl flex items-center justify-center gap-3 font-bold cursor-not-allowed opacity-60 text-lg border border-brand-border"
              >
                <Download size={22} />
                Asset Protected (Local Copy Only)
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ShareButton
                  title={displayTitle}
                  text={`Archival record: ${displayTitle}`}
                  url={window.location.href}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-brand-border hover:bg-brand-surface"
                  label="Share Record"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
