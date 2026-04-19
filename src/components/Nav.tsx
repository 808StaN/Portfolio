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
  const [docked, setDocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastY = useRef(0);
  const virtualActiveRef = useRef<string | null>(null);
  const [topVisible, setTopVisible] = useState(true);

  const getSectionTargetTop = (section: HTMLElement) => {
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(section.offsetTop, maxScrollTop);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const home = document.getElementById('home');
      const homeEnd = home ? Math.max(120, home.offsetHeight - 96) : Math.max(120, window.innerHeight - 96);

      const isDocked = y >= homeEnd;
      setScrolled(isDocked && y > 40);
      setDocked(isDocked);
      setTopVisible(!isDocked && (y < lastY.current || y < 80));
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['work', 'about', 'stack', 'contact'];
    const SECTION_TOP_EPS = 1;

    const getCollapsedGroupRange = (tops: number[], idx: number) => {
      const baseTop = tops[idx];
      let start = idx;
      while (start > 0 && Math.abs(tops[start - 1] - baseTop) <= SECTION_TOP_EPS) {
        start -= 1;
      }
      let end = idx;
      while (end < tops.length - 1 && Math.abs(tops[end + 1] - baseTop) <= SECTION_TOP_EPS) {
        end += 1;
      }
      return [start, end] as const;
    };

    const updateActiveSection = () => {
      const sections = ids
        .map(id => document.getElementById(id) as HTMLElement | null)
        .filter((section): section is HTMLElement => Boolean(section));
      if (sections.length === 0) return;

      const tops = sections.map(getSectionTargetTop);
      const y = window.scrollY + 2;
      let candidateIdx = 0;
      tops.forEach((top, idx) => {
        if (top <= y) {
          candidateIdx = idx;
        }
      });
      const [groupStart, groupEnd] = getCollapsedGroupRange(tops, candidateIdx);

      let resolvedIdx = groupStart !== groupEnd ? groupStart : candidateIdx;
      const virtualId = virtualActiveRef.current;
      if (virtualId) {
        const virtualIdx = sections.findIndex(section => section.id === virtualId);
        if (virtualIdx >= groupStart && virtualIdx <= groupEnd) {
          resolvedIdx = virtualIdx;
        } else {
          virtualActiveRef.current = null;
        }
      }

      setActiveSection(sections[resolvedIdx]?.id ?? '');
    };

    const onVirtualSectionChange = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string | null }>).detail;
      virtualActiveRef.current = detail?.id ?? null;
      updateActiveSection();
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('virtual-section-change', onVirtualSectionChange);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      window.removeEventListener('virtual-section-change', onVirtualSectionChange);
    };
  }, []);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    virtualActiveRef.current = null;
    const el = document.querySelector(href) as HTMLElement | null;
    if (!el) return;
    window.scrollTo({ top: getSectionTargetTop(el), behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: topVisible ? 0 : -80, opacity: topVisible ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className={`h-16 ${scrolled ? 'nav-blur' : ''}`}
          style={
            scrolled
              ? undefined
              : {
                  background: 'transparent',
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                }
          }
        >
          <div
            className="hero-inner h-full flex items-center justify-between"
            style={{ width: 'min(1600px, calc(100% - (var(--page-gutter) * 1.2)))' }}
          >
            <div className="w-[84px]" aria-hidden="true" />

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

      <AnimatePresence>
        {docked && (
          <motion.aside
            className="hidden md:flex flex-col items-start gap-7 fixed top-1/2 -translate-y-1/2 left-[max(14px,calc(var(--page-gutter)*0.55))] z-50"
            aria-label="Section navigation"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {links.map(link => (
              <button
                key={`side-${link.href}`}
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
            <a
              href="https://github.com/808StaN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/85 transition-colors duration-300"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </motion.aside>
        )}
      </AnimatePresence>

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
