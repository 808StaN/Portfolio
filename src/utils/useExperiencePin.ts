import { useEffect, useState } from 'react';
import { experiencePinMedia } from '../constants/experience';
import { getScrollMetrics } from './scroll';

export function useExperiencePin() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const section = document.getElementById('experience');
    const panel = section?.querySelector<HTMLElement>('.experience-panel');
    const inner = section?.querySelector<HTMLElement>('.experience-inner');
    if (!section || !panel || !inner) return;
    const media = window.matchMedia(experiencePinMedia);
    const header = section.querySelector<HTMLElement>('.experience-heading')!;
    const chapters = section.querySelector<HTMLElement>('.experience-chapters')!;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-experience-card]'));
    const art = section.querySelector<HTMLElement>('.experience-art')!;
    let frame = 0;
    let cancelled = false;
    const measure = () => {
      frame = 0;
      const style = getComputedStyle(panel);
      const copyHeight = chapters.offsetHeight + parseFloat(getComputedStyle(chapters).marginBottom)
        + Math.max(...cards.map(card => card.offsetHeight));
      const required = header.offsetHeight + Math.max(copyHeight, art.offsetHeight)
        + parseFloat(getComputedStyle(inner).getPropertyValue('--experience-pin-gap'))
        + parseFloat(style.paddingTop) + parseFloat(style.getPropertyValue('--experience-pin-bottom'));
      // Pin only when both descriptions fit, including at increased text sizes.
      setPinned(media.matches && required <= getScrollMetrics().height - 4);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    [header, chapters, ...cards, art].forEach(node => observer.observe(node));
    media.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(() => { if (!cancelled) schedule(); });
    measure();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return pinned;
}
