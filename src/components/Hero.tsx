import { useEffect, useId, useRef, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import HeroHoleBackground from './HeroHoleBackground';
import { sectionColors } from '../constants/sectionColors';
import { scrollToY, useLenis } from './LenisScroll';
import GravityLink from './ui/GravityLink';

const words = ['fast', 'scalable', 'reliable', 'responsive', 'modern'];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Hero({ ready }: { ready: boolean }) {
  const prefersReduced = useReducedMotion();
  const lenis = useLenis();
  const wordRef = useRef<HTMLSpanElement>(null);
  const outlineFilterId = useId();

  const handleProjectsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const work = document.getElementById('work');
    if (!work) return;

    const maxScrollTop = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const top = window.scrollY + work.getBoundingClientRect().top;
    scrollToY(Math.min(Math.max(0, top), maxScrollTop), lenis, { duration: 1.15 });
  };

  useEffect(() => {
    if (!ready || prefersReduced || !wordRef.current) return;
    const el = wordRef.current;
    let idx = 0;
    el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

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
    };
  }, [prefersReduced, ready]);

  return (
    <section
      id="home"
      className="section-tilt-section relative w-full min-h-screen flex flex-col justify-center overflow-hidden"
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
        <HeroHoleBackground />

        {/* Content */}
        <div className="section-tilt-container hero-inner relative z-10 flex flex-col justify-between min-h-screen pt-24 md:pt-28 pb-12 md:pb-14">
        <div className="flex-1 flex flex-col items-center justify-center text-center pb-10 md:pb-14">
          {/* Main headline */}
          <div className="hero-headline-reveal">
            <motion.h1
              className="hero-headline hero-headline-gradient"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 28 }}
              transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.52, ease: easeOut }}
            >
              I build
            </motion.h1>
          </div>

          <div className="hero-headline-reveal">
            <motion.h1
              className="hero-headline"
              style={{ color: 'rgba(255,255,255,0.88)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 28 }}
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
            </motion.h1>
          </div>

          <div className="hero-headline-reveal">
            <motion.h1
              className="hero-headline hero-headline-gradient"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 28 }}
              transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.76, ease: easeOut }}
            >
              web apps
            </motion.h1>
          </div>

          {/* Sub */}
          <div className="hero-copy flex flex-col items-center gap-6 md:gap-7">
            <motion.p
              className="max-w-[46rem] text-sm md:text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'var(--font-sans)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
              transition={{ duration: prefersReduced ? 0 : 0.9, delay: prefersReduced ? 0 : 0.9, ease: easeOut }}
            >
              Frontend-focused developer working with React, Next.js, and TypeScript. I turn ideas into fast, polished digital experiences with a focus on design, performance, and usability.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 18 }}
              transition={{ duration: prefersReduced ? 0 : 0.85, delay: prefersReduced ? 0 : 1.02, ease: easeOut }}
            >
              <GravityLink
                href="#work"
                text="View projects"
                variant="primary"
                icon="arrow-down"
                sizing={{ paddingX: 28, paddingY: 14, fontSize: 14 }}
                onClick={handleProjectsClick}
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

        {/* Bottom meta row */}
        <motion.div
          className="relative flex items-center justify-center min-h-[68px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: prefersReduced ? 0 : 1.4, duration: prefersReduced ? 0 : 0.8 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 md:bottom-6 flex flex-col items-center gap-2.5">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}
            >
              Scroll
            </span>
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
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
