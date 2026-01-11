/**
 * INTERACTIVE DISASSEMBLY WIZARD
 * 
 * Guides users through step-by-step disassembly with:
 * - Progress tracking
 * - Safety warnings
 * - Risk acknowledgment
 * - Component images
 * - Tool requirements
 * - Final component selection
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Clock,
  Shield,
  ExternalLink,
  Package,
  Zap,
  Flame,
  Skull,
  Play
} from 'lucide-react';
import { AIIdentificationResponse, IdentifiedItem } from '@/types';
import { cn } from '@/lib/utils';

interface DisassemblyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIIdentificationResponse;
  imageUrl?: string;
  onComponentsSelected: (components: IdentifiedItem[]) => void;
}

type WizardStep = 'overview' | 'risk-acknowledgment' | 'steps' | 'component-selection';

export function DisassemblyWizard({
  isOpen,
  onClose,
  result,
  imageUrl,
  onComponentsSelected
}: DisassemblyWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('overview');
  const [stepIndex, setStepIndex] = useState(0);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(
    result.items.map(item => item.component_name)
  );

  const disassembly = result.disassembly;
  const steps = disassembly?.steps || [
    "No detailed steps available. Proceed with caution.",
    "Refer to manufacturer documentation or iFixit guides."
  ];

  // Extract YouTube video ID if available
  const getYouTubeVideoId = (url?: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(disassembly?.video_url);
  const hasVideo = !!youtubeVideoId;

  // Calculate timestamp for current step (estimate)
  const getStepTimestamp = (stepIndex: number, totalSteps: number) => {
    // Assume average teardown is 10-15 minutes
    // Distribute steps evenly
    const averageDuration = 12 * 60; // 12 minutes in seconds
    const secondsPerStep = averageDuration / totalSteps;
    return Math.floor(stepIndex * secondsPerStep);
  };

  // Risk level styling
  const getRiskStyle = (risk: string = 'Low') => {
    const styles = {
      Low: 'bg-green-500/10 text-green-600 border-green-500/20',
      Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      High: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return styles[risk as keyof typeof styles] || styles.Low;
  };

  const getRiskIcon = (risk: string = 'Low') => {
    switch (risk) {
      case 'High': return <Skull className="w-5 h-5" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  // Handle component selection
  const toggleComponent = (componentName: string) => {
    setSelectedComponents(prev =>
      prev.includes(componentName)
        ? prev.filter(c => c !== componentName)
        : [...prev, componentName]
    );
  };

  const selectAllComponents = () => {
    setSelectedComponents(result.items.map(item => item.component_name));
  };

  const deselectAllComponents = () => {
    setSelectedComponents([]);
  };

  // Navigation
  const handleNext = () => {
    if (currentStep === 'overview') {
      setCurrentStep('risk-acknowledgment');
    } else if (currentStep === 'risk-acknowledgment') {
      if (riskAccepted) {
        setCurrentStep('steps');
        setStepIndex(0);
      }
    } else if (currentStep === 'steps') {
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        setCurrentStep('component-selection');
      }
    } else if (currentStep === 'component-selection') {
      const selected = result.items.filter(item =>
        selectedComponents.includes(item.component_name)
      );
      onComponentsSelected(selected);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep === 'risk-acknowledgment') {
      setCurrentStep('overview');
    } else if (currentStep === 'steps') {
      if (stepIndex > 0) {
        setStepIndex(stepIndex - 1);
      } else {
        setCurrentStep('risk-acknowledgment');
      }
    } else if (currentStep === 'component-selection') {
      setCurrentStep('steps');
      setStepIndex(steps.length - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 'risk-acknowledgment') return riskAccepted;
    if (currentStep === 'component-selection') return selectedComponents.length > 0;
    return true;
  };

  // Progress calculation
  const getProgress = () => {
    const total = steps.length + 3; // overview + risk + steps + selection
    let current = 0;
    
    if (currentStep === 'overview') current = 1;
    else if (currentStep === 'risk-acknowledgment') current = 2;
    else if (currentStep === 'steps') current = 3 + stepIndex;
    else if (currentStep === 'component-selection') current = total;
    
    return (current / total) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Disassembly Guide: {result.parent_object || 'Device'}
            </DialogTitle>
            <Badge variant="outline" className={getRiskStyle(disassembly?.injury_risk)}>
              {getRiskIcon(disassembly?.injury_risk)}
              <span className="ml-1">{disassembly?.injury_risk || 'Low'} Risk</span>
            </Badge>
          </div>
          <Progress value={getProgress()} className="mt-4" />
        </DialogHeader>

        <div className="mt-6">
          {/* OVERVIEW STEP */}
          {currentStep === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Before You Begin</h3>
                
                {/* Device Image - REMOVED for text-only optimization */}

                {/* Quick Stats - LARGER TEXT */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-base font-medium">Time</span>
                    </div>
                    <p className="font-bold text-lg">{disassembly?.time_estimate || 'Unknown'}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Wrench className="w-5 h-5" />
                      <span className="text-base font-medium">Difficulty</span>
                    </div>
                    <p className="font-bold text-lg">{disassembly?.difficulty || 'Unknown'}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-base font-medium">Injury Risk</span>
                    </div>
                    <p className="font-bold text-lg">{disassembly?.injury_risk || 'Low'}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Package className="w-5 h-5" />
                      <span className="text-base font-medium">Components</span>
                    </div>
                    <p className="font-bold text-lg">{result.items.length}</p>
                  </div>
                </div>

                {/* Tools Required - LARGER TEXT */}
                {result.tools_needed && result.tools_needed.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Tools Required
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.tools_needed.map((tool, idx) => (
                        <Badge key={idx} variant="secondary" className="text-base py-2 px-3">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Warnings */}
                {disassembly?.safety_warnings && disassembly.safety_warnings.length > 0 && (
                  <Alert className="border-amber-500/20 bg-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-600">
                      <p className="font-semibold mb-2">Safety Warnings:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {disassembly.safety_warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* External Resources */}
                <div className="flex flex-col gap-3 mt-6">
                  {hasVideo && (
                    <Alert className="border-primary/20 bg-primary/10">
                      <Play className="w-5 h-5 text-primary" />
                      <AlertDescription className="text-primary">
                        <p className="font-bold">Video Guide Available!</p>
                        <p className="mt-1">This device has a step-by-step video tutorial that will play during disassembly.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-3">
                    {disassembly?.tutorial_url && (
                      <Button variant="outline" asChild>
                        <a href={disassembly.tutorial_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          iFixit Guide
                        </a>
                      </Button>
                    )}
                    {disassembly?.video_url && (
                      <Button variant="outline" asChild>
                        <a href={disassembly.video_url} target="_blank" rel="noopener noreferrer">
                          <Play className="w-4 h-4 mr-2" />
                          Full Video
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RISK ACKNOWLEDGMENT */}
          {currentStep === 'risk-acknowledgment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-6">Safety Acknowledgment</h3>
                
                <Alert className="border-red-500/20 bg-red-500/10 mb-6">
                  <Skull className="w-6 h-6 text-red-600" />
                  <AlertDescription className="text-red-600">
                    <p className="font-bold text-lg sm:text-xl mb-4">⚠️ Read Carefully Before Proceeding</p>
                    <div className="space-y-4 text-base sm:text-lg">
                      <p>
                        <strong>Injury Risk: {disassembly?.injury_risk || 'Low'}</strong> - 
                        This disassembly process may involve sharp edges, electrical components, 
                        batteries, or other hazardous materials.
                      </p>
                      
                      <p>
                        <strong>Damage Risk: {disassembly?.damage_risk || 'Medium'}</strong> - 
                        Improper disassembly may damage components, void warranties, or render 
                        the device unusable.
                      </p>

                      {result.items.some(item => 
                        item.component_name.toLowerCase().includes('battery') ||
                        item.component_name.toLowerCase().includes('capacitor')
                      ) && (
                        <>
                          <div className="bg-red-600/20 border border-red-600/30 rounded p-4 mt-4">
                            <div className="flex items-start gap-3">
                              <Zap className="w-6 h-6 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-lg">⚡ ELECTRICAL HAZARD DETECTED</p>
                                <p className="mt-2 text-base leading-relaxed">
                                  This device contains batteries or capacitors that may store electrical charge. 
                                  Improper handling can cause fire, explosion, or electric shock.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-red-600/20 border border-red-600/30 rounded p-4">
                            <div className="flex items-start gap-3">
                              <Flame className="w-6 h-6 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-lg">🔥 RECOMMENDATION: Seek Professional Help</p>
                                <p className="mt-2 text-base leading-relaxed">
                                  For components with soldered connections or embedded batteries, 
                                  we strongly recommend consulting a trained technician or electronics 
                                  repair professional.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-4 border-t border-red-600/20">
                        <p className="font-bold text-base">By proceeding, you acknowledge that:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-2 text-base">
                          <li>You understand the risks involved</li>
                          <li>You have the necessary tools and skills</li>
                          <li>You proceed at your own risk</li>
                          <li>Scavy is not liable for any injuries or damages</li>
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex items-start gap-4 p-5 sm:p-6 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="risk-acceptance"
                    checked={riskAccepted}
                    onCheckedChange={(checked) => setRiskAccepted(checked as boolean)}
                    className="mt-1.5"
                  />
                  <label htmlFor="risk-acceptance" className="text-base sm:text-lg cursor-pointer">
                    <span className="font-bold block mb-2">
                      I have read and understood the risks, and I choose to proceed at my own risk.
                    </span>
                    <p className="text-muted-foreground mt-1">
                      I understand that improper disassembly may result in injury, property damage, 
                      or destruction of the device.
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* DISASSEMBLY STEPS */}
          {currentStep === 'steps' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Step {stepIndex + 1} of {steps.length}
                </h3>
                <Badge variant="outline" className="text-base py-2 px-4 w-fit">
                  {Math.round(((stepIndex + 1) / steps.length) * 100)}% Complete
                </Badge>
              </div>

              {/* Step Content - TEXT ONLY, OPTIMIZED FOR MOBILE */}
              <div className="bg-muted/50 rounded-lg p-6 sm:p-8 min-h-[280px] flex items-center">
                <div className="w-full">
                  {/* YouTube Video Player (if available) */}
                  {hasVideo && (
                    <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?start=${getStepTimestamp(stepIndex, steps.length)}&autoplay=0`}
                        title="Teardown Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl sm:text-2xl">
                      {stepIndex + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-foreground">
                        {steps[stepIndex]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warning for specific steps */}
                {steps[stepIndex].toLowerCase().includes('solder') && (
                  <Alert className="mt-4 border-amber-500/20 bg-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-600">
                      <p className="font-semibold">⚠️ Soldered Component Detected</p>
                      <p className="mt-1">
                        This component appears to be machine-soldered. We recommend seeking help from 
                        a trained technician with proper desoldering equipment. If you proceed, use 
                        proper ventilation and heat-resistant tools.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {steps[stepIndex].toLowerCase().includes('battery') && (
                  <Alert className="mt-4 border-red-500/20 bg-red-500/10">
                    <Zap className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-600">
                      <p className="font-semibold">⚡ Battery Handling Warning</p>
                      <p className="mt-1">
                        Never puncture, bend, or short-circuit batteries. Disconnect power before 
                        proceeding. Store removed batteries in a safe, non-conductive container.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Progress Dots - LARGER FOR MOBILE */}
              <div className="flex justify-center gap-3">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-colors",
                      idx === stepIndex ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMPONENT SELECTION */}
          {currentStep === 'component-selection' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">Select Components to Save</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Choose which components you successfully extracted and want to add to your inventory.
                </p>

                <div className="flex gap-3 mb-6">
                  <Button variant="outline" size="lg" onClick={selectAllComponents}>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Select All
                  </Button>
                  <Button variant="outline" size="lg" onClick={deselectAllComponents}>
                    Clear All
                  </Button>
                </div>

                <div className="space-y-4">
                  {result.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-4 p-5 sm:p-6 rounded-lg border-2 transition-all cursor-pointer",
                        selectedComponents.includes(item.component_name)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleComponent(item.component_name)}
                    >
                      <Checkbox
                        checked={selectedComponents.includes(item.component_name)}
                        onCheckedChange={() => toggleComponent(item.component_name)}
                        className="mt-2"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-lg sm:text-xl mb-3">{item.component_name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-sm py-1 px-3">{item.category}</Badge>
                          <Badge variant="outline" className="text-sm py-1 px-3">Score: {item.reusability_score}/10</Badge>
                          <Badge variant="outline" className="text-sm py-1 px-3">
                            ${item.market_value_low?.toFixed(2)} - ${item.market_value_high?.toFixed(2)}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-base text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Alert className="mt-6">
                  <Package className="w-5 h-5" />
                  <AlertDescription className="text-base font-medium">
                    {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected. 
                    These will be added to your inventory.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 'overview' ? onClose : handleBack}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 'overview' ? 'Cancel' : 'Back'}
          </Button>

          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentStep === 'component-selection' ? (
              <>
                Save to Inventory
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
