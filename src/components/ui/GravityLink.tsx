import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion';

type GravityIcon = 'none' | 'arrow-right' | 'arrow-up-right' | 'chevron-right' | 'plus' | 'sparkle' | 'lightning' | 'star';
type GravityVariant = 'primary' | 'secondary' | 'project';

type GravityColors = {
  background: string;
  backgroundHover: string;
  border: string;
  text: string;
  shadow: string;
};

type GravitySizing = {
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  fontSize?: number;
};

type GravityEffects = {
  magneticStrength?: number;
  textReveal?: boolean;
};

type GravityLinkProps = Omit<HTMLMotionProps<'a'>, 'children'> & {
  text: string;
  variant?: GravityVariant;
  icon?: GravityIcon;
  iconPosition?: 'left' | 'right';
  colors?: Partial<GravityColors>;
  effects?: GravityEffects;
  sizing?: GravitySizing;
  fontFamily?: string;
};

const variantColors: Record<GravityVariant, GravityColors> = {
  primary: {
    background: 'rgba(255, 255, 255, 0.08)',
    backgroundHover: 'rgba(255, 255, 255, 0.13)',
    border: 'rgba(255, 255, 255, 0.42)',
    text: '#f8fbff',
    shadow: 'rgba(255, 255, 255, 0.07)',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.035)',
    backgroundHover: 'rgba(255, 255, 255, 0.075)',
    border: 'rgba(255, 255, 255, 0.24)',
    text: 'rgba(255, 255, 255, 0.86)',
    shadow: 'rgba(255, 255, 255, 0.045)',
  },
  project: {
    background: 'rgba(255, 255, 255, 0.04)',
    backgroundHover: 'rgba(255, 255, 255, 0.085)',
    border: 'rgba(255, 255, 255, 0.25)',
    text: 'rgba(244, 249, 255, 0.9)',
    shadow: 'rgba(255, 255, 255, 0.045)',
  },
};

function IconSvg({ name, size = 16, color = 'currentColor' }: { name: GravityIcon; size?: number; color?: string }) {
  if (name === 'none') return null;

  const common = {
    width: size,
    height: size,
    display: 'block',
    flexShrink: 0,
  };

  switch (name) {
    case 'arrow-right':
      return (
        <svg style={common} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg style={common} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg style={common} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'plus':
      return (
        <svg style={common} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg style={common} viewBox="0 0 24 24" fill={color} aria-hidden="true">
          <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" />
        </svg>
      );
    case 'lightning':
      return (
        <svg style={common} viewBox="0 0 24 24" fill={color} aria-hidden="true">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      );
    case 'star':
      return (
        <svg style={common} viewBox="0 0 24 24" fill={color} aria-hidden="true">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      );
    default:
      return null;
  }
}

function RollingText({ text, isHovered, enabled, fontSize }: { text: string; isHovered: boolean; enabled: boolean; fontSize: number }) {
  if (!enabled) return <span>{text}</span>;

  const lineHeight = fontSize * 1.4;

  return (
    <span style={{ display: 'inline-flex', height: lineHeight, lineHeight: `${lineHeight}px`, overflow: 'hidden' }}>
      {text.split('').map((char, i) => (
        <span
          key={`${i}-${char}`}
          style={{
            display: 'inline-block',
            position: 'relative',
            width: char === ' ' ? fontSize * 0.3 : 'auto',
            transform: isHovered ? `translateY(-${lineHeight}px)` : 'translateY(0)',
            transition: `transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.025}s`,
          }}
        >
          <span style={{ display: 'block', height: lineHeight }}>{char === ' ' ? '\u00A0' : char}</span>
          <span style={{ display: 'block', height: lineHeight }}>{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ))}
    </span>
  );
}

export default function GravityLink({
  text,
  variant = 'primary',
  icon = 'arrow-right',
  iconPosition = 'right',
  colors,
  effects,
  sizing,
  fontFamily,
  style,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: GravityLinkProps) {
  const palette = { ...variantColors[variant], ...colors };
  const magneticStrength = effects?.magneticStrength ?? 0.28;
  const textReveal = effects?.textReveal ?? true;
  const paddingX = sizing?.paddingX ?? 24;
  const paddingY = sizing?.paddingY ?? 12;
  const borderRadius = sizing?.borderRadius ?? 999;
  const fontSize = sizing?.fontSize ?? 14;
  const buttonFont = fontFamily || 'var(--font-sans)';
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLAnchorElement | null>(null);
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const springX = useSpring(magnetX, { stiffness: 150, damping: 15, mass: 0.5 });
  const springY = useSpring(magnetY, { stiffness: 150, damping: 15, mass: 0.5 });

  const handleMouseMove = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    onMouseMove?.(event);
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    magnetX.set((event.clientX - centerX) * magneticStrength);
    magnetY.set((event.clientY - centerY) * magneticStrength);

  }, [magneticStrength, magnetX, magnetY, onMouseMove]);

  const handleMouseEnter = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(event);
    setIsHovered(true);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    onMouseLeave?.(event);
    setIsHovered(false);
    magnetX.set(0);
    magnetY.set(0);
  }, [magnetX, magnetY, onMouseLeave]);

  return (
    <motion.a
      ref={containerRef}
      style={{
        ...style,
        x: springX,
        y: springY,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius,
        overflow: 'visible',
        isolation: 'isolate',
        zIndex: 50,
        color: palette.text,
        textDecoration: 'none',
        border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.52)' : palette.border}`,
        background: isHovered ? palette.backgroundHover : palette.background,
        boxShadow: isHovered ? `0 8px 22px ${palette.shadow}` : '0 0 0 rgba(255, 255, 255, 0)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        transition: 'border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `${paddingY}px ${paddingX}px`,
          color: palette.text,
          fontFamily: buttonFont,
          fontSize,
          fontWeight: 560,
          letterSpacing: '0.035em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {iconPosition === 'left' ? <IconSvg name={icon} color={palette.text} /> : null}
        <RollingText text={text} isHovered={isHovered} enabled={textReveal} fontSize={fontSize} />
        {iconPosition === 'right' ? <IconSvg name={icon} color={palette.text} /> : null}
      </span>
    </motion.a>
  );
}
