/// <reference types="vite/client" />

declare module "*?w=640;960;1360&format=avif&as=srcset" {
  const srcset: string;
  export default srcset;
}

declare module "*?w=640;960;1360&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}

declare module "*?w=1360&format=jpg" {
  const src: string;
  export default src;
}
