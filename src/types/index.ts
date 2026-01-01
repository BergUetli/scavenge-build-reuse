/**
 * SCAVENGER APP - TYPE DEFINITIONS
 * 
 * Central type definitions for the entire application.
 * These types mirror the database schema and API responses.
 */

// =============================================
// DATABASE ENTITY TYPES
// =============================================

/**
 * Component/Material from the database
 * Reference data for known components
 */
export interface Component {
  id: string;
  component_name: string;
  category: ComponentCategory;
  specifications: Record<string, unknown>;
  reusability_score: number | null;
  market_value: number | null;
  datasheet_url: string | null;
  image_url: string | null;
  description: string | null;
  common_uses: string[] | null;
  created_at: string;
}

/**
 * DIY Project from the database
 */
export interface Project {
  id: string;
  project_name: string;
  description: string;
  difficulty_level: DifficultyLevel;
  estimated_time: string;
  category: string;
  tutorial_url: string | null;
  thumbnail_url: string | null;
  required_components: RequiredComponent[];
  required_tools: string[] | null;
  skills_needed: string[] | null;
  created_at: string;
}

/**
 * User's inventory item
 */
export interface InventoryItem {
  id: string;
  user_id: string;
  component_name: string;
  category: ComponentCategory;
  quantity: number;
  condition: ItemCondition;
  status: ItemStatus;
  specifications: Record<string, unknown>;
  reusability_score: number | null;
  market_value: number | null;
  image_url: string | null;
  notes: string | null;
  date_added: string;
  updated_at: string;
}

/**
 * Scan history entry
 */
export interface ScanHistoryItem {
  id: string;
  user_id: string;
  component_name: string;
  category: ComponentCategory;
  confidence: number | null;
  image_url: string | null;
  ai_response: AIIdentificationResponse | null;
  scanned_at: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  items_scanned: number;
  items_saved: number;
  co2_saved: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// ENUM TYPES
// =============================================

export type ComponentCategory = 
  | 'Electronics' 
  | 'Wood' 
  | 'Metal' 
  | 'Fabric' 
  | 'Mechanical' 
  | 'Other';

export type DifficultyLevel = 
  | 'Novice'
  | 'Easy'
  | 'Beginner' 
  | 'Intermediate' 
  | 'Advanced'
  | 'Expert';

export type ItemCondition = 
  | 'New' 
  | 'Good' 
  | 'Fair' 
  | 'For Parts';

export type ItemStatus = 
  | 'Available' 
  | 'In Use' 
  | 'Used';

// =============================================
// API RESPONSE TYPES
// =============================================

/**
 * Technical specifications for ICs and components
 * Focused on rebuild-critical info
 */
export interface TechnicalSpecs {
  voltage?: string;           // Operating voltage (e.g., "5V", "3.3V")
  power_rating?: string;      // Power/current specs (e.g., "500mA", "10W")
  part_number?: string;       // IC part number for lookup (e.g., "STM32F103", "NE555")
  notes?: string;             // One-line practical tip
}

/**
 * Source/reference information for lookup
 */
export interface SourceInfo {
  datasheet_url?: string;
  purchase_url?: string;
}

/**
 * Disassembly instructions for parent object
 */
export interface DisassemblyInfo {
  steps: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time_estimate: string;
  injury_risk: 'Low' | 'Medium' | 'High';
  damage_risk: 'Low' | 'Medium' | 'High';
  safety_warnings?: string[];
  tutorial_url?: string;
  video_url?: string;
}

/**
 * Single identified item from AI
 */
export interface IdentifiedItem {
  component_name: string;
  category: ComponentCategory;
  specifications: Record<string, unknown>;
  technical_specs?: TechnicalSpecs;
  source_info?: SourceInfo;
  reusability_score: number;
  market_value_low: number;
  market_value_high: number;
  condition: ItemCondition;
  confidence: number;
  description: string;
  common_uses: string[];
}

/**
 * Cost information from AI scan
 */
export interface ScanCostInfo {
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

/**
 * AI identification response with full breakdown
 */
export interface AIIdentificationResponse {
  parent_object?: string;
  items: IdentifiedItem[];
  salvage_difficulty?: 'Easy' | 'Medium' | 'Hard';
  tools_needed?: string[];
  total_estimated_value_low?: number;
  total_estimated_value_high?: number;
  disassembly?: DisassemblyInfo;
  message?: string;
  raw_response?: string;
  partial_detection?: Record<string, string | null>;
  cost?: ScanCostInfo;
  cached?: boolean;
}

/**
 * Required component in a project
 */
export interface RequiredComponent {
  name: string;
  quantity: number;
  optional?: boolean;
  alternatives?: string[];
}

/**
 * Project match result from AI
 */
export interface ProjectMatch {
  project_id: string;
  project_name: string;
  match_score: number;
  components_have: string[];
  components_missing: Array<{
    name: string;
    estimated_cost: number;
  }>;
  total_missing_cost: number;
  recommendation: string;
}

/**
 * Project matching response
 */
export interface ProjectMatchResponse {
  matched_projects: ProjectMatch[];
  error?: string;
}

// =============================================
// FORM / INPUT TYPES
// =============================================

/**
 * Input for adding item to inventory
 */
export interface AddInventoryInput {
  component_name: string;
  category: ComponentCategory;
  quantity?: number;
  condition: ItemCondition;
  specifications?: Record<string, unknown>;
  technical_specs?: TechnicalSpecs;
  reusability_score?: number;
  market_value?: number;
  image_url?: string;
  notes?: string;
  description?: string;
  common_uses?: string[];
}

/**
 * Input for updating inventory item
 */
export interface UpdateInventoryInput {
  id: string;
  quantity?: number;
  condition?: ItemCondition;
  status?: ItemStatus;
  notes?: string;
}

// =============================================
// UI STATE TYPES
// =============================================

/**
 * Scanner state
 */
export interface ScannerState {
  isCapturing: boolean;
  isProcessing: boolean;
  capturedImage: string | null;
  error: string | null;
}

/**
 * Filter options for inventory
 */
export interface InventoryFilters {
  category?: ComponentCategory;
  status?: ItemStatus;
  searchQuery?: string;
}

/**
 * Filter options for projects
 */
export interface ProjectFilters {
  category?: string;
  difficulty?: DifficultyLevel;
  hasAllParts?: boolean;
  searchQuery?: string;
}
