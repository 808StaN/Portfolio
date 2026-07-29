import {
  ChromaFlow,
  CursorRipples,
  DotGrid,
  FilmGrain,
  LinearGradient,
  Shader,
} from "shaders/react";

export default function ServicesHeroTrail() {
  return (
    <div className="services-hero-shader" aria-hidden="true">
      <Shader
        className="services-hero-shader-canvas"
        disableTelemetry
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <DotGrid
          id="trailDots"
          density={40}
          dotSize={{
            type: "map",
            source: "trailFlow",
            channel: "alpha",
            inputMax: 1,
            inputMin: 0,
            outputMax: 1,
            outputMin: 0,
          }}
          twinkle={0.9}
          visible={false}
        />
        <ChromaFlow
          id="trailFlow"
          intensity={1.4}
          radius={2.9}
          baseColor="#0D3B90"
          upColor="#9FC5FF"
          downColor="#4F8EF7"
          leftColor="#08265C"
          rightColor="#DDEBFF"
          visible={false}
        />
        <LinearGradient
          colorA="#0D3B90"
          colorB="#071931"
          colorSpace="hsl"
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 1 }}
        />
        <LinearGradient
          colorA="#08265C"
          colorB="#DDEBFF"
          colorSpace="hsl"
          end={{ x: 1, y: 0 }}
          maskSource="trailDots"
          start={{ x: 0, y: 1 }}
        />
        <CursorRipples />
        <FilmGrain strength={0.03} />
      </Shader>
    </div>
  );
}
