/**
 * SCAN BUTTON - Dung Beetle Style
 * Bold, amber, with beetle-inspired design
 */

import { Camera, Bug } from 'lucide-react';
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
      <div className="absolute inset-0 rounded-full bg-primary/25 pulse-scan" />
      <div 
        className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-soft" 
        style={{ animationDelay: '0.5s' }}
      />
      
      {/* Main button */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'bg-gradient-to-br from-primary via-primary to-primary/85',
          'rounded-full shadow-premium-xl shimmer-shell',
          'transition-all duration-300 ease-out-expo',
          'group-hover:scale-105 group-active:scale-95',
          'border-2 border-primary-foreground/20',
          isLarge ? 'w-[130px] h-[130px]' : 'w-16 h-16'
        )}
        style={{
          boxShadow: isLarge 
            ? '0 16px 48px hsl(38 92% 40% / 0.4), 0 8px 16px hsl(38 92% 40% / 0.2), inset 0 2px 4px rgba(255,255,255,0.2)' 
            : undefined
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
        
        {/* Icon container */}
        <div className="relative flex flex-col items-center gap-1.5">
          <div className={cn(
            'relative',
            isLarge ? 'mb-0.5' : ''
          )}>
            {isLarge ? (
              <Bug className="w-10 h-10 text-primary-foreground drop-shadow-md" strokeWidth={1.5} />
            ) : (
              <Camera className="w-6 h-6 text-primary-foreground drop-shadow-sm" strokeWidth={2} />
            )}
          </div>
          {isLarge && (
            <span className="text-sm font-bold text-primary-foreground/95 tracking-wide uppercase">
              Scan
            </span>
          )}
        </div>
      </div>
    </button>
  );
}