import { motion } from 'motion/react';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    title: "SaaS Starter Kit",
    description: "A high-performance boilerplate for modern SaaS applications using React, Node, and Supabase.",
    tags: ["React", "TypeScript", "Node.js", "Supabase"],
    link: "#",
    github: "#"
  },
  {
    title: "AI Image Processor",
    description: "A specialized tool for bulk processing and optimizing images using advanced AI models.",
    tags: ["Python", "TensorFlow", "Next.js"],
    link: "#",
    github: "#"
  },
  {
    title: "DevFlow Dashboard",
    description: "A minimalist project management tool designed specifically for solo developers and small teams.",
    tags: ["React", "Tailwind", "Firebase"],
    link: "#",
    github: "#"
  },
  {
    title: "Office Management System",
    description: "This is a live demonstration of the Office Management System developed by Raja Babar. You can explore features without signing up.",
    tags: ["React", "Node.js", "Enterprise"],
    link: "https://project.rajababar.com",
    github: "#"
  }
];

export default function Projects() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
        <p className="text-brand-secondary text-lg">A collection of my latest work and ongoing developments.</p>
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
                src={`https://picsum.photos/seed/${project.title}/800/600`} 
                alt={project.title}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-brand-secondary text-sm mb-4 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-brand-bg border border-brand-border text-[10px] uppercase tracking-wider font-bold text-brand-secondary">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-4">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-secondary hover:text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-secondary hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
