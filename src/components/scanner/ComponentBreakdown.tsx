/**
 * COMPONENT BREAKDOWN VIEW
 * 
 * iOS-native style display of identified components.
 * Fetches real AI-generated images for each component.
 */

import { useState, useEffect } from 'react';
import { 
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  DollarSign,
  Wrench,
  Package,
  Battery,
  Cpu,
  Speaker,
  Plug,
  CircuitBoard,
  Eye,
  Zap,
  Lightbulb,
  Cog,
  Disc,
  Microchip,
  Loader2,
  FileText,
  HelpCircle,
  ExternalLink,
  Info,
  AlertTriangle,
  Clock,
  BookOpen,
  Play,
  ShoppingCart,
  Link2,
  X,
  Edit3,
  Save,
  Database,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AIIdentificationResponse, IdentifiedItem, TechnicalSpecs, DisassemblyInfo, SourceInfo } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useSounds } from '@/hooks/useSounds';

interface ComponentBreakdownProps {
  result: AIIdentificationResponse;
  imageUrl?: string;
  onAddComponent: (item: IdentifiedItem) => void;
  onAddAll: () => void;
  onRescan: () => void;
  onUpdateComponent?: (index: number, updates: Partial<IdentifiedItem>) => void;
  isLoading?: boolean;
}

// Fallback icons for when images aren't loaded
const categoryIcons: Record<string, React.ReactNode> = {
  'Power': <Battery className="w-8 h-8" />,
  'ICs/Chips': <Microchip className="w-8 h-8" />,
  'Electromechanical': <Speaker className="w-8 h-8" />,
  'Connectors': <Plug className="w-8 h-8" />,
  'PCB': <CircuitBoard className="w-8 h-8" />,
  'Electronics': <Zap className="w-8 h-8" />,
  'Display/LEDs': <Lightbulb className="w-8 h-8" />,
  'Sensors': <Eye className="w-8 h-8" />,
  'Passive Components': <Disc className="w-8 h-8" />,
  'Mechanical': <Cog className="w-8 h-8" />,
  'Other': <Package className="w-8 h-8" />,
};

// Category gradient colors
const categoryGradients: Record<string, string> = {
  'Power': 'from-amber-500 to-orange-600',
  'ICs/Chips': 'from-violet-500 to-purple-600',
  'Electromechanical': 'from-blue-500 to-cyan-600',
  'Connectors': 'from-cyan-500 to-teal-600',
  'PCB': 'from-green-500 to-emerald-600',
  'Electronics': 'from-primary to-primary/80',
  'Display/LEDs': 'from-pink-500 to-rose-600',
  'Sensors': 'from-indigo-500 to-blue-600',
  'Passive Components': 'from-slate-500 to-gray-600',
  'Mechanical': 'from-orange-500 to-red-600',
  'Other': 'from-muted-foreground to-muted-foreground/80',
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  Easy: { label: 'Easy', color: 'text-eco' },
  Medium: { label: 'Medium', color: 'text-amber-500' },
  Hard: { label: 'Hard', color: 'text-red-500' },
};

type ViewMode = 'main' | 'detail';

