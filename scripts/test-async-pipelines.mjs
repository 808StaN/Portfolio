import assert from 'node:assert/strict';
import tgpu, { common } from 'typegpu';
import * as d from 'typegpu/data';

globalThis.GPUBufferUsage = { COPY_SRC: 4, COPY_DST: 8, UNIFORM: 64, STORAGE: 128 };
const optIn = Symbol.for('shaders.asyncPipelineCompilation');

function fixture(kind, { enabled = true, available = true } = {}) {
  const calls = { sync: 0, async: 0, modules: 0 };
  let resolve;
  let reject;
  const compilation = new Promise((yes, no) => { resolve = yes; reject = no; });
  const nativePipeline = { kind };
  const device = {
    features: new Set(), limits: {},
    [optIn]: enabled,
    createShaderModule: descriptor => { calls.modules++; return descriptor; },
    createPipelineLayout: descriptor => descriptor,
    [`create${kind}Pipeline`]: () => { calls.sync++; return nativePipeline; },
    ...(available ? {
      [`create${kind}PipelineAsync`]: () => { calls.async++; return compilation; },
    } : {}),
  };
  const root = tgpu.initFromDevice({ device });
  const pipeline = kind === 'Compute'
    ? root.createComputePipeline({ compute: tgpu.computeFn({ workgroupSize: [1] })('{}') })
    : root.createRenderPipeline({
        vertex: common.fullScreenTriangle,
        fragment: tgpu.fragmentFn({ out: d.vec4f })('{ return vec4f(1.0); }'),
        targets: { format: 'rgba8unorm' },
      });
  return { unwrap: () => root.unwrap(pipeline), pipeline, calls, resolve, reject, nativePipeline };
}

function pending(unwrap) {
  try { unwrap(); } catch (error) {
    assert(error instanceof Promise, 'Cold compilation must signal a pending promise');
    return error;
  }
  assert.fail('An unfinished pipeline must not be returned');
}

for (const kind of ['Render', 'Compute']) {
  const async = fixture(kind);
  const preparation = pending(async.unwrap);
  assert.equal(pending(async.unwrap), preparation, 'Concurrent frames must reuse compilation');
  assert.deepEqual(async.calls, { sync: 0, async: 1, modules: 1 });
  async.resolve(async.nativePipeline);
  await preparation;
  assert.equal(async.unwrap(), async.nativePipeline);
  assert.equal(async.unwrap(), async.nativePipeline, 'Warm frames must reuse the native pipeline');
  assert.deepEqual(async.calls, { sync: 0, async: 1, modules: 1 });

  const failed = fixture(kind);
  const failure = pending(failed.unwrap);
  failed.reject(new Error('Pipeline compilation failed'));
  await assert.rejects(failure, /Pipeline compilation failed/);
  assert.equal(pending(failed.unwrap), failure, 'A failed pipeline must not retry indefinitely');
  assert.equal(failed.calls.async, 1);

  for (const options of [{ enabled: false }, { available: false }]) {
    const sync = fixture(kind, options);
    assert.equal(sync.unwrap(), sync.nativePipeline);
    assert.equal(sync.unwrap(), sync.nativePipeline);
    assert.deepEqual(sync.calls, { sync: 1, async: 0, modules: 1 });
  }
  console.log(`PASS ${kind}: async preparation, concurrent/warm reuse, rejection, opt-out and API fallback`);
}

const external = fixture('Compute');
let begun = 0;
let ended = 0;
const encoder = {
  beginRenderPass() {},
  beginComputePass() {
    begun++;
    return { setPipeline() {}, dispatchWorkgroups() {}, end() { ended++; } };
  },
};
const dispatch = () => external.pipeline.with(encoder).dispatchWorkgroups(1);
const preparation = pending(dispatch);
assert.equal(begun, 0, 'Preparation must finish before beginning an external encoder pass');
external.resolve(external.nativePipeline);
await preparation;
dispatch();
assert.equal(begun, 1);
assert.equal(ended, 1, 'Every external encoder pass must be closed');
console.log('PASS Compute: async preparation does not leave an external encoder pass open');
