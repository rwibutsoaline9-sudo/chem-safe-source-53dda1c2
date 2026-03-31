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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          business_name: string
          contact_name: string
          created_at: string | null
          document_url: string | null
          email: string
          id: string
          message: string | null
          phone: string
          product: string
          quantity: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          contact_name: string
          created_at?: string | null
          document_url?: string | null
          email: string
          id?: string
          message?: string | null
          phone: string
          product: string
          quantity: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          contact_name?: string
          created_at?: string | null
          document_url?: string | null
          email?: string
          id?: string
          message?: string | null
          phone?: string
          product?: string
          quantity?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_settings: {
        Row: {
          created_at: string
          id: string
          receiver_email: string
          sender_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_email: string
          sender_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_email?: string
          sender_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_settings: {
        Row: {
          adsense_publisher_id: string | null
          allow_indexing: boolean
          created_at: string
          default_meta_description: string | null
          ga4_measurement_id: string | null
          google_ads_id: string | null
          google_site_verification: string | null
          id: string
          updated_at: string
        }
        Insert: {
          adsense_publisher_id?: string | null
          allow_indexing?: boolean
          created_at?: string
          default_meta_description?: string | null
          ga4_measurement_id?: string | null
          google_ads_id?: string | null
          google_site_verification?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          adsense_publisher_id?: string | null
          allow_indexing?: boolean
          created_at?: string
          default_meta_description?: string | null
          ga4_measurement_id?: string | null
          google_ads_id?: string | null
          google_site_verification?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          payment_provider: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_provider?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_provider?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          crypto_api_key: string | null
          crypto_enabled: boolean
          crypto_provider: string | null
          id: string
          paypal_client_id: string | null
          paypal_enabled: boolean
          paypal_secret: string | null
          stripe_enabled: boolean
          stripe_public_key: string | null
          stripe_secret_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          crypto_api_key?: string | null
          crypto_enabled?: boolean
          crypto_provider?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_enabled?: boolean
          paypal_secret?: string | null
          stripe_enabled?: boolean
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          crypto_api_key?: string | null
          crypto_enabled?: boolean
          crypto_provider?: string | null
          id?: string
          paypal_client_id?: string | null
          paypal_enabled?: boolean
          paypal_secret?: string | null
          stripe_enabled?: boolean
          stripe_public_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          applications: string[] | null
          cas_number: string | null
          category: string
          created_at: string
          description: string | null
          grade: string | null
          id: string
          image_url: string | null
          is_restricted: boolean | null
          name: string
          packaging: string[] | null
          price_currency: string
          price_unit: string
          price_value: number
          purity: string | null
          updated_at: string
        }
        Insert: {
          applications?: string[] | null
          cas_number?: string | null
          category: string
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          is_restricted?: boolean | null
          name: string
          packaging?: string[] | null
          price_currency?: string
          price_unit: string
          price_value: number
          purity?: string | null
          updated_at?: string
        }
        Update: {
          applications?: string[] | null
          cas_number?: string | null
          category?: string
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          image_url?: string | null
          is_restricted?: boolean | null
          name?: string
          packaging?: string[] | null
          price_currency?: string
          price_unit?: string
          price_value?: number
          purity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_id: string | null
          id: string
          order_id: string
          provider: string
          raw: Json | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          order_id: string
          provider: string
          raw?: Json | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          order_id?: string
          provider?: string
          raw?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
