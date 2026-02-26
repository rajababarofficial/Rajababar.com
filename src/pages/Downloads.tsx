import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Type, Terminal, Database, Folder, ChevronDown, ChevronRight, Github } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';

const sindhiFonts = [
  { title: "MB-Ahmed-Soomro-SK-2.0.ttf", size: "85 KB", type: "TTF", link: "/fonts-sindhi/MB-Ahmed-Soomro-SK-2.0.ttf" },
  { title: "MB-Bhitai-Sattar-SK-2.0.ttf", size: "96 KB", type: "TTF", link: "/fonts-sindhi/MB-Bhitai-Sattar-SK-2.0.ttf" },
  { title: "MB-Halai-Shabir-Kumbhar-2.0.ttf", size: "90 KB", type: "TTF", link: "/fonts-sindhi/MB-Halai-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Khursheed-SK-2.0.ttf", size: "130 KB", type: "TTF", link: "/fonts-sindhi/MB-Khursheed-SK-2.0.ttf" },
  { title: "MB-Kufi-SK-2.0.ttf", size: "118 KB", type: "TTF", link: "/fonts-sindhi/MB-Kufi-SK-2.0.ttf" },
  { title: "MB-Lajpatrai-2.0.ttf", size: "88 KB", type: "TTF", link: "/fonts-sindhi/MB-Lajpatrai-2.0.ttf" },
  { title: "MB-Lateefi-SKv2.0.ttf", size: "94 KB", type: "TTF", link: "/fonts-sindhi/MB-Lateefi-SKv2.0.ttf" },
  { title: "MB-LateefiM-Sattar-SK-2.0.ttf", size: "105 KB", type: "TTF", link: "/fonts-sindhi/MB-LateefiM-Sattar-SK-2.0.ttf" },
  { title: "MB-Leeka-Shabir-Kumbhar-2.0.ttf", size: "193 KB", type: "TTF", link: "/fonts-sindhi/MB-Leeka-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Leeko-Shabir-Kumbhar-2.0.ttf", size: "201 KB", type: "TTF", link: "/fonts-sindhi/MB-Leeko-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Leekyal-Shabir-Kumbhar-2.0.ttf", size: "191 KB", type: "TTF", link: "/fonts-sindhi/MB-Leekyal-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Preen-Shabir-Kumbhar-2.0.ttf", size: "92 KB", type: "TTF", link: "/fonts-sindhi/MB-Preen-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Preen-Shabir-Kumbhar-Bold-2.0.ttf", size: "86 KB", type: "TTF", link: "/fonts-sindhi/MB-Preen-Shabir-Kumbhar-Bold-2.0.ttf" },
  { title: "MB-Sania-SK-2.0.ttf", size: "79 KB", type: "TTF", link: "/fonts-sindhi/MB-Sania-SK-2.0.ttf" },
  { title: "MB-Sarang-Sattar-SK-2.0.ttf", size: "85 KB", type: "TTF", link: "/fonts-sindhi/MB-Sarang-Sattar-SK-2.0.ttf" },
  { title: "MB-Shabir-Kumbhar-2.1.ttf", size: "85 KB", type: "TTF", link: "/fonts-sindhi/MB-Shabir-Kumbhar-2.1.ttf" },
  { title: "MB-Shabir-Kumbhar-Bold-2.1.ttf", size: "75 KB", type: "TTF", link: "/fonts-sindhi/MB-Shabir-Kumbhar-Bold-2.1.ttf" },
  { title: "MB-Shabir-Kumbhar-Web-2.0.ttf", size: "76 KB", type: "TTF", link: "/fonts-sindhi/MB-Shabir-Kumbhar-Web-2.0.ttf" },
  { title: "MB-Sindhi-Sahat-SK-2.0.ttf", size: "90 KB", type: "TTF", link: "/fonts-sindhi/MB-Sindhi-Sahat-SK-2.0.ttf" },
  { title: "MB-Sindhi-Web-SK-2.0.ttf", size: "94 KB", type: "TTF", link: "/fonts-sindhi/MB-Sindhi-Web-SK-2.0.ttf" },
  { title: "MB-Sindhri-Shabir-Kumbhar-2.0.ttf", size: "91 KB", type: "TTF", link: "/fonts-sindhi/MB-Sindhri-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Sookhri-Shabir-Kumbhar-2.0.ttf", size: "138 KB", type: "TTF", link: "/fonts-sindhi/MB-Sookhri-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Supreen-Shabir-Kumbhar-2.0.ttf", size: "138 KB", type: "TTF", link: "/fonts-sindhi/MB-Supreen-Shabir-Kumbhar-2.0.ttf" },
  { title: "MB-Supreen-Shabir-Kumbhar-Bold-2.0.ttf", size: "84 KB", type: "TTF", link: "/fonts-sindhi/MB-Supreen-Shabir-Kumbhar-Bold-2.0.ttf" },
  { title: "MBNargisNew3.2.ttf", size: "44 KB", type: "TTF", link: "/fonts-sindhi/MBNargisNew3.2.ttf" },
  { title: "mb sarem iqra.ttf", size: "83 KB", type: "TTF", link: "/fonts-sindhi/mb sarem iqra.ttf" },
  { title: "mb sarem marjan kasheeda.ttf", size: "427 KB", type: "TTF", link: "/fonts-sindhi/mb sarem marjan kasheeda.ttf" },
  { title: "mb sarem marjan.ttf", size: "408 KB", type: "TTF", link: "/fonts-sindhi/mb sarem marjan.ttf" }
];

