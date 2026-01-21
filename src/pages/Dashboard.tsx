import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, DollarSign, Database, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface PerformanceStats {
  totalScans: number;
  avgTimeMs: number;
  p50TimeMs: number;
  p95TimeMs: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  aiCalls: number;
  totalCostUsd: number;
  avgCostPerScan: number;
  geminiCalls: number;
  openaiCalls: number;
  claudeCalls: number;
  successRate: number;
}

interface RecentScan {
  id: string;
  deviceName: string;
  totalTimeMs: number;
  dataSource: 'cache' | 'database' | 'ai';
  componentCount: number;
  costUsd?: number;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  async function loadDashboardData() {
    setLoading(true);
    
    // Calculate time threshold
    const now = new Date();
    const threshold = new Date(now);
    switch (timeRange) {
      case '24h':
        threshold.setHours(now.getHours() - 24);
        break;
      case '7d':
        threshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        threshold.setDate(now.getDate() - 30);
        break;
    }

    try {
      // Load aggregated stats
      const { data: logsData, error: logsError } = await supabase
        .from('scan_logs')
        .select('*')
        .gte('created_at', threshold.toISOString());

      if (logsError) {
        console.error('Failed to load scan logs:', logsError);
      } else if (logsData && logsData.length > 0) {
        // Calculate stats from raw data
        const totalScans = logsData.length;
        const times = logsData.map(s => s.total_time_ms).sort((a, b) => a - b);
        const avgTimeMs = times.reduce((sum, t) => sum + t, 0) / times.length;
        const p50TimeMs = times[Math.floor(times.length * 0.5)];
        const p95TimeMs = times[Math.floor(times.length * 0.95)];
        
        const cacheHits = logsData.filter(s => s.cache_hit).length;
        const cacheMisses = totalScans - cacheHits;
        const cacheHitRate = (cacheHits / totalScans) * 100;
        
        const aiCalls = logsData.filter(s => s.data_source === 'ai').length;
        const totalCostUsd = logsData.reduce((sum, s) => sum + (s.cost_usd || 0), 0);
        const avgCostPerScan = aiCalls > 0 ? totalCostUsd / aiCalls : 0;
        
        const geminiCalls = logsData.filter(s => s.ai_provider === 'gemini').length;
        const openaiCalls = logsData.filter(s => s.ai_provider === 'openai').length;
        const claudeCalls = logsData.filter(s => s.ai_provider === 'claude').length;
        
        const successfulScans = logsData.filter(s => s.success).length;
        const successRate = (successfulScans / totalScans) * 100;

        setStats({
          totalScans,
          avgTimeMs,
          p50TimeMs,
          p95TimeMs,
          cacheHits,
          cacheMisses,
          cacheHitRate,
          aiCalls,
          totalCostUsd,
          avgCostPerScan,
          geminiCalls,
          openaiCalls,
          claudeCalls,
          successRate
        });
      }

      // Load recent scans
      const { data: recentData, error: recentError } = await supabase
        .from('scan_logs')
        .select('id, device_name, total_time_ms, data_source, component_count, cost_usd, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('Failed to load recent scans:', recentError);
      } else if (recentData) {
        setRecentScans(recentData.map(s => ({
          id: s.id,
          deviceName: s.device_name,
          totalTimeMs: s.total_time_ms,
          dataSource: s.data_source,
          componentCount: s.component_count,
          costUsd: s.cost_usd,
          createdAt: s.created_at
        })));
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function formatCost(usd: number): string {
    if (usd < 0.01) return `$${(usd * 1000).toFixed(2)}‰`; // per mille
    return `$${usd.toFixed(4)}`;
  }

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No scan data yet</h2>
          <p className="text-muted-foreground">Start scanning devices to see performance metrics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Dashboard</h1>
          <p className="text-muted-foreground">Real-time scan performance and cost analytics</p>
        </div>
        
        {/* Time range selector */}
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        {/* Avg Speed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.avgTimeMs)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              P95: {formatTime(stats.p95TimeMs)}
            </p>
          </CardContent>
        </Card>

        {/* Cache Hit Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.cacheHits} hits / {stats.cacheMisses} misses
            </p>
          </CardContent>
        </Card>

        {/* Total Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(stats.totalCostUsd)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCost(stats.avgCostPerScan)} per scan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Detailed scan time metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Median (P50)</span>
              <span className="font-mono font-semibold">{formatTime(stats.p50TimeMs)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average</span>
              <span className="font-mono font-semibold">{formatTime(stats.avgTimeMs)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">95th Percentile</span>
              <span className="font-mono font-semibold">{formatTime(stats.p95TimeMs)}</span>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Optimization Impact</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cache hits are ~10-100x faster than AI calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Provider Stats */}
        <Card>
          <CardHeader>
            <CardTitle>AI Provider Usage</CardTitle>
            <CardDescription>Distribution of AI calls by provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Gemini</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold">{stats.geminiCalls}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({stats.aiCalls > 0 ? ((stats.geminiCalls / stats.aiCalls) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm">OpenAI</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold">{stats.openaiCalls}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({stats.aiCalls > 0 ? ((stats.openaiCalls / stats.aiCalls) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Claude</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold">{stats.claudeCalls}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({stats.aiCalls > 0 ? ((stats.claudeCalls / stats.aiCalls) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Cache Efficiency</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalScans - stats.aiCalls} scans served from cache (
                {((1 - stats.aiCalls / stats.totalScans) * 100).toFixed(1)}% cache rate)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Last 10 scan operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{scan.deviceName}</div>
                  <div className="text-xs text-muted-foreground">
                    {scan.componentCount} components • {formatDate(scan.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Data source badge */}
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                    scan.dataSource === 'cache' 
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : scan.dataSource === 'database'
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  }`}>
                    {scan.dataSource === 'cache' && <><Zap className="inline h-3 w-3 mr-1" />Cache</>}
                    {scan.dataSource === 'database' && <><Database className="inline h-3 w-3 mr-1" />DB</>}
                    {scan.dataSource === 'ai' && <><Sparkles className="inline h-3 w-3 mr-1" />AI</>}
                  </div>
                  
                  {/* Time */}
                  <div className="text-right min-w-[60px]">
                    <div className="font-mono text-sm">{formatTime(scan.totalTimeMs)}</div>
                    {scan.costUsd && (
                      <div className="text-xs text-muted-foreground">{formatCost(scan.costUsd)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {recentScans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent scans
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
