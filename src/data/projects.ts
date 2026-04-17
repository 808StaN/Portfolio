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
    id: 'otakuversus',
    title: 'OtakuVersus',
    description:
      'Manga-styled anime guessing game with singleplayer and real-time multiplayer modes.',
    longDescription:
      'Players identify anime titles from scenes, compete for points, and climb rankings in online matches.',
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    category: 'Web Application',
    tags: ['TypeScript', 'Realtime', 'Game Logic', 'Vercel'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OtakuVersus',
    accent: '#4f8ef7',
    index: '01',
  },
  {
    id: 'openstudio',
    title: 'OpenStudio',
    description:
      'Browser + desktop DAW built with React, Web Audio API, and Electron.',
    longDescription:
      'Music production workflow with track controls, timeline editing, and cross-platform desktop deployment.',
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    category: 'Desktop + Web Tool',
    tags: ['JavaScript', 'React', 'Web Audio API', 'Electron'],
    year: '2026',
    status: 'live',
    link: 'https://github.com/808StaN/OpenStudio',
    accent: '#14b8a6',
    index: '02',
  },
  {
    id: 'instafetch',
    title: 'InstaFetch',
    description:
      'Chrome extension that downloads Instagram profile images and posts as ZIP files.',
    longDescription:
      'Lightweight extension focused on quick export flow and clean UX for photos and video assets.',
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
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
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    category: 'Desktop Application',
    tags: ['C#', '.NET', 'Desktop App', 'Database'],
    year: '2026',
    status: 'case-study',
    link: 'https://github.com/808StaN/StoreManager',
    accent: '#10b981',
    index: '04',
  },
  {
    id: 'd2r-players-switch',
    title: 'D2R Players QuickSwitch',
    description:
      'D2RMM mod mapping /players 1-8 to key presses for Diablo II: Resurrected offline mode.',
    longDescription:
      'Quality-of-life mod that removes command typing and enables instant difficulty scaling in gameplay.',
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    category: 'Game Modding',
    tags: ['JavaScript', 'Game Modding', 'D2RMM', 'Automation'],
    year: '2026',
    status: 'experimental',
    link: 'https://github.com/808StaN/D2R-PlayersQuickSwitch',
    accent: '#ec4899',
    index: '05',
  },
  {
    id: 'zen-macos-icons',
    title: 'Zen Browser macOS Icons',
    description:
      'macOS-style titlebar controls theme for Zen Browser.',
    longDescription:
      'Focused CSS customization package recreating close/minimize/maximize controls with a native macOS feel.',
    image: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    secondaryImage: 'https://raw.githubusercontent.com/808StaN/OtakuVersus/master/docs/readme-images/front_page.png',
    category: 'UI Theming',
    tags: ['CSS', 'Theming', 'Zen Browser', 'UI Customization'],
    year: '2025',
    status: 'experimental',
    link: 'https://github.com/808StaN/zenBrowser_MacOS_Icons',
    accent: '#f59e0b',
    index: '06',
  },
];
