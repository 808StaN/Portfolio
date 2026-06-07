export const sectionColors = {
  home: "#F4793A",
  work: "#4655D9",
  about: "#6D4FD6",
  stack: "#287CA8",
  contact: "#1F5F87",
  projectRiftPick: "#4A5BD9",
  projectOpenStudio: "#5B4FD6",
  projectOtakuVersus: "#6D5FD6",
} as const;

export type SectionKey = keyof typeof sectionColors;
