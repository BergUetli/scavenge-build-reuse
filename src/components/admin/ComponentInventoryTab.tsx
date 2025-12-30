import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, ChevronRight, ChevronDown, Cpu, Box, CircuitBoard, Layers } from 'lucide-react';
import { ComponentTreeNode } from './ComponentTreeNode';
import { AddComponentDialog } from './AddComponentDialog';
import type { HierarchicalComponent } from '@/types/admin';

export function ComponentInventoryTab() {
  const { components, componentTree, componentsLoading, refetchComponents } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter components based on search
  const filteredComponents = components?.filter((comp) => {
    const query = searchQuery.toLowerCase();
    return (
      comp.component_name.toLowerCase().includes(query) ||
      comp.brand?.toLowerCase().includes(query) ||
      comp.model?.toLowerCase().includes(query) ||
      comp.category.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: components?.length || 0,
    devices: components?.filter((c) => c.abstraction_level === 'device').length || 0,
    modules: components?.filter((c) => c.abstraction_level === 'module').length || 0,
    ics: components?.filter((c) => c.abstraction_level === 'ic').length || 0,
    verified: components?.filter((c) => c.verified).length || 0,
  };

  if (componentsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Devices</span>
            </div>
            <p className="text-2xl font-bold">{stats.devices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CircuitBoard className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Modules</span>
            </div>
            <p className="text-2xl font-bold">{stats.modules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">ICs</span>
            </div>
            <p className="text-2xl font-bold">{stats.ics}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-xs">✓</Badge>
              <span className="text-sm text-muted-foreground">Verified</span>
            </div>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Component Database</CardTitle>
              <CardDescription>
                Hierarchical view of all components. Click to expand subcomponents.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, brand, model, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Component Tree */}
          <ScrollArea className="h-[500px] border rounded-lg p-4">
            {searchQuery ? (
              // Flat list when searching
              <div className="space-y-2">
                {filteredComponents?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No components found matching "{searchQuery}"
                  </p>
                ) : (
                  filteredComponents?.map((comp) => (
                    <ComponentTreeNode key={comp.id} component={comp} depth={0} />
                  ))
                )}
              </div>
            ) : (
              // Hierarchical tree when not searching
              <div className="space-y-1">
                {componentTree.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No components in the database yet. Add some or upload a dataset.
                  </p>
                ) : (
                  componentTree.map((comp) => (
                    <ComponentTreeNode key={comp.id} component={comp} depth={0} />
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Component Dialog */}
      <AddComponentDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        components={components || []}
      />
    </div>
  );
}
