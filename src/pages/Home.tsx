import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Building2, ExternalLink, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteCredit from '@/src/components/SiteCredit';
import { useLanguage } from '@/src/context/LanguageContext';

export default function Home() {
  const { isSindhi } = useLanguage();

  return (
    <div className="">
      {/* Full-screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Blur and Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/raja-portrait/1920/1080"
            alt="Raja Babar"
            className="w-full h-full object-cover object-center scale-105 blur-[4px]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-bg" />
        </div>

        {/* Content Container with Glassmorphism */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass p-8 md:p-12 rounded-ios-lg shadow-2xl inline-block max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
              {isSindhi ? 'راجا ٻٻر' : 'Raja Babar'}
            </h1>

            <div className="text-lg md:text-xl text-brand-secondary font-medium mb-8 tracking-tight space-y-4 text-left/center leading-relaxed">
              {isSindhi ? (
                <p className="font-sindhi leading-loose text-center">
                  مونکي ٽيڪنيڪل شيون پسند آهن ۽ مان نوان تجربا ڪندو رهندو آهيان. نوان سافٽويئر ٺاهي ماڻهن کي هتي مفت ۾ فراهم ڪندس — لائيو ڊيمو، گِٽ هب ريپو، ۽ Exe سڀ هتي ملندا. منهنجو مقصد انهن ماڻهن لاءِ سهولتون پيدا ڪرڻ آهي جن کي اهڙيون شيون پسند آهن يا پڙهڻ جو شوق اٿن. جيڪڏهن ڪو منهنجي مدد ڪرڻ چاهي، جيئن ڪنهن سافٽويئر ۾ حصو وٺڻ (Contribute) ته هو ڪري سگهي ٿو. منهنجو مقصد ماڻهن تائين مفت شيون، پي ڊي ايف ڪتاب، اوپن سورس ٽولز ۽ پنهنجا ٺاهيل سافٽويئر پهچائڻ آهي. مان صرف هڪ ذريعو آهيان ته ماڻهو هڪ ئي جڳھ تان سڀ ڪجهه مفت ۾ حاصل ڪري سگهن.
                </p>
              ) : (
                <p className="text-center">
                  I love technical things and constantly experiment with new ideas. I build new software and provide them here for free—Live demos, Git repos, and Exe files will all be available. My goal is to facilitate those who share this passion or love reading. If anyone wants to contribute to a software, they are welcome! My mission is to provide free resources, PDF books, Open Source tools, and my custom-built applications to everyone in one place. I am merely a medium for people to access everything freely.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/tools" className="w-full sm:w-auto ios-button bg-brand-accent text-white flex items-center justify-center group shadow-lg shadow-brand-accent/20">
                {isSindhi ? 'منهنجا ٽولز ڏسو' : 'Explore My Tools'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/library" className="w-full sm:w-auto ios-button bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all">
                {isSindhi ? 'لائبريري' : 'Digital Library'}
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

      {/* Featured Projects Section */}
      <section className="py-24 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center text-brand-primary">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{isSindhi ? 'خاص پروجيڪٽس' : 'Featured Projects'}</h2>
            <p className="text-brand-secondary max-w-2xl mx-auto">{isSindhi ? 'منهنجا ٺاهيل ڪجهه خاص سافٽويئر جيڪي لائيو ڪم ڪري رهيا آهن.' : 'Explore some of my specific software that are currently live and working.'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Office Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative p-8 md:p-10 ios-card bg-brand-surface border-brand-border overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Building2 className="w-40 h-40" />
              </div>

              <div className="relative z-10 flex flex-col flex-1">
                <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform mb-6">
                  <Building2 className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold mb-3 text-brand-primary">Office Management System</h3>
                <p className="text-brand-secondary text-lg mb-8 flex-1">
                  {isSindhi
                    ? 'هي هڪ آفيس مئنيجمينٽ سسٽم جو لائيو ڊيمو آهي جيڪو راجا ٻٻر پاران ٺاهيو ويو آهي. توهان سائن اپ ڪرڻ کانسواءِ هي پروجيڪٽ ڏسي سگهو ٿا.'
                    : 'This is a live demonstration of the Office Management System developed by Raja Babar. You can explore features without signing up.'}
                </p>
                <a
                  href="https://project.rajababar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ios-button w-fit bg-brand-accent text-white flex items-center shadow-lg shadow-brand-accent/20"
                >
                  {isSindhi ? 'لائيو ڏسو' : 'Try Live Demo'}
                  <ExternalLink className="ml-2 w-5 h-5" />
                </a>
              </div>
            </motion.div>

            {/* PDF Metadata Professional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative p-8 md:p-10 ios-card bg-brand-surface border-brand-border overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileSearch className="w-40 h-40" />
              </div>

              <div className="relative z-10 flex flex-col flex-1">
                <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform mb-6">
                  <FileSearch className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold mb-3 text-brand-primary">PDF Metadata Professional</h3>
                <p className="text-brand-secondary text-lg mb-8 flex-1">
                  {isSindhi
                    ? 'هن ٽول سان توهان ڪيترن ئي پي ڊي ايف فائلزجو ڊيٽا ڪڍي سگهو ٿا. ويب ورجن صرف عام تفصيل ڪڍندو آهي جڏهن ته پائٿن پروجيڪٽ مڪمل تفصيل ڏيندو آهي .'
                    : 'Extract embedded metadata from multiple PDF files in bulk. The web version extracts basic details, while the Python project provides deep extraction including custom fields.'}
                </p>
                <Link
                  to="/tools/pdf-metadata"
                  className="ios-button w-fit bg-emerald-600 text-white flex items-center shadow-lg shadow-emerald-500/20"
                >
                  {isSindhi ? 'ٽول کوليو' : 'Open Tool'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section Message */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-surface to-brand-bg border border-brand-border p-12 text-center text-brand-primary">
            <h2 className="text-3xl md:text-3xl font-bold mb-4">
              {isSindhi ? 'وڌيڪ ٽولز ۽ پروجيڪٽس جلد ئي' : 'More Tools & Projects Coming Soon'}
            </h2>
            <p className="text-brand-secondary mb-0 max-w-xl mx-auto">
              {isSindhi
                ? 'ٻين سافٽويئرز ۽ ٽولز تي ڪم جاري آهي جيڪي جلد ئي هن ويبسائيٽ تي مفت دستياب هوندا.'
                : 'Work is currently in progress for new software and tools that will be added to this website for free very soon.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
