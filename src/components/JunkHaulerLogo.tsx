/**
 * JunkHauler Logo Component
 * Industrial wordmark with junk hauler spaceship
 * Glitch effect on hover
 */

import { cn } from '@/lib/utils';
import junkHaulerShip from '@/assets/junk-hauler-ship.png';

interface JunkHaulerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const JunkHaulerLogo = ({ 
  className, 
  size = 'md',
  showText = true 
}: JunkHaulerLogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn(
      "group flex items-center gap-2 select-none cursor-pointer",
      className
    )}>
      {/* Ship Icon */}
      <div className="relative">
        <img 
          src={junkHaulerShip} 
          alt="JunkHauler" 
          className={cn(
            sizeClasses[size],
            "w-auto object-contain transition-all duration-200",
            "group-hover:brightness-110"
          )}
        />
        {/* Glitch overlay on hover */}
        <img 
          src={junkHaulerShip} 
          alt="" 
          aria-hidden="true"
          className={cn(
            sizeClasses[size],
            "absolute inset-0 w-auto object-contain opacity-0",
            "group-hover:opacity-50 group-hover:animate-pulse",
            "mix-blend-screen hue-rotate-[20deg]",
            "transition-opacity duration-150"
          )}
          style={{ 
            clipPath: 'inset(30% 0 40% 0)',
            transform: 'translateX(2px)'
          }}
        />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="relative overflow-hidden">
          {/* Main text */}
          <span className={cn(
            textSizeClasses[size],
            "font-heading font-black tracking-tight uppercase",
            "text-foreground transition-all duration-200",
            "group-hover:tracking-wide"
          )}>
            <span className="relative inline-block group-hover:animate-[glitch-1_0.3s_ease-in-out]">
              Junk
            </span>
            <span className="text-warning relative inline-block group-hover:animate-[glitch-2_0.3s_ease-in-out_0.05s]">
              Hauler
            </span>
          </span>

          {/* Glitch layers - visible on hover */}
          <span 
            aria-hidden="true"
            className={cn(
              textSizeClasses[size],
              "absolute inset-0 font-heading font-black tracking-tight uppercase",
              "text-primary/60 opacity-0",
              "group-hover:opacity-100 group-hover:animate-[glitch-clip_0.3s_ease-in-out]",
              "pointer-events-none"
            )}
            style={{ clipPath: 'inset(20% 0 50% 0)', transform: 'translateX(-2px)' }}
          >
            <span>Junk</span>
            <span className="text-warning/60">Hauler</span>
          </span>

          <span 
            aria-hidden="true"
            className={cn(
              textSizeClasses[size],
              "absolute inset-0 font-heading font-black tracking-tight uppercase",
              "text-warning/40 opacity-0",
              "group-hover:opacity-100 group-hover:animate-[glitch-clip-2_0.3s_ease-in-out]",
              "pointer-events-none"
            )}
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translateX(2px)' }}
          >
            <span>Junk</span>
            <span className="text-warning/40">Hauler</span>
          </span>

          {/* Scan line */}
          <div className={cn(
            "absolute left-0 right-0 h-px bg-warning/50",
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
export const JunkHaulerIcon = ({ className, size = 32 }: { className?: string; size?: number }) => (
  <img 
    src={junkHaulerShip} 
    alt="JunkHauler" 
    width={size}
    height={size}
    className={cn("object-contain", className)}
  />
);