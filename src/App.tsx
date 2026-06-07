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
import { scrollToY, useLenis } from "./components/LenisScroll";

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

  useEffect(() => {
    const getScrollY = () => lenis?.scroll ?? window.scrollY;

    let lock = false;
    const lockMs = 720;
    let workStepLockUntil = 0;
    const workStepLockMs = 420;
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
      const y = getScrollY() + 2;
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
          y: getScrollY(),
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
          y: getScrollY(),
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
          y: getScrollY(),
          steps,
          totalScrollable: 1,
          progress: 0,
        };
      }

      const sectionTopDoc = getScrollY() + rect.top;
      const stagePaddingTop =
        Number.parseFloat(getComputedStyle(stage).paddingTop || "0") || 0;
      const startY = sectionTopDoc + stagePaddingTop;
      const endY = sectionTopDoc + section.offsetHeight - window.innerHeight;
      const totalScrollable = Math.max(1, endY - startY);
      const scrolled = Math.min(
        Math.max(getScrollY() - startY, 0),
        totalScrollable,
      );
      const rawIndexProgress = (scrolled / totalScrollable) * steps;

      return {
        inWorkBounds: true,
        startY,
        endY,
        y: getScrollY(),
        steps,
        totalScrollable,
        progress: Math.max(0, Math.min(steps, rawIndexProgress)),
      };
    };

    const scrollToTarget = (
      targetY: number,
      durationSec: number,
      onDone: () => void,
    ) => {
      scrollToY(targetY, lenis, {
        duration: durationSec,
        lock: true,
        onComplete: onDone,
      });
    };

    const stepByDirection = (
      direction: 1 | -1,
      preventDefault?: () => void,
    ) => {
      const sections = getSections();
      if (sections.length < 2) return;
      const sectionTops = getSectionTargetTops(sections);

      if (lock) {
        preventDefault?.();
        return;
      }

      const workState = getWorkScrollState();
      const inWorkRange =
        workState.inWorkBounds &&
        workState.y >= workState.startY - window.innerHeight * 0.12 &&
        workState.y <= workState.endY + window.innerHeight * 0.08;

      if (inWorkRange) {
        preventDefault?.();
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
          scrollToTarget(targetY, 0.72, () => {
            lock = false;
          });
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
          scrollToTarget(targetTop, lockMs / 1000, () => {
            lock = false;
          });
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

      preventDefault?.();
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
      scrollToTarget(nextTop, lockMs / 1000, () => {
        lock = false;
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        stepByDirection(1, () => e.preventDefault());
        return;
      }
      if (e.key === "ArrowUp") {
        stepByDirection(-1, () => e.preventDefault());
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      publishVirtualSection(null);
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
