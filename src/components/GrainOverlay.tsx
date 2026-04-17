import { useEffect, useRef } from 'react';

export default function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d', { alpha: true });
    if (!noiseCtx) return;

    const drawStaticNoise = () => {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Slightly larger grain by rendering low-res noise and scaling up.
      const noiseWidth = Math.max(64, Math.floor(width / 2));
      const noiseHeight = Math.max(64, Math.floor(height / 2));
      noiseCanvas.width = noiseWidth;
      noiseCanvas.height = noiseHeight;

      const img = noiseCtx.createImageData(noiseWidth, noiseHeight);
      const data = img.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 36;
      }

      noiseCtx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
    };

    drawStaticNoise();
    window.addEventListener('resize', drawStaticNoise);

    return () => {
      window.removeEventListener('resize', drawStaticNoise);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        opacity: 0.22,
      }}
    />
  );
}
