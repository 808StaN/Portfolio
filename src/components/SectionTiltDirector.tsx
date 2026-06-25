import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const incomingAngles = [14, 12, 10, 8, 6, 4, 3, 2, 1, 0];

type Hsl = { h: number; s: number; l: number };

const hexToHsl = (hex: string): Hsl => {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
};

const hslToHex = (h: number, s: number, l: number): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m2 = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) =>
    Math.round((v + m2) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const lerpHsl = (a: Hsl, b: Hsl, t: number): Hsl => {
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  return {
    h: (a.h + dh * t + 360) % 360,
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  };
};

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

        const prevColor = section.dataset.sectionColor || 'transparent';
        const incomingColor = incomingSection.dataset.sectionColor || 'transparent';
        const prevHsl = hexToHsl(prevColor);
        const incomingHsl = hexToHsl(incomingColor);

        gsap.set(incomingPanel, { rotation: incomingAngles[0], backgroundColor: prevColor });
        clipTargets.push({ section: incomingSection, panel: incomingPanel });
        updateTiltClip(incomingSection, incomingPanel);

        gsap.to(incomingPanel, {
          keyframes: incomingAngles.slice(1).map((rotation) => ({
            rotation,
            ease: "none",
          })),
          ease: "none",
          onUpdate: function () {
            updateTiltClip(incomingSection, incomingPanel);
            syncNavBackground();
            const p = this.progress();
            const blended = lerpHsl(prevHsl, incomingHsl, p);
            incomingPanel.style.backgroundColor = hslToHex(blended.h, blended.s, blended.l);
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
