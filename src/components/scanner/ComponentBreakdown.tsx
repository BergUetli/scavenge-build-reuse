/**
 * COMPONENT BREAKDOWN VIEW
 * 
 * iOS-native style display of identified components.
 * Features:
 * - Large bold titles
 * - Caption labels in uppercase
 * - Rounded image cards with overlays
 * - Clean grid layouts
 * - Native iOS typography
 */

import { useState } from 'react';
import { 
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  DollarSign,
  Wrench,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIIdentificationResponse, IdentifiedItem } from '@/types';
import { cn } from '@/lib/utils';

interface ComponentBreakdownProps {
  result: AIIdentificationResponse;
  imageUrl?: string;
  onAddComponent: (item: IdentifiedItem) => void;
  onAddAll: () => void;
  onRescan: () => void;
  isLoading?: boolean;
}

// Difficulty display
const difficultyConfig: Record<string, { label: string; color: string }> = {
  Easy: { label: 'Easy', color: 'text-eco' },
  Medium: { label: 'Medium', color: 'text-amber-500' },
  Hard: { label: 'Hard', color: 'text-red-500' },
};

type ViewMode = 'main' | 'detail';

export function ComponentBreakdown({ 
  result, 
  imageUrl,
  onAddComponent,
  onAddAll,
  onRescan,
  isLoading = false
}: ComponentBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedComponent, setSelectedComponent] = useState<IdentifiedItem | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAddComponent = (item: IdentifiedItem) => {
    onAddComponent(item);
    setAddedItems(prev => new Set(prev).add(item.component_name));
  };

  const hasComponents = result.items && result.items.length > 0;
  const difficulty = result.salvage_difficulty ? difficultyConfig[result.salvage_difficulty] : null;

  // Main view - iOS native style
  if (viewMode === 'main') {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Large Title */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {result.parent_object || 'Identified Item'}
        </h1>

        {/* Caption Section */}
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-1">
            Salvage Info
          </p>
          <p className="text-xl font-semibold text-foreground">
            {hasComponents ? `${result.items.length} Parts Found` : 'No Parts Found'}
          </p>
          <p className="text-lg text-muted-foreground">
            {result.total_estimated_value_low !== undefined 
              ? `$${result.total_estimated_value_low} - $${result.total_estimated_value_high} total value`
              : 'Value unknown'}
          </p>
        </div>

        {/* Main Image Card */}
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
            <img 
              src={imageUrl} 
              alt="Scanned item" 
              className="w-full h-full object-cover"
            />
            {/* Overlay Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white/80 text-sm">
                {difficulty ? `${difficulty.label} to salvage` : 'Tap below to see parts'}
              </p>
            </div>
          </div>
        )}

        {/* Tools Section */}
        {result.tools_needed && result.tools_needed.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Tools Needed
            </p>
            <div className="flex flex-wrap gap-2">
              {result.tools_needed.slice(0, 4).map((tool, idx) => (
                <span 
                  key={idx} 
                  className="text-base text-foreground bg-muted/50 px-3 py-1.5 rounded-lg"
                >
                  {tool}
                </span>
              ))}
              {result.tools_needed.length > 4 && (
                <span className="text-base text-muted-foreground px-3 py-1.5">
                  +{result.tools_needed.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Parts Section Header */}
        {hasComponents && (
          <button 
            className="flex items-center gap-2 group"
            onClick={() => {
              setSelectedComponent(result.items[0]);
              setViewMode('detail');
            }}
          >
            <span className="text-2xl font-semibold text-foreground">Parts</span>
            <ChevronRight className="w-6 h-6 text-muted-foreground group-active:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Parts Grid */}
        {hasComponents && (
          <div className="grid grid-cols-2 gap-3">
            {result.items.slice(0, 6).map((item, index) => {
              const isAdded = addedItems.has(item.component_name);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedComponent(item);
                    setViewMode('detail');
                  }}
                  className={cn(
                    "relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-muted to-muted/50",
                    "active:scale-[0.97] transition-transform",
                    isAdded && "ring-2 ring-eco"
                  )}
                >
                  {/* Category color overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  
                  {/* Icon placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  
                  {/* Bottom overlay with name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <p className="text-white text-sm font-medium line-clamp-2 leading-tight">
                      {item.component_name}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      ${item.market_value_low}-{item.market_value_high}
                    </p>
                  </div>

                  {/* Added checkmark */}
                  {isAdded && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-eco flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Show more indicator */}
        {hasComponents && result.items.length > 6 && (
          <p className="text-center text-muted-foreground text-sm">
            +{result.items.length - 6} more parts
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-eco hover:bg-eco/90"
            onClick={onAddAll}
            disabled={isLoading || !hasComponents || addedItems.size === result.items.length}
          >
            {addedItems.size === result.items.length ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                All Saved
              </>
            ) : (
              'Save All Parts'
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 text-base text-muted-foreground"
            onClick={onRescan}
          >
            Scan Another Item
          </Button>
        </div>
      </div>
    );
  }

  // Detail view - single component
  if (viewMode === 'detail' && selectedComponent) {
    const isAdded = addedItems.has(selectedComponent.component_name);
    const confidence = Math.round((selectedComponent.confidence || 0.7) * 100);
    const currentIndex = result.items.findIndex(i => i.component_name === selectedComponent.component_name);
    
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('main')}
          className="flex items-center gap-1 text-primary font-medium text-lg active:opacity-70"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Back</span>
        </button>

        {/* Large Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
          {selectedComponent.component_name}
        </h1>

        {/* Caption Section */}
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-1">
            Category
          </p>
          <p className="text-xl font-semibold text-foreground">
            {selectedComponent.category}
          </p>
          <p className="text-lg text-muted-foreground">
            {selectedComponent.condition} condition
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Value
            </p>
            <div className="flex items-baseline gap-1">
              <DollarSign className="w-5 h-5 text-eco" />
              <span className="text-3xl font-bold">{selectedComponent.market_value_low}</span>
              <span className="text-xl text-muted-foreground">- {selectedComponent.market_value_high}</span>
            </div>
          </div>
          
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Reusability
            </p>
            <div className="flex items-baseline gap-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-3xl font-bold">{selectedComponent.reusability_score}</span>
              <span className="text-xl text-muted-foreground">/10</span>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Confidence
            </p>
            <span className="text-lg font-semibold">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {confidence >= 85 ? "High confidence match" : 
             confidence >= 60 ? "Good match" : 
             "Best estimate"}
          </p>
        </div>

        {/* Description */}
        {selectedComponent.description && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Description
            </p>
            <p className="text-base text-foreground leading-relaxed">
              {selectedComponent.description}
            </p>
          </div>
        )}

        {/* Specifications */}
        {selectedComponent.specifications && Object.keys(selectedComponent.specifications).length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">
              Specifications
            </p>
            <div className="rounded-2xl bg-muted/30 divide-y divide-border/50">
              {Object.entries(selectedComponent.specifications).slice(0, 6).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center px-4 py-3">
                  <span className="text-muted-foreground capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-sm">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Uses */}
        {selectedComponent.common_uses && selectedComponent.common_uses.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Common Uses
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedComponent.common_uses.map((use, idx) => (
                <span 
                  key={idx} 
                  className="text-sm bg-muted/50 px-3 py-1.5 rounded-lg"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation between parts */}
        {result.items.length > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : result.items.length - 1;
                setSelectedComponent(result.items[prevIndex]);
              }}
              className="flex items-center gap-1 text-primary active:opacity-70"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} of {result.items.length}
            </span>
            <button
              onClick={() => {
                const nextIndex = currentIndex < result.items.length - 1 ? currentIndex + 1 : 0;
                setSelectedComponent(result.items[nextIndex]);
              }}
              className="flex items-center gap-1 text-primary active:opacity-70"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Button */}
        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-lg font-semibold rounded-2xl",
            isAdded ? "bg-muted text-muted-foreground" : "bg-eco hover:bg-eco/90"
          )}
          disabled={isLoading || isAdded}
          onClick={() => handleAddComponent(selectedComponent)}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Saved
            </>
          ) : (
            'Add to Inventory'
          )}
        </Button>
      </div>
    );
  }

  return null;
}