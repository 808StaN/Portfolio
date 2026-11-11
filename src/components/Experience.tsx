import { useEffect, useRef, type MouseEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import flyrankSymbol from '../assets/flyrank-symbol.svg';
import { experiencePinMedia, experienceTravelScreens } from '../constants/experience';
import { sectionColors } from '../constants/sectionColors';
import { getScrollMetrics, getScrollViewport } from '../utils/scroll';
import { getProjectPinStart } from '../utils/tilt';
import { useExperiencePin } from '../utils/useExperiencePin';
import { scrollToY, useLenis } from './LenisScroll';
import ExperienceWorld, { type JourneySceneState } from './ExperienceWorld';
import ExperienceMobileScene from './ExperienceMobileScene';
import ProjectTitleStretch from './ProjectTitleStretch';
import SectionBandsBackground from './SectionBandsBackground';
import GravityLink from './ui/GravityLink';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const checkpointProgress = useRef([0, 1]);
  const journeyScene = useRef<JourneySceneState>({ points: [], x: 130, y: 510, dx: 1, dy: -0.577, stride: 0, checkpoint: 0, visible: false });
  const lenis = useLenis();
  const pinExperience = useExperiencePin();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-experience-card]'));
    const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-experience-tab]'));
    const media = gsap.matchMedia();

    media.add({ pinned: experiencePinMedia, portrait: '(max-width: 600px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      if (!context.conditions?.motion) return;
      const pinned = Boolean(context.conditions.pinned) && pinExperience;
      const portrait = Boolean(context.conditions.portrait);
      const scene = section.querySelector<SVGSVGElement>(portrait ? '.experience-mobile-world' : '.experience-world')!;
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
      if (!portrait) journeyScene.current.points = points;
      const stops = Array.from(scene.querySelectorAll<SVGGElement>('[data-journey-checkpoint]')).map(checkpoint => {
        const x = Number(checkpoint.dataset.x), y = Number(checkpoint.dataset.y);
        return points.reduce((nearest, p, i) => Math.hypot(p.x - x, p.y - y)
          < Math.hypot(points[nearest].x - x, points[nearest].y - y) ? i : nearest, 0) / 600;
      });
      checkpointProgress.current = stops.map(stop => stop / stops[1]);
      const originalAttributes = Array.from(scene.querySelectorAll<SVGElement>('[data-journey-character], [data-journey-shadow], [data-journey-body], [data-journey-leg], [data-journey-arm], [data-journey-badge], [data-journey-parallax]'))
        .map(node => ({ node, transform: node.getAttribute('transform'), opacity: node.getAttribute('opacity') }));
      section.dataset.journeyMode = pinned ? 'pinned' : 'flow';
      let previousCheckpoint = -1;
      let characterScaleY = 1;
      let previousProgress = 0;
      let direction = 1;

      const render = (progress: number) => {
        if (progress !== previousProgress) direction = progress > previousProgress ? 1 : -1;
        previousProgress = progress;
        const travel = progress * stops[1];
        const moving = progress > 0 && progress < 1;
        const index = Math.min(599, Math.floor(travel * 600));
        const fraction = travel * 600 - index;
        const x = points[index].x + (points[index + 1].x - points[index].x) * fraction;
        const y = points[index].y + (points[index + 1].y - points[index].y) * fraction;
        const stride = moving ? Math.sin(travel * length / 11) : 0;
        const dx = (points[index + 1].x - points[index].x) * direction;
        const dy = (points[index + 1].y - points[index].y) * direction;
        const facing = dx < 0 ? -1 : 1;
        character.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${facing} ${characterScaleY})`);
        shadow.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${1 - Math.abs(stride) * 0.05} 1)`);
        body.setAttribute('transform', `translate(0 ${-Math.abs(stride) * 2.4})`);
        legs.forEach((leg, i) => leg.setAttribute('transform', `rotate(${stride * (i ? -17 : 17)} ${i ? 4 : -8} -27)`));
        arms.forEach((arm, i) => arm.setAttribute('transform', `rotate(${stride * (i ? 8 : -8)} ${i ? 12 : -15} -61)`));
        far?.setAttribute('transform', `translate(0 ${(progress - 0.5) * -10})`);
        near?.setAttribute('transform', `translate(0 ${(progress - 0.5) * 16})`);
        badges[0]?.setAttribute('opacity', progress >= checkpointProgress.current[0] && progress < 0.7 ? '1' : '0');
        badges[1]?.setAttribute('opacity', progress >= 0.7 ? '1' : '0');
        section.dataset.journeyProgress = progress.toFixed(4);
        const checkpoint = progress >= 0.7 ? 1 : 0;
        if (!portrait) {
          Object.assign(journeyScene.current, { x, y, dx, dy, stride, checkpoint });
          if (journeyScene.current.visible) journeyScene.current.invalidate?.();
        }
        if (checkpoint !== previousCheckpoint) {
          previousCheckpoint = checkpoint;
          section.dataset.checkpoint = checkpoint ? 'next' : 'flyrank';
          cards.forEach((card, i) => {
            if (pinned && i !== checkpoint && card.contains(document.activeElement)) tabs[checkpoint].focus({ preventScroll: true });
            card.inert = pinned && i !== checkpoint;
          });
          tabs.forEach((tab, i) => {
            if (i === checkpoint) tab.setAttribute('aria-current', 'step');
            else tab.removeAttribute('aria-current');
          });
        }
      };

      const trigger = ScrollTrigger.create({
        id: 'experience-journey',
        scroller: getScrollViewport() ?? window,
        trigger: pinned ? section : section.querySelector('.experience-layout'),
        start: pinned ? () => getProjectPinStart(section) : 'top 35%',
        end: pinned ? () => `+=${getScrollMetrics().height * experienceTravelScreens}` : 'bottom 85%',
        invalidateOnRefresh: true,
        onUpdate: self => render(self.progress),
        onRefresh: self => {
          characterScaleY = portrait && scene.clientHeight ? (scene.clientWidth / 160) / (scene.clientHeight / 1800) : 1;
          render(self.progress);
        },
      });
      render(trigger.progress);

      return () => {
        trigger.kill();
        delete section.dataset.journeyMode;
        delete section.dataset.checkpoint;
        delete section.dataset.journeyProgress;
        cards.forEach(card => { card.inert = false; });
        tabs.forEach(tab => tab.removeAttribute('aria-current'));
        originalAttributes.forEach(({ node, transform, opacity }) => {
          if (transform === null) node.removeAttribute('transform');
          else node.setAttribute('transform', transform);
          if (opacity === null) node.removeAttribute('opacity');
          else node.setAttribute('opacity', opacity);
        });
      };
    });

    return () => media.revert();
  }, [lenis, pinExperience]);

  const visitCheckpoint = (checkpoint: number) => {
    const section = sectionRef.current;
    const journey = ScrollTrigger.getById('experience-journey');
    if (section?.dataset.journeyMode === 'pinned' && journey) {
      scrollToY(journey.start + (journey.end - journey.start) * checkpointProgress.current[checkpoint], lenis);
    } else {
      const card = section?.querySelectorAll<HTMLElement>('[data-experience-card]')[checkpoint];
      if (card && section) {
        let offset = 0;
        for (let node: HTMLElement | null = card; node && node !== section; node = node.offsetParent as HTMLElement | null) offset += node.offsetTop;
        const metrics = getScrollMetrics();
        const entrance = ScrollTrigger.getById('section-target-experience')?.end
          ?? metrics.scroll + section.getBoundingClientRect().top - metrics.top;
        const exit = (ScrollTrigger.getById('section-target-stack')?.start ?? Infinity) - 1;
        scrollToY(Math.min(entrance + offset - 100, exit), lenis, { onComplete: () => card.focus({ preventScroll: true }) });
      }
    }
  };

  const contact = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const section = document.getElementById('contact');
    if (!section) return;
    const target = ScrollTrigger.getById('section-target-contact')?.end;
    const metrics = getScrollMetrics();
    scrollToY(target ?? metrics.scroll + section.getBoundingClientRect().top - metrics.top, lenis, {
      onComplete: () => {
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
      },
    });
  };

  return (
    <section ref={sectionRef} id="experience" className="section-tilt-section section-shell experience-section" data-section-tilt data-experience-journey data-experience-pinned={pinExperience} data-section-color={sectionColors.experience} aria-label="Experience">
      <div className="section-tilt-panel experience-panel" style={{ background: sectionColors.experience }}>
        <SectionBandsBackground palette="experience" />
        <div className="section-tilt-container section-inner experience-inner" data-scroll-journey>
          <header className="experience-heading">
            <ProjectTitleStretch title="Experience" projectId="experience" />
          </header>

          <div className="experience-layout">
            <div className="experience-mobile-art"><ExperienceMobileScene /></div>
            <div className="experience-art">
              <ExperienceWorld journey={journeyScene.current} />
            </div>
            <div className="experience-copy">
              <nav className="experience-chapters" aria-label="Experience checkpoints">
                <button type="button" data-experience-tab onClick={() => visitCheckpoint(0)}><span>01</span> FlyRank AI</button>
                <span className="experience-chapters-line" aria-hidden="true" />
                <button type="button" data-experience-tab onClick={() => visitCheckpoint(1)}><span>02</span> What&apos;s next</button>
              </nav>

              <ol className="experience-stories">
                <li className="experience-story experience-story--flyrank" data-experience-card tabIndex={-1}>
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

                <li className="experience-story experience-story--next" data-experience-card tabIndex={-1}>
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
                    onClick={contact}
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
