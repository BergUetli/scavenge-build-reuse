/**
 * Component Colors and Priority Configuration
 * Used for the bubble UI in v0.7 scanner results
 */

export interface ComponentColorScheme {
  primary: string;
  secondary: string;
  text: string;
  border: string;
  gradient: string;
}

export const COMPONENT_COLORS: Record<string, ComponentColorScheme> = {
  'Power': {
    primary: '#FF6B35',
    secondary: '#FFE5DC',
    text: '#1F2937',
    border: '#FF6B35',
    gradient: 'from-orange-500 to-orange-600'
  },
  'ICs/Chips': {
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
    text: '#1F2937',
    border: '#8B5CF6',
    gradient: 'from-purple-500 to-purple-600'
  },
  'Electromechanical': {
    primary: '#3B82F6',
    secondary: '#DBEAFE',
    text: '#1F2937',
    border: '#3B82F6',
    gradient: 'from-blue-500 to-blue-600'
  },
  'Connectors': {
    primary: '#10B981',
    secondary: '#D1FAE5',
    text: '#1F2937',
    border: '#10B981',
    gradient: 'from-green-500 to-green-600'
  },
  'PCB': {
    primary: '#059669',
    secondary: '#D1FAE5',
    text: '#1F2937',
    border: '#059669',
    gradient: 'from-emerald-600 to-emerald-700'
  },
  'Electronics': {
    primary: '#06B6D4',
    secondary: '#CFFAFE',
    text: '#1F2937',
    border: '#06B6D4',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  'Display/LEDs': {
    primary: '#EC4899',
    secondary: '#FCE7F3',
    text: '#1F2937',
    border: '#EC4899',
    gradient: 'from-pink-500 to-pink-600'
  },
  'Sensors': {
    primary: '#F59E0B',
    secondary: '#FEF3C7',
    text: '#1F2937',
    border: '#F59E0B',
    gradient: 'from-amber-500 to-amber-600'
  },
  'Passive Components': {
    primary: '#6366F1',
    secondary: '#E0E7FF',
    text: '#1F2937',
    border: '#6366F1',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  'Mechanical': {
    primary: '#78716C',
    secondary: '#E7E5E4',
    text: '#FFFFFF',
    border: '#78716C',
    gradient: 'from-stone-500 to-stone-600'
  },
  'Camera': {
    primary: '#DB2777',
    secondary: '#FCE7F3',
    text: '#1F2937',
    border: '#DB2777',
    gradient: 'from-pink-600 to-pink-700'
  },
  'Other': {
    primary: '#64748B',
    secondary: '#F1F5F9',
    text: '#FFFFFF',
    border: '#64748B',
    gradient: 'from-slate-500 to-slate-600'
  }
};

export const CATEGORY_PRIORITY: Record<string, number> = {
  'Power': 1,
  'ICs/Chips': 2,
  'Display/LEDs': 3,
  'Camera': 4,
  'Electromechanical': 5,
  'Sensors': 6,
  'Connectors': 7,
  'PCB': 8,
  'Electronics': 9,
  'Passive Components': 10,
  'Mechanical': 11,
  'Other': 99
};

export function getComponentColor(category: string | undefined): ComponentColorScheme {
  if (!category) return COMPONENT_COLORS['Other'];
  
  // Try exact match first
  if (COMPONENT_COLORS[category]) {
    return COMPONENT_COLORS[category];
  }
  
  // Try partial match
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(COMPONENT_COLORS)) {
    if (lowerCategory.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return COMPONENT_COLORS['Other'];
}

export function sortByCategory(components: Array<{ category?: string }>): Array<{ category?: string }> {
  return [...components].sort((a, b) => {
    const priorityA = CATEGORY_PRIORITY[a.category || 'Other'] || 99;
    const priorityB = CATEGORY_PRIORITY[b.category || 'Other'] || 99;
    return priorityA - priorityB;
  });
}
