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

/**
 * COMPONENT COMPATIBILITY SYSTEM
 * 
 * Defines which components are truly interchangeable in projects.
 * Each group contains components that can substitute for each other.
 */
const compatibilityGroups: string[][] = [
  // ATmega32U4 family - native USB, NOT compatible with 328/2560
  ['atmega32u4', 'arduino leonardo', 'arduino micro', 'pro micro', 'teensy 2.0'],
  
  // ATmega328P family - classic Arduino, compatible with each other
  ['atmega328', 'atmega328p', 'arduino uno', 'arduino nano', 'arduino pro mini'],
  
  // ATmega2560 family - more pins/memory
  ['atmega2560', 'arduino mega', 'arduino mega 2560'],
  
  // ESP32 family
  ['esp32', 'esp32-wroom', 'esp32-wrover', 'esp32 devkit'],
  
  // ESP8266 family
  ['esp8266', 'nodemcu', 'wemos d1', 'd1 mini'],
  
  // Raspberry Pi Pico family
  ['rp2040', 'raspberry pi pico', 'pico'],
  
  // Generic passive components - truly interchangeable
  ['led', 'light emitting diode', '5mm led', '3mm led'],
  ['resistor', 'fixed resistor', 'carbon resistor', 'metal film resistor'],
  ['capacitor', 'ceramic capacitor', 'electrolytic capacitor', 'cap'],
  ['wire', 'jumper wire', 'hookup wire', 'jumper wires', 'connecting wire'],
  ['switch', 'push button', 'tactile switch', 'button', 'momentary switch'],
  
  // Motor types - generally NOT interchangeable but similar enough for basic projects
  ['dc motor', 'small dc motor', 'toy motor'],
  ['servo', 'servo motor', 'sg90', 'mg90s', 'micro servo'],
  ['stepper', 'stepper motor', 'nema17', '28byj-48'],
  
  // Displays
  ['oled display', 'ssd1306', '0.96 oled', 'i2c oled'],
  ['lcd', '16x2 lcd', 'lcd display', 'character lcd'],
  ['led matrix', '8x8 led matrix', 'max7219 matrix', 'dot matrix'],
  
  // Sensors - group by function
  ['temperature sensor', 'dht11', 'dht22', 'ds18b20', 'thermistor'],
  ['ultrasonic sensor', 'hc-sr04', 'distance sensor'],
  ['pir sensor', 'motion sensor', 'hc-sr501'],
  
  // Power
  ['18650 battery', '18650', 'li-ion battery', 'lithium battery'],
  ['coin cell', 'cr2032', 'button cell'],
];

/**
 * Find which compatibility group a component belongs to
 */
const findCompatibilityGroup = (componentName: string): string[] | null => {
  const nameLower = componentName.toLowerCase();
  
  for (const group of compatibilityGroups) {
    if (group.some(term => nameLower.includes(term) || term.includes(nameLower))) {
      return group;
    }
  }
  return null;
};

/**
 * Check if two components are compatible (can substitute for each other)
 */
const areComponentsCompatible = (inventoryTerm: string, requiredName: string): boolean => {
  const invLower = inventoryTerm.toLowerCase();
  const reqLower = requiredName.toLowerCase();
  
  // Direct match
  if (invLower.includes(reqLower) || reqLower.includes(invLower)) {
    return true;
  }
  
  // Check if both belong to the same compatibility group
  const invGroup = findCompatibilityGroup(invLower);
  const reqGroup = findCompatibilityGroup(reqLower);
  
  if (invGroup && reqGroup) {
    // They must be in the SAME group to be compatible
    return invGroup === reqGroup || 
           invGroup.some(term => reqGroup.includes(term));
  }
  
  return false;
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

// Check if inventory item matches a required component using compatibility groups
const inventoryItemMatchesComponent = (item: InventoryItem, requiredName: string): boolean => {
  const searchTerms = getInventorySearchTerms(item);
  
  // Check each search term against the required component
  for (const term of searchTerms) {
    if (areComponentsCompatible(term, requiredName)) {
      return true;
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
