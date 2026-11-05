import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';
import { createGpuUniformsMap, rootPassthrough, shaderRendererGPU, type GpuShaderDefinition, type NodeMetadata } from 'shaders/core';
import { componentDefinition as BlueNoise } from 'shaders/core/BlueNoise';
import { componentDefinition as ColorWheel } from 'shaders/core/ColorWheel';
import { componentDefinition as Exposure } from 'shaders/core/Exposure';
import { componentDefinition as FlowingGradient } from 'shaders/core/FlowingGradient';
import { componentDefinition as Glass } from 'shaders/core/Glass';
import { componentDefinition as Group } from 'shaders/core/Group';
import { componentDefinition as Stripes } from 'shaders/core/Stripes';
import { componentDefinition as ThinFilm } from 'shaders/core/ThinFilm';
import { componentDefinition as Twirl } from 'shaders/core/Twirl';
import { sectionShaderPalettes, type ShaderPalette } from '../constants/sectionColors';

type SectionShaderCanvasProps = {
  palette: ShaderPalette;
  heroCapable: boolean;
  hero: boolean;
  active: boolean;
  logoCenter: { x: number; y: number };
  logoScale: number;
  onReady: () => void;
  onUnavailable: () => void;
};

export default function SectionShaderCanvas({ palette, heroCapable, hero, active, logoCenter, logoScale, onReady, onUnavailable }: SectionShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof shaderRendererGPU> | null>(null);
  const readyRef = useRef(false);
  const paletteRef = useRef<ShaderPalette | null>(null);
  const heroVisibleRef = useRef(true);

  const sync = useEffectEvent((animate = true) => {
    const renderer = rendererRef.current;
    if (!renderer || !readyRef.current) return;
    if (paletteRef.current !== palette) {
      sectionShaderPalettes[palette].forEach((color, index) => {
        renderer.updateUniformValue('gradient', `color${'ABCD'[index]}`, color);
      });
      paletteRef.current = palette;
    }
    if (heroCapable) {
      heroVisibleRef.current = hero;
      renderer.updateNodeMetadata('hero', { opacity: hero ? 0.999 : 0 });
      for (const id of ['glass', 'film']) {
        renderer.updateUniformValue(id, 'center', logoCenter);
        renderer.updateUniformValue(id, 'scale', logoScale * 1.1);
      }
    }
    if (animate && active) renderer.startAnimation();
    else renderer.stopAnimation();
  });
  const reportReady = useEffectEvent(onReady);
  const reportUnavailable = useEffectEvent(onUnavailable);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const renderer = shaderRendererGPU();
    rendererRef.current = renderer;
    readyRef.current = false;
    paletteRef.current = null;
    heroVisibleRef.current = true;
    let disposed = false;
    const resize = () => {
      if (!disposed && renderer.isInitialized()) renderer.resize(container.clientWidth, container.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    renderer.setOnUnavailable(() => {
      if (!disposed) reportUnavailable();
    });

    const initialize = async () => {
      try {
        await renderer.initialize({ canvas, observeElement: false });
        if (disposed || renderer.getFailureReason()) return;
        renderer.stopAnimation();
        resize();
        renderer.registerNode('root', rootPassthrough.fragment, null, null, {}, rootPassthrough);
        const add = (id: string, definition: GpuShaderDefinition, props: Record<string, unknown> = {}, parent = 'root', metadata: Partial<NodeMetadata> = {}) => {
          renderer.registerNode(id, definition.fragment, parent, {
            blendMode: 'normal', opacity: 1, visible: true, renderOrder: renderer.getNodeRegistry().nodes.size,
            ...metadata,
          }, createGpuUniformsMap(definition, props, id), definition);
        };
        const [colorA, colorB, colorC, colorD] = sectionShaderPalettes.home;
        add('gradient', FlowingGradient, { colorA, colorB, colorC, colorD, colorSpace: 'oklab', speed: 1.6, distortion: 0.15 });
        if (heroCapable) {
          add('hero', Group, {}, 'root', { opacity: 0.999 });
          // Opacity alone does not stop compute dispatches; pause the blur outside Hero.
          const glass = {
            ...Glass,
            compute: (params: Parameters<NonNullable<typeof Glass.compute>>[0]) => {
              const compute = Glass.compute?.(params);
              return compute ? { ...compute, getComputeNodes: (frame: Parameters<typeof compute.getComputeNodes>[0]) => (
                heroVisibleRef.current ? compute.getComputeNodes(frame) : []
              ) } : null;
            },
          };
          add('glass', glass, {
            aberration: 0, blur: 20, center: { x: 0.5, y: 0.5 }, cutout: true,
            edgeSoftness: 0.6, fresnel: 0.08, fresnelColor: '#f2f7ff', fresnelSoftness: 0.57,
            highlight: 0, highlightColor: '#c9e8ff', highlightSoftness: 0.2,
            innerZoom: 1, lightAngle: 300, refraction: 0, scale: 1,
            shapeSdfUrl: '/react-logo_sdf.bin', thickness: 0,
          }, 'hero');
          add('stripes_mask', Twirl, {
            center: { x: 0.22872827081427263, y: 0.667479674796748 }, edges: 'mirror', intensity: -1.7,
          }, 'glass', { visible: false, id: 'stripes_mask' });
          add('stripes', Stripes, {
            angle: -139, balance: 0.5, colorA: '#00000000', colorB: '#e8f4ff',
            colorSpace: 'linear', density: 2, offset: 0, softness: 0.4, speed: -0.15,
          }, 'stripes_mask');
          add('wheel', ColorWheel, {
            angle: 154, colorA: '#b8caff', colorB: '#61dafb', colorC: '#4f8ef7',
            colorSpace: 'oklab', mode: 'custom', scale: 5.2, speed: -0.25,
          }, 'glass', { mask: { source: 'stripes_mask', type: 'alpha' } });
          add('exposure', Exposure, { exposure: 6 }, 'glass');
          add('film', ThinFilm, {
            center: { x: 0.5, y: 0.5 }, colorA: '#6e9ff4', colorB: '#dbeafe', colorC: '#b8caff',
            colorSpace: 'oklab', dispersion: 0.42, edgeSoftness: 0.55, hueShift: 0,
            intensity: 1.5, lightAngle: 298, mode: 'custom', rimWidth: 0.15, saturation: 1,
            scale: 1, shapeSdfUrl: '/react-logo_sdf.bin', speed: -0.19, thickness: 0.45,
          }, 'hero');
        }
        add('noise', BlueNoise, { contrast: -0.2, balance: 0 }, 'root', { opacity: 0.25, blendMode: 'overlay' });

        // Keep one fixed composition per slot, with no cold pipeline switches while scrolling.
        await renderer.renderAndWait({ waitForGpu: false });
        if (disposed || renderer.getFailureReason()) return;
        await renderer.renderAndWait({ waitForGpu: false });
        if (disposed || renderer.getFailureReason()) return;
        readyRef.current = true;
        sync(false);
        await renderer.renderAndWait({ waitForGpu: false });
        if (disposed || renderer.getFailureReason()) return;
        await renderer.renderAndWait();
        if (disposed || renderer.getFailureReason()) return;
        reportReady();
        sync();
      } catch {
        if (!disposed) reportUnavailable();
      } finally {
        // Also release a device acquired after unmount or startup cancellation.
        if (disposed) renderer.cleanup();
      }
    };
    void initialize();
    return () => {
      disposed = true;
      observer.disconnect();
      renderer.setOnUnavailable(null);
      renderer.cleanup();
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
        readyRef.current = false;
      }
    };
  }, [heroCapable]);

  useLayoutEffect(() => sync(), [palette, hero, active, logoCenter.x, logoCenter.y, logoScale]);

  return (
    <div ref={containerRef} className="shader section-bands-canvas">
      <canvas ref={canvasRef} data-renderer="shaders" style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
