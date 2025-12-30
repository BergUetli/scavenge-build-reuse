import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { HierarchicalComponent, Dataset, AppRole } from '@/types/admin';

export function useAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user has admin role
  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    }

    checkAdminRole();
  }, [user]);

  // Fetch all components with hierarchy
  const {
    data: components,
    isLoading: componentsLoading,
    error: componentsError,
    refetch: refetchComponents,
  } = useQuery({
    queryKey: ['admin-components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('brand', { ascending: true })
        .order('component_name', { ascending: true });

      if (error) throw error;
      return data as HierarchicalComponent[];
    },
    enabled: isAdmin,
  });

  // Build hierarchical tree from flat list
  const componentTree = components ? buildComponentTree(components) : [];

  // Fetch datasets
  const {
    data: datasets,
    isLoading: datasetsLoading,
    refetch: refetchDatasets,
  } = useQuery({
    queryKey: ['admin-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dataset[];
    },
    enabled: isAdmin,
  });

  // Add component mutation
  const addComponent = useMutation({
    mutationFn: async (component: Partial<HierarchicalComponent>) => {
      const { children, ...insertData } = component;
      const { data, error } = await supabase
        .from('components')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-components'] });
      toast({ title: 'Component added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add component', description: error.message, variant: 'destructive' });
    },
  });

  // Update component mutation
  const updateComponent = useMutation({
    mutationFn: async ({ id, children, ...updates }: Partial<HierarchicalComponent> & { id: string }) => {
      const { data, error } = await supabase
        .from('components')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-components'] });
      toast({ title: 'Component updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update component', description: error.message, variant: 'destructive' });
    },
  });

  // Delete component mutation
  const deleteComponent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('components').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-components'] });
      toast({ title: 'Component deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete component', description: error.message, variant: 'destructive' });
    },
  });

  // Process dataset mutation (calls edge function)
  const processDataset = useMutation({
    mutationFn: async (datasetId: string) => {
      const { data, error } = await supabase.functions.invoke('process-dataset', {
        body: { datasetId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-datasets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-components'] });
      toast({ title: 'Dataset processing started' });
    },
    onError: (error) => {
      toast({ title: 'Failed to process dataset', description: error.message, variant: 'destructive' });
    },
  });

  return {
    isAdmin,
    components,
    componentTree,
    componentsLoading,
    componentsError,
    refetchComponents,
    datasets,
    datasetsLoading,
    refetchDatasets,
    addComponent,
    updateComponent,
    deleteComponent,
    processDataset,
  };
}

// Helper function to build tree structure
function buildComponentTree(components: HierarchicalComponent[]): HierarchicalComponent[] {
  const componentMap = new Map<string, HierarchicalComponent>();
  const roots: HierarchicalComponent[] = [];

  // First pass: create map
  components.forEach((comp) => {
    componentMap.set(comp.id, { ...comp, children: [] });
  });

  // Second pass: build tree
  components.forEach((comp) => {
    const node = componentMap.get(comp.id)!;
    if (comp.parent_component_id && componentMap.has(comp.parent_component_id)) {
      const parent = componentMap.get(comp.parent_component_id)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
