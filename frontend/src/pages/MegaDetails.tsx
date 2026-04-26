import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  Building2,
  FolderOpen,
  ArrowLeft,
  Loader2,
  Info,
  FileText,
  HardDrive,
  ExternalLink,
  Globe,
  User,
  Tag,
  ScanLine,
  BookMarked,
  Hash,
  StickyNote
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";
import ShareButton from "@/src/components/ShareButton";
import SEO from "@/src/components/layout/SEO";
import Book3D from "@/src/components/Book3D";
import { getApiUrl } from "@/src/utils/api";

// custom_data ke har field ka icon aur label
const META_FIELD_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  DateOfPublication: { label: "Date of Publication", icon: <Calendar size={14} className="text-brand-accent" /> },
  Language: { label: "Language", icon: <Globe size={14} className="text-brand-accent" /> },
  language: { label: "Language", icon: <Globe size={14} className="text-brand-accent" /> },
  PublishedBy: { label: "Published By", icon: <Building2 size={14} className="text-brand-accent" /> },
  "PublishedBy ": { label: "Published By", icon: <Building2 size={14} className="text-brand-accent" /> },
  ScannedBy: { label: "Scanned By", icon: <ScanLine size={14} className="text-brand-accent" /> },
  "ScannedBy ": { label: "Scanned By", icon: <ScanLine size={14} className="text-brand-accent" /> },
  DigitizedBy: { label: "Digitized By", icon: <User size={14} className="text-brand-accent" /> },
  Keywords: { label: "Keywords", icon: <Tag size={14} className="text-brand-accent" /> },
  Website: { label: "Website", icon: <Globe size={14} className="text-brand-accent" /> },
  SindhologyCN: { label: "Sindhology CN", icon: <Hash size={14} className="text-brand-accent" /> },
  Note: { label: "Note", icon: <StickyNote size={14} className="text-brand-accent" /> },
  Languge: { label: "Language (raw)", icon: <Globe size={14} className="text-brand-accent" /> },
};

function CustomDataFields({ customData }: { customData: Record<string, any> }) {
  if (!customData || Object.keys(customData).length === 0) return null;

  return (
    <div className="p-6 bg-brand-surface/30 border border-brand-border rounded-[2rem] space-y-1">
      <h4 className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-4">
        Publication Details
      </h4>
      <div className="divide-y divide-brand-border/30">
        {Object.entries(customData).map(([key, value]) => {
          const config = META_FIELD_CONFIG[key];
          const label = config?.label || key;
          const icon = config?.icon || <FileText size={14} className="text-brand-accent" />;

          // Empty values bhi dikhao (as-is)
          const displayValue = value === '' ? (
            <span className="text-brand-secondary/30 italic text-xs">—</span>
          ) : key === 'Website' ? (
            <a
              href={`https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:underline text-sm flex items-center gap-1"
            >
              {value} <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-sm text-brand-primary">{value}</span>
          );

          return (
            <div key={key} className="flex items-start gap-3 py-3">
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-brand-secondary font-bold mb-1">
                  {label}
                  {/* Typo/raw key bhi dikhao agar label alag hai */}
                  {config?.label && config.label !== key && (
                    <span className="ml-2 font-mono normal-case text-brand-secondary/40 text-[9px]">
                      [{key}]
                    </span>
                  )}
                </p>
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </div >
  );
}

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
        const response = await fetch(getApiUrl(`/api/archive/details?id=${id}`));
        if (!response.ok) throw new Error("Failed to fetch item details");
        const result = await response.json();
        setItem(result.data || result);
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

  // custom_data — jsonb hone ki wajah se already object hai
  const customData: Record<string, any> = item.custom_data || {};

  return (
    <div dir="ltr" className="min-h-screen pt-24 pb-12 bg-brand-bg px-4 sm:px-6">
      <SEO
        title={`${displayTitle} - Mega Archive`}
        description={`Archival record of ${displayTitle} from the Institute's ledger.`}
      />

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-8 transition-all group py-2"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Archive</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Book 3D */}
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

          {/* Right: Details */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent text-[10px] font-bold rounded-full border border-brand-accent/20">
                  Mega Archive
                </span>
                <span className="inline-block px-4 py-1.5 bg-brand-border/10 text-brand-secondary text-[10px] font-bold rounded-full border border-brand-border/20">
                  #{item.id}
                </span>
                {customData.Language && (
                  <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/20">
                    {customData.Language}
                  </span>
                )}
                {customData.DateOfPublication && (
                  <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                    {customData.DateOfPublication}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-brand-primary leading-[1.2] font-bold text-4xl sm:text-5xl lg:text-6xl">
                  {displayTitle}
                </h1>
                <p className="text-lg text-brand-accent font-medium">
                  <span className="text-brand-secondary/60 text-sm">Author: </span>
                  {displayAuthor}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-brand-surface/30 border border-brand-border rounded-[2rem] backdrop-blur-md shadow-inner">
              <div className="space-y-2 text-left">
                <p className="text-[10px] text-brand-secondary font-bold flex items-center gap-2">
                  <FileText size={14} className="text-brand-accent" /> Total Pages
                </p>
                <p className="text-sm font-bold text-brand-primary">{item.pages || "---"}</p>
              </div>

              <a
                href={item.folder_node ? `https://mega.nz/fm/${item.folder_node}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("space-y-2 text-left block group transition-all", !item.folder_node && "pointer-events-none opacity-50")}
              >
                <p className="text-[10px] text-brand-secondary font-bold flex items-center gap-2 group-hover:text-brand-accent">
                  <FolderOpen size={14} className="text-brand-accent" /> Folder Link
                </p>
                <p className="text-sm font-bold text-brand-primary flex items-center gap-2">
                  Open Folder <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </a>

              <a
                href={item.file_node ? `https://mega.nz/fm/${item.file_node}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("space-y-2 text-left block group transition-all", !item.file_node && "pointer-events-none opacity-50")}
              >
                <p className="text-[10px] text-brand-secondary font-bold flex items-center gap-2 group-hover:text-brand-accent">
                  <HardDrive size={14} className="text-brand-accent" /> File Link
                </p>
                <p className="text-sm font-bold text-brand-primary flex items-center gap-2">
                  Open File <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </a>
            </div>

            {/* custom_data — sab fields as-is */}
            <CustomDataFields customData={customData} />

            {/* System File Name */}
            <div className="p-6 bg-brand-bg rounded-2xl border border-brand-border/50">
              <h4 className="text-[10px] font-bold text-brand-secondary mb-3 flex items-center gap-2">
                <FileText size={12} className="text-brand-accent" />
                System File Name
              </h4>
              <code className="text-xs text-brand-accent break-all bg-brand-surface p-3 rounded-lg block font-mono">
                {item.file_name}
              </code>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-4">
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