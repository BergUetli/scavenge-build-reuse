import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileJson, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Bot,
  ArrowRight,
  Database
} from 'lucide-react';
import { DatasetUploadDialog } from './DatasetUploadDialog';
import type { Dataset, DatasetStatus } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<DatasetStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: 'text-yellow-500', label: 'Pending' },
  processing: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-blue-500', label: 'Processing' },
  completed: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500', label: 'Completed' },
  failed: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-500', label: 'Failed' },
};

export function DataAgentTab() {
  const { datasets, datasetsLoading, processDataset } = useAdmin();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  if (datasetsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Scavenger Data Agent</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The Data Agent automatically processes uploaded datasets, normalizes field names 
                to match our master schema, and imports components with proper hierarchy. 
                It uses AI to intelligently map fields from various data sources.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileJson className="h-3 w-3" />
                  JSON, CSV supported
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Auto field mapping
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Hierarchy detection
                </Badge>
              </div>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Datasets List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Datasets</CardTitle>
          <CardDescription>
            View and manage imported data sources. Click "Process" to start AI normalization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {!datasets || datasets.length === 0 ? (
              <div className="text-center py-12">
                <FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No datasets uploaded yet. Upload a dataset to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {datasets.map((dataset) => (
                  <DatasetCard 
                    key={dataset.id} 
                    dataset={dataset} 
                    onProcess={() => processDataset.mutate(dataset.id)}
                    isProcessing={processDataset.isPending}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DatasetUploadDialog 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog} 
      />
    </div>
  );
}

interface DatasetCardProps {
  dataset: Dataset;
  onProcess: () => void;
  isProcessing: boolean;
}

function DatasetCard({ dataset, onProcess, isProcessing }: DatasetCardProps) {
  const status = statusConfig[dataset.status];

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{dataset.name}</h4>
            <Badge variant="outline" className={`flex items-center gap-1 ${status.color}`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
          {dataset.description && (
            <p className="text-sm text-muted-foreground mb-2">{dataset.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Records: {dataset.records_count}</span>
            <span>Processed: {dataset.processed_count}</span>
            <span>
              Uploaded {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
            </span>
          </div>
          {dataset.error_log && (
            <p className="text-xs text-destructive mt-2">{dataset.error_log}</p>
          )}
          {Object.keys(dataset.field_mappings).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(dataset.field_mappings).slice(0, 5).map(([source, target]) => (
                <Badge key={source} variant="secondary" className="text-xs">
                  {source} → {target}
                </Badge>
              ))}
              {Object.keys(dataset.field_mappings).length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{Object.keys(dataset.field_mappings).length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {dataset.status === 'pending' && (
            <Button 
              size="sm" 
              onClick={onProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Process'
              )}
            </Button>
          )}
          {dataset.status === 'failed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onProcess}
              disabled={isProcessing}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
