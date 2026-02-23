import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, Cpu, LayoutDashboard } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { SupabaseService } from '@/src/services/supabaseService';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Projects', path: '/projects' },
  { name: 'Tools', path: '/tools' },
  { name: 'Downloads', path: '/downloads' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    SupabaseService.getCurrentUser().then(setUser);
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Cpu className="w-8 h-8 text-brand-accent group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-bold tracking-tighter">RAJABABAR<span className="text-brand-accent">.COM</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-accent",
                  location.pathname === item.path ? "text-brand-accent" : "text-brand-secondary"
                )}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 bg-brand-accent text-white text-sm font-bold rounded-full hover:bg-brand-accent/80 transition-colors flex items-center">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-brand-secondary transition-colors">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-secondary hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-brand-bg border-b border-brand-border px-4 pt-2 pb-6 space-y-1"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2 text-base font-medium rounded-md",
                location.pathname === item.path ? "text-brand-accent bg-brand-surface" : "text-brand-secondary hover:text-white hover:bg-brand-surface"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 px-3">
            {user ? (
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-3 bg-brand-accent text-white text-center font-bold rounded-xl flex items-center justify-center"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-3 bg-white text-black text-center font-bold rounded-xl"
              >
                Get Started
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
