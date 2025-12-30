/**
 * COMPONENT BREAKDOWN VIEW
 * 
 * iPhone-friendly hierarchical display of identified components.
 * Features:
 * - Large tappable tiles for parent object
 * - Drill-down navigation into component hierarchy
 * - Child-friendly text and icons
 * - List view option for quick scanning
 */

import { useState } from 'react';
import { 
  Wrench, 
  DollarSign, 
  ChevronRight,
  ChevronLeft,
  Package,
  Check,
  Star,
  Layers,
  List,
  Sparkles,
  Zap,
  Battery,
  Cpu,
  Speaker,
  Plug,
  CircuitBoard,
  Eye
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

// Category to icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  Power: <Battery className="w-6 h-6" />,
  'ICs/Chips': <Cpu className="w-6 h-6" />,
  Electromechanical: <Speaker className="w-6 h-6" />,
  Connectors: <Plug className="w-6 h-6" />,
  PCB: <CircuitBoard className="w-6 h-6" />,
  Electronics: <Zap className="w-6 h-6" />,
  Sensors: <Eye className="w-6 h-6" />,
};

// Category color mapping
const categoryColors: Record<string, string> = {
  Power: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  'ICs/Chips': 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
  Electromechanical: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  Connectors: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30',
  PCB: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  Electronics: 'from-primary/20 to-primary/10 border-primary/30',
  'Display/LEDs': 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
  Sensors: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30',
  Other: 'from-muted to-muted/50 border-border',
};

// Difficulty display
const difficultyConfig: Record<string, { label: string; emoji: string; color: string }> = {
  Easy: { label: 'Easy to take apart', emoji: '✅', color: 'text-eco' },
  Medium: { label: 'Some tools needed', emoji: '🔧', color: 'text-amber-500' },
  Hard: { label: 'Tricky - be careful!', emoji: '⚠️', color: 'text-red-500' },
};