export function ComponentBreakdown({ 
  result, 
  imageUrl,
  onAddComponent,
  onAddAll,
  onRescan,
  onUpdateComponent,
  isLoading = false
}: ComponentBreakdownProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedComponent, setSelectedComponent] = useState<IdentifiedItem | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [componentImages, setComponentImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<IdentifiedItem>>({});
  const { playClick, playSuccess } = useSounds();

  // Generate image for a component
  const generateImage = async (componentName: string, category: string) => {
    if (componentImages[componentName] || loadingImages.has(componentName)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(componentName));

    try {
      const { data, error } = await supabase.functions.invoke('generate-component-image', {
        body: { componentName, category }
      });

      if (error) {
        console.error('Error generating image:', error);
        return;
      }

      if (data?.success && data?.imageUrl) {
        setComponentImages(prev => ({
          ...prev,
          [componentName]: data.imageUrl
        }));
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(componentName);
        return next;
      });
    }
  };

  // Generate images for visible components
  useEffect(() => {
    if (result.items && result.items.length > 0) {
      // Generate images for first 4 components initially
      result.items.slice(0, 4).forEach(item => {
        generateImage(item.component_name, item.category);
      });
    }
  }, [result.items]);

  // Generate image when viewing detail
  useEffect(() => {
    if (selectedComponent) {
      generateImage(selectedComponent.component_name, selectedComponent.category);
    }
  }, [selectedComponent]);

  // Sync selected component with result when it changes (after edit)
  useEffect(() => {
    if (selectedComponent && result.items) {
      const currentIndex = result.items.findIndex(i => i.component_name === selectedComponent.component_name);
      if (currentIndex >= 0) {
        setSelectedComponent(result.items[currentIndex]);
      }
    }
  }, [result.items]);

  const handleAddComponent = (item: IdentifiedItem) => {
    onAddComponent(item);
    setAddedItems(prev => new Set(prev).add(item.component_name));
  };

  const startEditing = (index: number, item: IdentifiedItem) => {
    playClick();
    setEditingIndex(index);
    setEditForm({
      component_name: item.component_name,
      category: item.category,
      condition: item.condition,
      description: item.description,
    });
  };

  const saveEdit = () => {
    if (editingIndex !== null && onUpdateComponent) {
      playSuccess();
      onUpdateComponent(editingIndex, editForm);
      setEditingIndex(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    playClick();
    setEditingIndex(null);
    setEditForm({});
  };

  const hasComponents = result.items && result.items.length > 0;
  const difficulty = result.salvage_difficulty ? difficultyConfig[result.salvage_difficulty] : null;

  // Render component image or fallback
  const renderComponentImage = (item: IdentifiedItem, size: 'small' | 'large' = 'small') => {
    const image = componentImages[item.component_name];
    const isLoadingImage = loadingImages.has(item.component_name);
    const gradient = categoryGradients[item.category] || categoryGradients['Other'];
    const icon = categoryIcons[item.category] || categoryIcons['Other'];

    if (image) {
      return (
        <img 
          src={image} 
          alt={item.component_name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Fallback with icon and gradient
    return (
      <>
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          {isLoadingImage ? (
            <Loader2 className={cn("animate-spin", size === 'large' ? 'w-12 h-12' : 'w-8 h-8')} />
          ) : (
            icon
          )}
        </div>
      </>
    );
  };

  // Main view
  if (viewMode === 'main') {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Large Title */}
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {result.parent_object || 'Identified Item'}
        </h1>

        {/* Caption Section */}
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-1">
            Salvage Info
          </p>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-xl font-semibold text-foreground">
              {hasComponents ? `${result.items.length} Parts Found` : 'No Parts Found'}
            </p>
            
            {/* Source Badge */}
            {(result as any).from_database ? (
              <Badge variant="default" className="bg-eco/10 text-eco border-eco/20">
                <Database className="w-3 h-3 mr-1" />
                Verified Database
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Identified
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">
            {result.total_estimated_value_low !== undefined 
              ? `$${result.total_estimated_value_low} - $${result.total_estimated_value_high} total value`
              : 'Value unknown'}
          </p>
        </div>

        {/* Main Image Card */}
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
            <img 
              src={imageUrl} 
              alt="Scanned item" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white/80 text-sm">
                {difficulty ? `${difficulty.label} to salvage` : 'Tap below to see parts'}
              </p>
            </div>
          </div>
        )}

        {/* Disassembly Section - Inline on Main View */}
        {result.disassembly && (
          <div className="rounded-2xl bg-muted/50 border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">How to Disassemble</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {result.disassembly.time_estimate || 'Unknown'}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Risk Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "rounded-xl p-3 text-center",
                  result.disassembly.injury_risk === 'High' ? 'bg-destructive/10 border border-destructive/20' :
                  result.disassembly.injury_risk === 'Medium' ? 'bg-warning/10 border border-warning/20' :
                  'bg-eco/10 border border-eco/20'
                )}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Injury Risk</p>
                  <p className={cn(
                    "text-sm font-bold",
                    result.disassembly.injury_risk === 'High' ? 'text-destructive' :
                    result.disassembly.injury_risk === 'Medium' ? 'text-warning' :
                    'text-eco'
                  )}>
                    {result.disassembly.injury_risk || 'Unknown'}
                  </p>
                </div>
                <div className={cn(
                  "rounded-xl p-3 text-center",
                  result.disassembly.damage_risk === 'High' ? 'bg-destructive/10 border border-destructive/20' :
                  result.disassembly.damage_risk === 'Medium' ? 'bg-warning/10 border border-warning/20' :
                  'bg-eco/10 border border-eco/20'
                )}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Damage Risk</p>
                  <p className={cn(
                    "text-sm font-bold",
                    result.disassembly.damage_risk === 'High' ? 'text-destructive' :
                    result.disassembly.damage_risk === 'Medium' ? 'text-warning' :
                    'text-eco'
                  )}>
                    {result.disassembly.damage_risk || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Safety Warnings */}
              {result.disassembly.safety_warnings && result.disassembly.safety_warnings.length > 0 && (
                <div className="rounded-xl bg-warning/10 border border-warning/20 p-3">
                  <div className="flex items-center gap-1.5 text-warning mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Safety Warnings</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.disassembly.safety_warnings.map((warn, idx) => (
                      <li key={idx}>• {warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              <div>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
                  Steps
                </p>
                <div className="space-y-2">
                  {result.disassembly.steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-foreground pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Links */}
              {(result.disassembly.tutorial_url || result.disassembly.video_url) && (
                <div className="flex gap-3 pt-2">
                  {result.disassembly.tutorial_url && (
                    <a 
                      href={result.disassembly.tutorial_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Guide
                    </a>
                  )}
                  {result.disassembly.video_url && (
                    <a 
                      href={result.disassembly.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Play className="w-4 h-4" />
                      Watch Video
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools Section */}
        {result.tools_needed && result.tools_needed.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Tools Needed
            </p>
            <div className="flex flex-wrap gap-2">
              {result.tools_needed.slice(0, 4).map((tool, idx) => (
                <span 
                  key={idx} 
                  className="text-base text-foreground bg-muted/50 px-3 py-1.5 rounded-lg"
                >
                  {tool}
                </span>
              ))}
              {result.tools_needed.length > 4 && (
                <span className="text-base text-muted-foreground px-3 py-1.5">
                  +{result.tools_needed.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Parts Section */}
        {hasComponents && (
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">
              Salvageable Parts
            </p>
          </div>
        )}

        {/* Parts Grid */}
        {hasComponents && (
          <div className="grid grid-cols-2 gap-3">
            {result.items.map((item, index) => {
              const isAdded = addedItems.has(item.component_name);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedComponent(item);
                    setViewMode('detail');
                  }}
                  onMouseEnter={() => generateImage(item.component_name, item.category)}
                  className={cn(
                    "relative rounded-2xl overflow-hidden aspect-square",
                    "active:scale-[0.97] transition-all duration-200",
                    "bg-muted",
                    isAdded && "ring-2 ring-eco ring-offset-2 ring-offset-background"
                  )}
                >
                  {renderComponentImage(item, 'small')}
                  
                  {/* Bottom overlay with name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                    <p className="text-white text-sm font-semibold line-clamp-2 leading-tight">
                      {item.component_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white/70 text-xs">{item.category}</span>
                      <span className="text-white font-medium text-xs">
                        ${item.market_value_low}-{item.market_value_high}
                      </span>
                    </div>
                  </div>

                  {/* Added checkmark */}
                  {isAdded && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-eco flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-success hover:bg-success/90 text-success-foreground"
            onClick={onAddAll}
            disabled={isLoading || !hasComponents || addedItems.size === result.items.length}
          >
            {addedItems.size === result.items.length ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                All Saved
              </>
            ) : (
              'Save All Parts'
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 text-base text-muted-foreground"
            onClick={onRescan}
          >
            Scan Another Item
          </Button>
        </div>
      </div>
    );
  }

  // Detail view
  if (viewMode === 'detail' && selectedComponent) {
    const isAdded = addedItems.has(selectedComponent.component_name);
    const confidence = Math.round((selectedComponent.confidence || 0.7) * 100);
    const currentIndex = result.items.findIndex(i => i.component_name === selectedComponent.component_name);
    const techSpecs = selectedComponent.technical_specs as TechnicalSpecs | undefined;
    
    // Helper to display value or "Unknown"
    const displayValue = (value: unknown) => {
      if (value === undefined || value === null || value === '') return 'Unknown';
      return String(value);
    };
    
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('main')}
          className="flex items-center gap-1 text-primary font-medium text-lg active:opacity-70"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Back</span>
        </button>

        {/* Component Image */}
        <div className="relative rounded-3xl overflow-hidden aspect-square max-w-[200px] mx-auto shadow-xl bg-muted">
          {renderComponentImage(selectedComponent, 'large')}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight text-center">
          {selectedComponent.component_name}
        </h1>

        {/* Category Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            {selectedComponent.category}
          </Badge>
        </div>

        {/* Tabs for Overview and Technical */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="technical" className="text-sm">
              <Cpu className="w-4 h-4 mr-1.5" />
              Technical
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
                  Value
                </p>
                <div className="flex items-baseline gap-1">
                  <DollarSign className="w-5 h-5 text-eco" />
                  <span className="text-3xl font-bold">{selectedComponent.market_value_low}</span>
                  <span className="text-xl text-muted-foreground">- {selectedComponent.market_value_high}</span>
                </div>
              </div>
              
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
                  Reusability
                </p>
                <div className="flex items-baseline gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-3xl font-bold">{selectedComponent.reusability_score}</span>
                  <span className="text-xl text-muted-foreground">/10</span>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Confidence
                </p>
                <span className="text-lg font-semibold">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>

            {/* Description */}
            {selectedComponent.description && (
              <div>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
                  Description
                </p>
                <p className="text-base text-foreground leading-relaxed">
                  {selectedComponent.description}
                </p>
              </div>
            )}

            {/* Common Uses */}
            {selectedComponent.common_uses && selectedComponent.common_uses.length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-2">
                  Common Uses
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedComponent.common_uses.map((use, idx) => (
                    <span 
                      key={idx} 
                      className="text-sm bg-muted/50 px-3 py-1.5 rounded-lg"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-4 mt-0">
            {/* Part Number - Most Important for ICs */}
            {techSpecs?.part_number && (
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Microchip className="w-5 h-5 text-primary" />
                  <p className="text-xs font-medium tracking-widest text-primary uppercase">
                    Part Number
                  </p>
                </div>
                <p className="text-xl font-mono font-bold text-foreground">
                  {techSpecs.part_number}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search this for datasheets & pinouts
                </p>
              </div>
            )}

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Voltage
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {displayValue(techSpecs?.voltage)}
                </p>
              </div>
              
              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="w-4 h-4 text-eco" />
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Power
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {displayValue(techSpecs?.power_rating)}
                </p>
              </div>
            </div>

            {/* General Specifications */}
            {selectedComponent.specifications && Object.keys(selectedComponent.specifications).length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-3">
                  Specifications
                </p>
                <div className="rounded-2xl bg-muted/30 divide-y divide-border/50">
                  {Object.entries(selectedComponent.specifications).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-3">
                      <span className="text-muted-foreground capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-sm font-mono">{displayValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Links */}
            {(() => {
              const sourceInfo = selectedComponent.source_info as SourceInfo | undefined;
              const hasSourceInfo = sourceInfo?.datasheet_url || sourceInfo?.purchase_url;
              
              return (
                <div className="space-y-3">
                  <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    Look Up Details
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Datasheet Link */}
                    {sourceInfo?.datasheet_url ? (
                      <a 
                        href={sourceInfo.datasheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 p-4 hover:bg-primary/20 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium text-sm">Datasheet</span>
                        <ExternalLink className="w-4 h-4 text-primary/70" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/30 p-4 text-muted-foreground">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm">No datasheet</span>
                      </div>
                    )}

                    {/* Purchase Link */}
                    {sourceInfo?.purchase_url ? (
                      <a 
                        href={sourceInfo.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-eco/10 border border-eco/20 p-4 hover:bg-eco/20 transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5 text-eco" />
                        <span className="font-medium text-sm">Buy</span>
                        <ExternalLink className="w-4 h-4 text-eco/70" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted/30 p-4 text-muted-foreground">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="text-sm">No link</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Search Buttons */}
                  {techSpecs?.part_number && (
                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(techSpecs.part_number + ' datasheet')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors text-sm"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Search Google
                      </a>
                      <a
                        href={`https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(techSpecs.part_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-3 hover:bg-muted transition-colors text-sm"
                      >
                        <Link2 className="w-4 h-4" />
                        Digi-Key
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Technical Notes */}
            {techSpecs?.notes && (
              <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <p className="text-xs font-medium tracking-widest text-warning uppercase">
                    Note
                  </p>
                </div>
                <p className="text-sm text-foreground">{techSpecs.notes}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        {result.items.length > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : result.items.length - 1;
                setSelectedComponent(result.items[prevIndex]);
              }}
              className="flex items-center gap-1 text-primary active:opacity-70"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            <span className="text-muted-foreground text-sm">
              {currentIndex + 1} of {result.items.length}
            </span>
            <button
              onClick={() => {
                const nextIndex = currentIndex < result.items.length - 1 ? currentIndex + 1 : 0;
                setSelectedComponent(result.items[nextIndex]);
              }}
              className="flex items-center gap-1 text-primary active:opacity-70"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Button */}
        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-lg font-semibold rounded-2xl",
            isAdded ? "bg-muted text-muted-foreground" : "bg-success hover:bg-success/90 text-success-foreground"
          )}
          disabled={isLoading || isAdded}
          onClick={() => handleAddComponent(selectedComponent)}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Saved
            </>
          ) : (
            'Add to Inventory'
          )}
        </Button>
      </div>
    );
  }

  return null;
}