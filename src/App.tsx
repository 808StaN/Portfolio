import { useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Stack from './components/Stack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import WebGLBackground from './components/WebGLBackground';
import GrainOverlay from './components/GrainOverlay';

export default function App() {
  // Smooth scroll polyfill / locking during load
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;

    const updateScrollProgress = () => {
      const scrollable = root.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty('--scroll-progress', progress.toFixed(4));
      rafId = 0;
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
      root.style.removeProperty('--scroll-progress');
    };
  }, []);

  useEffect(() => {
    let lock = false;
    const lockMs = 720;

    const getSections = () => Array.from(document.querySelectorAll('main section[id]')) as HTMLElement[];

    const getSectionTargetTop = (section: HTMLElement) => {
      const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(section.offsetTop, maxScrollTop);
    };

    const getCurrentIndex = (sections: HTMLElement[]) => {
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        return sections.length - 1;
      }
      const y = window.scrollY + 2;
      let currentIdx = 0;
      sections.forEach((section, idx) => {
        const top = getSectionTargetTop(section);
        if (top <= y) {
          currentIdx = idx;
        }
      });
      return currentIdx;
    };

    const getWorkScrollState = () => {
      const section = document.getElementById('work') as HTMLElement | null;
      if (!section) {
        return { inWorkViewport: false, atStart: false, atEnd: false };
      }

      const rect = section.getBoundingClientRect();
      const inWorkBounds = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inWorkBounds) {
        return { inWorkBounds: false, atStart: false, atEnd: false };
      }

      const stage = section.querySelector('.projects-stage') as HTMLElement | null;
      const stepsRaw = getComputedStyle(section).getPropertyValue('--projects-steps').trim();
      const steps = Math.max(1, Number.parseInt(stepsRaw || '1', 10));
      if (!stage) {
        return { inWorkBounds: true, atStart: false, atEnd: false };
      }

      const sectionTopDoc = window.scrollY + rect.top;
      const stagePaddingTop = Number.parseFloat(getComputedStyle(stage).paddingTop || '0') || 0;
      const startY = sectionTopDoc + stagePaddingTop;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(Math.max(window.scrollY - startY, 0), totalScrollable);
      const rawIndexProgress = (scrolled / totalScrollable) * steps;
      const epsilon = 0.12;

      return {
        inWorkBounds: true,
        atStart: rawIndexProgress <= epsilon,
        atEnd: rawIndexProgress >= steps - epsilon,
      };
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 18) return;

      const sections = getSections();
      if (sections.length < 2) return;

      if (lock) {
        e.preventDefault();
        return;
      }

      const currentIdx = getCurrentIndex(sections);
      const direction = e.deltaY > 0 ? 1 : -1;
      const currentSection = sections[currentIdx];
      const inWorkSection = currentSection?.id === 'work';

      if (inWorkSection) {
        const workState = getWorkScrollState();
        const canExitForward = direction === 1 && workState.atEnd;
        const canExitBackward = direction === -1 && workState.atStart;
        if (!canExitForward && !canExitBackward) {
          return;
        }

        const targetIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + direction));
        if (targetIdx !== currentIdx) {
          e.preventDefault();
          lock = true;
          window.scrollTo({ top: getSectionTargetTop(sections[targetIdx]), behavior: 'smooth' });
          window.setTimeout(() => {
            lock = false;
          }, lockMs);
          return;
        }
      }

      const nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + direction));

      if (nextIdx === currentIdx) return;

      e.preventDefault();
      lock = true;
      window.scrollTo({ top: getSectionTargetTop(sections[nextIdx]), behavior: 'smooth' });
      window.setTimeout(() => {
        lock = false;
      }, lockMs);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      className="app-shell relative min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="global-webgl-layer" aria-hidden="true">
        <WebGLBackground />
      </div>
      <div className="app-ambient" aria-hidden="true" />
      <div className="app-vignette" aria-hidden="true" />

      {/* Film grain overlay */}
      <GrainOverlay />

      {/* Custom cursor (desktop only) */}
      <Cursor />

      {/* Navigation */}
      <Nav />

      {/* Main content */}
      <main className="pb-10 md:pb-16">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Projects */}
        <Projects />

        {/* 3. About */}
        <About />

        {/* 4. Stack */}
        <Stack />

        {/* 5. Contact */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
