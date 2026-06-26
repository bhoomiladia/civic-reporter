import React from "react";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top C-shaped Map Pin Arc */}
      <path
        d="M 132,320 C 78,230 110,85 245,55 C 380,25 435,115 390,175"
        fill="none"
        stroke="#0c1e3d"
        strokeWidth="48"
        strokeLinecap="round"
      />
      
      {/* City Skyline */}
      <g fill="#3b6e9c">
        {/* Building 1 */}
        <rect x="180" y="210" width="30" height="70" rx="1" />
        <path d="M 210,195 L 235,210 L 235,280 L 210,280 Z" fill="#29517a" />
        
        {/* Building 2 (Central Tower + Spire) */}
        <rect x="245" y="145" width="45" height="135" rx="1.5" />
        <path d="M 267.5,90 L 267.5,145" stroke="#1d3e61" strokeWidth="6" strokeLinecap="round" />
        
        {/* Building 3 */}
        <rect x="310" y="200" width="28" height="80" rx="1" fill="#3b6e9c" />
        
        {/* Building 4 */}
        <rect x="350" y="228" width="25" height="52" rx="1" fill="#29517a" />
      </g>

      {/* Curved Road & Pin Base */}
      {/* Left blue side */}
      <path
        d="M 124,312 C 160,300 230,285 308,280 C 260,330 200,420 168,460 Z"
        fill="#1e60eb"
      />
      
      {/* Right teal side */}
      <path
        d="M 308,280 C 342,282 390,290 422,320 C 380,380 340,430 322,465 Z"
        fill="#0d9488"
      />
      
      {/* Center Dark Navy Road forming Pin Point */}
      <path
        d="M 252,282 C 300,280 340,285 372,295 C 330,375 290,470 268,525 C 246,470 206,375 168,460 C 182,410 216,330 252,282 Z"
        fill="#0c1e3d"
      />
      
      {/* White Road Center Dash Line */}
      <path
        d="M 312,298 C 298,348 282,418 268,485"
        stroke="#ffffff"
        strokeWidth="14"
        strokeDasharray="28 28"
        strokeLinecap="round"
      />
    </svg>
  );
}
