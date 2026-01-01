/**
 * PROJECT DETAIL PAGE
 * 
 * Drill-down view for a specific project with step-by-step instructions,
 * component breakdown, and skill requirements.
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Wrench, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  BookOpen,
  Recycle,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import { useInventory } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';
import { DifficultyLevel, RequiredComponent } from '@/types';
import { ComponentDetailSheet } from '@/components/project/ComponentDetailSheet';
import { BuildInstructions, BuildStep } from '@/components/project/BuildInstructions';

// Difficulty configuration with colors and descriptions
const difficultyConfig: Record<string, { 
  color: string; 
  bgColor: string;
  description: string;
  icon: string;
}> = {
  Novice: { 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    description: 'No tools needed. Perfect for complete beginners.',
    icon: '🌱'
  },
  Easy: { 
    color: 'text-eco', 
    bgColor: 'bg-eco/10 border-eco/20',
    description: 'Basic tools only. Simple assembly required.',
    icon: '🔧'
  },
  Beginner: { 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10 border-green-500/20',
    description: 'Some experience helpful. Standard household tools.',
    icon: '⭐'
  },
  Intermediate: { 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    description: 'Technical skills required. Soldering or programming.',
    icon: '⚡'
  },
  Advanced: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    description: 'Complex build. Specialized tools and knowledge needed.',
    icon: '🔥'
  },
  Expert: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10 border-red-500/20',
    description: 'Major project. Significant time, cost, and expertise required.',
    icon: '🏆'
  },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, getProjectCompatibility } = useProjects();
  const { inventory } = useInventory();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['components', 'tools', 'skills', 'instructions'])
  );
  const [selectedComponent, setSelectedComponent] = useState<RequiredComponent | null>(null);
  const [componentSheetOpen, setComponentSheetOpen] = useState(false);

  const project = useMemo(() => 
    projects.find((p) => p.id === id), 
    [projects, id]
  );

  const compatibility = useMemo(() => 
    project ? getProjectCompatibility(project) : null,
    [project, getProjectCompatibility]
  );

  // Generate build steps from project data (or use stored ones)
  const buildSteps = useMemo((): BuildStep[] => {
    if (!project) return [];
    
    // Generate basic build steps based on project components and skills
    const steps: BuildStep[] = [];
    let stepNum = 1;

    // Step 1: Gather materials
    steps.push({
      step_number: stepNum++,
      title: 'Gather All Components',
      description: `Collect all ${project.required_components?.length || 0} required components. Check your Cargo Hold for parts you already have.`,
      tips: ['Organize components in separate containers', 'Verify quantities before starting'],
    });

    // Step 2: Prepare tools
    if (project.required_tools && project.required_tools.length > 0) {
      steps.push({
        step_number: stepNum++,
        title: 'Prepare Your Tools',
        description: `Set up your workspace with: ${project.required_tools.join(', ')}.`,
        tips: ['Ensure good lighting', 'Work on a clean, static-free surface'],
        warnings: project.required_tools.some(t => t.toLowerCase().includes('solder')) 
          ? ['Soldering iron gets very hot - use caution'] 
          : undefined,
      });
    }

    // Add skill-based steps
    if (project.skills_needed) {
      if (project.skills_needed.some(s => s.toLowerCase().includes('solder'))) {
        steps.push({
          step_number: stepNum++,
          title: 'Solder Components',
          description: 'Carefully solder each component to the PCB according to the circuit diagram. Start with smaller components first.',
          tips: ['Heat the pad and component lead together', 'Apply solder to the joint, not the iron'],
          warnings: ['Work in a ventilated area', 'Let solder joints cool before moving'],
        });
      }

      if (project.skills_needed.some(s => s.toLowerCase().includes('program') || s.toLowerCase().includes('code'))) {
        steps.push({
          step_number: stepNum++,
          title: 'Upload the Code',
          description: 'Connect your microcontroller to your computer and upload the program using the appropriate IDE.',
          tips: ['Install required libraries first', 'Select the correct board and port'],
        });
      }

      if (project.skills_needed.some(s => s.toLowerCase().includes('wire') || s.toLowerCase().includes('wiring'))) {
        steps.push({
          step_number: stepNum++,
          title: 'Wire the Components',
          description: 'Connect all components using jumper wires or by soldering. Follow the wiring diagram carefully.',
          tips: ['Use color-coded wires for easy identification', 'Double-check connections before powering on'],
          warnings: ['Incorrect wiring can damage components'],
        });
      }
    }

    // Assembly step
    steps.push({
      step_number: stepNum++,
      title: 'Assemble the Project',
      description: 'Put together all the components according to the design. Secure loose parts and organize wiring.',
      tips: ['Take photos during assembly for reference', 'Test fit components before final assembly'],
    });

    // Testing step
    steps.push({
      step_number: stepNum++,
      title: 'Test Your Build',
      description: 'Power on your project and verify all functions work correctly. Debug any issues.',
      tips: ['Start with low voltage if possible', 'Check for shorts before powering on'],
      warnings: ['Disconnect power immediately if you smell burning or see smoke'],
    });

    // Final step
    steps.push({
      step_number: stepNum++,
      title: 'Finalize & Enjoy',
      description: 'Make any final adjustments, add an enclosure if needed, and enjoy your completed project!',
      tips: ['Document your build for future reference', 'Share your creation with the community'],
    });

    return steps;
  }, [project]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleComponentClick = (comp: RequiredComponent) => {
    setSelectedComponent(comp);
    setComponentSheetOpen(true);
  };

  const isComponentOwned = (compName: string): boolean => {
    return compatibility?.haveComponents.some(c => c.name === compName) || false;
  };

  if (!project) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
            <Button onClick={() => navigate('/projects')}>
              Back to Schematics
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const diffConfig = difficultyConfig[project.difficulty_level] || difficultyConfig.Beginner;

  return (
    <AppLayout>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <header className="bg-gradient-hero border-b border-border px-4 py-4 sticky top-0 z-40 safe-area-pt">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {project.project_name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className={cn('text-xs', diffConfig.color, diffConfig.bgColor)}>
                    {diffConfig.icon} {project.difficulty_level}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {project.estimated_time}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Progress */}
            {compatibility && (
              <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Match</span>
                  <span className={cn(
                    'font-bold text-lg',
                    compatibility.canBuild ? 'text-eco' : 'text-foreground'
                  )}>
                    {compatibility.matchPercentage}%
                  </span>
                </div>
                <Progress value={compatibility.matchPercentage} className="h-3" />
                {compatibility.canBuild && (
                  <p className="text-eco text-xs mt-2 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    You have everything to build this!
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="px-4 pt-5 max-w-lg mx-auto space-y-4">
          {/* Thumbnail */}
          {project.thumbnail_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border">
              <img 
                src={project.thumbnail_url} 
                alt={project.project_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card className={cn('border', diffConfig.bgColor)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
                  diffConfig.bgColor
                )}>
                  {diffConfig.icon}
                </div>
                <div>
                  <h3 className={cn('font-semibold', diffConfig.color)}>
                    {project.difficulty_level} Level
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {diffConfig.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Components */}
          <Collapsible 
            open={expandedSections.has('components')}
            onOpenChange={() => toggleSection('components')}
          >
            <Card className="border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Required Components
                      <Badge variant="outline" className="ml-2">
                        {project.required_components?.length || 0}
                      </Badge>
                    </CardTitle>
                    {expandedSections.has('components') ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 px-4 pb-4">
                  {/* Components you have */}
                  {compatibility && compatibility.haveComponents.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-eco mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        In Your Cargo ({compatibility.haveComponents.length})
                      </h4>
                      <div className="space-y-2">
                        {compatibility.haveComponents.map((comp, idx) => (
                          <button 
                            key={idx}
                            className="w-full flex items-center justify-between p-3 rounded-lg border bg-eco/5 border-eco/20 hover:bg-eco/10 transition-colors text-left"
                            onClick={() => handleComponentClick(comp)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-eco shrink-0" />
                              <span className="text-sm font-medium truncate">{comp.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-xs text-eco border-eco/30">
                                x{comp.quantity}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Components you need */}
                  {compatibility && compatibility.missingComponents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Still Needed ({compatibility.missingComponents.length})
                      </h4>
                      <div className="space-y-2">
                        {compatibility.missingComponents.map((comp, idx) => {
                          // Determine if component is easy to salvage or better to buy
                          const salvageableCategories = ['resistor', 'capacitor', 'led', 'switch', 'wire', 'connector', 'motor', 'sensor', 'pcb'];
                          const buyCategories = ['microcontroller', 'arduino', 'esp32', 'raspberry', 'display', 'module', 'breakout', 'shield'];
                          
                          const nameLower = comp.name.toLowerCase();
                          const isSalvageable = salvageableCategories.some(cat => nameLower.includes(cat));
                          const isBuyRecommended = buyCategories.some(cat => nameLower.includes(cat));
                          
                          return (
                            <button 
                              key={idx}
                              className="w-full flex items-center justify-between p-3 rounded-lg border bg-muted/30 border-border/50 hover:bg-muted/50 transition-colors text-left"
                              onClick={() => handleComponentClick(comp)}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium truncate">{comp.name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isSalvageable && (
                                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                    <Recycle className="w-3 h-3 mr-1" />
                                    Salvage
                                  </Badge>
                                )}
                                {isBuyRecommended && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                                    <ShoppingCart className="w-3 h-3 mr-1" />
                                    Buy
                                  </Badge>
                                )}
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No components case */}
                  {(!project.required_components || project.required_components.length === 0) && (
                    <p className="text-sm text-muted-foreground">No specific components listed for this project.</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Required Tools */}
          {project.required_tools && project.required_tools.length > 0 && (
            <Collapsible 
              open={expandedSections.has('tools')}
              onOpenChange={() => toggleSection('tools')}
            >
              <Card className="border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-accent" />
                        Required Tools
                        <Badge variant="outline" className="ml-2">
                          {project.required_tools.length}
                        </Badge>
                      </CardTitle>
                      {expandedSections.has('tools') ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.required_tools.map((tool, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="bg-accent/10 text-accent border border-accent/20"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Skills Needed */}
          {project.skills_needed && project.skills_needed.length > 0 && (
            <Collapsible 
              open={expandedSections.has('skills')}
              onOpenChange={() => toggleSection('skills')}
            >
              <Card className="border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" />
                        Skills Needed
                        <Badge variant="outline" className="ml-2">
                          {project.skills_needed.length}
                        </Badge>
                      </CardTitle>
                      {expandedSections.has('skills') ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.skills_needed.map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="bg-warning/10 text-warning border border-warning/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Build Instructions - Inline */}
          <Collapsible 
            open={expandedSections.has('instructions')}
            onOpenChange={() => toggleSection('instructions')}
          >
            <Card className="border-primary/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Build Instructions
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                        {buildSteps.length} steps
                      </Badge>
                    </CardTitle>
                    {expandedSections.has('instructions') ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 px-4 pb-4">
                  <BuildInstructions steps={buildSteps} />
                  
                  {/* External tutorial link if available */}
                  {project.tutorial_url && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 justify-center gap-2"
                      onClick={() => window.open(project.tutorial_url!, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full External Tutorial
                    </Button>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Category Badge */}
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Category: {project.category}
            </Badge>
          </div>
        </div>

        {/* Component Detail Sheet */}
        <ComponentDetailSheet
          component={selectedComponent}
          open={componentSheetOpen}
          onOpenChange={setComponentSheetOpen}
          isOwned={selectedComponent ? isComponentOwned(selectedComponent.name) : false}
        />
      </div>
    </AppLayout>
  );
}
