import React from 'react';

interface IllustrationProps {
  type: 'alchemist' | 'compass' | 'hourglass' | 'feather' | 'tree' | 'constellation' | 'rabbit' | 'tower';
  className?: string;
}

export const VintageIllustration: React.FC<IllustrationProps> = ({ type, className = 'w-28 h-28 my-3 mx-auto' }) => {
  switch (type) {
    case 'alchemist':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            {/* Alchemical Crucible & Geometry */}
            <circle cx="50" cy="50" r="42" strokeDasharray="3 2" />
            <polygon points="50,14 84,72 16,72" />
            <polygon points="50,86 16,28 84,28" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="16" />
            <circle cx="50" cy="50" r="6" fill="currentColor" fillOpacity="0.2" />
            <line x1="50" y1="8" x2="50" y2="92" strokeWidth="0.8" />
            <line x1="8" y1="50" x2="92" y2="50" strokeWidth="0.8" />
            <path d="M 44,40 Q 50,32 56,40 Q 62,48 50,60 Q 38,48 44,40 Z" fill="currentColor" fillOpacity="0.15" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Figure I • The Celestial Crucible</span>
        </div>
      );

    case 'compass':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            <circle cx="50" cy="50" r="44" />
            <circle cx="50" cy="50" r="40" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
            {/* Compass rose stars */}
            <path d="M50,14 L54,46 L86,50 L54,54 L50,86 L46,54 L14,50 L46,46 Z" fill="currentColor" fillOpacity="0.1" />
            <path d="M50,22 L53,47 L78,50 L53,53 L50,78 L47,53 L22,50 L47,47 Z" />
            <text x="47" y="10" fontSize="7" fontFamily="serif" fill="currentColor">N</text>
            <text x="91" y="52" fontSize="7" fontFamily="serif" fill="currentColor">E</text>
            <text x="47" y="96" fontSize="7" fontFamily="serif" fill="currentColor">S</text>
            <text x="4" y="52" fontSize="7" fontFamily="serif" fill="currentColor">W</text>
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Figure III • The Electrum Compass</span>
        </div>
      );

    case 'constellation':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1">
            <circle cx="50" cy="50" r="42" strokeDasharray="4 2" />
            {/* Constellation Cygnus & Lyra */}
            <line x1="50" y1="20" x2="50" y2="75" />
            <line x1="25" y1="45" x2="75" y2="45" />
            <line x1="50" y1="20" x2="35" y2="32" />
            <line x1="50" y1="20" x2="65" y2="32" />
            {/* Stars */}
            <circle cx="50" cy="20" r="3" fill="currentColor" />
            <circle cx="50" cy="45" r="3.5" fill="currentColor" />
            <circle cx="25" cy="45" r="2.5" fill="currentColor" />
            <circle cx="75" cy="45" r="2.5" fill="currentColor" />
            <circle cx="50" cy="75" r="3" fill="currentColor" />
            <circle cx="35" cy="32" r="2" fill="currentColor" />
            <circle cx="65" cy="32" r="2" fill="currentColor" />
            {/* Ambient small stars */}
            <circle cx="20" cy="25" r="1" fill="currentColor" />
            <circle cx="80" cy="70" r="1" fill="currentColor" />
            <circle cx="70" cy="20" r="1" fill="currentColor" />
            <circle cx="30" cy="78" r="1" fill="currentColor" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Figure II • Constellation of Cygnus</span>
        </div>
      );

    case 'hourglass':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            <line x1="25" y1="16" x2="75" y2="16" strokeWidth="2.5" />
            <line x1="25" y1="84" x2="75" y2="84" strokeWidth="2.5" />
            <path d="M 30,18 C 30,42 46,48 48,50 C 46,52 30,58 30,82 L 70,82 C 70,58 54,52 52,50 C 54,48 70,42 70,18 Z" />
            <path d="M 38,78 Q 50,70 62,78 Z" fill="currentColor" fillOpacity="0.25" />
            <line x1="50" y1="48" x2="50" y2="76" strokeDasharray="2 2" />
            <line x1="28" y1="16" x2="28" y2="84" strokeWidth="1" />
            <line x1="72" y1="16" x2="72" y2="84" strokeWidth="1" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Plate IV • Measure of Cycles</span>
        </div>
      );

    case 'feather':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            <path d="M 22,82 Q 40,65 58,40 Q 75,18 82,14 Q 78,32 60,54 Q 42,74 22,82 Z" fill="currentColor" fillOpacity="0.1" />
            <path d="M 22,82 Q 48,56 82,14" strokeWidth="1.6" />
            <line x1="45" y1="58" x2="38" y2="52" />
            <line x1="55" y1="48" x2="46" y2="40" />
            <line x1="65" y1="36" x2="54" y2="28" />
            <line x1="75" y1="24" x2="66" y2="18" />
            <line x1="48" y1="55" x2="56" y2="60" />
            <line x1="58" y1="45" x2="68" y2="50" />
            <line x1="68" y1="33" x2="78" y2="38" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Folio • The Scribe's Quill</span>
        </div>
      );

    case 'tree':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            <circle cx="50" cy="50" r="42" strokeDasharray="3 2" />
            {/* Tree of Life geometry */}
            <path d="M50,78 L50,45" strokeWidth="2.5" />
            <path d="M50,55 Q 35,45 28,32" />
            <path d="M50,50 Q 65,42 72,30" />
            <path d="M50,42 Q 40,30 38,20" />
            <path d="M50,40 Q 60,28 62,20" />
            <circle cx="50" cy="18" r="4" fill="currentColor" fillOpacity="0.2" />
            <circle cx="28" cy="32" r="3.5" fill="currentColor" fillOpacity="0.2" />
            <circle cx="72" cy="30" r="3.5" fill="currentColor" fillOpacity="0.2" />
            <circle cx="38" cy="20" r="3" fill="currentColor" fillOpacity="0.2" />
            <circle cx="62" cy="20" r="3" fill="currentColor" fillOpacity="0.2" />
            <path d="M 30,82 Q 50,76 70,82" strokeWidth="1.5" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Figure V • The Golden Arbor</span>
        </div>
      );

    case 'tower':
      return (
        <div className={`flex flex-col items-center justify-center select-none text-stone-700 dark:text-stone-300 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none" strokeWidth="1.2">
            <circle cx="50" cy="50" r="42" strokeDasharray="2 2" />
            {/* Lighthouse of Alexandria / Pharos */}
            <rect x="42" y="30" width="16" height="48" />
            <polygon points="38,78 62,78 66,86 34,86" />
            <rect x="44" y="22" width="12" height="8" />
            <polygon points="42,22 58,22 50,14" />
            {/* Light rays */}
            <line x1="38" y1="20" x2="16" y2="10" strokeDasharray="3 2" />
            <line x1="62" y1="20" x2="84" y2="10" strokeDasharray="3 2" />
            <line x1="50" y1="86" x2="50" y2="92" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-stone-500 mt-1">Plate VI • The Tower of Pharos</span>
        </div>
      );

    default:
      return null;
  }
};
