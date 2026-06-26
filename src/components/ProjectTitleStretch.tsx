import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisScroll";

gsap.registerPlugin(ScrollTrigger);

// Wizualna wysokość tytułu: start (sekcja wjeżdża) = rozciągnięty ×STRETCH_START,
// koniec (pin) = normalny ×STRETCH_END.
//
// Tekst jest renderowany OD RAZU w dużym foncie (×STRETCH_START), a transform tylko go
// POMNIEJSZA (scale <= 1). Downscaling rastra jest zawsze ostry, więc nie ma pikselozy.
export const STRETCH_START = 3;
export const STRETCH_END = 1;

// Stała kompensacja szerokości: font jest ×STRETCH_START szerszy, więc ściskamy go z powrotem.
const BASE_SCALE_X = 1 / STRETCH_START;
const REST_SCALE_Y = STRETCH_END / STRETCH_START;
// Deterministyczny pivot skalowania (dół widocznych liter). Stały — bez pomiaru DOM,
// dzięki czemu origin nigdy nie zależy od timingu refreshy (źródło buga RiftPicka).
const BASELINE_RATIO = 0.8;
const TRANSFORM_ORIGIN = `left ${BASELINE_RATIO * 100}%`;

type ProjectTitleStretchProps = {
  title: string;
  projectId: string;
};

function applyTitleStretch(scaleEl: HTMLElement, progress: number) {
  const visibleFactor = STRETCH_START + (STRETCH_END - STRETCH_START) * progress;
  const scaleY = visibleFactor / STRETCH_START;
  scaleEl.style.transform = `scale(${BASE_SCALE_X}, ${scaleY})`;
}

export default function ProjectTitleStretch({
  title,
  projectId,
}: ProjectTitleStretchProps) {
  const scaleRef = useRef<HTMLDivElement>(null);

  const lenis = useLenis();

  useEffect(() => {
    const scaleEl = scaleRef.current;
    if (!scaleEl) return;

    const section = scaleEl.closest<HTMLElement>("[data-section-tilt]");
    if (!section) return;

    scaleEl.style.transformOrigin = TRANSFORM_ORIGIN;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      scaleEl.style.transform = `scale(${BASE_SCALE_X}, ${REST_SCALE_Y})`;
      return;
    }

    const trigger = ScrollTrigger.create({
      id: `title-stretch-${projectId}`,
      trigger: section,
      start: "top bottom",
      end: "top top",
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: (self) => applyTitleStretch(scaleEl, self.progress),
      onUpdate: (self) => applyTitleStretch(scaleEl, self.progress),
    });

    applyTitleStretch(scaleEl, trigger.progress);

    return () => {
      trigger.kill();
    };
  }, [lenis, projectId]);

  return (
    <div className="projects-title-stretch">
      <div
        className="projects-title-scale"
        ref={scaleRef}
        style={{
          transformOrigin: TRANSFORM_ORIGIN,
          transform: `scale(${BASE_SCALE_X}, ${REST_SCALE_Y})`,
        }}
      >
        <h2 className="projects-title" style={{ fontSize: `${STRETCH_START}em` }}>
          {title}
        </h2>
      </div>
    </div>
  );
}
