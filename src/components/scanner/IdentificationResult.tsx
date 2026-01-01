/**
 * IDENTIFICATION RESULT COMPONENT
 * 
 * Displays AI identification results with confidence score.
 * Allows user to confirm, edit, or reject identification.
 */

import { Check, Edit2, X, Star, CircleDollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IdentifiedItem } from '@/types';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface IdentificationResultProps {
  result: IdentifiedItem;
  imageUrl?: string;
  onConfirm: () => void;
  onEdit: () => void;
  onReject: () => void;
  isLoading?: boolean;
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

export function IdentificationResult({ 
  result, 
  imageUrl,
  onConfirm, 
  onEdit, 
  onReject,
  isLoading = false
}: IdentificationResultProps) {
  const { playClick, playSuccess, playError } = useSounds();
  const confidencePercent = Math.round(result.confidence * 100);
  const colorClass = categoryColors[result.category] || categoryColors.Other;
  
  // Confidence level indicator
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.85) return { label: 'High', color: 'text-eco' };
    if (confidence >= 0.6) return { label: 'Medium', color: 'text-amber-500' };
    return { label: 'Low', color: 'text-red-500' };
  };
  
  const confidenceLevel = getConfidenceLevel(result.confidence);
  
  return (
    <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt="Scanned item" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          
          {/* Title and category */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl line-clamp-2">{result.component_name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={colorClass}>
                {result.category}
              </Badge>
              <Badge variant="outline">{result.condition}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Confidence meter */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Confidence</span>
            <span className={cn('text-sm font-bold', confidenceLevel.color)}>
              {confidencePercent}% ({confidenceLevel.label})
            </span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
          
          {result.confidence < 0.6 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>Low confidence - please verify the identification</span>
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4 text-eco" />
              <span className="text-xs">Reusability</span>
            </div>
            <span className="text-lg font-bold">{result.reusability_score}/10</span>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CircleDollarSign className="w-4 h-4" />
              <span className="text-xs">Est. Value</span>
            </div>
            <span className="text-lg font-bold">
              ${result.market_value_low}-{result.market_value_high}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{result.description}</p>
        </div>
        
        {/* Specifications */}
        {result.specifications && Object.keys(result.specifications).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Specifications</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.specifications).slice(0, 6).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}: </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Common uses */}
        {result.common_uses && result.common_uses.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Common Uses</h4>
            <div className="flex flex-wrap gap-1">
              {result.common_uses.map((use, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => { playSuccess(); onConfirm(); }} 
            className="flex-1 bg-eco hover:bg-eco/90"
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Add to Inventory
          </Button>
          <Button variant="outline" size="icon" onClick={() => { playClick(); onEdit(); }} disabled={isLoading}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => { playError(); onReject(); }} disabled={isLoading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
