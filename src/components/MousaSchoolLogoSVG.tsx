import React from 'react';

interface MousaSchoolLogoSVGProps {
  className?: string;
  size?: number | string;
}

export const MousaSchoolLogoSVG: React.FC<MousaSchoolLogoSVGProps> = ({
  className = '',
  size = '100%',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 800"
      width={size}
      height={size}
      className={className}
      textRendering="geometricPrecision"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <filter id="mousa-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#881A1D" floodOpacity="0.2" />
        </filter>
      </defs>

      <g id="mousa-bin-nusair-school-official-logo">
        {/* 1. Top Word: مدرسة */}
        <text
          x="450"
          y="190"
          fontFamily="'Cairo', 'Tajawal', 'Traditional Arabic', sans-serif"
          fontWeight="900"
          fontSize="72"
          fill="#881A1D"
          textAnchor="middle"
          letterSpacing="2"
        >
          مدرسة
        </text>

        {/* 2. Open Book Silhouette and Gold Pages */}
        <g id="book-graphic">
          {/* Right Page (Gold) */}
          <path
            d="M 465 315 Q 575 305 670 335 L 670 575 Q 575 550 465 560 Z"
            fill="#C5A566"
          />

          {/* Left Page (Gold) */}
          <path
            d="M 230 335 Q 325 305 435 315 L 435 560 Q 325 550 230 575 Z"
            fill="#C5A566"
          />

          {/* Book Spine Center Gap Separator */}
          <line x1="450" y1="315" x2="450" y2="570" stroke="#F9F8F6" strokeWidth="6" />

          {/* Outer Crimson Maroon Frame (Book Spine Base & Side Uprights) */}
          {/* Right Side Bar and Bottom Wing Flair */}
          <path
            d="M 710 390 L 680 390 L 680 570 Q 575 545 460 555 L 460 590 Q 585 580 710 630 Q 700 580 710 390 Z"
            fill="#881A1D"
          />

          {/* Left Side Bar and Bottom Wing Flair */}
          <path
            d="M 190 390 L 220 390 L 220 570 Q 325 545 440 555 L 440 590 Q 315 580 190 630 Q 200 580 190 390 Z"
            fill="#881A1D"
          />

          {/* Base Spine Silhouette */}
          <path
            d="M 190 630 Q 315 580 450 592 Q 585 580 710 630 Q 585 565 450 576 Q 315 565 190 630 Z"
            fill="#881A1D"
          />
        </g>

        {/* 3. Central Artistic Calligraphy: موسى بن نصير */}
        <g id="calligraphy-section">
          {/* Sweeping Flourish of the Alif Maqsura (ى) and Raa (ر) */}
          <path
            d="M 360 480 Q 430 525 630 485 Q 650 480 670 465 Q 630 500 440 500 Q 350 500 360 480 Z"
            fill="#881A1D"
          />
          <path
            d="M 220 465 Q 195 475 155 470 Q 145 468 135 460 Q 165 485 220 480 Q 265 475 285 445 Q 260 455 220 465 Z"
            fill="#881A1D"
          />

          {/* The Calligraphic Heading */}
          <text
            x="450"
            y="450"
            fontFamily="'Cairo', 'Tajawal', 'Amiri', 'Traditional Arabic', serif"
            fontWeight="900"
            fontSize="118"
            fill="#881A1D"
            textAnchor="middle"
            filter="url(#mousa-shadow)"
            letterSpacing="1"
          >
            مُوسَى بْن نَصِير
          </text>
        </g>

        {/* 4. Bottom Text: للتعليم الأساسي للبنين (12-9) */}
        <text
          x="450"
          y="705"
          fontFamily="'Cairo', 'Tajawal', sans-serif"
          fontWeight="800"
          fontSize="48"
          fill="#881A1D"
          textAnchor="middle"
          letterSpacing="1"
        >
          للتعليم الأساسي للبنين (١٢-٩)
        </text>
      </g>
    </svg>
  );
};
