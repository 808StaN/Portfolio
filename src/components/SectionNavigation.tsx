import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY, useLenis } from './LenisScroll';
import { blendSectionColor, getSectionCornerScale, hexToHsl, incomingAngles } from '../utils/tilt';
import { getKeyboardScrollDelta, getScrollMetrics, getScrollTargetTop, getScrollViewport } from '../utils/scroll';

export const sectionLinks = [
  { label: 'Projects', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
];

type TransitionScope = HTMLElement & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

type SectionNavigationContextValue = {
  navigate: (href: string) => Promise<void>;
  cancelNavigation: () => Promise<boolean>;
  activeSection: string;
};

const SectionNavigationContext = createContext<SectionNavigationContextValue | null>(null);

export function useSectionNavigation() {
  const context = useContext(SectionNavigationContext);
  if (!context) throw new Error('useSectionNavigation must be used within SectionNavigationProvider');
  return context;
}

export function SectionNavigationProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const [activeSection, setActiveSection] = useState('');
  const navigationRequest = useRef(0);
  const navigation = useRef<{ transition: ViewTransition; release: () => void } | null>(null);

  useEffect(() => () => {
    navigationRequest.current += 1;
    navigation.current?.transition.skipTransition();
    navigation.current?.release();
  }, []);

  const getSectionTargetTop = (section: HTMLElement) => {
    if (section.id === 'home') return 0;
    const { limit } = getScrollMetrics();
    const transitionTarget = ScrollTrigger.getById(`section-target-${section.id}`);
    const top =
      transitionTarget?.end !== undefined
        ? transitionTarget.end
        : getScrollTargetTop(section);
    return Math.min(Math.max(0, top), limit);
  };

  useEffect(() => {
    const ids = sectionLinks.map(link => link.href.slice(1));
    const root = document.documentElement;
    const hero = document.getElementById('home');
    const scroller = getScrollViewport() ?? window;

    const updateNavigation = () => {
      // Use the pin's actual end so expansion finishes with the hero tilt.
      const heroTransition = ScrollTrigger.getAll().find(trigger =>
        trigger.trigger === hero && trigger.vars.pin);
      const metrics = getScrollMetrics();
      const heroEnd = heroTransition?.end ?? hero?.offsetHeight ?? metrics.height;
      const progress = Math.max(0, Math.min(1, metrics.scroll / Math.max(1, heroEnd)));
      root.style.setProperty('--nav-hero-progress', progress.toFixed(4));

      const sections = ids
        .map(id => document.getElementById(id) as HTMLElement | null)
        .filter((section): section is HTMLElement => Boolean(section));
      if (sections.length === 0) return;

      const activationY = metrics.top + metrics.height * 0.5;
      let nextActiveSection = '';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationY && rect.bottom > activationY) {
          nextActiveSection = section.id;
        }
      });

      setActiveSection(nextActiveSection);
    };

    updateNavigation();
    const unsubscribeLenis = lenis?.on('scroll', updateNavigation);
    if (!lenis) {
      scroller.addEventListener('scroll', updateNavigation, { passive: true });
    }
    window.addEventListener('resize', updateNavigation);
    ScrollTrigger.addEventListener('refresh', updateNavigation);
    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        scroller.removeEventListener('scroll', updateNavigation);
      }
      window.removeEventListener('resize', updateNavigation);
      ScrollTrigger.removeEventListener('refresh', updateNavigation);
      root.style.removeProperty('--nav-hero-progress');
    };
  }, [lenis]);

  const navigate = async (href: string) => {
    const request = ++navigationRequest.current;
    const previous = navigation.current;
    if (previous) {
      previous.transition.skipTransition();
      await previous.transition.finished.catch(() => {});
    }
    if (request !== navigationRequest.current) return;

    const el = document.querySelector(href) as HTMLElement | null;
    if (!el) return;
    const returningHome = el.id === 'home';
    const top = getSectionTargetTop(el);
    const metrics = getScrollMetrics();
    const viewport = getScrollViewport();
    if (Math.abs(metrics.scroll - top) < 2) return;
    const root = document.documentElement;
    const startProgress = Number(getComputedStyle(root).getPropertyValue('--nav-hero-progress'));
    let heroOffset = 0;
    const goingBack = !returningHome && top < metrics.scroll;
    const panel = el.querySelector<HTMLElement>('.section-tilt-panel');
    const targetColor = panel?.closest<HTMLElement>('[data-section-color]')?.dataset.sectionColor;
    let outgoingPanel: HTMLElement | null = null;
    let outgoingSection: HTMLElement | null = null;
    let captureSnapshot = false;
    let jumped = false;

    const jump = () => {
      if (jumped || request !== navigationRequest.current || !el.isConnected) return;
      outgoingPanel?.removeAttribute('data-nav-capture');
      outgoingSection?.removeAttribute('data-nav-source');
      if (document.documentElement.classList.contains('nav-section-transition')) {
        document.documentElement.classList.add('nav-capture-ready');
      }
      if (lenis) {
        lenis.scrollTo(top, { immediate: true, force: true });
      } else {
        scrollToY(top, null, { immediate: true });
      }
      jumped = true;
      ScrollTrigger.update();
      // Animate the viewport, so its live contents can scroll independently of the entrance.
      if (captureSnapshot) {
        viewport?.setAttribute('data-nav-capture', '');
        panel?.setAttribute('data-nav-blend', '');
      }
      // Reveal scroll-triggered content, but leave the hero's looping animation alone.
      if (!returningHome) {
        el.querySelectorAll<HTMLElement>('.section-tilt-container [style*="opacity"]')
          .forEach(node => {
            if (!node.closest('[data-scroll-journey]')) node.setAttribute('data-nav-revealed', '');
          });
      }
      flushSync(() => setActiveSection(el.id));
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      // Pin and capture layout updates can adjust the browser's scroll position.
      if (Math.abs(getScrollMetrics().scroll - top) > 1) {
        scrollToY(top, null, { immediate: true });
        ScrollTrigger.update();
      }
      if (root.classList.contains('nav-section-transition')) {
        // Capture the navbar at its source width, before starting its independent expansion.
        heroOffset = startProgress - Number(root.style.getPropertyValue('--nav-hero-progress'));
        root.style.setProperty('--nav-hero-offset', String(heroOffset));
      }
    };

    const scope = document.querySelector<TransitionScope>('#page-transition-scope');
    const useScopedTransition = typeof scope?.startViewTransition === 'function';
    const host = useScopedTransition ? scope : root;
    // Keep native card animations when only document-wide transitions are available.
    const startTransition = useScopedTransition
      ? scope.startViewTransition!.bind(scope)
      : document.startViewTransition?.bind(document);
    if (!startTransition
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !panel || !targetColor || !viewport) {
      jump();
      return;
    }

    if (goingBack) {
      for (const section of document.querySelectorAll<HTMLElement>('[data-section-tilt]')) {
        const candidate = section.querySelector<HTMLElement>(':scope > .section-tilt-panel');
        if (!candidate) continue;
        const rect = candidate.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        if (sectionRect.top < metrics.top + metrics.height && sectionRect.bottom > metrics.top
          && rect.top < metrics.top + metrics.height && rect.bottom > metrics.top) outgoingPanel = candidate;
      }
    }
    const outgoingRect = outgoingPanel?.getBoundingClientRect();
    outgoingSection = outgoingPanel?.parentElement ?? null;
    const outgoingStyle = outgoingPanel ? getComputedStyle(outgoingPanel) : null;
    const outgoingMatrix = new DOMMatrix(outgoingStyle?.transform === 'none' ? undefined : outgoingStyle?.transform);
    // Preserve the whole frame if multiple tilted cards are visible during an overlap.
    const useRootSnapshot = goingBack && (!outgoingRect
      || Math.abs(outgoingMatrix.b) > 0.00001 || Math.abs(outgoingMatrix.a - 1) > 0.00001
      || outgoingRect.top > metrics.top + 1 || outgoingRect.bottom < metrics.top + metrics.height - 1);
    const wasStopped = lenis?.isStopped;
    const panelStyle = goingBack && outgoingStyle ? outgoingStyle : getComputedStyle(panel);
    const panelRadius = panelStyle.getPropertyValue('--section-base-radius').trim() || '0px';
    const panelHeight = goingBack && !outgoingPanel ? metrics.height : parseFloat(panelStyle.height);
    // Card transitions still blend scene colors, independently of the navbar glass.
    const sourceSection = Array.from(document.querySelectorAll<HTMLElement>('[data-section-tilt]')).reverse().find(section => {
      const candidate = section.querySelector(':scope > .section-tilt-panel');
      if (!candidate) return false;
      const rect = section.getBoundingClientRect();
      const transform = getComputedStyle(candidate).transform;
      return rect.top <= metrics.top + 1 && rect.bottom > metrics.top
        && (transform === 'none' || Math.abs(new DOMMatrix(transform).b) < 0.001);
    });
    const fromHsl = hexToHsl(sourceSection?.dataset.sectionColor || targetColor);
    const toHsl = hexToHsl(targetColor);
    root.style.setProperty('--nav-section-start-color', blendSectionColor(fromHsl, toHsl, 0));
    root.style.setProperty('--nav-section-start-angle', `${incomingAngles[0]}deg`);
    root.style.setProperty('--nav-section-top-left-radius', panelRadius);
    root.style.setProperty('--nav-section-top-right-radius', panelRadius);
    root.style.setProperty('--nav-section-travel', `${panelHeight}px`);
    const snapshotX = useScopedTransition ? 0 : metrics.left;
    const snapshotY = useScopedTransition ? 0 : metrics.top;
    root.style.setProperty('--nav-snapshot-x', `${snapshotX}px`);
    root.style.setProperty('--nav-snapshot-y', `${snapshotY}px`);
    root.style.setProperty('--nav-section-source-transform', goingBack && !useRootSnapshot && outgoingRect
      ? `translate(${outgoingRect.left - metrics.left + snapshotX}px, ${outgoingRect.top - metrics.top + snapshotY}px)`
      : useRootSnapshot ? 'translate(0px, 0px)' : `translate(${snapshotX}px, ${snapshotY}px)`);
    root.classList.toggle('nav-home-transition', returningHome);
    root.classList.toggle('nav-back-transition', goingBack);
    root.classList.toggle('nav-back-root-transition', useRootSnapshot);
    root.classList.toggle('nav-document-transition', !useScopedTransition);
    root.classList.add('nav-section-transition');
    scope?.classList.toggle('nav-home-transition', returningHome);
    scope?.classList.toggle('nav-back-transition', goingBack);
    scope?.classList.toggle('nav-back-root-transition', useRootSnapshot);
    scope?.classList.add('nav-section-transition');
    lenis?.stop();
    captureSnapshot = !returningHome && !goingBack;
    if (goingBack && !useRootSnapshot && outgoingStyle) {
      // Keep the visible card unchanged while capturing its background separately.
      root.style.setProperty('--nav-outgoing-color', outgoingStyle.backgroundColor);
      outgoingSection?.setAttribute('data-nav-source', '');
      outgoingPanel?.setAttribute('data-nav-capture', '');
    }
    const animations: Animation[] = [];
    let released = false;
    let scrollReady = false;
    let queuedDelta = 0;
    let touchY: number | null = null;
    const scrollBy = (delta: number) => {
      if (lenis) lenis.scrollTo(lenis.targetScroll + delta, { programmatic: false, lerp: lenis.options.lerp });
      else scrollToY(getScrollMetrics().scroll + delta, null);
    };
    const resumeScroll = () => {
      // Cleanup must not restart Lenis and discard scrolling already in progress.
      if (scrollReady) return;
      scrollReady = true;
      if (!wasStopped) {
        lenis?.start();
        if (request === navigationRequest.current && queuedDelta) scrollBy(queuedDelta);
      }
      queuedDelta = 0;
    };
    const release = () => {
      if (released) return;
      released = true;
      captureSnapshot = false;
      viewport.removeAttribute('data-nav-capture');
      panel.removeAttribute('data-nav-capture');
      panel.removeAttribute('data-nav-blend');
      outgoingPanel?.removeAttribute('data-nav-capture');
      outgoingSection?.removeAttribute('data-nav-source');
      animations.forEach(animation => animation.cancel());
      root.classList.remove('nav-section-transition', 'nav-home-transition', 'nav-back-transition', 'nav-back-root-transition', 'nav-capture-ready', 'nav-document-transition');
      scope?.classList.remove('nav-section-transition', 'nav-home-transition', 'nav-back-transition', 'nav-back-root-transition');
      root.style.removeProperty('--nav-section-start-color');
      root.style.removeProperty('--nav-section-start-angle');
      root.style.removeProperty('--nav-section-top-left-radius');
      root.style.removeProperty('--nav-section-top-right-radius');
      root.style.removeProperty('--nav-section-source-transform');
      root.style.removeProperty('--nav-section-travel');
      root.style.removeProperty('--nav-outgoing-color');
      root.style.removeProperty('--nav-snapshot-x');
      root.style.removeProperty('--nav-snapshot-y');
      root.style.removeProperty('--nav-hero-offset');
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('touchend', onTouchEnd, true);
      window.removeEventListener('touchcancel', onTouchEnd, true);
      window.removeEventListener('keydown', interrupt, true);
      window.removeEventListener('resize', interrupt);
      resumeScroll();
    };

    const consumeScroll = (delta: number, event: Event) => {
      if (released || wasStopped || delta === 0) return;
      if (event.cancelable) event.preventDefault();
      if (scrollReady) scrollBy(delta);
      else queuedDelta += delta;
    };

    const onWheel = (event: WheelEvent) => {
      if (scrollReady || event.ctrlKey || event.defaultPrevented || (event.target instanceof Element
        && event.target.closest('.mobile-menu-backdrop'))) return;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 100 / 6
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
      consumeScroll(event.deltaY * unit * (lenis?.options.wheelMultiplier ?? 1), event);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches.length === 1 && !(event.target instanceof Element
        && event.target.closest('.site-nav, .mobile-menu-backdrop')) ? event.touches[0].clientY : null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) { touchY = null; return; }
      const y = event.touches[0].clientY;
      const delta = (touchY - y) * (lenis?.options.touchMultiplier ?? 1);
      touchY = y;
      if (!scrollReady) consumeScroll(delta, event);
    };

    const onTouchEnd = () => { touchY = null; };

    const interrupt = (event: Event) => {
      if (released) return;
      if (event instanceof KeyboardEvent) {
        if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey
          || (event.target instanceof HTMLElement
            && (event.target.isContentEditable || event.target.closest('input, textarea, select')))) return;
        const delta = getKeyboardScrollDelta(event);
        if (delta !== null) {
          // Once live scrolling resumes, the shared keyboard handler owns the event.
          if (!scrollReady) consumeScroll(delta, event);
          return;
        }
        if (event.key !== 'Escape') return;
      }
      transition.skipTransition();
    };
    const transition = startTransition(jump);
    navigation.current = { transition, release };
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });
    window.addEventListener('keydown', interrupt, true);
    window.addEventListener('resize', interrupt);
    const failReady = () => {
      transition.skipTransition();
    };
    void transition.ready.then(() => {
      captureSnapshot = false;
      if (released || request !== navigationRequest.current) return;
      const animatedSnapshot = useRootSnapshot
        ? '::view-transition-old(root)' : '::view-transition-group(nav-section)';
      const style = getComputedStyle(host, animatedSnapshot);
      const entryAnimation = host.getAnimations({ subtree: true }).find(animation =>
        animation instanceof CSSAnimation && animation.animationName === (goingBack ? 'nav-section-return' : 'nav-section-enter'));
      const timing = {
        duration: returningHome ? 600 : parseFloat(style.animationDuration) * 1000,
        easing: returningHome ? 'ease-in-out' : style.animationTimingFunction,
        fill: 'both' as const,
      };
      if (heroOffset !== 0) {
        animations.push(root.animate([
          { '--nav-hero-offset': heroOffset },
          { '--nav-hero-offset': 0 },
        ], timing));
      }
      if (returningHome) {
        for (const [snapshot, from, to] of [['old', 1, 0], ['new', 0, 1]] as const) {
          animations.push(host.animate([
            { opacity: from },
            { opacity: to },
          ], {
            ...timing,
            pseudoElement: `::view-transition-${snapshot}(root)`,
          }));
        }
        const startTime = document.timeline.currentTime;
        if (startTime != null) {
          animations.forEach(animation => { animation.startTime = startTime; });
        }
        resumeScroll();
        return;
      }
      animations.push(host.animate(Array.from({ length: 61 }, (_, index) => {
        const progress = index / 60;
        const radius = `calc(${panelRadius} * ${getSectionCornerScale(goingBack ? 1 - progress : progress)})`;
        return {
          offset: progress,
          clipPath: `inset(0 round ${radius} ${radius} 0 0)`,
        };
      }), {
        ...timing,
        pseudoElement: animatedSnapshot,
      }));
      if (!useRootSnapshot) {
        // The movement eases out early; keep the color blend running for the full transition.
        animations.push((goingBack ? host : panel).animate(Array.from({ length: 61 }, (_, index) => ({
          offset: index / 60,
          backgroundColor: blendSectionColor(fromHsl, toHsl, index / 60),
          ...(!goingBack && { opacity: 1 - index / 60 }),
        })), {
          ...timing,
          easing: 'linear',
          pseudoElement: goingBack ? animatedSnapshot : '::before',
        }));
      }
      if (entryAnimation?.startTime != null) {
        for (const animation of animations) {
          animation.startTime = entryAnimation.startTime;
        }
      }
      resumeScroll();
    }, failReady).catch(failReady);
    try {
      await transition.finished;
    } catch {
      // Snapshot failures must not prevent navigation to the requested section.
      if (request === navigationRequest.current) jump();
    } finally {
      release();
      if (navigation.current?.transition === transition) navigation.current = null;
    }
  };

  const cancelNavigation = async () => {
    const request = ++navigationRequest.current;
    const previous = navigation.current;
    if (previous) {
      previous.transition.skipTransition();
      await previous.transition.finished.catch(() => {});
    }
    return request === navigationRequest.current;
  };

  return (
    <SectionNavigationContext.Provider value={{ navigate, cancelNavigation, activeSection }}>
      {children}
    </SectionNavigationContext.Provider>
  );
}
