import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);

const incomingAngles = [11.5, 9.5, 7.5, 5, 3.5, 2, 1, 0.3, 0];

const isTallerThanViewport = (section: HTMLElement) =>
  section.offsetHeight > window.innerHeight + 2;

const getOverlapStart = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "top top" : "bottom bottom";

const getOverlapEnd = (section: HTMLElement) =>
  isTallerThanViewport(section) ? "+=100%" : "bottom top";

const syncIncomingPointerEvents = (section: HTMLElement, progress: number) => {
  section.style.pointerEvents = progress < 0.6 ? "none" : "auto";
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

        gsap.to(incomingPanel, {
          keyframes: incomingAngles.slice(1).map((rotation) => ({
            rotation,
            ease: "none",
          })),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: () => getOverlapStart(section),
            end: () => getOverlapEnd(section),
            scrub: true,
            onUpdate: (self) => {
              syncIncomingPointerEvents(incomingSection, self.progress);
            },
            onLeave: () => {
              incomingSection.style.pointerEvents = "auto";
            },
            onLeaveBack: () => {
              incomingSection.style.pointerEvents = "auto";
            },
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

    return () => {
      unsubscribeLenis?.();
      sections.forEach((section) => {
        section.style.removeProperty("pointer-events");
      });
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
