import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";
import {
  incomingAngles,
  hexToHsl,
  hslToHex,
  lerpHsl,
  getTiltDrop,
} from "../utils/tilt";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const isTallerThanViewport = (section: HTMLElement) =>
  section.offsetHeight > window.innerHeight + 2;

const getOverlapStart = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "top top" : "bottom bottom";

const getOverlapEnd = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "+=100%" : "bottom top";

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
        const sameGroup =
          section.dataset.sectionGroup &&
          section.dataset.sectionGroup === incomingSection.dataset.sectionGroup;

        gsap.set(incomingPanel, { backgroundColor: prevColor });

        const applyBlend = (p: number) => {
          const eased = p < 0.5
            ? 2 * p * p
            : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const blended = lerpHsl(prevHsl, incomingHsl, eased);
          incomingPanel.style.backgroundColor = hslToHex(blended.h, blended.s, blended.l);
        };

        if (sameGroup) {
          clipTargets.push({ section: incomingSection, panel: incomingPanel });
          updateTiltClip(incomingSection, incomingPanel);

          ScrollTrigger.create({
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

        // Granica projekt→sekcja (OtakuVersus→About): pin należy do karuzeli
        // (ProjectCarousel pinuje OtakuVersus na 300%). About wciągamy o 100vh w górę,
        // by nakładał się na ostatnie 100% pinu, i odpalamy STANDARDOWY tilt (jak
        // Stack/Contact) zmapowany na te ostatnie 100% przez pusty ogon timeline.
        // Brak osobnego pinu tutaj — uniknięcie konfliktu dwóch pinów na sekcji-projekcie.
        const isOutgoingProject = section.dataset.sectionGroup === "projects";
        if (isOutgoingProject) {
          gsap.set(incomingSection, { marginTop: "-100vh" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=300%",
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
    // Drugi refresh po zamontowaniu karuzel (ProjectCarousel montuje się po tym
    // efekcie i dodaje piny ze spacerami), aby zwykłe granice policzyły się względem
    // ostatecznego layoutu.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      syncNavBackground();
    });

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
