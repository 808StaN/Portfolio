import otakuVersusImage from "../assets/projects/OtakuVersus.png";
import openStudioImage from "../assets/projects/OpenStudio.gif";
import instaFetchImage from "../assets/projects/InstaFetch.png";
import storeManagerImage from "../assets/projects/StoreManager.png";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  secondaryImage?: string;
  category: string;
  tags: string[];
  year: string;
  status: 'live' | 'case-study' | 'experimental';
  link?: string;
  accent: string;
  index: string;
}

export const projects: Project[] = [
  {
    id: 'openstudio',
    title: 'OpenStudio',
    description:
      'Browser + desktop DAW built with React, Web Audio API, and Electron.',
    longDescription:
      'Music production workflow with track controls, timeline editing, and cross-platform desktop deployment.',
    image: openStudioImage,
    secondaryImage: openStudioImage,
    category: 'Desktop + Web Tool',
    tags: ['JavaScript', 'React', 'Web Audio API', 'Electron'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OpenStudio',
    accent: '#14b8a6',
    index: '01',
  },
  {
    id: 'otakuversus',
    title: 'OtakuVersus',
    description:
      'Manga-styled anime guessing game with singleplayer and real-time multiplayer modes.',
    longDescription:
      'Players identify anime titles from scenes, compete for points, and climb rankings in online matches.',
    image: otakuVersusImage,
    secondaryImage: otakuVersusImage,
    category: 'Web Application',
    tags: ['TypeScript', 'Realtime', 'Game Logic', 'Vercel'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OtakuVersus',
    accent: '#4f8ef7',
    index: '02',
  },
  {
    id: 'instafetch',
    title: 'InstaFetch',
    description:
      'Chrome extension that downloads Instagram profile images and posts as ZIP files.',
    longDescription:
      'Lightweight extension focused on quick export flow and clean UX for photos and video assets.',
    image: instaFetchImage,
    secondaryImage: instaFetchImage,
    category: 'Browser Extension',
    tags: ['JavaScript', 'Chrome Extension', 'ZIP', 'Browser APIs'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/InstaFetch',
    accent: '#f97316',
    index: '03',
  },
  {
    id: 'storemanager',
    title: 'StoreManager',
    description:
      'Desktop application for managing clothing and footwear store inventory data.',
    longDescription:
      'CRUD-heavy desktop workflow designed for operational tasks such as stock updates and catalog management.',
    image: storeManagerImage,
    secondaryImage: storeManagerImage,
    category: 'Desktop Application',
    tags: ['C#', '.NET', 'Desktop App', 'Database'],
    year: '2026',
    status: 'case-study',
    link: 'https://github.com/808StaN/StoreManager',
    accent: '#10b981',
    index: '04',
  },
];
