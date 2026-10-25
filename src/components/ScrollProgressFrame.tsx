import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScrollViewport } from "../utils/scroll";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProgressFrame() {
  const frameRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    const viewport = getScrollViewport();
    if (!frame || !track || !progress || !viewport) return;

    const updateGeometry = () => {
      const { width, height } = frame.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(frame).strokeWidth) / 2;
      const outerRadius = parseFloat(getComputedStyle(frame.parentElement!).borderTopLeftRadius);
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
      },
    });

    return () => {
      observer.disconnect();
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
