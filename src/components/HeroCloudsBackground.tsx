import { useEffect, useRef } from 'react';

type VantaCloudsEffect = {
  destroy: () => void;
};

export default function HeroCloudsBackground() {
  const cloudsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !cloudsRef.current) return;

    let cancelled = false;
    let effect: VantaCloudsEffect | null = null;

    void Promise.all([
      import('three'),
      import('vanta/dist/vanta.clouds.min'),
    ])
      .then(([THREE, cloudsModule]) => {
        if (cancelled || !cloudsRef.current) return;

        effect = cloudsModule.default({
          el: cloudsRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          backgroundColor: 0xffffff,
          skyColor: 0x68b8d7,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
          speed: 1,
        });
      })
      .catch(() => {
        // Keep Hero usable if the decorative cloud layer fails to load.
      });

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return <div ref={cloudsRef} className="hero-clouds-layer" aria-hidden="true" />;
}
