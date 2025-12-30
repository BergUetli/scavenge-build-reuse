/**
 * HOME PAGE
 * 
 * Main landing page with scan button, impact stats, and recent history.
 */

import { useNavigate } from 'react-router-dom';
import { Package, Lightbulb, ChevronRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScanButton } from '@/components/scanner/ScanButton';
import { ImpactStats } from '@/components/stats/ImpactStats';
import { ComponentCard } from '@/components/cards/ComponentCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inventory, stats } = useInventory();
  const { history } = useScanHistory();

  // Mock impact data - would come from profile in real app
  const impactStats = {
    itemsScanned: history.length,
    itemsSaved: inventory.length,
    co2Saved: inventory.length * 0.5, // Rough estimate: 0.5kg CO2 per item
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-gradient-primary text-white px-4 pt-12 pb-20 safe-area-pt">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Scavenger</h1>
            </div>
            <p className="text-white/80 text-sm">
              Transform discarded items into amazing projects
            </p>
          </div>
        </header>

        {/* Main content - overlapping header */}
        <div className="px-4 -mt-12 pb-8 max-w-md mx-auto">
          {/* Scan Button */}
          <div className="flex justify-center mb-6">
            <ScanButton onClick={() => navigate('/scan')} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-card/80 backdrop-blur-sm"
              onClick={() => navigate('/inventory')}
            >
              <Package className="w-6 h-6 text-primary" />
              <span className="text-sm">My Inventory</span>
              <span className="text-xs text-muted-foreground">
                {stats.totalItems} items
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-card/80 backdrop-blur-sm"
              onClick={() => navigate('/projects')}
            >
              <Lightbulb className="w-6 h-6 text-eco" />
              <span className="text-sm">What Can I Build?</span>
              <span className="text-xs text-muted-foreground">
                Find projects
              </span>
            </Button>
          </div>

          {/* Impact Stats */}
          <ImpactStats {...impactStats} className="mb-6" />

          {/* Environmental message */}
          <Card className="bg-eco/10 border-eco/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-eco/20 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-eco" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">
                    Before You Throw It Away...
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    That old gadget might contain valuable components! Scan it to discover 
                    what you can build and save from landfill.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          {history.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Recent Scans</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => navigate('/inventory')}
                >
                  See All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <ComponentCard
                    key={item.id}
                    item={{
                      ...item,
                      user_id: user?.id || '',
                      quantity: 1,
                      condition: 'Good',
                      status: 'Available',
                      specifications: {},
                      reusability_score: null,
                      market_value: null,
                      notes: null,
                      date_added: item.scanned_at,
                      updated_at: item.scanned_at,
                    }}
                    compact
                    onClick={() => navigate(`/inventory`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {history.length === 0 && inventory.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No items yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan your first component to get started!
                </p>
                <Button onClick={() => navigate('/scan')}>
                  Start Scanning
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
