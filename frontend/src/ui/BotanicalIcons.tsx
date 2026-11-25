import React from 'react';

export const BotanicalIcon: React.FC<{ kind: string; size?: number }> = ({ kind, size = 34 }) => {
  const stroke = 'currentColor';
  switch (kind) {
    case 'dahlia':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="14" r="3" />
          <path d="M18 6c2 2 2 5 0 5s-2-3 0-5zM18 17c2 2 2 5 0 5s-2-3 0-5zM10 14c2-2 5-2 5 0s-3 2-5 0zM21 14c2-2 5-2 5 0s-3 2-5 0z" />
          <path d="M12 8c2.5 0.5 4 2.5 3.5 3.5S12.5 11 12 8zM24 8c-2.5 0.5-4 2.5-3.5 3.5S23.5 11 24 8zM12 20c2.5-0.5 4-2.5 3.5-3.5S12.5 17 12 20zM24 20c-2.5-0.5-4-2.5-3.5-3.5S23.5 17 24 20z" />
          <path d="M18 22v10" />
        </svg>
      );
    case 'rose':
    case 'tulip':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20c-5 0-8-4-8-9 0-3 2-5 4-5 2 0 4 2 4 4 0-2 2-4 4-4 2 0 4 2 4 5 0 5-3 9-8 9z" />
          <path d="M18 20v12M18 26c-3 0-5-2-6-4M18 28c3 0 5-2 6-4" />
        </svg>
      );
    case 'jar':
    case 'vase':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="12" y="16" width="12" height="14" rx="3" />
          <path d="M13 16h10M15 16l-2-7M18 16V7M21 16l2-6" />
          <circle cx="13" cy="8" r="1.8" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="23" cy="9" r="1.6" />
        </svg>
      );
    case 'wreath':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="9.5" />
          <circle cx="18" cy="18" r="5.5" strokeDasharray="2 3" />
          <path d="M11 11l3 2M25 11l-3 2M11 25l3-2M25 25l-3-2" />
        </svg>
      );
    case 'plant':
    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 22h10l-1.5 9h-7L13 22z" />
          <path d="M18 22V10M18 16c-4-1-7-4-6-8 4 0 6 3 6 8zM18 14c4-1 7-4 6-8-4 0-6 3-6 8z" />
        </svg>
      );
    case 'card':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="9" width="20" height="18" rx="2.5" />
          <path d="M18 14c1.5-2 4-1 4 1 0 2-4 4.5-4 4.5s-4-2.5-4-4.5c0-2 2.5-3 4-1z" />
        </svg>
      );
    case 'snips':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13" cy="25" r="3" />
          <circle cx="23" cy="25" r="3" />
          <path d="M14.5 22.5L22 9M21.5 22.5L14 9" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17l6 13 6-13H12z" />
          <path d="M15 17c-2-3-1-7 2-8 1-2 4-2 5 0 3 1 4 5 2 8" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="21" cy="12" r="2" />
          <circle cx="18" cy="9" r="2" />
        </svg>
      );
  }
};
