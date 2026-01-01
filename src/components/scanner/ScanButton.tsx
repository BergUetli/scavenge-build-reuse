/**
 * SCAN BUTTON - JunkHauler Style
 * Huge glassmorphic button with animated gradient border
 * and pulsing glow effect
 */

import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface ScanButtonProps {
  onClick: () => void;
  size?: 'default' | 'large';
  className?: string;
}

export function ScanButton({ onClick, size = 'large', className }: ScanButtonProps) {
  const isLarge = size === 'large';
  const { playScan, hapticHeavy } = useSounds();

  const handleClick = () => {
    hapticHeavy();
    playScan();
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative group touch-target',
        className
      )}
    >
      {/* Animated gradient border container */}
      <div 
        className={cn(
          'absolute -inset-[2px] rounded-3xl opacity-75',
          'bg-gradient-to-r from-warning via-primary to-warning',
          'animate-[spin_4s_linear_infinite] blur-[1px]',
          isLarge && 'group-hover:opacity-100 transition-opacity duration-300'
        )}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-spin 3s linear infinite',
        }}
      />

      {/* Pulsing glow */}
      <div 
        className={cn(
          'absolute -inset-3 rounded-[28px] animate-pulse-soft',
          isLarge 
            ? 'bg-gradient-to-r from-warning/30 via-primary/30 to-warning/30 blur-xl' 
            : 'bg-primary/20 blur-md'
        )}
        style={{ animationDuration: '2.5s' }}
      />
      
      {/* Secondary glow ring */}
      {isLarge && (
        <div 
          className="absolute -inset-6 rounded-[36px] bg-gradient-to-r from-primary/15 to-warning/15 blur-2xl animate-pulse-soft"
          style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
        />
      )}
      
      {/* Main button - Glassmorphism */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'bg-background/60 backdrop-blur-xl',
          'rounded-3xl',
          'transition-all duration-300 ease-out-expo',
          'group-hover:scale-[1.02] group-active:scale-95',
          'border border-white/10',
          isLarge 
            ? 'w-[240px] h-[160px]' 
            : 'w-16 h-16'
        )}
        style={{
          boxShadow: isLarge 
            ? `
              inset 0 1px 1px rgba(255,255,255,0.1),
              inset 0 -1px 1px rgba(0,0,0,0.1),
              0 8px 32px rgba(0,0,0,0.3)
            `
            : 'inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
        
        {/* Icon */}
        <Camera 
          className={cn(
            'relative text-white drop-shadow-lg transition-transform duration-300',
            'group-hover:scale-110',
            isLarge ? 'w-16 h-16' : 'w-7 h-7'
          )} 
          strokeWidth={isLarge ? 1.5 : 2} 
        />
        
        {/* Text */}
        {isLarge && (
          <span className="relative text-sm font-bold text-white/90 tracking-[0.25em] uppercase">
            Tap to Scan
          </span>
        )}
      </div>
    </button>
  );
}