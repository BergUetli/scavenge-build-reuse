/**
 * IMPACT STATS - Premium iOS Style
 */

import { Leaf, Package, Recycle } from 'lucide-react';
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
  iconBg: string;
  iconColor: string;
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
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    { 
      icon: Recycle, 
      value: itemsSaved, 
      label: 'Saved',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent'
    },
    { 
      icon: Leaf, 
      value: `${co2Saved.toFixed(1)}kg`, 
      label: 'CO₂ Saved',
      iconBg: 'bg-success/10',
      iconColor: 'text-success'
    },
  ];
  
  return (
    <Card className={cn(
      'card-ios overflow-hidden',
      className
    )}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <p className="text-callout text-muted-foreground">Your Impact</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-border/50">
          {stats.map(({ icon: Icon, value, label, iconBg, iconColor }) => (
            <div key={label} className="py-4 px-2 text-center">
              <div className={cn(
                'w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center',
                iconBg
              )}>
                <Icon className={cn('w-[18px] h-[18px]', iconColor)} />
              </div>
              <div className="text-xl font-bold text-foreground tracking-tight">
                {value}
              </div>
              <div className="text-caption mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}