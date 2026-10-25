import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";
import { getScrollMetrics, getScrollViewport } from "../utils/scroll";
import {
  incomingAngles,
  hexToHsl,
  blendSectionColor,
  getTiltDrop,
  getSectionCornerScale,
  getProjectPinStart,
} from "../utils/tilt";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const setNavBackground = (color: string, z: number, showGrain: boolean) => {
  const root = document.documentElement;
  root.style.setProperty("--nav-bg-color", color);
  root.style.setProperty("--nav-bg-z", String(z));
  root.style.setProperty("--nav-grain-opacity", showGrain ? "1" : "0");
};

export default function SectionTiltDirector() {
  const lenis = useLenis();

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
    );
    if (sections.length === 0) return;

    const viewport = getScrollViewport();
    const scroller = viewport ?? window;

    setNavBackground(sections[0].dataset.sectionColor || "transparent", 15, sections[0].id !== "home");

    const cleanupNavBackground = () => {
      const root = document.documentElement;
      root.style.removeProperty("--nav-bg-color");
      root.style.removeProperty("--nav-bg-z");
      root.style.removeProperty("--nav-grain-opacity");
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const clipTargets: Array<{
      section: HTMLElement;
      panel: HTMLElement;
    }> = [];
    const overlapTargets: Array<{ section: HTMLElement; marginTop: string }> = [];

    const sectionData = sections.map((section, index) => {
      const panel = section.querySelector<HTMLElement>(':scope > .section-tilt-panel');
      return {
        section,
        panel,
        color: section.dataset.sectionColor || 'transparent',
        z: (index + 1) * 10,
      };
    });

    const syncNavBackground = () => {
      let bestColor = 'transparent';
      let bestZ = -1;
      let showGrain = true;
      const { top } = getScrollMetrics();

      for (const { section, panel, color, z } of sectionData) {
        if (!panel) continue;
        const rotation = Number(gsap.getProperty(panel, 'rotation')) || 0;
        if (Math.abs(rotation) >= 0.05) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top > top || rect.bottom <= top) continue;

        if (z > bestZ) {
          bestZ = z;
          bestColor = color;
          showGrain = section.id !== "home";
        }
      }

      if (bestZ >= 0) {
        setNavBackground(bestColor, bestZ + 5, showGrain);
      }
    };

    const updateTiltClip = (section: HTMLElement, panel: HTMLElement) => {
      const rotation = Number(gsap.getProperty(panel, "rotation")) || 0;
      section.style.setProperty("--tilt-hit-drop", `${getTiltDrop(rotation)}px`);
    };

    const updateAllTiltClips = () => {
      clipTargets.forEach(({ section, panel }) => {
        updateTiltClip(section, panel);
      });
      syncNavBackground();
      lenis?.resize();
    };

    const updateOverlaps = () => {
      const { height } = getScrollMetrics();
      overlapTargets.forEach(({ section }) => {
        section.style.setProperty("--section-overlap-offset", `${-height}px`);
      });
    };

    const ctx = gsap.context(() => {
      if (reducedMotion || sections.length < 2) return;

      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: (index + 1) * 10 });
      });

      sections.slice(0, -1).forEach((section, index) => {
        const incomingSection = sections[index + 1];
        const incomingPanel = sections[index + 1].querySelector<HTMLElement>(
          ":scope > .section-tilt-panel",
        );
        if (!incomingPanel) return;

        const prevColor = section.dataset.sectionColor || 'transparent';
        const incomingColor = incomingSection.dataset.sectionColor || 'transparent';
        const prevHsl = hexToHsl(prevColor);
        const incomingHsl = hexToHsl(incomingColor);
        const sameGroup =
          section.dataset.sectionGroup &&
          section.dataset.sectionGroup === incomingSection.dataset.sectionGroup;

        gsap.set(incomingPanel, { backgroundColor: prevColor });

        const applyBlend = (p: number) => {
          incomingPanel.style.backgroundColor = blendSectionColor(prevHsl, incomingHsl, p);
          incomingPanel.style.setProperty('--section-corner-scale', String(getSectionCornerScale(p)));
        };

        if (sameGroup) {
          clipTargets.push({ section: incomingSection, panel: incomingPanel });
          updateTiltClip(incomingSection, incomingPanel);

          ScrollTrigger.create({
            scroller,
            trigger: incomingSection,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              applyBlend(self.progress);
              syncNavBackground();
            },
          });
          return;
        }

        gsap.set(incomingPanel, { rotation: incomingAngles[0] });
        clipTargets.push({ section: incomingSection, panel: incomingPanel });
        updateTiltClip(incomingSection, incomingPanel);

        const tiltKeyframes = incomingAngles.slice(1).map((rotation) => ({
          rotation,
          ease: "none",
        }));
        const onTiltUpdate = function (this: gsap.core.Tween) {
          updateTiltClip(incomingSection, incomingPanel);
          syncNavBackground();
          applyBlend(this.progress());
        };

        // Match the carousel's final viewport of pin time without adding another pin.
        const isOutgoingProject = section.dataset.sectionGroup === "projects";
        if (isOutgoingProject) {
          overlapTargets.push({ section: incomingSection, marginTop: incomingSection.style.marginTop });
          gsap.set(incomingSection, { "--section-overlap-offset": `${-getScrollMetrics().height}px` });
          // Keep a live value in the margin that ScrollTrigger saves when pinning About.
          incomingSection.style.marginTop = "var(--section-overlap-offset)";

          const tl = gsap.timeline({
            scrollTrigger: {
              scroller,
              id: incomingSection.id
                ? `section-target-${incomingSection.id}`
                : undefined,
              trigger: section,
              start: () => getProjectPinStart(section),
              end: () => `+=${getScrollMetrics().height * 3}`,
              scrub: true,
            },
          });
          tl.to({}, { duration: 2 });
          tl.to(incomingPanel, {
            keyframes: tiltKeyframes,
            ease: "none",
            duration: 1,
            onUpdate: onTiltUpdate,
          });
          return;
        }

        gsap.to(incomingPanel, {
          keyframes: tiltKeyframes,
          ease: "none",
          onUpdate: onTiltUpdate,
          scrollTrigger: {
            scroller,
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        ScrollTrigger.create({
          scroller,
          id: incomingSection.id
            ? `section-target-${incomingSection.id}`
            : undefined,
          trigger: section,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        });
      });
    });

    ScrollTrigger.addEventListener("refreshInit", updateOverlaps);
    ScrollTrigger.addEventListener("refresh", updateAllTiltClips);

    let refreshFrame = 0;
    const scheduleRefresh = () => {
      if (refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        lenis?.resize();
        ScrollTrigger.refresh();
      });
    };

    ScrollTrigger.refresh();
    // Refresh again once carousel pins and their spacers have mounted.
    scheduleRefresh();

    let { width, height } = getScrollMetrics();
    const observer = viewport ? new ResizeObserver(() => {
      const metrics = getScrollMetrics();
      if (metrics.width === width && metrics.height === height) return;
      width = metrics.width;
      height = metrics.height;
      scheduleRefresh();
    }) : null;
    if (viewport) observer?.observe(viewport);

    const onScroll = () => {
      ScrollTrigger.update();
      syncNavBackground();
    };
    const unsubscribeLenis = lenis?.on("scroll", onScroll);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleRefresh);

    return () => {
      unsubscribeLenis?.();
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleRefresh);
      observer?.disconnect();
      cancelAnimationFrame(refreshFrame);
      ScrollTrigger.removeEventListener("refreshInit", updateOverlaps);
      ScrollTrigger.removeEventListener("refresh", updateAllTiltClips);
      sections.forEach((section) => {
        section.style.removeProperty("--tilt-hit-drop");
      });
      cleanupNavBackground();
      ctx.revert();
      overlapTargets.forEach(({ section, marginTop }) => {
        section.style.marginTop = marginTop;
      });
      clipTargets.forEach(({ panel }) => panel.style.removeProperty('--section-corner-scale'));
    };
  }, [lenis]);

  return null;
}
