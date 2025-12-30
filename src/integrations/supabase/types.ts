export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      components: {
        Row: {
          abstraction_level: string | null
          brand: string | null
          category: string
          common_uses: string[] | null
          component_name: string
          created_at: string
          datasheet_url: string | null
          description: string | null
          id: string
          image_url: string | null
          market_value: number | null
          model: string | null
          parent_component_id: string | null
          reusability_score: number | null
          source: string | null
          specifications: Json | null
          verified: boolean | null
        }
        Insert: {
          abstraction_level?: string | null
          brand?: string | null
          category: string
          common_uses?: string[] | null
          component_name: string
          created_at?: string
          datasheet_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          market_value?: number | null
          model?: string | null
          parent_component_id?: string | null
          reusability_score?: number | null
          source?: string | null
          specifications?: Json | null
          verified?: boolean | null
        }
        Update: {
          abstraction_level?: string | null
          brand?: string | null
          category?: string
          common_uses?: string[] | null
          component_name?: string
          created_at?: string
          datasheet_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          market_value?: number | null
          model?: string | null
          parent_component_id?: string | null
          reusability_score?: number | null
          source?: string | null
          specifications?: Json | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "components_parent_component_id_fkey"
            columns: ["parent_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          created_at: string
          description: string | null
          error_log: string | null
          field_mappings: Json | null
          id: string
          name: string
          original_fields: Json | null
          processed_count: number | null
          records_count: number | null
          source_url: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          error_log?: string | null
          field_mappings?: Json | null
          id?: string
          name: string
          original_fields?: Json | null
          processed_count?: number | null
          records_count?: number | null
          source_url?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          error_log?: string | null
          field_mappings?: Json | null
          id?: string
          name?: string
          original_fields?: Json | null
          processed_count?: number | null
          records_count?: number | null
          source_url?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          co2_saved: number | null
          created_at: string
          display_name: string | null
          id: string
          items_saved: number | null
          items_scanned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          co2_saved?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          items_saved?: number | null
          items_scanned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          co2_saved?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          items_saved?: number | null
          items_scanned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty_level: string
          estimated_time: string
          id: string
          project_name: string
          required_components: Json
          required_tools: string[] | null
          skills_needed: string[] | null
          thumbnail_url: string | null
          tutorial_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level: string
          estimated_time: string
          id?: string
          project_name: string
          required_components?: Json
          required_tools?: string[] | null
          skills_needed?: string[] | null
          thumbnail_url?: string | null
          tutorial_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          estimated_time?: string
          id?: string
          project_name?: string
          required_components?: Json
          required_tools?: string[] | null
          skills_needed?: string[] | null
          thumbnail_url?: string | null
          tutorial_url?: string | null
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          ai_response: Json | null
          category: string
          component_name: string
          confidence: number | null
          id: string
          image_url: string | null
          scanned_at: string
          user_id: string
        }
        Insert: {
          ai_response?: Json | null
          category: string
          component_name: string
          confidence?: number | null
          id?: string
          image_url?: string | null
          scanned_at?: string
          user_id: string
        }
        Update: {
          ai_response?: Json | null
          category?: string
          component_name?: string
          confidence?: number | null
          id?: string
          image_url?: string | null
          scanned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          category: string
          component_name: string
          condition: string
          date_added: string
          id: string
          image_url: string | null
          market_value: number | null
          notes: string | null
          quantity: number
          reusability_score: number | null
          specifications: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          component_name: string
          condition: string
          date_added?: string
          id?: string
          image_url?: string | null
          market_value?: number | null
          notes?: string | null
          quantity?: number
          reusability_score?: number | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          component_name?: string
          condition?: string
          date_added?: string
          id?: string
          image_url?: string | null
          market_value?: number | null
          notes?: string | null
          quantity?: number
          reusability_score?: number | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
