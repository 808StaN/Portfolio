import { useEffect, useState } from "react";
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
import PageLoader, { type PageLoaderStage } from "./components/PageLoader";
import { getScrollMetrics, getScrollViewport } from "./utils/scroll";
import { SectionShaderRenderer } from "./components/SectionBandsBackground";

export default function App() {
  const lenis = useLenis();
  const [loaderStage, setLoaderStage] = useState<PageLoaderStage>("intro");
  const entranceReady = loaderStage !== "intro";

  useEffect(() => {
    const root = document.documentElement;
    const scrollTarget = getScrollViewport() ?? window;
    let rafId = 0;

    const updateScrollProgress = () => {
      const metrics = getScrollMetrics();
      const scrollable = lenis?.limit ?? metrics.limit;
      const scroll = lenis?.scroll ?? metrics.scroll;
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
      scrollTarget.addEventListener("scroll", onScrollOrResize, { passive: true });
    }
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        scrollTarget.removeEventListener("scroll", onScrollOrResize);
      }
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
      root.style.removeProperty("--scroll-progress");
    };
  }, [lenis]);

  return (
    <>
      {loaderStage !== "done" && <PageLoader onStageChange={setLoaderStage} />}
      <div
        className="app-shell relative min-h-screen"
        inert={loaderStage !== "done"}
        style={{ background: "#f2f5fc", color: "var(--color-text)" }}
      >
        <div className="portfolio-viewport">
          <div className="app-ambient" aria-hidden="true" />
          <div className="app-vignette" aria-hidden="true" />
          <div className="site-ui">
            <Cursor />
            <CustomScrollbar />
            <Nav ready={entranceReady} />
          </div>
          <div className="portfolio-scene">
            <div id="page-transition-scope" className="page-transition-scope">
              <SectionTiltDirector />
              <SectionShaderRenderer />

              <div id="portfolio-scrollport" className="portfolio-scrollport" tabIndex={-1}>
                <div className="page-transition-layout portfolio-scroll-content">
                  <div className="page-transition-content">
                    <main>
                      <Hero ready={entranceReady} />
                      <Projects />
                      <About />
                      <Stack />
                      <Contact />
                    </main>
                  </div>
                </div>
              </div>
            </div>
            <div className="nav-bg-layer" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}
