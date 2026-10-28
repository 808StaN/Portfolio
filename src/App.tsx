import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import Cursor from "./components/Cursor";
import SectionTiltDirector from "./components/SectionTiltDirector";
import ScrollProgressFrame from "./components/ScrollProgressFrame";
import PageLoader, { type PageLoaderStage } from "./components/PageLoader";
import { SectionShaderRenderer, type SectionShaderState } from "./components/SectionBandsBackground";

export default function App() {
  const [loaderStage, setLoaderStage] = useState<PageLoaderStage>("intro");
  const [shaderState, setShaderState] = useState<SectionShaderState>("loading");
  const entranceReady = loaderStage !== "intro";

  return (
    <>
      {loaderStage !== "done" && <PageLoader ready={shaderState !== "loading"} onStageChange={setLoaderStage} />}
      <div
        className="app-shell relative min-h-screen"
        data-shader-state={shaderState}
        inert={loaderStage !== "done"}
        style={{ background: "#f2f5fc", color: "var(--color-text)" }}
      >
        <div className="portfolio-viewport">
          <div className="app-ambient" aria-hidden="true" />
          <div className="app-vignette" aria-hidden="true" />
          <div className="site-ui">
            <Cursor />
            <Nav ready={entranceReady} />
          </div>
          <div className="portfolio-scene">
            <div id="page-transition-scope" className="page-transition-scope">
              <SectionTiltDirector />
              <SectionShaderRenderer onStateChange={setShaderState} />

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
        <ScrollProgressFrame />
      </div>
    </>
  );
}
