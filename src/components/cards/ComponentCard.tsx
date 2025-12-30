/**
 * COMPONENT CARD
 * 
 * Displays a component/material in a card format.
 * Shows name, category, condition, and reusability score.
 */

import { Package, Star, CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@/types';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  item: InventoryItem;
  onClick?: () => void;
  compact?: boolean;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  Electronics: 'bg-primary/10 text-primary',
  Wood: 'bg-amber-500/10 text-amber-600',
  Metal: 'bg-slate-500/10 text-slate-600',
  Fabric: 'bg-pink-500/10 text-pink-600',
  Mechanical: 'bg-orange-500/10 text-orange-600',
  Other: 'bg-muted text-muted-foreground',
};

export function ComponentCard({ item, onClick, compact = false }: ComponentCardProps) {
  const colorClass = categoryColors[item.category] || categoryColors.Other;
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        'border-border/50 bg-card/50 backdrop-blur-sm'
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className={cn(
            'flex-shrink-0 rounded-lg bg-muted flex items-center justify-center',
            compact ? 'w-12 h-12' : 'w-16 h-16'
          )}>
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.component_name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {item.component_name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={cn('text-xs', colorClass)}>
                {item.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.condition}
              </Badge>
            </div>
            
            {!compact && (
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {item.reusability_score && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-eco" />
                    {item.reusability_score}/10
                  </span>
                )}
                {item.market_value && (
                  <span className="flex items-center gap-1">
                    <CircleDollarSign className="w-3 h-3" />
                    ${item.market_value}
                  </span>
                )}
                {item.quantity > 1 && (
                  <span>Qty: {item.quantity}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
