import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlueNoise, ColorWheel, Exposure, FlowingGradient, Glass, Glow, Group, Shader, Stripes, ThinFilm, Twirl, isWebGPUSupported } from 'shaders/react';
import { sectionShaderPalettes, type ShaderPalette } from '../constants/sectionColors';
import { getScrollMetrics, getScrollViewport } from '../utils/scroll';

const heroLogoSdfUrl = '/react-logo_sdf.bin';
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
  logoCenter: { x: number; y: number };
  logoScale: number;
};
type ShaderCanvasContext = {
  getConfiguration?: () => { device: { queue: { onSubmittedWorkDone: () => Promise<void> } } } | null;
};

export function SectionShaderRenderer({ onReady }: { onReady: (ready: boolean) => void }) {
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
      onReady(true);
      return;
    }

    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-shader-palette]'));
    const heroLayer = layers.find(layer => layer.dataset.shaderPalette === 'home');
    const logoAnchor = document.querySelector<HTMLElement>('[data-hero-shader-logo]');
    // Hidden canvases still receive global pointer events; keep their bounds nonzero.
    const parking = document.createElement('div');
    parking.className = 'section-shader-parking';
    parking.setAttribute('data-shader-warming', '');
    parking.setAttribute('aria-hidden', 'true');
    document.querySelector('.portfolio-viewport')!.appendChild(parking);
    const initialized = new Set<HTMLDivElement>();
    let timedOut = false;
    const startupTimeout = window.setTimeout(() => {
      timedOut = true;
      parking.removeAttribute('data-shader-warming');
      slots.forEach(slot => {
        slot.host.dataset.shaderActive = 'false';
        parking.appendChild(slot.host);
      });
      onReady(true);
      // The library cannot dispose a pending initialize(); park it until its first submission.
      if (initialized.size === slots.length) setUnavailable(true);
    }, 8000);
    let readyFrame = 0;
    let warmed = false;
    const markReady = async (host: HTMLDivElement): Promise<void> => {
      if (!host.isConnected) return;
      initialized.add(host);
      if (timedOut) {
        if (initialized.size === slots.length) setUnavailable(true);
        return;
      }
      try {
        const context = host.querySelector('canvas')?.getContext('webgpu') as ShaderCanvasContext | null;
        // The library signals submission before Firefox finishes compiling/drawing on the GPU.
        await context?.getConfiguration?.()?.device.queue.onSubmittedWorkDone();
      } catch {
        if (host.isConnected) setUnavailable(true);
        return;
      }
      if (!host.isConnected || timedOut) return;
      host.dataset.shaderReady = 'true';
      if (warmed || !slots.every(slot => slot.host.dataset.shaderReady === 'true')) return;
      warmed = true;
      // Allow the completed frame to reach the compositor before revealing the page.
      readyFrame = requestAnimationFrame(() => {
        readyFrame = requestAnimationFrame(() => {
          clearTimeout(startupTimeout);
          parking.removeAttribute('data-shader-warming');
          update();
          onReady(true);
        });
      });
    };
    // Warm both persistent renderers before interaction; the spare stays viewport-sized.
    const slots = Array.from({ length: 2 }, (_, id) => {
      const host = document.createElement('div');
      host.className = 'section-shader-slot';
      host.dataset.shaderActive = 'false';
      parking.appendChild(host);
      return { host, id, palette: 'home' as ShaderPalette, target: null as HTMLElement | null, onReady: () => markReady(host) };
    });
    let frame = 0;
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
          layer.appendChild(slot.host);
        }
        slot.host.dataset.shaderActive = 'true';
      });
      let logoX = 0;
      let logoY = 0;
      const heroPanel = heroLayer?.parentElement;
      // Offset coordinates stay panel-local while GSAP rotates/translates the entire section.
      for (let element = logoAnchor; element && element !== heroPanel; element = element.offsetParent as HTMLElement | null) {
        logoX += element.offsetLeft;
        logoY += element.offsetTop;
      }
      const logoWidth = logoAnchor?.offsetWidth ?? 0;
      const logoHeight = logoAnchor?.offsetHeight ?? 0;
      const panelWidth = heroPanel?.clientWidth || width;
      const panelHeight = heroPanel?.clientHeight || height;
      const logoCenter = { x: (logoX + logoWidth / 2) / panelWidth, y: (logoY + logoHeight / 2) / panelHeight };
      const logoScale = logoWidth / (heroLogoSdfWidth * panelHeight);
      const next = slots.map(({ host, palette, id, onReady, target }) => ({
        host, palette, id, onReady, logoCenter, logoScale,
        hero: target === heroLayer || (!warmed && !target),
      }));
      setRenderers(previous => previous.length === next.length
        && previous.every((slot, index) => slot.host === next[index].host && slot.palette === next[index].palette
          && slot.hero === next[index].hero && slot.logoScale === next[index].logoScale
          && slot.logoCenter.x === next[index].logoCenter.x && slot.logoCenter.y === next[index].logoCenter.y)
        ? previous : next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const scroller = getScrollViewport() ?? window;
    const observer = new ResizeObserver(schedule);
    layers.forEach(layer => observer.observe(layer));
    if (logoAnchor) observer.observe(logoAnchor);
    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', update);
    ScrollTrigger.addEventListener('refresh', schedule);

    return () => {
      clearTimeout(startupTimeout);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(readyFrame);
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', update);
      ScrollTrigger.removeEventListener('refresh', schedule);
      slots.forEach(slot => slot.host.remove());
      parking.remove();
    };
  }, [reducedMotion, unavailable, onReady]);

  return renderers.map(({ host, palette, id, onReady, hero, logoCenter, logoScale }) => {
    const [colorA, colorB, colorC, colorD] = sectionShaderPalettes[palette];
    const logoMaskId = `hero-logo-stripes-${id}`;
    return createPortal(
      <Shader
        className="section-bands-canvas"
        disableTelemetry
        onReady={onReady}
        onUnavailable={() => setUnavailable(true)}
      >
        <FlowingGradient
          colorA={colorA}
          colorB={colorB}
          colorC={colorC}
          colorD={colorD}
          colorSpace="hsl"
          speed={1.6}
          distortion={0.15}
        />
        <Group opacity={hero ? 0.999 : 0}>
          <Glass
            aberration={0}
            blur={20}
            center={logoCenter}
            cutout={true}
            edgeSoftness={0.6}
            fresnel={0.08}
            fresnelColor="#f2f7ff"
            fresnelSoftness={0.57}
            highlight={0}
            highlightColor="#c9e8ff"
            highlightSoftness={0.2}
            innerZoom={1}
            lightAngle={300}
            refraction={0}
            scale={logoScale * 1.1}
            shapeSdfUrl={heroLogoSdfUrl}
            thickness={0}
          >
            <Twirl
              id={logoMaskId}
              center={{ x: 0.22872827081427263, y: 0.667479674796748 }}
              edges="mirror"
              intensity={-1.7}
              visible={false}
            >
              <Stripes
                angle={-139}
                balance={0.7}
                colorA="#00000000"
                colorB="#e8f4ff"
                colorSpace="linear"
                density={2}
                offset={0}
                softness={0.4}
                speed={-0.15}
              />
            </Twirl>
            <ColorWheel
              angle={154}
              colorA="#b8caff"
              colorB="#61dafb"
              colorC="#1756d9"
              colorSpace="oklab"
              maskSource={logoMaskId}
              maskType="alpha"
              mode="custom"
              scale={5.2}
              speed={-0.25}
            />
            <Exposure exposure={8} />
          </Glass>
          <ThinFilm
            center={logoCenter}
            colorA="#6e9ff4"
            colorB="#dbeafe"
            colorC="#b8caff"
            colorSpace="oklab"
            dispersion={0.42}
            edgeSoftness={0.55}
            hueShift={0}
            intensity={1.5}
            lightAngle={298}
            mode="custom"
            rimWidth={0.15}
            saturation={1}
            scale={logoScale * 1.1}
            shapeSdfUrl={heroLogoSdfUrl}
            speed={-0.19}
            thickness={0.45}
          />
          <Glow intensity={1.5} opacity={0.01} size={200} threshold={0.3} />
          <Glow intensity={1} opacity={0.1} size={100} threshold={0.5} />
        </Group>
        <BlueNoise opacity={0.25} contrast={-0.2} balance={0} blendMode="overlay" />
      </Shader>, host, String(id),
    );
  });
}
