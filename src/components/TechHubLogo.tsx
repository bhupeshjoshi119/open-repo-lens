import React from "react";

interface TechHubLogoProps {
  className?: string;
  size?: number;
}

export const TechHubLogo: React.FC<TechHubLogoProps> = ({
  className = "",
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main hexagonal shape */}
      <path
        d="M16 2L26 8V24L16 30L6 24V8L16 2Z"
        fill="url(#techHubGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner "T" with modern styling */}
      <path
        d="M10 11h12v2.5h-4.75v10.5h-2.5V13.5H10V11z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Circuit-like connecting lines */}
      <path
        d="M8 9L12 11M20 11L24 9M8 23L12 21M20 21L24 23"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* Tech nodes */}
      <circle cx="8" cy="9" r="1" fill="white" fillOpacity="0.6" />
      <circle cx="24" cy="9" r="1" fill="white" fillOpacity="0.6" />
      <circle cx="8" cy="23" r="1" fill="white" fillOpacity="0.6" />
      <circle cx="24" cy="23" r="1" fill="white" fillOpacity="0.6" />

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="techHubGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
};
