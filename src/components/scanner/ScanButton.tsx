/**
 * SCAN BUTTON - Premium iOS Style
 */

import { Camera, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScanButtonProps {
  onClick: () => void;
  size?: 'default' | 'large';
  className?: string;
}

export function ScanButton({ onClick, size = 'large', className }: ScanButtonProps) {
  const isLarge = size === 'large';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group',
        className
      )}
    >
      {/* Animated pulse rings */}
      <div className="absolute inset-0 rounded-full bg-primary/20 pulse-scan" />
      <div 
        className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" 
        style={{ animationDelay: '0.5s' }}
      />
      
      {/* Main button */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'bg-gradient-to-br from-primary via-primary to-primary/90',
          'rounded-full shadow-premium-xl',
          'transition-all duration-300 ease-out-expo',
          'group-hover:scale-105 group-active:scale-95',
          'group-hover:shadow-[0_16px_48px_hsl(211_100%_50%/0.35)]',
          isLarge ? 'w-[120px] h-[120px]' : 'w-16 h-16'
        )}
      >
        {/* Inner highlight */}
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/25 to-transparent opacity-80" />
        
        {/* Icon container */}
        <div className="relative flex flex-col items-center gap-1">
          <div className={cn(
            'relative',
            isLarge ? 'mb-1' : ''
          )}>
            {isLarge ? (
              <Scan className="w-9 h-9 text-white drop-shadow-sm" strokeWidth={2} />
            ) : (
              <Camera className="w-6 h-6 text-white drop-shadow-sm" strokeWidth={2} />
            )}
          </div>
          {isLarge && (
            <span className="text-[13px] font-semibold text-white/95 tracking-wide">
              Scan
            </span>
          )}
        </div>
      </div>
    </button>
  );
}