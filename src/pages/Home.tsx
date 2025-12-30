/**
 * HOME PAGE - JunkHauler
 * Futuristic salvage tool for the junker community
 */

import { useNavigate } from 'react-router-dom';
import { Package, Lightbulb, ChevronRight, Zap, Crosshair, Container } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScanButton } from '@/components/scanner/ScanButton';
import { ComponentCard } from '@/components/cards/ComponentCard';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';
import defaultAvatar from '@/assets/default-avatar.png';
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
          {/* Dark industrial gradient */}
          <div className="absolute inset-0 bg-gradient-hero" />
          
          {/* Glowing orbs */}
          <div className="absolute top-12 right-0 w-48 h-48 bg-primary/30 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />
          
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(199 89% 48% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(199 89% 48% / 0.3) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
          
          <div className="relative px-6 pt-12 pb-28 safe-area-pt">
            <div className="max-w-lg mx-auto">
              {/* User Avatar - Top Right */}
              <button 
                onClick={() => navigate('/profile')}
                className="absolute top-12 right-6 safe-area-pt group"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg group-hover:border-primary group-active:scale-95 transition-all">
                  <img 
                    src={defaultAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" />
              </button>

              {/* Logo & Title */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg glow-primary">
                    <Container className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    JunkHauler
                  </h1>
                  <p className="text-primary/80 text-xs font-mono tracking-widest uppercase">
                    Salvage // Build // Repeat
                  </p>
                </div>
              </div>
              
              {/* Tagline */}
              <div className="space-y-1">
                <p className="text-white/60 text-base font-medium">
                  Welcome back, Junker.
                </p>
                <p className="text-white/90 text-lg font-semibold leading-relaxed">
                  Find treasure, build something epic, or flip it for profit.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-5 -mt-16 pb-8 max-w-lg mx-auto space-y-5">
          
          {/* Scan Button */}
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <ScanButton onClick={() => navigate('/scan')} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={() => navigate('/inventory')}
              className="group card-industrial p-5 text-left tap-highlight active:scale-[0.98] transition-all duration-150 corner-accent"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-active:scale-95 transition-transform border border-primary/30">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-[15px] text-foreground mb-1">Cargo Hold</p>
              <p className="text-xs text-muted-foreground font-mono tracking-wide">
                {stats.totalItems} <span className="text-primary/70">UNITS</span>
              </p>
            </button>
            
            <button
              onClick={() => navigate('/projects')}
              className="group card-industrial p-5 text-left tap-highlight active:scale-[0.98] transition-all duration-150 corner-accent"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-active:scale-95 transition-transform border border-accent/30">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <p className="font-bold text-[15px] text-foreground mb-1">Schematics</p>
              <p className="text-xs text-muted-foreground">Browse builds</p>
            </button>
          </div>

          {/* Mission Brief Card */}
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-premium-lg overflow-hidden animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <CardContent className="p-5 relative">
              {/* Scan line effect */}
              <div className="absolute inset-0 scan-effect pointer-events-none" />
              
              <div className="flex gap-4 relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg glow-primary">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-base text-foreground">
                      Mission Brief
                    </h3>
                    <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded tracking-wider uppercase">
                      New
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every piece of salvage has potential. Scan it, catalog it, build something epic.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Hauls */}
          {history.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-title-2 text-foreground">Recent Hauls</h2>
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary font-bold h-9 px-3 hover:bg-primary/10 rounded-lg"
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
            <Card className="border border-dashed border-primary/30 bg-card/50 animate-fade-up overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <CardContent className="py-14 text-center relative">
                {/* Scan effect */}
                <div className="absolute inset-0 scan-effect pointer-events-none opacity-50" />
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 mx-auto mb-5 flex items-center justify-center border border-border">
                    <Crosshair className="w-9 h-9 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-2">Cargo hold empty</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[260px] mx-auto leading-relaxed">
                    Time to go salvaging, Junker. Scan your first haul and start building your inventory.
                  </p>
                  <Button 
                    onClick={() => navigate('/scan')}
                    className="h-12 px-8 rounded-xl font-bold shadow-premium-lg bg-gradient-primary hover:opacity-90 transition-opacity uppercase tracking-wider"
                  >
                    <Crosshair className="w-5 h-5 mr-2" />
                    Begin Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}