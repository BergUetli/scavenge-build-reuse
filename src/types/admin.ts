/**
 * ADMIN PANEL TYPE DEFINITIONS
 */

export type AppRole = 'admin' | 'moderator' | 'user';

export type AbstractionLevel = 'device' | 'module' | 'ic' | 'discrete';

export type DatasetStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  source_url: string | null;
  status: DatasetStatus;
  field_mappings: Record<string, string>;
  original_fields: string[];
  records_count: number;
  processed_count: number;
  error_log: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HierarchicalComponent {
  id: string;
  component_name: string;
  category: string;
  specifications: Record<string, unknown>;
  reusability_score: number | null;
  market_value: number | null;
  datasheet_url: string | null;
  image_url: string | null;
  description: string | null;
  common_uses: string[] | null;
  created_at: string;
  // Hierarchical fields
  parent_component_id: string | null;
  abstraction_level: AbstractionLevel;
  brand: string | null;
  model: string | null;
  source: string;
  verified: boolean;
  // For UI tree display
  children?: HierarchicalComponent[];
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  transform?: 'direct' | 'lowercase' | 'uppercase' | 'number' | 'array';
}

export interface DatasetUploadRequest {
  name: string;
  description?: string;
  source_url?: string;
  data: Record<string, unknown>[];
}

export interface ProcessedDatasetResult {
  success: boolean;
  records_processed: number;
  records_failed: number;
  field_mappings: Record<string, string>;
  errors?: string[];
}

// Master database target fields
export const MASTER_COMPONENT_FIELDS = [
  'component_name',
  'category',
  'brand',
  'model',
  'description',
  'specifications',
  'reusability_score',
  'market_value',
  'common_uses',
  'parent_component_id',
  'abstraction_level',
] as const;

export type MasterComponentField = typeof MASTER_COMPONENT_FIELDS[number];
