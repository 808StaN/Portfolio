import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarShift, BlueNoise, FlowingGradient, GridDistortion, Shader, isWebGPUSupported } from 'shaders/react';
import { sectionShaderPalettes, type ShaderPalette } from '../constants/sectionColors';
import { getScrollMetrics, getScrollViewport } from '../utils/scroll';

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

type ShaderSlot = { host: HTMLDivElement; palette: ShaderPalette; id: number };

export function SectionShaderRenderer() {
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
      return;
    }

    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-shader-palette]'));
    // Hidden canvases still receive global pointer events; keep their bounds nonzero.
    const parking = document.createElement('div');
    parking.className = 'section-shader-parking';
    parking.setAttribute('aria-hidden', 'true');
    document.querySelector('.portfolio-viewport')!.appendChild(parking);
    // Stable portal hosts let two renderers follow the cards without reinitializing WebGPU.
    const slots = Array.from({ length: 2 }, (_, id) => {
      const host = document.createElement('div');
      host.className = 'section-shader-slot';
      host.dataset.shaderActive = 'false';
      parking.appendChild(host);
      return { host, id, palette: 'home' as ShaderPalette, target: null as HTMLElement | null, mounted: false };
    });
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
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

      slots.forEach(slot => {
        if (!slot.target || !visible.includes(slot.target)) {
          slot.host.dataset.shaderActive = 'false';
          if (slot.host.parentElement !== parking) parking.appendChild(slot.host);
          slot.target = null;
        }
      });
      visible.forEach(layer => {
        const slot = slots.find(candidate => candidate.target === layer)
          ?? slots.find(candidate => !candidate.target)!;
        if (slot.target !== layer) {
          slot.target = layer;
          slot.palette = layer.dataset.shaderPalette as ShaderPalette;
          slot.mounted = true;
          layer.appendChild(slot.host);
        }
        slot.host.dataset.shaderActive = 'true';
      });
      const next = slots.filter(slot => slot.mounted).map(({ host, palette, id }) => ({ host, palette, id }));
      setRenderers(previous => previous.length === next.length
        && previous.every((slot, index) => slot.host === next[index].host && slot.palette === next[index].palette)
        ? previous : next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const scroller = getScrollViewport() ?? window;
    const observer = new ResizeObserver(schedule);
    layers.forEach(layer => observer.observe(layer));
    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', update);
    ScrollTrigger.addEventListener('refresh', schedule);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', update);
      ScrollTrigger.removeEventListener('refresh', schedule);
      slots.forEach(slot => slot.host.remove());
      parking.remove();
    };
  }, [reducedMotion, unavailable]);

  return renderers.map(({ host, palette, id }) => {
    const [colorA, colorB, colorC, colorD] = sectionShaderPalettes[palette];
    return createPortal(
      <Shader
        className="section-bands-canvas"
        disableTelemetry
        onReady={() => { host.dataset.shaderReady = 'true'; }}
        onUnavailable={() => setUnavailable(true)}
      >
        <GridDistortion gridSize={36} intensity={5} decay={10} radius={0.5} edges="transparent">
          <BarShift count={6} intensity={0.1} angle={0} edges="mirror">
            <BarShift count={6} intensity={0.1} angle={90} edges="mirror">
              <FlowingGradient
                colorA={colorA}
                colorB={colorB}
                colorC={colorC}
                colorD={colorD}
                colorSpace="hsl"
                speed={1.6}
                distortion={0.15}
              />
            </BarShift>
          </BarShift>
        </GridDistortion>
        <BlueNoise opacity={0.25} contrast={-0.2} balance={0} blendMode="overlay" />
      </Shader>, host, String(id),
    );
  });
}
