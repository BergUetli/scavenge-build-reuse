/**
 * IMPACT STATS COMPONENT
 * 
 * Shows user's environmental impact metrics:
 * - Items scanned
 * - Items saved from waste
 * - CO2 saved
 */

import { Leaf, Package, Recycle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImpactStatsProps {
  itemsScanned: number;
  itemsSaved: number;
  co2Saved: number;
  className?: string;
}

interface StatItem {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}

export function ImpactStats({ 
  itemsScanned, 
  itemsSaved, 
  co2Saved,
  className 
}: ImpactStatsProps) {
  const stats: StatItem[] = [
    { 
      icon: Package, 
      value: itemsScanned, 
      label: 'Scanned',
      color: 'text-primary'
    },
    { 
      icon: Recycle, 
      value: itemsSaved, 
      label: 'Saved',
      color: 'text-eco'
    },
    { 
      icon: Leaf, 
      value: `${co2Saved.toFixed(1)}kg`, 
      label: 'CO₂ Saved',
      color: 'text-eco'
    },
  ];
  
  return (
    <Card className={cn('bg-gradient-subtle border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-eco" />
          <span className="text-sm font-medium text-foreground">Your Impact</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <div className={cn('flex items-center justify-center mb-1', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-lg font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
