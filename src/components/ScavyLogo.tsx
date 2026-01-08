/**
 * Scavy Logo Component
 * Industrial wordmark with rickshaw icon (SVG)
 * Glitch effect on hover
 */

import { cn } from '@/lib/utils';

interface ScavyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// Rickshaw SVG Icon Component
const RickshawIcon = ({ className, size }: { className?: string; size: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 56,
  };
  const iconSize = sizeMap[size];
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rickshaw body - main cabin */}
      <path
        d="M18 20 L42 20 L48 32 L48 42 L12 42 L12 32 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Roof/canopy */}
      <path
        d="M14 20 L20 8 L40 8 L46 20"
        fill="hsl(var(--accent))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Roof stripes */}
      <line x1="24" y1="8" x2="22" y2="20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
      <line x1="32" y1="8" x2="32" y2="20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="8" x2="38" y2="20" stroke="hsl(var(--foreground))" strokeWidth="1.5" opacity="0.5" />
      
      {/* Window */}
      <rect
        x="22"
        y="24"
        width="16"
        height="10"
        rx="2"
        fill="hsl(var(--background))"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.5"
      />
      
      {/* Handle bars extending forward */}
      <path
        d="M12 36 L4 36 L2 32 L2 28"
        stroke="hsl(var(--foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Front wheel */}
      <circle
        cx="10"
        cy="50"
        r="8"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <circle
        cx="10"
        cy="50"
        r="3"
        fill="hsl(var(--accent))"
      />
      
      {/* Back wheel */}
      <circle
        cx="42"
        cy="50"
        r="10"
        fill="hsl(var(--muted))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
      <circle
        cx="42"
        cy="50"
        r="4"
        fill="hsl(var(--accent))"
      />
      
      {/* Wheel spokes - back wheel */}
      <line x1="42" y1="42" x2="42" y2="58" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
      <line x1="34" y1="50" x2="50" y2="50" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
      
      {/* Mudguard */}
      <path
        d="M32 50 Q42 38 52 50"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Decorative element - horn/bell */}
      <circle
        cx="4"
        cy="26"
        r="3"
        fill="hsl(var(--accent))"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
      />
    </svg>
  );
};

export const ScavyLogo = ({ 
  className, 
  size = 'md',
  showText = true 
}: ScavyLogoProps) => {
  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 select-none cursor-pointer",
      className
    )}>
      {/* Rickshaw Icon */}
      <div className="relative">
        <RickshawIcon 
          size={size}
          className="transition-all duration-200 group-hover:brightness-110"
        />
        {/* Glow on hover */}
        <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="relative overflow-hidden">
          {/* Main text */}
          <span className={cn(
            textSizeClasses[size],
            "font-sans font-black tracking-wide uppercase",
            "text-foreground transition-all duration-200",
            "group-hover:tracking-wider"
          )}>
            <span className="relative inline-block group-hover:animate-[glitch-1_0.3s_ease-in-out]">
              Sca
            </span>
            <span className="text-accent relative inline-block group-hover:animate-[glitch-2_0.3s_ease-in-out_0.05s]">
              vy
            </span>
          </span>

          {/* Glitch layers - visible on hover */}
          <span 
            aria-hidden="true"
            className={cn(
              textSizeClasses[size],
              "absolute inset-0 font-sans font-black tracking-wide uppercase",
              "text-primary/60 opacity-0",
              "group-hover:opacity-100 group-hover:animate-[glitch-clip_0.3s_ease-in-out]",
              "pointer-events-none"
            )}
            style={{ clipPath: 'inset(20% 0 50% 0)', transform: 'translateX(-2px)' }}
          >
            <span>Ka</span>
            <span className="text-accent/60">bari</span>
          </span>

          <span 
            aria-hidden="true"
            className={cn(
              textSizeClasses[size],
              "absolute inset-0 font-sans font-black tracking-wide uppercase",
              "text-accent/40 opacity-0",
              "group-hover:opacity-100 group-hover:animate-[glitch-clip-2_0.3s_ease-in-out]",
              "pointer-events-none"
            )}
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translateX(2px)' }}
          >
            <span>Ka</span>
            <span className="text-accent/40">bari</span>
          </span>

          {/* Scan line */}
          <div className={cn(
            "absolute left-0 right-0 h-px bg-accent/50",
            "opacity-0 group-hover:opacity-100",
            "group-hover:animate-[scanline_0.4s_ease-in-out]",
            "pointer-events-none"
          )} />
        </div>
      )}
    </div>
  );
};

// Icon-only variant for compact spaces
export const ScavyIcon = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => (
  <RickshawIcon size={size} className={className} />
);
