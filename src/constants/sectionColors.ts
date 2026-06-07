export const sectionColors = {
  home: "#075A9C",
  work: "#0D6673",

  about: "#3A315E",
  stack: "#263A59",
  contact: "#24313D",

  projectRiftPick: "#08162E",
  projectOpenStudio: "#2F7542",
  projectOtakuVersus: "#C81E4F",
} as const;

export type SectionKey = keyof typeof sectionColors;
