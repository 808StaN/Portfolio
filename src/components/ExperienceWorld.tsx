import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExperienceScene from './ExperienceScene';
import { experienceSceneMedia } from '../constants/experience';
import { getScrollViewport } from '../utils/scroll';

let scenePromise: Promise<typeof import('./ExperienceScene3D')> | undefined;
const loadExperienceScene = () => scenePromise ??= import('./ExperienceScene3D');
const preloadEvent = 'experience-scene-preload';
export function preloadExperienceScene() {
  window.dispatchEvent(new Event(preloadEvent));
  return loadExperienceScene();
}
const ExperienceScene3D = lazy(loadExperienceScene);

export type JourneySceneState = {
  points: { x: number; y: number }[];
  x: number;
  y: number;
  dx: number;
  dy: number;
  stride: number;
  checkpoint: number;
  visible: boolean;
  invalidate?: () => void;
};

export class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function ExperienceWorld({ journey, onSelect }: { journey: JourneySceneState; onSelect: (checkpoint: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [failed, setFailed] = useState(false);
  const focusFrame = useRef(0);
  const focusedControl = useRef<HTMLElement | null>(null);
  const restoringFocus = useRef(false);
  const restoreFocus = () => {
    if (focusedControl.current && document.activeElement === document.body) restoringFocus.current = true;
    if (!restoringFocus.current) return;
    const section = container.current?.closest<HTMLElement>('section');
    if (section?.isConnected && document.activeElement === document.body) section.focus({ preventScroll: true });
  };
  const releaseFocus = () => {
    const element = container.current;
    if (!element || (!element.contains(document.activeElement) && !(focusedControl.current && document.activeElement === document.body))) return;
    focusedControl.current = null;
    restoringFocus.current = true;
    const section = element.closest<HTMLElement>('section')!;
    section.focus({ preventScroll: true });
    // Pin teardown can reparent the section after its focused billboard disappears.
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(restoreFocus);
  };

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const media = matchMedia(experienceSceneMedia);
    const clearPendingFocus = () => {
      focusedControl.current = null;
      restoringFocus.current = false;
      cancelAnimationFrame(focusFrame.current);
    };
    const trackFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || event.target === document.body) return;
      if (event.target === element.closest('section')) {
        restoringFocus.current = true;
        return;
      }
      focusedControl.current = event.target instanceof HTMLElement && element.closest('section')?.contains(event.target) ? event.target : null;
      if (!focusedControl.current) clearPendingFocus();
    };
    const clearFocus = (event: PointerEvent) => {
      if (event.target instanceof Node && !element.contains(event.target)) {
        clearPendingFocus();
      }
    };
    const prepare = () => { if (media.matches) setEnabled(true); };
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) prepare();
    }, { root: getScrollViewport(), rootMargin: '1000px 0px' });
    const visibility = new IntersectionObserver(([entry]) => {
      journey.visible = entry.isIntersecting;
      if (journey.visible) journey.invalidate?.();
    }, { root: getScrollViewport() });
    const update = () => {
      releaseFocus();
      setEnabled(false);
      setReady(false);
      setFadeIn(false);
      preload.unobserve(element);
      if (media.matches) preload.observe(element);
    };
    update();
    visibility.observe(element);
    window.addEventListener(preloadEvent, prepare);
    document.addEventListener('focusin', trackFocus);
    document.addEventListener('pointerdown', clearFocus, true);
    document.addEventListener('wheel', clearPendingFocus, { capture: true, passive: true });
    document.addEventListener('keydown', clearPendingFocus, true);
    ScrollTrigger.addEventListener('refresh', restoreFocus);
    media.addEventListener('change', update);
    return () => {
      preload.disconnect();
      visibility.disconnect();
      window.removeEventListener(preloadEvent, prepare);
      document.removeEventListener('focusin', trackFocus);
      document.removeEventListener('pointerdown', clearFocus, true);
      document.removeEventListener('wheel', clearPendingFocus, true);
      document.removeEventListener('keydown', clearPendingFocus, true);
      ScrollTrigger.removeEventListener('refresh', restoreFocus);
      media.removeEventListener('change', update);
      cancelAnimationFrame(focusFrame.current);
      journey.visible = false;
    };
  }, [journey]);

  return (
    <div ref={container} className="experience-world-container" data-scene-ready={ready && !failed} data-scene-fade={fadeIn} data-scene-failed={failed} role="group" aria-label="Experience journey">
      <ExperienceScene checkpoint={journey.checkpoint} onSelect={onSelect} />
      {enabled && !failed && (
        <SceneBoundary onError={() => { releaseFocus(); setFailed(true); }}>
          <Suspense fallback={null}>
            <ExperienceScene3D journey={journey} onSelect={onSelect} onReady={() => { releaseFocus(); setFadeIn(journey.visible); setReady(true); }} onUnavailable={() => { releaseFocus(); setFailed(true); }} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
