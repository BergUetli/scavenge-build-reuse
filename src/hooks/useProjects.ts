/**
 * PROJECTS HOOK
 * 
 * Fetches projects and handles project matching with user inventory.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectMatch, ProjectMatchResponse, RequiredComponent, DifficultyLevel } from '@/types';
import { useInventory } from './useInventory';
import { toast } from '@/hooks/use-toast';

// Type guard for difficulty level
const isValidDifficulty = (level: string): level is DifficultyLevel => {
  return ['Beginner', 'Intermediate', 'Advanced'].includes(level);
};

/**
 * Hook for fetching and matching projects
 */
export function useProjects() {
  const { inventory } = useInventory();

  // Fetch all projects
  const {
    data: projects = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('project_name');

      if (error) throw error;
      
      return (data || []).map(project => ({
        ...project,
        difficulty_level: isValidDifficulty(project.difficulty_level) 
          ? project.difficulty_level 
          : 'Beginner',
        required_components: Array.isArray(project.required_components) 
          ? (project.required_components as unknown as RequiredComponent[])
          : []
      }));
    }
  });

  // Match projects with user inventory
  const matchProjects = useMutation({
    mutationFn: async (): Promise<ProjectMatchResponse> => {
      if (inventory.length === 0) {
        return { matched_projects: [] };
      }

      const { data, error } = await supabase.functions.invoke('match-projects', {
        body: {
          inventory: inventory.map(item => ({
            name: item.component_name,
            category: item.category,
            quantity: item.quantity
          })),
          projects: projects.map(p => ({
            id: p.id,
            name: p.project_name,
            required_components: p.required_components
          }))
        }
      });

      if (error) throw error;
      return data as ProjectMatchResponse;
    },
    onError: (error) => {
      toast({
        title: 'Matching Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Calculate which projects can be built with current inventory
  const getProjectCompatibility = (project: Project) => {
    const inventoryNames = inventory.map(i => i.component_name.toLowerCase());
    const required = project.required_components || [];
    
    const haveComponents = required.filter(comp => 
      inventoryNames.some(name => name.includes(comp.name.toLowerCase()) || comp.name.toLowerCase().includes(name))
    );
    
    const missingComponents = required.filter(comp =>
      !inventoryNames.some(name => name.includes(comp.name.toLowerCase()) || comp.name.toLowerCase().includes(name))
    );

    const matchPercentage = required.length > 0 
      ? Math.round((haveComponents.length / required.length) * 100) 
      : 0;

    return {
      haveComponents,
      missingComponents,
      matchPercentage,
      canBuild: missingComponents.length === 0
    };
  };

  return {
    projects,
    isLoading,
    error,
    matchProjects,
    getProjectCompatibility
  };
}
