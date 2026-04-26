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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_wallets: {
        Row: {
          address: string
          created_at: string
          id: string
          is_active: boolean
          network: string
          token: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_active?: boolean
          network: string
          token: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_active?: boolean
          network?: string
          token?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          network: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          token: string
          user_id: string
          wallet_address: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at: string
          id?: string
          network: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token: string
          user_id: string
          wallet_address: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          network?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token?: string
          user_id?: string
          wallet_address?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposits_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "admin_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          daily_roi_pct: number
          duration_days: number
          ends_at: string
          id: string
          is_referral_paid: boolean
          plan_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          daily_roi_pct: number
          duration_days: number
          ends_at: string
          id?: string
          is_referral_paid?: boolean
          plan_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          daily_roi_pct?: number
          duration_days?: number
          ends_at?: string
          id?: string
          is_referral_paid?: boolean
          plan_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          daily_roi_pct: number
          duration_days: number
          id: string
          is_active: boolean
          max_amount: number
          min_amount: number
          name: string
          sort_order: number
          tier: string
        }
        Insert: {
          created_at?: string
          daily_roi_pct: number
          duration_days?: number
          id?: string
          is_active?: boolean
          max_amount: number
          min_amount: number
          name: string
          sort_order?: number
          tier: string
        }
        Update: {
          created_at?: string
          daily_roi_pct?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          max_amount?: number
          min_amount?: number
          name?: string
          sort_order?: number
          tier?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          country: string | null
          created_at: string
          custom_roi_bonus: number
          email: string | null
          full_name: string | null
          id: string
          referral_count: number
          referral_earnings: number
          referred_by: string | null
          total_invested: number
          total_profit: number
          updated_at: string
        }
        Insert: {
          balance?: number
          country?: string | null
          created_at?: string
          custom_roi_bonus?: number
          email?: string | null
          full_name?: string | null
          id: string
          referral_count?: number
          referral_earnings?: number
          referred_by?: string | null
          total_invested?: number
          total_profit?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          country?: string | null
          created_at?: string
          custom_roi_bonus?: number
          email?: string | null
          full_name?: string | null
          id?: string
          referral_count?: number
          referral_earnings?: number
          referred_by?: string | null
          total_invested?: number
          total_profit?: number
          updated_at?: string
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
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          destination_address: string
          id: string
          network: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          token: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          destination_address: string
          id?: string
          network: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          destination_address?: string
          id?: string
          network?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_daily_rewards: {
        Args: Record<string, never>
        Returns: void
      }
      award_referral_commission: {
        Args: { _investment_id: string }
        Returns: void
      }
      admin_credit_deposit: {
        Args: { _deposit_id: string }
        Returns: void
      }
      admin_reject_deposit: {
        Args: { _deposit_id: string; _reason?: string }
        Returns: void
      }
      admin_approve_withdrawal: {
        Args: { _withdrawal_id: string }
        Returns: void
      }
      admin_reject_withdrawal: {
        Args: { _reason: string; _withdrawal_id: string }
        Returns: void
      }
      admin_update_user: {
        Args: { _balance: number; _roi_bonus: number; _user_id: string }
        Returns: void
      }
      create_investment: {
        Args: { _amount: number; _plan_id: string }
        Returns: void
      }
      request_withdrawal: {
        Args: {
          _address: string
          _amount: number
          _network: string
          _token: string
        }
        Returns: Database["public"]["Tables"]["withdrawals"]["Row"]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
