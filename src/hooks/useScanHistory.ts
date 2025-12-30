/**
 * SCAN HISTORY HOOK
 * 
 * Tracks and retrieves user's scan history.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScanHistoryItem, AIIdentificationResponse, ComponentCategory } from '@/types';

// Type guard for valid categories
const isValidCategory = (cat: string): cat is ComponentCategory => {
  return ['Electronics', 'Wood', 'Metal', 'Fabric', 'Mechanical', 'Other'].includes(cat);
};

/**
 * Hook for managing scan history
 */
export function useScanHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch scan history
  const {
    data: history = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['scan-history', user?.id],
    queryFn: async (): Promise<ScanHistoryItem[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        category: isValidCategory(item.category) ? item.category : 'Other',
        ai_response: item.ai_response as unknown as AIIdentificationResponse | null
      }));
    },
    enabled: !!user
  });

  // Add scan to history
  const addScan = useMutation({
    mutationFn: async (scan: {
      component_name: string;
      category: ComponentCategory;
      confidence?: number;
      image_url?: string;
      ai_response?: AIIdentificationResponse;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('scan_history')
        .insert([{
          user_id: user.id,
          component_name: scan.component_name,
          category: scan.category,
          confidence: scan.confidence,
          image_url: scan.image_url,
          ai_response: (scan.ai_response || null) as never
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-history', user?.id] });
    }
  });

  // Clear all scan history
  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan-history', user?.id] });
    }
  });

  return {
    history,
    isLoading,
    error,
    addScan,
    clearHistory
  };
}
