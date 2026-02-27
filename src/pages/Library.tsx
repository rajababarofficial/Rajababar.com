import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Scale } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import Books from '@/src/components/Books'; 
import { cn } from '@/src/utils/cn';

export default function Library() {
  const { isSindhi } = useLanguage();

  return (
    <div 
      dir={isSindhi ? 'rtl' : 'ltr'} 
      className="pt-24 pb-20 bg-brand-bg min-h-screen"
    >
      <PageHeader
        title={isSindhi ? "ڊجيٽل لائبريري" : "Digital Library"}
        description={isSindhi
          ? "تمام وڏيون لائبريريون هاڻي هڪ ئي هنڌ. ڪتاب ڳولهيو، پڙهو ۽ ڊائون لوڊ ڪريو."
          : "Access metadata from global and local libraries in one place. Legally aggregate, search, and discover books."}
        icon={<BookOpen className="w-12 h-12 text-brand-accent" />}
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
            ? "هي سڀ ڪتاب lib.sindh.org مان آهن. اڳتي هلي ٻين ذريعن جا ڪتاب به شامل ڪيا ويندا."
            : "All books listed here are from lib.sindh.org. More sources will be added gradually in the future."}
        </motion.div>

        {/* اصل کام یہاں ہو رہا ہے */}
        <Books csvPath="/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv" />

        <div className="mt-12 p-6 bg-brand-surface/30 border border-brand-border rounded-[2rem] flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-accent shrink-0">
            <Scale className="w-8 h-8" />
          </div>
          <div className={isSindhi ? "text-right" : "text-left"}>
            <h4 className={cn(
              "font-bold text-brand-primary mb-1",
              isSindhi && "font-sindhi text-xl"
            )}>
              {isSindhi ? "قانوني دستبرداري" : "Legal Disclaimer"}
            </h4>
            <p className={cn(
              "text-brand-secondary text-sm leading-relaxed",
              isSindhi && "font-sindhi text-lg"
            )}>
              {isSindhi
                ? "هي پليٽ فارم صرف عوامي لائبريرين مان معلومات (Metadata) گڏ ڪري ٿو. ڪتابن جا سمورا حق انهن جي اصل ذريعن وٽ آهن. اسان ڪاپي رائيٽ ٿيل فائلن جي ميزباني نه ڪندا آهيون."
                : "This platform aggregates metadata from public digital libraries. All book rights belong to the original sources. We do not host or download copyrighted files directly."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}