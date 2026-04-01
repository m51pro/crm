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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in_date: string | null
          check_in_hour: number | null
          check_out_date: string | null
          check_out_hour: number | null
          client_name: string
          contract_number: string | null
          cottage_id: string
          created_at: string
          email: string | null
          guest_count: number | null
          id: string
          is_daily: boolean
          notes: string | null
          phone: string
          property: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          check_in_date?: string | null
          check_in_hour?: number | null
          check_out_date?: string | null
          check_out_hour?: number | null
          client_name: string
          contract_number?: string | null
          cottage_id: string
          created_at?: string
          email?: string | null
          guest_count?: number | null
          id?: string
          is_daily?: boolean
          notes?: string | null
          phone: string
          property?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          check_in_date?: string | null
          check_in_hour?: number | null
          check_out_date?: string | null
          check_out_hour?: number | null
          client_name?: string
          contract_number?: string | null
          cottage_id?: string
          created_at?: string
          email?: string | null
          guest_count?: number | null
          id?: string
          is_daily?: boolean
          notes?: string | null
          phone?: string
          property?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          bank_name: string | null
          bik: string | null
          birth_date: string | null
          client_type: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          corr_account: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          inn: string | null
          is_blacklisted: boolean
          kpp: string | null
          last_name: string | null
          legal_address: string | null
          middle_name: string | null
          notes: string | null
          ogrn: string | null
          org_name: string | null
          passport_issued_by: string | null
          passport_issued_date: string | null
          passport_number: string | null
          passport_series: string | null
          phone: string | null
          registration_address: string | null
          settlement_account: string | null
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          bik?: string | null
          birth_date?: string | null
          client_type?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          corr_account?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          inn?: string | null
          is_blacklisted?: boolean
          kpp?: string | null
          last_name?: string | null
          legal_address?: string | null
          middle_name?: string | null
          notes?: string | null
          ogrn?: string | null
          org_name?: string | null
          passport_issued_by?: string | null
          passport_issued_date?: string | null
          passport_number?: string | null
          passport_series?: string | null
          phone?: string | null
          registration_address?: string | null
          settlement_account?: string | null
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          bik?: string | null
          birth_date?: string | null
          client_type?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          corr_account?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          inn?: string | null
          is_blacklisted?: boolean
          kpp?: string | null
          last_name?: string | null
          legal_address?: string | null
          middle_name?: string | null
          notes?: string | null
          ogrn?: string | null
          org_name?: string | null
          passport_issued_by?: string | null
          passport_issued_date?: string | null
          passport_number?: string | null
          passport_series?: string | null
          phone?: string | null
          registration_address?: string | null
          settlement_account?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pre_booking" | "contract_signed" | "contract_paid"
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
      booking_status: ["pre_booking", "contract_signed", "contract_paid"],
    },
  },
} as const
