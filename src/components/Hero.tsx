import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import SectionBandsBackground from './SectionBandsBackground';
import { sectionColors } from '../constants/sectionColors';
import { useSectionNavigation } from './SectionNavigation';
import GravityLink from './ui/GravityLink';

const words = ['fast', 'scalable', 'reliable', 'responsive', 'modern'];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Hero({ ready }: { ready: boolean }) {
  const [prefersReduced, setPrefersReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const { navigate, homeEntrance } = useSectionNavigation();
  const entrance = useAnimationControls();
  const wordRef = useRef<HTMLSpanElement>(null);
  const outlineFilterId = useId();

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    entrance.stop();
    entrance.set('hidden');
    if (ready) {
      if (prefersReduced) entrance.set('visible');
      else void entrance.start('visible');
    }
  }, [entrance, ready, homeEntrance, prefersReduced]);

  const handleProjectsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    // Capture before Lenis's native anchor listener on the scrollport.
    event.stopPropagation();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void navigate('#work');
  };

  useEffect(() => {
    if (!ready || prefersReduced || !wordRef.current) return;
    const el = wordRef.current;
    el.textContent = words[0];
    let idx = 0;
    el.style.transition = 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

    let timeout = 0;
    const cycle = () => {
      idx = (idx + 1) % words.length;
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      timeout = window.setTimeout(() => {
        el.textContent = words[idx];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 350);
    };

    const timer = setInterval(cycle, 2800);
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };
  }, [prefersReduced, ready, homeEntrance]);

  return (
    <section
      id="home"
      className="section-tilt-section"
      data-section-tilt
      data-section-color={sectionColors.home}
      aria-label="Hero"
    >
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <filter id={outlineFilterId} x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            {/* Outline the merged text silhouette, not overlapping font paths. */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="outer" />
            <feMorphology in="SourceAlpha" operator="erode" radius="1" result="inner" />
            <feComposite in="outer" in2="inner" operator="out" result="outline" />
            <feFlood floodColor="white" floodOpacity="0.88" />
            <feComposite in2="outline" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="section-tilt-panel hero-tilt-panel" style={{ background: sectionColors.home }}>
        <SectionBandsBackground palette="home" />

        <div className="section-tilt-container hero-inner">
          <div className="hero-composition">
            <h1 className="hero-title">
              <span className="hero-headline-reveal">
                <motion.span
                  className="hero-headline hero-headline-gradient"
                  initial="hidden"
                  animate={entrance}
                  variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.52, ease: easeOut }}
                >
                  I build
                </motion.span>
              </span>

              <span className="hero-headline-reveal">
                <motion.span
                  className="hero-headline hero-headline-rotating"
                  initial="hidden"
                  animate={entrance}
                  variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.64, ease: easeOut }}
                >
                  <span
                    ref={wordRef}
                    style={{
                      display: 'inline-block',
                      letterSpacing: '0.01em',
                      color: 'white',
                      filter: `url(#${outlineFilterId})`,
                    }}
                  >
                    {words[0]}
                  </span>
                </motion.span>
              </span>

              <span className="hero-headline-reveal">
                <motion.span
                  className="hero-headline hero-headline-gradient"
                  initial="hidden"
                  animate={entrance}
                  variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.76, ease: easeOut }}
                >
                  web apps
                </motion.span>
              </span>
            </h1>

            <div className="hero-logo-anchor" data-hero-shader-logo role="img" aria-label="React">
              <svg viewBox="-11.5 -10.23174 23 20.46348" aria-hidden="true" focusable="false">
                <circle r="2.05" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1" fill="none">
                  <ellipse rx="11" ry="4.2" />
                  <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                  <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
              </svg>
            </div>

            <div className="hero-copy">
              <motion.p
                className="hero-description"
                initial="hidden"
                animate={entrance}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.9, ease: easeOut }}
              >
                Frontend-focused developer working with React, Next.js, and TypeScript. I turn ideas into fast, polished digital experiences with a focus on design, performance, and usability.
              </motion.p>

              <motion.div
                className="hero-actions"
                initial="hidden"
                animate={entrance}
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: prefersReduced ? 0 : 0.85, delay: prefersReduced ? 0 : 1.02, ease: easeOut }}
              >
                <GravityLink
                  href="#work"
                  text="View projects"
                  variant="primary"
                  icon="arrow-down"
                  sizing={{ paddingX: 28, paddingY: 14, fontSize: 14 }}
                  onClickCapture={handleProjectsClick}
                />
                <GravityLink
                  href="https://ziianpdcwxtnkuojaxtp.supabase.co/storage/v1/object/public/Portfolio/Dawid_Stanisz_CV.pdf"
                  download
                  text="Download CV"
                  variant="primary"
                  icon="download"
                  sizing={{ paddingX: 28, paddingY: 14, fontSize: 14 }}
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            className="hero-footer"
            initial="hidden"
            animate={entrance}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ delay: prefersReduced ? 0 : 1.4, duration: prefersReduced ? 0 : 0.8 }}
          >
            <span className="hero-scroll-label">Scroll</span>
            <div className="scroll-indicator" style={{ opacity: 0.8 }}>
              <svg width="14" height="20" viewBox="0 0 12 18" fill="none" aria-hidden="true">
                <path
                  d="M6 1V17M6 17L1 12M6 17L11 12"
                  stroke="rgba(255,255,255,0.52)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
