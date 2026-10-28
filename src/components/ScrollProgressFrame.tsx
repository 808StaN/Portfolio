import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sectionShaderPalettes, type ShaderPalette } from "../constants/sectionColors";
import { getScrollViewport } from "../utils/scroll";
import { hexToHsl, hslToHex } from "../utils/tilt";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgressFrame() {
  const frameRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    const viewport = getScrollViewport();
    if (!frame || !track || !progress || !viewport) return;

    const sections = Array.from(viewport.querySelectorAll<HTMLElement>("[data-section-color]")).reverse();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeColor = "";
    let colorTween: gsap.core.Tween | undefined;
    let colorFrame = 0;

    const updateColors = () => {
      const rect = viewport.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-section-color]");
      // Panels ignore pointer events, and navigation snapshots can intercept hit testing.
      let section = hit;
      let closestDistance = Infinity;
      if (!section) {
        for (const candidate of sections) {
          const panel = candidate.querySelector(":scope > .section-tilt-panel")?.getBoundingClientRect();
          if (!panel) continue;
          const distance = Math.max(panel.top - y, y - panel.bottom, 0);
          if (distance < closestDistance) {
            section = candidate;
            closestDistance = distance;
          }
          if (distance === 0) break;
        }
      }
      const palette = section?.querySelector<HTMLElement>("[data-shader-palette]")?.dataset.shaderPalette as ShaderPalette | undefined;
      const color = palette ? sectionShaderPalettes[palette][3] : section?.dataset.sectionColor;
      if (!color || color === activeColor) return;

      const { h, s } = hexToHsl(color);
      colorTween?.kill();
      colorTween = gsap.to(frame, {
        "--scroll-frame-track": hslToHex(h, s * (palette === 'home' ? 0.75 : 0.85), palette === 'home' ? 0.53 : 0.4),
        "--scroll-frame-progress": hslToHex(h, Math.min(0.95, s * 1.25), 0.6),
        duration: reducedMotion.matches || !activeColor ? 0 : 0.45,
        ease: "power2.out",
      });
      activeColor = color;
    };

    const scheduleColors = () => {
      if (!colorFrame) colorFrame = requestAnimationFrame(() => {
        // Read after ScrollTrigger has applied the destination's pins and tilt transforms.
        colorFrame = requestAnimationFrame(() => {
          colorFrame = 0;
          updateColors();
        });
      });
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) colorTween?.progress(1);
    };

    const updateGeometry = () => {
      const { width, height } = frame.getBoundingClientRect();
      const style = getComputedStyle(frame);
      const inset = parseFloat(style.strokeWidth) / 2;
      const outerRadius = parseFloat(style.borderTopLeftRadius);
      const radius = Math.max(0, Math.min(outerRadius, width / 2, height / 2) - inset);
      const right = width - inset;
      const bottom = height - inset;

      // Start at the top center and follow the rounded frame clockwise.
      const path = [
        `M ${width / 2} ${inset}`,
        `H ${right - radius}`,
        `A ${radius} ${radius} 0 0 1 ${right} ${inset + radius}`,
        `V ${bottom - radius}`,
        `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
        `H ${inset + radius}`,
        `A ${radius} ${radius} 0 0 1 ${inset} ${bottom - radius}`,
        `V ${inset + radius}`,
        `A ${radius} ${radius} 0 0 1 ${inset + radius} ${inset}`,
        `H ${width / 2} Z`,
      ].join(" ");

      frame.setAttribute("viewBox", `0 0 ${width} ${height}`);
      track.setAttribute("d", path);
      progress.setAttribute("d", path);
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(frame);

    const tween = gsap.fromTo(progress, { attr: { "stroke-dashoffset": 1 } }, {
      attr: { "stroke-dashoffset": 0 },
      ease: "none",
      scrollTrigger: {
        id: "portfolio-frame-progress",
        scroller: viewport,
        start: 0,
        end: () => Math.max(1, ScrollTrigger.maxScroll(viewport)),
        scrub: true,
        // Measure the full range after section and carousel pins are refreshed.
        refreshPriority: -1,
        onUpdate: scheduleColors,
      },
    });

    updateColors();
    viewport.addEventListener("scroll", scheduleColors, { passive: true });
    ScrollTrigger.addEventListener("refresh", scheduleColors);
    // Navigation changes snapshots without necessarily emitting another scroll event.
    const navigationObserver = new MutationObserver(scheduleColors);
    navigationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      navigationObserver.disconnect();
      viewport.removeEventListener("scroll", scheduleColors);
      ScrollTrigger.removeEventListener("refresh", scheduleColors);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (colorFrame) cancelAnimationFrame(colorFrame);
      colorTween?.kill();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <svg ref={frameRef} className="scroll-progress-frame" aria-hidden="true" focusable="false">
      <path ref={trackRef} className="scroll-progress-frame__track" />
      <path
        ref={progressRef}
        className="scroll-progress-frame__progress"
        pathLength="1"
        strokeDasharray="1 1"
        strokeDashoffset="1"
      />
    </svg>
  );
}
