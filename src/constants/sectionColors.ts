export const sectionColors = {
  home: "#0D3B90",
  work: "#075A9C",

  about: "#3A315E",
  stack: "#263A59",
  contact: "#24313D",

  projectRiftPick: "#08162E",
  projectOpenStudio: "#2F7542",
  projectOtakuVersus: "#E11955",
} as const;

export type SectionKey = keyof typeof sectionColors;

export const sectionShaderPalettes = {
  home: ['#0D3B90', '#1756D9', '#3B78F2', '#6E9FF4'],
  projectRiftPick: ['#08162E', '#102745', '#193B5D', '#2C5377'],
  projectOpenStudio: ['#173D28', '#245837', '#2F7542', '#488556'],
  projectOtakuVersus: ['#450B21', '#850F36', '#BA1247', '#E11955'],
  about: ['#241E3D', '#3A315E', '#4B3D70', '#665482'],
  stack: ['#16263D', '#263A59', '#334F6F', '#466681'],
  contact: ['#17232D', '#24313D', '#304653', '#42606A'],
} as const;

export type ShaderPalette = keyof typeof sectionShaderPalettes;