const urduFonts = [
  { title: "JameelNooriNastaleeqRegular.ttf", size: "10.3 MB", type: "TTF", link: "/fonts-urdu/JameelNooriNastaleeqRegular.ttf" },
  { title: "NotoNastaliqUrdu-Bold.ttf", size: "518 KB", type: "TTF", link: "/fonts-urdu/NotoNastaliqUrdu-Bold.ttf" },
  { title: "NotoNastaliqUrdu-Medium.ttf", size: "519 KB", type: "TTF", link: "/fonts-urdu/NotoNastaliqUrdu-Medium.ttf" },
  { title: "NotoNastaliqUrdu-Regular.ttf", size: "517 KB", type: "TTF", link: "/fonts-urdu/NotoNastaliqUrdu-Regular.ttf" },
  { title: "NotoNastaliqUrdu-SemiBold.ttf", size: "519 KB", type: "TTF", link: "/fonts-urdu/NotoNastaliqUrdu-SemiBold.ttf" },
  { title: "NotoNastaliqUrdu-VariableFont_wght.ttf", size: "677 KB", type: "TTF", link: "/fonts-urdu/NotoNastaliqUrdu-VariableFont_wght.ttf" }
];

const keyboards = [
  { title: "MB Sindhi Keyboard (Sindhi/Urdu)", size: "1 MB", type: "ZIP", link: "/mb-sk-sd-2.0.zip" },
  { title: "CRULP Urdu Phonetic Keyboard v1.1", size: "254 KB", type: "ZIP", link: "/CRULP_Urdu_Phonetic_kb_v1.1.zip" }
];

const tools = [
  {
    title: "PDF Metadata Extraction Pro",
    size: "12.4",
    type: "Windows EXE",
    icon: <Terminal className="w-6 h-6" />,
    link: "https://github.com/rajababarofficial/PDF-Metadata-Extraction-Pro/releases/download/v1.0.0/PDF-Metadata-Pro.exe",
    repo: "https://github.com/rajababarofficial/PDF-Metadata-Extraction-Pro.git",
    desc: "A Python based tool that extracts full metadata including hidden standard and custom fields from multiple PDFs."
  }
];

