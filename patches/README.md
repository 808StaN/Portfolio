# Async WebGPU Pipeline Compilation

Chromium can block its compositor behind cold synchronous WebGPU pipeline
compilation, freezing the loader text partway through its opacity animation.
These patches opt the shader renderer into native asynchronous render and compute
pipeline creation without delaying application startup or changing the shaders.

- `shaders@3.0.445` adds `asyncPipelineCompilation` to initialization. Its shared
  device opts in through `Symbol.for("shaders.asyncPipelineCompilation")`.
- `typegpu@0.11.9` caches each pending compilation and signals it with its promise.
  The renderer waits and retries the frame, instead of drawing an unfinished
  pipeline or treating preparation as a rendering failure.
- Only Chromium opts in, in `SectionShaderCanvas.tsx`. Other browsers and devices
  without asynchronous pipeline creation retain the synchronous path.
- Pipeline rejection still follows the existing renderer failure/fallback path.

`npm install` and `npm ci` apply the patches through `postinstall`. Keep both
versions pinned until an upstream renderer provides an equivalent preparation
path. On upgrades, revalidate both render and compute compilation, GPU failure,
cold and warm startup, Firefox, and scroll/navigation transitions before removing
or updating the patches.

Run `npm run test:gpu-startup` to verify cold preparation, concurrent and warm
reuse, rejected compilation, opt-out, and missing-API fallback for both pipeline
types without requiring a GPU.
