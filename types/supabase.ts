export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  event: {
    Tables: {
      event_gifts: {
        Row: {
          created_at: string
          event_id: string | null
          gift_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          gift_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          gift_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_gifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gift_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          event_id: string | null
          greeting_card_url: string | null
          invitee_id: string | null
          sent_at: string | null
          status: string | null
          text_messsage: string | null
        }
        Insert: {
          event_id?: string | null
          greeting_card_url?: string | null
          invitee_id?: string | null
          sent_at?: string | null
          status?: string | null
          text_messsage?: string | null
        }
        Update: {
          event_id?: string | null
          greeting_card_url?: string | null
          invitee_id?: string | null
          sent_at?: string | null
          status?: string | null
          text_messsage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_recurrences: {
        Row: {
          end_date: string | null
          event_id: string
          id: number
          invitee_id: string | null
          recurrence_pattern: string | null
          send_notifications: boolean | null
        }
        Insert: {
          end_date?: string | null
          event_id: string
          id?: number
          invitee_id?: string | null
          recurrence_pattern?: string | null
          send_notifications?: boolean | null
        }
        Update: {
          end_date?: string | null
          event_id?: string
          id?: number
          invitee_id?: string | null
          recurrence_pattern?: string | null
          send_notifications?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_recurrences_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_recurrences_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          end_datetime: string | null
          event_id: string
          event_type: Database["public"]["Enums"]["event_type"] | null
          start_datetime: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          end_datetime?: string | null
          event_id?: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
          start_datetime?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          end_datetime?: string | null
          event_id?: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
          start_datetime?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  gift: {
    Tables: {
      gift_fund_contributions: {
        Row: {
          amount: number | null
          contributed_at: string | null
          contributor_id: string | null
          gift_fund_id: string | null
          id: number
          third_party_payment_reference_id: number | null
          third_party_payment_system:
            | Database["public"]["Enums"]["payment_system"]
            | null
        }
        Insert: {
          amount?: number | null
          contributed_at?: string | null
          contributor_id?: string | null
          gift_fund_id?: string | null
          id?: number
          third_party_payment_reference_id?: number | null
          third_party_payment_system?:
            | Database["public"]["Enums"]["payment_system"]
            | null
        }
        Update: {
          amount?: number | null
          contributed_at?: string | null
          contributor_id?: string | null
          gift_fund_id?: string | null
          id?: number
          third_party_payment_reference_id?: number | null
          third_party_payment_system?:
            | Database["public"]["Enums"]["payment_system"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_fund_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "gift_fund_contributions_gift_fund_id_fkey"
            columns: ["gift_fund_id"]
            isOneToOne: false
            referencedRelation: "gift_funds"
            referencedColumns: ["gift_fund_id"]
          },
        ]
      }
      gift_funds: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          current_amount: number | null
          description: string | null
          gift_fund_id: string
          gift_name: string | null
          target_amount: number | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          current_amount?: number | null
          description?: string | null
          gift_fund_id?: string
          gift_name?: string | null
          target_amount?: number | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          current_amount?: number | null
          description?: string | null
          gift_fund_id?: string
          gift_name?: string | null
          target_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_funds_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gift_transactions: {
        Row: {
          created_at: string
          gift_action: Database["public"]["Enums"]["gift_action"] | null
          gift_metadata: Json | null
          gift_type: Database["public"]["Enums"]["gift_type"] | null
          gift_url: string[] | null
          id: string
          scheduled_at: string | null
          sendee_information: Json | null
          sendee_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_action?: Database["public"]["Enums"]["gift_action"] | null
          gift_metadata?: Json | null
          gift_type?: Database["public"]["Enums"]["gift_type"] | null
          gift_url?: string[] | null
          id?: string
          scheduled_at?: string | null
          sendee_information?: Json | null
          sendee_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gift_action?: Database["public"]["Enums"]["gift_action"] | null
          gift_metadata?: Json | null
          gift_type?: Database["public"]["Enums"]["gift_type"] | null
          gift_url?: string[] | null
          id?: string
          scheduled_at?: string | null
          sendee_information?: Json | null
          sendee_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_transactions_sendee_user_id_fkey"
            columns: ["sendee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "gift_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  notification: {
    Tables: {
      notifications: {
        Row: {
          auth_id: string
          body: string
          created_at: string
          id: string
          notification_metadata: Json | null
          user_id: string | null
        }
        Insert: {
          auth_id: string
          body: string
          created_at?: string
          id?: string
          notification_metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          auth_id?: string
          body?: string
          created_at?: string
          id?: string
          notification_metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          has_notified: boolean | null
          id: string
          media_link: string | null
          message: string | null
          scheduled_at: string | null
          sendee_profile_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          has_notified?: boolean | null
          id?: string
          media_link?: string | null
          message?: string | null
          scheduled_at?: string | null
          sendee_profile_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          has_notified?: boolean | null
          id?: string
          media_link?: string | null
          message?: string | null
          scheduled_at?: string | null
          sendee_profile_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "scheduled_messages_sendee_profile_user_id_fkey"
            columns: ["sendee_profile_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          auth_id: string
          body: string
          created_at: string
          has_notiifed: boolean | null
          id: string
          notification_metadata: Json | null
          scheduled_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_id: string
          body: string
          created_at?: string
          has_notiifed?: boolean | null
          id?: string
          notification_metadata?: Json | null
          scheduled_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_id?: string
          body?: string
          created_at?: string
          has_notiifed?: boolean | null
          id?: string
          notification_metadata?: Json | null
          scheduled_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "scheduled_notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "scheduled_notifications_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_scheduled_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      countries: {
        Row: {
          code: number
          continent_name: string | null
          currency: Database["public"]["Enums"]["currency"] | null
          name: string | null
        }
        Insert: {
          code?: number
          continent_name?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          name?: string | null
        }
        Update: {
          code?: number
          continent_name?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          name?: string | null
        }
        Relationships: []
      }
      profile_address: {
        Row: {
          created_at: string
          profile_address: Json | null
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          profile_address?: Json | null
          user_profile_id: string
        }
        Update: {
          created_at?: string
          profile_address?: Json | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_address_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string | null
          birthday: string | null
          country_code: number | null
          created_at: string | null
          fcm_token: string | null
          fts: unknown | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          has_newsletter: boolean | null
          highlighted_preferences: Json | null
          notification_preferences: Json | null
          questions: Json | null
          stripe_customer_id: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          auth_id?: string | null
          birthday?: string | null
          country_code?: number | null
          created_at?: string | null
          fcm_token?: string | null
          fts?: unknown | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          has_newsletter?: boolean | null
          highlighted_preferences?: Json | null
          notification_preferences?: Json | null
          questions?: Json | null
          stripe_customer_id?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          auth_id?: string | null
          birthday?: string | null
          country_code?: number | null
          created_at?: string | null
          fcm_token?: string | null
          fts?: unknown | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          has_newsletter?: boolean | null
          highlighted_preferences?: Json | null
          notification_preferences?: Json | null
          questions?: Json | null
          stripe_customer_id?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "public_users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "public_users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "user_phones"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "public_users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      user_relationships: {
        Row: {
          created_at: string | null
          relationship_id: string
          relationships:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          relationship_id: string
          relationships?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          relationship_id?: string
          relationships?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_relationships_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_relationships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_phones: {
        Row: {
          auth_id: string | null
          phone: string | null
          user_email: string | null
        }
        Insert: {
          auth_id?: string | null
          phone?: string | null
          user_email?: string | null
        }
        Update: {
          auth_id?: string | null
          phone?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      search_profiles: {
        Args: {
          query_string: string
          last_seen_id?: string
          page_size?: number
        }
        Returns: string[]
      }
    }
    Enums: {
      currency: "USD" | "EUR" | "GBP"
      event_type:
        | "NO_OCCASION"
        | "BIRTHDAY"
        | "VALENTINES_DAY"
        | "CHRISTMAS"
        | "MOTHERS_DAY"
        | "FATHERS_DAY"
        | "WEDDING"
        | "JOB_CELEBRATION"
        | "GRADUATION"
        | "ANNIVERSARY"
        | "BABY_SHOWER"
        | "EASTER"
        | "NEW_YEAR"
      gender: "MALE" | "FEMALE" | "OTHER"
      gift_action: "ADD_TO_REGISTRY" | "LIKE" | "DISLIKE" | "SEND"
      gift_type: "GREETING_CARD" | "MONEY_TRANSFER" | "PHYSICAL" | "TEXT"
      payment_system: "STRIPE"
      relationship_type:
        | "FRIEND"
        | "MOTHER"
        | "FATHER"
        | "BROTHER"
        | "SISTER"
        | "SIBLING"
        | "FAMILY"
        | "BLOCKED"
      user_type: "NORMAL" | "CHILD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  registry: {
    Tables: {
      registries: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string | null
          registry_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          registry_id?: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string | null
          registry_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      registry_items: {
        Row: {
          currency: Database["public"]["Enums"]["currency"] | null
          item_id: string
          link: string | null
          price: number | null
          product_id: number | null
          product_name: string | null
          quantity_fulfilled: number | null
          quantity_requested: number | null
          registry_id: string | null
        }
        Insert: {
          currency?: Database["public"]["Enums"]["currency"] | null
          item_id?: string
          link?: string | null
          price?: number | null
          product_id?: number | null
          product_name?: string | null
          quantity_fulfilled?: number | null
          quantity_requested?: number | null
          registry_id?: string | null
        }
        Update: {
          currency?: Database["public"]["Enums"]["currency"] | null
          item_id?: string
          link?: string | null
          price?: number | null
          product_id?: number | null
          product_name?: string | null
          quantity_fulfilled?: number | null
          quantity_requested?: number | null
          registry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_items_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "registries"
            referencedColumns: ["registry_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
