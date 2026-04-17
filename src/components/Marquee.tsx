import { motion } from 'framer-motion';

const technologies = [
  'React',
  'Next.js',
  'TypeScript',
  'WebGL',
  'Framer Motion',
  'Three.js',
  'Node.js',
  'GLSL Shaders',
  'Design Systems',
];

const marqueeItems = [...technologies, ...technologies];

export default function Marquee() {
  return (
    <div className="marquee-shell relative overflow-hidden py-4 md:py-5">
      {/* Fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(7,9,14,1) 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, rgba(7,9,14,1) 0%, transparent 100%)' }}
      />

      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        {marqueeItems.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center px-4 text-[0.7rem] tracking-[0.08em] uppercase"
            style={{
              color: 'rgba(255,255,255,0.34)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {item}
            <span className="ml-4 text-white/20">*</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
