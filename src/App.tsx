import { useEffect } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Stack from "./components/Stack";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cursor from "./components/Cursor";
import WebGLBackground from "./components/WebGLBackground";
import GrainOverlay from "./components/GrainOverlay";

export default function App() {
  // Smooth scroll polyfill / locking during load
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const hsla = (h: number, s: number, l: number, a: number) =>
      `hsla(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${a.toFixed(3)})`;

    const updateScrollProgress = () => {
      const scrollable = root.scrollHeight - window.innerHeight;
      const progressRaw = scrollable > 0 ? window.scrollY / scrollable : 0;
      const progress = Math.max(0, Math.min(1, progressRaw));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      const trackHue = lerp(228, 296, progress);
      const thumbHue = lerp(222, 308, progress);
      const hoverHue = lerp(230, 314, progress);
      root.style.setProperty(
        "--scrollbar-track",
        hsla(
          trackHue,
          lerp(66, 66, progress),
          lerp(24, 24, progress),
          lerp(0.99, 0.99, progress),
        ),
      );
      root.style.setProperty(
        "--scrollbar-thumb",
        hsla(
          thumbHue,
          lerp(74, 86, progress),
          lerp(52, 64, progress),
          lerp(0.82, 0.78, progress),
        ),
      );
      root.style.setProperty(
        "--scrollbar-thumb-hover",
        hsla(
          hoverHue,
          lerp(88, 98, progress),
          lerp(70, 82, progress),
          lerp(0.96, 0.92, progress),
        ),
      );
      rafId = 0;
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
      root.style.removeProperty("--scroll-progress");
      root.style.removeProperty("--scrollbar-track");
      root.style.removeProperty("--scrollbar-thumb");
      root.style.removeProperty("--scrollbar-thumb-hover");
    };
  }, []);

  useEffect(() => {
    let lock = false;
    const lockMs = 720;
    let workStepLockUntil = 0;
    const workStepLockMs = 420;
    const isFirefox = /firefox/i.test(navigator.userAgent);
    let cancelWorkStepAnim: (() => void) | null = null;
    let virtualSectionIndex: number | null = null;
    let virtualSectionId: string | null = null;
    const SECTION_TOP_EPS = 1;

    const getSections = () =>
      Array.from(
        document.querySelectorAll("main section[id]"),
      ) as HTMLElement[];

    const getSectionTargetTop = (section: HTMLElement) => {
      const maxScrollTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return Math.min(section.offsetTop, maxScrollTop);
    };

    const publishVirtualSection = (id: string | null) => {
      window.dispatchEvent(
        new CustomEvent("virtual-section-change", { detail: { id } }),
      );
    };

    const setVirtualSectionIndex = (
      nextIndex: number | null,
      sections: HTMLElement[],
    ) => {
      const nextId =
        nextIndex === null ? null : (sections[nextIndex]?.id ?? null);
      if (virtualSectionIndex === nextIndex && virtualSectionId === nextId)
        return;
      virtualSectionIndex = nextIndex;
      virtualSectionId = nextId;
      publishVirtualSection(nextId);
    };

    const getSectionTargetTops = (sections: HTMLElement[]) =>
      sections.map(getSectionTargetTop);

    const getCollapsedGroupRange = (tops: number[], idx: number) => {
      const baseTop = tops[idx];
      let start = idx;
      while (
        start > 0 &&
        Math.abs(tops[start - 1] - baseTop) <= SECTION_TOP_EPS
      ) {
        start -= 1;
      }
      let end = idx;
      while (
        end < tops.length - 1 &&
        Math.abs(tops[end + 1] - baseTop) <= SECTION_TOP_EPS
      ) {
        end += 1;
      }
      return [start, end] as const;
    };

    const resolveCurrentIndex = (sections: HTMLElement[], tops: number[]) => {
      const y = window.scrollY + 2;
      let candidateIdx = 0;
      tops.forEach((top, idx) => {
        if (top <= y) {
          candidateIdx = idx;
        }
      });
      const [groupStart, groupEnd] = getCollapsedGroupRange(tops, candidateIdx);
      const candidateTop = tops[candidateIdx];

      if (virtualSectionIndex !== null) {
        const v = virtualSectionIndex;
        const inSameGroup =
          v >= groupStart &&
          v <= groupEnd &&
          Math.abs(tops[v] - candidateTop) <= SECTION_TOP_EPS;
        if (inSameGroup) {
          return v;
        }
        setVirtualSectionIndex(null, sections);
      }

      if (groupStart !== groupEnd) {
        return groupStart;
      }
      return candidateIdx;
    };

    const getNextIndex = (
      currentIdx: number,
      direction: 1 | -1,
      total: number,
    ) => {
      const next = currentIdx + direction;
      return Math.max(0, Math.min(total - 1, next));
    };

    const getWorkScrollState = () => {
      const section = document.getElementById("work") as HTMLElement | null;
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

      const stage = section.querySelector(
        ".projects-stage",
      ) as HTMLElement | null;
      const stepsRaw = getComputedStyle(section)
        .getPropertyValue("--projects-steps")
        .trim();
      const steps = Math.max(1, Number.parseInt(stepsRaw || "1", 10));
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
      const stagePaddingTop =
        Number.parseFloat(getComputedStyle(stage).paddingTop || "0") || 0;
      const startY = sectionTopDoc + stagePaddingTop;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(
        Math.max(window.scrollY - startY, 0),
        totalScrollable,
      );
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

    const animateScrollTo = (
      targetY: number,
      durationMs: number,
      onDone: () => void,
    ) => {
      const startY = window.scrollY;
      const delta = targetY - startY;
      if (Math.abs(delta) < 0.5) {
        window.scrollTo({ top: targetY, behavior: "auto" });
        onDone();
        return () => {};
      }

      const startAt = performance.now();
      let rafId = 0;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const t = Math.min(1, (now - startAt) / durationMs);
        const nextY = startY + delta * easeOutCubic(t);
        window.scrollTo({ top: nextY, behavior: "auto" });
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
          return;
        }
        window.scrollTo({ top: targetY, behavior: "auto" });
        onDone();
      };

      rafId = requestAnimationFrame(tick);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    };

    const onWheel = (e: WheelEvent) => {
      const deltaPx =
        e.deltaMode === 1
          ? e.deltaY * 16
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
      if (Math.abs(deltaPx) < 4) return;

      const sections = getSections();
      if (sections.length < 2) return;
      const sectionTops = getSectionTargetTops(sections);

      if (lock) {
        e.preventDefault();
        return;
      }

      const direction = deltaPx > 0 ? 1 : -1;

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

        const currentStep = Math.max(
          0,
          Math.min(workState.steps, Math.round(workState.progress)),
        );
        const nextStep = Math.max(
          0,
          Math.min(workState.steps, currentStep + direction),
        );
        const movedInProjects = nextStep !== currentStep;
        workStepLockUntil = now + workStepLockMs;

        if (movedInProjects) {
          setVirtualSectionIndex(null, sections);
          const targetY =
            workState.startY +
            (nextStep / workState.steps) * workState.totalScrollable;
          lock = true;
          if (isFirefox) {
            if (cancelWorkStepAnim) cancelWorkStepAnim();
            cancelWorkStepAnim = animateScrollTo(targetY, 520, () => {
              lock = false;
              cancelWorkStepAnim = null;
            });
          } else {
            window.scrollTo({ top: targetY, behavior: "smooth" });
            window.setTimeout(() => {
              lock = false;
            }, 520);
          }
          return;
        }

        const currentIdx = resolveCurrentIndex(sections, sectionTops);
        const workIdx = sections.findIndex((section) => section.id === "work");
        const baseIdx = workIdx === -1 ? currentIdx : workIdx;
        const workTargetIdx = getNextIndex(
          baseIdx,
          direction as 1 | -1,
          sections.length,
        );
        if (workTargetIdx !== baseIdx) {
          const currentTop = sectionTops[baseIdx];
          const targetTop = sectionTops[workTargetIdx];
          if (Math.abs(targetTop - currentTop) <= SECTION_TOP_EPS) {
            setVirtualSectionIndex(workTargetIdx, sections);
            lock = true;
            window.setTimeout(() => {
              lock = false;
            }, 180);
            return;
          }
          setVirtualSectionIndex(null, sections);
          lock = true;
          window.scrollTo({ top: targetTop, behavior: "smooth" });
          window.setTimeout(() => {
            lock = false;
          }, lockMs);
        }
        return;
      }

      workStepLockUntil = 0;

      const currentIdx = resolveCurrentIndex(sections, sectionTops);
      const nextIdx = getNextIndex(
        currentIdx,
        direction as 1 | -1,
        sections.length,
      );

      if (nextIdx === currentIdx) return;

      e.preventDefault();
      const currentTop = sectionTops[currentIdx];
      const nextTop = sectionTops[nextIdx];
      if (Math.abs(nextTop - currentTop) <= SECTION_TOP_EPS) {
        setVirtualSectionIndex(nextIdx, sections);
        lock = true;
        window.setTimeout(() => {
          lock = false;
        }, 180);
        return;
      }

      setVirtualSectionIndex(null, sections);
      lock = true;
      window.scrollTo({ top: nextTop, behavior: "smooth" });
      window.setTimeout(() => {
        lock = false;
      }, lockMs);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      publishVirtualSection(null);
      if (cancelWorkStepAnim) cancelWorkStepAnim();
    };
  }, []);

  return (
    <div
      className="app-shell relative min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
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
