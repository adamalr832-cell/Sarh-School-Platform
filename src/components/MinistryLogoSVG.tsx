import React from 'react';

export const MinistryLogoSVG: React.FC<{ className?: string; size?: number }> = ({ className = 'w-12 h-12', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Golden/Green Ring */}
      <circle cx="50" cy="50" r="46" stroke="#047857" strokeWidth="2.5" fill="#F0FDF4" />
      <circle cx="50" cy="50" r="42" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      
      {/* Traditional Omani Khanjar Symbol Representation */}
      <path
        d="M50 16 L53 26 L56 26 L50 40 L44 26 L47 26 Z"
        fill="#047857"
        stroke="#065F46"
        strokeWidth="1"
      />
      {/* Khanjar Curved Blade */}
      <path
        d="M50 40 Q47 55 36 60 Q44 65 52 46 Q51 43 50 40 Z"
        fill="#B45309"
        stroke="#92400E"
        strokeWidth="1"
      />
      {/* Crossed Swords Representation */}
      <path
        d="M28 35 L72 65 M72 35 L28 65"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Wreath / Olive Branches */}
      <path
        d="M26 62 Q22 46 32 30 Q30 42 36 50 Q30 58 26 62 Z"
        fill="#059669"
        opacity="0.8"
      />
      <path
        d="M74 62 Q78 46 68 30 Q70 42 64 50 Q70 58 74 62 Z"
        fill="#059669"
        opacity="0.8"
      />
      
      {/* Base Ribbon */}
      <path
        d="M30 76 Q50 82 70 76 L66 84 Q50 88 34 84 Z"
        fill="#047857"
      />
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontSize="5"
        fontWeight="bold"
        fill="#FEF3C7"
        fontFamily="sans-serif"
      >
        سلطنة عُمان
      </text>
    </svg>
  );
};