export default function Downloads() {
  const { isSindhi } = useLanguage();
  const [openSection, setOpenSection] = useState<'sindhiFonts' | 'urduFonts' | 'keyboards' | 'tools' | null>('sindhiFonts');

  const toggleSection = (section: 'sindhiFonts' | 'urduFonts' | 'keyboards' | 'tools') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="pt-24 pb-20">
      <PageHeader
        title={isSindhi ? "ڊائون لوڊس" : "Downloads"}
        description={isSindhi
          ? "هتي توهان کي سنڌي فونٽس، سافٽويئر انجمام ۽ ٻيا ضروري ٽولز بلڪل مفت ملندا."
          : "Exclusive resources, custom tools, and open-source applications for our community."}
        icon={<Folder className="w-12 h-12 text-brand-accent" />}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">

        {/* Tools Section */}
        <div className="ios-card bg-brand-surface border border-brand-border rounded-ios-lg overflow-hidden">
          <button
            onClick={() => toggleSection('tools')}
            className="w-full flex items-center justify-between p-6 bg-brand-bg md:text-xl font-bold cursor-pointer hover:bg-brand-surface transition-colors"
          >
            <div className="flex items-center gap-4">
              <Terminal className="w-6 h-6 text-brand-accent" />
              {isSindhi ? "ٽولز ۽ سافٽويئرز" : "Tools & Software"}
            </div>
            {openSection === 'tools' ? <ChevronDown className="w-6 h-6 text-brand-secondary" /> : <ChevronRight className="w-6 h-6 text-brand-secondary" />}
          </button>

          {openSection === 'tools' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-brand-border"
            >
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-brand-secondary text-sm mb-4">
                  {isSindhi ? "منهنجا ٺاهيل سافٽويئر جيڪي توهان پنهنجي ونڊوز ۾ لڳائي سگهو ٿا." : "My custom developed applications ready for Windows."}
                </p>
                {tools.map((item, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-brand-bg border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-6 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-brand-primary">{item.title}</h3>
                        <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1 mb-2">
                          {item.type} • {item.size}
                        </p>
                        <p className="text-sm text-brand-secondary leading-relaxed max-w-lg">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {item.repo && (
                        <a
                          href={item.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary flex items-center justify-center transition-all text-sm font-bold w-full sm:w-auto text-brand-primary"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub Repo
                        </a>
                      )}
                      <a
                        href={item.link}
                        className="px-4 py-2 rounded-xl bg-brand-accent text-white hover:bg-blue-600 flex items-center justify-center transition-all text-sm font-bold w-full sm:w-auto shadow-md shadow-brand-accent/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download EXE
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Keyboards Section */}
        <div className="ios-card bg-brand-surface border border-brand-border rounded-ios-lg overflow-hidden">
          <button
            onClick={() => toggleSection('keyboards')}
            className="w-full flex items-center justify-between p-6 bg-brand-bg md:text-xl font-bold cursor-pointer hover:bg-brand-surface transition-colors"
          >
            <div className="flex items-center gap-4">
              <Terminal className="w-6 h-6 text-brand-accent" />
              {isSindhi ? "ڪيبورڊز" : "Keyboards"}
            </div>
            {openSection === 'keyboards' ? <ChevronDown className="w-6 h-6 text-brand-secondary" /> : <ChevronRight className="w-6 h-6 text-brand-secondary" />}
          </button>

          {openSection === 'keyboards' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-brand-border"
            >
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-brand-secondary text-sm mb-4">
                  {isSindhi ? "سنڌي ۽ اردو ٽائپنگ لاءِ ڪيبورڊز." : "Keyboards for Sindhi and Urdu typing."}
                </p>
                {keyboards.map((item, index) => (
                  <div key={index} className="px-6 py-4 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary shrink-0">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-brand-primary break-words text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.link}
                      download
                      className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-all text-brand-primary shrink-0"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sindhi Fonts Section */}
        <div className="ios-card bg-brand-surface border border-brand-border rounded-ios-lg overflow-hidden">
          <button
            onClick={() => toggleSection('sindhiFonts')}
            className="w-full flex items-center justify-between p-6 bg-brand-bg md:text-xl font-bold cursor-pointer hover:bg-brand-surface transition-colors"
          >
            <div className="flex items-center gap-4">
              <Type className="w-6 h-6 text-brand-accent" />
              {isSindhi ? "سنڌي فونٽس" : "Sindhi Fonts"}
            </div>
            {openSection === 'sindhiFonts' ? <ChevronDown className="w-6 h-6 text-brand-secondary" /> : <ChevronRight className="w-6 h-6 text-brand-secondary" />}
          </button>

          {openSection === 'sindhiFonts' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-brand-border"
            >
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-brand-secondary text-sm mb-4">
                  {isSindhi ? "هتي ڪيترائي بهترين سنڌي فونٽس موجود آهن، توهان پنهنجي پسند وارو فونٽ ڊائون لوڊ ڪري سگهو ٿا." : "Download single TTF files for Sindhi fonts."}
                </p>
                {sindhiFonts.map((item, index) => (
                  <div key={index} className="px-6 py-4 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary shrink-0">
                        <Type className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-brand-primary break-words text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.link}
                      download
                      className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-all text-brand-primary shrink-0"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Urdu Fonts Section */}
        <div className="ios-card bg-brand-surface border border-brand-border rounded-ios-lg overflow-hidden">
          <button
            onClick={() => toggleSection('urduFonts')}
            className="w-full flex items-center justify-between p-6 bg-brand-bg md:text-xl font-bold cursor-pointer hover:bg-brand-surface transition-colors"
          >
            <div className="flex items-center gap-4">
              <Type className="w-6 h-6 text-brand-accent" />
              {isSindhi ? "اردو فونٽس" : "Urdu Fonts"}
            </div>
            {openSection === 'urduFonts' ? <ChevronDown className="w-6 h-6 text-brand-secondary" /> : <ChevronRight className="w-6 h-6 text-brand-secondary" />}
          </button>

          {openSection === 'urduFonts' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-brand-border"
            >
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-brand-secondary text-sm mb-4">
                  {isSindhi ? "اردو لکڻ لاءِ بهترين فونٽس ڊائون لوڊ ڪريو." : "Download beautiful Urdu typography packs."}
                </p>
                {urduFonts.map((item, index) => (
                  <div key={index} className="px-6 py-4 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary shrink-0">
                        <Type className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-brand-primary break-words text-sm sm:text-base">{item.title}</h3>
                        <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.link}
                      download
                      className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-all text-brand-primary shrink-0"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
