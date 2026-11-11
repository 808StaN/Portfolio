import { Suspense, useEffect, useRef, useState } from 'react';
import { createRoot, extend, useFrame, useLoader, useThree } from '@react-three/fiber';
import { AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, CapsuleGeometry, CircleGeometry, Color, CylinderGeometry, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PlaneGeometry, SphereGeometry, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import flyrankWordmark from '../assets/flyrank-wordmark.svg';
import { SceneBoundary, type JourneySceneState } from './ExperienceWorld';

extend({ AmbientLight, BoxGeometry, CapsuleGeometry, CircleGeometry, CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SphereGeometry });

// Invert the SVG's ground-plane projection so both renderers share one route.
const ground = (x: number, y: number) => new Vector3((x - 480) / 60, 0, (y - 330) / (60 * Math.SQRT1_2));

function SoftBox({ size, position = [0, 0, 0], color, radius = 0.06 }: { size: [number, number, number]; position?: [number, number, number]; color: string; radius?: number }) {
  const [geometry] = useState(() => new RoundedBoxGeometry(...size, 2, radius));
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position}><meshStandardMaterial color={color} roughness={0.85} /></mesh>;
}

function Road({ points }: { points: JourneySceneState['points'] }) {
  const [[geometry, markings]] = useState(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const route = points.map(p => ground(p.x, p.y));
    // A ribbon with vertical sides, plus semicircular caps, not a thick platform.
    route.forEach((p, i) => {
      const tangent = route[Math.min(i + 1, route.length - 1)].clone().sub(route[Math.max(0, i - 1)]).normalize();
      const normal = new Vector3(-tangent.z, 0, tangent.x).multiplyScalar(0.78);
      for (const height of [0, -0.055]) {
        positions.push(p.x + normal.x, height, p.z + normal.z, p.x - normal.x, height, p.z - normal.z);
      }
      if (i) {
        const a = (i - 1) * 4, b = i * 4;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
        indices.push(a + 2, b + 2, a, a, b + 2, b);
        indices.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3);
      }
    });
    for (const index of [0, route.length - 1]) {
      const p = route[index];
      const tangent = index === 0 ? route[0].clone().sub(route[1]) : p.clone().sub(route[index - 1]);
      const angle = Math.atan2(tangent.z, tangent.x);
      const center = positions.length / 3;
      positions.push(p.x, 0, p.z);
      for (let i = 0; i <= 16; i++) {
        const theta = angle - Math.PI / 2 + i * Math.PI / 16;
        positions.push(p.x + Math.cos(theta) * 0.78, 0, p.z + Math.sin(theta) * 0.78);
        if (i) indices.push(center, center + i + 1, center + i);
      }
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    // All lane markings share one mesh instead of a draw call per dash.
    const dashPositions: number[] = [];
    const dashIndices: number[] = [];
    for (let i = 4; i < route.length - 1; i += 14) {
      const p = route[i];
      const tangent = route[i + 1].clone().sub(p).normalize();
      const normal = new Vector3(-tangent.z, 0, tangent.x);
      const start = dashPositions.length / 3;
      for (const [length, width] of [[-0.14, -0.024], [-0.14, 0.024], [0.14, -0.024], [0.14, 0.024]]) {
        dashPositions.push(p.x + tangent.x * length + normal.x * width, 0.008, p.z + tangent.z * length + normal.z * width);
      }
      dashIndices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
    }
    const lines = new BufferGeometry();
    lines.setAttribute('position', new Float32BufferAttribute(dashPositions, 3));
    lines.setIndex(dashIndices);
    return [result, lines];
  });
  useEffect(() => () => { geometry.dispose(); markings.dispose(); }, [geometry, markings]);

  return (
    <group>
      <mesh geometry={geometry}><meshStandardMaterial color="#63748c" roughness={1} /></mesh>
      <mesh geometry={markings}><meshBasicMaterial color="#f2f5f7" toneMapped={false} /></mesh>
    </group>
  );
}

