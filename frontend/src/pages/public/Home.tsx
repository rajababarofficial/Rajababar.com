import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Building2, ExternalLink, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteCredit from '@/src/components/SiteCredit';
import { useLanguage } from '@/src/context/LanguageContext';
import SEO from '@/src/components/layout/SEO';

export default function Home() {
  const { isSindhi } = useLanguage();

  return (
    <div dir={isSindhi ? 'rtl' : 'ltr'}>
      <SEO
        title={isSindhi ? 'سافٽويئر ۽ ٽيڪ' : 'Software Engineer & Tech Enthusiast'}
        description={isSindhi
          ? 'راجا ٻٻر: مفت سافٽويئر ٽولز، سنڌي پي ڊي ايف ڪتاب، ۽ اوپن سورس پروجيڪٽس دريافت ڪريو. هڪ پريميم ٽيڪ حب.'
          : 'Raja Babar: Discover free software tools, Sindhi PDF books, and open-source projects. A premium tech hub for everyone.'}
      />

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/raja-portrait/1920/1080"
            alt="Raja Babar"
            className="w-full h-full object-cover object-center scale-105 blur-[4px]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-bg" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-8 md:p-12 rounded-ios-lg shadow-2xl max-w-4xl mx-auto text-center"
          >

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              {isSindhi ? 'راجا ٻٻر' : 'Raja Babar'}
            </h1>

            <div
              className={`text-lg md:text-xl text-brand-secondary font-medium mb-10 leading-relaxed space-y-4 ${isSindhi ? 'text-right font-sindhi' : 'text-center'
                }`}
            >
              {isSindhi ? (
                <p>
                  مونکي ٽيڪنيڪل شيون پسند آهن ۽ مان نوان تجربا ڪندو رهندو آهيان. نوان سافٽويئر ٺاهي ماڻهن کي هتي مفت ۾ فراهم ڪندس — لائيو ڊيمو، گِٽ هب ريپو، ۽ Exe سڀ هتي ملندا. منهنجو مقصد انهن ماڻهن لاءِ سهولتون پيدا ڪرڻ آهي جن کي اهڙيون شيون پسند آهن يا پڙهڻ جو شوق اٿن. جيڪڏهن ڪو منهنجي مدد ڪرڻ چاهي ته هو ڪري سگهي ٿو. مان صرف هڪ ذريعو آهيان ته ماڻهو هڪ ئي جڳھ تان سڀ ڪجهه مفت ۾ حاصل ڪري سگهن.
                </p>
              ) : (
                <p>
                  I love technical things and constantly experiment with new ideas. I build new software and provide them here for free—Live demos, Git repos, and Exe files will all be available. My mission is to provide free resources, PDF books, Open Source tools, and custom-built applications in one place.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isSindhi ? 'sm:flex-row-reverse' : ''
                }`}
            >
              <Link
                to="/tools"
                className="ios-button bg-brand-accent text-white flex items-center justify-center group"
              >
                {isSindhi ? 'منهنجا ٽولز ڏسو' : 'Explore My Tools'}
                <ArrowRight
                  className={`ms-2 w-5 h-5 transition-transform ${isSindhi
                      ? 'rotate-180 group-hover:-translate-x-1'
                      : 'group-hover:translate-x-1'
                    }`}
                />
              </Link>

              <Link
                to="/library"
                className="ios-button bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                {isSindhi ? 'لائبريري' : 'Digital Library'}
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      <SiteCredit />

      {/* ================= FEATURED SECTION ================= */}
      <section className="py-24 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4">

          <div className={`mb-16 ${isSindhi ? 'text-right' : 'text-center'}`}>
            <h2 className="text-4xl font-bold mb-4">
              {isSindhi ? 'خاص پروجيڪٽس' : 'Featured Projects'}
            </h2>
            <p className="text-brand-secondary">
              {isSindhi
                ? 'منهنجا ڪجهه خاص سافٽويئر جيڪي لائيو ڪم ڪري رهيا آهن.'
                : 'Explore some of my live working software projects.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Office Management */}
            <ProjectCard
              isSindhi={isSindhi}
              icon={<Building2 className="w-8 h-8" />}
              title="Office Management System"
              descriptionSindhi="هي آفيس مئنيجمينٽ سسٽم جو لائيو ڊيمو آهي."
              descriptionEnglish="Live demo of the Office Management System."
              link="https://project.rajababar.com"
              external
            />

            {/* PDF Tool */}
            <ProjectCard
              isSindhi={isSindhi}
              icon={<FileSearch className="w-8 h-8" />}
              title="PDF Metadata Professional"
              descriptionSindhi="هن ٽول سان توهان ڪيترن ئي پي ڊي ايف فائلزجو ڊيٽا ڪڍي سگهو ٿا."
              descriptionEnglish="Extract metadata from multiple PDF files."
              link="/tools/pdf-metadata"
            />

          </div>
        </div>
      </section>

      {/* ================= COMING SOON ================= */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className={`p-12 rounded-3xl border border-brand-border bg-brand-surface text-center`}>
            <h2 className="text-3xl font-bold mb-4">
              {isSindhi
                ? 'وڌيڪ ٽولز ۽ پروجيڪٽس جلد ئي'
                : 'More Tools & Projects Coming Soon'}
            </h2>
            <p className="text-brand-secondary">
              {isSindhi
                ? 'جلد نوان سافٽويئر شامل ڪيا ويندا.'
                : 'New tools and software will be added soon.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}


/* ================= REUSABLE CARD ================= */

function ProjectCard({
  isSindhi,
  icon,
  title,
  descriptionSindhi,
  descriptionEnglish,
  link,
  external = false
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-10 rounded-2xl bg-brand-surface border border-brand-border"
    >
      <div className="mb-6 text-brand-accent">
        {icon}
      </div>

      <h3 className="text-2xl font-bold mb-4 text-brand-primary">
        {title}
      </h3>

      <p className="text-brand-secondary mb-8">
        {isSindhi ? descriptionSindhi : descriptionEnglish}
      </p>

      {external ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-button bg-brand-accent text-white inline-flex items-center"
        >
          {isSindhi ? 'لائيو ڏسو' : 'Try Live Demo'}
          <ArrowRight
            className={`ms-2 w-5 h-5 ${isSindhi ? 'rotate-180' : ''
              }`}
          />
        </a>
      ) : (
        <Link
          to={link}
          className="ios-button bg-brand-accent text-white inline-flex items-center"
        >
          {isSindhi ? 'ٽول کوليو' : 'Open Tool'}
          <ArrowRight
            className={`ms-2 w-5 h-5 ${isSindhi ? 'rotate-180' : ''
              }`}
          />
        </Link>
      )}
    </motion.div>
  );
}