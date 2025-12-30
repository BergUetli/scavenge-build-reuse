/**
 * HOME PAGE - Dung Beetle Rebrand
 * Nature's OG recycler - bold, earthy, nerdy
 */

import { useNavigate } from 'react-router-dom';
import { Package, Lightbulb, ChevronRight, Sparkles, Bug } from 'lucide-react';
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
          {/* Dark earthy gradient */}
          <div className="absolute inset-0 bg-gradient-hero" />
          
          {/* Decorative orbs */}
          <div className="absolute top-8 right-4 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-accent/15 rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          <div className="relative px-6 pt-14 pb-28 safe-area-pt">
            <div className="max-w-lg mx-auto">
              {/* Logo & Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-primary/90 rounded-2xl shadow-lg shimmer-shell">
                  <Bug className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Dung Beetle
                  </h1>
                  <p className="text-white/50 text-xs font-mono tracking-wider uppercase">
                    Nature's OG Recycler
                  </p>
                </div>
              </div>
              
              {/* Tagline */}
              <p className="text-white/70 text-lg font-medium leading-relaxed max-w-[320px]">
                Roll with what you've got. <br/>
                <span className="text-primary/90">Transform trash into treasure.</span>
              </p>
            </div>
          </div>
        </header>

        {/* Main Content - Overlapping cards */}
        <div className="px-5 -mt-16 pb-8 max-w-lg mx-auto space-y-5">
          
          {/* Scan Button */}
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <ScanButton onClick={() => navigate('/scan')} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={() => navigate('/inventory')}
              className="group card-earth p-5 text-left tap-highlight active:scale-[0.98] transition-transform duration-150"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-active:scale-95 transition-transform border border-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <p className="font-bold text-base text-foreground mb-1">My Stash</p>
              <p className="text-sm text-muted-foreground font-mono">
                {stats.totalItems} <span className="text-xs">parts</span>
              </p>
            </button>
            
            <button
              onClick={() => navigate('/projects')}
              className="group card-earth p-5 text-left tap-highlight active:scale-[0.98] transition-transform duration-150"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 group-active:scale-95 transition-transform border border-accent/20">
                <Lightbulb className="w-6 h-6 text-accent" />
              </div>
              <p className="font-bold text-base text-foreground mb-1">Build Ideas</p>
              <p className="text-sm text-muted-foreground">Explore projects</p>
            </button>
          </div>

          {/* CTA Card */}
          <Card className="border-0 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent shadow-premium-lg overflow-hidden animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <CardContent className="p-5 relative">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              
              <div className="flex gap-4 relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground mb-1.5">
                    Don't trash it yet!
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    That old gadget is packed with reusable parts. Scan it and see what you can build.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          {history.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-title-2 text-foreground">Recent Finds</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary font-bold h-9 px-3 hover:bg-primary/10 rounded-xl"
                  onClick={() => navigate('/inventory')}
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
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
            <Card className="border-2 border-dashed border-border bg-card/50 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="py-14 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/50 mx-auto mb-5 flex items-center justify-center border border-border">
                  <Bug className="w-9 h-9 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">Empty stash</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[240px] mx-auto leading-relaxed">
                  Time to roll! Scan your first item and start building your collection.
                </p>
                <Button 
                  onClick={() => navigate('/scan')}
                  className="h-12 px-8 rounded-xl font-bold shadow-premium-lg bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <Bug className="w-5 h-5 mr-2" />
                  Start Rolling
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}