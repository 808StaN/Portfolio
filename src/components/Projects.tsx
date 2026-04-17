import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { projects } from '../data/projects';

const easeOut = [0.16, 1, 0.3, 1] as const;

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const statusLabel = {
    live: 'Live',
    'case-study': 'Case Study',
    experimental: 'Experiment',
  }[project.status];

  const statusColor = {
    live: 'text-emerald-400',
    'case-study': 'text-blue-400',
    experimental: 'text-orange-400',
  }[project.status];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.08, ease: easeOut }}
      className="project-card group relative overflow-hidden cursor-pointer"
      style={{ minHeight: '300px' }}
      onClick={() => project.link && window.open(project.link, '_blank')}
      tabIndex={0}
      role="link"
      aria-label={`${project.title} - ${project.description}`}
      onKeyDown={e => e.key === 'Enter' && project.link && window.open(project.link, '_blank')}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${project.accent}18 0%, transparent 60%)`,
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, ${project.accent}80, transparent)` }}
      />

      <div className="relative p-7 md:p-8 flex flex-col h-full" style={{ minHeight: '300px' }}>
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <span
            className="text-[11px] tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.24)', fontFamily: 'var(--font-sans)' }}
          >
            {project.index}
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-medium ${statusColor}`} style={{ fontFamily: 'var(--font-sans)' }}>
              {statusLabel}
            </span>
            <span className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-sans)' }}>
              {project.year}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-xl md:text-[1.65rem] font-600 text-white/90 mb-3 group-hover:text-white transition-colors duration-300"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-5 flex-1"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.tags.map(tag => (
            <span key={tag} className="skill-pill text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className="text-xs text-white/35 group-hover:text-white/60 transition-colors duration-300"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            View project
          </span>
          <motion.span
            className="text-xs text-white/35 group-hover:text-white/60"
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            -&gt;
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section id="work" className="section-shell section-shell-projects relative overflow-hidden">
      {/* Fade starts exactly at second section top and decays downward */}
      <div
        className="absolute left-0 right-0 top-0 h-40 md:h-52 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'linear-gradient(to bottom, rgba(5,8,20,0.28) 0%, rgba(5,8,20,0) 100%)',
        }}
      />

      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse 84% 54% at 50% 0%, rgba(120,162,255,0.14) 0%, rgba(22,128,255,0.05) 44%, transparent 74%)',
        }}
      />

      <div className="section-inner relative z-10">
        {/* Section header */}
        <div ref={headerRef} className="mb-12 md:mb-14">
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: -20 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <span className="section-label">Selected Work</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="section-label">{projects.length} projects</span>
          </motion.div>

          <motion.h2
            className="section-title text-white/90 max-w-[13ch]"
            style={{ fontSize: 'clamp(1.95rem, 3.7vw, 3.95rem)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          >
            Things I have
            <br />
            <span style={{ color: 'rgba(255,255,255,0.58)' }}>built and shipped.</span>
          </motion.h2>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 md:mt-14 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
        >
          <a
            href="https://github.com/808StaN?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            See more on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
