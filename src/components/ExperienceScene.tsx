import { useId, type ReactNode } from 'react';
import flyrankWordmark from '../assets/flyrank-wordmark.svg';

const journeyPath = 'M130 510 L350 383 Q380 366 410 383 L590 487 Q620 504 650 487 L800 400 Q830 383 800 366 L590 245 Q560 228 590 211 L880 44';

function RoadsideBillboard({ x, y, panel, children }: { x: number; y: number; panel: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
      <g transform="matrix(1 -0.577 0 1 0 0)">
        <path d="M22 -6 V46 M88 -6 V46" stroke="#254D91" strokeWidth="7" />
        <path d="M20 -6 V45 M86 -6 V45" stroke="#8EB6E8" strokeWidth="2" />
        <path d="M22 19 H88" stroke="#527BB4" strokeWidth="3" />
        <path d="M14 46 H30 M80 46 H96" stroke="#9CC2EB" strokeWidth="3" strokeLinecap="round" />
        <rect x="4" y="-76" width="110" height="80" rx="4" fill="#3C65A0" />
        <rect y="-80" width="110" height="80" rx="4" fill={panel} stroke="#A6CCF1" strokeWidth="1.5" />
        <rect className="experience-checkpoint-fill" x="4" y="-76" width="102" height="72" rx="2" fill="#426FAE" opacity="0.16" />
        <rect className="experience-checkpoint-outline" y="-80" width="110" height="80" rx="4" stroke="#E3F3FF" strokeWidth="1.5" opacity="0.5" />
        <path d="M7 -74 H103" stroke="#E3F3FF" strokeOpacity="0.3" />
        {children}
      </g>
    </g>
  );
}

