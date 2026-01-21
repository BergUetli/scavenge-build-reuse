import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Zap, DollarSign, Database, Clock, TrendingUp, Sparkles, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';

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
  recentErrors: number;
}

interface RecentScan {
  id: string;
  deviceName: string;
  totalTimeMs: number;
  dataSource: 'cache' | 'database' | 'ai';
  componentCount: number;
  costUsd?: number;
  createdAt: string;
  success: boolean;
  errorMessage?: string;
}

interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Check if user is admin
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) return false;
      return data?.role === 'admin' || data?.role === 'moderator';
    },
    enabled: !!user
  });

  // Redirect non-admins
  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      checkSystemHealth();
    }
  }, [timeRange, isAdmin]);

  async function loadDashboardData() {
    setLoading(true);
    
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
        
        const recentErrors = logsData.filter(s => !s.success).length;

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
          successRate,
          recentErrors
        });
      }

      // Load recent scans (including failures)
      const { data: recentData, error: recentError } = await supabase
        .from('scan_logs')
        .select('id, device_name, total_time_ms, data_source, component_count, cost_usd, created_at, success, error_message')
        .order('created_at', { ascending: false })
        .limit(20);

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
          createdAt: s.created_at,
          success: s.success,
          errorMessage: s.error_message
        })));
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkSystemHealth() {
    const alerts: SystemAlert[] = [];
    const now = new Date();

    try {
      // Check recent error rate (last hour)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const { data: recentLogs } = await supabase
        .from('scan_logs')
        .select('success, error_message')
        .gte('created_at', oneHourAgo.toISOString());

      if (recentLogs && recentLogs.length > 0) {
        const failedScans = recentLogs.filter(s => !s.success);
        const errorRate = (failedScans.length / recentLogs.length) * 100;

        // Check for Gemini quota errors
        const quotaErrors = failedScans.filter(s => 
          s.error_message?.toLowerCase().includes('quota') ||
          s.error_message?.toLowerCase().includes('rate limit')
        );

        if (quotaErrors.length > 0) {
          alerts.push({
            id: 'quota-exceeded',
            severity: 'critical',
            title: 'API Quota Exceeded',
            message: `Gemini API quota exceeded (${quotaErrors.length} failures in last hour). Switch to OpenAI or wait for quota reset.`,
            timestamp: now
          });
        }

        // Check for high error rate
        if (errorRate > 50 && recentLogs.length >= 5) {
          alerts.push({
            id: 'high-error-rate',
            severity: 'critical',
            title: 'High Error Rate',
            message: `${errorRate.toFixed(0)}% of scans failing in the last hour (${failedScans.length}/${recentLogs.length}). Check Edge Function logs.`,
            timestamp: now
          });
        } else if (errorRate > 20 && recentLogs.length >= 5) {
          alerts.push({
            id: 'elevated-errors',
            severity: 'warning',
            title: 'Elevated Error Rate',
            message: `${errorRate.toFixed(0)}% of scans failing in the last hour. Monitor for issues.`,
            timestamp: now
          });
        }

        // Check for 406 errors (RLS issues)
        const rlsErrors = failedScans.filter(s =>
          s.error_message?.includes('406') ||
          s.error_message?.toLowerCase().includes('not acceptable')
        );

        if (rlsErrors.length > 0) {
          alerts.push({
            id: 'rls-errors',
            severity: 'warning',
            title: 'Database Permission Issues',
            message: `${rlsErrors.length} scans failed with 406 errors. Check RLS policies on cache tables.`,
            timestamp: now
          });
        }
      }

      // Check daily cost threshold
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const { data: dailyLogs } = await supabase
        .from('scan_logs')
        .select('cost_usd')
        .gte('created_at', oneDayAgo.toISOString());

      if (dailyLogs) {
        const dailyCost = dailyLogs.reduce((sum, s) => sum + (s.cost_usd || 0), 0);
        
        if (dailyCost > 5) {
          alerts.push({
            id: 'high-cost',
            severity: 'warning',
            title: 'High Daily AI Costs',
            message: `AI costs exceeded $5 in the last 24 hours ($${dailyCost.toFixed(2)}). Consider optimizing cache hit rate.`,
            timestamp: now
          });
        }
      }

      // If no issues, add success message
      if (alerts.length === 0) {
        alerts.push({
          id: 'all-clear',
          severity: 'info',
          title: 'System Healthy',
          message: 'All systems operating normally. No critical issues detected.',
          timestamp: now
        });
      }

    } catch (error) {
      console.error('System health check failed:', error);
      alerts.push({
        id: 'health-check-failed',
        severity: 'warning',
        title: 'Health Check Failed',
        message: 'Unable to complete system health check. Check database connection.',
        timestamp: now
      });
    }

    setSystemAlerts(alerts);
  }

  function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function formatCost(usd: number): string {
    if (usd < 0.01) return `$${(usd * 1000).toFixed(2)}‰`;
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

  if (adminLoading || !isAdmin) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
              <p className="text-muted-foreground">Checking admin access...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">System performance and health monitoring</p>
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

        {/* System Alerts */}
        <div className="mb-8 space-y-4">
          {systemAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
              className={
                alert.severity === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                  : alert.severity === 'info'
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : ''
              }
            >
              {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4" />}
              {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              {alert.severity === 'info' && <CheckCircle className="h-4 w-4 text-green-600" />}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        {!stats && (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No scan data yet</h2>
            <p className="text-muted-foreground">Start scanning devices to see performance metrics!</p>
          </div>
        )}

        {stats && (
          <>
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
                  {stats.recentErrors > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {stats.recentErrors} failures
                    </p>
                  )}
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

            {/* Recent Scans with Failures Highlighted */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Last 20 scan operations (failures highlighted)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        !scan.success
                          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                          : 'bg-card hover:bg-accent/50'
                      } transition-colors`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!scan.success && <XCircle className="h-4 w-4 text-red-600" />}
                          <div className="font-medium">{scan.deviceName}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {scan.componentCount} components • {formatDate(scan.createdAt)}
                        </div>
                        {scan.errorMessage && (
                          <div className="text-xs text-red-600 mt-1 font-mono">
                            {scan.errorMessage.substring(0, 100)}
                            {scan.errorMessage.length > 100 && '...'}
                          </div>
                        )}
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
          </>
        )}
      </div>
    </AppLayout>
  );
}
