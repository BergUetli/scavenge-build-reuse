/**
 * USAGE INDICATOR - JunkHauler Style
 * Shows remaining scans with animated gradient progress bar
 */

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageIndicatorProps {
  used: number;
  total: number;
  resetDays: number;
  className?: string;
}

export function UsageIndicator({ used, total, resetDays, className }: UsageIndicatorProps) {
  const remaining = total - used;
  const percentage = (remaining / total) * 100;
  
  // Color based on remaining
  const isLow = remaining <= 2;
  const isMedium = remaining <= 5 && remaining > 2;
  
  return (
    <div 
      className={cn(
        'w-full max-w-xs mx-auto',
        'glass-subtle rounded-2xl p-4',
        'border border-border/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap 
            className={cn(
              'w-4 h-4',
              isLow ? 'text-destructive' : isMedium ? 'text-warning' : 'text-primary'
            )} 
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-foreground tracking-wide uppercase">
            {remaining}/{total} Scans Left
          </span>
        </div>
      </div>
      
      {/* Progress bar container */}
      <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden mb-2">
        {/* Animated gradient progress */}
        <div 
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out',
            isLow 
              ? 'bg-gradient-to-r from-destructive to-destructive/70' 
              : isMedium 
                ? 'bg-gradient-to-r from-warning to-warning/70'
                : 'bg-gradient-to-r from-primary via-accent to-primary'
          )}
          style={{ 
            width: `${percentage}%`,
            backgroundSize: '200% 100%',
            animation: !isLow ? 'shimmer 2s linear infinite' : undefined,
          }}
        />
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Reset info */}
      <p className="text-xs text-muted-foreground text-center">
        Resets in <span className="font-mono font-bold text-foreground">{resetDays}</span> days
      </p>
    </div>
  );
}
