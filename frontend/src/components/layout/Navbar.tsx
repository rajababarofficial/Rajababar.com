import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Cpu, LayoutDashboard, Sun, Moon, Languages } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { useTheme } from '@/src/context/ThemeContext';
import { useLanguage } from '@/src/context/LanguageContext';

const navItems = [
  { name: 'Home', nameSindhi: 'مُک صفحو', path: '/' },
  { name: 'About', nameSindhi: 'منهنجي باري ۾', path: '/about' },
  { name: 'Library', nameSindhi: 'لائبريري', path: '/library' },
  { name: 'Tools', nameSindhi: 'ٽولز', path: '/tools' },
  { name: 'Downloads', nameSindhi: 'ڊائون لوڊس', path: '/downloads' },
  { name: 'Contact', nameSindhi: 'رابطو', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, isSindhi } = useLanguage();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-xl font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Cpu className="w-8 h-8 text-brand-accent group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold tracking-tighter text-brand-primary uppercase">
              RAJABABAR<span className="text-brand-accent">.COM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "transition-colors hover:text-brand-accent",
                  location.pathname === item.path ? "text-brand-accent" : "text-brand-secondary",
                  isSindhi ? "font-sindhi text-xl px-1" : "text-sm font-medium"
                )}
              >
                {isSindhi ? item.nameSindhi : item.name}
              </Link>
            ))}

            <div className="h-4 w-px bg-brand-border mx-2" />

            {/* Full Text Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-brand-secondary hover:text-brand-primary hover:border-brand-accent transition-all group"
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
              <span className={cn(
                "font-bold tracking-tight",
                // Agar English mode mein hai to button "Sindhi" dikhaye (Sindhi font mein)
                // Agar Sindhi mode mein hai to button "ENGLISH" dikhaye (Sans font mein)
                language === 'en' ? "font-sindhi text-base" : "font-sans text-[10px] uppercase"
              )}>
                {language === 'en' ? 'سنڌي' : 'English'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-surface transition-colors text-brand-secondary hover:text-brand-primary"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-secondary"
            >
              <span className={language === 'en' ? "font-sindhi text-sm" : "font-sans text-[10px] uppercase font-bold"}>
                {language === 'en' ? 'سنڌي' : 'English'}
              </span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-secondary p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-brand-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-xl transition-colors",
                    location.pathname === item.path 
                      ? "text-brand-accent bg-brand-surface" 
                      : "text-brand-secondary hover:text-brand-primary hover:bg-brand-surface",
                    isSindhi ? "font-sindhi text-2xl text-right" : "text-base font-medium"
                  )}
                >
                  {isSindhi ? item.nameSindhi : item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}