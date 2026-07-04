import riftPick1100 from "../assets/projects/RiftPick.jpg?w=1100&format=jpg&quality=95";
import riftPickOriginal from "../assets/projects/RiftPick.jpg";
import riftPick21100 from "../assets/projects/riftpick2.jpg?w=1100&format=jpg&quality=95";
import riftPick2Original from "../assets/projects/riftpick2.jpg";
import riftPick31100 from "../assets/projects/RiftPick3.jpg?w=1100&format=jpg&quality=95";
import riftPick3Original from "../assets/projects/RiftPick3.jpg";
import otakuVersus1100 from "../assets/projects/OtakuVersus.jpg?w=1100&format=jpg&quality=95";
import otakuVersusOriginal from "../assets/projects/OtakuVersus.jpg";
import otakuVersus21100 from "../assets/projects/OtakuVersus2.jpg?w=1100&format=jpg&quality=95";
import otakuVersus2Original from "../assets/projects/OtakuVersus2.jpg";
import otakuVersus31100 from "../assets/projects/OtakuVersus3.jpg?w=1100&format=jpg&quality=95";
import otakuVersus3Original from "../assets/projects/OtakuVersus3.jpg";
import openStudio1100 from "../assets/projects/OpenStudio.jpg?w=1100&format=jpg&quality=95";
import openStudioOriginal from "../assets/projects/OpenStudio.jpg";
import openStudio21100 from "../assets/projects/openstudio2.jpg?w=1100&format=jpg&quality=95";
import openStudio2Original from "../assets/projects/openstudio2.jpg";
import openStudio31100 from "../assets/projects/openstudio3.jpg?w=1100&format=jpg&quality=95";
import openStudio3Original from "../assets/projects/openstudio3.jpg";
import instaFetch1100 from "../assets/projects/InstaFetch.jpg?w=1100&format=jpg&quality=95";
import instaFetchOriginal from "../assets/projects/InstaFetch.jpg";
import storeManager1100 from "../assets/projects/StoreManager.jpg?w=1100&format=jpg&quality=95";
import storeManagerOriginal from "../assets/projects/StoreManager.jpg";
import type { GlowColor } from "../components/ui/spotlight-card";
import { sectionColors } from "../constants/sectionColors";

export interface ProjectImage {
  src1100: string;
  srcOriginal: string;
}

const projectImage = (
  src1100: string,
  srcOriginal: string,
): ProjectImage => ({ src1100, srcOriginal });

const riftPickImage = projectImage(riftPick1100, riftPickOriginal);
const riftPickImage2 = projectImage(riftPick21100, riftPick2Original);
const riftPickImage3 = projectImage(riftPick31100, riftPick3Original);
const otakuVersusImage = projectImage(otakuVersus1100, otakuVersusOriginal);
const otakuVersusImage2 = projectImage(otakuVersus21100, otakuVersus2Original);
const otakuVersusImage3 = projectImage(otakuVersus31100, otakuVersus3Original);
const openStudioImage = projectImage(openStudio1100, openStudioOriginal);
const openStudioImage2 = projectImage(openStudio21100, openStudio2Original);
const openStudioImage3 = projectImage(openStudio31100, openStudio3Original);
const instaFetchImage = projectImage(instaFetch1100, instaFetchOriginal);
const storeManagerImage = projectImage(storeManager1100, storeManagerOriginal);

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: ProjectImage;
  /** Dodatkowe zdjęcia w galerii (pierwsze = `image`, jeśli nie podane). */
  images?: ProjectImage[];
  secondaryImage?: ProjectImage;
  category: string;
  tags: string[];
  year: string;
  status: 'live' | 'case-study' | 'experimental';
  link?: string;
  linkLabel?: string;
  accent: string;
  color: string;
  glowColor: GlowColor;
  index: string;
  /** false = ukryty w galerii portfolio (dane zostają w pliku). */
  featured?: boolean;
}

export function getProjectImages(project: Project): ProjectImage[] {
  if (project.images?.length) {
    return project.images;
  }
  if (project.secondaryImage && project.secondaryImage !== project.image) {
    return [project.image, project.secondaryImage];
  }
  return [project.image];
}

export const projects: Project[] = [
  {
    id: 'riftpick',
    title: 'RiftPick',
    description:
      'RiftPick is a fantasy platform for League of Legends esports fans. Users can collect player cards by opening packs and crafting, build matchday squads, earn points based on real LEC player performances, and compete on a leaderboard.',
    longDescription:
      'RiftPick is a fantasy platform for League of Legends esports fans. Users can collect player cards by opening packs and crafting, build matchday squads, earn points based on real LEC player performances, and compete on a leaderboard.',
    image: riftPickImage,
    images: [riftPickImage, riftPickImage2, riftPickImage3],
    category: 'Web Application',
    tags: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Clerk',
      'Prisma',
      'Neon PostgreSQL',
    ],
    year: '2026',
    status: 'live',
    link: 'https://riftpick.com',
    linkLabel: 'View App',
    accent: '#c89b3c',
    color: sectionColors.projectRiftPick,
    glowColor: 'riftpick',
    index: '01',
  },
  {
    id: 'openstudio',
    title: 'OpenStudio',
    description:
      'OpenStudio is a browser and desktop DAW built with React, Web Audio API, and Electron. It brings the core beatmaking workflow into one app: browse sounds, build patterns, edit melodies, arrange clips, mix tracks, save projects locally or in the cloud, and export the final track to WAV or MP3.',
    longDescription:
      'Music production workflow with track controls, timeline editing, and cross-platform desktop deployment.',
    image: openStudioImage,
    images: [openStudioImage, openStudioImage2, openStudioImage3],
    category: 'Desktop + Web Tool',
    tags: ['React 19', 'JavaScript', 'Web Audio API', 'Electron', 'Vite', 'AI Agent'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OpenStudio',
    accent: '#14b8a6',
    color: sectionColors.projectOpenStudio,
    glowColor: 'openstudio',
    index: '02',
  },
  {
    id: 'otakuversus',
    title: 'OtakuVersus',
    description:
      'OtakuVersus is a manga-styled anime guessing game with both singleplayer and real-time multiplayer modes. Players identify anime titles from scene images, earn points, and compete in rankings.',
    longDescription:
      'Players identify anime titles from scenes, compete for points, and climb rankings in online matches.',
    image: otakuVersusImage,
    images: [otakuVersusImage, otakuVersusImage2, otakuVersusImage3],
    category: 'Web Application',
    tags: ['React 19', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OtakuVersus',
    accent: '#4f8ef7',
    color: sectionColors.projectOtakuVersus,
    glowColor: 'otakuversus',
    index: '03',
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
    tags: ['JavaScript', 'Chrome Extension', 'Browser APIs', 'DOM Scraping'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/InstaFetch',
    accent: '#f97316',
    color: sectionColors.work,
    glowColor: 'instafetch',
    index: '04',
    featured: false,
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
    tags: ['C# 12', '.NET 8', 'WinForms (MDI)', 'ADO.NET', 'SQL Server', 'Azure SQL'],
    year: '2026',
    status: 'case-study',
    link: 'https://github.com/808StaN/StoreManager',
    accent: '#10b981',
    color: sectionColors.work,
    glowColor: 'storemanager',
    index: '05',
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured !== false);
