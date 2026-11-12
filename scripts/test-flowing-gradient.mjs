import assert from 'node:assert/strict';
import tgpu from 'typegpu';
import { createServer } from 'vite';
import { componentDefinition as originalGradient } from 'shaders/core/FlowingGradient';

const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, appType: 'custom' });
try {
  const { sectionFlowingGradient } = await server.ssrLoadModule('/src/utils/flowingOklab.ts');
  const reference = name => ({ _emit: () => name, member: prop => reference(`${name}.${prop}`) });
  const params = {
    uniforms: Object.fromEntries(['colorA', 'colorB', 'colorC', 'colorD', 'distortion', 'seed'].map(name => [name, reference(name)])),
    ctx: { uv: reference('uv'), viewportSize: reference('viewport') },
    props: reference('props'),
    propValues: { colorSpace: 2 },
  };
  const externals = {};
  const emit = { external(fn, name) { externals[name] = fn; return name; } };
  const original = originalGradient.fragment(params)._emit(emit);
  assert.equal(original.match(/flowingFactors\(/g)?.length, 4, 'Reference no longer reproduces the duplicated noise graph');

  const expression = sectionFlowingGradient.fragment(params);
  assert.equal(expression._emit(emit), 'flowingOklab(uv, viewport, distortion, seed, props._animTime, colorA, colorB, colorC, colorD)');
  assert.match(expression.member('xyz').mul(0.25).add(1)._emit(emit), /\.xyz \* 2\.5e-1\) \+ 1e\+0/);

  const wgsl = tgpu.resolve({
    names: 'strict',
    externals: { flowingOklab: externals.flowingOklab },
    template: `@compute @workgroup_size(1) fn main() {
      let color = flowingOklab(vec2f(0.5), vec2f(1440.0, 900.0), 0.15, 0.0, 0.0,
        vec4f(0.1, 0.2, 0.3, 1.0), vec4f(0.2, 0.3, 0.4, 1.0),
        vec4f(0.3, 0.4, 0.5, 1.0), vec4f(0.4, 0.5, 0.6, 1.0));
    }`,
  });
  assert.equal(wgsl.match(/flowingFactors\(/g)?.length, 2, 'Expected one function declaration and one noise evaluation');
  assert.match(wgsl, /let factors = flowingFactors\(/);
  assert.match(wgsl, /mixOklab\(ab, ce, factors\.y\)/);
  assert(!wgsl.includes('rgbToHsl'), 'Section gradient must remain OKLab');
  console.log('PASS: OKLab shader resolves with one noise evaluation instead of four.');
} finally {
  await server.close();
}
