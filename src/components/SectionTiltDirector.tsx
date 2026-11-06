import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";
import { getScrollMetrics, getScrollViewport } from "../utils/scroll";
import { experienceTravelScreens } from "../constants/experience";
import { useExperiencePin } from "../utils/useExperiencePin";
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

export default function SectionTiltDirector() {
  const lenis = useLenis();
  const experiencePinned = useExperiencePin();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
    );
    if (sections.length === 0) return;

    const viewport = getScrollViewport();
    const scroller = viewport ?? window;

    const clipTargets: Array<{
      section: HTMLElement;
      panel: HTMLElement;
    }> = [];
    const overlapTargets: Array<{ section: HTMLElement; marginTop: string }> = [];

    const updateTiltClip = (section: HTMLElement, panel: HTMLElement) => {
      const rotation = Number(gsap.getProperty(panel, "rotation")) || 0;
      const radians = rotation * Math.PI / 180;
      // Account for the bottom-left origin, with 1px outside the edge for antialiasing.
      const top = panel.offsetHeight * (1 - 1 / Math.cos(radians)) - (rotation ? 1 : 0);
      section.style.setProperty("--tilt-hit-top", `${top}px`);
      section.style.setProperty("--tilt-hit-drop", `${getTiltDrop(rotation)}px`);
    };

    const updateAllTiltClips = () => {
      clipTargets.forEach(({ section, panel }) => {
        updateTiltClip(section, panel);
      });
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

        gsap.set(incomingPanel, { backgroundColor: prevColor, '--section-shader-opacity': 0 });

        const applyBlend = (p: number) => {
          incomingPanel.style.backgroundColor = blendSectionColor(prevHsl, incomingHsl, p);
          incomingPanel.style.setProperty('--section-shader-opacity', String(p));
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
          applyBlend(this.progress());
        };

        // Keep long pinned sections in place while the next section tilts in.
        const isOutgoingProject = section.dataset.sectionGroup === "projects";
        const isOutgoingExperience = section.hasAttribute('data-experience-journey') && experiencePinned;
        if (isOutgoingProject || isOutgoingExperience) {
          overlapTargets.push({ section: incomingSection, marginTop: incomingSection.style.marginTop });
          gsap.set(incomingSection, { "--section-overlap-offset": `${-getScrollMetrics().height}px` });
          // Keep a live margin through pin refreshes and viewport changes.
          incomingSection.style.marginTop = "var(--section-overlap-offset)";

          const tl = gsap.timeline({
            scrollTrigger: {
              scroller,
              id: incomingSection.id
                ? `section-target-${incomingSection.id}`
                : undefined,
              trigger: section,
              start: () => getProjectPinStart(section),
              end: () => `+=${getScrollMetrics().height * (isOutgoingExperience ? experienceTravelScreens + 1 : 3)}`,
              scrub: true,
              // Experience has one pin owner for both the journey and the outgoing tilt.
              ...(isOutgoingExperience && { pin: true, pinSpacing: true }),
            },
          });
          tl.to({}, { duration: isOutgoingExperience ? experienceTravelScreens : 2 });
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
        ScrollTrigger.refresh();
      });
    };

    ScrollTrigger.refresh();
    // Refresh again once carousel pins and their spacers have mounted.
    scheduleRefresh();

    let { width, height } = getScrollMetrics();
    const onResize = () => {
      const metrics = getScrollMetrics();
      if (metrics.width === width && metrics.height === height) return;
      width = metrics.width;
      height = metrics.height;
      scheduleRefresh();
    };
    const observer = viewport ? new ResizeObserver(onResize) : null;
    if (viewport) observer?.observe(viewport);

    const onScroll = () => {
      ScrollTrigger.update();
    };
    const unsubscribeLenis = lenis?.on("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      unsubscribeLenis?.();
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      cancelAnimationFrame(refreshFrame);
      ScrollTrigger.removeEventListener("refreshInit", updateOverlaps);
      ScrollTrigger.removeEventListener("refresh", updateAllTiltClips);
      sections.forEach((section) => {
        section.style.removeProperty("--tilt-hit-top");
        section.style.removeProperty("--tilt-hit-drop");
      });
      ctx.revert();
      overlapTargets.forEach(({ section, marginTop }) => {
        section.style.marginTop = marginTop;
      });
      clipTargets.forEach(({ panel }) => panel.style.removeProperty('--section-corner-scale'));
    };
  }, [lenis, experiencePinned, reducedMotion]);

  return null;
}
