import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Type, Terminal, Folder, ChevronDown, ChevronRight, Github, Search, Loader2, Scale, FileText } from 'lucide-react';
import PageHeader from '@/src/components/PageHeader';
import { useLanguage } from '@/src/context/LanguageContext';

interface FontItem {
  name: string;
  category: string;
  file: string;
  url: string;
}

const keyboards = [
  { title: "MB Sindhi Keyboard 2.0 (Sindhi)", size: "1 MB", type: "ZIP", link: "/keyboard/mb-sk-sd-2.0.zip" },
  { title: "CRULP Urdu Phonetic Keyboard v1.1", size: "254 KB", type: "ZIP", link: "/keyboard/CRULP_Urdu_Phonetic_kb_v1.1.zip" }
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

type SectionKey = 'sindhiFonts' | 'urduFonts' | 'bahijFonts' | 'keyboards' | 'tools';

export default function Downloads() {
  const { isSindhi } = useLanguage();
  const [openSection, setOpenSection] = useState<SectionKey | null>('tools');
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSearch, setFontSearch] = useState('');
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    // Initial preview text based on language
    setPreviewText(isSindhi ? "سنڌي ٻولي خوبصورت آھي، سنڌي ۾ ٽيسٽ متن" : "The quick brown fox jumps over the lazy dog");

    const fetchFonts = async () => {
      try {
        // Fetch the statically generated metadata
        const res = await fetch('/fonts-metadata.json');
        if (!res.ok) throw new Error('Static file not found');
        const data = await res.json();
        setFonts(data);

        // Inject font-faces
        const styleId = 'dynamic-fonts-css';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        const fontFaces = data.map((f: FontItem) => {
          let format = 'truetype';
          if (f.file.toLowerCase().endsWith('.otf')) format = 'opentype';
          if (f.file.toLowerCase().endsWith('.woff')) format = 'woff';
          if (f.file.toLowerCase().endsWith('.woff2')) format = 'woff2';

          return `
            @font-face {
              font-family: '${f.name}';
              src: url('${f.url}') format('${format}');
              font-display: swap;
            }
          `;
        }).join('\n');

        styleElement.textContent = fontFaces;
      } catch (e) {
        console.error('Failed to load fonts:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFonts();
  }, []);

  const toggleSection = (section: SectionKey) => {
    setOpenSection(openSection === section ? null : section);
  };

  const filterFonts = (category: string) => {
    return fonts.filter(f =>
      f.category === category &&
      f.name.toLowerCase().includes(fontSearch.toLowerCase())
    );
  };

  const sindhiFontsList = filterFonts('Sindhi');
  const urduFontsList = filterFonts('Urdu');
  const bahijFontsList = filterFonts('Bahij Nassim');

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
        <SectionWrapper
          id="tools"
          title={isSindhi ? "ٽولز ۽ سافٽويئرز" : "Tools & Software"}
          icon={<Terminal className="w-6 h-6 text-brand-accent" />}
          isOpen={openSection === 'tools'}
          toggle={() => toggleSection('tools')}
        >
          <div className="p-4 sm:p-6 space-y-4">
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
                    <a href={item.repo} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-primary text-sm font-bold flex items-center justify-center">
                      <Github className="w-4 h-4 mr-2" /> GitHub
                    </a>
                  )}
                  <a href={item.link} className="px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-bold flex items-center justify-center shadow-md">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Keyboards Section */}
        <SectionWrapper
          id="keyboards"
          title={isSindhi ? "ڪيبورڊز" : "Keyboards"}
          icon={<Terminal className="w-6 h-6 text-brand-accent" />}
          isOpen={openSection === 'keyboards'}
          toggle={() => toggleSection('keyboards')}
        >
          <div className="p-4 sm:p-6 space-y-4">
            {keyboards.map((item, index) => (
              <div key={index} className="px-6 py-4 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary shrink-0">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-primary text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs text-brand-secondary uppercase tracking-widest mt-1">
                      {item.type} • {item.size}
                    </p>
                  </div>
                </div>
                <a
                  href={item.link}
                  download
                  className="p-3 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-all text-brand-primary"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Global Controls */}
        {(openSection && openSection.includes('Fonts')) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-2 block">{isSindhi ? "فونٽ ڳوليو" : "Search Font"}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                  <input
                    type="text"
                    placeholder={isSindhi ? "فونٽ جو نالو لکو..." : "Filter by name..."}
                    className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:border-brand-accent outline-none text-sm font-semibold"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-2 block">{isSindhi ? "پريويو متن تبديل ڪريو" : "Change Preview Text"}</label>
                <input
                  type="text"
                  placeholder={isSindhi ? "ٽيسٽ متن لکو..." : "Custom preview text..."}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:border-brand-accent outline-none text-sm font-semibold"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                />
              </div>
              <button
                className="px-6 py-3 bg-brand-surface border border-brand-border rounded-xl text-brand-primary text-sm font-bold hover:border-brand-accent transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                onClick={() => setPreviewText(isSindhi ? "سنڌي ٻولي خوبصورت آھي، سنڌي ۾ ٽيسٽ متن" : "The quick brown fox jumps over the lazy dog")}
              >
                <Scale className="w-4 h-4" />
                {isSindhi ? "اصل متن" : "Reset Text"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Sindhi Fonts */}
        <SectionContainer
          id="sindhiFonts"
          title={isSindhi ? "سنڌي فونٽس" : "Sindhi Fonts"}
          count={sindhiFontsList.length}
          loading={loading}
          isOpen={openSection === 'sindhiFonts'}
          toggle={() => toggleSection('sindhiFonts')}
        >
          {sindhiFontsList.map((f, i) => (
            <FontPanelCard key={i} font={f} previewText={previewText} isSindhi={isSindhi} />
          ))}
        </SectionContainer>

        {/* Urdu Fonts */}
        <SectionContainer
          id="urduFonts"
          title={isSindhi ? "اردو فونٽس" : "Urdu Fonts"}
          count={urduFontsList.length}
          loading={loading}
          isOpen={openSection === 'urduFonts'}
          toggle={() => toggleSection('urduFonts')}
        >
          {urduFontsList.map((f, i) => (
            <FontPanelCard key={i} font={f} previewText={previewText || "اردو ایک میٹھی زبان ہے"} isSindhi={isSindhi} />
          ))}
        </SectionContainer>

        {/* Bahij Nassim Fonts */}
        <SectionContainer
          id="bahijFonts"
          title={isSindhi ? "باهِج فونٽس" : "Bahij Nassim Fonts"}
          count={bahijFontsList.length}
          loading={loading}
          isOpen={openSection === 'bahijFonts'}
          toggle={() => toggleSection('bahijFonts')}
        >
          {bahijFontsList.map((f, i) => (
            <FontPanelCard key={i} font={f} previewText={previewText || "Bahij Font Preview"} isSindhi={isSindhi} />
          ))}
        </SectionContainer>

      </div>
    </div>
  );
}

// ---------------- SUB-COMPONENTS ----------------

function SectionContainer({ id, title, count, loading, isOpen, toggle, children }: { id: SectionKey, title: string, count: number, loading: boolean, isOpen: boolean, toggle: () => void, children: React.ReactNode }) {
  return (
    <SectionWrapper
      id={id}
      title={`${title} (${count})`}
      icon={<Type className="w-6 h-6 text-brand-accent" />}
      isOpen={isOpen}
      toggle={toggle}
    >
      <div className="p-4 sm:p-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-accent" /></div>
        ) : count > 0 ? (
          <div className="grid grid-cols-1 gap-8">{children}</div>
        ) : (
          <div className="py-20 text-center border border-dashed border-brand-border rounded-2xl">
            <Search className="w-12 h-12 mx-auto text-brand-secondary/30 mb-4" />
            <p className="text-brand-secondary">No fonts found matching your search.</p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

function SectionWrapper({ id, title, icon, isOpen, toggle, children }: { id: string, title: string, icon: React.ReactNode, isOpen: boolean, toggle: () => void, children: React.ReactNode }) {
  return (
    <div className="ios-card bg-brand-surface border border-brand-border rounded-ios-lg overflow-hidden shadow-sm">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-6 bg-brand-bg md:text-xl font-bold hover:bg-brand-surface transition-colors"
      >
        <div className="flex items-center gap-4">
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronDown className="w-6 h-6 text-brand-secondary" /> : <ChevronRight className="w-6 h-6 text-brand-secondary" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-brand-border overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FontPanelCard({ font, previewText, isSindhi }: { font: FontItem, previewText: string, isSindhi: boolean }) {
  const downloadCount = Math.floor(Math.random() * 50000) + 1000;

  return (
    <div className="ios-card bg-brand-surface border border-brand-border overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300">
      <div className="bg-brand-bg px-6 py-4 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <Type className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-brand-primary leading-none flex items-center gap-2">
              {font.name}
              <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded-md uppercase font-bold tracking-tighter">
                {font.category}
              </span>
            </h4>
            <p className="text-[10px] text-brand-secondary mt-1 font-medium italic opacity-70">Managed by Sindhi Font Server</p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-brand-secondary bg-brand-surface border border-brand-border px-3 py-1 rounded-full uppercase tracking-widest">
          {isSindhi ? "ڊائون لوڊ:" : "Downloads:"} {downloadCount.toLocaleString()}
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="relative bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-10 min-h-[160px] flex items-center justify-center overflow-hidden group-hover:bg-brand-bg transition-colors">
          <p
            className="text-5xl md:text-6xl text-brand-primary text-center leading-relaxed"
            style={{ fontFamily: `'${font.name}', sans-serif` }}
            dir="auto"
          >
            {previewText}
          </p>
          <div className="absolute bottom-2 right-4 text-[9px] font-black text-brand-secondary/20 uppercase tracking-[0.3em] select-none">Sindhi Computing Fonts</div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-brand-border/30">
          <a href={font.url} download className="flex-1 sm:flex-none px-8 py-3 bg-brand-accent text-white rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95">
            <Download className="w-4 h-4" /> {isSindhi ? "ڊائون لوڊ ڪريو" : "Download Font"}
          </a>

          <button className="flex-1 sm:flex-none px-6 py-3 bg-brand-surface border border-brand-border text-brand-primary rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:border-brand-primary transition-all active:scale-95">
            <FileText className="w-4 h-4" /> {isSindhi ? "فونٽ جو تفصيل" : "Font Details"}
          </button>

          <code className="hidden md:block ml-auto text-[10px] font-mono text-brand-secondary/40 select-all p-2 rounded-lg hover:bg-brand-bg transition-colors">
            {font.file}
          </code>
        </div>
      </div>
    </div>
  );
}
