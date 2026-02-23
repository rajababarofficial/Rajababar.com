import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import SiteCredit from '@/src/components/SiteCredit';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-xl font-bold tracking-tighter mb-4 block">
              RAJABABAR<span className="text-brand-accent">.COM</span>
            </Link>
            <p className="text-brand-secondary max-w-sm mb-6">
              Building the future of digital tools and premium tech solutions. 
              A personal brand committed to excellence and innovation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-brand-secondary hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-brand-secondary hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-brand-secondary hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-brand-secondary hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-2 text-brand-secondary text-sm">
              <li><Link to="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><Link to="/downloads" className="hover:text-white transition-colors">Downloads</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Projects</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2 text-brand-secondary text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Me</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center text-xs text-brand-secondary">
          <p>© {new Date().getFullYear()} Rajababar.com. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Crafted with precision for the digital age.</p>
        </div>
        <SiteCredit variant="subtle" />
      </div>
    </footer>
  );
}
