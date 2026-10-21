import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY, useLenis } from './LenisScroll';
import { blendSectionColor, hexToHsl, incomingAngles } from '../utils/tilt';

const links = [
  { label: 'Projects', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
];

export default function Nav() {
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigationRequest = useRef(0);
  const navigation = useRef<{ transition: ViewTransition; release: () => void } | null>(null);

  useEffect(() => () => {
    navigationRequest.current += 1;
    navigation.current?.transition.skipTransition();
    navigation.current?.release();
  }, []);

  const getSectionTargetTop = (section: HTMLElement) => {
    const maxScrollTop = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const transitionTarget = ScrollTrigger.getById(`section-target-${section.id}`);
    const navHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 64;
    // A tall outgoing panel finishes tilting before the incoming panel reaches the top.
    const overlapCorrection = transitionTarget?.trigger instanceof HTMLElement
      ? Math.max(0, transitionTarget.trigger.offsetHeight - window.innerHeight)
      : 0;
    const targetCorrection = overlapCorrection + (section.id === 'about' ? navHeight : 0);
    const top =
      transitionTarget?.end !== undefined
        ? transitionTarget.end + targetCorrection
        : window.scrollY + section.getBoundingClientRect().top;
    return Math.min(Math.max(0, top), maxScrollTop);
  };

  useEffect(() => {
    const ids = links.map(link => link.href.slice(1));
    const root = document.documentElement;
    const hero = document.getElementById('home');

    const updateNavigation = () => {
      // Use the pin's actual end so expansion finishes with the hero tilt.
      const heroTransition = ScrollTrigger.getAll().find(trigger =>
        trigger.trigger === hero && trigger.vars.pin);
      const heroEnd = heroTransition?.end ?? hero?.offsetHeight ?? window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, heroEnd)));
      root.style.setProperty('--nav-hero-progress', progress.toFixed(4));

      const sections = ids
        .map(id => document.getElementById(id) as HTMLElement | null)
        .filter((section): section is HTMLElement => Boolean(section));
      if (sections.length === 0) return;

      const activationY = window.innerHeight * 0.5;
      let nextActiveSection = '';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationY && rect.bottom > activationY) {
          nextActiveSection = section.id;
        }
      });

      setActiveSection(nextActiveSection);
    };

    updateNavigation();
    const unsubscribeLenis = lenis?.on('scroll', updateNavigation);
    if (!lenis) {
      window.addEventListener('scroll', updateNavigation, { passive: true });
    }
    window.addEventListener('resize', updateNavigation);
    ScrollTrigger.addEventListener('refresh', updateNavigation);
    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        window.removeEventListener('scroll', updateNavigation);
      }
      window.removeEventListener('resize', updateNavigation);
      ScrollTrigger.removeEventListener('refresh', updateNavigation);
      root.style.removeProperty('--nav-hero-progress');
    };
  }, [lenis]);

  const handleLink = async (href: string) => {
    setMenuOpen(false);
    const request = ++navigationRequest.current;
    const previous = navigation.current;
    if (previous) {
      previous.transition.skipTransition();
      await previous.transition.finished.catch(() => {});
    }
    if (request !== navigationRequest.current) return;

    const el = document.querySelector(href) as HTMLElement | null;
    if (!el) return;
    const top = getSectionTargetTop(el);
    if (Math.abs(window.scrollY - top) < 2) return;
    const panel = el.querySelector<HTMLElement>('.section-tilt-panel');
    const targetColor = panel?.closest<HTMLElement>('[data-section-color]')?.dataset.sectionColor;
    let captureSnapshot = false;

    const jump = () => {
      if (request !== navigationRequest.current || !el.isConnected) return;
      if (lenis) {
        lenis.scrollTo(top, { immediate: true, force: true });
      } else {
        scrollToY(top, null, { immediate: true });
      }
      ScrollTrigger.update();
      if (captureSnapshot) panel?.setAttribute('data-nav-capture', '');
      // Include content in the snapshot instead of its initial Framer Motion opacity.
      el.querySelectorAll<HTMLElement>('.section-tilt-container [style*="opacity"]')
        .forEach(node => node.setAttribute('data-nav-revealed', ''));
      flushSync(() => setActiveSection(el.id));
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };

    if (typeof document.startViewTransition !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !panel || !targetColor) {
      jump();
      return;
    }

    const root = document.documentElement;
    const startProgress = Number(getComputedStyle(root).getPropertyValue('--nav-hero-progress'));
    const wasStopped = lenis?.isStopped;
    const panelStyle = getComputedStyle(panel);
    const sourceColor = root.style.getPropertyValue('--nav-bg-color').trim();
    const fromHsl = hexToHsl(sourceColor.startsWith('#') ? sourceColor : targetColor);
    const toHsl = hexToHsl(targetColor);
    root.style.setProperty('--nav-section-start-color', blendSectionColor(fromHsl, toHsl, 0));
    root.style.setProperty('--nav-start-grain', root.style.getPropertyValue('--nav-grain-opacity') || '1');
    root.style.setProperty('--nav-section-start-angle', `${incomingAngles[0]}deg`);
    root.style.setProperty('--nav-section-top-left-radius', panelStyle?.borderTopLeftRadius ?? '0px');
    root.style.setProperty('--nav-section-top-right-radius', panelStyle?.borderTopRightRadius ?? '0px');
    root.classList.add('nav-section-transition');
    lenis?.stop();
    captureSnapshot = true;
    const animations: Animation[] = [];
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      captureSnapshot = false;
      panel.removeAttribute('data-nav-capture');
      animations.forEach(animation => animation.cancel());
      root.classList.remove('nav-section-transition');
      root.style.removeProperty('--nav-section-start-color');
      root.style.removeProperty('--nav-start-grain');
      root.style.removeProperty('--nav-section-start-angle');
      root.style.removeProperty('--nav-section-top-left-radius');
      root.style.removeProperty('--nav-section-top-right-radius');
      if (!wasStopped) lenis?.start();
      window.removeEventListener('wheel', interrupt, true);
      window.removeEventListener('touchstart', interrupt, true);
      window.removeEventListener('keydown', interrupt, true);
      window.removeEventListener('resize', interrupt);
    };
    const interrupt = (event: Event) => {
      if (event instanceof KeyboardEvent
        && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) return;
      transition.skipTransition();
      release();
    };
    const transition = document.startViewTransition(jump);
    navigation.current = { transition, release };
    window.addEventListener('wheel', interrupt, { capture: true, passive: true });
    window.addEventListener('touchstart', interrupt, { capture: true, passive: true });
    window.addEventListener('keydown', interrupt, true);
    window.addEventListener('resize', interrupt);
    void transition.ready.then(() => {
      captureSnapshot = false;
      if (released) return;
      // The new snapshot is live; its panel stays transparent until release().
      const style = getComputedStyle(root, '::view-transition-group(nav-section)');
      const entryAnimation = document.getAnimations().find(animation =>
        animation instanceof CSSAnimation && animation.animationName === 'nav-section-enter');
      const endProgress = Number(root.style.getPropertyValue('--nav-hero-progress'));
      const timing = {
        duration: parseFloat(style.animationDuration) * 1000,
        easing: style.animationTimingFunction,
        fill: 'both' as const,
      };
      if (startProgress < endProgress) {
        animations.push(root.animate([
          { '--nav-hero-progress': startProgress },
          { '--nav-hero-progress': endProgress },
        ], timing));
      }
      animations.push(root.animate(Array.from({ length: 61 }, (_, index) => ({
        offset: index / 60,
        backgroundColor: blendSectionColor(fromHsl, toHsl, index / 60),
      })), {
        ...timing,
        pseudoElement: '::view-transition-group(nav-section)',
      }));
      if (entryAnimation?.startTime != null) {
        for (const animation of animations) {
          animation.startTime = entryAnimation.startTime;
        }
      }
    }).catch(() => transition.skipTransition());
    try {
      await transition.finished;
    } catch {
      // Snapshot failures must not prevent navigation to the requested section.
      if (request === navigationRequest.current) jump();
    } finally {
      release();
      if (navigation.current?.transition === transition) navigation.current = null;
    }
  };

  return (
    <>
      <div className="nav-bg-layer" aria-hidden="true" />
      <motion.header
        className="site-nav fixed top-0 z-[9996]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="relative h-14 md:h-16 nav-blur">
          <div
            className="hero-inner relative z-10 h-full flex items-center justify-between"
            style={{ width: 'min(1600px, calc(100% - (var(--page-gutter) * 1.2)))' }}
          >
            <div className="hidden md:block w-[84px]" aria-hidden="true" />

            <div className="hidden lg:flex items-center gap-8">
              {links.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className={`text-sm transition-all duration-300 cursor-pointer bg-transparent border-none relative group ${
                    activeSection === link.href.slice(1)
                      ? 'text-white'
                      : 'text-white hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-white transition-all duration-300 ${
                      activeSection === link.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors duration-300"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub -&gt;
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            </div>
          </div>
          <button
            className="lg:hidden absolute flex h-11 w-11 flex-col items-center justify-center gap-1.5 cursor-pointer border-none"
            style={{
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              zIndex: 9999,
              background: 'transparent',
            }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <motion.span
            style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-backdrop fixed inset-0 z-[10000] flex flex-col justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0 } }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center border-none bg-transparent text-white"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <span className="absolute h-px w-7 rotate-45 bg-white" />
              <span className="absolute h-px w-7 -rotate-45 bg-white" />
            </button>
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
                  <span className="text-4xl font-700 text-white hover:text-white transition-colors duration-200">
                    {link.label}
                  </span>
                </motion.button>
              ))}
              <motion.a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors duration-200"
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
