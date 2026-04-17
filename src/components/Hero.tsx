import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const words = ['production-ready', 'full-stack', 'reactive', 'reliable'];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReduced || !wordRef.current) return;
    const el = wordRef.current;
    let idx = 0;
    el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

    const cycle = () => {
      idx = (idx + 1) % words.length;
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        el.textContent = words[idx];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 350);
    };

    const timer = setInterval(cycle, 2800);
    return () => clearInterval(timer);
  }, [prefersReduced]);

  return (
    <section
      className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Front-page darkening at the bottom, mirrored with next section start */}
      <div
        className="absolute left-0 right-0 bottom-0 h-40 md:h-52 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,8,20,0) 0%, rgba(5,8,20,0.28) 100%)',
        }}
      />

      {/* Content */}
      <div className="hero-inner relative z-10 flex flex-col justify-between min-h-screen pt-24 md:pt-28 pb-12 md:pb-14">
        <div className="flex-1 flex flex-col justify-end pb-6 md:pb-10">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          >
            <span className="w-6 h-px bg-white/40" />
            <span className="section-label">Full-Stack Developer - React / Node.js</span>
          </motion.div>

          {/* Main headline */}
          <div className="overflow-hidden">
            <motion.h1
              className="hero-headline hero-headline-gradient"
              style={{ fontSize: 'clamp(2.05rem, 6.7vw, 6rem)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.32, ease: easeOut }}
            >
              Building
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              className="hero-headline"
              style={{ fontSize: 'clamp(2.05rem, 6.7vw, 6rem)', color: 'rgba(255,255,255,0.88)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.44, ease: easeOut }}
            >
              <span
                ref={wordRef}
                style={{
                  display: 'inline-block',
                  color: 'rgba(255,255,255,0.65)',
                  fontStyle: 'italic',
                }}
              >
                {words[0]}
              </span>
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              className="hero-headline hero-headline-gradient"
              style={{ fontSize: 'clamp(2.05rem, 6.7vw, 6rem)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.56, ease: easeOut }}
            >
              experiences.
            </motion.h1>
          </div>

          {/* Sub + CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 md:gap-8">
            <motion.p
              className="max-w-md text-sm md:text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'var(--font-sans)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: easeOut }}
            >
              Building production-ready web apps, browser extensions, and desktop tools.
              Focused on practical delivery, clean UX, and robust implementation.
            </motion.p>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.82, ease: easeOut }}
            >
              <a
                href="#work"
                className="btn-primary"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Work
              </a>
              <a
                href="#contact"
                className="btn-secondary"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom meta row */}
        <motion.div
          className="relative flex items-center justify-start min-h-[68px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span
              className="text-[10px] text-white/30 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Open to work
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 md:bottom-6 flex flex-col items-center gap-2">
            <span
              className="text-[10px] text-white/25 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Scroll
            </span>
            <div className="scroll-indicator">
              <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
                <path
                  d="M6 1V17M6 17L1 12M6 17L11 12"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