function Billboard({ x, y, next, journey }: { x: number; y: number; next?: boolean; journey: JourneySceneState }) {
  const logo = useLoader(TextureLoader, flyrankWordmark);
  logo.colorSpace = SRGBColorSpace;
  const [question] = useState(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f0f5ff';
    ctx.font = '500 130px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 64, 128);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  });
  useEffect(() => () => question.dispose(), [question]);
  const panel = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    if (panel.current) {
      const active = journey.checkpoint === (next ? 1 : 0);
      panel.current.color.set(active ? '#16345f' : '#42658c');
      panel.current.emissiveIntensity = active ? 0.19 : 0;
    }
  });
  const p = ground(x, y);
  const nearest = journey.points.reduce((best, point, index, points) =>
    Math.hypot(point.x - x, point.y - y) < Math.hypot(points[best].x - x, points[best].y - y) ? index : best, 0);
  const before = journey.points[Math.max(0, nearest - 1)];
  const after = journey.points[Math.min(journey.points.length - 1, nearest + 1)];
  const direction = ground(after.x, after.y).sub(ground(before.x, before.y));
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, Math.atan2(-direction.z, direction.x), 0]} scale={1.28}>
      {[-0.63, 0.63].map(offset => <group key={offset} position={[offset, 0, 0]}>
        <SoftBox size={[0.09, 0.86, 0.1]} position={[0, 0.43, 0]} color="#9ebbd8" radius={0.025} />
        <SoftBox size={[0.32, 0.055, 0.25]} position={[0, 0.027, 0]} color="#6e91b5" radius={0.02} />
      </group>)}
      <SoftBox size={[1.92, 1.25, 0.13]} position={[0, 1.4, 0]} color="#a6c3de" />
      <mesh position={[0, 1.4, 0.077]}>
        <boxGeometry args={[1.8, 1.13, 0.035]} />
        <meshStandardMaterial ref={panel} color="#16345f" emissive="#517cac" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, 0.1]}>
        <planeGeometry args={next ? [0.48, 0.6] : [1.53, 0.504]} />
        <meshBasicMaterial map={next ? question : logo} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Character({ journey }: { journey: JourneySceneState }) {
  const character = useRef<Group>(null);
  const body = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  useFrame(() => {
    const p = ground(journey.x, journey.y);
    if (character.current) {
      character.current.position.set(p.x, 0.025, p.z);
      character.current.rotation.y = Math.atan2(journey.dx, journey.dy / Math.SQRT1_2);
    }
    if (body.current) body.current.position.y = Math.abs(journey.stride) * 0.035;
    if (leftLeg.current) leftLeg.current.rotation.x = journey.stride * 0.48;
    if (rightLeg.current) rightLeg.current.rotation.x = -journey.stride * 0.48;
    if (leftArm.current) leftArm.current.rotation.x = -journey.stride * 0.35;
    if (rightArm.current) rightArm.current.rotation.x = journey.stride * 0.35;
    if (shadow.current) shadow.current.position.set(p.x, 0.009, p.z);
  });
  return (
    <group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} scale={[1.4, 0.91, 1]}>
        <circleGeometry args={[0.31, 24]} /><meshBasicMaterial color="#344d70" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group ref={character} name="journey-character" scale={1.4}>
        <group ref={body}>
          {[leftLeg, rightLeg].map((ref, i) => <group key={i} ref={ref} position={[i ? 0.115 : -0.115, 0.55, 0]}>
            <SoftBox size={[0.18, 0.43, 0.2]} position={[0, -0.2, 0]} color="#3e68a4" radius={0.065} />
            <SoftBox size={[0.22, 0.14, 0.34]} position={[0, -0.47, 0.055]} color="#f1f1e6" radius={0.055} />
            <SoftBox size={[0.225, 0.045, 0.34]} position={[0, -0.525, 0.055]} color="#91a5b8" radius={0.018} />
          </group>)}
          <SoftBox size={[0.5, 0.58, 0.33]} position={[0, 0.83, 0]} color="#eeefe3" radius={0.14} />
          <SoftBox size={[0.27, 0.16, 0.035]} position={[0, 0.69, 0.165]} color="#d7dfd7" radius={0.025} />
          {[leftArm, rightArm].map((ref, i) => <group key={i} ref={ref} position={[i ? 0.3 : -0.3, 1.02, 0]}>
            <mesh position={[0, -0.19, 0]}><capsuleGeometry args={[0.095, 0.23, 4, 8]} /><meshStandardMaterial color="#e5e9df" roughness={0.9} /></mesh>
            <mesh position={[0, -0.39, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#edc7a6" roughness={0.9} /></mesh>
          </group>)}
          <mesh position={[0, 1.13, 0]}><cylinderGeometry args={[0.085, 0.09, 0.14, 10]} /><meshStandardMaterial color="#edc7a6" roughness={0.9} /></mesh>
          <mesh position={[0, 1.43, 0]} scale={[1, 1.04, 0.93]}><sphereGeometry args={[0.285, 20, 16]} /><meshStandardMaterial color="#f0cbaa" roughness={0.9} /></mesh>
          <mesh position={[0, 1.53, -0.04]} rotation={[0.15, 0, -0.13]} scale={[1.05, 0.75, 0.97]}><sphereGeometry args={[0.29, 16, 12]} /><meshStandardMaterial color="#25354b" roughness={1} /></mesh>
          <SoftBox size={[0.3, 0.12, 0.15]} position={[-0.035, 1.61, 0.18]} color="#25354b" radius={0.045} />
          {[-0.105, 0.105].map(x => <mesh key={x} position={[x, 1.43, 0.244]}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color="#263649" /></mesh>)}
          <mesh position={[0, 1.37, 0.27]}><sphereGeometry args={[0.045, 8, 6]} /><meshStandardMaterial color="#e5b490" roughness={1} /></mesh>
          {[-0.28, 0.28].map(x => <mesh key={x} position={[x, 1.43, 0]} scale={[0.55, 1, 0.8]}><sphereGeometry args={[0.085, 8, 8]} /><meshStandardMaterial color="#edc3a0" roughness={1} /></mesh>)}
        </group>
      </group>
    </group>
  );
}

function Building({ x, y, height, roof }: { x: number; y: number; height: number; roof: string }) {
  const p = ground(x, y);
  const [windows] = useState(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];
    for (let floor = 0; floor < (height > 2 ? 3 : 2); floor++) {
      for (const column of [-1, 1]) {
        const bottom = 0.76 + floor * 0.53;
        const color = new Color((floor + column) % 3 === 0 ? '#eee0b5' : '#c6e0e7');
        for (const side of [false, true]) {
          const start = positions.length / 3;
          for (const [u, v] of [[-0.12, 0], [0.12, 0], [-0.12, 0.3], [0.12, 0.3]]) {
            if (side) positions.push(-0.726, bottom + v, column * 0.27 + u);
            else positions.push(column * 0.32 + u, bottom + v, 0.626);
            colors.push(color.r, color.g, color.b);
          }
          indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
        }
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    return geometry;
  });
  useEffect(() => () => windows.dispose(), [windows]);
  return (
    <group name="journey-building" position={[p.x, 0, p.z]} rotation={[0, 0.45, 0]}>
      <SoftBox size={[1.58, 0.08, 1.38]} position={[0, 0.04, 0]} color="#91a9bd" radius={0.035} />
      <SoftBox size={[1.45, height, 1.25]} position={[0, height / 2 + 0.08, 0]} color="#e0e5df" radius={0.045} />
      <SoftBox size={[1.68, 0.16, 1.48]} position={[0, height + 0.14, 0]} color={roof} radius={0.035} />
      <mesh geometry={windows} position={[0, 0.08, 0]}><meshBasicMaterial vertexColors toneMapped={false} /></mesh>
      <SoftBox size={[0.29, 0.54, 0.045]} position={[0, 0.35, 0.632]} color="#7895ac" radius={0.025} />
      <SoftBox size={[0.47, 0.08, 0.28]} position={[0, 0.04, 0.72]} color="#c3d2da" radius={0.025} />
      <mesh position={[0.32, height + 0.37, -0.25]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 10]} /><meshStandardMaterial color="#d0d9d8" roughness={1} />
      </mesh>
      <mesh position={[0.32, height + 0.53, -0.25]}>
        <cylinderGeometry args={[0.19, 0.19, 0.06, 10]} /><meshStandardMaterial color={roof} roughness={1} />
      </mesh>
    </group>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const p = ground(x, y);
  return (
    <group name="journey-tree" position={[p.x, 0, p.z]} scale={scale}>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.06, 0.08, 0.56, 8]} /><meshStandardMaterial color="#a08c74" roughness={1} /></mesh>
      <mesh position={[0, 0.76, 0]} scale={[1, 1.06, 1]}><sphereGeometry args={[0.34, 12, 10]} /><meshStandardMaterial color="#80b997" roughness={1} /></mesh>
      <mesh position={[0.035, 1.01, -0.015]}><sphereGeometry args={[0.23, 10, 8]} /><meshStandardMaterial color="#9acaa1" roughness={1} /></mesh>
    </group>
  );
}

