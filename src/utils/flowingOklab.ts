import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import type { GpuShaderDefinition } from 'shaders/core';
import { componentDefinition as FlowingGradient, flowingCompose, flowingFactors } from 'shaders/core/FlowingGradient';

type Expression = ReturnType<GpuShaderDefinition['fragment']>;

// The shader contract accepts expressions, but its runtime expression factory is private.
class ShaderExpression implements Expression {
  constructor(readonly _emit: Expression['_emit']) {}

  member(prop: string): Expression {
    return new ShaderExpression(ctx => `${this._emit(ctx)}.${prop}`);
  }

  mul(other: Expression | number): Expression {
    return new ShaderExpression(ctx => `(${this._emit(ctx)} * ${typeof other === 'number' ? other.toExponential() : other._emit(ctx)})`);
  }

  add(other: Expression | number): Expression {
    return new ShaderExpression(ctx => `(${this._emit(ctx)} + ${typeof other === 'number' ? other.toExponential() : other._emit(ctx)})`);
  }
}

const p3ToSrgb = tgpu.fn([d.vec3f], d.vec3f)(`(p: vec3f) -> vec3f {
  return vec3f(
    p.x * 1.2249401 - p.y * 0.2249404,
    p.x * -0.0420569 + p.y * 1.0420571,
    (p.x * -0.0196376 - p.y * 0.0786361) + p.z * 1.0982735
  );
}`);

const srgbToP3 = tgpu.fn([d.vec3f], d.vec3f)(`(p: vec3f) -> vec3f {
  return vec3f(
    p.x * 0.8224621 + p.y * 0.177538,
    p.x * 0.0331941 + p.y * 0.9668058,
    (p.x * 0.0170826 + p.y * 0.0723974) + p.z * 0.9105199
  );
}`);

// Keep the library's P3-linear round trips and alpha weighting, including intermediate mixes.
const rgbToOklab = tgpu.fn([d.vec3f], d.vec3f)(`(p: vec3f) -> vec3f {
  let lms = vec3f(
    (p.x * 0.4122214708 + p.y * 0.5363325363) + p.z * 0.0514459929,
    p.x * 0.2119034982 + (p.y * 0.6806995451 + p.z * 0.1073969566),
    (p.x * 0.0883024619 + p.y * 0.2817188376) + p.z * 0.6299787005
  );
  let c = sign(lms) * pow(abs(lms), vec3f(1.0 / 3.0));
  return vec3f(
    (c.x * 0.2104542553 + c.y * 0.793617785) - c.z * 0.0040720468,
    (c.x * 1.9779984951 - c.y * 2.428592205) + c.z * 0.4505937099,
    (c.x * 0.0259040371 + c.y * 0.7827717662) - c.z * 0.808675766
  );
}`);

const oklabToRgb = tgpu.fn([d.vec3f], d.vec3f)(`(p: vec3f) -> vec3f {
  let c = vec3f(
    (p.x + p.y * 0.3963377774) + p.z * 0.2158037573,
    (p.x - p.y * 0.1055613458) - p.z * 0.0638541728,
    (p.x - p.y * 0.0894841775) - p.z * 1.291485548
  );
  let lms = pow(c, vec3f(3.0));
  return vec3f(
    (lms.x * 4.0767416621 - lms.y * 3.3077115913) + lms.z * 0.2309699292,
    (lms.x * -1.2684380046 + lms.y * 2.6097574011) - lms.z * 0.3413193965,
    (lms.x * -0.0041960863 - lms.y * 0.7034186147) + lms.z * 1.707614701
  );
}`);

const mixOklab = tgpu.fn([d.vec4f, d.vec4f, d.f32], d.vec4f)(`(a: vec4f, b: vec4f, t: f32) -> vec4f {
  let wa = a.w * (1.0 - t);
  let wb = b.w * t;
  let alpha = wa + wb;
  let lab = (rgbToOklab(p3ToSrgb(a.xyz)) * wa + rgbToOklab(p3ToSrgb(b.xyz)) * wb) / max(alpha, 0.001);
  return vec4f(srgbToP3(oklabToRgb(lab)), alpha);
}`).$uses({ rgbToOklab, p3ToSrgb, srgbToP3, oklabToRgb });

const flowingOklab = tgpu.fn([
  d.vec2f, d.vec2f, d.f32, d.f32, d.f32, d.vec4f, d.vec4f, d.vec4f, d.vec4f,
], d.vec4f)(`(uv: vec2f, viewport: vec2f, distortion: f32, seed: f32, time: f32, a: vec4f, b: vec4f, c: vec4f, e: vec4f) -> vec4f {
  let factors = flowingFactors(uv, viewport, distortion, seed, time);
  let ab = mixOklab(a, b, factors.x);
  let ce = mixOklab(c, e, factors.x);
  return flowingCompose(mixOklab(ab, ce, factors.y), factors.z);
}`).$uses({ flowingFactors, flowingCompose, mixOklab });

export const sectionFlowingGradient: GpuShaderDefinition = {
  ...FlowingGradient,
  fragment(params) {
    const { uniforms, ctx } = params;
    const args = [params.uvContext ?? ctx.uv, params.effectiveViewportSize ?? ctx.viewportSize,
      uniforms.distortion, uniforms.seed, params.props.member('_animTime'),
      uniforms.colorA, uniforms.colorB, uniforms.colorC, uniforms.colorD];
    // A local factors value prevents four copies of the noise graph during driver compilation.
    return new ShaderExpression(emit => `${emit.external(flowingOklab, 'flowingOklab')}(${args.map(arg => arg._emit(emit)).join(', ')})`);
  },
};
