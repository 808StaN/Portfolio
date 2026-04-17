import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const easeOut = [0.16, 1, 0.3, 1] as const;

const stats = [
  { value: '11', label: 'Public repositories' },
  { value: '2', label: 'GitHub stars' },
  { value: '2024', label: 'Active since' },
  { value: 'PL', label: 'Based in Poland' },
];

const values = [
  {
    icon: 'o',
    title: 'Ship Real Products',
    text: 'I focus on usable apps, extensions, and desktop tools that solve concrete problems.',
  },
  {
    icon: '[]',
    title: 'Full-Stack Practicality',
    text: 'React and Node.js first, with room for desktop stacks and game-related tooling when needed.',
  },
  {
    icon: '<>',
    title: 'Consistent Iteration',
    text: 'I prefer fast feedback loops, measurable progress, and clean refactors over overengineering.',
  },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="section-shell relative overflow-hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-18%',
          top: '18%',
          width: '58%',
          height: '58%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 72%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="section-inner relative" ref={ref}>
        <motion.div
          className="flex items-center gap-3 mb-14"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <span className="section-label">About</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-14 lg:gap-20">
          <div>
            <motion.h2
              className="section-title text-white/90 mb-8 max-w-[13ch]"
              style={{ fontSize: 'clamp(1.95rem, 3.5vw, 3.8rem)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            >
              Building products
              <br />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>that people use.</span>
            </motion.h2>

            <motion.div
              className="space-y-4 max-w-[66ch]"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            >
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'var(--font-sans)' }}>
                I am StaN, a full-stack developer from Poland focused on React and Node.js. I build web products,
                browser extensions, and desktop applications.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sans)' }}>
                My repositories include OtakuVersus, OpenStudio, InstaFetch, and tooling projects that mix frontend
                execution with practical backend logic.
              </p>
              <p className="text-sm md:text-base leading-[1.75]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-sans)' }}>
                Open for freelance and full-time opportunities where product delivery speed and quality both matter.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-10">
            <motion.div
              className="grid grid-cols-2 gap-px"
              style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-center p-7"
                  style={{
                    background: 'rgba(10,18,44,0.68)',
                    borderRadius: i === 0 ? '16px 0 0 0' : i === 1 ? '0 16px 0 0' : i === 2 ? '0 0 0 16px' : '0 0 16px 0',
                  }}
                >
                  <span className="counter-number">{stat.value}</span>
                  <span
                    className="text-[11px] mt-1"
                    style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-sans)' }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <div className="space-y-5">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="flex gap-4 group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.35 + i * 0.1, ease: easeOut }}
                >
                  <span
                    className="text-sm mt-0.5 text-white/25 group-hover:text-white/55 transition-colors duration-300 select-none"
                    aria-hidden="true"
                  >
                    {v.icon}
                  </span>
                  <div>
                    <h4
                      className="text-sm font-500 text-white/70 mb-1.5"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                    >
                      {v.title}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.44)', fontFamily: 'var(--font-sans)' }}
                    >
                      {v.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