function PocketPark() {
  const p = ground(835, 255);
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, 0.685, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 0.85, 1]}>
        <circleGeometry args={[1.05, 32]} /><meshBasicMaterial color="#557f83" />
      </mesh>
      {[-0.13, 0, 0.13].map(z => <SoftBox key={z} size={[1.2, 0.07, 0.1]} position={[-0.2, 0.4, z]} color="#c4ad8d" radius={0.025} />)}
      <SoftBox size={[1.2, 0.3, 0.07]} position={[-0.2, 0.66, -0.2]} color="#c4ad8d" radius={0.025} />
      {[-0.65, 0.25].map(x => <SoftBox key={x} size={[0.08, 0.36, 0.32]} position={[x, 0.18, 0]} color="#58728a" radius={0.025} />)}
      <mesh position={[0.95, 0.9, 0.28]}><cylinderGeometry args={[0.035, 0.05, 1.8, 8]} /><meshStandardMaterial color="#9bb2c3" roughness={1} /></mesh>
      <SoftBox size={[0.21, 0.25, 0.21]} position={[0.95, 1.85, 0.28]} color="#efdfb7" radius={0.035} />
      <SoftBox size={[0.28, 0.055, 0.28]} position={[0.95, 2, 0.28]} color="#67889c" radius={0.02} />
    </group>
  );
}

