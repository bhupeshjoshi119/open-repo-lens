interface TechHubLogoProps {
  className?: string;
  size?: number;
}

export const TechHubLogo = ({ className = "", size = 24 }: TechHubLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer glow circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="url(#gradient-glow)"
        opacity="0.2"
      />
      
      {/* Main circle background */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="url(#gradient-bg)"
        stroke="url(#gradient-border)"
        strokeWidth="2"
      />
      
      {/* Letter T with modern design */}
      <path
        d="M 30 30 L 70 30 L 70 38 L 54 38 L 54 75 L 46 75 L 46 38 L 30 38 Z"
        fill="url(#gradient-text)"
      />
      
      {/* Accent dot */}
      <circle 
        cx="50" 
        cy="20" 
        r="3" 
        fill="hsl(var(--accent))"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(220 28% 12%)" />
          <stop offset="100%" stopColor="hsl(220 28% 8%)" />
        </linearGradient>
        
        <linearGradient id="gradient-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(239 84% 67%)" />
          <stop offset="50%" stopColor="hsl(263 70% 60%)" />
          <stop offset="100%" stopColor="hsl(239 84% 67%)" />
        </linearGradient>
        
        <linearGradient id="gradient-text" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(239 84% 67%)" />
          <stop offset="100%" stopColor="hsl(263 70% 60%)" />
        </linearGradient>
        
        <radialGradient id="gradient-glow">
          <stop offset="0%" stopColor="hsl(239 84% 67%)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
};
