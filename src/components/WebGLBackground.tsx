import { useRef, useEffect, useCallback } from 'react';

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2  u_resolution;
  uniform float u_time;
  uniform vec2  u_mouse;
  uniform float u_mouse_ease;

  // ─── Noise helpers ───────────────────────────────────────────────
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // ─── FBM (fractal brownian motion) ───────────────────────────────
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  // ─── Color palette ────────────────────────────────────────────────
  // deep black, navy, electric blue, purple, warm orange/amber
  vec3 palette(float t, vec2 mouse) {
    // Base colors (all deep/dark)
    vec3 black     = vec3(0.020, 0.020, 0.030);
    vec3 navy      = vec3(0.030, 0.050, 0.180);
    vec3 deepBlue  = vec3(0.040, 0.100, 0.380);
    vec3 elecBlue  = vec3(0.100, 0.280, 0.780);
    vec3 purple    = vec3(0.260, 0.100, 0.540);
    vec3 orange    = vec3(0.780, 0.300, 0.040);
    vec3 amber     = vec3(0.860, 0.460, 0.020);
    vec3 charcoal  = vec3(0.055, 0.055, 0.080);

    // Mouse tint nudge: warm (orange) vs cool (blue)
    float mX = mouse.x;  // 0..1
    float mY = mouse.y;  // 0..1

    // Layer 1: base dark field
    vec3 col = black;

    // Layer 2: navy / electric blue lobe
    float t2 = smoothstep(0.0, 0.55, t);
    col = mix(col, mix(navy, elecBlue, t2), smoothstep(0.2, 0.65, t2));

    // Layer 3: purple mid
    float t3 = smoothstep(0.3, 0.75, t);
    col = mix(col, purple, t3 * 0.55);

    // Layer 4: orange/amber hot spot
    float t4 = smoothstep(0.55, 0.95, t);
    col = mix(col, mix(orange, amber, sin(t * 3.14159) * 0.5 + 0.5), t4 * 0.85);

    // Mouse influence: shift towards orange in hot region
    col = mix(col, orange * 1.1, mX * 0.18 * smoothstep(0.4, 0.9, t));
    // Mouse influence: deepen blue in cool region
    col = mix(col, elecBlue, (1.0 - mX) * 0.12 * smoothstep(0.1, 0.5, t2));

    return col;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    float viewScale = 1.5; // < 1.0 = zoom out (show wider area)

    // correct for aspect
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * viewScale;

    // ── Mouse displacement ─────────────────────────────────────────
    vec2 mouse = u_mouse;                               // 0..1
    vec2 mouseP = (mouse - 0.5) * vec2(aspect, 1.0) * viewScale;   // aspect-corrected
    float mouseDist = length(p - mouseP);
    float mouseInfluence = exp(-mouseDist * mouseDist * 2.2) * u_mouse_ease;

    // ── Slow auto rotation of the whole field ─────────────────────
    float angle = u_time * 0.09;
    float cosA = cos(angle), sinA = sin(angle);
    vec2 rotP = vec2(cosA * p.x - sinA * p.y,
                     sinA * p.x + cosA * p.y);

    // ── Mouse warp ────────────────────────────────────────────────
    vec2 warp = (mouseP - p) * mouseInfluence * 0.45;
    rotP += warp;

    // ── FBM layers ────────────────────────────────────────────────
    vec3 q = vec3(rotP * 1.2, u_time * 0.065);
    float f1 = fbm(q, 5);
    float f2 = fbm(vec3(rotP * 0.8 + vec2(f1 * 0.9, f1 * 0.4), u_time * 0.045 + 3.7), 4);
    float f3 = fbm(vec3(rotP * 0.6 + vec2(f2 * 1.1, f1 * 0.6), u_time * 0.035 + 7.3), 3);

    // blend fbm values
    float field = f1 * 0.50 + f2 * 0.35 + f3 * 0.15;
    field = field * 0.5 + 0.5; // remap to 0..1

    // mouse brightening
    field += mouseInfluence * 0.18;
    field = clamp(field, 0.0, 1.0);

    // ── Vignette ─────────────────────────────────────────────────
    float vignette = 1.0 - smoothstep(0.35, 1.1, length(p) * 0.85);
    field *= (0.55 + 0.45 * vignette);

    // ── Color ─────────────────────────────────────────────────────
    vec3 color = palette(field, mouse);

    // ── Inner glow around mouse ───────────────────────────────────
    vec3 glowColor = vec3(0.55, 0.75, 1.0);
    color = mix(color, glowColor * 0.9, mouseInfluence * 0.28);

    // ── Subtle grain (baked into shader) ─────────────────────────
    float grain = snoise(vec3(gl_FragCoord.xy * 0.8, u_time * 12.0)) * 0.018;
    color += grain;

    // ── Gamma & tone ─────────────────────────────────────────────
    color = pow(max(color, vec3(0.0)), vec3(0.9));
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Props {
  className?: string;
}

export default function WebGLBackground({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Smoothed mouse
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
  const mouseEaseRef = useRef(0);
  const mouseEaseTargetRef = useRef(0);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    glRef.current = gl;

    // Compile shaders
    const vert = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vert, VERTEX_SHADER);
    gl.compileShader(vert);
    if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vert));
      return;
    }

    const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(frag, FRAGMENT_SHADER);
    gl.compileShader(frag);
    if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(frag));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Full-screen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    resize();

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    // Smooth mouse interpolation
    const ease = 0.055;
    mouseRef.current.x += (mouseTargetRef.current.x - mouseRef.current.x) * ease;
    mouseRef.current.y += (mouseTargetRef.current.y - mouseRef.current.y) * ease;
    mouseEaseRef.current += (mouseEaseTargetRef.current - mouseEaseRef.current) * 0.04;

    // Set uniforms
    const res = gl.getUniformLocation(program, 'u_resolution');
    const time = gl.getUniformLocation(program, 'u_time');
    const mouse = gl.getUniformLocation(program, 'u_mouse');
    const mouseEase = gl.getUniformLocation(program, 'u_mouse_ease');

    gl.uniform2f(res, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(time, elapsed);
    gl.uniform2f(mouse, mouseRef.current.x, 1.0 - mouseRef.current.y);
    gl.uniform1f(mouseEase, mouseEaseRef.current);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafRef.current = requestAnimationFrame(render);
  }, [resize]);

  useEffect(() => {
    initWebGL();
    resize();
    rafRef.current = requestAnimationFrame(render);

    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [initWebGL, resize, render]);

  // Mouse events
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTargetRef.current.x = e.clientX / window.innerWidth;
      mouseTargetRef.current.y = e.clientY / window.innerHeight;
      mouseEaseTargetRef.current = 1.0;
    };

    const onLeave = () => {
      mouseEaseTargetRef.current = 0.0;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`webgl-container ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
