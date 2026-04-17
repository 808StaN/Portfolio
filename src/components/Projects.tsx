import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '../data/projects';

const easeOut = [0.16, 1, 0.3, 1] as const;

function slashTitle(title: string) {
  return title.split(' ').join(' / ');
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = projects[activeIndex];

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));
    if (clamped === activeIndex) return;
    setActiveIndex(clamped);
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      if (Math.abs(e.deltaY) < 12) return;

      const rect = section.getBoundingClientRect();
      const inProjectsZone = rect.top <= 90 && rect.bottom >= window.innerHeight * 0.92;
      if (!inProjectsZone) return;

      const goingNext = e.deltaY > 0;
      const canGoNext = activeIndex < projects.length - 1;
      const canGoPrev = activeIndex > 0;

      if ((goingNext && canGoNext) || (!goingNext && canGoPrev)) {
        e.preventDefault();
        if (lockRef.current) return;
        lockRef.current = true;
        if (goingNext) next();
        else prev();
        window.setTimeout(() => {
          lockRef.current = false;
        }, 520);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

  return (
    <section id="work" ref={sectionRef} className="section-shell projects-monopo relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120% 92% at 50% 60%, ${active.accent}2e 0%, rgba(10,16,38,0.2) 45%, transparent 75%)`,
        }}
      />

      <div className="section-inner relative z-10">
        <div ref={headerRef} className="mb-10 md:mb-12">
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          >
            Things I have
            <br />
            <span style={{ color: 'rgba(255,255,255,0.58)' }}>built and shipped.</span>
          </motion.h2>
        </div>

        <div className="projects-stage">
          <div className="projects-layout">
            <div className="projects-rail">
              {projects.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to ${p.title}`}
                  className={`projects-rail-dot ${idx === activeIndex ? 'is-active' : ''}`}
                />
              ))}
            </div>

            <div className="projects-meta">
              <span className="projects-kicker">Recent Work</span>
              <h2 className="projects-title">{slashTitle(active.title)}</h2>
              <p className="projects-category">{active.category}</p>
              <div className="projects-tagline">
                {active.tags.slice(0, 3).map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="projects-visual-wrap">
              <AnimatePresence mode="wait">
                <motion.article
                  key={active.id}
                  className="projects-visual-card"
                  initial={{ opacity: 0, y: 22, scale: 0.992 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.995 }}
                  transition={{ duration: 0.52, ease: easeOut }}
                >
                  <div className="projects-image-top">
                    <img src={active.image} alt={`${active.title} preview`} loading="eager" />
                  </div>
                  <div className="projects-image-bottom">
                    <img
                      src={active.secondaryImage || active.image}
                      alt={`${active.title} detail`}
                      loading="lazy"
                    />
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>

          <div className="projects-bottom">
            <div className="projects-counter">
              {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </div>
            <a
              href="https://github.com/808StaN?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="projects-discover-btn"
            >
              Discover all projects -&gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
