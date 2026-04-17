import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const easeOut = [0.16, 1, 0.3, 1] as const;

const categories = [
  {
    label: 'Frontend',
    color: '#4f8ef7',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Vite'],
  },
  {
    label: 'Backend',
    color: '#14b8a6',
    skills: ['Node.js', 'REST APIs', 'Auth', 'Realtime Features', 'Database Integration'],
  },
  {
    label: 'Desktop and Tooling',
    color: '#f97316',
    skills: ['Electron', 'C# / .NET', 'Java', 'CLI Scripts', 'Project Automation'],
  },
  {
    label: 'Browser Extensions',
    color: '#10b981',
    skills: ['Chrome Extensions', 'Manifest V3', 'DOM APIs', 'Content Scripts', 'Packaging'],
  },
  {
    label: 'Audio and Creative',
    color: '#f59e0b',
    skills: ['Web Audio API', 'Interactive UI', 'Game Logic', 'Visual Styling'],
  },
  {
    label: 'Workflow',
    color: '#ec4899',
    skills: ['GitHub', 'Vercel', 'Debugging', 'Shipping MVPs', 'Continuous Iteration'],
  },
];

function CategoryBlock({
  cat,
  index,
  inView,
}: {
  cat: typeof categories[0];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.07, ease: easeOut }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
        <span
          className="text-[11px] uppercase tracking-[0.17em]"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}
        >
          {cat.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {cat.skills.map(skill => (
          <span key={skill} className="skill-pill" style={{ fontFamily: 'var(--font-sans)' }}>
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Stack() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stack" className="section-shell relative overflow-hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-10%',
          top: '12%',
          width: '52%',
          height: '66%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.055) 0%, transparent 72%)',
          filter: 'blur(75px)',
        }}
      />

      <div className="section-inner relative" ref={ref}>
        <motion.div
          className="flex items-center gap-3 mb-14"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <span className="section-label">Stack</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </motion.div>

        <div className="mb-12 md:mb-14">
          <motion.h2
            className="section-title text-white/90 max-w-[12ch]"
            style={{ fontSize: 'clamp(1.95rem, 3.6vw, 3.9rem)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          >
            Tech I use
            <br />
            <span style={{ color: 'rgba(255,255,255,0.54)' }}>to ship products.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9 md:gap-10">
          {categories.map((cat, i) => (
            <CategoryBlock key={cat.label} cat={cat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
