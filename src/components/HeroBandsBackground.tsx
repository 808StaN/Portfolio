import { useReducedMotion } from 'framer-motion';
import { BarShift, BlueNoise, FlowingGradient, GridDistortion, Shader } from 'shaders/react';

export default function HeroBandsBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="hero-bands-layer" aria-hidden="true">
      {prefersReducedMotion === false && (
        <Shader className="hero-bands-canvas" disableTelemetry>
          <GridDistortion gridSize={36} intensity={5} decay={10} radius={0.5} edges="transparent">
          <BarShift count={6} intensity={0.1} angle={0} edges="mirror">
            <BarShift count={6} intensity={0.1} angle={90} edges="mirror">
            
              <FlowingGradient
                colorA="#0D3B90"
                colorB="#1756D9"
                colorC="#3B78F2"
                colorD="#6E9FF4"
                colorSpace="hsl"
                speed={1.6}
                distortion={0.15}
              />
            
          </BarShift>
          </BarShift>
          </GridDistortion>
          <BlueNoise opacity={0.25} contrast={-0.2} balance={0} blendMode="overlay" />
        </Shader>
      )}
    </div>
  );
}
