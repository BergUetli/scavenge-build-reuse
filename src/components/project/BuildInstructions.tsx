/**
 * BUILD INSTRUCTIONS
 * 
 * Displays step-by-step build instructions for a project.
 */

import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface BuildStep {
  step_number: number;
  title: string;
  description: string;
  tips?: string[];
  warnings?: string[];
  image_url?: string;
}

interface BuildInstructionsProps {
  steps: BuildStep[];
  className?: string;
}

export function BuildInstructions({ steps, className }: BuildInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {completedSteps.size}/{steps.length} completed
        </Badge>
        <span className="text-xs text-muted-foreground">Tap to mark done</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-eco transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.has(step.step_number);
            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.step_number} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[15px] top-[36px] w-0.5 h-[calc(100%-20px)] bg-border" />
                )}

                <div 
                  className={cn(
                    'flex gap-3 cursor-pointer group',
                    isCompleted && 'opacity-60'
                  )}
                  onClick={() => toggleStep(step.step_number)}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted 
                      ? 'bg-eco border-eco' 
                      : 'bg-background border-border group-hover:border-primary'
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-eco-foreground" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {step.step_number}
                      </span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <h4 className={cn(
                      'font-medium text-sm leading-tight',
                      isCompleted && 'line-through'
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step image */}
                    {step.image_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-border/50">
                        <img 
                          src={step.image_url} 
                          alt={step.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Warnings */}
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-1.5 text-destructive text-xs font-medium mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          Warning
                        </div>
                        <ul className="text-xs text-destructive/80 space-y-0.5">
                          {step.warnings.map((warning, wIdx) => (
                            <li key={wIdx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tips */}
                    {step.tips && step.tips.length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-1">
                          <Lightbulb className="w-3 h-3" />
                          Tip
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {step.tips.map((tip, tIdx) => (
                            <li key={tIdx}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {/* Completion message */}
      {completedSteps.size === steps.length && (
        <div className="p-3 rounded-lg bg-eco/10 border border-eco/20 text-center">
          <p className="text-sm font-medium text-eco">
            🎉 Congratulations! You've completed all steps!
          </p>
        </div>
      )}
    </div>
  );
}
