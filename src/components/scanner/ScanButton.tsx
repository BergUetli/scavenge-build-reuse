/**
 * SCAN BUTTON COMPONENT
 * 
 * Large, prominent button for initiating component scanning.
 * Animated with pulse effect to draw attention.
 */

import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScanButtonProps {
  onClick: () => void;
  size?: 'default' | 'large';
  className?: string;
}

export function ScanButton({ onClick, size = 'large', className }: ScanButtonProps) {
  const isLarge = size === 'large';
  
  return (
    <div className={cn('relative', className)}>
      {/* Animated pulse ring */}
      <div 
        className={cn(
          'absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow',
          isLarge ? 'scale-110' : 'scale-105'
        )} 
      />
      
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          'relative rounded-full shadow-glow transition-all duration-300 hover:scale-105',
          'bg-gradient-primary hover:bg-gradient-primary',
          isLarge ? 'w-32 h-32' : 'w-16 h-16'
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <Camera className={isLarge ? 'w-10 h-10' : 'w-6 h-6'} />
          {isLarge && <span className="text-sm font-semibold">Scan</span>}
        </div>
      </Button>
    </div>
  );
}
