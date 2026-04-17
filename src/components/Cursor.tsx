import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Hover detection on interactive elements
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const interactive = target.closest('a, button, [role="link"], [tabindex]');
      setIsHovering(!!interactive);
    };

    window.addEventListener('mouseover', onOver, { passive: true });

    // Animate ring with easing
    const animate = () => {
      if (dotRef.current && ringRef.current) {
        // Dot follows exactly
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;

        // Ring lags behind
        ring.current.x += (pos.current.x - ring.current.x) * 0.12;
        ring.current.y += (pos.current.y - ring.current.y) * 0.12;
        ringRef.current.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  // Hide native cursor
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = ''; };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          mixBlendMode: 'difference',
        }}
        aria-hidden="true"
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: `1px solid ${isHovering ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}`,
          opacity: visible ? 1 : 0,
          transform: isHovering ? 'scale(1.5)' : 'scale(1)',
          transition: 'opacity 0.3s ease, border-color 0.3s ease',
        }}
        aria-hidden="true"
      />
    </>
  );
}
