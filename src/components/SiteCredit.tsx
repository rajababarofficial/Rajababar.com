import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';

interface SiteCreditProps {
  variant?: 'standard' | 'subtle';
  className?: string;
}

export default function SiteCredit({ variant = 'standard', className }: SiteCreditProps) {
  const isSubtle = variant === 'subtle';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "max-w-3xl mx-auto text-center",
        isSubtle ? "py-4 mt-4 border-t border-brand-border/20" : "py-8 px-4",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Sindhi Version - Using font-sindhi for MB Saremiqra */}
        <p 
          dir="rtl" 
          className={cn(
            "font-sindhi leading-relaxed",
            isSubtle ? "text-sm text-brand-secondary/40" : "text-lg text-brand-secondary/70"
          )}
        >
          راجا ٻٻر پاران جديد ٽيڪنالاجي ۽ AI جي مدد سان تيار ڪيل
        </p>
        
        {/* English Version */}
        <p className={cn(
          "font-sans tracking-widest uppercase opacity-60",
          isSubtle ? "text-[9px]" : "text-[11px]"
        )}>
          Developed by Raja Babar using modern tech & AI
        </p>
      </div>
    </motion.div>
  );
}