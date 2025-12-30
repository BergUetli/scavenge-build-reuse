/**
 * PROJECTS PAGE
 * 
 * Shows available projects matched against user's inventory.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lightbulb, Filter, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useInventory } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { DifficultyLevel, ProjectFilters, Project } from '@/types';
import { cn } from '@/lib/utils';

const difficulties: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, isLoading, getProjectCompatibility } = useProjects();
  const { inventory } = useInventory();

  const [filters, setFilters] = useState<ProjectFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  // Calculate compatibility for all projects
  const projectsWithCompatibility = useMemo(() => {
    return projects.map((project) => ({
      project,
      ...getProjectCompatibility(project),
    }));
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

  // Count projects by category
  const counts = useMemo(() => {
    const ready = projectsWithCompatibility.filter((p) => p.canBuild).length;
    const almost = projectsWithCompatibility.filter(
      (p) => !p.canBuild && p.missingComponents.length <= 2
    ).length;
    return { ready, almost, all: projects.length };
  }, [projectsWithCompatibility, projects.length]);

  // Handle project click
  const handleProjectClick = (project: Project) => {
    if (project.tutorial_url) {
      window.open(project.tutorial_url, '_blank');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-4 sticky top-0 z-40 safe-area-pt">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">What Can I Build?</h1>
                <p className="text-sm text-muted-foreground">
                  {inventory.length} components in inventory
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
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
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="ready" className="flex-1">
                Ready ({counts.ready})
              </TabsTrigger>
              <TabsTrigger value="almost" className="flex-1">
                Almost ({counts.almost})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Difficulty filters */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 max-w-md mx-auto">
            <Badge
              variant={!filters.difficulty ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilters((f) => ({ ...f, difficulty: undefined }))}
            >
              All Levels
            </Badge>
            {difficulties.map((diff) => (
              <Badge
                key={diff}
                variant={filters.difficulty === diff ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilters((f) => ({ ...f, difficulty: diff }))}
              >
                {diff}
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
                  ? 'No matching projects'
                  : 'No projects available'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {inventory.length === 0
                  ? 'Scan some components to see matching projects'
                  : 'Try adjusting your filters'}
              </p>
              {inventory.length === 0 && (
                <Button onClick={() => navigate('/scan')}>Start Scanning</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
