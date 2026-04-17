import { motion } from 'framer-motion';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="section-shell relative py-9">
      <div className="divider mb-8" />
      <div className="section-inner flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-5 h-5 rounded-full border border-white/18 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
          <span
            className="text-[11px]"
            style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-sans)' }}
          >
            StaN
          </span>
        </motion.div>

        <motion.p
          className="text-[11px] text-center"
          style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-sans)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Designed and built with precision - {year}
        </motion.p>

        <motion.a
          href="https://github.com/808StaN"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] hover:text-white/45 transition-colors duration-300"
          style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-sans)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          github.com/808StaN
        </motion.a>
      </div>
    </footer>
  );
}
