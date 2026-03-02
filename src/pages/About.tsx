import { motion } from 'motion/react';
import SiteCredit from '@/src/components/SiteCredit';
import { useLanguage } from '@/src/context/LanguageContext';
import SEO from '@/src/components/layout/SEO';

export default function About() {
  const { isSindhi } = useLanguage();

  return (
    <div
      dir={isSindhi ? 'rtl' : 'ltr'}
      className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <SEO
        title={isSindhi ? "منهنجي باري ۾" : "About the Creator"}
        description={isSindhi
          ? "راجا ٻٻر بابت ڄاڻو: هڪ ٽيڪ عاشق جيڪو سنڌي ڪميونٽي لاءِ مفت ڊجيٽل اوزار ۽ وسيلا فراهم ڪري ٿو."
          : "Learn more about Raja Babar, a tech enthusiast dedicated to providing free digital tools, software, and resources for everyone."}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* ========= HEADING ========= */}
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-brand-primary">
          {isSindhi ? 'راجا ٻٻر بابت' : 'About Raja Babar'}
        </h1>

        {/* ========= CONTENT ========= */}
        <div
          className={`max-w-none text-brand-secondary text-lg leading-relaxed space-y-6 ${isSindhi ? 'text-right font-sindhi' : ''
            }`}
        >

          {isSindhi ? (
            <>
              <p>
                منهنجي ڊجيٽل دنيا ۾ ڀليڪار. مان ڪو انجنيئر نه آهيان، پر ٽيڪنيڪل شيون سکڻ
                ۽ ٺاهڻ پسند ڪندو آهيان. منهنجو مقصد ماڻهن لاءِ آسان ۽ مفيد اوزار مهيا ڪرڻ آهي.
              </p>

              <p>
                Rajababar.com شروعات ۾ هڪ ذاتي ويب سائيٽ هئي، پر هاڻي اها آهستي آهستي
                مفت سافٽويئر، ٽولز ۽ ڊجيٽل وسيلن جي پليٽفارم بڻجي رهي آهي.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to my digital space. I am not an engineer — just a simple
                person who loves technology and enjoys creating tools that make
                life easier for people.
              </p>

              <p>
                Rajababar.com started as a personal website, but it is gradually
                evolving into a platform that offers free software, tools, and
                digital resources for everyone.
              </p>
            </>
          )}

          {/* ========= VISION + VALUES ========= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-bold mb-3 text-gray-900 dark:text-white">
                {isSindhi ? 'منهنجو مقصد' : 'My Goal'}
              </h3>
              <p className="text-sm">
                {isSindhi
                  ? 'اهڙو پليٽفارم ٺاهڻ جتان ماڻهو مفت ۽ مفيد ڊجيٽل اوزار حاصل ڪري سگهن.'
                  : 'To build a platform where people can access useful digital tools for free.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
              <h3 className="font-bold mb-3 text-gray-900 dark:text-white">
                {isSindhi ? 'منهنجون قدرون' : 'My Values'}
              </h3>
              <p className="text-sm">
                {isSindhi
                  ? 'سادگي، ايمانداري ۽ ماڻهن جي مدد ڪرڻ — مان اهڙا اوزار ٺاهڻ چاهيان ٿو جيڪي واقعي ڪم اچن.'
                  : 'Simplicity, honesty, and helping people — I build tools that are truly useful.'}
              </p>
            </div>

          </div>

          {/* ========= CLOSING ========= */}
          <p>
            {isSindhi
              ? 'جيڪڏهن توهان منهنجا پروجيڪٽس ڏسڻ يا اوزار استعمال ڪرڻ لاءِ هتي آيا آهيو، ته توهان جي مهرباني. هي سڀ ڪجهه ماڻهن جي فائدي لاءِ آهي.'
              : "If you're here to explore my projects or use my tools, thank you for visiting. Everything here is built to be useful for people."}
          </p>

        </div>
      </motion.div>

      <SiteCredit className="mt-12" />
    </div>
  );
}