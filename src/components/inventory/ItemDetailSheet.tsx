/**
 * ITEM DETAIL SHEET
 * 
 * Bottom sheet showing full details of an inventory item.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, Star, CircleDollarSign, Calendar, ExternalLink, 
  Cpu, Zap, Hash, Info 
} from 'lucide-react';
import { InventoryItem, TechnicalSpecs } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ItemDetailSheetProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ItemDetailSheet({ item, open, onOpenChange }: ItemDetailSheetProps) {
  if (!item) return null;

  const style = categoryStyles[item.category] || categoryStyles.Other;
  const techSpecs = (item as any).technical_specs as TechnicalSpecs | undefined;
  const commonUses = (item as any).common_uses as string[] | undefined;
  const description = (item as any).description as string | undefined;

  const handleGoogleSearch = (query: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const handleDigiKeySearch = (partNumber: string) => {
    window.open(`https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(partNumber)}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0">
        <div className="overflow-y-auto h-full pb-safe">
          {/* Header with image */}
          <div className="px-6">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold pr-8">{item.component_name}</SheetTitle>
            </SheetHeader>

            {/* Image */}
            {item.image_url && (
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted mb-4">
                <img 
                  src={item.image_url} 
                  alt={item.component_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={cn('text-sm', style.bg, style.text)}>
                {item.category}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {item.condition}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Qty: {item.quantity}
              </Badge>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {item.reusability_score && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reusability</p>
                    <p className="font-semibold">{item.reusability_score}/10</p>
                  </div>
                </div>
              )}
              {item.market_value && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                  <CircleDollarSign className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Market Value</p>
                    <p className="font-semibold">${item.market_value}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Description */}
          {description && (
            <div className="px-6 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Description
              </h3>
              <p className="text-sm text-foreground">{description}</p>
            </div>
          )}

          {/* Technical Specs */}
          {techSpecs && Object.keys(techSpecs).length > 0 && (
            <div className="px-6 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Technical Specs
              </h3>
              <div className="space-y-2">
                {techSpecs.voltage && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Voltage
                    </span>
                    <span className="text-sm font-medium">{techSpecs.voltage}</span>
                  </div>
                )}
                {techSpecs.power_rating && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Power Rating</span>
                    <span className="text-sm font-medium">{techSpecs.power_rating}</span>
                  </div>
                )}
                {techSpecs.part_number && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" /> Part Number
                    </span>
                    <span className="text-sm font-medium font-mono">{techSpecs.part_number}</span>
                  </div>
                )}
                {techSpecs.notes && (
                  <p className="text-xs text-muted-foreground italic mt-2">{techSpecs.notes}</p>
                )}
              </div>

              {/* Quick lookup buttons */}
              {techSpecs.part_number && (
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleGoogleSearch(techSpecs.part_number!)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDigiKeySearch(techSpecs.part_number!)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Digi-Key
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Common Uses */}
          {commonUses && commonUses.length > 0 && (
            <div className="px-6 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Common Uses</h3>
              <div className="flex flex-wrap gap-1.5">
                {commonUses.map((use, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="px-6 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">{item.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="px-6 mb-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Added {format(new Date(item.date_added), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
