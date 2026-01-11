/**
 * ADMIN REVIEW DASHBOARD
 * 
 * Review and approve/reject user-submitted gadget identifications
 * - View pending submissions
 * - Approve → Move to main scrap_gadgets table
 * - Reject → Mark as rejected with reason
 * - Quality metrics and analytics
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Submission {
  id: string;
  user_id: string;
  ai_scan_result: any;
  image_urls: string[] | null;
  matched_gadget_id: string | null;
  submission_type: string;
  user_notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  auto_approved: boolean | null;
  created_at: string;
  updated_at: string | null;
  profiles?: {
    display_name: string | null;
  } | null;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Check if user is admin (in production, use proper role check)
  const { data: isAdmin } = useQuery({
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

  // Fetch submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions', filter],
    queryFn: async () => {
      let query = supabase
        .from('scrap_gadget_submissions')
        .select(`
          *,
          profiles:user_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Submission[];
    },
    enabled: isAdmin === true
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['submission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrap_gadget_submissions')
        .select('status');
      
      if (error) throw error;

      const pending = data.filter(s => s.status === 'pending').length;
      const approved = data.filter(s => s.status === 'approved').length;
      const rejected = data.filter(s => s.status === 'rejected').length;

      return {
        pending,
        approved,
        rejected,
        total: data.length
      } as Stats;
    },
    enabled: isAdmin === true
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, submission }: { id: string; submission: Submission }) => {
      const gadgetData = submission.ai_scan_result;
      
      // 1. Insert into scrap_gadgets table
      const { data: newGadget, error: gadgetError } = await supabase
        .from('scrap_gadgets')
        .insert([{
          device_name: gadgetData.parent_object,
          brand: gadgetData.brand || 'Unknown',
          category: gadgetData.items?.[0]?.category || 'Electronics',
          industry: 'Consumer Electronics',
          estimated_device_age_years: gadgetData.estimated_device_age_years || 3,
          disassembly_difficulty: gadgetData.salvage_difficulty || 'Medium',
          disassembly_time_estimate: gadgetData.disassembly?.time_estimate || '20-30 minutes',
          injury_risk: gadgetData.disassembly?.injury_risk || 'Low',
          damage_risk: gadgetData.disassembly?.damage_risk || 'Medium',
          tools_required: gadgetData.tools_needed || [],
          safety_warnings: gadgetData.disassembly?.safety_warnings || [],
          ifixit_url: gadgetData.disassembly?.tutorial_url,
          youtube_teardown_url: gadgetData.disassembly?.video_url,
          verified: true,
          scan_count: 1
        }])
        .select()
        .single();

      if (gadgetError) throw gadgetError;

      // 2. Insert components
      if (gadgetData.items?.length > 0) {
        const components = gadgetData.items.map((item: any) => ({
          gadget_id: newGadget.id,
          component_name: item.component_name,
          category: item.category,
          specifications: item.specifications || {},
          technical_specs: item.technical_specs || {},
          reusability_score: item.reusability_score,
          market_value_new: item.market_value_new || 0,
          depreciation_rate: item.depreciation_rate || 0.15,
          description: item.description,
          common_uses: item.common_uses || [],
          quantity: item.quantity || 1,
          confidence: item.confidence || 0.8
        }));

        const { error: componentsError } = await supabase
          .from('scrap_gadget_components')
          .insert(components);

        if (componentsError) throw componentsError;
      }

      // 3. Update submission status
      const { error: updateError } = await supabase
        .from('scrap_gadget_submissions')
        .update({
          status: 'approved',
          matched_gadget_id: newGadget.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return newGadget;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Approved!',
        description: `${data.device_name} added to database`,
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Approval failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('scrap_gadget_submissions')
        .update({
          status: 'rejected',
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '❌ Rejected',
        description: 'Submission marked as rejected',
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Rejection failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please sign in to access the admin dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isAdmin === false) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and approve user-submitted gadget identifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-amber-500">{stats?.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-eco">{stats?.approved || 0}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-eco" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-destructive">{stats?.rejected || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{stats?.total || 0}</p>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats?.pending || 0})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats?.approved || 0})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats?.rejected || 0})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({stats?.total || 0})
          </Button>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Loading submissions...</p>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No submissions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {submission.ai_scan_result?.parent_object || 'Unknown Device'}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {submission.profiles?.display_name || 'Unknown user'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {submission.ai_scan_result?.items?.length || 0} components
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        submission.status === 'approved' ? 'default' : 
                        submission.status === 'rejected' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium">
                        {submission.ai_scan_result?.items?.[0]?.category || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-medium">
                        {Math.round((submission.ai_scan_result?.items?.[0]?.confidence || 0) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Value Range</p>
                      <p className="font-medium">
                        ${submission.ai_scan_result?.total_estimated_value_low?.toFixed(2) || '0'} - 
                        ${submission.ai_scan_result?.total_estimated_value_high?.toFixed(2) || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <p className="font-medium">
                        {submission.ai_scan_result?.salvage_difficulty || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Details */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mb-4"
                    onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                  >
                    {expandedId === submission.id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>

                  {/* Expanded Details */}
                  {expandedId === submission.id && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg mb-4">
                      <div>
                        <h4 className="font-semibold mb-2">Components ({submission.ai_scan_result?.items?.length || 0})</h4>
                        <div className="space-y-2">
                          {submission.ai_scan_result?.items?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-background p-3 rounded border">
                              <p className="font-medium">{item.component_name}</p>
                              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{item.category}</span>
                                <span>Score: {item.reusability_score}/10</span>
                                <span>${item.market_value_low?.toFixed(2)} - ${item.market_value_high?.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {submission.user_notes && (
                        <div>
                          <h4 className="font-semibold mb-2">User Notes</h4>
                          <p className="text-sm text-muted-foreground">{submission.user_notes}</p>
                        </div>
                      )}

                      {submission.review_notes && (
                        <div>
                          <h4 className="font-semibold mb-2">Review Notes</h4>
                          <p className="text-sm text-muted-foreground">{submission.review_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {submission.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={() => approveMutation.mutate({ id: submission.id, submission })}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve & Add to Database
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate({ 
                          id: submission.id, 
                          reason: 'Quality review failed' 
                        })}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
