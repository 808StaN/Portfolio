import { useId } from 'react';
import flyrankSymbol from '../assets/flyrank-symbol.svg';

const journeyPath = 'M130 510 L350 383 Q380 366 410 383 L590 487 Q620 504 650 487 L800 400 Q830 383 800 366 L590 245 Q560 228 590 211 L760 113';

export default function ExperienceScene() {
  const id = `experience-${useId().replace(/:/g, '')}`;

  return (
    <svg className="experience-world" viewBox="0 0 960 660" fill="none" aria-hidden="true">
      <defs>
        <path id={`${id}-route`} d={journeyPath} />
        <linearGradient id={`${id}-ice`} x1="151" y1="530" x2="738" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94C4F4" stopOpacity="0.92" />
          <stop offset="0.32" stopColor="#DCF4FF" stopOpacity="0.88" />
          <stop offset="0.65" stopColor="#83B0EC" stopOpacity="0.82" />
          <stop offset="1" stopColor="#D3F0FF" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={`${id}-ribbon-edge`} x1="450" y1="110" x2="450" y2="552" gradientUnits="userSpaceOnUse">
          <stop stopColor="#71A5E9" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#4778CF" stopOpacity="0.84" />
          <stop offset="1" stopColor="#264F9F" stopOpacity="0.94" />
        </linearGradient>
        <linearGradient id={`${id}-deck`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#E4F7FF" stopOpacity="0.96" />
          <stop offset="0.48" stopColor="#B0D5F7" stopOpacity="0.94" />
          <stop offset="1" stopColor="#6F9DE4" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`${id}-deck-left`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#467BCD" />
          <stop offset="1" stopColor="#244D99" />
        </linearGradient>
        <linearGradient id={`${id}-deck-right`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6B9BE3" />
          <stop offset="1" stopColor="#315CB3" />
        </linearGradient>
        <linearGradient id={`${id}-future-deck`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#D4F2FF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#78A9E9" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#B8E7FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#6594E5" stopOpacity="0.14" />
        </linearGradient>
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
        <linearGradient id={`${id}-backpack`} x1="-34" y1="-64" x2="-11" y2="-31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#72ACF4" />
          <stop offset="0.52" stopColor="#477EDC" />
          <stop offset="1" stopColor="#2A54AA" />
        </linearGradient>
        <linearGradient id={`${id}-trousers`} x1="-13" y1="-28" x2="15" y2="-4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#487AD0" />
          <stop offset="1" stopColor="#244A8B" />
        </linearGradient>
      </defs>

      <g data-journey-parallax="far" opacity="0.64" strokeLinejoin="round">
        <g transform="translate(490 153)">
          <ellipse cx="0" cy="88" rx="69" ry="20" fill="#081E4C" opacity="0.16" />
          <path d="M-62 48 L0 84 L62 48 L62 60 L0 96 L-62 60Z" fill={`url(#${id}-deck-left)`} />
          <path d="M0 84 L62 48 L62 60 L0 96Z" fill={`url(#${id}-deck-right)`} />
          <path d="M0 12 L62 48 L0 84 L-62 48Z" fill={`url(#${id}-deck)`} />
          <path d="M-62 48 L0 84 L62 48" stroke="#C0E4FF" strokeOpacity="0.4" />
          <path d="M-59 22 L-13 49 L33 22 L33 36 L-13 63 L-59 36Z" fill={`url(#${id}-deck-left)`} />
          <path d="M-13 49 L33 22 L33 36 L-13 63Z" fill={`url(#${id}-deck-right)`} />
          <path d="M-13 -5 L33 22 L-13 49 L-59 22Z" fill={`url(#${id}-deck)`} />
          <path d="M-59 22 L-13 49 L33 22" stroke="#D9F2FF" strokeOpacity="0.48" />
          <path d="M-57 -5 L-26 13 L5 -5 L5 9 L-26 27 L-57 9Z" fill={`url(#${id}-deck-left)`} />
          <path d="M-26 13 L5 -5 L5 9 L-26 27Z" fill={`url(#${id}-deck-right)`} />
          <path d="M-26 -23 L5 -5 L-26 13 L-57 -5Z" fill={`url(#${id}-deck)`} stroke="#D9F2FF" strokeOpacity="0.46" />
        </g>
      </g>

      <g fill="#071D4D">
        <use href={`#${id}-route`} transform="translate(0 43)" fill="none" stroke="#071D4D" strokeWidth="69" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
        <ellipse cx="380" cy="454" rx="105" ry="34" opacity="0.15" />
        <ellipse cx="760" cy="184" rx="89" ry="27" opacity="0.13" />
      </g>

      <g strokeLinecap="round" strokeLinejoin="round">
        <use href={`#${id}-route`} transform="translate(0 18)" stroke="#8DB8F3" strokeWidth="66" strokeOpacity="0.42" />
        <use href={`#${id}-route`} transform="translate(0 16)" stroke={`url(#${id}-ribbon-edge)`} strokeWidth="66" />
        <use href={`#${id}-route`} transform="translate(0 7)" stroke={`url(#${id}-ribbon-edge)`} strokeWidth="65" />
        <use href={`#${id}-route`} transform="translate(0 -1)" stroke="#E6F8FF" strokeOpacity="0.7" strokeWidth="65" />
        <use href={`#${id}-route`} stroke={`url(#${id}-ice)`} strokeWidth="62" />
        <use href={`#${id}-route`} transform="translate(0 -12)" stroke="#F1FCFF" strokeWidth="15" strokeOpacity="0.1" />
        <use href={`#${id}-route`} stroke="#F3FBFF" strokeWidth="2.5" strokeOpacity="0.68" strokeDasharray="1 12" />
      </g>

      <g data-journey-checkpoint="flyrank" data-x="380" data-y="375" className="experience-checkpoint experience-checkpoint--flyrank" strokeLinejoin="round">
        <path d="M389 315 L480 368 Q491 374 480 380 L389 433 Q380 438 371 433 L280 380 Q269 374 280 368 L371 315 Q380 310 389 315Z" transform="translate(0 20)" fill={`url(#${id}-deck-left)`} stroke="#90BAEF" strokeOpacity="0.3" />
        <path d="M380 437 Q384 436 389 433 L480 380 Q486 377 486 374 L486 394 Q486 397 480 400 L389 453 Q384 456 380 457Z" fill={`url(#${id}-deck-right)`} />
        <path d="M389 315 L480 368 Q491 374 480 380 L389 433 Q380 438 371 433 L280 380 Q269 374 280 368 L371 315 Q380 310 389 315Z" fill={`url(#${id}-deck)`} />
        <path className="experience-checkpoint-fill" d="M388 325 L464 369 Q473 374 464 379 L388 423 Q380 428 372 423 L296 379 Q287 374 296 369 L372 325 Q380 320 388 325Z" fill="#E5F7FF" opacity="0.16" />
        <path className="experience-checkpoint-outline" d="M389 315 L480 368 Q491 374 480 380 L389 433 Q380 438 371 433 L280 380 Q269 374 280 368 L371 315 Q380 310 389 315Z" stroke="#E5F7FF" strokeWidth="1.5" opacity="0.64" />
        <path d="M287 375 L376 426 Q380 428 384 426 L473 375" stroke="#F1FCFF" strokeOpacity="0.45" />
        <path d="M316 403 L350 383 Q380 366 410 383 L444 403" stroke="#F1FCFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 12" strokeOpacity="0.72" />
        <ellipse cx="380" cy="375" rx="23" ry="13" fill="#4677C7" fillOpacity="0.15" stroke="#F1FCFF" strokeOpacity="0.64" />
        <ellipse cx="380" cy="375" rx="15" ry="8.5" stroke="#F1FCFF" strokeOpacity="0.3" />

        <g transform="matrix(1 0.577 0 1 405 340)">
          <path d="M9 0 L9 10 M53 0 L53 10" stroke="#3760A5" strokeWidth="4" />
          <path d="M3 10 L20 10 M43 10 L60 10" stroke="#D2EDFF" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="4" y="-61" width="64" height="56" rx="5" fill="#6FA1E5" />
          <rect y="-58" width="64" height="56" rx="5" fill={`url(#${id}-panel)`} stroke="#B3DDFF" strokeWidth="1.2" />
          <path d="M1 -44 L63 -44" stroke="#80AFE9" strokeOpacity="0.3" />
          <path d="M9 -51 L13 -51 M20 -51 L39 -51" stroke="#C8E9FF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
          <path d="M19 -36 L12 -30 L19 -24 M44 -36 L51 -30 L44 -24 M35 -38 L28 -22" stroke="#C1EEFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 -13 L35 -13" stroke="#79ABF2" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M41 -13 L51 -13" stroke="#E1F5FF" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.65" />
          <path d="M5 -56 L59 -56" stroke="#E4F7FF" strokeOpacity="0.16" />
        </g>
      </g>

      <g data-journey-checkpoint="next" data-x="760" data-y="113" className="experience-checkpoint experience-checkpoint--next" strokeLinejoin="round">
        <path d="M768 65 L840 107 Q850 113 840 119 L768 161 Q760 166 752 161 L680 119 Q670 113 680 107 L752 65 Q760 60 768 65Z" transform="translate(0 18)" fill={`url(#${id}-deck-left)`} fillOpacity="0.8" stroke="#9BC7F4" strokeOpacity="0.2" />
        <path d="M760 165 Q764 165 768 161 L840 119 Q846 116 846 113 L846 131 Q846 134 840 137 L768 179 Q764 182 760 183Z" fill={`url(#${id}-deck-right)`} fillOpacity="0.8" />
        <path d="M768 65 L840 107 Q850 113 840 119 L768 161 Q760 166 752 161 L680 119 Q670 113 680 107 L752 65 Q760 60 768 65Z" fill={`url(#${id}-future-deck)`} />
        <path className="experience-checkpoint-fill" d="M767 75 L824 108 Q832 113 824 118 L767 151 Q760 155 753 151 L696 118 Q688 113 696 108 L753 75 Q760 71 767 75Z" fill="#DCF4FF" opacity="0.1" />
        <path className="experience-checkpoint-outline" d="M768 65 L840 107 Q850 113 840 119 L768 161 Q760 166 752 161 L680 119 Q670 113 680 107 L752 65 Q760 60 768 65Z" stroke="#E5F7FF" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.52" />
        <path d="M686 114 L756 155 Q760 158 764 155 L834 114" stroke="#DDF5FF" strokeOpacity="0.35" />
        <path d="M716 138 L760 113" stroke="#F1FCFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 12" strokeOpacity="0.65" />
        <ellipse cx="760" cy="113" rx="22" ry="12.5" fill="#A9D8FF" fillOpacity="0.12" stroke="#E8F8FF" strokeOpacity="0.64" />
        <ellipse cx="760" cy="113" rx="14" ry="8" stroke="#E8F8FF" strokeOpacity="0.3" />

        <path d="M798 101 L817 112 L798 123 L779 112Z" fill="#72A2E2" fillOpacity="0.58" stroke="#D4F0FF" strokeOpacity="0.56" />
        <path d="M798 104 L798 111" stroke="#E3F5FF" strokeWidth="2" strokeLinecap="round" />
        <g transform="matrix(1 0.577 0 1 782 96)">
          <path d="M16 -30 L16 7" stroke="#7EA9E4" strokeWidth="5" />
          <path d="M15 -30 L15 6" stroke="#DDF4FF" strokeWidth="1.5" strokeOpacity="0.7" />
          <rect x="3" y="-75" width="34" height="43" rx="10" fill="#6F9FE0" fillOpacity="0.7" />
          <rect y="-72" width="34" height="43" rx="10" fill={`url(#${id}-panel)`} />
          <rect y="-72" width="34" height="43" rx="10" fill={`url(#${id}-glass)`} stroke="#D4F0FF" strokeWidth="1.3" strokeOpacity="0.82" />
          <text x="17" y="-41" textAnchor="middle" fill="#F0FAFF" fontFamily="var(--font-sans)" fontSize="28" fontWeight="500">?</text>
          <path d="M8 -68 L25 -68" stroke="#E5F7FF" strokeLinecap="round" strokeOpacity="0.35" />
        </g>
      </g>

      <g data-journey-parallax="near" opacity="0.8" strokeLinejoin="round">
        <g transform="translate(805 533)">
          <ellipse cx="0" cy="65" rx="72" ry="21" fill="#071D4D" opacity="0.18" />
          <path d="M-62 16 L0 52 L62 16 L62 28 L0 64 L-62 28Z" fill={`url(#${id}-deck-left)`} />
          <path d="M0 52 L62 16 L62 28 L0 64Z" fill={`url(#${id}-deck-right)`} />
          <path d="M0 -20 L62 16 L0 52 L-62 16Z" fill={`url(#${id}-deck)`} />
          <path d="M-62 16 L0 52 L62 16" stroke="#CBEAFF" strokeOpacity="0.55" />
          <path d="M-46 -3 L0 24 L46 -3 L46 11 L0 38 L-46 11Z" fill={`url(#${id}-deck-left)`} />
          <path d="M0 24 L46 -3 L46 11 L0 38Z" fill={`url(#${id}-deck-right)`} />
          <path d="M0 -30 L46 -3 L0 24 L-46 -3Z" fill={`url(#${id}-glass)`} stroke="#BEE5FF" strokeOpacity="0.56" />
          <path d="M-35 -3 L0 17 L35 -3" stroke="#D9F2FF" strokeOpacity="0.2" />
        </g>
      </g>

      <g fill="#EDF8FF" fontFamily="var(--font-sans)" fontSize="10" fontWeight="500" letterSpacing="2.5" textAnchor="middle">
        <text x="130" y="579" fillOpacity="0.58">START</text>
        <text x="760" y="211" fillOpacity="0.66">NEXT CHAPTER</text>
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

          <g className="experience-backpack">
            <path d="M-26 -66 L-26 -70 Q-22 -76 -17 -70 L-16 -65" stroke="#254D95" strokeWidth="3" strokeLinecap="round" />
            <path d="M-30 -65 Q-25 -72 -16 -68 L-9 -62 L-10 -32 Q-18 -26 -28 -32 Q-34 -36 -34 -47Z" fill={`url(#${id}-backpack)`} stroke="#224C98" strokeWidth="1.1" />
            <path d="M-30 -63 Q-34 -60 -34 -50 L-34 -41 Q-33 -35 -29 -33 L-27 -57Z" fill="#254F9E" fillOpacity="0.62" />
            <path d="M-27 -64 Q-22 -67 -17 -63 M-29 -36 Q-22 -32 -16 -35" stroke="#B1D9FF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.64" />
            <path d="M-15 -60 L-15 -40" stroke="#173D83" strokeWidth="1.2" strokeOpacity="0.5" />
            <g data-journey-badge="flyrank" transform="translate(-25 -49)">
              <rect x="-8" y="-8" width="16" height="17" rx="4" fill="#193D82" stroke="#B8DDFF" strokeWidth="0.8" strokeOpacity="0.65" />
              <image href={flyrankSymbol} x="-6" y="-6" width="12" height="12" />
            </g>
            <g data-journey-badge="next" transform="translate(-25 -49)" opacity="0">
              <rect x="-8" y="-8" width="16" height="17" rx="4" fill="#193D82" stroke="#B8DDFF" strokeWidth="0.8" strokeOpacity="0.65" />
              <text x="0" y="5" textAnchor="middle" fill="#EFF9FF" fontFamily="var(--font-sans)" fontSize="14" fontWeight="500">?</text>
            </g>
          </g>

          <path d="M-12 -69 Q-8 -78 1 -77 Q12 -76 15 -67 L9 -59 Q-2 -57 -12 -64Z" fill="#B9CEDA" />
          <path d="M-11 -69 Q-3 -74 8 -69 L16 -62 L14 -47 L17 -28 Q3 -21 -14 -28 L-17 -48 L-18 -59 Q-17 -65 -11 -69Z" fill={`url(#${id}-hoodie)`} />
          <path d="M-11 -68 Q-6 -60 3 -61 L10 -65" stroke="#A9C1D0" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M2 -61 L3 -51 M9 -62 L10 -53" stroke="#7795B4" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M-5 -42 L5 -43 L9 -34 Q2 -30 -6 -34Z" stroke="#B2C9D4" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M-12 -69 C-6 -63 -7 -48 -9 -34" stroke="#376AC3" strokeWidth="5" strokeLinecap="round" />
          <path d="M-12 -68 C-8 -60 -9 -48 -10 -39" stroke="#86B2EC" strokeWidth="1.3" strokeLinecap="round" />
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
