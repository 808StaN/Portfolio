import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY, useLenis } from './LenisScroll';
import { blendSectionColor, getSectionCornerScale, hexToHsl, incomingAngles } from '../utils/tilt';
import { getScrollMetrics, getScrollTargetTop, getScrollViewport } from '../utils/scroll';

const links = [
  { label: 'Projects', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
];

type TransitionScope = HTMLElement & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

export default function Nav({ ready }: { ready: boolean }) {
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
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
    const navHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 64;
    const targetCorrection = section.id === 'about' ? navHeight : 0;
    const top =
      transitionTarget?.end !== undefined
        ? transitionTarget.end + targetCorrection
        : getScrollTargetTop(section);
    return Math.min(Math.max(0, top), limit);
  };

  useEffect(() => {
    const ids = links.map(link => link.href.slice(1));
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

  const handleLink = async (href: string) => {
    setMenuOpen(false);
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
    const scroller = getScrollViewport() ?? window;
    if (Math.abs(metrics.scroll - top) < 2) return;
    const goingBack = !returningHome && top < metrics.scroll;
    const panel = el.querySelector<HTMLElement>('.section-tilt-panel');
    const targetColor = panel?.closest<HTMLElement>('[data-section-color]')?.dataset.sectionColor;
    let outgoingPanel: HTMLElement | null = null;
    let outgoingSection: HTMLElement | null = null;
    let captureSnapshot = false;
    let expectedScroll = metrics.scroll;
    let cancelled = false;
    const previousFocus = document.activeElement;
    const revealedElements: HTMLElement[] = [];
    const hadTabIndex = el.hasAttribute('tabindex');

    const jump = () => {
      if (cancelled || request !== navigationRequest.current || !el.isConnected) return;
      outgoingPanel?.removeAttribute('data-nav-capture');
      outgoingSection?.removeAttribute('data-nav-source');
      expectedScroll = top;
      if (document.documentElement.classList.contains('nav-section-transition')) {
        document.documentElement.classList.add('nav-capture-ready');
        document.documentElement.style.setProperty('--nav-page-scroll', `${top}px`);
      }
      if (lenis) {
        lenis.scrollTo(top, { immediate: true, force: true });
      } else {
        scrollToY(top, null, { immediate: true });
      }
      ScrollTrigger.update();
      if (captureSnapshot) panel?.setAttribute('data-nav-capture', '');
      // Reveal scroll-triggered content, but leave the hero's looping animation alone.
      if (!returningHome) {
        el.querySelectorAll<HTMLElement>('.section-tilt-container [style*="opacity"]')
          .forEach(node => {
            if (!node.hasAttribute('data-nav-revealed')) revealedElements.push(node);
            node.setAttribute('data-nav-revealed', '');
          });
      }
      flushSync(() => setActiveSection(el.id));
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };

    const root = document.documentElement;
    const scope = document.querySelector<TransitionScope>('#page-transition-scope');
    const useScopedTransition = typeof scope?.startViewTransition === 'function';
    const host = useScopedTransition ? scope : root;
    // Keep native card animations when only document-wide transitions are available.
    const startTransition = useScopedTransition
      ? scope.startViewTransition!.bind(scope)
      : document.startViewTransition?.bind(document);
    if (!startTransition
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !panel || !targetColor) {
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
    const startProgress = Number(getComputedStyle(root).getPropertyValue('--nav-hero-progress'));
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
    // Preserve the scroll range while the scene stays fixed to the viewport.
    root.style.setProperty('--nav-page-height', `${getScrollViewport()?.scrollHeight ?? root.scrollHeight}px`);
    root.style.setProperty('--nav-page-scroll', `${metrics.scroll}px`);
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
    let finishRequested = false;
    let inputReady = false;
    let inputRequested = false;
    let inputHeld = false;
    let inputFinished = false;
    let inputFrame = 0;
    let inputTime = 0;
    let inputPosition = 0;
    let inputTarget = 0;
    let queuedDelta = 0;
    let remainder = 0;
    let touchY: number | null = null;
    let inputAnimations: Animation[] = [];
    let progressAnimation: Animation | undefined;
    const direction = Math.sign(top - metrics.scroll);
    const inputRange = Math.max(1, metrics.height);
    const finishDocumentTransition = () => {
      const snapshots = host.getAnimations({ subtree: true }).filter(animation =>
        animation.effect instanceof KeyframeEffect && animation.effect.pseudoElement);
      [...snapshots, ...animations].forEach(animation => animation.finish());
    };
    const release = () => {
      if (released) return;
      released = true;
      if (inputFrame) cancelAnimationFrame(inputFrame);
      captureSnapshot = false;
      panel.removeAttribute('data-nav-capture');
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
      root.style.removeProperty('--nav-page-height');
      root.style.removeProperty('--nav-page-scroll');
      root.style.removeProperty('--nav-snapshot-x');
      root.style.removeProperty('--nav-snapshot-y');
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('pointerdown', interrupt, true);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('touchend', onTouchEnd, true);
      window.removeEventListener('touchcancel', onTouchEnd, true);
      window.removeEventListener('keydown', interrupt, true);
      window.removeEventListener('resize', interrupt);
      scroller.removeEventListener('scroll', onScroll);
      if (!wasStopped) {
        lenis?.start();
        if (inputFinished && request === navigationRequest.current && Math.abs(remainder) > 0.01) {
          if (lenis) {
            lenis.scrollTo(lenis.scroll + remainder, { programmatic: false, lerp: lenis.options.lerp });
          } else {
            scrollToY(getScrollMetrics().scroll + remainder, null);
          }
        }
      }
    };

    const advanceInput = (now: number) => {
      inputFrame = 0;
      if (released) return;
      const elapsed = Math.max(0, (now - inputTime) / 1000);
      inputTime = now;
      const smoothing = 1 - Math.exp(-(lenis?.options.lerp ?? 0.085) * 60 * elapsed);
      inputPosition += (inputTarget - inputPosition) * smoothing;
      if (Math.abs(inputTarget - inputPosition) < 0.05) inputPosition = inputTarget;
      const phase = Math.max(0, Math.min(1, inputPosition / inputRange));
      for (const animation of inputAnimations) {
        animation.currentTime = Number(animation.effect!.getTiming().duration) * phase;
      }

      if ((inputPosition <= 0 && inputTarget <= 0) || (inputPosition >= inputRange && inputTarget >= inputRange)) {
        inputFinished = true;
        remainder = direction * (inputTarget - (phase === 1 ? inputRange : 0));
        if (phase === 0) {
          cancelled = true;
          expectedScroll = metrics.scroll;
          root.style.setProperty('--nav-page-scroll', `${metrics.scroll}px`);
          if (lenis) lenis.scrollTo(metrics.scroll, { immediate: true, force: true });
          else scrollToY(metrics.scroll, null, { immediate: true });
          ScrollTrigger.update();
          revealedElements.forEach(node => node.removeAttribute('data-nav-revealed'));
          if (!hadTabIndex) el.removeAttribute('tabindex');
          if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
        }
        // Both endpoint images now match the live page; seeking alone leaves paused snapshots alive.
        transition.skipTransition();
        release();
      } else if (inputPosition !== inputTarget) {
        inputFrame = requestAnimationFrame(advanceInput);
      }
    };

    const takeScroll = (delta: number) => {
      if (!inputHeld) {
        inputHeld = true;
        // Keep raw timeline time: using the eased progress here would apply easing twice.
        const duration = Number(progressAnimation!.effect!.getTiming().duration);
        const phase = Math.max(0, Math.min(1, Number(progressAnimation!.currentTime) / duration));
        inputPosition = inputTarget = phase * inputRange;
        inputTime = performance.now();
        inputAnimations.forEach(animation => {
          animation.pause();
          animation.currentTime = Number(animation.effect!.getTiming().duration) * phase;
        });
      }
      inputTarget += delta * direction;
      if (Math.abs(inputTarget) < 0.05) inputTarget = 0;
      if (Math.abs(inputTarget - inputRange) < 0.05) inputTarget = inputRange;
      if (!inputFrame) inputFrame = requestAnimationFrame(advanceInput);
    };

    const consumeScroll = (delta: number, event: Event) => {
      if (released || finishRequested || wasStopped || delta === 0) return;
      if (event.cancelable) event.preventDefault();
      inputRequested = true;
      if (inputReady) takeScroll(delta);
      else queuedDelta += delta;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented) return;
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
      consumeScroll(delta, event);
    };

    const onTouchEnd = () => { touchY = null; };

    const interrupt = (event: Event) => {
      if (released) return;
      if (event.type === 'pointerdown' && !(event.target instanceof Element
        && event.target.closest('.custom-scrollbar-track'))) return;
      if (event instanceof KeyboardEvent) {
        if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement
          && (event.target.isContentEditable || event.target.closest('input, textarea, select')))) return;
        const deltas: Record<string, number> = {
          ArrowUp: -40, ArrowDown: 40, PageUp: -metrics.height, PageDown: metrics.height,
          Home: -getScrollMetrics().limit, End: getScrollMetrics().limit,
          ' ': event.shiftKey ? -metrics.height : metrics.height,
        };
        if (event.key in deltas) {
          if (event.key === ' ' && event.target instanceof Element && event.target.closest('button, a')) return;
          consumeScroll(deltas[event.key], event);
          return;
        }
        if (!['Escape', 'Tab'].includes(event.key)) return;
      }
      if (inputFrame) cancelAnimationFrame(inputFrame);
      if (event.type === 'pointerdown') navigationRequest.current += 1;
      if (useScopedTransition || event.type === 'pointerdown') {
        transition.skipTransition();
        release();
      } else {
        // Finish document snapshots before releasing their captured layout.
        finishRequested = true;
        finishDocumentTransition();
      }
    };
    const onScroll = (event: Event) => {
      if (Math.abs(getScrollMetrics().scroll - expectedScroll) > 2) interrupt(event);
    };
    const transition = startTransition(jump);
    navigation.current = { transition, release };
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    window.addEventListener('pointerdown', interrupt, { capture: true, passive: true });
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });
    window.addEventListener('keydown', interrupt, true);
    window.addEventListener('resize', interrupt);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    const failReady = () => {
      if (!inputReady && inputRequested && !finishRequested) {
        inputFinished = true;
        remainder = queuedDelta;
      }
      transition.skipTransition();
    };
    void transition.ready.then(() => {
      captureSnapshot = false;
      if (released || request !== navigationRequest.current) return;
      const endProgress = Number(root.style.getPropertyValue('--nav-hero-progress'));
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
      const readyForInput = () => {
        inputAnimations = Array.from(new Set([
          ...host.getAnimations({ subtree: true }).filter(animation => animation.effect instanceof KeyframeEffect && animation.effect.pseudoElement),
          ...animations,
        ])).filter(animation => {
          const duration = animation.effect?.getTiming().duration;
          return typeof duration === 'number' && duration > 0 && Number.isFinite(duration);
        });
        progressAnimation = entryAnimation ?? animations[0];
        inputReady = Boolean(progressAnimation);
        if (finishRequested) finishDocumentTransition();
        else if (inputRequested && inputReady) takeScroll(queuedDelta);
      };
      const shaderBackground = panel.querySelector('.section-bands-layer');
      if (shaderBackground && !returningHome && !goingBack) {
        animations.push(shaderBackground.animate([{ opacity: 0 }, { opacity: 1 }], timing));
      }
      if (startProgress !== endProgress) {
        animations.push(root.animate([
          { '--nav-hero-progress': startProgress },
          { '--nav-hero-progress': endProgress },
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
        readyForInput();
        return;
      }
      animations.push(host.animate(Array.from({ length: 61 }, (_, index) => {
        const progress = index / 60;
        const radius = `calc(${panelRadius} * ${getSectionCornerScale(goingBack ? 1 - progress : progress)})`;
        return {
          offset: progress,
          ...(!useRootSnapshot && {
            backgroundColor: blendSectionColor(fromHsl, toHsl, progress),
          }),
          clipPath: `inset(0 round ${radius} ${radius} 0 0)`,
        };
      }), {
        ...timing,
        pseudoElement: animatedSnapshot,
      }));
      if (entryAnimation?.startTime != null) {
        for (const animation of animations) {
          animation.startTime = entryAnimation.startTime;
        }
      }
      readyForInput();
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

  const toggleMenu = async () => {
    const request = ++navigationRequest.current;
    const opening = !menuOpen;
    const previous = navigation.current;
    if (opening && previous) {
      previous.transition.skipTransition();
      await previous.transition.finished.catch(() => {});
    }
    if (request === navigationRequest.current) setMenuOpen(opening);
  };

  return (
    <>
      <motion.header
        className="site-nav fixed top-0 z-[9996]"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="relative h-14 md:h-16 nav-blur">
          <div className="nav-outline" aria-hidden="true" />
          <div className="site-nav-inner relative z-10 h-full flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleLink('#home')}
              className="group relative inline-flex h-11 shrink-0 items-center text-sm text-white cursor-pointer bg-transparent border-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span className="nav-visual nav-visual-home relative inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z" />
                </svg>
                Home
                <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
              </span>
            </button>

            <div className="site-nav-links hidden lg:flex items-center gap-8">
              {links.map(link => (
                <button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className={`text-sm transition-all duration-300 cursor-pointer bg-transparent border-none relative group ${
                    activeSection === link.href.slice(1)
                      ? 'text-white'
                      : 'text-white hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.01em' }}
                >
                  <span className={`nav-visual nav-visual-${link.href.slice(1)} relative inline-block`}>
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ${
                        activeSection === link.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors duration-300"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <span className="nav-visual nav-visual-github relative inline-flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
                </span>
              </a>
            </div>
          </div>
          <button
            className="lg:hidden absolute flex h-11 w-11 flex-col items-center justify-center gap-1.5 cursor-pointer border-none"
            style={{
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              zIndex: 9999,
              background: 'transparent',
            }}
            onClick={() => void toggleMenu()}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="nav-visual nav-visual-menu flex flex-col items-center gap-1.5">
              <motion.span
                style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
                animate={{ opacity: menuOpen ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                style={{ display: 'block', width: 24, height: 1, background: '#fff' }}
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -5 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-backdrop fixed inset-0 z-[10000] flex flex-col justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0 } }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center border-none bg-transparent text-white"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <span className="absolute h-px w-7 rotate-45 bg-white" />
              <span className="absolute h-px w-7 -rotate-45 bg-white" />
            </button>
            <nav className="flex flex-col items-center gap-10">
              {links.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => handleLink(link.href)}
                  className="bg-transparent border-none cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="text-4xl font-700 text-white hover:text-white transition-colors duration-200">
                    {link.label}
                  </span>
                </motion.button>
              ))}
              <motion.a
                href="https://github.com/808StaN"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-white transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                github.com/808StaN
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
