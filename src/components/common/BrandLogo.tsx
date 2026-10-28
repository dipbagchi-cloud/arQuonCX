import React from 'react';

export interface BrandLogoProps {
  /** Size of the logo icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to render the wordmark text ('arQuonCX') alongside the icon */
  showWordmark?: boolean;
  /** Optional subtitle below the wordmark (e.g. 'Customer Success & Product Growth') */
  subtitle?: string | null;
  /** Optional pill badge next to the wordmark (e.g. 'Enterprise Suite', 'PROD') */
  badgeText?: string | null;
  /** Optional theme override: 'auto' adapts to active theme, 'light' forces light background contrast, 'dark' forces dark background contrast */
  theme?: 'auto' | 'light' | 'dark';
  /** Additional wrapper classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export interface LogoIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
}

/**
 * Captivating bespoke vector Icon Mark for arQuonCX: "The Quantum Prism Q".
 * An isometric, multi-faceted origami ribbon that twists in 3D space forming an energetic "Q"
 * with an ascending expansion arrow, faceted dimensional lighting, and a radiant telemetry core.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ 
  size = 'md',
  theme = 'auto',
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-950 via-[#0E162E] to-[#070B19] p-1 border border-indigo-200/90 dark:border-indigo-500/30 shadow-md shadow-indigo-500/15 dark:shadow-indigo-950/50 ring-1 ring-slate-900/5 dark:ring-white/10 group-hover:border-cyan-400/50 group-hover:shadow-indigo-500/25 transition-all duration-300 ${currentSizeClass} ${className}`}>
      {/* Ambient background glow bloom */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-cyan-400/30 blur-sm pointer-events-none" />

      <svg 
        viewBox="0 0 52 52" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Facet 1: Royal Indigo to Hyper Violet */}
          <linearGradient id="qFacetA" x1="8" y1="44" x2="44" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Facet 2: Hyper Cyan to Electric Blue */}
          <linearGradient id="qFacetB" x1="12" y1="12" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Facet 3: Shaded Dimensional Crease */}
          <linearGradient id="qFacetC" x1="20" y1="20" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Spark Core Glow */}
          <radialGradient id="qSparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Outer Sweeping Arc (Primary Orbit of Momentum) */}
        <path
          d="M26 6C14.954 6 6 14.954 6 26C6 37.046 14.954 46 26 46C30.739 46 35.074 44.35 38.489 41.583L42.293 45.387C43.197 46.291 44.733 45.651 44.733 44.372V34.5C44.733 33.672 44.061 33 43.233 33H33.361C32.082 33 31.442 34.536 32.346 35.44L35.632 38.726C32.997 40.771 29.646 42 26 42C17.163 42 10 34.837 10 26C10 17.163 17.163 10 26 10C34.837 10 42 17.163 42 26C42 28.147 41.577 30.198 40.81 32.072C40.485 32.866 40.978 33.743 41.826 33.876C42.668 34.009 43.439 33.385 43.784 32.585C44.743 30.548 45.273 28.328 45.273 26C45.273 14.954 36.626 6 26 6Z"
          fill="url(#qFacetA)"
        />

        {/* 2. Inner Intertwining Quantum Helix Ribbon (Forms Isometric Q Core) */}
        <path
          d="M26 14C19.373 14 14 19.373 14 26C14 32.627 19.373 38 26 38C28.847 38 31.458 37.009 33.513 35.347L29.207 31.041C28.271 31.644 27.172 32 26 32C22.686 32 20 29.314 20 26C20 22.686 22.686 20 26 20C29.314 20 32 22.686 32 26C32 27.172 31.644 28.271 31.041 29.207L35.347 33.513C37.009 31.458 38 28.847 38 26C38 19.373 32.627 14 26 14Z"
          fill="url(#qFacetB)"
          opacity="0.95"
        />

        {/* 3. Ascending Trajectory Vector / Kick Accent */}
        <path
          d="M24 28L36 16M36 16H28M36 16V24"
          stroke="#22D3EE"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4. Radiant Telemetry Quantum Spark (Center Focal Point) */}
        <circle cx="26" cy="26" r="5" fill="url(#qSparkGlow)" />
        <path
          d="M26 20L27.4 24.6L32 26L27.4 27.4L26 32L24.6 27.4L20 26L24.6 24.6Z"
          fill="#FFFFFF"
        />

        {/* 5. Orbital Neon Satellite Beacon */}
        <circle cx="39" cy="13" r="2.2" fill="#22D3EE" className="animate-pulse" />
      </svg>
    </div>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle = null,
  badgeText = null,
  theme = 'auto',
  className = '',
  onClick,
}) => {
  const fontSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const currentFontSize = fontSizes[size] || fontSizes.md;

  // Compute theme-specific classes
  const wordmarkClass = 
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
        ? 'text-slate-900'
        : 'text-slate-900 dark:text-white';

  const cxGradient =
    theme === 'dark'
      ? 'from-indigo-400 via-violet-400 to-cyan-300'
      : theme === 'light'
        ? 'from-indigo-600 via-violet-600 to-cyan-600'
        : 'from-indigo-600 via-violet-600 to-cyan-600 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-300';

  const beaconClass =
    theme === 'dark'
      ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
      : theme === 'light'
        ? 'bg-cyan-500 shadow-[0_0_6px_#06b6d4]'
        : 'bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_6px_#06b6d4] dark:shadow-[0_0_8px_#22d3ee]';

  const badgeClass =
    theme === 'dark'
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-700/80'
      : theme === 'light'
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
        : 'bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80';

  const subtitleClass =
    theme === 'dark'
      ? 'text-slate-300'
      : theme === 'light'
        ? 'text-slate-600'
        : 'text-slate-600 dark:text-slate-400';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <LogoIcon size={size} theme={theme} className={onClick ? 'group-hover:scale-105 group-hover:rotate-1 transition-all duration-300' : ''} />

      {showWordmark && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 leading-none">
            {/* arQuon wordmark with negative tracking */}
            <span className={`font-extrabold ${currentFontSize} ${wordmarkClass} tracking-[-0.03em]`}>
              arQuon
            </span>

            {/* CX Chromatic Gradient Pill with Telemetry Beacon */}
            <span className="relative inline-flex items-center gap-1">
              <span className={`font-black ${currentFontSize} bg-gradient-to-r ${cxGradient} bg-clip-text text-transparent tracking-tight`}>
                CX
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${beaconClass} animate-pulse`} />
            </span>

            {badgeText && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-2xs ${badgeClass}`}>
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <span className={`text-[10px] font-medium tracking-normal mt-1 truncate ${subtitleClass}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;

