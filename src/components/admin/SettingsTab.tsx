/**
 * ADMIN SETTINGS TAB
 * 
 * Allows admins to configure app-wide settings like component limits.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Settings, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComponentLimitSetting {
  min: number;
  max: number;
}

export function SettingsTab() {
  const [componentLimit, setComponentLimit] = useState<ComponentLimitSetting>({ min: 8, max: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'component_limit')
          .single();

        if (error) throw error;

        if (data?.value) {
          const val = data.value as unknown as ComponentLimitSetting;
          if (val.min !== undefined && val.max !== undefined) {
            setComponentLimit(val);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error loading settings',
          description: 'Could not fetch current settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: JSON.parse(JSON.stringify(componentLimit)) })
        .eq('key', 'component_limit');

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: `Component limit set to ${componentLimit.min}-${componentLimit.max} components per scan.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        description: 'Could not save settings. Make sure you have admin permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Scanner Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle>AI Scanner Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how the AI identifies components during scans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Component Limit Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Component Limit per Scan</Label>
              <Badge variant="outline">
                {componentLimit.min} - {componentLimit.max} components
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              The AI will try to identify between this range of components for each scanned item.
              Higher numbers = more thorough but slower and costlier.
            </p>

            {/* Min slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Minimum components</span>
                <span className="font-medium">{componentLimit.min}</span>
              </div>
              <Slider
                value={[componentLimit.min]}
                onValueChange={([value]) => setComponentLimit(prev => ({ 
                  ...prev, 
                  min: Math.min(value, prev.max - 1) 
                }))}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />
            </div>

            {/* Max slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maximum components</span>
                <span className="font-medium">{componentLimit.max}</span>
              </div>
              <Slider
                value={[componentLimit.max]}
                onValueChange={([value]) => setComponentLimit(prev => ({ 
                  ...prev, 
                  max: Math.max(value, prev.min + 1) 
                }))}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComponentLimit({ min: 4, max: 10 })}
                className="text-xs"
              >
                Light (4-10)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComponentLimit({ min: 8, max: 20 })}
                className="text-xs"
              >
                Standard (8-20)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComponentLimit({ min: 15, max: 30 })}
                className="text-xs"
              >
                Thorough (15-30)
              </Button>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">How this affects scanning</p>
              <p className="text-sm text-muted-foreground">
                The AI prompt instructs the model to identify between {componentLimit.min}-{componentLimit.max}+ components.
                This affects API costs (more components = more tokens) and scan thoroughness.
                For complex devices like laptops, higher limits are recommended.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
