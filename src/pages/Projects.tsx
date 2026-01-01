/**
 * PROJECTS PAGE (SCHEMATICS)
 * 
 * Shows available projects matched against user's inventory.
 * Features difficulty filtering from Novice to Expert.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lightbulb, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useInventory } from '@/hooks/useInventory';
import { DifficultyLevel, ProjectFilters, Project } from '@/types';
import { cn } from '@/lib/utils';

// All difficulty levels in order
const difficulties: { level: DifficultyLevel; emoji: string; color: string }[] = [
  { level: 'Novice', emoji: '🌱', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
  { level: 'Easy', emoji: '🔧', color: 'text-eco border-eco/30 bg-eco/10' },
  { level: 'Intermediate', emoji: '⚡', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
  { level: 'Advanced', emoji: '🔥', color: 'text-orange-500 border-orange-500/30 bg-orange-500/10' },
  { level: 'Expert', emoji: '🏆', color: 'text-red-500 border-red-500/30 bg-red-500/10' },
];

export default function Projects() {
  const navigate = useNavigate();
  const { projects, isLoading, getProjectCompatibility } = useProjects();
  const { inventory } = useInventory();

  const [filters, setFilters] = useState<ProjectFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  // Calculate compatibility for all projects - only include those with at least 1 matching component
  const projectsWithCompatibility = useMemo(() => {
    return projects
      .map((project) => ({
        project,
        ...getProjectCompatibility(project),
      }))
      .filter((p) => p.haveComponents.length > 0); // Only show projects with at least 1 matching part
  }, [projects, getProjectCompatibility]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = projectsWithCompatibility;

    // Tab filter
    if (activeTab === 'ready') {
      result = result.filter((p) => p.canBuild);
    } else if (activeTab === 'almost') {
      result = result.filter(
        (p) => !p.canBuild && p.missingComponents.length <= 2
      );
    }

    // Difficulty filter
    if (filters.difficulty) {
      result = result.filter(
        (p) => p.project.difficulty_level === filters.difficulty
      );
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.project.project_name.toLowerCase().includes(query) ||
          p.project.description.toLowerCase().includes(query) ||
          p.project.category.toLowerCase().includes(query)
      );
    }

    // Sort by match percentage (descending)
    return result.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [projectsWithCompatibility, activeTab, filters]);

  // Count projects by category - based on filtered projects with matches
  const counts = useMemo(() => {
    const ready = projectsWithCompatibility.filter((p) => p.canBuild).length;
    const almost = projectsWithCompatibility.filter(
      (p) => !p.canBuild && p.missingComponents.length <= 2
    ).length;
    return { ready, almost, all: projectsWithCompatibility.length };
  }, [projectsWithCompatibility]);

  // Handle project click - navigate to detail page
  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-gradient-hero border-b border-border px-4 py-4 sticky top-0 z-40 safe-area-pt">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Schematics
                </h1>
                <p className="text-sm text-muted-foreground">
                  {projectsWithCompatibility.length} matching builds • {inventory.length} parts in cargo
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schematics..."
                className="pl-9 bg-card/50 border-border/50"
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, searchQuery: e.target.value }))
                }
              />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-4 py-3 max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="all" className="flex-1">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="ready" className="flex-1">
                ✓ Ready ({counts.ready})
              </TabsTrigger>
              <TabsTrigger value="almost" className="flex-1">
                Almost ({counts.almost})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Difficulty filters */}
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 max-w-md mx-auto">
            <Badge
              variant={!filters.difficulty ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap shrink-0"
              onClick={() => setFilters((f) => ({ ...f, difficulty: undefined }))}
            >
              All Levels
            </Badge>
            {difficulties.map((diff) => (
              <Badge
                key={diff.level}
                variant="outline"
                className={cn(
                  'cursor-pointer whitespace-nowrap shrink-0 transition-all',
                  filters.difficulty === diff.level 
                    ? diff.color + ' border-2'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setFilters((f) => ({ 
                  ...f, 
                  difficulty: filters.difficulty === diff.level ? undefined : diff.level 
                }))}
              >
                {diff.emoji} {diff.level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects list */}
        <div className="px-4 pb-8 max-w-md mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-3">
              {filteredProjects.map(
                ({ project, matchPercentage, haveComponents, missingComponents }) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    matchPercentage={matchPercentage}
                    haveComponents={haveComponents.map((c) => c.name)}
                    missingComponents={missingComponents.map((c) => c.name)}
                    onClick={() => handleProjectClick(project)}
                  />
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-1">
                {filters.searchQuery || filters.difficulty
                  ? 'No matching schematics'
                  : inventory.length === 0
                    ? 'No components in cargo yet'
                    : 'No builds match your cargo'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {inventory.length === 0
                  ? 'Scan some components to discover matching builds'
                  : 'Add more components to your cargo to unlock builds'}
              </p>
              <Button onClick={() => navigate('/scan')}>
                {inventory.length === 0 ? 'Start Scanning' : 'Scan More Parts'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
