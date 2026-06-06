import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionShaderBackground from './SectionShaderBackground';

const easeOut = [0.16, 1, 0.3, 1] as const;


const categories = [
  {
    label: 'Languages',
    color: '#4f8ef7',
    skills: ['TypeScript', 'JavaScript', 'C#', 'HTML5', 'CSS', 'SQL', 'T-SQL'],
  },
  {
    label: 'Frameworks / Libraries',
    color: '#14b8a6',
    skills: [
      'React',
      'Next.js',
      'Node.js',
      'Express',
      'Redux Toolkit',
      'Electron',
      'Prisma',
      'Shaders.js',
      'Tailwind CSS',
      'Vitest',
      'TanStack Query',
    ],
  },
  {
    label: 'Databases',
    color: '#06b6d4',
    skills: ['PostgreSQL', 'SQL Server'],
  },
  {
    label: 'Tools & Platforms',
    color: '#f97316',
    skills: [
      'Git',
      'GitHub',
      'Vercel',
      'Railway',
      'Clerk',
      'Neon',
      'Render',
      'Supabase',
      'Azure SQL',
      'Vite',
    ],
  },
];

const SKILLS_PER_ROW = 5;

function chunkSkills(skills: string[], size = SKILLS_PER_ROW) {
  const rows: string[][] = [];
  for (let i = 0; i < skills.length; i += size) {
    rows.push(skills.slice(i, i + size));
  }
  return rows;
}

const topRowCategories = categories.slice(0, 3);
const bottomRowCategories = categories.slice(3);

function CategoryBlock({
  cat,
  index,
  inView,
}: {
  cat: (typeof categories)[0];
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
      <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
        <span
          className="text-[11px] uppercase tracking-[0.17em]"
          style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}
        >
          {cat.label}
        </span>
      </div>

      <div className="stack-skill-lines">
        {chunkSkills(cat.skills).map((row, rowIdx) => (
          <div key={`${cat.label}-row-${rowIdx}`} className="stack-skill-line">
            {row.map(skill => (
              <span key={skill} className="skill-pill" style={{ fontFamily: 'var(--font-sans)' }}>
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Stack() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stack" className="section-tilt-section section-shell relative overflow-hidden" data-section-tilt>
      <div className="section-shader-layer" aria-hidden="true">
        <SectionShaderBackground color="#287CA8" />
      </div>

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

      <div className="section-tilt-container section-inner relative" ref={ref}>
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

        <div className="stack-categories" style={{ marginTop: '10px' }}>
          <div className="stack-categories-row stack-categories-row--top">
            {topRowCategories.map((cat, i) => (
              <CategoryBlock key={cat.label} cat={cat} index={i} inView={inView} />
            ))}
          </div>
          <div className="stack-categories-row stack-categories-row--bottom">
            {bottomRowCategories.map((cat, i) => (
              <CategoryBlock
                key={cat.label}
                cat={cat}
                index={topRowCategories.length + i}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
