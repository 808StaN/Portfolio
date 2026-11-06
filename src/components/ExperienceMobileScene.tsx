import { useId } from 'react';
import flyrankSymbol from '../assets/flyrank-symbol.svg';

const journeyPath = 'M75 140 L75 230 Q75 260 100 285 Q125 310 100 335 L65 370 L65 790 Q65 820 90 845 Q115 870 90 895 L60 925 L60 1390 Q60 1420 85 1445 L105 1465 L105 1670';

export default function ExperienceMobileScene() {
  const id = `experience-mobile-${useId().replace(/:/g, '')}`;

  return (
    <svg className="experience-mobile-world" viewBox="0 0 160 1800" preserveAspectRatio="none" fill="none" overflow="visible" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <defs>
        <path id={`${id}-route`} d={journeyPath} />
      </defs>

      <g>
        <use href={`#${id}-route`} transform="translate(0 10)" stroke="#315CB3" strokeWidth="38" />
        <use href={`#${id}-route`} transform="translate(0 5)" stroke="#6F9DE4" strokeWidth="38" />
        <use href={`#${id}-route`} stroke="#E4F7FF" strokeWidth="40" />
        <use href={`#${id}-route`} stroke="#B0D5F7" strokeWidth="38" />
        <use href={`#${id}-route`} stroke="#F1FCFF" strokeWidth="2.5" strokeDasharray="1 15" />
      </g>

      <g data-journey-checkpoint="flyrank" data-x="65" data-y="390" className="experience-checkpoint experience-checkpoint--flyrank" transform="translate(65 390)">
        <ellipse cx="0" cy="30" rx="43" ry="13" fill="#071D4D" opacity="0.16" />
        <path d="M-42 0 L0 25 L0 36 L-42 11Z" fill="#244D99" />
        <path d="M0 25 L42 0 L42 11 L0 36Z" fill="#467BCD" />
        <path d="M0 -25 L42 0 L0 25 L-42 0Z" fill="#B0D5F7" />
        <path className="experience-checkpoint-fill" d="M0 -19 L32 0 L0 19 L-32 0Z" fill="#E5F7FF" opacity="0.16" />
        <path className="experience-checkpoint-outline" d="M0 -25 L42 0 L0 25 L-42 0Z" stroke="#E5F7FF" strokeWidth="1.5" opacity="0.64" />
        <path d="M-39 2 L0 25 L39 2" stroke="#F1FCFF" strokeOpacity="0.45" />
        <ellipse cx="0" cy="0" rx="16" ry="9" fill="#4677C7" fillOpacity="0.15" stroke="#F1FCFF" strokeOpacity="0.72" />
        <path d="M0 -17 L0 -14 M0 14 L0 17" stroke="#F1FCFF" strokeWidth="2.5" />
      </g>

      <g data-journey-checkpoint="next" data-x="105" data-y="1650" className="experience-checkpoint experience-checkpoint--next" transform="translate(105 1650)">
        <ellipse cx="0" cy="28" rx="40" ry="12" fill="#071D4D" opacity="0.13" />
        <path d="M-39 0 L0 23 L0 33 L-39 10Z" fill="#244D99" />
        <path d="M0 23 L39 0 L39 10 L0 33Z" fill="#467BCD" />
        <path d="M0 -23 L39 0 L0 23 L-39 0Z" fill="#94C4F4" />
        <path className="experience-checkpoint-fill" d="M0 -17 L29 0 L0 17 L-29 0Z" fill="#DCF4FF" opacity="0.1" />
        <path className="experience-checkpoint-outline" d="M0 -23 L39 0 L0 23 L-39 0Z" stroke="#E5F7FF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.52" />
        <ellipse cx="0" cy="0" rx="15" ry="8.5" fill="#A9D8FF" fillOpacity="0.12" stroke="#E8F8FF" strokeOpacity="0.64" />
        <g transform="translate(40 0)">
          <path d="M-9 0 L0 -5 L9 0 L0 5Z" fill="#6F9DE4" stroke="#D4F0FF" strokeOpacity="0.5" />
          <path d="M0 0 L0 -23" stroke="#B0D5F7" strokeWidth="3" />
          <rect x="-10" y="-48" width="20" height="26" rx="6" fill="#203D78" stroke="#D4F0FF" strokeWidth="1.2" />
          <text x="0" y="-29" textAnchor="middle" fill="#F0FAFF" fontFamily="var(--font-sans)" fontSize="18" fontWeight="500">?</text>
        </g>
      </g>

      <path data-journey-path d={journeyPath} opacity="0" pointerEvents="none" />
      <ellipse data-journey-shadow cx="0" cy="0" rx="22" ry="9" transform="translate(75 140)" fill="#102F65" opacity="0.26" />

      <g data-journey-character transform="translate(75 140)">
        {/* Animation pivots: hips (+/-7, -27), shoulders (+/-15, -61). */}
        <g data-journey-leg="left">
          <path d="M-14 -29 L-2 -29 L-5 -16 L-9 -5 L-17 -5 L-14 -17Z" fill="#244A8B" />
          <path d="M-17 -7 L-9 -6 L-3 -2 Q0 0 -4 0 L-19 -1 L-19 -4Z" fill="#EAF3EF" />
          <path d="M-18 -2 L-5 -1" stroke="#5579AB" strokeWidth="1.5" />
        </g>
        <g data-journey-leg="right">
          <path d="M1 -29 L13 -29 L12 -17 L18 -7 L9 -4 L3 -16Z" fill="#487AD0" />
          <path d="M9 -7 L18 -8 L20 -4 L25 -2 Q27 0 22 0 L10 -1Z" fill="#F5F8EF" />
          <path d="M11 -2 L24 -1" stroke="#5579AB" strokeWidth="1.5" />
        </g>

        <g data-journey-body>
          <g data-journey-arm="left">
            <path d="M-17 -65 Q-24 -65 -28 -54 L-34 -38 Q-35 -33 -28 -31 L-23 -35 L-17 -48 L-12 -57Z" fill="#CADAE0" />
            <path d="M-32 -34 L-25 -32 L-25 -26 Q-28 -22 -31 -27Z" fill="#E9C2A4" />
          </g>

          <g className="experience-backpack">
            <path d="M-26 -65 L-26 -69 Q-22 -75 -17 -68" stroke="#254D95" strokeWidth="3" />
            <path d="M-30 -65 Q-25 -71 -16 -67 L-9 -61 L-10 -32 Q-20 -26 -29 -33 Q-34 -37 -34 -47Z" fill="#477EDC" stroke="#224C98" />
            <path d="M-30 -62 L-28 -34 Q-34 -36 -34 -47 L-34 -53Z" fill="#254F9E" />
            <g data-journey-badge="flyrank" transform="translate(-25 -49)">
              <rect x="-8" y="-8" width="16" height="17" rx="4" fill="#193D82" stroke="#B8DDFF" strokeWidth="0.8" />
              <image href={flyrankSymbol} x="-6" y="-6" width="12" height="12" />
            </g>
            <g data-journey-badge="next" transform="translate(-25 -49)" opacity="0">
              <rect x="-8" y="-8" width="16" height="17" rx="4" fill="#193D82" stroke="#B8DDFF" strokeWidth="0.8" />
              <text x="0" y="5" textAnchor="middle" fill="#EFF9FF" fontFamily="var(--font-sans)" fontSize="14" fontWeight="500">?</text>
            </g>
          </g>

          <path d="M-12 -69 Q-7 -78 2 -76 Q12 -75 15 -66 L8 -59 L-12 -63Z" fill="#B9CEDA" />
          <path d="M-11 -69 Q-2 -73 8 -69 L16 -61 L14 -47 L17 -28 Q2 -22 -14 -28 L-17 -48 L-18 -59 Q-17 -65 -11 -69Z" fill="#FFFEF3" />
          <path d="M-11 -68 Q-5 -61 4 -62 L10 -65 M2 -61 L3 -52 M9 -62 L10 -54" stroke="#A9C1D0" strokeWidth="1.3" />
          <path d="M-12 -68 Q-6 -55 -10 -34" stroke="#376AC3" strokeWidth="5" />
          <path d="M-5 -42 L5 -43 L9 -34 Q2 -30 -6 -34Z" stroke="#B2C9D4" strokeWidth="1.2" />

          <g data-journey-arm="right">
            <path d="M12 -64 Q23 -65 25 -52 L21 -36 Q17 -32 12 -37 L15 -51 L9 -57Z" fill="#EDF3EE" />
            <path d="M15 -36 L22 -36 L24 -30 Q23 -25 19 -26 L16 -30Z" fill="#F1CEAE" />
            <path d="M13 -38 L22 -35" stroke="#B9CFDD" strokeWidth="2" />
          </g>

          <path d="M-4 -81 L8 -79 L8 -69 Q2 -65 -4 -71Z" fill="#E7B997" />
          <path d="M-10 -99 Q1 -107 14 -99 L16 -93 L20 -88 Q21 -85 17 -84 L15 -78 Q10 -72 3 -75 L-5 -80 L-11 -90Z" fill="#F8DFC6" />
          <path d="M-13 -88 Q-18 -105 -3 -107 Q12 -110 19 -99 Q22 -93 10 -95 L3 -99 L-3 -93 L-4 -84 L-9 -82Z" fill="#142744" />
          <path d="M-5 -91 Q-11 -94 -10 -87 Q-9 -82 -5 -83Z" fill="#E7B997" />
          <path d="M12 -93 L12 -91" stroke="#25344C" strokeWidth="2.2" />
          <path d="M11 -81 Q14 -80 16 -82" stroke="#AA745F" strokeWidth="1.2" />
        </g>
      </g>
    </svg>
  );
}
