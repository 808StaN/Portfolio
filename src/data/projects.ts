import riftPickAvifSrcSet from "../assets/projects/RiftPick.jpg?w=640;960;1360&format=avif&as=srcset";
import riftPickWebpSrcSet from "../assets/projects/RiftPick.jpg?w=640;960;1360&format=webp&as=srcset";
import riftPickFallback from "../assets/projects/RiftPick.jpg?w=1360&format=jpg";
import riftPick2AvifSrcSet from "../assets/projects/riftpick2.jpg?w=640;960;1360&format=avif&as=srcset";
import riftPick2WebpSrcSet from "../assets/projects/riftpick2.jpg?w=640;960;1360&format=webp&as=srcset";
import riftPick2Fallback from "../assets/projects/riftpick2.jpg?w=1360&format=jpg";
import riftPick3AvifSrcSet from "../assets/projects/RiftPick3.jpg?w=640;960;1360&format=avif&as=srcset";
import riftPick3WebpSrcSet from "../assets/projects/RiftPick3.jpg?w=640;960;1360&format=webp&as=srcset";
import riftPick3Fallback from "../assets/projects/RiftPick3.jpg?w=1360&format=jpg";
import otakuVersusAvifSrcSet from "../assets/projects/OtakuVersus.jpg?w=640;960;1360&format=avif&as=srcset";
import otakuVersusWebpSrcSet from "../assets/projects/OtakuVersus.jpg?w=640;960;1360&format=webp&as=srcset";
import otakuVersusFallback from "../assets/projects/OtakuVersus.jpg?w=1360&format=jpg";
import otakuVersus2AvifSrcSet from "../assets/projects/OtakuVersus2.jpg?w=640;960;1360&format=avif&as=srcset";
import otakuVersus2WebpSrcSet from "../assets/projects/OtakuVersus2.jpg?w=640;960;1360&format=webp&as=srcset";
import otakuVersus2Fallback from "../assets/projects/OtakuVersus2.jpg?w=1360&format=jpg";
import otakuVersus3AvifSrcSet from "../assets/projects/OtakuVersus3.jpg?w=640;960;1360&format=avif&as=srcset";
import otakuVersus3WebpSrcSet from "../assets/projects/OtakuVersus3.jpg?w=640;960;1360&format=webp&as=srcset";
import otakuVersus3Fallback from "../assets/projects/OtakuVersus3.jpg?w=1360&format=jpg";
import openStudioAvifSrcSet from "../assets/projects/OpenStudio.jpg?w=640;960;1360&format=avif&as=srcset";
import openStudioWebpSrcSet from "../assets/projects/OpenStudio.jpg?w=640;960;1360&format=webp&as=srcset";
import openStudioFallback from "../assets/projects/OpenStudio.jpg?w=1360&format=jpg";
import openStudio2AvifSrcSet from "../assets/projects/openstudio2.jpg?w=640;960;1360&format=avif&as=srcset";
import openStudio2WebpSrcSet from "../assets/projects/openstudio2.jpg?w=640;960;1360&format=webp&as=srcset";
import openStudio2Fallback from "../assets/projects/openstudio2.jpg?w=1360&format=jpg";
import openStudio3AvifSrcSet from "../assets/projects/openstudio3.jpg?w=640;960;1360&format=avif&as=srcset";
import openStudio3WebpSrcSet from "../assets/projects/openstudio3.jpg?w=640;960;1360&format=webp&as=srcset";
import openStudio3Fallback from "../assets/projects/openstudio3.jpg?w=1360&format=jpg";
import instaFetchAvifSrcSet from "../assets/projects/InstaFetch.jpg?w=640;960;1360&format=avif&as=srcset";
import instaFetchWebpSrcSet from "../assets/projects/InstaFetch.jpg?w=640;960;1360&format=webp&as=srcset";
import instaFetchFallback from "../assets/projects/InstaFetch.jpg?w=1360&format=jpg";
import storeManagerAvifSrcSet from "../assets/projects/StoreManager.jpg?w=640;960;1360&format=avif&as=srcset";
import storeManagerWebpSrcSet from "../assets/projects/StoreManager.jpg?w=640;960;1360&format=webp&as=srcset";
import storeManagerFallback from "../assets/projects/StoreManager.jpg?w=1360&format=jpg";
import { sectionColors } from "../constants/sectionColors";

export interface ProjectImage {
  avifSrcSet: string;
  webpSrcSet: string;
  fallback: string;
}

const projectImage = (
  avifSrcSet: string,
  webpSrcSet: string,
  fallback: string,
): ProjectImage => ({ avifSrcSet, webpSrcSet, fallback });

const riftPickImage = projectImage(riftPickAvifSrcSet, riftPickWebpSrcSet, riftPickFallback);
const riftPickImage2 = projectImage(riftPick2AvifSrcSet, riftPick2WebpSrcSet, riftPick2Fallback);
const riftPickImage3 = projectImage(riftPick3AvifSrcSet, riftPick3WebpSrcSet, riftPick3Fallback);
const otakuVersusImage = projectImage(otakuVersusAvifSrcSet, otakuVersusWebpSrcSet, otakuVersusFallback);
const otakuVersusImage2 = projectImage(otakuVersus2AvifSrcSet, otakuVersus2WebpSrcSet, otakuVersus2Fallback);
const otakuVersusImage3 = projectImage(otakuVersus3AvifSrcSet, otakuVersus3WebpSrcSet, otakuVersus3Fallback);
const openStudioImage = projectImage(openStudioAvifSrcSet, openStudioWebpSrcSet, openStudioFallback);
const openStudioImage2 = projectImage(openStudio2AvifSrcSet, openStudio2WebpSrcSet, openStudio2Fallback);
const openStudioImage3 = projectImage(openStudio3AvifSrcSet, openStudio3WebpSrcSet, openStudio3Fallback);
const instaFetchImage = projectImage(instaFetchAvifSrcSet, instaFetchWebpSrcSet, instaFetchFallback);
const storeManagerImage = projectImage(storeManagerAvifSrcSet, storeManagerWebpSrcSet, storeManagerFallback);

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
    index: '01',
  },
  {
    id: 'openstudio',
    title: 'OpenStudio',
    description:
      'Browser + desktop DAW built with React, Web Audio API, and Electron.',
    longDescription:
      'Music production workflow with track controls, timeline editing, and cross-platform desktop deployment.',
    image: openStudioImage,
    images: [openStudioImage, openStudioImage2, openStudioImage3],
    category: 'Desktop + Web Tool',
    tags: ['React 19', 'JavaScript', 'Web Audio API', 'Electron', 'Vite'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OpenStudio',
    accent: '#14b8a6',
    color: sectionColors.projectOpenStudio,
    index: '02',
  },
  {
    id: 'otakuversus',
    title: 'OtakuVersus',
    description:
      'Manga-styled anime guessing game with singleplayer and real-time multiplayer modes.',
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
    index: '05',
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured !== false);
