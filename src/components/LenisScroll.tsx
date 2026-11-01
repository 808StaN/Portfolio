import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getKeyboardScrollDelta, getScrollViewport } from "../utils/scroll";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

type ScrollToOptions = {
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
};

/** Scroll do pozycji Y — Lenis gdy aktywny, inaczej natywny fallback. */
export function scrollToY(
  targetY: number,
  lenis: Lenis | null,
  options?: ScrollToOptions,
) {
  const immediate =
    options?.immediate ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (lenis) {
    lenis.scrollTo(targetY, {
      duration: options?.duration ?? 1.1,
      immediate,
      lock: options?.lock,
      onComplete: options?.onComplete,
    });
    return;
  }

  (getScrollViewport() ?? window).scrollTo({
    top: targetY,
    behavior: immediate ? "instant" : "smooth",
  });
  options?.onComplete?.();
}

export default function LenisScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const viewport = getScrollViewport();
    let multiTouch = false;
    const instance = new Lenis({
      wrapper: viewport ?? window,
      eventsTarget: window,
      content: viewport
        ? viewport.querySelector<HTMLElement>(".portfolio-scroll-content")!
        : document.documentElement,
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.35,
      gestureOrientation: "vertical",
      overscroll: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      anchors: true,
      prevent: (node) => Boolean(node.closest(".mobile-menu-backdrop")),
      virtualScroll: ({ event }) => {
        if ("touches" in event) {
          if (event.type === "touchstart") multiTouch = event.touches.length > 1;
          else if (event.touches.length > 1) multiTouch = true;
          if (multiTouch) {
            if (event.touches.length === 0) multiTouch = false;
            return false;
          }
        }
        return !event.defaultPrevented;
      },
    });

    // Firefox can round scrolling and transform pins on different pixel boundaries.
    // Snap before scroll subscribers run, without rounding Lenis's inertia state.
    const unsubscribePixelSnap = viewport && /Firefox\//.test(navigator.userAgent)
      ? instance.on("scroll", () => {
          if (instance.isScrolling !== "smooth") return;
          const top = Math.round(instance.scroll);
          if (viewport.scrollTop !== top) {
            viewport.scrollTo({ top, behavior: "instant" });
          }
        })
      : undefined;

    setLenis(instance);

    return () => {
      unsubscribePixelSnap?.();
      instance.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onKeyDown = (event: KeyboardEvent) => {
      const delta = getKeyboardScrollDelta(event);
      if (delta === null) return;
      event.preventDefault();
      if (lenis?.isStopped || lenis?.isLocked) return;

      const current = lenis?.scroll ?? viewport.scrollTop;
      const target = lenis?.targetScroll ?? current;
      // Reverse from the current position rather than consuming pending motion first.
      const next = (delta * (target - current) < 0 ? current : target) + delta;
      if (lenis) {
        lenis.scrollTo(next, { programmatic: false, lerp: lenis.options.lerp, immediate: reducedMotion.matches });
      } else {
        viewport.scrollTo({ top: next, behavior: "instant" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lenis]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
