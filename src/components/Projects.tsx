import { CSSProperties, useEffect, useRef, useState } from 'react';
import { projects } from '../data/projects';

function slashTitle(title: string) {
  return title.split(' ').join(' / ');
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollTrackProgress, setScrollTrackProgress] = useState(0);

  const steps = Math.max(1, projects.length - 1);
  const active = projects[activeIndex];

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const header = headerRef.current;
      if (!section || !header) return;

      const sectionRect = section.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const sectionTopDoc = window.scrollY + sectionRect.top;
      const headerTopDoc = window.scrollY + headerRect.top;
      const startY = headerTopDoc;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(Math.max(window.scrollY - startY, 0), totalScrollable);
      const normalized = scrolled / totalScrollable;
      const rawIndexProgress = normalized * steps;

      setScrollTrackProgress(rawIndexProgress);
      setActiveIndex(prev => {
        const next = Math.max(0, Math.min(projects.length - 1, Math.floor(rawIndexProgress + 0.5)));
        return prev === next ? prev : next;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [steps]);

  const goTo = (idx: number) => {
    const section = sectionRef.current;
    const header = headerRef.current;
    if (!section || !header) return;
    const clamped = Math.max(0, Math.min(projects.length - 1, idx));

    const sectionRect = section.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const sectionTopDoc = window.scrollY + sectionRect.top;
    const headerTopDoc = window.scrollY + headerRect.top;
    const startY = headerTopDoc;
    const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
    const totalScrollable = Math.max(1, endY - startY);
    const targetScroll = startY + (clamped / steps) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="section-shell projects-monopo relative"
      style={{ ['--projects-steps' as any]: steps } as CSSProperties}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(120% 92% at 50% 60%, ${active.accent}2e 0%, rgba(10,16,38,0.2) 45%, transparent 75%)`,
        }}
      />

      <div className="section-inner projects-inner relative z-10">
        <div className="projects-stage">
          <div ref={headerRef} className="projects-header">
            <div className="flex items-center gap-3 mb-5">
            <span className="section-label">Selected Work</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="section-label">{projects.length} projects</span>
            </div>

            <h2
            className="section-title text-white/90 max-w-[13ch]"
            style={{ fontSize: 'clamp(1.95rem, 3.7vw, 3.95rem)' }}
          >
            Things I have
            <br />
            <span style={{ color: 'rgba(255,255,255,0.58)' }}>built and shipped.</span>
            </h2>
          </div>

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
              <div className="projects-visual-scroll">
                <div
                  className="projects-visual-track"
                  style={{ transform: `translate3d(0, -${scrollTrackProgress * 100}%, 0)` }}
                >
                  {projects.map(project => (
                    <article key={project.id} className="projects-visual-item">
                      <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
                    </article>
                  ))}
                </div>
              </div>
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
