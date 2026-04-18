import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isBlend, setIsBlend] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;

      const interactive = target.closest(
        'a, button, [role="link"], [tabindex]',
      );
      setIsHovering(!!interactive);

      const isText = target.closest(
        "p, h1, h2, h3, h4, h5, h6, span, li, blockquote, label, a, button",
      );
      const isImage = target.closest("img, picture, figure, svg, video");
      setIsBlend(!!(isText || isImage));
    };

    window.addEventListener("mouseover", onOver, { passive: true });

    const animate = () => {
      if (dotRef.current && ringRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;

        ring.current.x += (pos.current.x - ring.current.x) * 0.12;
        ring.current.y += (pos.current.y - ring.current.y) * 0.12;
        // translate w animacji, scale przez CSS osobno
        ringRef.current.style.translate = `${ring.current.x - 16}px ${ring.current.y - 16}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const style = document.createElement("style");
    style.innerHTML = `*, *:hover { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return null;
  }

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
          mixBlendMode: isBlend ? "difference" : "normal",
        }}
        aria-hidden="true"
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: `1px solid ${isHovering ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"}`,
          opacity: visible ? 1 : 0,
          scale: isHovering ? "1.50" : "1",
          transition:
            "opacity 0.6s ease, border-color 0.6s ease, scale 0.4s ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}
