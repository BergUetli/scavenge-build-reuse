import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getComponentColor } from '@/constants/componentColors';
import { getStockImage, FALLBACK_SVGS } from '@/lib/stockImages';
import { ExternalLink, Plus } from 'lucide-react';

interface ComponentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentName: string;
  category?: string;
  details?: {
    description?: string;
    specifications?: Record<string, any>;
    value?: string;
    reusability_score?: number;
    resale_value?: string;
    reuse_potential?: string;
    datasheet_url?: string;
    tutorial_url?: string;
  };
  onAddToInventory?: () => void;
}

export function ComponentDetailModal({
  isOpen,
  onClose,
  componentName,
  category,
  details,
  onAddToInventory
}: ComponentDetailModalProps) {
  const colors = getComponentColor(category);
  const stockImageUrl = getStockImage(componentName, category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.secondary }}
            >
              <img 
                src={FALLBACK_SVGS['component']} 
                alt={componentName}
                className="w-12 h-12"
              />
            </div>
            
            <div className="flex-1">
              <DialogTitle className="text-2xl">{componentName}</DialogTitle>
              <div className="flex gap-2 mt-2">
                {category && (
                  <Badge style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}>
                    {category}
                  </Badge>
                )}
                {details?.value && (
                  <Badge variant="outline">
                    Value: {details.value}
                  </Badge>
                )}
                {details?.reusability_score !== undefined && (
                  <Badge variant="outline">
                    Reusability: {details.reusability_score}/10
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {details?.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{details.description}</p>
            </div>
          )}

          {details?.specifications && Object.keys(details.specifications).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(details.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details?.reuse_potential && (
            <div>
              <h3 className="font-semibold mb-2">Reuse Potential</h3>
              <p className="text-sm text-muted-foreground">{details.reuse_potential}</p>
            </div>
          )}

          {details?.resale_value && (
            <div>
              <h3 className="font-semibold mb-2">Resale Value</h3>
              <p className="text-sm text-muted-foreground">{details.resale_value}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {details?.datasheet_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={details.datasheet_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Datasheet
                </a>
              </Button>
            )}
            
            {details?.tutorial_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={details.tutorial_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Tutorial
                </a>
              </Button>
            )}

            {onAddToInventory && (
              <Button 
                onClick={onAddToInventory}
                size="sm"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Inventory
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
