import React from 'react';
import { getComponentColor } from '@/constants/componentColors';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronRight } from 'lucide-react';

interface ComponentBubbleProps {
  name: string;
  category?: string;
  quantity?: number;
  onClick?: () => void;
  isLoading?: boolean;
}

export function ComponentBubble({ 
  name, 
  category, 
  quantity = 1, 
  onClick,
  isLoading = false 
}: ComponentBubbleProps) {
  const colors = getComponentColor(category);
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="
        w-full group relative overflow-hidden
        rounded-2xl border-2 p-3
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[80px] flex flex-col items-start justify-between
        text-left
      "
      style={{
        borderColor: colors.border,
        backgroundColor: colors.secondary,
        focusRingColor: colors.primary
      }}
    >
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-200"
        style={{ 
          background: `radial-gradient(circle at top right, ${colors.primary}, transparent)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Category badge or quantity */}
        <div className="flex items-center justify-between mb-2">
          {category && (
            <div 
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${colors.primary}20`,
                color: colors.primary
              }}
            >
              {category.slice(0, 8)}
            </div>
          )}
          
          {quantity > 1 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-[24px] px-2 font-bold"
              style={{
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              ×{quantity}
            </Badge>
          )}
        </div>
        
        {/* Component name */}
        <div className="flex items-start justify-between gap-2 w-full">
          <span 
            className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 flex-1"
            style={{ color: colors.text }}
          >
            {name}
          </span>
          
          {isLoading ? (
            <Loader2 
              className="h-4 w-4 animate-spin shrink-0 mt-0.5" 
              style={{ color: colors.primary }} 
            />
          ) : (
            <ChevronRight 
              className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" 
              style={{ color: colors.primary }}
            />
          )}
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
        style={{ backgroundColor: colors.primary }}
      />
    </button>
  );
}
