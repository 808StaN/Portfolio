import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useLenis } from "./LenisScroll";

const MIN_THUMB_HEIGHT = 36;

type ScrollMetrics = {
  scroll: number;
  limit: number;
  viewportHeight: number;
  trackHeight: number;
};

const getScrollLimit = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export default function CustomScrollbar() {
  const lenis = useLenis();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startY: number;
    startScroll: number;
  } | null>(null);
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scroll: 0,
    limit: 0,
    viewportHeight: 1,
    trackHeight: 1,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("custom-scrollbar-enabled");

    let frame = 0;
    const readMetrics = () => {
      frame = 0;
      const limit = lenis?.limit ?? getScrollLimit();
      const scroll = Math.max(0, Math.min(limit, lenis?.scroll ?? window.scrollY));
      const trackHeight = trackRef.current?.clientHeight ?? window.innerHeight;

      setMetrics({
        scroll,
        limit,
        viewportHeight: window.innerHeight,
        trackHeight: Math.max(1, trackHeight),
      });
    };

    const requestMetrics = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(readMetrics);
      }
    };

    readMetrics();
    const unsubscribeLenis = lenis?.on("scroll", requestMetrics);
    window.addEventListener("scroll", requestMetrics, { passive: true });
    window.addEventListener("resize", requestMetrics);

    return () => {
      root.classList.remove("custom-scrollbar-enabled");
      root.classList.remove("custom-scrollbar-dragging");
      unsubscribeLenis?.();
      window.removeEventListener("scroll", requestMetrics);
      window.removeEventListener("resize", requestMetrics);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [lenis]);

  const scrollTo = (targetScroll: number) => {
    const nextScroll = Math.max(0, Math.min(metrics.limit, targetScroll));
    if (lenis) {
      lenis.scrollTo(nextScroll, { immediate: true });
      return;
    }

    window.scrollTo({ top: nextScroll, behavior: "auto" });
  };

  if (metrics.limit <= 1) return null;

  const pageHeight = metrics.limit + metrics.viewportHeight;
  const thumbHeight = Math.max(
    MIN_THUMB_HEIGHT,
    Math.min(metrics.trackHeight, (metrics.viewportHeight / pageHeight) * metrics.trackHeight),
  );
  const maxThumbTop = Math.max(0, metrics.trackHeight - thumbHeight);
  const progress = metrics.limit > 0 ? metrics.scroll / metrics.limit : 0;
  const thumbTop = maxThumbTop * progress;

  const getScrollFromPointer = (clientY: number, centerThumb = false) => {
    const track = trackRef.current;
    if (!track || maxThumbTop <= 0) return metrics.scroll;

    const rect = track.getBoundingClientRect();
    const y = clientY - rect.top - (centerThumb ? thumbHeight / 2 : 0);
    const nextProgress = Math.max(0, Math.min(1, y / maxThumbTop));
    return nextProgress * metrics.limit;
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragRef.current = {
      startY: event.clientY,
      startScroll: metrics.scroll,
    };
    document.documentElement.classList.add("custom-scrollbar-dragging");

    const onPointerMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || maxThumbTop <= 0) return;

      const deltaProgress = (moveEvent.clientY - drag.startY) / maxThumbTop;
      scrollTo(drag.startScroll + deltaProgress * metrics.limit);
    };

    const stopDrag = () => {
      dragRef.current = null;
      document.documentElement.classList.remove("custom-scrollbar-dragging");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    scrollTo(getScrollFromPointer(event.clientY, true));
  };

  return (
    <div className="custom-scrollbar" aria-hidden="true">
      <div
        ref={trackRef}
        className="custom-scrollbar-track"
        onPointerDown={handleTrackPointerDown}
      >
        <div
          className="custom-scrollbar-thumb"
          onPointerDown={startDrag}
          style={{
            height: `${thumbHeight}px`,
            transform: `translate3d(0, ${thumbTop}px, 0)`,
          }}
        />
      </div>
    </div>
  );
}
