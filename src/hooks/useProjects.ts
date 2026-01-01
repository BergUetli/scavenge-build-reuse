/**
 * PROJECTS HOOK
 * 
 * Fetches projects and handles project matching with user inventory.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectMatch, ProjectMatchResponse, RequiredComponent, DifficultyLevel, InventoryItem } from '@/types';
import { useInventory } from './useInventory';
import { toast } from '@/hooks/use-toast';

// Type guard for difficulty level
const isValidDifficulty = (level: string): level is DifficultyLevel => {
  return ['Novice', 'Easy', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(level);
};

// Component aliases for smart matching - maps generic terms to specific components
const componentAliases: Record<string, string[]> = {
  'microcontroller': ['arduino', 'esp32', 'esp8266', 'atmega', 'pic', 'stm32', 'teensy', 'nano', 'uno', 'mega', 'raspberry pi pico'],
  'arduino': ['microcontroller', 'atmega', 'uno', 'nano', 'mega', 'leonardo', 'micro'],
  'esp32': ['microcontroller', 'esp', 'wifi module', 'bluetooth module'],
  'raspberry pi': ['single board computer', 'sbc', 'linux board'],
  'motor': ['dc motor', 'stepper motor', 'servo motor', 'brushless motor'],
  'dc motor': ['motor', 'small motor'],
  'led': ['light', 'indicator', 'diode'],
  'capacitor': ['cap', 'electrolytic', 'ceramic capacitor'],
  'resistor': ['resistance', 'fixed resistor'],
  'sensor': ['detector', 'transducer'],
  'switch': ['button', 'toggle', 'push button'],
  'wire': ['jumper wire', 'cable', 'conductor', 'hookup wire'],
  'battery': ['cell', 'power cell', '18650', 'lipo', 'li-ion'],
  'display': ['screen', 'lcd', 'oled', 'led matrix'],
  'speaker': ['buzzer', 'audio output', 'piezo'],
};

// Get all searchable terms from an inventory item (name + part_number + description keywords)
const getInventorySearchTerms = (item: InventoryItem): string[] => {
  const terms: string[] = [item.component_name.toLowerCase()];
  
  // Add part_number from technical_specs if available
  const specs = item.technical_specs as Record<string, unknown> | null;
  if (specs?.part_number && typeof specs.part_number === 'string') {
    terms.push(specs.part_number.toLowerCase());
  }
  
  // Add description keywords
  if (item.description) {
    terms.push(item.description.toLowerCase());
  }
  
  return terms;
};

// Check if inventory item matches a required component using aliases and technical specs
const inventoryItemMatchesComponent = (item: InventoryItem, requiredName: string): boolean => {
  const searchTerms = getInventorySearchTerms(item);
  const reqLower = requiredName.toLowerCase();
  
  // Check direct matches against all search terms
  for (const term of searchTerms) {
    if (term.includes(reqLower) || reqLower.includes(term)) {
      return true;
    }
  }
  
  // Check aliases
  for (const [key, aliases] of Object.entries(componentAliases)) {
    // If any of our search terms matches a key or its aliases
    const itemMatchesAlias = searchTerms.some(term => 
      term.includes(key) || aliases.some(a => term.includes(a))
    );
    
    if (itemMatchesAlias) {
      // Check if required component matches the same key or aliases
      if (reqLower.includes(key) || aliases.some(a => reqLower.includes(a))) {
        return true;
      }
    }
  }
  
  return false;
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
    const required = project.required_components || [];
    
    const haveComponents = required.filter(comp => 
      inventory.some(item => inventoryItemMatchesComponent(item, comp.name))
    );
    
    const missingComponents = required.filter(comp =>
      !inventory.some(item => inventoryItemMatchesComponent(item, comp.name))
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
