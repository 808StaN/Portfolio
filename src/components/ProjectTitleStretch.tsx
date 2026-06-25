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
export const STRETCH_START = 4;
export const STRETCH_END = 1;

// Stała kompensacja szerokości: font jest ×STRETCH_START szerszy, więc ściskamy go z powrotem.
const BASE_SCALE_X = 1 / STRETCH_START;
const REST_SCALE_Y = STRETCH_END / STRETCH_START;
const DEFAULT_BASELINE_RATIO = 0.8;

type ProjectTitleStretchProps = {
  title: string;
  projectId: string;
};

// Pozycja baseline (dół widocznych liter) jako ułamek wysokości pudełka tekstu.
// Pivot skalowania ustawiamy właśnie tutaj, żeby dół liter nie "oddychał".
function measureBaselineRatio(textEl: HTMLElement): number {
  const marker = document.createElement("span");
  marker.style.cssText =
    "display:inline-block;width:0;height:0;vertical-align:baseline;";
  textEl.appendChild(marker);
  const textRect = textEl.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  textEl.removeChild(marker);
  if (textRect.height === 0) return DEFAULT_BASELINE_RATIO;
  const ratio = (markerRect.top - textRect.top) / textRect.height;
  return Number.isFinite(ratio) ? ratio : DEFAULT_BASELINE_RATIO;
}

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

    const titleEl = scaleEl.querySelector<HTMLElement>(".projects-title");
    const section = scaleEl.closest<HTMLElement>("[data-section-tilt]");
    if (!titleEl || !section) return;

    const setOrigin = () => {
      const ratio = measureBaselineRatio(titleEl);
      scaleEl.style.transformOrigin = `left ${ratio * 100}%`;
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setOrigin();
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
      onRefresh: (self) => {
        setOrigin();
        applyTitleStretch(scaleEl, self.progress);
      },
      onUpdate: (self) => applyTitleStretch(scaleEl, self.progress),
    });

    // Po załadowaniu fontu metryki baseline mogą się zmienić → przemierz.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      setOrigin();
      applyTitleStretch(scaleEl, trigger.progress);
    });

    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(() => {
      refresh();
      requestAnimationFrame(refresh);
    });
    const lateRefresh = window.setTimeout(refresh, 500);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(lateRefresh);
      trigger.kill();
    };
  }, [lenis, projectId]);

  return (
    <div className="projects-title-stretch">
      <div
        className="projects-title-scale"
        ref={scaleRef}
        style={{
          transformOrigin: `left ${DEFAULT_BASELINE_RATIO * 100}%`,
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
