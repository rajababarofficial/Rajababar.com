import { Link } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';
import SiteCredit from '@/src/components/SiteCredit';

export default function Footer() {
  const menuItems = [
    { name: 'About Me', sd: 'منهنجي باري ۾', path: '/about' },
    { name: 'Downloads', sd: 'ڊائون لوڊس', path: '/downloads' },
    { name: 'Tools', sd: 'ٽولز', path: '/tools' },
    { name: 'Library', sd: 'لائبريري', path: '/library' },
  ];

  return (
    <footer className="relative border-t border-brand-border bg-brand-bg py-16 z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Logo - Fixed Click Issue & Z-Index */}
        <div className="relative z-30 mb-12">
          <Link 
            to="/" 
            className="text-3xl font-black tracking-[0.2em] text-white hover:text-brand-accent transition-all duration-300 block p-2"
          >
            RAJABABAR<span className="text-brand-accent">.COM</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mb-12 w-full relative z-20">
          <ul className="flex flex-col md:flex-row md:flex-wrap justify-center gap-x-16 gap-y-10">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="group flex flex-col items-center gap-1 py-2">
                  {/* Sindhi Font Fix: Using Global 'font-sindhi' class */}
                  <span 
                    dir="rtl" 
                    className="text-2xl text-brand-secondary group-hover:text-white transition-colors leading-relaxed font-sindhi"
                  >
                    {item.sd}
                  </span>
                  {/* English Font */}
                  <span className="text-[10px] text-brand-accent/60 font-bold uppercase tracking-[0.2em] group-hover:text-brand-accent transition-colors font-sans">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-8 mb-12 relative z-30">
          <a href="https://github.com/rajababarofficial" target="_blank" rel="noopener noreferrer" 
             className="p-3 rounded-full bg-brand-surface border border-brand-border text-brand-secondary hover:text-white hover:border-brand-accent transition-all hover:scale-110 shadow-sm">
            <Github className="w-5 h-5" />
          </a>
          <a href="mailto:contact@rajababar.com" 
             className="p-3 rounded-full bg-brand-surface border border-brand-border text-brand-secondary hover:text-white hover:border-brand-accent transition-all hover:scale-110 shadow-sm">
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright & Credit */}
        <div className="space-y-4 opacity-70">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.4em] font-sans font-bold text-white/50">
              © 2026 RAJABABAR.COM
            </p>
            <p 
              dir="rtl" 
              className="text-lg tracking-normal font-medium text-brand-secondary/60 font-sindhi"
            >
              سڀ حق محفوظ آهن ٢٠٢٦ع
            </p>
          </div>
          <SiteCredit variant="subtle" className="mt-4 border-none scale-90" />
        </div>

      </div>
    </footer>
  );
}