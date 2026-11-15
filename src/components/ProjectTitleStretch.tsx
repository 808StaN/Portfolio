import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";
import { getScrollViewport } from "../utils/scroll";

gsap.registerPlugin(ScrollTrigger);

// Wizualna wysokość tytułu: start (sekcja wjeżdża) = rozciągnięty ×STRETCH_START,
// koniec (pin) = normalny ×STRETCH_END.
//
// Tekst jest renderowany OD RAZU w dużym foncie, a transform tylko go
// POMNIEJSZA (scale <= 1). Downscaling rastra jest zawsze ostry, więc nie ma pikselozy.
export const STRETCH_START = 3;
export const STRETCH_END = 1;

// Deterministyczny pivot skalowania (dół widocznych liter). Stały — bez pomiaru DOM,
// dzięki czemu origin nigdy nie zależy od timingu refreshy (źródło buga RiftPicka).
const BASELINE_RATIO = 0.8;

function getTransformOrigin(edgeAlign: "left" | "right") {
  const y = `${BASELINE_RATIO * 100}%`;
  return edgeAlign === "right" ? `right ${y}` : `left ${y}`;
}

type ProjectTitleStretchProps = {
  title: string;
  projectId: string;
  edgeAlign?: "left" | "right";
  variant?: "section" | "project";
};

function applyTitleStretch(scaleEl: HTMLElement, progress: number, renderScale: number) {
  const visibleFactor = STRETCH_START + (STRETCH_END - STRETCH_START) * progress;
  const scaleY = visibleFactor / renderScale;
  scaleEl.style.transform = `scale(${1 / renderScale}, ${scaleY})`;
}

export default function ProjectTitleStretch({
  title,
  projectId,
  edgeAlign = "left",
  variant = "section",
}: ProjectTitleStretchProps) {
  const scaleRef = useRef<HTMLDivElement>(null);
  const transformOrigin = getTransformOrigin(edgeAlign);
  // Raster size also sets the resting baseline; keep it independent of animation strength.
  const renderScale = variant === "project" ? 3 : 4;

  const lenis = useLenis();

  useEffect(() => {
    const scaleEl = scaleRef.current;
    if (!scaleEl) return;

    const section = scaleEl.closest<HTMLElement>("[data-section-tilt]");
    if (!section) return;

    const originalTransform = scaleEl.style.transform;
    const originalOrigin = scaleEl.style.transformOrigin;
    const restoreStyles = () => {
      scaleEl.style.transform = originalTransform;
      scaleEl.style.transformOrigin = originalOrigin;
    };
    scaleEl.style.transformOrigin = transformOrigin;

    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions?.reduced) {
        applyTitleStretch(scaleEl, 1, renderScale);
        return restoreStyles;
      }

      const trigger = ScrollTrigger.create({
        id: `title-stretch-${projectId}`,
        scroller: getScrollViewport() ?? window,
        trigger: section,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => applyTitleStretch(scaleEl, self.progress, renderScale),
        onUpdate: (self) => applyTitleStretch(scaleEl, self.progress, renderScale),
      });

      applyTitleStretch(scaleEl, trigger.progress, renderScale);

      return () => {
        trigger.kill();
        restoreStyles();
      };
    });
    return () => media.revert();
  }, [lenis, projectId, transformOrigin, renderScale]);

  return (
    <div
      className={`projects-title-stretch${edgeAlign === "right" ? " is-edge-right" : ""}`}
    >
      <div
        className="projects-title-scale"
        ref={scaleRef}
        style={{
          transformOrigin,
          transform: `scale(${1 / renderScale}, ${STRETCH_END / renderScale})`,
        }}
      >
        <h2 className="projects-title" style={{ fontSize: `${renderScale}em` }}>
          {title === "RiftPick" ? (
            <>Ri<span style={{ paddingInlineEnd: "0.04em" }}>f</span>tPick</>
          ) : title}
        </h2>
      </div>
    </div>
  );
}
