import { useEffect, useState } from 'react';
import { experiencePinMedia, experienceSceneMedia, experienceTravelScreens } from '../constants/experience';
import { getScrollMetrics } from './scroll';

export function useExperiencePin() {
  const [layout, setLayout] = useState({ pinned: false, docked: false, width: 0, height: 0 });

  useEffect(() => {
    const section = document.getElementById('experience');
    const panel = section?.querySelector<HTMLElement>('.experience-panel');
    const inner = section?.querySelector<HTMLElement>('.experience-inner');
    if (!section || !panel || !inner) return;
    const media = window.matchMedia(experiencePinMedia);
    const motion = window.matchMedia(experienceSceneMedia);
    const header = section.querySelector<HTMLElement>('.experience-heading')!;
    const chapters = section.querySelector<HTMLElement>('.experience-chapters')!;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-experience-card]'));
    const art = section.querySelector<HTMLElement>('.experience-art')!;
    let frame = 0;
    let cancelled = false;
    const measure = () => {
      frame = 0;
      const style = getComputedStyle(panel);
      const metrics = getScrollMetrics();
      const gap = parseFloat(getComputedStyle(inner).getPropertyValue('--experience-pin-gap'));
      const padding = parseFloat(style.paddingTop) + parseFloat(style.getPropertyValue('--experience-pin-bottom'));
      const available = metrics.height - header.offsetHeight - gap - padding - 8;
      section.style.setProperty('--experience-scene-height', `${Math.max(180, available)}px`);
      const stacked = getComputedStyle(section.querySelector('.experience-layout')!).display === 'block';
      const copyHeight = chapters.offsetHeight + parseFloat(getComputedStyle(chapters).marginBottom)
        + Math.max(...cards.map(card => card.offsetHeight));
      const stageHeight = stacked
        ? art.offsetHeight + parseFloat(getComputedStyle(art).marginBottom) + copyHeight
        : Math.max(copyHeight, art.offsetHeight);
      const required = header.offsetHeight + Math.max(copyHeight, art.offsetHeight)
        + gap + padding;
      // Pin only when both descriptions fit, including at increased text sizes.
      const pinned = media.matches && required <= metrics.height - 4;
      const dockTop = (document.querySelector('.site-nav')?.clientHeight ?? 64) + 12;
      const docked = !pinned && motion.matches && innerHeight >= 600 && stageHeight <= metrics.height - dockTop - 24;
      section.style.setProperty('--experience-dock-top', `${dockTop}px`);
      // The stage finishes its travel before the shared owner starts the outgoing tilt.
      const bottom = docked
        ? metrics.height * experienceTravelScreens + metrics.height - dockTop - stageHeight + 32
        : Math.max(64, metrics.height - dockTop - copyHeight + 24);
      section.style.setProperty('--experience-flow-bottom', `${bottom}px`);
      setLayout(previous => previous.pinned === pinned && previous.docked === docked
        && previous.width === metrics.width && previous.height === metrics.height
        ? previous : { pinned, docked, width: metrics.width, height: metrics.height });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    [header, chapters, ...cards, art].forEach(node => observer.observe(node));
    media.addEventListener('change', schedule);
    motion.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(() => { if (!cancelled) schedule(); });
    measure();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      section.style.removeProperty('--experience-scene-height');
      section.style.removeProperty('--experience-flow-bottom');
      section.style.removeProperty('--experience-dock-top');
      media.removeEventListener('change', schedule);
      motion.removeEventListener('change', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return layout;
}
