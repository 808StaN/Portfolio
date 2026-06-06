import { FilmGrain, SolidColor, Shader } from "shaders/react";

type SectionShaderBackgroundProps = {
  color: string;
  grain?: number;
};

export default function SectionShaderBackground({
  color,
  grain = 0.2,
}: SectionShaderBackgroundProps) {
  return (
    <Shader className="shader-preview h-full w-full">
      <SolidColor color={color} />
      <FilmGrain strength={grain} />
    </Shader>
  );
}
