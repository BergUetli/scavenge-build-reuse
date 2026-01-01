/**
 * SCAN BUTTON - JunkHauler Style
 * Industrial, glowing, futuristic with sound feedback
 */

import { Crosshair, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface ScanButtonProps {
  onClick: () => void;
  size?: 'default' | 'large';
  className?: string;
}

export function ScanButton({ onClick, size = 'large', className }: ScanButtonProps) {
  const isLarge = size === 'large';
  const { playScan } = useSounds();

  const handleClick = () => {
    playScan();
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative group',
        className
      )}
    >
      {/* Animated pulse rings */}
      <div className="absolute inset-0 rounded-2xl bg-primary/25 pulse-scan" />
      <div 
        className="absolute inset-0 rounded-2xl bg-primary/15 animate-pulse-soft" 
        style={{ animationDelay: '0.5s' }}
      />
      
      {/* Main button */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'bg-gradient-to-br from-primary via-primary to-primary/85',
          'rounded-2xl shadow-premium-xl',
          'transition-all duration-300 ease-out-expo',
          'group-hover:scale-105 group-active:scale-95',
          'border border-primary-foreground/20',
          isLarge ? 'w-[140px] h-[140px]' : 'w-14 h-14'
        )}
        style={{
          boxShadow: isLarge 
            ? '0 0 40px hsl(199 89% 48% / 0.4), 0 16px 48px hsl(199 89% 48% / 0.25), inset 0 1px 0 rgba(255,255,255,0.2)' 
            : undefined
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-white/25 via-white/5 to-transparent" />
        
        {/* Corner brackets for targeting effect */}
        {isLarge && (
          <>
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary-foreground/50 rounded-tl" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary-foreground/50 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary-foreground/50 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary-foreground/50 rounded-br" />
          </>
        )}
        
        {/* Icon container */}
        <div className="relative flex flex-col items-center gap-2">
          <div className={cn(
            'relative',
            isLarge ? 'mb-0' : ''
          )}>
            {isLarge ? (
              <Crosshair className="w-12 h-12 text-primary-foreground drop-shadow-md" strokeWidth={1.5} />
            ) : (
              <Scan className="w-6 h-6 text-primary-foreground drop-shadow-sm" strokeWidth={2} />
            )}
          </div>
          {isLarge && (
            <span className="text-xs font-bold text-primary-foreground/90 tracking-[0.2em] uppercase">
              Scan
            </span>
          )}
        </div>
      </div>
    </button>
  );
}