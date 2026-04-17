import { useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Stack from './components/Stack';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import PageLoader from './components/PageLoader';
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

      {/* Page loader */}
      <PageLoader />

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
