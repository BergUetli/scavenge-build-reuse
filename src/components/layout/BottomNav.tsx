/**
 * BOTTOM NAVIGATION - Dung Beetle Style
 * Earthy, bold, clean
 */

import { Home, Package, Lightbulb, User, Bug } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/inventory', icon: Package, label: 'Stash' },
  { to: '/projects', icon: Lightbulb, label: 'Build' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[68px] py-1.5',
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
                  'relative flex items-center justify-center w-8 h-8 transition-all duration-200',
                  isActive && 'scale-110'
                )}>
                  <Icon 
                    className={cn(
                      'w-[22px] h-[22px] transition-all duration-200',
                      isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                    )} 
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/15 rounded-full blur-lg" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] transition-all duration-200',
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