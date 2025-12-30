/**
 * HOME PAGE - Premium iOS Design
 */

import { useNavigate } from 'react-router-dom';
import { Package, Lightbulb, ChevronRight, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScanButton } from '@/components/scanner/ScanButton';
import { ComponentCard } from '@/components/cards/ComponentCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inventory, stats } = useInventory();
  const { history } = useScanHistory();


  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Header */}
        <header className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-hero" />
          
          {/* Decorative elements */}
          <div className="absolute top-12 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative px-6 pt-14 pb-24 safe-area-pt">
            <div className="max-w-lg mx-auto">
              {/* Logo & Title */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Scavenger</h1>
              </div>
              
              {/* Tagline */}
              <p className="text-white/75 text-[15px] leading-relaxed max-w-[280px]">
                Transform discarded items into amazing projects
              </p>
            </div>
          </div>
        </header>

        {/* Main Content - Overlapping cards */}
        <div className="px-5 -mt-14 pb-8 max-w-lg mx-auto space-y-5">
          
          {/* Scan Button - Centered and prominent */}
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <ScanButton onClick={() => navigate('/scan')} />
          </div>

          {/* Quick Actions - iOS-style cards */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={() => navigate('/inventory')}
              className="group card-ios p-4 text-left tap-highlight active:scale-[0.98] transition-transform duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-active:scale-95 transition-transform">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-[15px] text-foreground mb-0.5">My Inventory</p>
              <p className="text-[13px] text-muted-foreground">{stats.totalItems} items saved</p>
            </button>
            
            <button
              onClick={() => navigate('/projects')}
              className="group card-ios p-4 text-left tap-highlight active:scale-[0.98] transition-transform duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-active:scale-95 transition-transform">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <p className="font-semibold text-[15px] text-foreground mb-0.5">What Can I Build?</p>
              <p className="text-[13px] text-muted-foreground">Find projects</p>
            </button>
          </div>


          {/* Eco Message Card */}
          <Card className="border-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-premium animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <CardContent className="p-4">
              <div className="flex gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] text-foreground mb-1">
                    Before You Throw It Away...
                  </h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    That old gadget might contain valuable components! Scan it to discover what you can build.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          {history.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-title-3 text-foreground">Recent Scans</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary font-semibold h-8 px-2 hover:bg-primary/5"
                  onClick={() => navigate('/inventory')}
                >
                  See All
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
              <div className="space-y-2.5">
                {history.slice(0, 3).map((item, index) => (
                  <div 
                    key={item.id} 
                    className="animate-fade-up"
                    style={{ animationDelay: `${0.35 + index * 0.05}s` }}
                  >
                    <ComponentCard
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
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {history.length === 0 && inventory.length === 0 && (
            <Card className="border-dashed border-2 border-border/60 bg-transparent animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">No items yet</h3>
                <p className="text-[13px] text-muted-foreground mb-5 max-w-[200px] mx-auto">
                  Scan your first component to start building your inventory
                </p>
                <Button 
                  onClick={() => navigate('/scan')}
                  className="h-11 px-6 rounded-xl font-semibold shadow-premium"
                >
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