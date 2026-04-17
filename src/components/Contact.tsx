import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const easeOut = [0.16, 1, 0.3, 1] as const;

const channels = [
  {
    label: 'GitHub',
    handle: '@808StaN',
    href: 'https://github.com/808StaN',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'Main Projects',
    handle: '/808StaN?tab=repositories',
    href: 'https://github.com/808StaN?tab=repositories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className="section-shell relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 72%)',
        }}
      />

      <div className="section-inner relative" ref={ref}>
        <motion.div
          className="flex items-center gap-3 mb-14"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <span className="section-label">Contact</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] gap-14 lg:gap-24">
          <div>
            <motion.h2
              className="section-title text-white/90 mb-7 max-w-[12ch]"
              style={{ fontSize: 'clamp(2rem, 3.7vw, 3.9rem)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            >
              Ready to
              <br />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>build together.</span>
            </motion.h2>

            <motion.p
              className="text-base leading-relaxed max-w-[62ch]"
              style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            >
              Best contact path is GitHub. If your team needs a React/Node.js engineer for product work,
              integrations, or tooling, reach out and I will respond quickly.
            </motion.p>
          </div>

          <div className="flex flex-col justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
            >
              <span
                className="text-[11px] uppercase tracking-widest mb-3 block"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-sans)' }}
              >
                Location
              </span>
              <span
                className="text-lg md:text-xl font-medium text-white/80"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
              >
                Poland (UTC+1 / UTC+2)
              </span>
            </motion.div>

            <div className="divider" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: easeOut }}
            >
              <span
                className="text-[11px] uppercase tracking-widest mb-5 block"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-sans)' }}
              >
                Channels
              </span>
              <div className="space-y-4">
                {channels.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                    aria-label={`${s.label}: ${s.handle}`}
                  >
                    <span className="text-white/30 group-hover:text-white/65 transition-colors duration-300">
                      {s.icon}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className="text-[11px] text-white/30 group-hover:text-white/55 transition-colors duration-300"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {s.label}
                      </span>
                      <span
                        className="text-sm text-white/60 group-hover:text-white/85 transition-colors duration-300"
                        style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}
                      >
                        {s.handle}
                      </span>
                    </div>
                    <span className="ml-auto text-white/20 group-hover:text-white/45 group-hover:translate-x-1 transition-all duration-300">
                      -&gt;
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
