import React from 'react';
import { getComponentColor } from '@/constants/componentColors';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

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
      className="relative group transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.secondary
      }}
    >
      <div
        className="px-4 py-2 rounded-full border-2 flex items-center gap-2 min-w-[120px] justify-center"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.secondary
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: colors.primary }} />
        ) : null}
        
        <span 
          className="font-medium text-sm truncate max-w-[150px]"
          style={{ color: colors.text }}
        >
          {name}
        </span>
        
        {quantity > 1 && (
          <Badge 
            variant="secondary" 
            className="ml-1 h-5 min-w-[20px] px-1.5"
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF'
            }}
          >
            {quantity}
          </Badge>
        )}
      </div>
      
      {/* Hover effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: colors.primary }}
      />
    </button>
  );
}
