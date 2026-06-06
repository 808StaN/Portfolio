import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);

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
        const content = section.querySelector<HTMLElement>(
          ":scope > .section-tilt-container",
        );
        if (!content) return;

        const rotation = index % 2 === 0 ? -2.2 : 2.2;
        const isLast = index === sections.length - 1;

        gsap.set(section, { zIndex: index + 1 });
        gsap.fromTo(
          content,
          { rotation },
          {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        if (!isLast) {
          ScrollTrigger.create({
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            pin: true,
            pinSpacing: false,
          });
        }
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
