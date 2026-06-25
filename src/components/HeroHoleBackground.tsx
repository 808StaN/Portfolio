import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import techIcons from '../constants/techIcons.json';

const rowCount = 20;
const columnCount = 64;
const layerCount = 2;
const atlasCols = 8;
const cellSize = 256;
const atlasSize = atlasCols * cellSize;

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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 6, 6);
    camera.lookAt(0, 0, 1);

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry();
    const rowCol: number[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      for (let j = 0; j < layerCount; j += 1) {
        for (let k = 0; k < columnCount; k += 1) {
          rowCol.push(i, k, j);
        }
      }
    }

    geometry.setAttribute('rcl', new THREE.InstancedBufferAttribute(new Float32Array(rowCol), 3));

    const iconIndices = new Float32Array(rowCount * columnCount * layerCount);
    for (let i = 0; i < iconIndices.length; i += 1) {
      iconIndices[i] = i % techIcons.length;
    }
    geometry.setAttribute('iconIndex', new THREE.InstancedBufferAttribute(iconIndices, 1));

    const canvas = document.createElement('canvas');
    canvas.width = atlasSize;
    canvas.height = atlasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCell = (x: number, y: number, iconPath?: string) => {
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.fillStyle = '#0D3B90';
      ctx.fillRect(x + 0.25, y + 0.25, cellSize - 0.5, cellSize - 0.5);

      if (iconPath) {
        const iconSize = cellSize * 0.55;
        const iconOffset = (cellSize - iconSize) / 2;
        ctx.save();
        ctx.translate(x + iconOffset, y + iconOffset);
        ctx.scale(iconSize / 24, iconSize / 24);
        ctx.fillStyle = 'white';
        ctx.fill(new Path2D(iconPath));
        ctx.restore();
      }
    };

    for (let i = 0; i < atlasCols * atlasCols; i += 1) {
      const col = i % atlasCols;
      const row = Math.floor(i / atlasCols);
      const iconPath = i < techIcons.length ? (techIcons[i] as string) : undefined;
      drawCell(col * cellSize, row * cellSize, iconPath);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 42;

    const material = new THREE.MeshBasicMaterial({ map: texture });
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
    varying float vIconIndex;
    #include <common>
          `,
        )
        .replace(
          '#include <project_vertex>',
          `
    const float columnCount = float(${columnCount});
    const float arc = 2.0 * 3.14159265359 / columnCount;
    const float oneStep = 0.283;

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

    vIconIndex = iconIndex;
          `,
        );

      patchedShader.fragmentShader = patchedShader.fragmentShader
        .replace(
          '#include <common>',
          `
    varying float vIconIndex;
    #include <common>
          `,
        )
        .replace(
          '#include <map_fragment>',
          `
    float atlasCols = ${atlasCols}.0;
    float cellW = 1.0 / atlasCols;
    float colAtlas = mod(vIconIndex, atlasCols);
    float rowAtlas = floor(vIconIndex / atlasCols);
    vec2 cellOffsetAtlas = vec2(colAtlas * cellW, (atlasCols - 1.0 - rowAtlas) * cellW);
    vec2 atlasUV = cellOffsetAtlas + vMapUv * vec2(cellW);
    vec4 sampledDiffuseColor = texture2D(map, atlasUV);
    diffuseColor *= sampledDiffuseColor;
          `,
        );
    };

    const instanceCount = rowCount * columnCount * layerCount;
    const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
    const identity = new THREE.Matrix4();
    for (let i = 0; i < instanceCount; i += 1) {
      mesh.setMatrixAt(i, identity);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.domElement.className = 'hero-hole-canvas';
    container.appendChild(renderer.domElement);

    let animationFrame = 0;

    const resize = () => {
      const width = Math.max(1, container.clientWidth || window.innerWidth);
      const height = Math.max(1, container.clientHeight || window.innerHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const render = (timestamp = 0) => {
      time.value = timestamp / 1000;
      scene.rotation.y = -timestamp / 10000;
      if (noiseRef?.current) {
        const rot = scene.rotation.y;
        noiseRef.current.style.transform = `translate(${Math.sin(rot) * 40}px, ${Math.cos(rot) * 30}px)`;
      }
      renderer.render(scene, camera);
    };

    const animate = (timestamp: number) => {
      render(timestamp);
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    if (reducedMotion) {
      render();
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrame);
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="hero-hole-layer" aria-hidden="true" />;
}
