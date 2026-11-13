import { useEffect, useRef, useState, type FocusEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { moreProjects } from '../data/projects';
import { sectionColors } from '../constants/sectionColors';
import { getScrollViewport } from '../utils/scroll';
import { scrollToY, useLenis } from './LenisScroll';
import SectionBandsBackground from './SectionBandsBackground';
import ProjectTitleStretch from './ProjectTitleStretch';
import GravityLink from './ui/GravityLink';
import './MoreProjects.css';

export const moreProjectsMedia = '(min-width: 1280px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)';

export default function MoreProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    const section = sectionRef.current!;
    const track = section.querySelector<HTMLElement>('.more-projects-track')!;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.more-projects-card'));
    const viewport = getScrollViewport() ?? window;
    const media = matchMedia(moreProjectsMedia);
    let frame = 0;
    const update = () => {
      frame = 0;
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      const position = media.matches ? -(Number(gsap.getProperty(track, 'x')) || 0) / step : 0;
      const nextActive = Math.max(0, Math.min(cards.length - 1, Math.round(position)));
      cards.forEach((card, index) => {
        card.style.setProperty('--project-focus', !media.matches || index === nextActive ? '1' : '0');
      });
      setActive(nextActive);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    viewport.addEventListener('scroll', schedule, { passive: true });
    ScrollTrigger.addEventListener('refresh', schedule);
    media.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener('scroll', schedule);
      ScrollTrigger.removeEventListener('refresh', schedule);
      media.removeEventListener('change', schedule);
      cards.forEach(card => card.style.removeProperty('--project-focus'));
    };
  }, []);

  const visit = (index: number, immediate = false) => {
    const section = sectionRef.current!;
    const track = section.querySelector<HTMLElement>('.more-projects-track')!;
    const cards = track.querySelectorAll<HTMLElement>('.more-projects-card');
    const trigger = ScrollTrigger.getById('section-target-about');
    if (!matchMedia(moreProjectsMedia).matches || trigger?.trigger !== section) return;
    const target = Math.max(0, Math.min(cards.length - 1, index));
    scrollToY(trigger.start + cards[target].offsetLeft - cards[0].offsetLeft, lenis, { immediate, duration: 0.65 });
  };

  const revealFocusedCard = (event: FocusEvent<HTMLElement>) => {
    const card = event.target.closest<HTMLElement>('.more-projects-card');
    if (card && event.target.matches(':focus-visible')) visit(Number(card.dataset.moreProjectIndex), true);
  };

  return (
    <section ref={sectionRef} id="more-projects" className="section-tilt-section more-projects-section" data-section-tilt data-section-group="projects" data-section-color={sectionColors.moreProjects} data-more-projects aria-label="More projects">
      <div className="section-tilt-panel more-projects-panel" style={{ background: sectionColors.moreProjects }}>
        <SectionBandsBackground palette="moreProjects" />
        <div className="section-tilt-container more-projects-inner">
          <header className="section-inner more-projects-header">
            <ProjectTitleStretch title="More projects" projectId="more-projects" />
            <div className="more-projects-controls">
              <span className="more-projects-position" aria-label={`Project ${active + 1} of ${moreProjects.length}`}>{String(active + 1).padStart(2, '0')}<span aria-hidden="true"> / {String(moreProjects.length).padStart(2, '0')}</span></span>
              <button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => visit(active - 1)}><span aria-hidden="true">&#8592;</span></button>
              <button type="button" aria-label="Next project" disabled={active === moreProjects.length - 1} onClick={() => visit(active + 1)}><span aria-hidden="true">&#8594;</span></button>
            </div>
          </header>
          <div className="more-projects-window" onFocusCapture={revealFocusedCard}>
            <ul className="more-projects-track">
              {moreProjects.map((project, index) => (
                <li className="more-projects-card" key={project.id} data-more-project-index={index}>
                  <img className="more-projects-image" src={project.image} alt={`${project.title} preview`} width="1600" height="1000" loading="lazy" decoding="async" />
                  <div className="more-projects-caption">
                    <div className="more-projects-card-heading"><h3>{project.title}</h3><p>{project.category}</p></div>
                    <p className="more-projects-description">{project.description}</p>
                    <div className="more-projects-links">
                      {project.links.map(link => (
                        <GravityLink
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title}: ${link.label} (opens in a new tab)`}
                          text={link.label}
                          variant="project"
                          icon="arrow-up-right"
                          sizing={{ paddingX: 17, paddingY: 10, fontSize: 12.5 }}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
