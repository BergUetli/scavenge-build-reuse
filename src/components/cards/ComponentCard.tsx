/**
 * COMPONENT CARD - Premium iOS Style
 */

import { Package, Star, CircleDollarSign, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@/types';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  item: InventoryItem;
  onClick?: () => void;
  compact?: boolean;
}

// Category styling
const categoryStyles: Record<string, { bg: string; text: string }> = {
  Electronics: { bg: 'bg-primary/10', text: 'text-primary' },
  Wood: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  Metal: { bg: 'bg-slate-500/10', text: 'text-slate-600' },
  Fabric: { bg: 'bg-pink-500/10', text: 'text-pink-600' },
  Mechanical: { bg: 'bg-orange-500/10', text: 'text-orange-600' },
  Other: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export function ComponentCard({ item, onClick, compact = false }: ComponentCardProps) {
  const style = categoryStyles[item.category] || categoryStyles.Other;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left card-ios overflow-hidden',
        'tap-highlight active:scale-[0.98] transition-transform duration-150'
      )}
    >
      <div className={cn('flex items-center gap-3', compact ? 'p-3' : 'p-4')}>
        {/* Thumbnail */}
        <div className={cn(
          'flex-shrink-0 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden',
          compact ? 'w-12 h-12' : 'w-14 h-14'
        )}>
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.component_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className={cn(
              'text-muted-foreground',
              compact ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-semibold text-foreground truncate',
            compact ? 'text-[15px]' : 'text-base'
          )}>
            {item.component_name}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
              style.bg, style.text
            )}>
              {item.category}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
              {item.condition}
            </span>
          </div>
          
          {!compact && (
            <div className="flex items-center gap-3 mt-2">
              {item.reusability_score && (
                <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span className="font-medium text-foreground">{item.reusability_score}</span>
                  <span>/10</span>
                </span>
              )}
              {item.market_value && (
                <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
                  <CircleDollarSign className="w-3.5 h-3.5 text-success" />
                  <span className="font-medium text-foreground">${item.market_value}</span>
                </span>
              )}
              {item.quantity > 1 && (
                <span className="text-[13px] text-muted-foreground">
                  Qty: <span className="font-medium text-foreground">{item.quantity}</span>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Chevron indicator */}
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
      </div>
    </button>
  );
}