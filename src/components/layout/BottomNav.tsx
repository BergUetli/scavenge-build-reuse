/**
 * BOTTOM NAVIGATION - JunkHauler Style
 * Industrial, clean, futuristic with sound feedback
 */

import { Home, Package, Lightbulb, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Base' },
  { to: '/inventory', icon: Package, label: 'Cargo' },
  { to: '/projects', icon: Lightbulb, label: 'Builds' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const { playClick } = useSounds();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary/10 safe-area-pb">
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={playClick}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 min-w-[72px] py-2',
                'transition-all duration-200 ease-out',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground active:scale-90'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'relative flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-lg',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon 
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                    )} 
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] tracking-wide transition-all duration-200 uppercase',
                  isActive ? 'font-bold' : 'font-medium'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}