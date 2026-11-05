import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isWebGPUSupported } from 'shaders/core';
import { sectionShaderPalettes, type ShaderPalette } from '../constants/sectionColors';
import { getScrollMetrics, getScrollViewport } from '../utils/scroll';
import SectionShaderCanvas from './SectionShaderCanvas';

// Occupied width of the supplied 512px SDF, excluding its transparent padding.
const heroLogoSdfWidth = 460 / 512;

export default function SectionBandsBackground({ palette }: { palette: ShaderPalette }) {
  const colors = sectionShaderPalettes[palette];

  return (
    <div
      className={`section-bands-layer${palette === 'home' ? ' hero-bands-layer' : ''}`}
      data-shader-palette={palette}
      style={Object.fromEntries(colors.map((color, index) => [`--shader-color-${index}`, color])) as CSSProperties}
      aria-hidden="true"
    />
  );
}

type ShaderSlot = {
  host: HTMLDivElement;
  palette: ShaderPalette;
  id: number;
  onReady: () => void;
  hero: boolean;
  active: boolean;
  logoCenter: { x: number; y: number };
  logoScale: number;
};

export type SectionShaderState = 'loading' | 'ready' | 'fallback';

export function SectionShaderRenderer({ onStateChange }: { onStateChange: (state: SectionShaderState) => void }) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [unavailable, setUnavailable] = useState(false);
  const [renderers, setRenderers] = useState<ShaderSlot[]>([]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false || unavailable || !isWebGPUSupported()) {
      setRenderers([]);
      onStateChange('fallback');
      return;
    }

    onStateChange('loading');
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-shader-palette]'));
    const heroLayer = layers.find(layer => layer.dataset.shaderPalette === 'home');
    const logoAnchor = document.querySelector<HTMLElement>('[data-hero-shader-logo]');
    // Hidden canvases still receive global pointer events; keep their bounds nonzero.
    const parking = document.createElement('div');
    parking.className = 'section-shader-parking';
    parking.setAttribute('data-shader-warming', '');
    parking.setAttribute('aria-hidden', 'true');
    document.querySelector('.portfolio-viewport')!.appendChild(parking);
    let timedOut = false;
    // Compile scroll-time modes up front; this is a watchdog, not an intro delay.
    const startupTimeout = window.setTimeout(() => {
      timedOut = true;
      parking.removeAttribute('data-shader-warming');
      slots.forEach(slot => {
        slot.host.dataset.shaderActive = 'false';
        parking.appendChild(slot.host);
      });
      onStateChange('fallback');
      setUnavailable(true);
    }, 12000);
    let readyFrame = 0;
    let warmed = false;
    const markReady = (host: HTMLDivElement) => {
      if (!host.isConnected || timedOut) return;
      host.dataset.shaderReady = 'true';
      if (warmed || !slots.every(slot => slot.host.dataset.shaderReady === 'true')) return;
      warmed = true;
      clearTimeout(startupTimeout);
      // Allow the completed frame to reach the compositor before revealing the page.
      readyFrame = requestAnimationFrame(() => {
        readyFrame = requestAnimationFrame(() => {
          if (timedOut) return;
          parking.removeAttribute('data-shader-warming');
          update();
          onStateChange('ready');
        });
      });
    };
    // Only slot 0 builds Hero; both slots use OKLab gradients.
    const slots = Array.from({ length: 2 }, (_, id) => {
      const host = document.createElement('div');
      host.className = 'section-shader-slot';
      host.dataset.shaderActive = 'false';
      parking.appendChild(host);
      return { host, id, palette: 'home' as ShaderPalette, target: null as HTMLElement | null, onReady: () => markReady(host) };
    });
    let frame = 0;
    let logoGeometry: { logoCenter: { x: number; y: number }; logoScale: number } | null = null;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (timedOut) return;
      const { left, top, width, height } = getScrollMetrics();
      const candidates = document.hidden ? [] : layers.map(layer => ({ layer, rect: layer.getBoundingClientRect() })).filter(({ rect }) => {
        return rect.width > 0 && rect.height > 0 && rect.bottom > top && rect.top < top + height
          && rect.right > left && rect.left < left + width;
      });
      let covering = 0;
      candidates.forEach(({ layer, rect }, index) => {
        if (rect.top > top + 1 || rect.bottom < top + height - 1
          || rect.left > left + 1 || rect.right < left + width - 1) return;
        const transform = getComputedStyle(layer.parentElement!).transform;
        if (transform === 'none' || Math.abs(new DOMMatrix(transform).b) < 0.00001) covering = index;
      });
      const visible = candidates.slice(covering).slice(-2).map(({ layer }) => layer);

      const assignments = new Map<(typeof slots)[number], HTMLElement>();
      // Reserve the warmed variants first, independent of scroll direction or navigation jumps.
      const special = (layer: HTMLElement) => layer === heroLayer || layer.dataset.shaderPalette === 'projectOtakuVersus';
      [...visible].sort((a, b) => Number(special(b)) - Number(special(a))).forEach(layer => {
        const slot = layer === heroLayer ? slots[0]
          : layer.dataset.shaderPalette === 'projectOtakuVersus' ? slots[1]
            : slots.find(candidate => candidate.target === layer && !assignments.has(candidate))
              ?? slots.find(candidate => !assignments.has(candidate))!;
        assignments.set(slot, layer);
      });
      slots.forEach(slot => {
        const target = assignments.get(slot) ?? null;
        slot.host.dataset.shaderActive = String(!!target);
        slot.target = target;
        if (target) slot.palette = target.dataset.shaderPalette as ShaderPalette;
        const parent = target ?? parking;
        if (slot.host.parentElement !== parent) parent.appendChild(slot.host);
      });
      if (!logoGeometry) {
        let logoX = 0;
        let logoY = 0;
        const heroPanel = heroLayer?.parentElement;
        // Panel-local coordinates only change with layout, not its scroll-driven transform.
        for (let element = logoAnchor; element && element !== heroPanel; element = element.offsetParent as HTMLElement | null) {
          logoX += element.offsetLeft;
          logoY += element.offsetTop;
        }
        const logoWidth = logoAnchor?.offsetWidth ?? 0;
        const logoHeight = logoAnchor?.offsetHeight ?? 0;
        const panelWidth = heroPanel?.clientWidth || width;
        const panelHeight = heroPanel?.clientHeight || height;
        logoGeometry = {
          logoCenter: { x: (logoX + logoWidth / 2) / panelWidth, y: (logoY + logoHeight / 2) / panelHeight },
          logoScale: logoWidth / (heroLogoSdfWidth * panelHeight),
        };
      }
      const next = slots.map(({ host, palette, id, onReady, target }) => ({
        host, palette, id, onReady, ...logoGeometry!,
        hero: id === 0 && target === heroLayer,
        active: !!target,
      }));
      setRenderers(previous => previous.length === next.length
        && previous.every((slot, index) => slot.host === next[index].host && slot.palette === next[index].palette
          && slot.hero === next[index].hero && slot.active === next[index].active && slot.logoScale === next[index].logoScale
          && slot.logoCenter.x === next[index].logoCenter.x && slot.logoCenter.y === next[index].logoCenter.y)
        ? previous : next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const scroller = getScrollViewport() ?? window;
    const measure = () => {
      logoGeometry = null;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    layers.forEach(layer => observer.observe(layer));
    if (logoAnchor) observer.observe(logoAnchor);
    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    document.addEventListener('visibilitychange', update);
    ScrollTrigger.addEventListener('refresh', measure);

    return () => {
      clearTimeout(startupTimeout);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', update);
      ScrollTrigger.removeEventListener('refresh', measure);
      slots.forEach(slot => slot.host.remove());
      parking.remove();
    };
  }, [reducedMotion, unavailable, onStateChange]);

  return renderers.map(({ host, id, ...props }) => createPortal(
    <SectionShaderCanvas {...props} heroCapable={id === 0} onUnavailable={() => setUnavailable(true)} />,
    host, String(id),
  ));
}
