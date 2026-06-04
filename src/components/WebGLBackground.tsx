import {
  FilmGrain,
  SolidColor,
  Shader,
} from "shaders/react";

export default function WebGLBackground() {
  return (
    <Shader className="shader-preview h-full w-full">
      
      <SolidColor
       color="#1C2746"/>
       
          
      <FilmGrain strength={0.00} />
    </Shader>
  );
}
