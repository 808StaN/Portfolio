import { useEffect, useState } from "react";
import { useLenis } from "./LenisScroll";

const NAV_HEIGHT = 64;

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

const getPanelQuad = (panel: HTMLElement): Point[] => {
  const getBoxQuads = (panel as HTMLElement & {
    getBoxQuads?: () => Array<{
      p1: Point;
      p2: Point;
      p3: Point;
      p4: Point;
    }>;
  }).getBoxQuads;

  const [quad] = getBoxQuads?.call(panel) ?? [];
  if (quad) {
    return [quad.p1, quad.p2, quad.p3, quad.p4];
  }

  const rect = panel.getBoundingClientRect();
  const width = panel.offsetWidth;
  const height = panel.offsetHeight;
  const transform = getComputedStyle(panel).transform;

  if (width > 0 && height > 0 && transform && transform !== "none") {
    const matrix = new DOMMatrixReadOnly(transform);
    const localCorners = [
      { x: 0, y: -height },
      { x: width, y: -height },
      { x: width, y: 0 },
      { x: 0, y: 0 },
    ].map((point) => {
      const transformed = matrix.transformPoint(point);
      return { x: transformed.x, y: transformed.y };
    });
    const minX = Math.min(...localCorners.map((point) => point.x));
    const minY = Math.min(...localCorners.map((point) => point.y));
    const origin = {
      x: rect.left - minX,
      y: rect.top - minY,
    };

    return localCorners.map((point) => ({
      x: origin.x + point.x,
      y: origin.y + point.y,
    }));
  }

  return [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];
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
    (point) => point.x >= 0,
    (from, to) => {
      const t = (0 - from.x) / (to.x - from.x || 1);
      return { x: 0, y: from.y + (to.y - from.y) * t };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.x <= width,
    (from, to) => {
      const t = (width - from.x) / (to.x - from.x || 1);
      return { x: width, y: from.y + (to.y - from.y) * t };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.y >= 0,
    (from, to) => {
      const t = (0 - from.y) / (to.y - from.y || 1);
      return { x: from.x + (to.x - from.x) * t, y: 0 };
    },
  );
  next = clipPolygon(
    next,
    (point) => point.y <= NAV_HEIGHT,
    (from, to) => {
      const t = (NAV_HEIGHT - from.y) / (to.y - from.y || 1);
      return { x: from.x + (to.x - from.x) * t, y: NAV_HEIGHT };
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
        const panel =
          section.querySelector<HTMLElement>(":scope > .section-tilt-panel") ??
          section;
        const polygon = clipToNavbar(getPanelQuad(panel), width);
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
      <div className="nav-section-backdrop-base" />
      {layers.map((layer) => (
        <div
          key={layer.key}
          className="nav-section-backdrop-layer"
          style={{ backgroundColor: layer.color, clipPath: layer.clipPath }}
        />
      ))}
    </div>
  );
}
