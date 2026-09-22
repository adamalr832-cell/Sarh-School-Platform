import React, { useState } from 'react';

interface MusaSchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export const MusaSchoolLogo: React.FC<MusaSchoolLogoProps> = ({
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      id="musa-school-logo-container"
      className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden shrink-0 bg-white flex items-center justify-center p-1 transition-transform duration-200 hover:scale-105 ${
        showBorder ? 'border-2 border-[#8B1D24] shadow-md' : ''
      } ${className}`}
      title="شعار مدرسة موسى بن نصير للتعليم الأساسي للبنين (9-12)"
    >
      {!imageError ? (
        <img
          src="/musa_school_logo.jpg"
          alt="شعار مدرسة موسى بن نصير للتعليم الأساسي (9-12)"
          className="w-full h-full object-contain rounded-xl"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Vector fallback matching the uploaded emblem */
        <svg viewBox="0 0 160 160" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="160" rx="16" fill="#FFFFFF" />
          {/* Top text "مدرسة" */}
          <text x="80" y="28" textAnchor="middle" fill="#8B1D24" fontSize="13" fontWeight="800" fontFamily="sans-serif">
            مدرسة
          </text>
          
          {/* Open Book Graphic */}
          {/* Book Spine / Red Outer Base */}
          <path
            d="M32 75 C32 110, 76 118, 80 118 C84 118, 128 110, 128 75 L120 75 C120 102, 84 108, 80 108 C76 108, 40 102, 40 75 Z"
            fill="#8B1D24"
          />
          {/* Golden Book Pages */}
          <rect x="42" y="66" width="35" height="36" rx="2" fill="#C8A96E" />
          <rect x="83" y="66" width="35" height="36" rx="2" fill="#C8A96E" />
          {/* Book Center Fold Divider */}
          <line x1="80" y1="64" x2="80" y2="108" stroke="#8B1D24" strokeWidth="2.5" />

          {/* Central Calligraphy Text "موسى بن نصير" */}
          <text x="80" y="58" textAnchor="middle" fill="#8B1D24" fontSize="17" fontWeight="900" fontFamily="sans-serif">
            موسى بن نصير
          </text>

          {/* Bottom subtitle "للتعليم الأساسي للبنين (9-12)" */}
          <text x="80" y="142" textAnchor="middle" fill="#8B1D24" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
            للتعليم الأساسي للبنين (٩-١٢)
          </text>
        </svg>
      )}
    </div>
  );
};
