import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';

export default function Contact() {
  const { isSindhi } = useLanguage();

  return (
    <div 
      dir={isSindhi ? 'rtl' : 'ltr'} 
      className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: isSindhi ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-6 text-brand-primary",
            isSindhi && "font-sindhi leading-tight"
          )}>
            {isSindhi ? 'رابطو ڪريو' : 'Get in Touch'}
          </h1>
          <p className={cn(
            "text-brand-secondary text-lg mb-12",
            isSindhi ? "font-sindhi leading-relaxed" : ""
          )}>
            {isSindhi 
              ? 'ڇا توهان جي ذهن ۾ ڪو پروجيڪٽ آهي يا ڪنهن شراڪت بابت ڳالهائڻ چاهيو ٿا؟ مان هميشه نون موقعن ۽ دلچسپ گفتگو لاءِ تيار آهيان.'
              : "Have a project in mind or want to discuss a potential partnership? I'm always open to new opportunities and interesting conversations."
            }
          </p>

          <div className="space-y-8">
            <ContactInfo 
              icon={<Mail className="w-6 h-6 text-brand-accent" />}
              label={isSindhi ? 'اي ميل' : 'Email'}
              value="contact@rajababar.com"
              isSindhi={isSindhi}
            />
            <ContactInfo 
              icon={<MessageSquare className="w-6 h-6 text-brand-accent" />}
              label={isSindhi ? 'سوشل ميڊيا' : 'Social'}
              value="@rajababarofficial"
              isSindhi={isSindhi}
            />
            <ContactInfo 
              icon={<MapPin className="w-6 h-6 text-brand-accent" />}
              label={isSindhi ? 'هند' : 'Location'}
              value={isSindhi ? 'ڄامشورو، سنڌ.' : 'Jamshoro, Sindh.'}
              isSindhi={isSindhi}
            />
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: isSindhi ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={cn(
                  "text-xs font-bold uppercase tracking-widest text-brand-secondary",
                  isSindhi && "font-sindhi text-sm"
                )}>
                  {isSindhi ? 'نالو' : 'Name'}
                </label>
                <input 
                  type="text" 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors",
                    isSindhi && "font-sindhi"
                  )}
                  placeholder={isSindhi ? 'پنهنجو نالو لکو' : 'Your Name'}
                />
              </div>
              <div className="space-y-2">
                <label className={cn(
                  "text-xs font-bold uppercase tracking-widest text-brand-secondary",
                  isSindhi && "font-sindhi text-sm"
                )}>
                  {isSindhi ? 'اي ميل' : 'Email'}
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={cn(
                "text-xs font-bold uppercase tracking-widest text-brand-secondary",
                isSindhi && "font-sindhi text-sm"
              )}>
                {isSindhi ? 'موضوع' : 'Subject'}
              </label>
              <input 
                type="text" 
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors",
                  isSindhi && "font-sindhi"
                )}
                placeholder={isSindhi ? 'موضوع لکو' : 'Write a subject...'}
              />
            </div>
            <div className="space-y-2">
              <label className={cn(
                "text-xs font-bold uppercase tracking-widest text-brand-secondary",
                isSindhi && "font-sindhi text-sm"
              )}>
                {isSindhi ? 'پيغام' : 'Message'}
              </label>
              <textarea 
                rows={5}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-accent transition-colors resize-none",
                  isSindhi && "font-sindhi"
                )}
                placeholder={isSindhi ? 'پنهنجو پيغام لکو...' : 'Tell me about your project...'}
              />
            </div>
            <button className={cn(
              "w-full py-4 bg-brand-primary text-brand-bg font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2",
              isSindhi && "font-sindhi text-xl"
            )}>
              {isSindhi ? 'پيغام موڪليو' : 'Send Message'}
              <Send className={cn("w-5 h-5", isSindhi && "rotate-180")} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, label, value, isSindhi }: { icon: React.ReactNode, label: string, value: string, isSindhi: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className={cn(
          "text-xs font-bold uppercase tracking-widest text-brand-secondary",
          isSindhi && "font-sindhi text-sm tracking-normal"
        )}>
          {label}
        </p>
        <p className={cn(
          "text-lg font-medium",
          isSindhi && "font-sindhi"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}