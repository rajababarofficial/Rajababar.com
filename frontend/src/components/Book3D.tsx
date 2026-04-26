import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book as BookIcon } from 'lucide-react';

interface Book3DProps {
  className?: string;
  title?: string;
  thumbnailUrl?: string;
}

export default function Book3D({ className = "w-full h-full", title, thumbnailUrl }: Book3DProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative flex items-center justify-center p-4 lg:p-6 ${className}`} style={{ perspective: '1200px' }}>
      <motion.div
        className="relative w-full h-full rounded-sm"
        style={{
           transformStyle: 'preserve-3d',
           // Straight View with isometric book depth via box-shadow
           transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
           // Stacked box shadows to create thick white pages on the right & bottom, and a dark drop shadow to the bottom-left
           boxShadow: `
             1px 1px 0px #fff,
             2px 2px 0px #f4f4f5,
             3px 3px 0px #e4e4e7,
             4px 4px 0px #d4d4d8,
             5px 5px 0px #a1a1aa,
             -10px 15px 25px var(--book-shadow)
           `
        }}
        initial={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
        whileHover={{ 
          scale: 1.05, 
          y: -8,
          rotateX: 0, 
          rotateY: 0, 
          rotateZ: 0,
          boxShadow: `
             1px 1px 0px #fff,
             2px 2px 0px #f4f4f5,
             3px 3px 0px #e4e4e7,
             4px 4px 0px #d4d4d8,
             5px 5px 0px #a1a1aa,
             -15px 25px 35px var(--book-shadow-hover)
          `,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
         {/* Inner Content (Image or Fallback) */}
         <div className="w-full h-full overflow-hidden rounded-sm bg-brand-surface relative after:absolute after:inset-0 after:bg-gradient-to-tr after:from-black/20 after:via-transparent after:to-white/10 after:pointer-events-none border-l-2 border-black/20">
           {thumbnailUrl && !imgError ? (
             <img 
               src={thumbnailUrl} 
               alt={title || "Book cover"} 
               className="w-full h-full object-cover"
               onError={() => setImgError(true)}
             />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-brand-bg relative p-2">
                 <BookIcon className="w-12 h-12 text-brand-secondary/30 mb-2 z-10" />
                 <span className="text-[10px] sm:text-xs font-bold text-center text-brand-primary line-clamp-3 z-10">{title || "Digital Library"}</span>
                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/30 shadow-[1px_0_2px_rgba(0,0,0,0.5)] z-20" />
             </div>
           )}
         </div>
         {/* Left edge shadow (Book spine side) */}
         <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/40 mix-blend-multiply pointer-events-none" />
      </motion.div>
    </div>
  );
}
