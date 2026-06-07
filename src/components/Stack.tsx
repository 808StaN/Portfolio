import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionShaderBackground from './SectionShaderBackground';
import { sectionColors } from '../constants/sectionColors';

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
      className={`stack-category-card${cat.skills.length > 8 ? ' is-wide' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.07, ease: easeOut }}
    >
      <div className="stack-category-head">
        <div className="stack-category-title-wrap">
          <span className="stack-category-dot" style={{ background: cat.color, color: cat.color }} />
          <span className="stack-category-title">{cat.label}</span>
        </div>
        <span className="stack-category-count">{cat.skills.length}</span>
      </div>

      <div className="stack-skills-cloud">
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
    <section id="stack" className="section-tilt-section section-shell relative overflow-hidden" data-section-tilt data-section-color={sectionColors.stack}>
      <div className="section-tilt-panel">
        <div className="section-shader-layer" aria-hidden="true">
          <SectionShaderBackground color={sectionColors.stack} />
        </div>

        <div className="section-tilt-container section-inner relative" ref={ref}>
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
          {categories.map((cat, i) => (
            <CategoryBlock key={cat.label} cat={cat} index={i} inView={inView} />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
