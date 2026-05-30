import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

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
  if (lenis) {
    lenis.scrollTo(targetY, {
      duration: options?.duration ?? 1.1,
      immediate: options?.immediate,
      lock: options?.lock,
      onComplete: options?.onComplete,
    });
    return;
  }

  window.scrollTo({
    top: targetY,
    behavior: options?.immediate ? "auto" : "smooth",
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

    const instance = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      anchors: true,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");
    setLenis(instance);

    return () => {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
