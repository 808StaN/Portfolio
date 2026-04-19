import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const words = ['fast', 'scalable', 'reliable','responsive', 'modern'];

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
      id="home"
      className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
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
              I build
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
              web apps.
            </motion.h1>
          </div>

          {/* Sub */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 md:gap-8">
            <motion.p
              className="max-w-md text-sm md:text-base leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'var(--font-sans)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: easeOut }}
            >
React + Node.js Developer focused on building web apps and desktop tools. I care about speed, clean UX, and practical delivery from concept to release.            </motion.p>
          </div>
        </div>

        {/* Bottom meta row */}
        <motion.div
          className="relative flex items-center justify-center min-h-[68px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
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
    </section>
  );
}
