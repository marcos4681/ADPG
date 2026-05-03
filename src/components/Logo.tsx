import React from 'react';

interface LogoProps {
  className?: string;
  hideText?: boolean;
}

export default function Logo({ className = "", hideText = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center font-sans ${className}`}>
      {/* SVG Fish Symbol */}
      <div className="relative w-full max-w-[160px] h-12 flex items-center justify-center mb-1">
        <svg viewBox="0 0 250 100" className="w-full h-full overflow-visible">
          {/* Lower Arc (Left to Right) */}
          <path 
            id="fish-lower" 
            d="M 25 25 Q 125 110 225 50" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="text-red-700 dark:text-red-500 drop-shadow-sm"
          />
          {/* Upper Arc (Left to Right) */}
          <path 
            d="M 25 75 Q 125 -10 225 50" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="text-red-700 dark:text-red-500 drop-shadow-sm"
          />
          
          {/* Curved Text Inside */}
          {!hideText && (
            <text className="text-[12px] font-semibold fill-app-text dark:fill-gray-200">
              <textPath href="#fish-lower" startOffset="50%" textAnchor="middle" dominantBaseline="text-after-edge">
                Praia Grande é de Jesus Cristo
              </textPath>
            </text>
          )}
        </svg>
      </div>

      {/* Main Typography */}
      <div className="flex flex-col items-center group">
        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-app-text dark:text-white drop-shadow-sm">
          Assembleia de Deus - PG
        </h1>
        <h2 className="text-[7px] sm:text-[8px] font-bold text-red-700 dark:text-red-400 tracking-[0.35em] uppercase mb-0.5 mt-1 drop-shadow-sm">
          Ministério de Santos
        </h2>
        <h3 className="text-sm sm:text-base font-bold text-red-700 dark:text-red-500 mt-0.5 drop-shadow-sm">
          Congregação Jardim Melvi
        </h3>
      </div>
    </div>
  );
}
