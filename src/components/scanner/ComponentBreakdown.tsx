/**
 * COMPONENT BREAKDOWN VIEW
 * 
 * iOS-native style display of identified components.
 * Features:
 * - Large bold titles
 * - Caption labels in uppercase
 * - Component images/icons based on category
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
  Package,
  Battery,
  Cpu,
  Speaker,
  Plug,
  CircuitBoard,
  Eye,
  Zap,
  Radio,
  Lightbulb,
  Cog,
  Cable,
  Disc,
  MemoryStick,
  Microchip
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

// Component category to icon and gradient mapping
const componentVisuals: Record<string, { 
  icon: React.ReactNode; 
  gradient: string;
  bgColor: string;
}> = {
  'Power': { 
    icon: <Battery className="w-10 h-10" />, 
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-600/10'
  },
  'ICs/Chips': { 
    icon: <Microchip className="w-10 h-10" />, 
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-500/20 to-purple-600/10'
  },
  'Electromechanical': { 
    icon: <Speaker className="w-10 h-10" />, 
    gradient: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10'
  },
  'Connectors': { 
    icon: <Plug className="w-10 h-10" />, 
    gradient: 'from-cyan-500 to-teal-600',
    bgColor: 'bg-gradient-to-br from-cyan-500/20 to-teal-600/10'
  },
  'PCB': { 
    icon: <CircuitBoard className="w-10 h-10" />, 
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-600/10'
  },
  'Electronics': { 
    icon: <Zap className="w-10 h-10" />, 
    gradient: 'from-primary to-primary/80',
    bgColor: 'bg-gradient-to-br from-primary/20 to-primary/10'
  },
  'Display/LEDs': { 
    icon: <Lightbulb className="w-10 h-10" />, 
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-gradient-to-br from-pink-500/20 to-rose-600/10'
  },
  'Sensors': { 
    icon: <Eye className="w-10 h-10" />, 
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/10'
  },
  'Passive Components': { 
    icon: <Disc className="w-10 h-10" />, 
    gradient: 'from-slate-500 to-gray-600',
    bgColor: 'bg-gradient-to-br from-slate-500/20 to-gray-600/10'
  },
  'Mechanical': { 
    icon: <Cog className="w-10 h-10" />, 
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-red-600/10'
  },
  'Other': { 
    icon: <Package className="w-10 h-10" />, 
    gradient: 'from-muted-foreground to-muted-foreground/80',
    bgColor: 'bg-gradient-to-br from-muted/50 to-muted/30'
  },
};

// Get visual config for a component
const getVisual = (category: string) => {
  return componentVisuals[category] || componentVisuals['Other'];
};

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
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">
              Salvageable Parts
            </p>
          </div>
        )}

        {/* Parts Grid with Images */}
        {hasComponents && (
          <div className="grid grid-cols-2 gap-3">
            {result.items.map((item, index) => {
              const isAdded = addedItems.has(item.component_name);
              const visual = getVisual(item.category);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedComponent(item);
                    setViewMode('detail');
                  }}
                  className={cn(
                    "relative rounded-2xl overflow-hidden aspect-square",
                    "active:scale-[0.97] transition-all duration-200",
                    isAdded && "ring-2 ring-eco ring-offset-2 ring-offset-background"
                  )}
                >
                  {/* Background gradient based on category */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    visual.gradient
                  )} />
                  
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-20" 
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }} 
                  />
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/90">
                    {visual.icon}
                  </div>
                  
                  {/* Bottom overlay with name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                    <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">
                      {item.component_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/70 text-xs">{item.category}</span>
                      <span className="text-white font-medium text-xs">
                        ${item.market_value_low}-{item.market_value_high}
                      </span>
                    </div>
                  </div>

                  {/* Added checkmark */}
                  {isAdded && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-eco flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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
    const visual = getVisual(selectedComponent.category);
    
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

        {/* Component Image Card */}
        <div className={cn(
          "relative rounded-3xl overflow-hidden aspect-square max-w-[200px] mx-auto",
          "shadow-xl"
        )}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            visual.gradient
          )} />
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} 
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="w-20 h-20">
              {visual.icon}
            </div>
          </div>
        </div>

        {/* Large Title */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight text-center">
          {selectedComponent.component_name}
        </h1>

        {/* Category Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className={cn("text-sm px-4 py-1", visual.bgColor)}>
            {selectedComponent.category}
          </Badge>
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