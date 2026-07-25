import React from 'react';

interface StempoLogoProps {
  size?: number;
  color?: string;
  showWordmark?: boolean;
  className?: string;
  variant?: 'default' | 'white' | 'mono';
}

export function StempoLogo({
  size = 40,
  color = '#8B5CF6',
  showWordmark = true,
  className = '',
  variant = 'default',
}: StempoLogoProps) {
  const markColor = variant === 'white' ? '#FFFFFF' : color;
  const textColor = variant === 'white' ? '#FFFFFF' : variant === 'mono' ? '#11181C' : color;

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label="Stempo"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square container */}
        <rect width="40" height="40" rx="10" fill={markColor} />

        {/*
          S letterform — 5 white rects that visually union into a clean geometric S:
          Top cap + upper-left vertical = upper bowl (open right)
          Middle crossbar
          Lower-right vertical + bottom cap = lower bowl (open left)
        */}
        <rect x="8" y="4"  width="24" height="8" rx="2.5" fill="white" />
        <rect x="8" y="4"  width="8"  height="19" rx="2.5" fill="white" />
        <rect x="8" y="16" width="24" height="8" rx="2.5" fill="white" />
        <rect x="24" y="16" width="8" height="20" rx="2.5" fill="white" />
        <rect x="8" y="28" width="24" height="8" rx="2.5" fill="white" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontSize: `${Math.round(size * 0.55)}px`,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: textColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          Stempo
        </span>
      )}
    </div>
  );
}

export default StempoLogo;
