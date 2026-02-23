import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  Image as ImageIcon, 
  FileArchive, 
  Scan, 
  ArrowRight, 
  Sparkles,
  Filter,
  Lock,
  FileSearch
} from 'lucide-react';
import { cn } from '@/src/utils/cn';

type ToolCategory = 'All' | 'PDF Tools' | 'Image Tools' | 'File Utilities' | 'Digitization Tools';

interface Tool {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: React.ReactNode;
  status: 'Live' | 'Beta' | 'Coming Soon';
  isPremium?: boolean;
}

const tools: Tool[] = [
  {
    id: 'pdf-metadata',
    title: 'PDF Metadata Extractor',
    description: 'Extract embedded metadata from multiple PDF files in bulk.',
    category: 'PDF Tools',
    icon: <FileSearch className="w-6 h-6" />,
    status: 'Live',
  },
  {
    id: 'pdf-merge',
    title: 'PDF Merger',
    description: 'Combine multiple PDF documents into a single high-quality file.',
    category: 'PDF Tools',
    icon: <FileText className="w-6 h-6" />,
    status: 'Coming Soon',
  },
  {
    id: 'pdf-compress',
    title: 'PDF Compressor',
    description: 'Reduce PDF file size without losing significant quality.',
    category: 'PDF Tools',
    icon: <FileArchive className="w-6 h-6" />,
    status: 'Beta',
  },
  {
    id: 'img-upscale',
    title: 'AI Image Upscaler',
    description: 'Enhance image resolution using advanced neural networks.',
    category: 'Image Tools',
    icon: <ImageIcon className="w-6 h-6" />,
    status: 'Live',
    isPremium: true,
  },
  {
    id: 'img-remove-bg',
    title: 'Background Remover',
    description: 'Automatically remove backgrounds from images in seconds.',
    category: 'Image Tools',
    icon: <Sparkles className="w-6 h-6" />,
    status: 'Coming Soon',
  },
  {
    id: 'file-convert',
    title: 'Universal Converter',
    description: 'Convert between 100+ different file formats instantly.',
    category: 'File Utilities',
    icon: <FileArchive className="w-6 h-6" />,
    status: 'Live',
  },
  {
    id: 'ocr-scanner',
    title: 'OCR Text Extractor',
    description: 'Extract text from images and scanned documents with high accuracy.',
    category: 'Digitization Tools',
    icon: <Scan className="w-6 h-6" />,
    status: 'Beta',
    isPremium: true,
  },
  {
    id: 'doc-digitizer',
    title: 'Smart Digitizer',
    description: 'Transform physical documents into structured digital data.',
    category: 'Digitization Tools',
    icon: <FileText className="w-6 h-6" />,
    status: 'Coming Soon',
  }
];

const categories: ToolCategory[] = ['All', 'PDF Tools', 'Image Tools', 'File Utilities', 'Digitization Tools'];

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('All');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 text-gradient tracking-tight"
        >
          Tools Hub
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-brand-secondary text-lg max-w-2xl"
        >
          High-performance digital utilities designed for modern engineering and creative workflows.
        </motion.p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary group-focus-within:text-brand-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-brand-surface border border-brand-border focus:outline-none focus:border-brand-accent transition-all placeholder:text-brand-secondary/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <Filter className="w-4 h-4 text-brand-secondary mr-2 shrink-0 hidden md:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0",
                activeCategory === cat 
                  ? "bg-white text-black border-white" 
                  : "bg-brand-surface text-brand-secondary border-brand-border hover:border-brand-secondary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {filteredTools.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 border border-dashed border-brand-border rounded-3xl"
        >
          <p className="text-brand-secondary">No tools found matching your criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-4 text-brand-accent font-bold hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  key?: React.Key;
}

function ToolCard({ tool, index }: ToolCardProps) {
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (tool.status === 'Coming Soon') return;
    if (tool.id === 'pdf-metadata') {
      navigate('/tools/pdf-metadata');
    }
  };

  return (
    <motion.div
      layout
      onClick={handleLaunch}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "group relative p-8 rounded-3xl bg-brand-surface/40 backdrop-blur-xl border border-brand-border hover:border-brand-accent/30 transition-all flex flex-col h-full overflow-hidden cursor-pointer",
        tool.status === 'Coming Soon' && "opacity-75 grayscale-[0.5] cursor-not-allowed"
      )}
    >
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-accent/5 rounded-full blur-[64px] group-hover:bg-brand-accent/10 transition-all" />
      
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
          {tool.icon}
        </div>
        <div className="flex flex-col items-end gap-2">
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
        <h3 className="text-xl font-bold mb-2 group-hover:text-brand-accent transition-colors">{tool.title}</h3>
        <p className="text-brand-secondary text-sm leading-relaxed mb-6">
          {tool.description}
        </p>
      </div>

      <div className="pt-6 border-t border-brand-border/50 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/50">
          {tool.category}
        </span>
        {tool.status !== 'Coming Soon' ? (
          <button className="text-sm font-bold text-white hover:text-brand-accent transition-colors flex items-center">
            Launch Tool
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <span className="text-xs font-medium text-brand-secondary italic">Notify Me</span>
        )}
      </div>
    </motion.div>
  );
}
