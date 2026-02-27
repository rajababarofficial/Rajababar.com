import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowRight,
  Lock,
  FileSearch,
  Building2,
  Globe
} from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { useLanguage } from '@/src/context/LanguageContext';

type ToolCategory = 'All' | 'PDF Tools' | 'Office Tools';

interface Tool {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  categorySd: string;
  icon: React.ReactNode;
  status: 'Live' | 'Beta' | 'Coming Soon';
  isPremium?: boolean;
  externalLink?: string;
}

const getTools = (isSindhi: boolean): Tool[] => [
  {
    id: 'pdf-metadata',
    title: isSindhi ? 'PDF ميٽاڊيٽا ايڪسٽريڪٽر' : 'PDF Metadata Extractor',
    description: isSindhi ? 'گهڻن پي ڊي ايف فائلن مان هڪ ئي وقت ميٽاڊيٽا ڪڍو.' : 'Extract embedded metadata from multiple PDF files in bulk.',
    category: 'PDF Tools',
    categorySd: 'پي ڊي ايف ٽولز',
    icon: <FileSearch className="w-6 h-6" />,
    status: 'Live',
  },
  {
    id: 'office-management',
    title: isSindhi ? 'آفيس مئنيجمينٽ سسٽم' : 'Office Management System',
    description: isSindhi ? 'لائيو آفيس مئنيجمينٽ سسٽم جو ڊيمو. لاگ ان ڪري استعمال ڪريو.' : 'A featured enterprise solution showcase. Explore with sign in.',
    category: 'Office Tools',
    categorySd: 'آفيس ٽولز',
    icon: <Building2 className="w-6 h-6" />,
    status: 'Live',
    externalLink: 'https://project.rajababar.com'
  }
];

const getCategories = (isSindhi: boolean) => [
  { id: 'all', label: isSindhi ? 'سڀ' : 'All', value: 'All' as ToolCategory },
  { id: 'pdf', label: isSindhi ? 'پي ڊي ايف ٽولز' : 'PDF Tools', value: 'PDF Tools' as ToolCategory },
  { id: 'office', label: isSindhi ? 'آفيس ٽولز' : 'Office Tools', value: 'Office Tools' as ToolCategory }
];

export default function Tools() {
  const { isSindhi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('All');

  const toolsList = useMemo(() => getTools(isSindhi), [isSindhi]);

  const filteredTools = useMemo(() => {
    return toolsList.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, toolsList]);

  return (
    <div 
      dir={isSindhi ? 'rtl' : 'ltr'} 
      className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-brand-bg min-h-screen"
    >
      {/* Header */}
      <div className={cn("mb-12 text-center", isSindhi ? "md:text-right" : "md:text-left")}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-4xl md:text-6xl font-bold mb-4 text-brand-primary tracking-tight",
            isSindhi && "font-sindhi leading-tight"
          )}
        >
          {isSindhi ? 'ٽولز هب' : 'Tools Hub'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "text-brand-secondary text-lg max-w-2xl",
            isSindhi && "font-sindhi leading-relaxed"
          )}
        >
          {isSindhi ? 'جديد انجنيئرنگ ۽ تخليقي ڪمن لاءِ اعليٰ ڪارڪردگي وارا ڊجيٽل ٽولز.' : 'High-performance digital utilities designed for modern engineering and creative workflows.'}
        </motion.p>
      </div>

      {/* Controls */}
      <div className={cn(
        "flex flex-col md:flex-row gap-6 mb-12 items-center justify-between",
        isSindhi ? "md:flex-row-reverse" : ""
      )}>
        <div className="relative w-full md:w-96 group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary group-focus-within:text-brand-accent transition-colors",
            isSindhi ? "right-4" : "left-4"
          )} />
          <input
            type="text"
            placeholder={isSindhi ? "ٽولز ڳوليو..." : "Search tools..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full py-3 rounded-2xl bg-brand-surface border border-brand-border focus:outline-none focus:border-brand-accent transition-all placeholder:text-brand-secondary/50 text-brand-primary",
              isSindhi ? "pr-12 pl-4 font-sindhi" : "pl-12 pr-4",
            )}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {getCategories(isSindhi).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0",
                activeCategory === cat.value
                  ? "bg-brand-primary text-brand-bg border-brand-primary"
                  : "bg-brand-surface text-brand-secondary border-brand-border hover:border-brand-secondary",
                isSindhi && "font-sindhi text-lg px-6"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <ToolCard tool={tool} index={index} isSindhi={isSindhi} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 border border-dashed border-brand-border rounded-3xl"
        >
          <p className={cn("text-brand-secondary", isSindhi && "font-sindhi text-xl")}>
            {isSindhi ? "توهان جي معيار سان ملندڙ ڪو به ٽول نه مليو." : "No tools found matching your criteria."}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className={cn("mt-4 text-brand-accent font-bold hover:underline", isSindhi && "font-sindhi")}
          >
            {isSindhi ? "سڀ فلٽرز صاف ڪريو" : "Clear all filters"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ToolCard({ tool, index, isSindhi }: { tool: Tool; index: number; isSindhi: boolean }) {
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (tool.status === 'Coming Soon') return;
    if (tool.externalLink) {
      window.open(tool.externalLink, '_blank');
      return;
    }
    navigate(`/tools/${tool.id}`);
  };

  return (
    <div
      onClick={handleLaunch}
      className={cn(
        "group relative p-8 bg-brand-surface/40 backdrop-blur-xl border border-brand-border rounded-[2rem] flex flex-col h-full overflow-hidden cursor-pointer hover:border-brand-accent/50 transition-all",
        tool.status === 'Coming Soon' && "opacity-75 grayscale-[0.5] cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
          {tool.icon}
        </div>
        <div className="flex flex-col items-end gap-2 font-sans">
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            tool.status === 'Live' ? "bg-emerald-500/10 text-emerald-500" :
              tool.status === 'Beta' ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-secondary/10 text-brand-secondary"
          )}>
            {tool.status}
          </span>
          {tool.isPremium && (
            <span className="flex items-center px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className={cn(
          "text-xl font-bold mb-2 text-brand-primary group-hover:text-brand-accent transition-colors",
          isSindhi && "font-sindhi text-2xl"
        )}>
          {tool.title}
        </h3>
        <p className={cn(
          "text-brand-secondary text-sm leading-relaxed mb-6",
          isSindhi && "font-sindhi text-lg"
        )}>
          {tool.description}
        </p>
      </div>

      <div className={cn(
        "pt-6 border-t border-brand-border/50 flex items-center justify-between",
        isSindhi ? "flex-row-reverse" : ""
      )}>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest text-brand-secondary/50",
          isSindhi && "font-sindhi text-xs tracking-normal"
        )}>
          {isSindhi ? tool.categorySd : tool.category}
        </span>
        
        {tool.status !== 'Coming Soon' ? (
          <div className={cn(
            "text-sm font-bold text-brand-primary group-hover:text-brand-accent transition-colors flex items-center",
            isSindhi && "font-sindhi text-lg"
          )}>
            {tool.externalLink ? (isSindhi ? 'لائيو ڊيمو' : 'Live Demo') : (isSindhi ? 'ٽول کوليو' : 'Launch Tool')}
            <ArrowRight className={cn("ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform", isSindhi && "rotate-180 mr-2 ml-0")} />
          </div>
        ) : (
          <span className={cn("text-xs font-medium text-brand-secondary italic", isSindhi && "font-sindhi")}>
            {isSindhi ? 'جلد اچي رهيو آهي' : 'Coming Soon'}
          </span>
        )}
      </div>
    </div>
  );
}