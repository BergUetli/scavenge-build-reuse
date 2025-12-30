import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Upload, Settings, Shield } from 'lucide-react';
import { ComponentInventoryTab } from '@/components/admin/ComponentInventoryTab';
import { DataAgentTab } from '@/components/admin/DataAgentTab';

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, componentsLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || componentsLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">
              Manage components, datasets, and system settings
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Admin
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Component Inventory
            </TabsTrigger>
            <TabsTrigger value="data-agent" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Scavenger Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <ComponentInventoryTab />
          </TabsContent>

          <TabsContent value="data-agent">
            <DataAgentTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
