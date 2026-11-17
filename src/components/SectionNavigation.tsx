import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY, useLenis } from './LenisScroll';
import { STRETCH_START, STRETCH_END } from './ProjectTitleStretch';
import { blendSectionColor, hexToHsl, incomingAngles } from '../utils/tilt';
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
    const goingBack = top < metrics.scroll;
    const panel = el.querySelector<HTMLElement>('.section-tilt-panel');
    const targetColor = panel?.closest<HTMLElement>('[data-section-color]')?.dataset.sectionColor;
    let outgoingPanel: HTMLElement | null = null;
    let outgoingSection: HTMLElement | null = null;
    let outgoingTitle: HTMLElement | null = null;
    const outgoingPanels: HTMLElement[] = [];
    const roundedPanels: HTMLElement[] = [];
    const backCaptures: Array<{
      element: HTMLElement;
      name: string;
      color?: ReturnType<typeof hexToHsl>;
      radius?: string;
    }> = [];
    const clearBackCaptures = () => {
      backCaptures.forEach(({ element }) => {
        element.removeAttribute('data-nav-back-capture');
        element.removeAttribute('data-nav-back-background');
        element.style.removeProperty('--nav-back-capture-name');
      });
    };
    let captureSnapshot = false;
    let jumped = false;

    const jump = () => {
      if (jumped || request !== navigationRequest.current || !el.isConnected) return;
      viewport?.removeAttribute('data-nav-capture');
      el.removeAttribute('data-nav-home-source');
      outgoingPanel?.removeAttribute('data-nav-capture');
      outgoingSection?.removeAttribute('data-nav-source');
      outgoingTitle?.removeAttribute('data-nav-title-capture');
      clearBackCaptures();
      if (goingBack) roundedPanels.forEach(source => source.removeAttribute('data-nav-rounded'));
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
          && rect.top < metrics.top + metrics.height && rect.bottom > metrics.top) {
          const matrix = getComputedStyle(candidate).transform;
          const transform = new DOMMatrix(matrix === 'none' ? undefined : matrix);
          if (Math.abs(transform.b) < 0.00001 && rect.top <= metrics.top + 1
            && rect.bottom >= metrics.top + metrics.height - 1) outgoingPanels.length = 0;
          outgoingPanels.push(candidate);
          outgoingPanel = candidate;
        }
      }
    }
    // Round project seams only in the moving navbar capture, never in ordinary scrolling.
    (goingBack ? outgoingPanels : [panel]).forEach(source => {
      if (!source.matches('[data-section-group="projects"]:not([data-project-id="riftpick"]) > .section-tilt-panel')) return;
      roundedPanels.push(source);
      source.setAttribute('data-nav-rounded', '');
    });
    const outgoingRect = outgoingPanel?.getBoundingClientRect();
    outgoingSection = outgoingPanel?.parentElement ?? null;
    const outgoingStyle = outgoingPanel ? getComputedStyle(outgoingPanel) : null;
    const outgoingMatrix = new DOMMatrix(outgoingStyle?.transform === 'none' ? undefined : outgoingStyle?.transform);
    // Preserve the whole frame if multiple tilted cards are visible during an overlap.
    const needsFrameSnapshot = goingBack && (!outgoingRect
      || Math.abs(outgoingMatrix.b) > 0.00001 || Math.abs(outgoingMatrix.a - 1) > 0.00001
      || outgoingRect.top > metrics.top + 1 || outgoingRect.bottom < metrics.top + metrics.height - 1);
    // Keep overlap clipping and stacking intact, but never move a second copy of the hero.
    const useCompositeSnapshot = returningHome && (needsFrameSnapshot || outgoingPanels.includes(panel));
    const useRootSnapshot = needsFrameSnapshot && !useCompositeSnapshot;
    outgoingTitle = goingBack && !useCompositeSnapshot ? outgoingPanel?.querySelector<HTMLElement>('.projects-title-scale') ?? null : null;
    const titleRect = outgoingTitle?.getBoundingClientRect();
    if (titleRect && (titleRect.bottom <= metrics.top || titleRect.top >= metrics.top + metrics.height)) outgoingTitle = null;
    const outgoingTitleStyle = outgoingTitle ? getComputedStyle(outgoingTitle) : null;
    const titleOrigin = outgoingTitleStyle?.transformOrigin.split(' ').map(Number.parseFloat) ?? [0, 0];
    const titleMatrix = outgoingTitleStyle ? new DOMMatrix(outgoingTitleStyle.transform) : null;
    // Normalize out raster downscaling so both title variants return to the same visible stretch.
    const titleEndScale = titleMatrix ? STRETCH_START * titleMatrix.a / titleMatrix.d : 1;
    const wasStopped = lenis?.isStopped;
    const panelStyle = goingBack && outgoingStyle ? outgoingStyle : getComputedStyle(panel);
    const panelRadius = useCompositeSnapshot ? '0px' : panelStyle.getPropertyValue('--section-base-radius').trim() || '0px';
    const panelHeight = useCompositeSnapshot || (goingBack && !outgoingPanel) ? metrics.height : parseFloat(panelStyle.height);
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
    root.style.setProperty('--nav-section-start-color', useCompositeSnapshot ? 'transparent' : blendSectionColor(fromHsl, toHsl, 0));
    root.style.setProperty('--nav-section-start-angle', `${incomingAngles[0]}deg`);
    root.style.setProperty('--nav-section-top-left-radius', panelRadius);
    root.style.setProperty('--nav-section-top-right-radius', panelRadius);
    root.style.setProperty('--nav-section-travel', `${panelHeight}px`);
    const snapshotX = useScopedTransition ? 0 : metrics.left;
    const snapshotY = useScopedTransition ? 0 : metrics.top;
    root.style.setProperty('--nav-snapshot-x', `${snapshotX}px`);
    root.style.setProperty('--nav-snapshot-y', `${snapshotY}px`);
    root.style.setProperty('--nav-section-source-transform', goingBack && !useRootSnapshot && !useCompositeSnapshot && outgoingRect
      ? `translate(${outgoingRect.left - metrics.left + snapshotX}px, ${outgoingRect.top - metrics.top + snapshotY}px)`
      : useRootSnapshot ? 'translate(0px, 0px)' : `translate(${snapshotX}px, ${snapshotY}px)`);
    root.classList.toggle('nav-back-transition', goingBack);
    root.classList.toggle('nav-back-root-transition', useRootSnapshot);
    root.classList.toggle('nav-document-transition', !useScopedTransition);
    root.classList.add('nav-section-transition');
    scope?.classList.toggle('nav-back-transition', goingBack);
    scope?.classList.toggle('nav-back-root-transition', useRootSnapshot);
    scope?.classList.add('nav-section-transition');
    lenis?.stop();
    captureSnapshot = !returningHome && !goingBack;
    outgoingTitle?.setAttribute('data-nav-title-capture', '');
    if (useCompositeSnapshot) {
      viewport.setAttribute('data-nav-capture', '');
      el.setAttribute('data-nav-home-source', '');
    }
    if (!useCompositeSnapshot) outgoingPanels.forEach((source, index) => {
      const sourceStyle = getComputedStyle(source);
      // Read the scroll-owned color before making the capture background transparent.
      const rgb = sourceStyle.backgroundColor.match(/\d+/g)!;
      const color = hexToHsl(`#${rgb.slice(0, 3).map(value => Number(value).toString(16).padStart(2, '0')).join('')}`);
      const background = {
        element: source,
        name: !useRootSnapshot && source === outgoingPanel ? 'nav-section' : `nav-background-${index}`,
        color,
        radius: sourceStyle.getPropertyValue('--section-base-radius').trim() || '0px',
      };
      backCaptures.push(background);
      const content = source.querySelector<HTMLElement>(':scope > .section-tilt-container');
      if (content) backCaptures.push({ element: content, name: `nav-content-${index}` });
    });
    if (goingBack && !useRootSnapshot && !useCompositeSnapshot && outgoingStyle) {
      // Keep the visible card unchanged while capturing its background separately.
      root.style.setProperty('--nav-outgoing-color', outgoingStyle.backgroundColor);
      outgoingSection?.setAttribute('data-nav-source', '');
      outgoingPanel?.setAttribute('data-nav-capture', '');
    }
    backCaptures.forEach(({ element, name, color }) => {
      element.style.setProperty('--nav-back-capture-name', name);
      element.setAttribute('data-nav-back-capture', '');
      if (color) element.setAttribute('data-nav-back-background', '');
    });
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
      el.removeAttribute('data-nav-home-source');
      panel.removeAttribute('data-nav-capture');
      panel.removeAttribute('data-nav-blend');
      outgoingPanel?.removeAttribute('data-nav-capture');
      outgoingSection?.removeAttribute('data-nav-source');
      outgoingTitle?.removeAttribute('data-nav-title-capture');
      clearBackCaptures();
      roundedPanels.forEach(source => source.removeAttribute('data-nav-rounded'));
      animations.forEach(animation => animation.cancel());
      root.classList.remove('nav-section-transition', 'nav-back-transition', 'nav-back-root-transition', 'nav-capture-ready', 'nav-document-transition');
      scope?.classList.remove('nav-section-transition', 'nav-back-transition', 'nav-back-root-transition');
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
        duration: parseFloat(style.animationDuration) * 1000,
        easing: style.animationTimingFunction,
        fill: 'both' as const,
      };
      if (heroOffset !== 0) {
        animations.push(root.animate([
          { '--nav-hero-offset': heroOffset },
          { '--nav-hero-offset': 0 },
        ], timing));
      }
      const title = !goingBack ? el.querySelector<HTMLElement>('.projects-title-scale') : null;
      if (title) {
        // A numeric property keeps Chrome repainting glyphs instead of stretching a cached scale-animation raster.
        animations.push(title.animate([
          { '--nav-title-stretch': STRETCH_START / STRETCH_END },
          { '--nav-title-stretch': 1 },
        ], timing));
      }
      const sourceTransform = new DOMMatrix(root.style.getPropertyValue('--nav-section-source-transform'));
      const motionOrigin = style.transformOrigin.split(' ').map(Number.parseFloat);
      const rootTransform = useRootSnapshot
        ? new DOMMatrix(getComputedStyle(host, '::view-transition-group(root)').transform)
        : new DOMMatrix();
      // Root snapshots rotate locally; named captures use the host's coordinate space.
      const pivot = new DOMPoint(sourceTransform.e + motionOrigin[0], sourceTransform.f + motionOrigin[1])
        .matrixTransform(rootTransform);
      if (outgoingTitle) {
        // The old section is frozen; move its separate title snapshot around the same pivot.
        const titleSnapshot = '::view-transition-group(nav-title)';
        const titleStyle = getComputedStyle(host, titleSnapshot);
        const snapshotOrigin = titleStyle.transformOrigin.split(' ').map(Number.parseFloat);
        const titleTransform = new DOMMatrix().translate(snapshotOrigin[0], snapshotOrigin[1])
          .multiply(new DOMMatrix(titleStyle.transform)).translate(-snapshotOrigin[0], -snapshotOrigin[1]);
        animations.push(host.animate(Array.from({ length: 61 }, (_, index) => {
          const progress = index / 60;
          const transform = new DOMMatrix()
            .translate(pivot.x, pivot.y)
            .translate(0, panelHeight * progress)
            .rotate(incomingAngles[0] * progress)
            .translate(-pivot.x, -pivot.y)
            .multiply(titleTransform)
            .translate(titleOrigin[0], titleOrigin[1])
            .scale(1, 1 + (titleEndScale - 1) * progress)
            .translate(-titleOrigin[0], -titleOrigin[1]);
          return { offset: progress, transform: transform.toString(), transformOrigin: '0 0' };
        }), { ...timing, pseudoElement: titleSnapshot }));
      }
      backCaptures.forEach(({ name, color, radius }) => {
        const group = `::view-transition-group(${name})`;
        const captureStyle = getComputedStyle(host, group);
        const origin = captureStyle.transformOrigin.split(' ').map(Number.parseFloat);
        const initial = new DOMMatrix().translate(origin[0], origin[1])
          .multiply(new DOMMatrix(captureStyle.transform)).translate(-origin[0], -origin[1]);
        if (name !== 'nav-section') {
          animations.push(host.animate(Array.from({ length: 61 }, (_, index) => {
            const progress = index / 60;
            const transform = new DOMMatrix().translate(pivot.x, pivot.y)
              .translate(0, panelHeight * progress).rotate(incomingAngles[0] * progress)
              .translate(-pivot.x, -pivot.y).multiply(initial);
            return { offset: progress, transform: transform.toString(), transformOrigin: '0 0', zIndex: 2 };
          }), { ...timing, pseudoElement: group }));
        }
        // Only the frozen background fades; foreground captures remain fully opaque.
        animations.push(host.animate([
          { opacity: 1, mixBlendMode: 'normal' },
          { opacity: color ? 0 : 1, mixBlendMode: 'normal' },
        ], { ...timing, pseudoElement: `::view-transition-old(${name})` }));
        if (color) {
          animations.push(host.animate(Array.from({ length: 61 }, (_, index) => {
            const progress = index / 60;
            return {
              offset: progress,
              backgroundColor: blendSectionColor(color, toHsl, progress),
              clipPath: `inset(0 round ${radius} ${radius} 0 0)`,
            };
          }), { ...timing, pseudoElement: group }));
        }
      });
      if (!goingBack) {
        // The movement eases out early; keep the color blend running for the full transition.
        animations.push(panel.animate(Array.from({ length: 61 }, (_, index) => ({
          offset: index / 60,
          backgroundColor: blendSectionColor(fromHsl, toHsl, index / 60),
          opacity: 1 - index / 60,
        })), {
          ...timing,
          easing: 'linear',
          pseudoElement: '::before',
        }));
      }
      const startTime = entryAnimation?.startTime ?? document.timeline.currentTime;
      if (startTime != null) {
        if (entryAnimation) entryAnimation.startTime = startTime;
        for (const animation of animations) {
          animation.startTime = startTime;
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
