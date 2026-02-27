import React from 'react';
import { Library as LibIcon } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import Books from '@/src/components/Books'; 

export default function SindhLibrary() {
  const { isSindhi } = useLanguage();

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'} className="pt-24 pb-20 bg-brand-bg min-h-screen">
      <PageHeader
        title={isSindhi ? "سنڌ لائبريري" : "Sindh Library"}
        description={isSindhi ? "lib.sindh.org جو مڪمل ڪليڪشن." : "Full collection from lib.sindh.org"}
        icon={<LibIcon className="w-12 h-12 text-brand-accent" />}
      />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Books csvPath="/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv" />
      </section>
    </div>
  );
}