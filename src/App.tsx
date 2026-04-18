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
    let workStepLockUntil = 0;
    const workStepLockMs = 420;

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
        return {
          inWorkBounds: false,
          startY: 0,
          endY: 0,
          y: window.scrollY,
          steps: 1,
          totalScrollable: 1,
          progress: 0,
        };
      }

      const rect = section.getBoundingClientRect();
      const inWorkBounds = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inWorkBounds) {
        return {
          inWorkBounds: false,
          startY: 0,
          endY: 0,
          y: window.scrollY,
          steps: 1,
          totalScrollable: 1,
          progress: 0,
        };
      }

      const stage = section.querySelector('.projects-stage') as HTMLElement | null;
      const stepsRaw = getComputedStyle(section).getPropertyValue('--projects-steps').trim();
      const steps = Math.max(1, Number.parseInt(stepsRaw || '1', 10));
      if (!stage) {
        return {
          inWorkBounds: true,
          startY: 0,
          endY: 0,
          y: window.scrollY,
          steps,
          totalScrollable: 1,
          progress: 0,
        };
      }

      const sectionTopDoc = window.scrollY + rect.top;
      const stagePaddingTop = Number.parseFloat(getComputedStyle(stage).paddingTop || '0') || 0;
      const startY = sectionTopDoc + stagePaddingTop;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(Math.max(window.scrollY - startY, 0), totalScrollable);
      const rawIndexProgress = (scrolled / totalScrollable) * steps;

      return {
        inWorkBounds: true,
        startY,
        endY,
        y: window.scrollY,
        steps,
        totalScrollable,
        progress: Math.max(0, Math.min(steps, rawIndexProgress)),
      };
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;

      const sections = getSections();
      if (sections.length < 2) return;

      if (lock) {
        e.preventDefault();
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const workState = getWorkScrollState();
      const inWorkRange =
        workState.inWorkBounds &&
        workState.y >= workState.startY - window.innerHeight * 0.12 &&
        workState.y <= workState.endY + window.innerHeight * 0.08;

      if (inWorkRange) {
        e.preventDefault();
        const now = performance.now();
        if (now < workStepLockUntil) {
          return;
        }

        const currentStep = Math.max(0, Math.min(workState.steps, Math.round(workState.progress)));
        const nextStep = Math.max(0, Math.min(workState.steps, currentStep + direction));
        const movedInProjects = nextStep !== currentStep;
        workStepLockUntil = now + workStepLockMs;

        if (movedInProjects) {
          const targetY =
            workState.startY + (nextStep / workState.steps) * workState.totalScrollable;
          lock = true;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          window.setTimeout(() => {
            lock = false;
          }, 520);
          return;
        }

        const currentIdx = getCurrentIndex(sections);
        const workIdx = sections.findIndex(section => section.id === 'work');
        const baseIdx = workIdx === -1 ? currentIdx : workIdx;
        const workTargetIdx = Math.max(0, Math.min(sections.length - 1, baseIdx + direction));
        if (workTargetIdx !== baseIdx) {
          lock = true;
          window.scrollTo({ top: getSectionTargetTop(sections[workTargetIdx]), behavior: 'smooth' });
          window.setTimeout(() => {
            lock = false;
          }, lockMs);
        }
        return;
      }

      workStepLockUntil = 0;

      const currentIdx = getCurrentIndex(sections);
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
