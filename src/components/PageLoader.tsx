import { useEffect, useRef, useState } from 'react';
import { sectionColors } from '../constants/sectionColors';
import { useLenis } from './LenisScroll';
import { getScrollViewport } from '../utils/scroll';
import './PageLoader.css';

export type PageLoaderStage = 'intro' | 'revealing' | 'done';

export default function PageLoader({ ready, onStageChange }: { ready: boolean; onStageChange: (stage: PageLoaderStage) => void }) {
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const revealing = introComplete && ready;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.documentElement.setAttribute('data-page-loading', '');
    rootRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onStageChange('done');
      if (event.key === 'Tab') {
        event.preventDefault();
        skipRef.current?.focus();
      }
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) onStageChange('done');
    };
    window.addEventListener('keydown', onKeyDown);
    reducedMotion.addEventListener('change', onMotionChange);
    const intro = window.setTimeout(() => setIntroComplete(true), 1200);
    // A failed or stalled GPU must never leave the page locked behind the intro.
    const timeout = window.setTimeout(() => onStageChange('done'), reducedMotion.matches ? 0 : 10000);
    return () => {
      clearTimeout(intro);
      clearTimeout(timeout);
      document.documentElement.removeAttribute('data-page-loading');
      window.removeEventListener('keydown', onKeyDown);
      reducedMotion.removeEventListener('change', onMotionChange);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        const focusTarget = previousFocus === document.body ? getScrollViewport() ?? previousFocus : previousFocus;
        focusTarget.focus({ preventScroll: true });
      }
    };
  }, [onStageChange]);

  useEffect(() => {
    if (!revealing) return;
    // CSS animations can be disabled or interrupted independently of WebGPU.
    const timeout = window.setTimeout(() => onStageChange('done'), 1100);
    return () => clearTimeout(timeout);
  }, [revealing, onStageChange]);

  useEffect(() => {
    lenis?.stop();
    return () => { lenis?.start(); };
  }, [lenis]);

  return (
    <div
      ref={rootRef}
      className="page-loader"
      data-revealing={revealing}
      role="dialog"
      aria-modal="true"
      aria-label="Loading portfolio"
      tabIndex={-1}
      onAnimationStart={event => {
        if (event.animationName === 'page-loader-top-out') onStageChange('revealing');
      }}
      onAnimationEnd={event => {
        if (event.animationName === 'page-loader-bottom-out') onStageChange('done');
      }}
    >
      <div className="page-loader__backdrop" aria-hidden="true" />
      <div className="page-loader__panel page-loader__panel--top" style={{ background: sectionColors.home }}>
        <p className="page-loader__heading">Dawid Stanisz</p>
      </div>
      <div className="page-loader__panel page-loader__panel--bottom" style={{ background: sectionColors.home }}>
        <p className="page-loader__subtitle">[ FULL-STACK DEVELOPER ]</p>
      </div>
      <button ref={skipRef} className="page-loader__skip" type="button" onClick={() => onStageChange('done')}>
        Skip intro
      </button>
    </div>
  );
}
