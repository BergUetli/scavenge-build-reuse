/**
 * HOME PAGE - JunkHauler
 * Futuristic salvage tool for the junker community
 */

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap, Crosshair } from 'lucide-react';
import { UsageIndicator } from '@/components/scanner/UsageIndicator';
import { JunkHaulerLogo } from '@/components/JunkHaulerLogo';
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
                className="absolute top-12 right-6 safe-area-pt group focus-ring rounded-xl"
                aria-label="Go to profile"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg group-hover:border-primary group-hover:shadow-[0_0_16px_hsl(199_89%_58%/0.3)] group-active:scale-95 transition-all">
                  <img 
                    src={defaultAvatar} 
                    alt="Your profile avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background" aria-hidden="true" />
              </button>

              {/* Logo & Title */}
              <div className="relative mb-5 inline-block">
                <JunkHaulerLogo size="lg" className="drop-shadow-lg" />
                {/* Status indicator */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
              </div>
              
              {/* Tagline */}
              <div className="space-y-1">
                <p className="text-white/60 text-base sm:text-lg font-medium">
                  Welcome back, Junker.
                </p>
                <p className="text-white/90 text-lg sm:text-xl font-semibold leading-relaxed">
                  Take stuff apart, build something epic, or flip parts for profit.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-5 -mt-16 pb-8 max-w-lg mx-auto space-y-5">
          
          {/* Scan Button */}
          <div className="flex flex-col items-center gap-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <ScanButton onClick={() => navigate('/scan')} />
            <UsageIndicator used={3} total={10} resetDays={23} />
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
                    <h3 className="font-bold text-base sm:text-lg text-foreground">
                      Mission Brief
                    </h3>
                    <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded tracking-wider uppercase">
                      New
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
                  <h3 className="font-bold text-xl sm:text-2xl text-foreground mb-2">Cargo hold empty</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-[280px] mx-auto leading-relaxed">
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