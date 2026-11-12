import { useEffect, useRef, useState, type MouseEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import flyrankSymbol from '../assets/flyrank-symbol.svg';
import { experienceSceneMedia, experienceTravelScreens } from '../constants/experience';
import { sectionColors } from '../constants/sectionColors';
import { getScrollMetrics, getScrollViewport } from '../utils/scroll';
import { getProjectPinStart } from '../utils/tilt';
import { useExperiencePin } from '../utils/useExperiencePin';
import { scrollToY, useLenis } from './LenisScroll';
import ExperienceWorld, { type JourneySceneState } from './ExperienceWorld';
import ProjectTitleStretch from './ProjectTitleStretch';
import SectionBandsBackground from './SectionBandsBackground';
import { useSectionNavigation } from './SectionNavigation';
import GravityLink from './ui/GravityLink';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

function localTop(section: HTMLElement, element: HTMLElement) {
  let offset = 0;
  for (let node: HTMLElement | null = element; node && node !== section; node = node.offsetParent as HTMLElement | null) offset += node.offsetTop;
  return offset;
}

function entranceTop(section: HTMLElement) {
  const metrics = getScrollMetrics();
  return ScrollTrigger.getById('section-target-experience')?.end
    ?? metrics.scroll + section.getBoundingClientRect().top - metrics.top;
}

function compactTop(section: HTMLElement, card: HTMLElement) {
  const entrance = entranceTop(section);
  const target = entrance + localTop(section, card) - (document.querySelector('.site-nav')?.clientHeight ?? 64) - 24;
  const exit = (ScrollTrigger.getById('section-target-stack')?.start ?? Infinity) - 1;
  return Math.max(entrance, Math.min(target, exit));
}

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const checkpointProgress = useRef([0, 1]);
  const previousJourney = useRef<number | null>(null);
  const position = useRef({ progress: 0, checkpoint: 0, manual: false, active: false, width: 0, height: 0 });
  const selectCheckpoint = useRef<((checkpoint: number, immediate?: boolean) => void) | undefined>(undefined);
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);
  const journeyScene = useRef<JourneySceneState>({ points: [], x: 130, y: 510, dx: 1, dy: -0.577, stride: 0, checkpoint: 0, visible: false });
  const lenis = useLenis();
  const { navigate } = useSectionNavigation();
  const { pinned: pinExperience, docked: dockExperience, width: measuredWidth, height: measuredHeight } = useExperiencePin();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-experience-card]'));
    const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-experience-tab]'));
    const layout = section.querySelector<HTMLElement>('.experience-layout')!;
    const media = gsap.matchMedia();
    let restoreFrame = 0;
    let restoring = false;
    const rememberJourney = () => {
      const metrics = getScrollMetrics();
      const last = position.current;
      if ((last.width !== metrics.width || last.height !== metrics.height) && last.active && previousJourney.current === null) {
        previousJourney.current = last.manual ? checkpointProgress.current[last.checkpoint] : last.progress;
      }
      last.width = metrics.width;
      last.height = metrics.height;
    };
    const restoreJourney = () => {
      if (previousJourney.current === null || restoring) return;
      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = requestAnimationFrame(() => {
          const progress = previousJourney.current;
          if (progress === null) return;
          // Wait for both the measured layout and the shared pin owner to finish rebuilding.
          const metrics = getScrollMetrics();
          if (metrics.width !== measuredWidth || metrics.height !== measuredHeight) return;
          const owner = ScrollTrigger.getById('section-target-stack');
          if (matchMedia(experienceSceneMedia).matches && (!owner || Boolean(owner.vars.pinSpacing) !== pinExperience)) return;
          restoring = true;
          ScrollTrigger.refresh();
          lenis?.resize();
          const trigger = ScrollTrigger.getById('experience-journey');
          if (trigger) {
            scrollToY(trigger.start + (trigger.end - trigger.start) * progress, lenis, { immediate: true });
          } else {
            const checkpoint = progress >= 0.7 ? 1 : 0;
            setActiveCheckpoint(checkpoint);
            selectCheckpoint.current?.(checkpoint, true);
            scrollToY(compactTop(section, cards[checkpoint]), lenis, { immediate: true });
          }
          previousJourney.current = null;
          position.current.progress = progress;
          position.current.active = true;
          ScrollTrigger.update();
          restoring = false;
        });
      });
    };
    const resizeJourney = () => { rememberJourney(); restoreJourney(); };
    const interruptRestore = (event: Event) => {
      if (event instanceof WheelEvent && event.ctrlKey) return;
      previousJourney.current = null;
      cancelAnimationFrame(restoreFrame);
    };
    const intentEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'click'] as const;
    intentEvents.forEach(event => window.addEventListener(event, interruptRestore, { capture: true, passive: true }));
    const trackPosition = () => {
      rememberJourney();
      if (previousJourney.current !== null) return;
      const metrics = getScrollMetrics();
      const end = ScrollTrigger.getById('experience-journey')?.end
        ?? ScrollTrigger.getById('section-target-stack')?.start
        ?? entranceTop(section) + section.offsetHeight - metrics.height;
      position.current.active = metrics.scroll >= entranceTop(section) - 1 && metrics.scroll <= end + 1;
    };
    const viewport = getScrollViewport();
    viewport?.addEventListener('scroll', trackPosition, { passive: true });
    ScrollTrigger.addEventListener('refreshInit', rememberJourney);
    ScrollTrigger.addEventListener('refresh', restoreJourney);
    window.addEventListener('resize', resizeJourney);

    media.add({ motion: experienceSceneMedia, reduced: '(prefers-reduced-motion: reduce)' }, context => {
      const motion = Boolean(context.conditions?.motion);
      const pinned = motion && pinExperience;
      const docked = motion && dockExperience;
      const scene = section.querySelector<SVGSVGElement>('.experience-world')!;
      const path = scene.querySelector<SVGPathElement>('[data-journey-path]')!;
      const character = scene.querySelector<SVGGElement>('[data-journey-character]')!;
      const shadow = scene.querySelector<SVGEllipseElement>('[data-journey-shadow]')!;
      const body = scene.querySelector<SVGGElement>('[data-journey-body]')!;
      const legs = Array.from(scene.querySelectorAll<SVGGElement>('[data-journey-leg]'));
      const arms = Array.from(scene.querySelectorAll<SVGGElement>('[data-journey-arm]'));
      const badges = Array.from(scene.querySelectorAll<SVGGElement>('[data-journey-badge]'));
      const far = scene.querySelector<SVGGElement>('[data-journey-parallax="far"]');
      const near = scene.querySelector<SVGGElement>('[data-journey-parallax="near"]');
      const length = path.getTotalLength();
      const points = Array.from({ length: 601 }, (_, i) => path.getPointAtLength(length * i / 600));
      journeyScene.current.points = points;
      const stops = Array.from(scene.querySelectorAll<SVGGElement>('[data-journey-checkpoint]')).map(checkpoint => {
        const x = Number(checkpoint.dataset.x), y = Number(checkpoint.dataset.y);
        return points.reduce((nearest, p, i) => Math.hypot(p.x - x, p.y - y)
          < Math.hypot(points[nearest].x - x, points[nearest].y - y) ? i : nearest, 0) / 600;
      });
      checkpointProgress.current = stops.map(stop => stop / stops[1]);
      const originalAttributes = Array.from(scene.querySelectorAll<SVGElement>('[data-journey-character], [data-journey-shadow], [data-journey-body], [data-journey-leg], [data-journey-arm], [data-journey-badge], [data-journey-parallax]'))
        .map(node => ({ node, transform: node.getAttribute('transform'), opacity: node.getAttribute('opacity') }));
      let previousCheckpoint = -1;
      let previousProgress = 0;
      let direction = 1;
      let trigger: ScrollTrigger | undefined;
      let manualTween: gsap.core.Tween | undefined;
      const playhead = { progress: position.current.progress };

      const render = (progress: number, selected?: number) => {
        rememberJourney();
        const metrics = getScrollMetrics();
        const checkpoint = selected ?? (progress >= 0.7 ? 1 : 0);
        if (previousJourney.current === null) {
          position.current.progress = progress;
          position.current.checkpoint = checkpoint;
          position.current.manual = selected !== undefined;
          const rect = section.getBoundingClientRect();
          position.current.active = trigger
            ? metrics.scroll >= trigger.start - 1 && metrics.scroll <= trigger.end + 1
            : rect.top < metrics.top + metrics.height && rect.bottom > metrics.top;
        }
        if (progress !== previousProgress) direction = progress > previousProgress ? 1 : -1;
        previousProgress = progress;
        const travel = progress * stops[1];
        const moving = motion && progress > 0 && progress < 1;
        const index = Math.min(599, Math.floor(travel * 600));
        const fraction = travel * 600 - index;
        const x = points[index].x + (points[index + 1].x - points[index].x) * fraction;
        const y = points[index].y + (points[index + 1].y - points[index].y) * fraction;
        const stride = moving ? Math.sin(travel * length / 11) : 0;
        const dx = (points[index + 1].x - points[index].x) * direction;
        const dy = (points[index + 1].y - points[index].y) * direction;
        const facing = dx < 0 ? -1 : 1;
        character.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${facing} 1)`);
        shadow.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${1 - Math.abs(stride) * 0.05} 1)`);
        body.setAttribute('transform', `translate(0 ${-Math.abs(stride) * 2.4})`);
        legs.forEach((leg, i) => leg.setAttribute('transform', `rotate(${stride * (i ? -17 : 17)} ${i ? 4 : -8} -27)`));
        arms.forEach((arm, i) => arm.setAttribute('transform', `rotate(${stride * (i ? 8 : -8)} ${i ? 12 : -15} -61)`));
        far?.setAttribute('transform', `translate(0 ${(progress - 0.5) * -10})`);
        near?.setAttribute('transform', `translate(0 ${(progress - 0.5) * 16})`);
        badges[0]?.setAttribute('opacity', progress >= checkpointProgress.current[0] && progress < 0.7 ? '1' : '0');
        badges[1]?.setAttribute('opacity', progress >= 0.7 ? '1' : '0');
        section.dataset.journeyProgress = progress.toFixed(4);
        Object.assign(journeyScene.current, { x, y, dx, dy, stride, checkpoint });
        if (journeyScene.current.visible) journeyScene.current.invalidate?.();
        if (checkpoint !== previousCheckpoint) {
          previousCheckpoint = checkpoint;
          cards.forEach((card, i) => {
            if (i !== checkpoint && card.contains(document.activeElement)) tabs[checkpoint].focus({ preventScroll: true });
          });
          setActiveCheckpoint(checkpoint);
        }
        if (docked && trigger) {
          const shift = Math.max(0, Math.min(metrics.scroll - trigger.start, trigger.end - trigger.start));
          layout.style.transform = `translate3d(0, ${shift}px, 0)`;
          layout.toggleAttribute('data-stage-docked', metrics.scroll >= trigger.start);
        }
      };

      if (pinned || docked) trigger = ScrollTrigger.create({
        id: 'experience-journey',
        scroller: getScrollViewport() ?? window,
        trigger: section,
        start: pinned ? () => getProjectPinStart(section)
          : () => entranceTop(section) + localTop(section, layout) - parseFloat(getComputedStyle(section).getPropertyValue('--experience-dock-top')),
        end: () => `+=${getScrollMetrics().height * experienceTravelScreens}`,
        invalidateOnRefresh: true,
        onUpdate: self => render(self.progress),
        onRefresh: self => render(self.progress),
      });
      selectCheckpoint.current = (checkpoint, immediate = false) => {
        manualTween?.kill();
        if (immediate || !motion) {
          playhead.progress = checkpointProgress.current[checkpoint];
          render(playhead.progress, checkpoint);
          return;
        }
        render(playhead.progress, checkpoint);
        manualTween = gsap.to(playhead, {
          progress: checkpointProgress.current[checkpoint], duration: 0.35, ease: 'power1.inOut',
          onUpdate: () => render(playhead.progress, checkpoint),
        });
      };
      const manualCheckpoint = position.current.manual ? position.current.checkpoint : undefined;
      if (!trigger && manualCheckpoint !== undefined) playhead.progress = checkpointProgress.current[manualCheckpoint];
      render(trigger?.progress ?? playhead.progress, trigger ? undefined : manualCheckpoint);
      restoreJourney();

      return () => {
        manualTween?.kill();
        selectCheckpoint.current = undefined;
        layout.style.removeProperty('transform');
        layout.removeAttribute('data-stage-docked');
        trigger?.kill();
        delete section.dataset.journeyProgress;
        originalAttributes.forEach(({ node, transform, opacity }) => {
          if (transform === null) node.removeAttribute('transform');
          else node.setAttribute('transform', transform);
          if (opacity === null) node.removeAttribute('opacity');
          else node.setAttribute('opacity', opacity);
        });
      };
    });

    return () => {
      rememberJourney();
      cancelAnimationFrame(restoreFrame);
      ScrollTrigger.removeEventListener('refreshInit', rememberJourney);
      ScrollTrigger.removeEventListener('refresh', restoreJourney);
      window.removeEventListener('resize', resizeJourney);
      viewport?.removeEventListener('scroll', trackPosition);
      intentEvents.forEach(event => window.removeEventListener(event, interruptRestore, true));
      media.revert();
    };
  }, [lenis, pinExperience, dockExperience, measuredWidth, measuredHeight]);

  const visitCheckpoint = (checkpoint: number) => {
    const section = sectionRef.current;
    const journey = ScrollTrigger.getById('experience-journey');
    if (journey) {
      scrollToY(journey.start + (journey.end - journey.start) * checkpointProgress.current[checkpoint], lenis);
    } else {
      setActiveCheckpoint(checkpoint);
      selectCheckpoint.current?.(checkpoint);
      if (!selectCheckpoint.current && section) {
        position.current.progress = checkpoint;
        section.dataset.journeyProgress = checkpoint.toFixed(4);
      }
      const card = section?.querySelectorAll<HTMLElement>('[data-experience-card]')[checkpoint];
      if (card && section) {
        const metrics = getScrollMetrics();
        const inset = (document.querySelector('.site-nav')?.clientHeight ?? 64) + 24;
        const rect = card.getBoundingClientRect();
        if (rect.top < metrics.top + inset || rect.top > metrics.top + metrics.height - 100) {
          scrollToY(compactTop(section, card), lenis,
            { onComplete: () => card.focus({ preventScroll: true }) });
        }
      }
    }
  };

  const contact = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    // Capture before Lenis's native anchor listener on the scrollport.
    event.stopPropagation();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    void navigate('#contact');
  };

  return (
    <section ref={sectionRef} id="experience" className="section-tilt-section section-shell experience-section" data-section-tilt data-experience-journey data-experience-pinned={pinExperience} data-experience-docked={dockExperience} data-journey-mode={pinExperience ? 'pinned' : dockExperience ? 'flow' : 'compact'} data-checkpoint={activeCheckpoint ? 'next' : 'flyrank'} data-section-color={sectionColors.experience} aria-label="Experience">
      <div className="section-tilt-panel experience-panel" style={{ background: sectionColors.experience }}>
        <SectionBandsBackground palette="experience" />
        <div className="section-tilt-container section-inner experience-inner" data-scroll-journey>
          <header className="experience-heading">
            <ProjectTitleStretch title="Experience" projectId="experience" />
          </header>

          <div className="experience-layout">
            <div className="experience-art">
              <ExperienceWorld journey={journeyScene.current} />
            </div>
            <div className="experience-copy">
              <nav className="experience-chapters" aria-label="Experience checkpoints">
                <button type="button" data-experience-tab aria-current={activeCheckpoint === 0 ? 'step' : undefined} onClick={() => visitCheckpoint(0)}><span>01</span> FlyRank AI</button>
                <span className="experience-chapters-line" aria-hidden="true" />
                <button type="button" data-experience-tab aria-current={activeCheckpoint === 1 ? 'step' : undefined} onClick={() => visitCheckpoint(1)}><span>02</span> What&apos;s next</button>
              </nav>

              <ol className="experience-stories">
                <li className="experience-story experience-story--flyrank" data-experience-card tabIndex={-1} inert={activeCheckpoint !== 0}>
                  <div className="experience-company">
                    <img src={flyrankSymbol} width="48" height="48" alt="" />
                    <div><h3>FlyRank AI</h3></div>
                  </div>
                  <p className="experience-role">Front-end AI Engineering Intern</p>
                  <p className="experience-date"><time dateTime="2026-07">Jul 2026</time><span aria-hidden="true"> / </span><time dateTime="2026-09">Sep 2026</time><span className="experience-location">Remote</span></p>
                  <p className="experience-summary">From learning the tools to putting them to work.</p>
                  <ul className="experience-responsibilities">
                    <li>Built and improved interfaces with React and TypeScript through a structured engineering internship.</li>
                    <li>Worked on UI implementation, debugging, refactoring, and database integration using AI-assisted workflows.</li>
                  </ul>
                  <div className="experience-skills"><span>React</span><span>TypeScript</span><span>AI workflows</span></div>
                </li>

                <li className="experience-story experience-story--next" data-experience-card tabIndex={-1} inert={activeCheckpoint !== 1}>
                  <div className="experience-company">
                    <span className="experience-question" aria-hidden="true">?</span>
                    <div><h3>Your team?</h3></div>
                  </div>
                  <p className="experience-role">Open to opportunities</p>
                  <p className="experience-summary">I&apos;m looking for my next role, building thoughtful interfaces and useful products with people I can learn from.</p>
                  <p className="experience-next-note">Based in Poland. Open to relocation.</p>
                  <GravityLink
                    href="#contact"
                    text="Let's talk"
                    aria-label="Let's talk"
                    variant="primary"
                    icon="arrow-up-right"
                    sizing={{ paddingX: 28, paddingY: 14, fontSize: 14 }}
                    style={{ marginTop: 28 }}
                    onClickCapture={contact}
                  />
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
