import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(1, 'Dataset name is required'),
  description: z.string().optional(),
  source_url: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface DatasetUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatasetUploadDialog({ open, onOpenChange }: DatasetUploadDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Record<string, unknown>[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      source_url: '',
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    setFileData(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
      setFileError('Please upload a JSON or CSV file');
      setFile(null);
      return;
    }

    setFile(selectedFile);

    // Parse file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        if (selectedFile.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const data = Array.isArray(parsed) ? parsed : [parsed];
          setFileData(data);
        } else {
          // Simple CSV parsing
          const lines = content.split('\n').filter(Boolean);
          if (lines.length < 2) {
            setFileError('CSV must have a header row and at least one data row');
            return;
          }
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i] || '';
              return obj;
            }, {} as Record<string, unknown>);
          });
          setFileData(data);
        }
      } catch (err) {
        setFileError('Failed to parse file. Please check the format.');
        setFileData(null);
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!fileData || fileData.length === 0) {
      setFileError('Please upload a valid data file');
      return;
    }

    setIsUploading(true);

    try {
      // Get original field names from first record
      const originalFields = Object.keys(fileData[0] || {});

      // Create dataset record
      const { data: dataset, error } = await supabase
        .from('datasets')
        .insert({
          name: values.name,
          description: values.description || null,
          source_url: values.source_url || null,
          original_fields: originalFields,
          records_count: fileData.length,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Call edge function to analyze and process
      const { error: fnError } = await supabase.functions.invoke('process-dataset', {
        body: { 
          datasetId: dataset.id,
          data: fileData,
          analyzeOnly: true, // First pass: just analyze field mappings
        },
      });

      if (fnError) {
        console.error('Processing error:', fnError);
        // Don't fail - dataset is created, can be processed later
      }

      toast({
        title: 'Dataset uploaded',
        description: `${fileData.length} records ready for processing.`,
      });

      form.reset();
      setFile(null);
      setFileData(null);
      onOpenChange(false);
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>
            Upload a JSON or CSV file containing component data. The AI will automatically 
            map fields to our schema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HP Printer Components 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the data source..."
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the original data source for reference.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data File</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="dataset-file"
                />
                <label 
                  htmlFor="dataset-file" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  {file ? (
                    <>
                      <FileJson className="h-10 w-10 text-primary mb-2" />
                      <p className="font-medium">{file.name}</p>
                      {fileData && (
                        <p className="text-sm text-muted-foreground">
                          {fileData.length} records • {Object.keys(fileData[0] || {}).length} fields
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload JSON or CSV
                      </p>
                    </>
                  )}
                </label>
              </div>
              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Preview fields */}
            {fileData && fileData.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Detected Fields</label>
                <div className="flex flex-wrap gap-1 p-3 bg-muted rounded-lg">
                  {Object.keys(fileData[0] || {}).map((field) => (
                    <span 
                      key={field}
                      className="px-2 py-0.5 bg-background rounded text-xs"
                    >
                      {field}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  The AI will map these to: component_name, category, brand, model, etc.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !fileData}>
                {isUploading ? 'Uploading...' : 'Upload Dataset'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
