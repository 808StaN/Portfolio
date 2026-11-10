import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import ExperienceScene from './ExperienceScene';
import { experiencePinMedia } from '../constants/experience';
import { getScrollViewport } from '../utils/scroll';

const ExperienceScene3D = lazy(() => import('./ExperienceScene3D'));

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

export default function ExperienceWorld({ journey }: { journey: JourneySceneState }) {
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const media = matchMedia(experiencePinMedia);
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && media.matches) setEnabled(true);
    }, { root: getScrollViewport(), rootMargin: '1000px 0px' });
    const visibility = new IntersectionObserver(([entry]) => {
      journey.visible = entry.isIntersecting;
      if (journey.visible) journey.invalidate?.();
    }, { root: getScrollViewport() });
    const update = () => {
      setEnabled(false);
      setReady(false);
      preload.unobserve(element);
      if (media.matches) preload.observe(element);
    };
    update();
    visibility.observe(element);
    media.addEventListener('change', update);
    return () => {
      preload.disconnect();
      visibility.disconnect();
      media.removeEventListener('change', update);
      journey.visible = false;
    };
  }, [journey]);

  return (
    <div ref={container} className="experience-world-container" data-scene-ready={ready && !failed} aria-hidden="true">
      <ExperienceScene />
      {enabled && !failed && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <ExperienceScene3D journey={journey} onReady={() => setReady(true)} onUnavailable={() => setFailed(true)} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
