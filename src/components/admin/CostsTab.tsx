/**
 * ADMIN COSTS TAB
 * 
 * Shows AI scan costs across all users for admin.
 */

import { DollarSign, Users, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAdminScanCosts } from '@/hooks/useScanCosts';

export function CostsTab() {
  const { userSummaries, isLoading, error, getTotalPlatformCost, totalScans } = useAdminScanCosts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalCost = getTotalPlatformCost();
  const avgCostPerScan = totalScans > 0 ? totalCost / totalScans : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Cost</span>
            </div>
            <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Total Scans</span>
            </div>
            <p className="text-2xl font-bold">{totalScans}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Avg Cost/Scan</span>
            </div>
            <p className="text-2xl font-bold">${avgCostPerScan.toFixed(4)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Active Users</span>
            </div>
            <p className="text-2xl font-bold">{userSummaries.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost by User</CardTitle>
        </CardHeader>
        <CardContent>
          {userSummaries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No scan costs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {userSummaries.map((user) => (
                <div 
                  key={user.user_id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{user.total_scans} scans</span>
                      {user.total_corrections > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.total_corrections} corrections
                        </Badge>
                      )}
                      {user.last_scan_at && (
                        <span>
                          Last: {new Date(user.last_scan_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${user.total_cost.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(user.total_cost / (user.total_scans + user.total_corrections || 1)).toFixed(4)}/scan
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
