import { motion } from 'motion/react';
import { Download, FileText, Box, Code2 } from 'lucide-react';

const downloads = [
  {
    title: "Design System Assets",
    size: "45 MB",
    type: "Figma / SVG",
    icon: <Box className="w-6 h-6" />
  },
  {
    title: "Technical Whitepaper",
    size: "2.4 MB",
    type: "PDF",
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: "Open Source Scripts",
    size: "120 KB",
    type: "JS / TS",
    icon: <Code2 className="w-6 h-6" />
  }
];

export default function Downloads() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Downloads</h1>
        <p className="text-brand-secondary text-lg">Exclusive resources and digital assets for our community.</p>
      </div>

      <div className="space-y-4">
        {downloads.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:bg-brand-surface/80 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-xl bg-brand-bg flex items-center justify-center text-brand-accent">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">
                  {item.type} • {item.size}
                </p>
              </div>
            </div>
            <button className="p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-all">
              <Download className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
