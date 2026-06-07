import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);

const incomingAngles = [12, 10, 8, 6, 5, 4, 2, 1, 0];

const isTallerThanViewport = (section: HTMLElement) =>
  section.offsetHeight > window.innerHeight + 2;

const getOverlapStart = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "top top" : "bottom bottom";

const getOverlapEnd = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "+=100%" : "bottom top";

const getTiltDrop = (rotation: number) => {
  const radians = (Math.abs(rotation) * Math.PI) / 180;
  return Math.max(0, Math.ceil(window.innerWidth * Math.tan(radians)));
};

export default function SectionTiltDirector() {
  const lenis = useLenis();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
    );
    if (sections.length < 2) return;

    const clipTargets: Array<{
      section: HTMLElement;
      panel: HTMLElement;
    }> = [];

    const updateTiltClip = (section: HTMLElement, panel: HTMLElement) => {
      const rotation = Number(gsap.getProperty(panel, "rotation")) || 0;
      section.style.setProperty("--tilt-hit-drop", `${getTiltDrop(rotation)}px`);
    };

    const updateAllTiltClips = () => {
      clipTargets.forEach(({ section, panel }) => {
        updateTiltClip(section, panel);
      });
    };

    const ctx = gsap.context(() => {
      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: index + 1 });
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
          onUpdate: () => updateTiltClip(incomingSection, incomingPanel),
          scrollTrigger: {
            trigger: section,
            start: () => getOverlapStart(section),
            end: () => getOverlapEnd(section),
            scrub: true,
          },
        });

        ScrollTrigger.create({
          trigger: section,
          start: () => getOverlapStart(section),
          end: () => getOverlapEnd(section),
          pin: true,
          pinSpacing: false,
        });
      });
    });

    ScrollTrigger.refresh();
    const unsubscribeLenis = lenis?.on("scroll", ScrollTrigger.update);
    window.addEventListener("resize", updateAllTiltClips);

    return () => {
      unsubscribeLenis?.();
      window.removeEventListener("resize", updateAllTiltClips);
      sections.forEach((section) => {
        section.style.removeProperty("--tilt-hit-drop");
      });
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
