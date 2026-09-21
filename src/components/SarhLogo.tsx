import React, { useState } from 'react';

interface SarhLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
  subtext?: string;
}

export const SarhLogo: React.FC<SarhLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = '',
  subtext,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping for the logo emblem image
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} dir="rtl">
      {/* Primary Logo Emblem Graphic */}
      <div
        id="sarh-primary-logo-emblem"
        className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden shadow-md border-2 border-[#C48B69] shrink-0 bg-[#F9F8F6] flex items-center justify-center p-0.5 group transition-transform duration-200 hover:scale-105`}
      >
        {!imageError ? (
          <img
            src="/sarh_main_logo.jpg"
            alt="شعار صَرْح الرسمي - Sarh Platform Official Logo"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-Fidelity Vector Fallback if image load fails */
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#135D43] via-[#1B2A4A] to-[#0f172a] flex flex-col items-center justify-center text-white relative">
            <div className="w-3 h-3 rounded-full bg-[#C48B69] mb-0.5 shadow-xs"></div>
            <span className="font-black text-sm tracking-tight text-[#F9F8F6]">صَرْح</span>
            <span className="text-[7px] font-mono text-[#C48B69] font-bold">SARH</span>
          </div>
        )}
      </div>

      {/* Typography Section if showText is enabled */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className={`font-black tracking-tight flex items-center gap-1.5 ${titleSizes[size]} ${
                variant === 'dark' ? 'text-white' : 'text-[#1B2A4A]'
              }`}
            >
              <span>منصة صَرْح</span>
              <span className="text-xs font-mono font-bold text-[#C48B69]">SARH</span>
            </h1>
            <span
              className={`font-bold rounded-full font-sans border ${badgeSizes[size]} ${
                variant === 'dark'
                  ? 'bg-[#135D43]/40 text-[#C48B69] border-[#C48B69]/40'
                  : 'bg-[#135D43]/15 text-[#135D43] border-[#135D43]/30'
              }`}
            >
              المنصة الذكية المعتمدة
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              variant === 'dark' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {subtext || 'المساعد الرقمي لإدارة المدارس • سلطنة عُمان'}
          </p>
        </div>
      )}
    </div>
  );
};
