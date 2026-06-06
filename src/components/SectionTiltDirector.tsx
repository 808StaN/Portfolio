import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);

const incomingAngles = [11.5, 9.5, 7.5, 5, 3.5, 2, 1, 0.3, 0];

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
        const incomingPanel = sections[index + 1].querySelector<HTMLElement>(
          ":scope > .section-tilt-panel",
        );
        if (!incomingPanel) return;

        gsap.set(incomingPanel, { rotation: incomingAngles[0], yPercent: 8 });

        gsap.to(incomingPanel, {
          keyframes: incomingAngles.slice(1).map((rotation, angleIndex) => ({
            rotation,
            yPercent: gsap.utils.interpolate(
              8,
              0,
              (angleIndex + 1) / (incomingAngles.length - 1),
            ),
            ease: "none",
          })),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        ScrollTrigger.create({
          trigger: section,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        });
      });
    });

    ScrollTrigger.refresh();
    const unsubscribeLenis = lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      unsubscribeLenis?.();
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
