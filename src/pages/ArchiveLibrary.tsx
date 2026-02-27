import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Archive } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
// 1. Pehle wala 'Books' import hata kar naya 'ArchiveBooks' import karein
import ArchiveBooks from '@/src/components/ArchiveLibrary';
import { cn } from '@/src/utils/cn';

export default function ArchiveLibrary() {
  const { isSindhi } = useLanguage();

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'} className="pt-24 pb-20 bg-brand-bg min-h-screen">
      <PageHeader
        title={isSindhi ? "آرڪائيو لائبريري" : "Archive Library"}
        description={isSindhi
          ? "انٽرنيٽ آرڪائيو تان حاصل ڪيل سنڌي ڪتابن جو خاص ذخيرو."
          : "A specialized collection of Sindhi books curated from Internet Archive."}
        icon={<Archive className="w-12 h-12 text-brand-accent" />}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 bg-brand-surface/20 border border-brand-border rounded-xl text-center text-sm text-brand-secondary",
            isSindhi && "font-sindhi text-base"
          )}
        >
          {isSindhi
            ? "هي سڀ ڪتاب Archive.org تان آندا ويا آهن."
            : "All books listed here are sourced from Archive.org."}
        </motion.div>

        {/* 2. YAHAN PAR DENA HAI: Purane Books component ki jagah ye naya component */}
        <ArchiveBooks csvPath="/archive.org/sindh-library.csv" />

        <div className="mt-12 p-6 bg-brand-surface/30 border border-brand-border rounded-[2rem] flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-accent shrink-0">
            <Scale className="w-8 h-8" />
          </div>
          <div className={isSindhi ? "text-right" : "text-left"}>
            <h4 className={cn("font-bold text-brand-primary mb-1", isSindhi && "font-sindhi text-xl")}>
              {isSindhi ? "قانوني دستبرداري" : "Legal Disclaimer"}
            </h4>
            <p className={cn("text-brand-secondary text-sm leading-relaxed", isSindhi && "font-sindhi text-lg")}>
              {isSindhi
                ? "هي پليٽ فارم صرف آرڪائيو ٿيل معلومات ڏيکاري ٿو."
                : "This platform displays archived metadata."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}