function World({ journey, onReady, onUnavailable }: { journey: JourneySceneState; onReady: () => void; onUnavailable: () => void }) {
  const { camera, size, invalidate, gl } = useThree();
  useEffect(() => {
    const ortho = camera as OrthographicCamera;
    ortho.zoom = size.width / 16;
    ortho.lookAt(0, 0, 0);
    ortho.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  useEffect(() => {
    journey.invalidate = invalidate;
    invalidate();
    return () => { journey.invalidate = undefined; };
  }, [journey, invalidate]);
  const reported = useRef(false);
  useFrame(state => {
    if (reported.current && !journey.visible) return;
    try {
      state.gl.render(state.scene, state.camera);
    } catch {
      onUnavailable();
      return;
    }
    if (!reported.current) {
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      reported.current = true;
      onReady();
    }
  }, 1);
  return (
    <>
      <ambientLight intensity={0.65} color="#dceaff" />
      <hemisphereLight args={['#fff7e8', '#587399', 0.75]} />
      <directionalLight position={[-4, 9, 6]} intensity={1.6} color="#fff3de" />
      <directionalLight position={[5, 4, -5]} intensity={0.5} color="#a9d5ff" />
      <Road points={journey.points} />
      <Billboard x={200} y={390} journey={journey} />
      <Billboard x={590} y={155} next journey={journey} />
      <Building x={395} y={295} height={2.25} roof="#76b8cd" />
      <Building x={625} y={400} height={1.75} roof="#8c86ce" />
      <Building x={475} y={570} height={2.3} roof="#d77f8c" />
      <Tree x={295} y={300} scale={1.2} />
      <Tree x={485} y={305} />
      <Tree x={725} y={405} scale={1.1} />
      <Tree x={385} y={525} scale={1.15} />
      <PocketPark />
      <Tree x={755} y={235} scale={1.1} />
      <Tree x={875} y={205} scale={1.25} />
      <Character journey={journey} />
    </>
  );
}

export default function ExperienceScene3D({ journey, onReady, onUnavailable }: { journey: JourneySceneState; onReady: () => void; onUnavailable: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const unavailable = useRef(onUnavailable);
  ready.current = onReady;
  unavailable.current = onUnavailable;
  useEffect(() => {
    const element = container.current!;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
    element.append(canvas);
    const root = createRoot(canvas);
    let disposed = false;
    const fail = () => { if (!disposed) unavailable.current(); };
    canvas.addEventListener('webglcontextlost', fail);
    const size = () => ({ width: element.offsetWidth, height: element.offsetHeight, top: 0, left: 0 });
    // Layout dimensions stay stable while the surrounding section tilts.
    let resize: (() => void) | undefined;
    const observer = new ResizeObserver(() => { if (!disposed) resize?.(); });
    void root.configure({
      orthographic: true,
      camera: { position: [0, 12, 12], near: 0.1, far: 60 },
      size: size(), dpr: Math.min(devicePixelRatio, 1.5), frameloop: 'demand',
      gl: { alpha: true, antialias: true, powerPreference: 'low-power' },
    }).then(() => {
      if (disposed) return;
      const store = root.render(
        <SceneBoundary onError={fail}>
          <Suspense fallback={null}><World journey={journey} onReady={() => ready.current()} onUnavailable={fail} /></Suspense>
        </SceneBoundary>,
      );
      resize = () => {
        store.getState().setSize(element.offsetWidth, element.offsetHeight);
        store.getState().setDpr(Math.min(devicePixelRatio, 1.5));
      };
      observer.observe(element);
    }).catch(fail);
    return () => {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', fail);
      root.unmount();
      canvas.remove();
    };
  }, [journey]);
  return <div ref={container} className="experience-world-3d" />;
}