type ViewMode = 'main' | 'list' | 'detail';

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

  // Main view - shows parent object tile
  if (viewMode === 'main') {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Success Header */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-eco/10 text-eco px-4 py-2 rounded-full">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-lg">Found it!</span>
          </div>
        </div>

        {/* Parent Object Tile */}
        <button
          onClick={() => hasComponents && setViewMode('list')}
          className={cn(
            "w-full text-left rounded-3xl p-6 transition-all duration-300",
            "bg-gradient-to-br from-primary/10 via-background to-primary/5",
            "border-2 border-primary/20 shadow-lg",
            "active:scale-[0.98] hover:shadow-xl hover:border-primary/40",
            hasComponents && "cursor-pointer"
          )}
        >
          <div className="flex items-start gap-4">
            {/* Image */}
            {imageUrl && (
              <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden flex-shrink-0 shadow-md">
                <img src={imageUrl} alt="Scanned item" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Object Name */}
              <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
                {result.parent_object || 'Unknown Device'}
              </h1>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {hasComponents && (
                  <Badge className="bg-primary/20 text-primary border-0 text-sm px-3 py-1">
                    <Package className="w-4 h-4 mr-1.5" />
                    {result.items.length} parts inside
                  </Badge>
                )}
                {result.total_estimated_value_low !== undefined && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${result.total_estimated_value_low}-{result.total_estimated_value_high}
                  </Badge>
                )}
              </div>

              {/* Difficulty */}
              {difficulty && (
                <p className={cn("text-base", difficulty.color)}>
                  {difficulty.emoji} {difficulty.label}
                </p>
              )}
            </div>

            {/* Arrow indicator */}
            {hasComponents && (
              <ChevronRight className="w-8 h-8 text-muted-foreground flex-shrink-0 mt-4" />
            )}
          </div>
        </button>

        {/* Tools Needed */}
        {result.tools_needed && result.tools_needed.length > 0 && (
          <div className="bg-muted/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-lg">You'll need:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tools_needed.map((tool, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3 rounded-full">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 text-lg rounded-2xl"
            onClick={() => setViewMode('list')}
            disabled={!hasComponents}
          >
            <List className="w-5 h-5 mr-2" />
            See All Parts
          </Button>
          <Button
            size="lg"
            className="h-14 text-lg rounded-2xl bg-eco hover:bg-eco/90"
            onClick={onAddAll}
            disabled={isLoading || !hasComponents}
          >
            <Check className="w-5 h-5 mr-2" />
            Save All
          </Button>
        </div>

        {/* Scan Again */}
        <Button 
          variant="ghost" 
          className="w-full h-12 text-base text-muted-foreground" 
          onClick={onRescan}
        >
          Scan something else
        </Button>
      </div>
    );
  }

  // List view - shows all components as tiles
  if (viewMode === 'list') {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Back Header */}
        <button
          onClick={() => setViewMode('main')}
          className="flex items-center gap-2 text-primary font-semibold text-lg active:opacity-70"
        >
          <ChevronLeft className="w-6 h-6" />
          Back
        </button>

        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Parts Inside
          </h2>
          <Badge variant="outline" className="text-base px-3 py-1">
            {result.items.length} found
          </Badge>
        </div>

        {/* Component Tiles */}
        <div className="space-y-3">
          {result.items.map((item, index) => {
            const isAdded = addedItems.has(item.component_name);
            const colorClass = categoryColors[item.category] || categoryColors.Other;
            const icon = categoryIcons[item.category] || <Package className="w-6 h-6" />;
            const confidence = Math.round((item.confidence || 0.7) * 100);
            
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedComponent(item);
                  setViewMode('detail');
                }}
                className={cn(
                  "w-full text-left rounded-2xl p-4 transition-all duration-200",
                  "bg-gradient-to-br border-2 shadow-sm",
                  colorClass,
                  "active:scale-[0.98] hover:shadow-md",
                  isAdded && "opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-background/50 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="text-lg font-semibold truncate pr-2">
                      {item.component_name}
                    </h3>
                    
                    {/* Category & Value */}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                      <span className="text-sm font-medium">
                        ${item.market_value_low}-{item.market_value_high}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={confidence} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{confidence}%</span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isAdded ? (
                      <div className="w-8 h-8 rounded-full bg-eco/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-eco" />
                      </div>
                    ) : (
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add All Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg rounded-2xl bg-eco hover:bg-eco/90 mt-4"
          onClick={onAddAll}
          disabled={isLoading || addedItems.size === result.items.length}
        >
          <Check className="w-5 h-5 mr-2" />
          {addedItems.size === result.items.length ? 'All Saved!' : 'Save All Parts'}
        </Button>
      </div>
    );
  }

  // Detail view - shows single component details
  if (viewMode === 'detail' && selectedComponent) {
    const isAdded = addedItems.has(selectedComponent.component_name);
    const confidence = Math.round((selectedComponent.confidence || 0.7) * 100);
    const icon = categoryIcons[selectedComponent.category] || <Package className="w-8 h-8" />;
    
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Back Header */}
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center gap-2 text-primary font-semibold text-lg active:opacity-70"
        >
          <ChevronLeft className="w-6 h-6" />
          All Parts
        </button>

        {/* Component Header */}
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <h1 className="text-2xl font-bold mb-2">{selectedComponent.component_name}</h1>
          <Badge variant="outline" className="text-base px-4 py-1">
            {selectedComponent.category}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Star className="w-5 h-5 fill-amber-500" />
              <span className="text-2xl font-bold">{selectedComponent.reusability_score}</span>
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
            <p className="text-sm text-muted-foreground">Reusability</p>
          </div>
          
          <div className="bg-muted/30 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-5 h-5 text-eco" />
              <span className="text-2xl font-bold">{selectedComponent.market_value_low}-{selectedComponent.market_value_high}</span>
            </div>
            <p className="text-sm text-muted-foreground">Value</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">How sure are we?</span>
            <span className="font-bold text-lg">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {confidence >= 85 ? "Very confident! 🎯" : 
             confidence >= 60 ? "Pretty sure 👍" : 
             "Best guess 🤔"}
          </p>
        </div>

        {/* Description */}
        {selectedComponent.description && (
          <div className="bg-muted/30 rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-2">What is it?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {selectedComponent.description}
            </p>
          </div>
        )}

        {/* Specs */}
        {selectedComponent.specifications && Object.keys(selectedComponent.specifications).length > 0 && (
          <div className="bg-muted/30 rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-3">Details</h3>
            <div className="space-y-2">
              {Object.entries(selectedComponent.specifications).slice(0, 6).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Uses */}
        {selectedComponent.common_uses && selectedComponent.common_uses.length > 0 && (
          <div className="bg-muted/30 rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-3">What can you make?</h3>
            <div className="flex flex-wrap gap-2">
              {selectedComponent.common_uses.map((use, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3 rounded-full">
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-lg rounded-2xl",
            isAdded ? "bg-muted text-muted-foreground" : "bg-eco hover:bg-eco/90"
          )}
          disabled={isLoading || isAdded}
          onClick={() => handleAddComponent(selectedComponent)}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Add to My Parts
            </>
          )}
        </Button>
      </div>
    );
  }

  return null;
}