export default function ExperienceScene() {
  const id = `experience-${useId().replace(/:/g, '')}`;

  return (
    <svg className="experience-world" viewBox="0 0 960 660" fill="none" aria-hidden="true">
      <defs>
        <path id={`${id}-route`} d={journeyPath} />
        <linearGradient id={`${id}-pavement`} x1="130" y1="510" x2="880" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8DA4C2" />
          <stop offset="0.5" stopColor="#A6B9D2" />
          <stop offset="1" stopColor="#97ADCA" />
        </linearGradient>
        <pattern id={`${id}-pavement-grain`} width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="0.5" fill="#E9F0F7" opacity="0.2" />
          <circle cx="9" cy="10" r="0.6" fill="#6D85A5" opacity="0.12" />
        </pattern>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#203D78" />
          <stop offset="1" stopColor="#102950" />
        </linearGradient>
        <linearGradient id={`${id}-hoodie`} x1="-18" y1="-65" x2="18" y2="-26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFEF3" />
          <stop offset="0.58" stopColor="#EDF3EE" />
          <stop offset="1" stopColor="#B9CFDD" />
        </linearGradient>
        <linearGradient id={`${id}-skin`} x1="-10" y1="-95" x2="19" y2="-79" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8DFC6" />
          <stop offset="1" stopColor="#E7B997" />
        </linearGradient>
        <linearGradient id={`${id}-trousers`} x1="-13" y1="-28" x2="15" y2="-4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#487AD0" />
          <stop offset="1" stopColor="#244A8B" />
        </linearGradient>
      </defs>

      <g strokeLinecap="round" strokeLinejoin="round">
        <use href={`#${id}-route`} transform="translate(0 2)" stroke="#718BAE" strokeWidth="74" />
        <use href={`#${id}-route`} stroke="#D4E0ED" strokeWidth="74" />
        <use href={`#${id}-route`} stroke={`url(#${id}-pavement)`} strokeWidth="72" />
        <use href={`#${id}-route`} stroke={`url(#${id}-pavement-grain)`} strokeWidth="72" />
        <use href={`#${id}-route`} stroke="#F0F5FA" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="10 26" />
      </g>

      <g data-journey-checkpoint="flyrank" data-x="235" data-y="449" className="experience-checkpoint experience-checkpoint--flyrank">
        <RoadsideBillboard x={170} y={375} panel={`url(#${id}-panel)`}>
          <image href={flyrankWordmark} x="10" y="-55" width="90" height="30" />
        </RoadsideBillboard>
      </g>

      <g data-journey-checkpoint="next" data-x="725" data-y="133" className="experience-checkpoint experience-checkpoint--next">
        <RoadsideBillboard x={760} y={165} panel={`url(#${id}-panel)`}>
          <text x="55" y="-22" textAnchor="middle" fill="#F0FAFF" fontFamily="var(--font-sans)" fontSize="54" fontWeight="500">?</text>
        </RoadsideBillboard>
      </g>

      <path data-journey-path d={journeyPath} opacity="0" pointerEvents="none" />

      <ellipse data-journey-shadow cx="0" cy="0" rx="22" ry="10" transform="translate(130 510)" fill="#102F65" opacity="0.26" />

      <g data-journey-character transform="translate(130 510)">
        {/* Limbs share character coordinates; hips are at (+/-7, -27). */}
        <g data-journey-leg="left">
          <path d="M-15 -29 L-3 -28 L-5 -15 L-8 -5 L-16 -5 L-14 -17Z" fill={`url(#${id}-trousers)`} />
          <path d="M-12 -17 L-6 -16 M-14 -8 L-9 -7" stroke="#83A9E3" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
          <path d="M-17 -8 L-9 -7 L-5 -4 L-1 -3 Q1 0 -4 0 L-18 -1 Q-21 -3 -18 -5Z" fill="#EAF3EF" />
          <path d="M-19 -2 L-4 -1" stroke="#5579AB" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g data-journey-leg="right">
          <path d="M-3 -29 L10 -29 L10 -17 L16 -7 L8 -3 L1 -16Z" fill={`url(#${id}-trousers)`} />
          <path d="M6 -17 L10 -18 M10 -7 L15 -9" stroke="#9DBCE7" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6" />
          <path d="M8 -7 L16 -9 L18 -5 L24 -2 Q26 0 21 0 L9 -1 Q6 -3 8 -7Z" fill="#F5F8EF" />
          <path d="M10 -2 L23 -1" stroke="#5579AB" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 -5 L19 -4" stroke="#B5CBDB" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        <g data-journey-body>
          <g data-journey-arm="left">
            <path d="M-17 -65 Q-24 -65 -28 -54 L-33 -39 Q-34 -33 -27 -31 L-22 -34 L-17 -47 L-12 -57Z" fill="#CADAE0" />
            <path d="M-30 -33 L-24 -32 L-23 -26 Q-24 -22 -28 -24 L-32 -29Z" fill="#E9C2A4" />
            <path d="M-32 -36 L-25 -33" stroke="#F2F6EC" strokeWidth="2" strokeLinecap="round" />
          </g>

          <path d="M-12 -69 Q-8 -78 1 -77 Q12 -76 15 -67 L9 -59 Q-2 -57 -12 -64Z" fill="#B9CEDA" />
          <path d="M-11 -69 Q-3 -74 8 -69 L16 -62 L14 -47 L17 -28 Q3 -21 -14 -28 L-17 -48 L-18 -59 Q-17 -65 -11 -69Z" fill={`url(#${id}-hoodie)`} />
          <path d="M-11 -68 Q-6 -60 3 -61 L10 -65" stroke="#A9C1D0" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M2 -61 L3 -51 M9 -62 L10 -53" stroke="#7795B4" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M-5 -42 L5 -43 L9 -34 Q2 -30 -6 -34Z" stroke="#B2C9D4" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M-12 -28 Q2 -24 15 -29" stroke="#94B0C4" strokeWidth="1.4" strokeLinecap="round" />

          <g data-journey-arm="right">
            <path d="M11 -64 C20 -65 25 -55 23 -47 L20 -36 Q18 -32 13 -35 L10 -39 L14 -50 L9 -57Z" fill={`url(#${id}-hoodie)`} />
            <path d="M15 -36 L21 -36 L23 -31 Q24 -27 20 -25 Q16 -24 15 -29Z" fill="#F1CEAE" />
            <path d="M12 -38 L21 -35" stroke="#FCFDF2" strokeWidth="3" strokeLinecap="round" />
            <path d="M19 -55 Q22 -51 19 -45" stroke="#B8CDD6" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          <path d="M-4 -81 L8 -80 L8 -69 Q2 -64 -4 -71Z" fill="#E8BC9C" />
          <path d="M-4 -80 L8 -78 L8 -73 Q1 -73 -4 -77Z" fill="#CD987C" fillOpacity="0.46" />
          <path d="M-10 -99 C-5 -106 9 -105 14 -99 L16 -93 L20 -88 Q21 -85 17 -84 L15 -78 Q10 -72 3 -75 L-5 -80 L-11 -90Z" fill={`url(#${id}-skin)`} />
          <path d="M-13 -88 C-17 -98 -12 -108 -2 -107 C5 -112 18 -106 19 -99 Q22 -93 10 -95 L3 -99 L-3 -93 L-4 -84 L-9 -82Z" fill="#142744" />
          <path d="M-10 -101 Q-2 -108 9 -103" stroke="#486482" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.55" />
          <path d="M-5 -91 Q-11 -94 -10 -87 Q-9 -82 -5 -83Z" fill="#F0C9AA" />
          <path d="M-7 -89 L-6 -86" stroke="#CB997E" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9 -96 L13 -95" stroke="#384057" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12 -92 L12 -90" stroke="#25344C" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 -81 Q14 -80 16 -82" stroke="#AA745F" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
