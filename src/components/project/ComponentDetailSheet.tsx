/**
 * COMPONENT DETAIL SHEET
 * 
 * Shows details about a required component including
 * where to acquire it (buy or salvage).
 */

import { ExternalLink, ShoppingCart, Recycle, Search, Package } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RequiredComponent } from '@/types';

interface ComponentDetailSheetProps {
  component: RequiredComponent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwned?: boolean;
}

// Common salvage sources for different component types
const getSalvageSources = (componentName: string): string[] => {
  const nameLower = componentName.toLowerCase();
  
  if (nameLower.includes('resistor') || nameLower.includes('capacitor')) {
    return ['Old radios', 'TVs', 'Power supplies', 'Computer motherboards', 'LED bulbs'];
  }
  if (nameLower.includes('motor') || nameLower.includes('servo')) {
    return ['DVD/CD drives', 'Printers', 'RC toys', 'Fans', 'Hard drives'];
  }
  if (nameLower.includes('led')) {
    return ['Old electronics', 'Toys', 'Holiday lights', 'LED bulbs', 'Flashlights'];
  }
  if (nameLower.includes('switch') || nameLower.includes('button')) {
    return ['Old appliances', 'Computer peripherals', 'Toys', 'Power strips'];
  }
  if (nameLower.includes('wire') || nameLower.includes('cable')) {
    return ['Old chargers', 'Broken electronics', 'Ethernet cables', 'Extension cords'];
  }
  if (nameLower.includes('sensor')) {
    return ['Printers', 'Appliances', 'Security systems', 'Smoke detectors'];
  }
  if (nameLower.includes('speaker')) {
    return ['Old phones', 'Toys', 'Laptops', 'Headphones', 'TVs'];
  }
  if (nameLower.includes('display') || nameLower.includes('screen') || nameLower.includes('lcd')) {
    return ['Old phones', 'Calculators', 'Clocks', 'Appliances'];
  }
  if (nameLower.includes('battery') || nameLower.includes('cell')) {
    return ['Old laptops', 'Power tools', 'Phones (caution!)', 'UPS units'];
  }
  if (nameLower.includes('connector') || nameLower.includes('socket')) {
    return ['Computer power supplies', 'Old motherboards', 'Appliances'];
  }
  
  return ['Old electronics', 'Appliances', 'Toys', 'E-waste centers'];
};

// Purchase sources
const getPurchaseSources = (componentName: string): Array<{ name: string; url: string }> => {
  const encodedName = encodeURIComponent(componentName);
  
  return [
    { name: 'Digi-Key', url: `https://www.digikey.com/en/products/result?keywords=${encodedName}` },
    { name: 'Mouser', url: `https://www.mouser.com/c/?q=${encodedName}` },
    { name: 'Amazon', url: `https://www.amazon.com/s?k=${encodedName}` },
    { name: 'AliExpress', url: `https://www.aliexpress.com/wholesale?SearchText=${encodedName}` },
  ];
};

export function ComponentDetailSheet({ 
  component, 
  open, 
  onOpenChange,
  isOwned = false 
}: ComponentDetailSheetProps) {
  if (!component) return null;

  const salvageSources = getSalvageSources(component.name);
  const purchaseSources = getPurchaseSources(component.name);
  
  // Determine if component is better to salvage or buy
  const nameLower = component.name.toLowerCase();
  const salvageableCategories = ['resistor', 'capacitor', 'led', 'switch', 'wire', 'connector', 'motor', 'sensor'];
  const buyCategories = ['microcontroller', 'arduino', 'esp32', 'raspberry', 'display', 'module', 'breakout', 'shield', 'atmega'];
  
  const isSalvageable = salvageableCategories.some(cat => nameLower.includes(cat));
  const isBuyRecommended = buyCategories.some(cat => nameLower.includes(cat));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <SheetTitle className="text-lg leading-tight">
                {component.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  Qty: {component.quantity}
                </Badge>
                {component.optional && (
                  <Badge variant="secondary" className="bg-muted">Optional</Badge>
                )}
                {isOwned && (
                  <Badge className="bg-eco text-eco-foreground">In Cargo</Badge>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto pb-8">
          {/* Quick Google Search */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(component.name)}`, '_blank')}
          >
            <Search className="w-4 h-4" />
            Search on Google
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Button>

          {/* Alternatives */}
          {component.alternatives && component.alternatives.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2">Compatible Alternatives</h4>
                <div className="flex flex-wrap gap-2">
                  {component.alternatives.map((alt, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Where to Salvage */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Recycle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Where to Salvage</h4>
                  <p className="text-xs text-muted-foreground">Common sources for free parts</p>
                </div>
                {isSalvageable && (
                  <Badge className="ml-auto bg-amber-500/20 text-amber-600 border-amber-500/30">
                    Recommended
                  </Badge>
                )}
              </div>
              <ul className="space-y-1.5">
                {salvageSources.map((source, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                    {source}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Where to Buy */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Where to Buy</h4>
                  <p className="text-xs text-muted-foreground">Online retailers</p>
                </div>
                {isBuyRecommended && (
                  <Badge className="ml-auto bg-blue-500/20 text-blue-600 border-blue-500/30">
                    Recommended
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {purchaseSources.map((source, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 text-xs h-9"
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    {source.name}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <h5 className="text-xs font-medium text-foreground mb-2">💡 Acquisition Tips</h5>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              {isSalvageable && (
                <li>• This component is commonly found in old electronics - check e-waste first!</li>
              )}
              {isBuyRecommended && (
                <li>• Specialized parts like this are best purchased new for reliability.</li>
              )}
              <li>• Local electronics stores may have better prices than online for small quantities.</li>
              <li>• Consider buying in bulk if you'll need more for future projects.</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
