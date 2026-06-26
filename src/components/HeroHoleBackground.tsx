import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import techIcons from '../constants/techIcons';

const rowCount = 20;
const baseColumnCount = 64;
const columnCount = 48;
const layerCount = 2;
const oneStep = 0.2765 * (baseColumnCount / columnCount);
const atlasCols = techIcons.length + 1;
const atlasRows = 1;
const cellSize = 256;
const atlasWidth = atlasCols * cellSize;
const atlasHeight = atlasRows * cellSize;

type ShaderParameters = Parameters<NonNullable<THREE.Material['onBeforeCompile']>>[0];

type ShaderWithTime = ShaderParameters & {
  uniforms: ShaderParameters['uniforms'] & {
    time: { value: number };
  };
};

type HeroHoleBackgroundProps = {
  noiseRef?: RefObject<HTMLDivElement | null>;
};

export default function HeroHoleBackground({ noiseRef }: HeroHoleBackgroundProps = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let animationFrame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let material: THREE.MeshBasicMaterial | null = null;
    let geometry: THREE.BoxGeometry | null = null;
    let mesh: THREE.InstancedMesh | null = null;
    let resizeHandler: (() => void) | null = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 6, 6);
    camera.lookAt(0, 0, 1);

    const scene = new THREE.Scene();
    geometry = new THREE.BoxGeometry();
    const rowCol: number[] = [];

    const isTopFace = new Float32Array(24);
    for (let i = 8; i <= 11; i += 1) {
      isTopFace[i] = 1.0;
    }
    geometry.setAttribute('aIsTop', new THREE.BufferAttribute(isTopFace, 1));

    for (let i = 0; i < rowCount; i += 1) {
      for (let j = 0; j < layerCount; j += 1) {
        for (let k = 0; k < columnCount; k += 1) {
          rowCol.push(i, k, j);
        }
      }
    }

    geometry.setAttribute('rcl', new THREE.InstancedBufferAttribute(new Float32Array(rowCol), 3));

    const iconIndices = new Float32Array(rowCount * columnCount * layerCount);
    let iconIdx = 0;
    for (let i = 0; i < rowCount; i += 1) {
      for (let j = 0; j < layerCount; j += 1) {
        for (let k = 0; k < columnCount; k += 1) {
          const h = ((i * 73856093) ^ (k * 19349663) ^ (j * 83492791)) >>> 0;
          iconIndices[iconIdx] = h % techIcons.length;
          iconIdx += 1;
        }
      }
    }
    geometry.setAttribute('iconIndex', new THREE.InstancedBufferAttribute(iconIndices, 1));

    const generateAtlas = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = atlasWidth;
      canvas.height = atlasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      for (let i = 0; i < atlasCols * atlasRows; i += 1) {
        const col = i % atlasCols;
        const row = Math.floor(i / atlasCols);
        const x = col * cellSize;
        const y = row * cellSize;

        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = '#0D3B90';
        ctx.fillRect(x + 0.25, y + 0.25, cellSize - 0.5, cellSize - 0.5);

        if (i < techIcons.length) {
          const iconPath = techIcons[i].path;
          const renderSize = 512;
          const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${renderSize}" height="${renderSize}" viewBox="0 0 24 24"><path d="${iconPath}" fill="white"/></svg>`;
          const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
          const img = new Image();
          img.width = renderSize;
          img.height = renderSize;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = url;
          });
          const iconSize = cellSize * 0.50;
          const iconOffset = (cellSize - iconSize) / 2;
          ctx.globalAlpha = 0.33;
          ctx.drawImage(img, x + iconOffset, y + iconOffset, iconSize, iconSize);
          ctx.globalAlpha = 1.0;
        }
      }

      return canvas;
    };

    (async () => {
      const canvas = await generateAtlas();
      if (!canvas || disposed) return;

      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = 42;

      material = new THREE.MeshBasicMaterial({ map: texture });
      const time = { value: 0 };

      material.onBeforeCompile = (shader) => {
        const patchedShader = shader as ShaderWithTime;
        patchedShader.uniforms.time = time;

        patchedShader.vertexShader = patchedShader.vertexShader
          .replace(
            '#include <common>',
            `
    uniform float time;
    attribute vec3 rcl;
    attribute float iconIndex;
    attribute float aIsTop;
    varying float vIconIndex;
    varying float vIsTop;
    #include <common>
            `,
          )
          .replace(
            '#include <project_vertex>',
            `
    const float columnCount = float(${columnCount});
    const float arc = 2.0 * 3.14159265359 / columnCount;
    const float oneStep = ${oneStep.toFixed(6)};

    float shift = 3.0 - fract(time) * oneStep;

    float radius = shift;
    float zShift = 0.0;
    int x = int(rcl.x);
    for (int i = 0; i < x; i++) {
      radius += radius * arc;
      zShift += radius * arc;
    }

    vec4 mvPosition = vec4(transformed, 1.0);

    if (mvPosition.z > 0.0) {
      radius += radius * arc;
    }

    mvPosition.xz *= radius * arc;
    mvPosition.z += zShift + shift;

    float t = sin(rcl.y / 5.3) * 1.1
            + sin(rcl.y / 1.3) * 1.5
            + cos(rcl.y / 1.7) * 2.5;

    t = 2.0 - rcl.x + abs(t) + fract(time);
    t += rcl.z * abs(sin(rcl.y));
    t = max(t, 0.0);
    mvPosition.y -= t * t * t + rcl.z;

    float angle = rcl.y * arc;
    float sn = sin(angle);
    float cs = cos(angle);
    mvPosition.xz = mvPosition.xz * mat2(cs, -sn, sn, cs);

    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;

    vIconIndex = floor(fract(sin(dot(vec3(floor(time) + rcl.x, rcl.y, rcl.z), vec3(12.9898, 78.233, 37.719))) * 43758.5453) * ${techIcons.length}.0);
    vIsTop = aIsTop;
            `,
          );

        patchedShader.fragmentShader = patchedShader.fragmentShader
          .replace(
            '#include <common>',
            `
    varying float vIconIndex;
    varying float vIsTop;
    #include <common>
            `,
          )
          .replace(
            '#include <map_fragment>',
            `
    float atlasCols = ${atlasCols}.0;
    float cellW = 1.0 / atlasCols;
    float effectiveIconIndex = vIsTop > 0.5 ? vIconIndex : ${atlasCols - 1}.0;
    float padX = 0.5 / ${atlasWidth}.0;
    float padY = 0.5 / ${atlasHeight}.0;
    vec2 atlasUV = vec2(effectiveIconIndex * cellW + padX, padY) + vMapUv * vec2(cellW - 2.0 * padX, 1.0 - 2.0 * padY);
    vec4 sampledDiffuseColor = texture2D(map, atlasUV);
    diffuseColor *= sampledDiffuseColor;
            `,
          );
      };

      const instanceCount = rowCount * columnCount * layerCount;
      mesh = new THREE.InstancedMesh(geometry!, material, instanceCount);
      const identity = new THREE.Matrix4();
      for (let i = 0; i < instanceCount; i += 1) {
        mesh.setMatrixAt(i, identity);
      }
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.domElement.className = 'hero-hole-canvas';
      container.appendChild(renderer.domElement);

      const render = (timestamp = 0) => {
        time.value = timestamp / 1000;
        scene.rotation.y = -timestamp / 10000;
        if (noiseRef?.current) {
          const rot = scene.rotation.y;
          noiseRef.current.style.transform = `translate(${Math.sin(rot) * 40}px, ${Math.cos(rot) * 30}px)`;
        }
        renderer!.render(scene, camera);
      };

      const animate = (timestamp: number) => {
        render(timestamp);
        animationFrame = window.requestAnimationFrame(animate);
      };

      resizeHandler = () => {
        const width = Math.max(1, container.clientWidth || window.innerWidth);
        const height = Math.max(1, container.clientHeight || window.innerHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer!.setSize(width, height, false);
      };

      resizeHandler();
      if (reducedMotion) {
        render();
      } else {
        animationFrame = window.requestAnimationFrame(animate);
      }
      window.addEventListener('resize', resizeHandler);
    })();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (mesh) {
        scene.remove(mesh);
        mesh.dispose();
      }
      if (texture) texture.dispose();
      if (material) material.dispose();
      if (geometry) geometry.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-hole-layer" aria-hidden="true" />;
}
