import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { projects } from '../data/projects';

const easeOut = [0.16, 1, 0.3, 1] as const;

const statusLabel = {
  live: 'Live',
  'case-study': 'Case Study',
  experimental: 'Experiment',
} as const;

const statusColor = {
  live: 'text-emerald-400',
  'case-study': 'text-blue-400',
  experimental: 'text-orange-400',
} as const;

function ProjectSlide({ project }: { project: typeof projects[0] }) {
  return (
    <article
      className="project-card overflow-hidden"
      style={{ minHeight: 'min(72vh, 720px)' }}
    >
      <div className="relative h-[42%] min-h-[220px]">
        <img
          src={project.image}
          alt={`${project.title} preview`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(8,14,34,0.08) 0%, rgba(8,14,34,0.35) 62%, rgba(8,14,34,0.78) 100%)',
          }}
        />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span
            className="text-[11px] tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)' }}
          >
            {project.index}
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-medium ${statusColor[project.status]}`}>
              {statusLabel[project.status]}
            </span>
            <span
              className="text-[11px]"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}
            >
              {project.year}
            </span>
          </div>
        </div>
      </div>

      <div className="p-7 md:p-9 flex flex-col gap-5 h-[58%] min-h-[300px]">
        <div>
          <h3
            className="text-2xl md:text-4xl font-700 text-white/90 mb-2"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {project.title}
          </h3>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-sans)' }}
          >
            {project.description}
          </p>
        </div>

        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.46)', fontFamily: 'var(--font-sans)' }}
        >
          {project.longDescription}
        </p>

        <div className="mt-auto pt-3 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className="skill-pill">
                {tag}
              </span>
            ))}
          </div>

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white/85 transition-colors duration-300"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              View repository
              <span>-&gt;</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));
    const el = scrollerRef.current;
    if (!el) return;
    setActiveIndex(clamped);
    el.scrollTo({
      left: clamped * el.clientWidth,
      behavior: 'smooth',
    });
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleResize = () => {
      el.scrollTo({ left: activeIndex * el.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      if (Math.abs(e.deltaY) < 14) return;

      const rect = section.getBoundingClientRect();
      const inSection = rect.top <= 120 && rect.bottom >= window.innerHeight * 0.55;
      if (!inSection) return;

      const isNext = e.deltaY > 0;
      const canGoNext = activeIndex < projects.length - 1;
      const canGoPrev = activeIndex > 0;

      if ((isNext && canGoNext) || (!isNext && canGoPrev)) {
        e.preventDefault();
        if (lockRef.current) return;
        lockRef.current = true;
        if (isNext) next();
        else prev();
        window.setTimeout(() => {
          lockRef.current = false;
        }, 420);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

  return (
    <section id="work" ref={sectionRef} className="section-shell relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            'radial-gradient(ellipse 84% 54% at 50% 0%, rgba(120,162,255,0.14) 0%, rgba(22,128,255,0.05) 44%, transparent 74%)',
        }}
      />

      <div className="section-inner relative z-10">
        <div ref={headerRef} className="mb-10 md:mb-12">
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: -20 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <span className="section-label">Selected Work</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="section-label">
              {activeIndex + 1}/{projects.length}
            </span>
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

        <div className="relative">
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Previous project"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center border border-white/20 bg-black/25 text-white/75 hover:text-white hover:border-white/40 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300"
          >
            &#x2039;
          </button>

          <button
            onClick={next}
            disabled={activeIndex === projects.length - 1}
            aria-label="Next project"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center border border-white/20 bg-black/25 text-white/75 hover:text-white hover:border-white/40 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300"
          >
            &#x203A;
          </button>

          <div
            ref={scrollerRef}
            className="projects-scroller flex overflow-x-auto snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={e => {
              const el = e.currentTarget;
              const nextIndex = Math.round(el.scrollLeft / el.clientWidth);
              if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
            }}
          >
            {projects.map(project => (
              <div key={project.id} className="min-w-full snap-start">
                <ProjectSlide project={project} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {projects.map((project, idx) => (
            <button
              key={project.id}
              onClick={() => goTo(idx)}
              aria-label={`Go to ${project.title}`}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: activeIndex === idx ? '30px' : '10px',
                background: activeIndex === idx ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.24)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
