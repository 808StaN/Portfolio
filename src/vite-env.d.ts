/// <reference types="vite/client" />

declare module "*?w=1100&format=jpg&quality=95" {
  const src: string;
  export default src;
}

declare module "vanta/dist/vanta.clouds.min" {
  import type * as Three from "three";

  type VantaCloudsEffect = {
    destroy: () => void;
  };

  type VantaCloudsOptions = {
    el: HTMLElement;
    THREE: typeof Three;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    backgroundColor?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunColor?: number;
    sunGlareColor?: number;
    sunlightColor?: number;
    speed?: number;
  };

  export default function CLOUDS(options: VantaCloudsOptions): VantaCloudsEffect;
}
