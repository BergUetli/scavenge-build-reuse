/**
 * COMPONENT BREAKDOWN VIEW
 * 
 * Displays the full AI identification breakdown including:
 * - Parent object identification
 * - Salvage difficulty and tools needed
 * - Total estimated value
 * - List of all salvageable components
 */

import { useState } from 'react';
import { 
  Wrench, 
  DollarSign, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Package,
  Check,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

// Category color mapping
const categoryColors: Record<string, string> = {
  Electronics: 'bg-primary/10 text-primary border-primary/20',
  Power: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'ICs/Chips': 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  Electromechanical: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Connectors: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  PCB: 'bg-green-500/10 text-green-600 border-green-500/20',
  'Display/LEDs': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  Sensors: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  Other: 'bg-muted text-muted-foreground border-muted',
};

// Difficulty color mapping
const difficultyColors: Record<string, string> = {
  Easy: 'bg-eco/10 text-eco',
  Medium: 'bg-amber-500/10 text-amber-600',
  Hard: 'bg-red-500/10 text-red-600',
};

export function ComponentBreakdown({ 
  result, 
  imageUrl,
  onAddComponent,
  onAddAll,
  onRescan,
  isLoading = false
}: ComponentBreakdownProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddComponent = (item: IdentifiedItem, index: number) => {
    onAddComponent(item);
    setAddedItems(prev => new Set(prev).add(index));
  };

  const hasParentObject = !!result.parent_object;
  const hasComponents = result.items && result.items.length > 0;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Parent Object Header */}
      {hasParentObject && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              {imageUrl && (
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt="Scanned item" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Identified Device</p>
                <CardTitle className="text-xl">{result.parent_object}</CardTitle>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.salvage_difficulty && (
                    <Badge className={cn('text-xs', difficultyColors[result.salvage_difficulty])}>
                      <Wrench className="w-3 h-3 mr-1" />
                      {result.salvage_difficulty} Salvage
                    </Badge>
                  )}
                  {result.total_estimated_value_low !== undefined && result.total_estimated_value_high !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${result.total_estimated_value_low} - ${result.total_estimated_value_high} total
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          {/* Tools Needed */}
          {result.tools_needed && result.tools_needed.length > 0 && (
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-2">Tools Required:</p>
              <div className="flex flex-wrap gap-1">
                {result.tools_needed.map((tool, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Components List */}
      {hasComponents && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Package className="w-4 h-4 inline mr-1" />
              {result.items.length} Salvageable Component{result.items.length !== 1 ? 's' : ''}
            </h3>
            <Button 
              size="sm" 
              onClick={onAddAll}
              disabled={isLoading || addedItems.size === result.items.length}
              className="bg-eco hover:bg-eco/90"
            >
              <Check className="w-3 h-3 mr-1" />
              Add All
            </Button>
          </div>
          
          <div className="space-y-2">
            {result.items.map((item, index) => {
              const isExpanded = expandedItems.has(index);
              const isAdded = addedItems.has(index);
              const confidencePercent = Math.round((item.confidence || 0.7) * 100);
              const colorClass = categoryColors[item.category] || categoryColors.Other;
              
              return (
                <Collapsible key={index} open={isExpanded} onOpenChange={() => toggleExpand(index)}>
                  <Card className={cn(
                    'transition-all duration-200',
                    isAdded && 'opacity-60 bg-eco/5 border-eco/30'
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{item.component_name}</span>
                              {isAdded && <Check className="w-4 h-4 text-eco flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn('text-xs', colorClass)}>
                                {item.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {confidencePercent}% confidence
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold">
                              ${item.market_value_low}-{item.market_value_high}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-3 px-3 space-y-3">
                        {/* Confidence & Reusability */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted/30 rounded-md p-2">
                            <span className="text-xs text-muted-foreground">Confidence</span>
                            <Progress value={confidencePercent} className="h-1.5 mt-1" />
                          </div>
                          <div className="bg-muted/30 rounded-md p-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Reusability</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500" />
                              <span className="text-sm font-medium">{item.reusability_score}/10</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                        
                        {/* Specifications */}
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(item.specifications).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-muted-foreground">{key}: </span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Button */}
                        <Button
                          size="sm"
                          variant={isAdded ? 'secondary' : 'default'}
                          className="w-full"
                          disabled={isLoading || isAdded}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddComponent(item, index);
                          }}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Added to Inventory
                            </>
                          ) : (
                            'Add to Inventory'
                          )}
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}

      {/* No components found */}
      {!hasComponents && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">No salvageable components detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.message || 'Try taking clearer photos from different angles, showing internal components if possible.'}
                </p>
                {result.partial_detection && Object.keys(result.partial_detection).length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground">Partial detection: </span>
                    {Object.entries(result.partial_detection)
                      .filter(([_, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rescan Button */}
      <Button variant="outline" className="w-full" onClick={onRescan} disabled={isLoading}>
        Scan Another Device
      </Button>
    </div>
  );
}