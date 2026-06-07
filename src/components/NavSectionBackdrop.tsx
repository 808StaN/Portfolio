import { useEffect, useState } from "react";
import SectionShaderBackground from "./SectionShaderBackground";
import { useLenis } from "./LenisScroll";

const NAV_HEIGHT = 64;
const CLIP_OVERSCAN = 2;

const sectionColors = {
  home: "#5B8CFF",
  work: "#4655D9",
  about: "#6D4FD6",
  stack: "#287CA8",
  contact: "#1F5F87",
};

type Point = {
  x: number;
  y: number;
};

type BackdropLayer = {
  key: string;
  color: string;
  clipPath: string;
};

const getSectionColor = (section: HTMLElement) => {
  if (section.id === "home") return sectionColors.home;
  if (section.id === "about") return sectionColors.about;
  if (section.id === "stack") return sectionColors.stack;
  if (section.id === "contact") return sectionColors.contact;
  if (section.id === "work" || section.closest("#work")) return sectionColors.work;
  return sectionColors.home;
};

const clipPolygon = (
  polygon: Point[],
  inside: (point: Point) => boolean,
  intersect: (from: Point, to: Point) => Point,
) => {
  if (polygon.length === 0) return polygon;

  const clipped: Point[] = [];
  let previous = polygon[polygon.length - 1];
  let previousInside = inside(previous);

  polygon.forEach((current) => {
    const currentInside = inside(current);
    if (currentInside) {
      if (!previousInside) clipped.push(intersect(previous, current));
      clipped.push(current);
    } else if (previousInside) {
      clipped.push(intersect(previous, current));
    }
    previous = current;
    previousInside = currentInside;
  });

  return clipped;
};

const clipToNavbar = (polygon: Point[], width: number) => {
  let next = polygon;
  next = clipPolygon(
    next,
    (point) => point.x >= -CLIP_OVERSCAN,
    (from, to) => {
      const x = -CLIP_OVERSCAN;
      const t = (x - from.x) / (to.x - from.x || 1);
      return { x, y: from.y + (to.y - from.y) * t };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.x <= width + CLIP_OVERSCAN,
    (from, to) => {
      const x = width + CLIP_OVERSCAN;
      const t = (x - from.x) / (to.x - from.x || 1);
      return { x, y: from.y + (to.y - from.y) * t };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.y >= -CLIP_OVERSCAN,
    (from, to) => {
      const y = -CLIP_OVERSCAN;
      const t = (y - from.y) / (to.y - from.y || 1);
      return { x: from.x + (to.x - from.x) * t, y };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.y <= NAV_HEIGHT + CLIP_OVERSCAN,
    (from, to) => {
      const y = NAV_HEIGHT + CLIP_OVERSCAN;
      const t = (y - from.y) / (to.y - from.y || 1);
      return { x: from.x + (to.x - from.x) * t, y };
    },
  );

  return next;
};

const toClipPath = (polygon: Point[]) => {
  const points = polygon
    .map((point) => `${point.x.toFixed(2)}px ${point.y.toFixed(2)}px`)
    .join(", ");
  return `polygon(${points})`;
};

const getPanelQuad = (section: HTMLElement): Point[] => {
  const panel =
    section.querySelector<HTMLElement>(":scope > .section-tilt-panel") ??
    section;
  const getBoxQuads = (panel as HTMLElement & {
    getBoxQuads?: () => Array<{
      p1: Point;
      p2: Point;
      p3: Point;
      p4: Point;
    }>;
  }).getBoxQuads;
  const [quad] = getBoxQuads?.call(panel) ?? [];
  if (quad) return [quad.p1, quad.p2, quad.p3, quad.p4];

  const rect = panel.getBoundingClientRect();
  const computed = getComputedStyle(panel);
  const transform = computed.transform;
  const width = panel.offsetWidth || rect.width;
  const height = panel.offsetHeight || rect.height;

  if (!transform || transform === "none" || width <= 0 || height <= 0) {
    return [
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.right, y: rect.bottom },
      { x: rect.left, y: rect.bottom },
    ];
  }

  const sectionRect = section.getBoundingClientRect();
  const matrix = new DOMMatrixReadOnly(transform);
  const [originXRaw, originYRaw] = computed.transformOrigin.split(" ");
  const originX = Number.parseFloat(originXRaw) || 0;
  const originY = Number.parseFloat(originYRaw) || height;
  const baseLeft = sectionRect.left + panel.offsetLeft;
  const baseTop = sectionRect.top + panel.offsetTop;

  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ].map((point) => {
    const dx = point.x - originX;
    const dy = point.y - originY;
    return {
      x: baseLeft + originX + matrix.a * dx + matrix.c * dy + matrix.e,
      y: baseTop + originY + matrix.b * dx + matrix.d * dy + matrix.f,
    };
  });
};

const getSectionPolygon = (section: HTMLElement, width: number) => {
  const polygon = getPanelQuad(section);

  return clipToNavbar(polygon, width);
};

export default function NavSectionBackdrop() {
  const lenis = useLenis();
  const [layers, setLayers] = useState<BackdropLayer[]>([]);

  useEffect(() => {
    let frame = 0;

    const updateLayers = () => {
      frame = 0;
      const width = window.innerWidth;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-section-tilt]"),
      );

      const nextLayers = sections.flatMap((section, index) => {
        const polygon = getSectionPolygon(section, width);
        if (polygon.length < 3) return [];

        return [
          {
            key: `${section.id || "section"}-${index}`,
            color: getSectionColor(section),
            clipPath: toClipPath(polygon),
          },
        ];
      });

      setLayers(nextLayers);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLayers);
    };

    requestUpdate();
    const unsubscribeLenis = lenis?.on("scroll", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      unsubscribeLenis?.();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [lenis]);

  return (
    <div className="nav-section-backdrop" aria-hidden="true">
      <div className="nav-section-backdrop-base">
        <SectionShaderBackground color={sectionColors.home} />
      </div>
      {layers.map((layer) => (
        <div
          key={layer.key}
          className="nav-section-backdrop-layer"
          style={{ clipPath: layer.clipPath }}
        >
          <SectionShaderBackground color={layer.color} />
        </div>
      ))}
    </div>
  );
}
