import React from 'react';

interface CodeIconProps {
  className?: string;
  size?: number;
}

export const CodeIcon: React.FC<CodeIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Code brackets */}
      <path
        d="M8 6L2 12L8 18M16 6L22 12L16 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Slash in the middle */}
      <path
        d="M14 4L10 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};