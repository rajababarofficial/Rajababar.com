import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Code, Zap, Shield, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteCredit from '@/src/components/SiteCredit';

export default function Home() {
  return (
    <div className="">
      {/* Full-screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Blur and Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/raja-portrait/1920/1080" 
            alt="Raja Babar Portrait" 
            className="w-full h-full object-cover object-center scale-105 blur-[4px]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-bg" />
        </div>

        {/* Content Container with Glassmorphism */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="backdrop-blur-md bg-white/5 border border-white/10 p-8 md:p-16 rounded-3xl shadow-2xl inline-block"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/30 text-xs font-medium text-brand-accent mb-6"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Available for Projects
            </motion.span>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-white">
              Raja Babar
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-secondary font-medium mb-10 tracking-tight">
              AI-Powered Digital Creator & Developer
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/tools" className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center group">
                Explore My Tools
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
                About Me
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      <SiteCredit />

      {/* Features Grid */}
      <section className="py-24 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="w-6 h-6 text-brand-accent" />}
              title="Clean Engineering"
              description="Built with the latest technologies ensuring scalability and performance at every layer."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Optimized for speed. Our tools are designed to save you time and boost productivity."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-500" />}
              title="Secure by Design"
              description="Privacy and security are not features, they are the foundation of everything we build."
            />
          </div>
        </div>
      </section>

      {/* Office Management Demo Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Demonstration</h2>
            <p className="text-brand-secondary max-w-2xl mx-auto">Experience our enterprise-grade solutions in action.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative p-8 md:p-12 rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-accent/30 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
                <Building2 className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Office Management System</h3>
                <p className="text-brand-secondary text-lg mb-8 max-w-2xl">
                  This is a live demonstration of the Office Management System developed by Raja Babar. 
                  You can explore features without signing up.
                </p>
                <a 
                  href="https://office-management-demo.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-brand-accent/20"
                >
                  Try Live Demo
                  <ExternalLink className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-surface to-brand-bg border border-brand-border p-12 text-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cpu className="w-32 h-32" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to build the future?</h2>
            <p className="text-brand-secondary mb-8 max-w-xl mx-auto">
              Join our mailing list to get early access to our upcoming SaaS tools and exclusive digital downloads.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors"
              />
              <button className="px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-accent/50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-brand-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function Cpu(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  )
}
