import { motion } from 'motion/react';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Link } from 'react-router-dom';

const getProjects = (isSindhi: boolean) => [
  {
    title: isSindhi ? "آفيس مئنيجمينٽ سسٽم" : "Office Management System",
    description: isSindhi ? "هي هڪ آفيس مئنيجمينٽ سسٽم جو لائيو ڊيمو آهي جيڪو راجا ٻٻر پاران ٺاهيو ويو آهي. توهان سائن اپ ڪرڻ کانسواءِ هي پروجيڪٽ ڏسي سگهو ٿا." : "This is a live demonstration of the Office Management System developed by Raja Babar. You can explore features without signing up.",
    tags: ["React", "Node.js", "Enterprise"],
    link: "https://project.rajababar.com",
    github: null,
    internalLink: null,
    imageSeed: "office"
  },
  {
    title: isSindhi ? "پي ڊي ايف ميٽاڊيٽا ايڪسٽريڪٽر" : "PDF Metadata Extraction Pro",
    description: isSindhi ? "هن ٽول سان توهان ڪيترن ئي پي ڊي ايف فائلزجو ڊيٽا ڪڍي سگهو ٿا." : "A tool that extracts full metadata including hidden standard and custom fields from multiple PDFs.",
    tags: ["Python", "React", "PDF"],
    link: null,
    github: "https://github.com/rajababarofficial/PDF-Metadata-Extraction-Pro",
    internalLink: "/tools/pdf-metadata",
    imageSeed: "pdf,document,file"
  }
];

export default function Projects() {
  const { isSindhi } = useLanguage();
  const projects = getProjects(isSindhi);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{isSindhi ? 'الائيو پروجيڪٽس' : 'Live Projects'}</h1>
        <p className="text-brand-secondary text-lg">{isSindhi ? 'منهنجا هلندڙ ۽ خاص پروجيڪٽس.' : 'A collection of my live and specific software developments.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-all"
          >
            <div className="h-48 rounded-xl bg-brand-bg mb-6 overflow-hidden border border-brand-border">
              <img
                src={`https://picsum.photos/seed/${project.imageSeed}/800/600`}
                alt={project.title}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-brand-secondary text-sm mb-4 leading-relaxed line-clamp-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-brand-bg border border-brand-border text-[10px] uppercase tracking-wider font-bold text-brand-secondary">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-4 items-center">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:text-white transition-colors"
                  title="Live Demo"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              {project.internalLink && (
                <Link
                  to={project.internalLink}
                  className="text-brand-secondary hover:text-white transition-colors"
                  title="Open Tool"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:text-white transition-colors"
                  title="GitHub Repo"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
