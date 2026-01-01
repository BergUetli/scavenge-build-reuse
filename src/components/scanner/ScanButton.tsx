/**
 * SCAN BUTTON - JunkHauler Style
 * Giant circular button (280px) with radial gradient,
 * animated rotating border, and pulsing glow
 */

import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface ScanButtonProps {
  onClick: () => void;
  isScanning?: boolean;
  className?: string;
}

export function ScanButton({ onClick, isScanning = false, className }: ScanButtonProps) {
  const { playScan, hapticHeavy } = useSounds();

  const handleClick = () => {
    if (isScanning) return;
    hapticHeavy();
    playScan();
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isScanning}
      className={cn(
        'relative group touch-target focus-ring rounded-full',
        'transition-transform duration-200 ease-out',
        !isScanning && 'hover:scale-[1.08] active:scale-95',
        isScanning && 'cursor-wait',
        className
      )}
      aria-label={isScanning ? 'Analyzing component' : 'Tap to scan'}
    >
      {/* Animated rotating gradient border */}
      <div 
        className={cn(
          'absolute -inset-1 rounded-full',
          'bg-[conic-gradient(from_0deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary)))]',
          isScanning ? 'animate-spin' : 'animate-[spin_8s_linear_infinite]',
          'opacity-80'
        )}
        style={{
          animationDuration: isScanning ? '1s' : '8s',
        }}
      />
      
      {/* Border mask - creates the border effect */}
      <div className="absolute -inset-1 rounded-full bg-background" style={{ margin: '4px' }} />

      {/* Outer glow */}
      <div 
        className={cn(
          'absolute -inset-4 rounded-full blur-xl transition-opacity duration-300',
          'bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40',
          !isScanning && 'group-hover:opacity-100 opacity-70',
          isScanning && 'opacity-100 animate-pulse'
        )}
        style={{
          boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)',
        }}
      />
      
      {/* Secondary ambient glow */}
      <div 
        className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl animate-pulse-soft"
        style={{ animationDuration: '12s' }}
      />
      
      {/* Main button - Radial gradient */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'w-[280px] h-[280px] rounded-full',
          'bg-[radial-gradient(circle,hsl(var(--primary))_0%,hsl(var(--accent))_100%)]',
          'transition-all duration-200 ease-out',
          !isScanning && 'animate-[scan-pulse_14s_ease-in-out_infinite]'
        )}
        style={{
          boxShadow: `
            0 0 40px rgba(255, 107, 53, 0.4),
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
        
        {/* Icon */}
        <Camera 
          className={cn(
            'relative text-white drop-shadow-lg transition-transform duration-300',
            'w-[72px] h-[72px]',
            !isScanning && 'group-hover:scale-110',
            isScanning && 'animate-pulse'
          )} 
          strokeWidth={1.5}
          aria-hidden="true"
        />
        
        {/* Text */}
        <span className={cn(
          'relative text-sm font-bold text-white tracking-[0.25em] uppercase',
          'drop-shadow-md'
        )}>
          {isScanning ? 'Analyzing...' : 'Tap to Scan'}
        </span>
      </div>
    </button>
  );
}
