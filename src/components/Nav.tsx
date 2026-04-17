import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { label: 'Projects', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastY = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setVisible(y < lastY.current || y < 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section tracker
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.4 }
    );
    ['work', 'about', 'stack', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className={`h-16 transition-all duration-500 ${scrolled ? 'nav-blur' : ''}`}
        >
          <div
            className="hero-inner h-full flex items-center justify-between"
            style={{ width: 'min(1600px, calc(100% - (var(--page-gutter) * 1.2)))' }}
          >
            {/* Logo */}
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group focus-visible:outline-none"
              aria-label="Home"
            >
              <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden group-hover:border-white/40 transition-colors duration-300">
                <div className="w-2 h-2 rounded-full bg-white/80 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-sm font-600 tracking-tight text-white/90 group-hover:text-white transition-colors duration-300"
              >
                StaN
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className={`text-sm transition-all duration-300 cursor-pointer bg-transparent border-none relative group ${
                    activeSection === link.href.slice(1)
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/85'
                  }`}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-white/50 transition-all duration-300 ${
                      activeSection === link.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/85 transition-colors duration-300"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub -&gt;
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer bg-transparent border-none"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <motion.span
                className="block w-6 h-px bg-white/75"
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block w-6 h-px bg-white/75"
                animate={{ opacity: menuOpen ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block w-6 h-px bg-white/75"
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center items-center"
            style={{ background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-10">
              {links.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className="bg-transparent border-none cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="text-4xl font-700 text-white/90 hover:text-white transition-colors duration-200">
                    {link.label}
                  </span>
                </motion.button>
              ))}
              <motion.a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                github.com/808StaN
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
