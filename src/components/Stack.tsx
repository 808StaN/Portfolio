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

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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
      className="stack-category-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.07, ease: easeOut }}
    >
      <div className="stack-category-head">
        <div className="stack-category-title-wrap">
          <span className="stack-category-dot" style={{ background: cat.color, color: cat.color }} />
          <span className="stack-category-title">{cat.label}</span>
        </div>
      </div>

      <div className="stack-skills-cloud">
        {chunk(cat.skills, 5).map((row, rowIndex) => (
          <div key={rowIndex} className="stack-skills-row">
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
    <section id="stack" className="section-tilt-section section-shell relative overflow-hidden" data-section-tilt data-section-color={sectionColors.stack}>
      <div className="section-tilt-panel">
        <div className="section-shader-layer" aria-hidden="true">
          <SectionShaderBackground color={sectionColors.stack} />
        </div>

        <div className="section-tilt-container section-inner relative" ref={ref}>
        <div>
          <motion.h2
            className="section-title text-white/90 max-w-[12ch]"
            style={{ fontSize: 'clamp(1.95rem, 3.6vw, 3.9rem)', marginBottom: 'clamp(1.75rem, 3.2vw, 2.6rem)' }}
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
