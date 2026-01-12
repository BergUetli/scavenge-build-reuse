/**
 * PERFORMANCE MONITOR
 * 
 * Shows detailed timing breakdown for scan operations
 * Helps diagnose slow scans and optimize performance
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Database, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimingData {
  compression?: number;
  hashing?: number;
  edgeFunction?: number;
  total?: number;
  // Server-side timings (from edge function response)
  cacheCheck?: number;
  quickId?: number;
  dbLookup?: number;
  aiAnalysis?: number;
  dataSource?: 'cache' | 'database' | 'ai';
}

interface PerformanceMonitorProps {
  timings: TimingData;
  className?: string;
  minimal?: boolean;
}

export function PerformanceMonitor({ timings, className, minimal = false }: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTotalTime = () => {
    return timings.total || 0;
  };

  const getSpeedRating = (ms: number) => {
    if (ms < 500) return { label: 'Lightning Fast', color: 'text-green-500', icon: Zap };
    if (ms < 2000) return { label: 'Fast', color: 'text-blue-500', icon: TrendingUp };
    if (ms < 5000) return { label: 'Normal', color: 'text-amber-500', icon: Clock };
    return { label: 'Slow', color: 'text-red-500', icon: Clock };
  };

  const formatTime = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalTime = getTotalTime();
  const rating = getSpeedRating(totalTime);
  const RatingIcon = rating.icon;

  if (minimal) {
    return (
      <Badge 
        variant="outline" 
        className="gap-1.5 cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <RatingIcon className="w-3 h-3" />
        {formatTime(totalTime)}
      </Badge>
    );
  }

  return (
    <Card className={cn("p-4 bg-muted/30 border-muted", className)}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background/50", rating.color)}>
            <RatingIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Scan Performance</h3>
            <p className="text-xs text-muted-foreground">
              {rating.label} • {formatTime(totalTime)}
            </p>
          </div>
        </div>

        {timings.dataSource && (
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5",
              timings.dataSource === 'cache' && "bg-green-500/10 text-green-600 border-green-500/20",
              timings.dataSource === 'database' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
              timings.dataSource === 'ai' && "bg-purple-500/10 text-purple-600 border-purple-500/20"
            )}
          >
            {timings.dataSource === 'cache' && <Zap className="w-3 h-3" />}
            {timings.dataSource === 'database' && <Database className="w-3 h-3" />}
            {timings.dataSource === 'ai' && <Sparkles className="w-3 h-3" />}
            {timings.dataSource.toUpperCase()}
          </Badge>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2 pt-4 border-t border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Timing Breakdown
          </h4>
          
          {/* Client-side timings */}
          <div className="space-y-1.5">
            {timings.compression !== undefined && (
              <TimingRow 
                label="Image Compression" 
                time={timings.compression} 
                total={totalTime}
              />
            )}
            {timings.hashing !== undefined && (
              <TimingRow 
                label="Image Hashing" 
                time={timings.hashing} 
                total={totalTime}
              />
            )}
          </div>

          {/* Server-side timings */}
          {(timings.cacheCheck !== undefined || timings.dbLookup !== undefined || timings.aiAnalysis !== undefined) && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">
                Server Processing
              </h4>
              <div className="space-y-1.5">
                {timings.cacheCheck !== undefined && (
                  <TimingRow 
                    label="Cache Lookup" 
                    time={timings.cacheCheck} 
                    total={totalTime}
                  />
                )}
                {timings.quickId !== undefined && (
                  <TimingRow 
                    label="Quick Device ID" 
                    time={timings.quickId} 
                    total={totalTime}
                  />
                )}
                {timings.dbLookup !== undefined && (
                  <TimingRow 
                    label="Database Search" 
                    time={timings.dbLookup} 
                    total={totalTime}
                  />
                )}
                {timings.aiAnalysis !== undefined && (
                  <TimingRow 
                    label="AI Analysis" 
                    time={timings.aiAnalysis} 
                    total={totalTime}
                    highlight
                  />
                )}
              </div>
            </>
          )}

          {/* Edge function total */}
          {timings.edgeFunction !== undefined && (
            <TimingRow 
              label="Edge Function Total" 
              time={timings.edgeFunction} 
              total={totalTime}
              className="font-semibold"
            />
          )}
        </div>
      )}
    </Card>
  );
}

interface TimingRowProps {
  label: string;
  time: number;
  total: number;
  highlight?: boolean;
  className?: string;
}

function TimingRow({ label, time, total, highlight, className }: TimingRowProps) {
  const percentage = ((time / total) * 100).toFixed(0);
  
  return (
    <div className={cn("flex items-center justify-between text-xs", className)}>
      <span className={cn(
        "text-muted-foreground",
        highlight && "text-foreground font-medium"
      )}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              highlight ? "bg-primary" : "bg-muted-foreground/50"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn(
          "font-mono tabular-nums min-w-[50px] text-right",
          highlight && "font-semibold"
        )}>
          {time < 1000 ? `${time.toFixed(0)}ms` : `${(time / 1000).toFixed(2)}s`}
        </span>
      </div>
    </div>
  );
}
