import { motion } from 'motion/react';
import SiteCredit from '@/src/components/SiteCredit';

export default function About() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8">About Rajababar</h1>
        <div className="prose prose-invert max-w-none text-brand-secondary space-y-6 text-lg">
          <p>
            Welcome to my digital space. I am a passionate engineer and creator focused on building 
            premium tech solutions that bridge the gap between complex engineering and elegant design.
          </p>
          <p>
            Rajababar.com started as a personal brand to showcase my journey in technology, 
            but it is rapidly evolving into a platform for high-performance SaaS tools. 
            My mission is to empower creators and developers with the tools they need to build 
            the next generation of digital experiences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="text-white font-bold mb-2">My Vision</h3>
              <p className="text-sm">To become the go-to platform for specialized digital tools that prioritize performance and user experience.</p>
            </div>
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="text-white font-bold mb-2">My Values</h3>
              <p className="text-sm">Precision, transparency, and constant innovation. I believe in building tools that I would use myself.</p>
            </div>
          </div>
          <p>
            Whether you're here for my latest projects, looking for professional tools, or just 
            want to connect, I'm glad you're here. The future is built one line of code at a time.
          </p>
        </div>
      </motion.div>
      <SiteCredit className="mt-12" />
    </div>
  );
}
