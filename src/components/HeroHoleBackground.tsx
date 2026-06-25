import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const rowCount = 20;
const columnCount = 64;
const layerCount = 2;

type ShaderWithTime = THREE.Shader & {
  uniforms: THREE.Shader['uniforms'] & {
    time: { value: number };
  };
};

export default function HeroHoleBackground() {
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

    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0D3B90';
    ctx.fillRect(3, 3, size - 6, size - 6);

    const texture = new THREE.CanvasTexture(canvas);
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
