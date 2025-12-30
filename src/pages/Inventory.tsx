/**
 * INVENTORY PAGE
 * 
 * Displays user's component inventory with search and filters.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Package, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { ComponentCard } from '@/components/cards/ComponentCard';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { ComponentCategory, InventoryFilters } from '@/types';
import { cn } from '@/lib/utils';

const categories: ComponentCategory[] = [
  'Electronics',
  'Wood',
  'Metal',
  'Fabric',
  'Mechanical',
  'Other',
];

export default function Inventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { inventory, isLoading, deleteItem, stats } = useInventory();

  const [filters, setFilters] = useState<InventoryFilters>({});
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Filter inventory based on search and category
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          item.component_name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [inventory, filters]);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (deleteItemId) {
      await deleteItem.mutateAsync(deleteItemId);
      setDeleteItemId(null);
    }
  };

  // Require auth
  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to view your inventory.
            </p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-4 sticky top-0 z-40 safe-area-pt">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">My Inventory</h1>
                <p className="text-sm text-muted-foreground">
                  {stats.totalItems} items · ${stats.totalValue.toFixed(2)} value
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('/scan')}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                className="pl-9"
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, searchQuery: e.target.value }))
                }
              />
            </div>
          </div>
        </header>

        {/* Category filters */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 max-w-md mx-auto">
            <Badge
              variant={!filters.category ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilters((f) => ({ ...f, category: undefined }))}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={filters.category === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilters((f) => ({ ...f, category: cat }))}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Inventory list */}
        <div className="px-4 pb-8 max-w-md mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="space-y-3">
              {filteredInventory.map((item) => (
                <div key={item.id} className="relative group">
                  <ComponentCard
                    item={item}
                    onClick={() => {
                      // TODO: Navigate to detail view
                    }}
                  />
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className={cn(
                      'absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100',
                      'transition-opacity duration-200'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteItemId(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-1">
                {filters.searchQuery || filters.category
                  ? 'No matching items'
                  : 'Your inventory is empty'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filters.searchQuery || filters.category
                  ? 'Try adjusting your filters'
                  : 'Scan your first component to get started'}
              </p>
              {!filters.searchQuery && !filters.category && (
                <Button onClick={() => navigate('/scan')}>Start Scanning</Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
