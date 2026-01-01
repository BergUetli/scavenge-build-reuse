/**
 * AI PROVIDER SETTINGS
 * 
 * Allows users to select their preferred AI provider for scanning.
 * Shows which providers are configured and their estimated costs.
 */

import { useState, useEffect } from 'react';
import { Bot, Check, Sparkles, Zap, DollarSign, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AIProvider = 'openai' | 'gemini' | 'claude';

interface ProviderInfo {
  id: AIProvider;
  name: string;
  model: string;
  description: string;
  costLevel: 'free' | 'low' | 'medium' | 'high';
  features: string[];
  setupUrl: string;
  envVar: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    model: 'Gemini 1.5 Flash',
    description: 'Fast and cost-effective with generous free tier',
    costLevel: 'free',
    features: ['Free tier available', 'Fast responses', 'Good vision'],
    setupUrl: 'https://aistudio.google.com/apikey',
    envVar: 'GOOGLE_AI_API_KEY'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    model: 'GPT-4o-mini',
    description: 'Excellent accuracy with good cost-efficiency',
    costLevel: 'low',
    features: ['High accuracy', 'Detailed analysis', 'Best for complex items'],
    setupUrl: 'https://platform.openai.com/api-keys',
    envVar: 'OPENAI_API_KEY'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    model: 'Claude 3 Haiku',
    description: 'Fast and accurate with excellent reasoning',
    costLevel: 'medium',
    features: ['Fast inference', 'Strong reasoning', 'Good vision'],
    setupUrl: 'https://console.anthropic.com/settings/keys',
    envVar: 'ANTHROPIC_API_KEY'
  }
];

const COST_COLORS: Record<string, string> = {
  free: 'bg-eco/20 text-eco',
  low: 'bg-blue-500/20 text-blue-500',
  medium: 'bg-amber-500/20 text-amber-500',
  high: 'bg-red-500/20 text-red-500'
};

const COST_LABELS: Record<string, string> = {
  free: 'Free Tier',
  low: '~$0.01/scan',
  medium: '~$0.02/scan',
  high: '~$0.05/scan'
};

export function AIProviderSettings() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user's current provider preference
  useEffect(() => {
    if (!user) return;
    
    const loadPreference = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('ai_provider')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.ai_provider) {
          setSelectedProvider(data.ai_provider as AIProvider);
        }
      } catch (error) {
        console.error('Failed to load AI provider preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreference();
  }, [user]);

  // Save provider preference
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_provider: selectedProvider })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Preference Saved',
        description: `AI provider set to ${PROVIDERS.find(p => p.id === selectedProvider)?.name}`
      });
    } catch (error) {
      console.error('Failed to save AI provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preference. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Provider
        </CardTitle>
        <CardDescription>
          Choose which AI service to use for component identification.
          API keys must be configured by the app administrator.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedProvider}
          onValueChange={(value) => setSelectedProvider(value as AIProvider)}
          className="space-y-3"
        >
          {PROVIDERS.map((provider) => (
            <div key={provider.id}>
              <Label
                htmlFor={provider.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  selectedProvider === provider.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value={provider.id} id={provider.id} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{provider.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {provider.model}
                    </Badge>
                    <Badge className={cn('text-xs', COST_COLORS[provider.costLevel])}>
                      {provider.costLevel === 'free' && <Sparkles className="w-3 h-3 mr-1" />}
                      {provider.costLevel !== 'free' && <DollarSign className="w-3 h-3 mr-1" />}
                      {COST_LABELS[provider.costLevel]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.features.map((feature, i) => (
                      <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedProvider === provider.id && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            API keys are managed in backend secrets
          </p>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving...' : 'Save Preference'}
          </Button>
        </div>

        {/* Setup instructions */}
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
          <p className="text-xs text-muted-foreground mb-3">
            To use a provider, the API key must be added to backend secrets:
          </p>
          <div className="space-y-2">
            {PROVIDERS.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between text-xs">
                <code className="bg-background px-2 py-1 rounded">{provider.envVar}</code>
                <a
                  href={provider.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
