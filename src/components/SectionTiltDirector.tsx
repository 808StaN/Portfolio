import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const incomingAngles = [14, 12, 10, 8, 6, 4, 3, 2, 1, 0];

const isTallerThanViewport = (section: HTMLElement) =>
  section.offsetHeight > window.innerHeight + 2;

const getOverlapStart = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "top top" : "bottom bottom";

const getOverlapEnd = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "+=100%" : "bottom top";

const getViewportWidth = () =>
  document.documentElement.clientWidth || window.visualViewport?.width || window.innerWidth;

const getTiltDrop = (rotation: number) => {
  const radians = (Math.abs(rotation) * Math.PI) / 180;
  return Math.max(0, Math.ceil(getViewportWidth() * Math.tan(radians)));
};

const setNavBackground = (color: string, z: number) => {
  const root = document.documentElement;
  root.style.setProperty("--nav-bg-color", color);
  root.style.setProperty("--nav-bg-z", String(z));
};

export default function SectionTiltDirector() {
  const lenis = useLenis();

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
    );
    if (sections.length === 0) return;

    setNavBackground(sections[0].dataset.sectionColor || "transparent", 15);

    const cleanupNavBackground = () => {
      const root = document.documentElement;
      root.style.removeProperty("--nav-bg-color");
      root.style.removeProperty("--nav-bg-z");
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || sections.length < 2) return cleanupNavBackground;

    const clipTargets: Array<{
      section: HTMLElement;
      panel: HTMLElement;
    }> = [];

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

      for (const { section, panel, color, z } of sectionData) {
        if (!panel) continue;
        const rotation = Number(gsap.getProperty(panel, 'rotation')) || 0;
        if (Math.abs(rotation) >= 0.05) continue;

        const rect = section.getBoundingClientRect();
        if (rect.top > 0 || rect.bottom <= 0) continue;

        if (z > bestZ) {
          bestZ = z;
          bestColor = color;
        }
      }

      if (bestZ >= 0) {
        setNavBackground(bestColor, bestZ + 5);
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

    const ctx = gsap.context(() => {
      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: (index + 1) * 10 });
      });

      sections.slice(0, -1).forEach((section, index) => {
        const incomingSection = sections[index + 1];
        const incomingPanel = sections[index + 1].querySelector<HTMLElement>(
          ":scope > .section-tilt-panel",
        );
        if (!incomingPanel) return;

        gsap.set(incomingPanel, { rotation: incomingAngles[0] });
        clipTargets.push({ section: incomingSection, panel: incomingPanel });
        updateTiltClip(incomingSection, incomingPanel);

        gsap.to(incomingPanel, {
          keyframes: incomingAngles.slice(1).map((rotation) => ({
            rotation,
            ease: "none",
          })),
          ease: "none",
          onUpdate: () => {
            updateTiltClip(incomingSection, incomingPanel);
            syncNavBackground();
          },
          scrollTrigger: {
            trigger: section,
            start: () => getOverlapStart(section),
            end: () => getOverlapEnd(section),
            scrub: true,
          },
        });

        ScrollTrigger.create({
          id: incomingSection.id
            ? `section-target-${incomingSection.id}`
            : undefined,
          trigger: section,
          start: () => getOverlapStart(section),
          end: () => getOverlapEnd(section),
          pin: true,
          pinSpacing: false,
        });
      });
    });

    ScrollTrigger.refresh();
    requestAnimationFrame(syncNavBackground);

    const onScroll = () => {
      ScrollTrigger.update();
      syncNavBackground();
    };
    const unsubscribeLenis = lenis?.on("scroll", onScroll);
    if (!lenis) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", updateAllTiltClips);

    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        window.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("resize", updateAllTiltClips);
      sections.forEach((section) => {
        section.style.removeProperty("--tilt-hit-drop");
      });
      cleanupNavBackground();
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
