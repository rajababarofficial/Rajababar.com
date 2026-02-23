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
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "max-w-3xl mx-auto text-center",
        isSubtle ? "py-4 border-t border-brand-border/30 mt-8" : "py-12 px-4",
        className
      )}
    >
      <p className={cn(
        "font-sans leading-relaxed tracking-tight",
        isSubtle ? "text-[10px] uppercase tracking-[0.2em] text-brand-secondary/40" : "text-sm md:text-base text-brand-secondary/60 italic"
      )}>
        Rajababar.com is an independent digital platform developed by Raja Babar using modern technologies and AI-assisted workflows.
      </p>
    </motion.div>
  );
}
