import React, { useState } from 'react';
import { ComponentBubble } from './ComponentBubble';
import { ComponentDetailModal } from './ComponentDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{deviceName}</h2>
          <p className="text-sm text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''} identified
          </p>
        </div>
        
        {onAddAll && (
          <Button onClick={onAddAll} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add All to Inventory
          </Button>
        )}
      </div>

      {/* Component Bubbles Grid */}
      <div className="flex flex-wrap gap-3">
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
