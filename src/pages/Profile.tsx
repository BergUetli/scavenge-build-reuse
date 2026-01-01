/**
 * PROFILE PAGE
 * 
 * User profile with impact stats, settings, and sign out.
 */

import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, HelpCircle, Shield, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/AppLayout';
import { ImpactStats } from '@/components/stats/ImpactStats';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { inventory, stats } = useInventory();
  const { history } = useScanHistory();

  // Impact stats
  const impactStats = {
    itemsScanned: history.length,
    itemsSaved: inventory.length,
    co2Saved: inventory.length * 0.5,
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Not signed in
  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Scavenger</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Sign in to save your inventory and track your environmental impact.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <header className="bg-gradient-primary text-white px-4 pt-12 pb-16 safe-area-pt">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/20">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.email?.split('@')[0]}</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 -mt-8 max-w-md mx-auto">
          {/* Impact Stats */}
          <ImpactStats {...impactStats} className="mb-6" />

          {/* Inventory Summary */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Inventory Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-eco">${stats.totalValue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Est. Value</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {stats.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-muted rounded-full text-xs"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card className="bg-eco/10 border-eco/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-eco/20 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-eco" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Your Impact</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    By reusing {inventory.length} items, you've helped prevent approximately{' '}
                    <span className="font-semibold text-eco">
                      {(inventory.length * 0.5).toFixed(1)}kg of CO₂
                    </span>{' '}
                    emissions and saved materials from landfill.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu */}
          <Card>
            <CardContent className="p-0">
              <MenuItem
                icon={Settings}
                label="Settings"
                onClick={() => navigate('/settings')}
              />
              <Separator />
              <MenuItem
                icon={HelpCircle}
                label="Help & Support"
                onClick={() => toast({ title: 'Coming Soon', description: 'Help page under development.' })}
              />
              <Separator />
              <MenuItem
                icon={Shield}
                label="Privacy Policy"
                onClick={() => toast({ title: 'Coming Soon', description: 'Privacy page under development.' })}
              />
              <Separator />
              <MenuItem
                icon={LogOut}
                label="Sign Out"
                onClick={handleSignOut}
                destructive
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Menu item component
function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
        destructive ? 'text-red-500' : 'text-foreground'
      }`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
