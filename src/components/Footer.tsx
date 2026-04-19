import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="section-shell relative py-9">
      <div className="divider mb-8" />
      <div className="section-inner flex items-center justify-center">
        <motion.p
          className="text-[11px] text-center"
          style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-sans)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Designed & developed by Dawid Stanisz (808StaN) - 2026
        </motion.p>
      </div>
    </footer>
  );
}
