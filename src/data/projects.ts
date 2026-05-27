import riftPickImage from "../assets/projects/RiftPick.jpg";
import riftPickImage2 from "../assets/projects/riftpick2.jpg";
import riftPickImage3 from "../assets/projects/RiftPick3.jpg";
import otakuVersusImage from "../assets/projects/OtakuVersus.jpg";
import otakuVersusImage2 from "../assets/projects/OtakuVersus2.jpg";
import otakuVersusImage3 from "../assets/projects/OtakuVersus3.jpg";
import openStudioImage from "../assets/projects/OpenStudio.jpg";
import openStudioImage2 from "../assets/projects/openstudio2.jpg";
import openStudioImage3 from "../assets/projects/openstudio3.jpg";
import instaFetchImage from "../assets/projects/InstaFetch.jpg";
import storeManagerImage from "../assets/projects/StoreManager.jpg";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  /** Dodatkowe zdjęcia w galerii (pierwsze = `image`, jeśli nie podane). */
  images?: string[];
  secondaryImage?: string;
  category: string;
  tags: string[];
  year: string;
  status: 'live' | 'case-study' | 'experimental';
  link?: string;
  linkLabel?: string;
  accent: string;
  index: string;
  /** false = ukryty w galerii portfolio (dane zostają w pliku). */
  featured?: boolean;
}

export function getProjectImages(project: Project): string[] {
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
    index: '05',
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured !== false);
