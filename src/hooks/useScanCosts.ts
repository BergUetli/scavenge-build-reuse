/**
 * SCAN COSTS HOOK
 * 
 * Hook for fetching and managing AI scan costs per user.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScanCostRecord {
  id: string;
  user_id: string;
  scan_id: string | null;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  is_correction: boolean;
  created_at: string;
}

export interface UserCostSummary {
  user_id: string;
  display_name: string;
  email: string;
  total_scans: number;
  total_corrections: number;
  total_cost: number;
  last_scan_at: string | null;
}

export function useScanCosts() {
  const { user } = useAuth();
  const [costs, setCosts] = useState<ScanCostRecord[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's costs
  const fetchCosts = useCallback(async () => {
    if (!user) {
      setCosts([]);
      setTotalCost(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('scan_costs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const records = (data || []) as ScanCostRecord[];
      setCosts(records);
      
      // Calculate total
      const total = records.reduce((sum, r) => sum + Number(r.cost_usd), 0);
      setTotalCost(total);
    } catch (err) {
      console.error('[useScanCosts] Error fetching costs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch costs');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  // Get costs breakdown by provider
  const getCostsByProvider = useCallback(() => {
    const byProvider: Record<string, { count: number; cost: number }> = {};
    
    costs.forEach(c => {
      if (!byProvider[c.provider]) {
        byProvider[c.provider] = { count: 0, cost: 0 };
      }
      byProvider[c.provider].count++;
      byProvider[c.provider].cost += Number(c.cost_usd);
    });

    return byProvider;
  }, [costs]);

  // Get monthly breakdown
  const getMonthlyBreakdown = useCallback(() => {
    const byMonth: Record<string, { count: number; cost: number }> = {};
    
    costs.forEach(c => {
      const month = new Date(c.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!byMonth[month]) {
        byMonth[month] = { count: 0, cost: 0 };
      }
      byMonth[month].count++;
      byMonth[month].cost += Number(c.cost_usd);
    });

    return byMonth;
  }, [costs]);

  return {
    costs,
    totalCost,
    isLoading,
    error,
    refetch: fetchCosts,
    getCostsByProvider,
    getMonthlyBreakdown,
    totalScans: costs.length,
    totalCorrections: costs.filter(c => c.is_correction).length
  };
}

/**
 * Admin hook for viewing all user costs
 */
export function useAdminScanCosts() {
  const [userSummaries, setUserSummaries] = useState<UserCostSummary[]>([]);
  const [allCosts, setAllCosts] = useState<ScanCostRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all costs (admin can see all via RLS policy)
      const { data: costsData, error: costsError } = await supabase
        .from('scan_costs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (costsError) throw costsError;

      const costs = (costsData || []) as ScanCostRecord[];
      setAllCosts(costs);

      // Get unique user IDs
      const userIds = [...new Set(costs.map(c => c.user_id))];

      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p.display_name || 'Unknown'])
      );

      // Group costs by user
      const userCostsMap = new Map<string, ScanCostRecord[]>();
      costs.forEach(c => {
        if (!userCostsMap.has(c.user_id)) {
          userCostsMap.set(c.user_id, []);
        }
        userCostsMap.get(c.user_id)!.push(c);
      });

      // Build summaries
      const summaries: UserCostSummary[] = [];
      userCostsMap.forEach((userCosts, userId) => {
        const totalCost = userCosts.reduce((sum, c) => sum + Number(c.cost_usd), 0);
        const corrections = userCosts.filter(c => c.is_correction).length;
        const lastScan = userCosts[0]?.created_at || null;

        summaries.push({
          user_id: userId,
          display_name: profileMap.get(userId) || 'Unknown User',
          email: '', // Not accessible for privacy
          total_scans: userCosts.length - corrections,
          total_corrections: corrections,
          total_cost: totalCost,
          last_scan_at: lastScan
        });
      });

      // Sort by total cost descending
      summaries.sort((a, b) => b.total_cost - a.total_cost);
      setUserSummaries(summaries);

    } catch (err) {
      console.error('[useAdminScanCosts] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch costs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCosts();
  }, [fetchAllCosts]);

  const getTotalPlatformCost = useCallback(() => {
    return allCosts.reduce((sum, c) => sum + Number(c.cost_usd), 0);
  }, [allCosts]);

  return {
    userSummaries,
    allCosts,
    isLoading,
    error,
    refetch: fetchAllCosts,
    getTotalPlatformCost,
    totalScans: allCosts.length
  };
}
