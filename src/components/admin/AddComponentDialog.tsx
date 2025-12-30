import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdmin } from '@/hooks/useAdmin';
import type { HierarchicalComponent, AbstractionLevel } from '@/types/admin';

const formSchema = z.object({
  component_name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  abstraction_level: z.enum(['device', 'module', 'ic', 'discrete']),
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  parent_component_id: z.string().optional(),
  verified: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AddComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  components: HierarchicalComponent[];
}

const categories = ['Electronics', 'Wood', 'Metal', 'Fabric', 'Mechanical', 'Other'];
const abstractionLevels: { value: AbstractionLevel; label: string }[] = [
  { value: 'device', label: 'Device (e.g., Computer, Printer)' },
  { value: 'module', label: 'Module (e.g., Display, Keyboard)' },
  { value: 'ic', label: 'IC (e.g., CPU, Memory chip)' },
  { value: 'discrete', label: 'Discrete (e.g., Resistor, Capacitor)' },
];

export function AddComponentDialog({ open, onOpenChange, components }: AddComponentDialogProps) {
  const { addComponent } = useAdmin();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      component_name: '',
      category: 'Electronics',
      abstraction_level: 'device',
      brand: '',
      model: '',
      description: '',
      parent_component_id: '',
      verified: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await addComponent.mutateAsync({
      component_name: values.component_name,
      category: values.category,
      abstraction_level: values.abstraction_level,
      brand: values.brand || null,
      model: values.model || null,
      description: values.description || null,
      parent_component_id: values.parent_component_id || null,
      verified: values.verified,
      source: 'manual',
      specifications: {},
    });
    form.reset();
    onOpenChange(false);
  };

  // Filter parent options based on abstraction level
  const getParentOptions = (level: AbstractionLevel) => {
    const levelOrder = ['device', 'module', 'ic', 'discrete'];
    const currentIndex = levelOrder.indexOf(level);
    // Can only be child of higher-level components
    return components.filter((c) => {
      const parentIndex = levelOrder.indexOf(c.abstraction_level);
      return parentIndex < currentIndex;
    });
  };

  const selectedLevel = form.watch('abstraction_level');
  const parentOptions = getParentOptions(selectedLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
          <DialogDescription>
            Add a new component to the master database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="component_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Intel Core i7-12700K" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="abstraction_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {abstractionLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Intel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., i7-12700K" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {parentOptions.length > 0 && (
              <FormField
                control={form.control}
                name="parent_component_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Component</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {parentOptions.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id}>
                            {comp.component_name} ({comp.brand || 'No brand'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Link this component as a child of another.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the component..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="verified"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Mark as verified
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addComponent.isPending}>
                {addComponent.isPending ? 'Adding...' : 'Add Component'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
