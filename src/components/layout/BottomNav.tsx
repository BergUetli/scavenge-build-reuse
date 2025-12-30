/**
 * BOTTOM NAVIGATION - iOS Tab Bar Style
 */

import { Home, Package, Lightbulb, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/projects', icon: Lightbulb, label: 'Projects' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-area-pb">
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1',
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
                  'relative flex items-center justify-center w-7 h-7 transition-transform duration-200',
                  isActive && 'scale-105'
                )}>
                  <Icon 
                    className={cn(
                      'w-[22px] h-[22px] transition-all duration-200',
                      isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                    )} 
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-md" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all duration-200',
                  isActive && 'font-semibold'
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