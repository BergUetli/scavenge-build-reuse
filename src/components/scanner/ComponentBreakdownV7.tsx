import React, { useState } from 'react';
import { ComponentBubble } from './ComponentBubble';
import { ComponentDetailModal } from './ComponentDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Package } from 'lucide-react';
import { sortByCategory } from '@/constants/componentColors';
import { stage3_getComponentDetails } from '@/lib/scanFlow';
import { toast } from '@/hooks/use-toast';

interface Component {
  name: string;
  category?: string;
  quantity?: number;
}

interface ComponentBreakdownV7Props {
  deviceName: string;
  components: Component[];
  isLoading?: boolean;
  onAddComponent?: (component: any) => void;
  onAddAll?: () => void;
}

export function ComponentBreakdownV7({
  deviceName,
  components,
  isLoading = false,
  onAddComponent,
  onAddAll
}: ComponentBreakdownV7Props) {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [componentDetails, setComponentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const sortedComponents = sortByCategory(components);

  const handleComponentClick = async (component: Component) => {
    setSelectedComponent(component);
    setModalOpen(true);
    setLoadingDetails(true);
    
    try {
      const details = await stage3_getComponentDetails(component.name, deviceName);
      setComponentDetails(details);
    } catch (error) {
      console.error('Failed to load component details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load component details',
        variant: 'destructive'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedComponent(null);
    setComponentDetails(null);
  };

  const handleAddToInventory = () => {
    if (selectedComponent && onAddComponent) {
      onAddComponent({
        name: selectedComponent.name,
        category: selectedComponent.category,
        quantity: selectedComponent.quantity || 1,
        ...componentDetails
      });
      handleCloseModal();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading components...</p>
      </div>
    );
  }

  if (!components || components.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No components found
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Modern Header Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 sm:p-6 border border-primary/20 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Device icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            
            {/* Device name - responsive text size */}
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 line-clamp-2">
              {deviceName}
            </h2>
            
            {/* Component count badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                {components.length} component{components.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Add All button - hide on small screens, show on medium+ */}
          {onAddAll && (
            <Button 
              onClick={onAddAll} 
              size="default"
              className="hidden sm:flex shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add All
            </Button>
          )}
        </div>
        
        {/* Add All button for mobile - full width */}
        {onAddAll && (
          <Button 
            onClick={onAddAll} 
            size="default"
            className="w-full mt-4 sm:hidden"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add All to Inventory
          </Button>
        )}
      </div>

      {/* Component Bubbles - Optimized mobile grid */}
      <div className="px-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
          Tap a component to view details
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {sortedComponents.map((component, index) => (
            <ComponentBubble
              key={`${component.name}-${index}`}
              name={component.name}
              category={component.category}
              quantity={component.quantity}
              onClick={() => handleComponentClick(component)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComponent && (
        <ComponentDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          componentName={selectedComponent.name}
          category={selectedComponent.category}
          details={loadingDetails ? undefined : componentDetails}
          onAddToInventory={onAddComponent ? handleAddToInventory : undefined}
        />
      )}
    </div>
  );
}
