/**
 * PROJECT CARD
 * 
 * Displays a project suggestion with match percentage.
 * Shows difficulty, time estimate, and component availability.
 */

import { Clock, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  matchPercentage?: number;
  haveComponents?: string[];
  missingComponents?: string[];
  onClick?: () => void;
}

// Difficulty color mapping
const difficultyColors: Record<string, string> = {
  Novice: 'bg-emerald-500/10 text-emerald-500',
  Easy: 'bg-eco/10 text-eco',
  Beginner: 'bg-green-500/10 text-green-600',
  Intermediate: 'bg-amber-500/10 text-amber-600',
  Advanced: 'bg-orange-500/10 text-orange-600',
  Expert: 'bg-red-500/10 text-red-600',
};

export function ProjectCard({ 
  project, 
  matchPercentage = 0,
  haveComponents = [],
  missingComponents = [],
  onClick 
}: ProjectCardProps) {
  const difficultyColor = difficultyColors[project.difficulty_level] || difficultyColors.Beginner;
  const canBuild = matchPercentage === 100;
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
        'border-border/50 bg-card/50 backdrop-blur-sm',
        canBuild && 'ring-2 ring-eco/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header with thumbnail */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted overflow-hidden">
            {project.thumbnail_url ? (
              <img 
                src={project.thumbnail_url} 
                alt={project.project_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {project.project_name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={cn('text-xs', difficultyColor)}>
                {project.difficulty_level}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {project.estimated_time}
              </span>
            </div>
          </div>
        </div>
        
        {/* Match progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Components Match</span>
            <span className={cn(
              'font-medium',
              canBuild ? 'text-eco' : 'text-foreground'
            )}>
              {matchPercentage}%
            </span>
          </div>
          <Progress value={matchPercentage} className="h-2" />
        </div>
        
        {/* Component summary */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          {haveComponents.length > 0 && (
            <span className="flex items-center gap-1 text-eco">
              <CheckCircle2 className="w-3 h-3" />
              {haveComponents.length} have
            </span>
          )}
          {missingComponents.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <XCircle className="w-3 h-3" />
              {missingComponents.length} needed
            </span>
          )}
        </div>
        
        {/* Can build badge */}
        {canBuild && (
          <Badge className="mt-3 bg-eco text-eco-foreground">
            Ready to Build!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
