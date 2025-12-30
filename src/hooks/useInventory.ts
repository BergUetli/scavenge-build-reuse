/**
 * INVENTORY HOOK
 * 
 * Provides CRUD operations for user's component inventory.
 * Handles fetching, adding, updating, and deleting inventory items.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryItem, AddInventoryInput, UpdateInventoryInput, ComponentCategory, ItemCondition, ItemStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

// Type guard for valid categories
const isValidCategory = (cat: string): cat is ComponentCategory => {
  return ['Electronics', 'Wood', 'Metal', 'Fabric', 'Mechanical', 'Other'].includes(cat);
};

// Type guard for valid conditions
const isValidCondition = (cond: string): cond is ItemCondition => {
  return ['New', 'Good', 'Fair', 'For Parts'].includes(cond);
};

// Type guard for valid statuses
const isValidStatus = (status: string): status is ItemStatus => {
  return ['Available', 'In Use', 'Used'].includes(status);
};

/**
 * Hook for managing user inventory
 */
export function useInventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all inventory items for current user
  const {
    data: inventory = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory', user?.id],
    queryFn: async (): Promise<InventoryItem[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('date_added', { ascending: false });

      if (error) throw error;
      
      // Transform and validate data
      return (data || []).map(item => ({
        ...item,
        category: isValidCategory(item.category) ? item.category : 'Other',
        condition: isValidCondition(item.condition) ? item.condition : 'Good',
        status: isValidStatus(item.status) ? item.status : 'Available',
        specifications: item.specifications as Record<string, unknown>
      }));
    },
    enabled: !!user
  });

  // Add item to inventory (also adds to shared components database if new)
  const addItem = useMutation({
    mutationFn: async (input: AddInventoryInput) => {
      if (!user) throw new Error('Not authenticated');

      // First, check if component exists in the shared components database
      const { data: existingComponent } = await supabase
        .from('components')
        .select('id')
        .eq('component_name', input.component_name)
        .maybeSingle();

      // If component doesn't exist in shared database, add it
      if (!existingComponent) {
        console.log('[Inventory] Adding new component to shared database:', input.component_name);
        
        // Prepare specifications with technical_specs merged
        const mergedSpecs = {
          ...(input.specifications || {}),
          technical_specs: input.technical_specs || {}
        } as { [key: string]: string | number | boolean | null | object };

        const { error: componentError } = await supabase
          .from('components')
          .insert([{
            component_name: input.component_name,
            category: input.category,
            specifications: mergedSpecs as { [key: string]: string | number | boolean | null },
            reusability_score: input.reusability_score,
            market_value: input.market_value,
            image_url: input.image_url,
            description: input.description,
            common_uses: input.common_uses || [],
            source: 'scan',
            verified: false
          }]);

        if (componentError) {
          console.error('[Inventory] Failed to add to shared database:', componentError);
          // Don't throw - continue to add to user inventory
        } else {
          console.log('[Inventory] Component added to shared database');
        }
      } else {
        console.log('[Inventory] Component already exists in shared database:', input.component_name);
      }

      // Now add to user's personal inventory
      const { data, error } = await supabase
        .from('user_inventory')
        .insert([{
          user_id: user.id,
          component_name: input.component_name,
          category: input.category,
          quantity: input.quantity || 1,
          condition: input.condition,
          specifications: (input.specifications || {}) as { [key: string]: string | number | boolean | null },
          technical_specs: (input.technical_specs || {}) as { [key: string]: string | number | boolean | null },
          reusability_score: input.reusability_score,
          market_value: input.market_value,
          image_url: input.image_url,
          notes: input.notes,
          description: input.description,
          common_uses: input.common_uses || []
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update inventory item
  const updateItem = useMutation({
    mutationFn: async (input: UpdateInventoryInput) => {
      if (!user) throw new Error('Not authenticated');

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('user_inventory')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
      toast({
        title: 'Updated',
        description: 'Inventory item updated.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete inventory item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_inventory')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
      toast({
        title: 'Deleted',
        description: 'Item removed from inventory.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Calculate inventory stats
  const stats = {
    totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.market_value || 0) * item.quantity, 0),
    availableItems: inventory.filter(item => item.status === 'Available').length,
    categories: [...new Set(inventory.map(item => item.category))]
  };

  return {
    inventory,
    isLoading,
    error,
    refetch,
    addItem,
    updateItem,
    deleteItem,
    stats
  };
}
