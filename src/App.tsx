import { useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import SectionTiltDirector from "./components/SectionTiltDirector";
import CustomScrollbar from "./components/CustomScrollbar";
import { useLenis } from "./components/LenisScroll";

export default function App() {
  const lenis = useLenis();

  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;

    const updateScrollProgress = () => {
      const scrollable =
        lenis?.limit ?? Math.max(0, root.scrollHeight - window.innerHeight);
      const scroll = lenis?.scroll ?? window.scrollY;
      const progressRaw = scrollable > 0 ? scroll / scrollable : 0;
      const progress = Math.max(0, Math.min(1, progressRaw));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      rafId = 0;
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    const unsubscribeLenis = lenis?.on("scroll", updateScrollProgress);
    if (!lenis) {
      window.addEventListener("scroll", onScrollOrResize, { passive: true });
    }
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        window.removeEventListener("scroll", onScrollOrResize);
      }
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
      root.style.removeProperty("--scroll-progress");
    };
  }, [lenis]);

  return (
    <div
      className="app-shell relative min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div className="app-ambient" aria-hidden="true" />
      <div className="app-vignette" aria-hidden="true" />

      {/* Custom cursor (desktop only) */}
      <Cursor />
      <CustomScrollbar />

      {/* Navigation */}
      <Nav />
      <SectionTiltDirector />

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


    </div>
  );
}
