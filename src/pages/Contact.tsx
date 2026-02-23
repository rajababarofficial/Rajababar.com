import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-brand-secondary text-lg mb-12">
            Have a project in mind or want to discuss a potential partnership? 
            I'm always open to new opportunities and interesting conversations.
          </p>

          <div className="space-y-8">
            <ContactInfo 
              icon={<Mail className="w-6 h-6 text-brand-accent" />}
              label="Email"
              value="contact@rajababar.com"
            />
            <ContactInfo 
              icon={<MessageSquare className="w-6 h-6 text-brand-accent" />}
              label="Social"
              value="@rajababarofficial"
            />
            <ContactInfo 
              icon={<MapPin className="w-6 h-6 text-brand-accent" />}
              label="Location"
              value="Remote / Global"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Subject</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="Project Inquiry"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Message</label>
              <textarea 
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors resize-none"
                placeholder="Tell me about your project..."
              />
            </div>
            <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center">
              Send Message
              <Send className="ml-2 w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary">{label}</p>
        <p className="text-lg font-medium">{value}</p>
      </div>
    </div>
  );
}
