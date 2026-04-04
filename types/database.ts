export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          account_type: "individual" | "family" | "business";
          business_name: string | null;
          currency: string;
          monthly_income: number | null;
          onboarding_completed: boolean;
          is_admin: boolean;
          push_subscription: Json | null;
          date_of_birth: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          account_type?: "individual" | "family" | "business";
          business_name?: string | null;
          currency?: string;
          monthly_income?: number | null;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          push_subscription?: Json | null;
          date_of_birth?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          account_type?: "individual" | "family" | "business";
          business_name?: string | null;
          currency?: string;
          monthly_income?: number | null;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          push_subscription?: Json | null;
          date_of_birth?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          description: string;
          date: string;
          note: string | null;
          tags: string[] | null;
          receipt_url: string | null;
          is_recurring: boolean;
          recurring_interval: "daily" | "weekly" | "monthly" | "yearly" | null;
          budget_id: string | null;
          context: "personal" | "family" | "business";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          description: string;
          date: string;
          note?: string | null;
          tags?: string[] | null;
          receipt_url?: string | null;
          is_recurring?: boolean;
          recurring_interval?: "daily" | "weekly" | "monthly" | "yearly" | null;
          budget_id?: string | null;
          context?: "personal" | "family" | "business";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: "income" | "expense";
          amount?: number;
          category?: string;
          description?: string;
          date?: string;
          note?: string | null;
          tags?: string[] | null;
          receipt_url?: string | null;
          is_recurring?: boolean;
          recurring_interval?: "daily" | "weekly" | "monthly" | "yearly" | null;
          budget_id?: string | null;
          context?: "personal" | "family" | "business";
          updated_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          amount: number;
          spent: number;
          period: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string;
          color: string | null;
          alert_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          amount: number;
          spent?: number;
          period?: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string;
          color?: string | null;
          alert_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          amount?: number;
          spent?: number;
          period?: "weekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string;
          color?: string | null;
          alert_threshold?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          target_date: string;
          category: string;
          icon: string | null;
          color: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          target_date: string;
          category?: string;
          icon?: string | null;
          color?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          target_date?: string;
          category?: string;
          icon?: string | null;
          color?: string | null;
          is_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: "budget_alert" | "goal_milestone" | "system" | "insight";
          is_read: boolean;
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type?: "budget_alert" | "goal_milestone" | "system" | "insight";
          is_read?: boolean;
          data?: Json | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro" | "business";
          status: "active" | "cancelled" | "expired" | "trial";
          flw_tx_ref: string | null;
          amount: number;
          next_billing_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro" | "business";
          status?: "active" | "cancelled" | "expired" | "trial";
          flw_tx_ref?: string | null;
          amount?: number;
          next_billing_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: "free" | "pro" | "business";
          status?: "active" | "cancelled" | "expired" | "trial";
          flw_tx_ref?: string | null;
          amount?: number;
          next_billing_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      family_groups: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          invite_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: "admin" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: "admin" | "member";
          joined_at?: string;
        };
        Update: {
          role?: "admin" | "member";
        };
        Relationships: [];
      };
      family_invites: {
        Row: {
          id: string;
          family_id: string;
          email: string | null;
          invite_code: string;
          expires_at: string;
          accepted: boolean;
          accepted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          email?: string | null;
          invite_code: string;
          expires_at: string;
          accepted?: boolean;
          accepted_by?: string | null;
          created_at?: string;
        };
        Update: {
          accepted?: boolean;
          accepted_by?: string | null;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity: number;
          cost_price: number;
          selling_price: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity?: number;
          cost_price?: number;
          selling_price?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          quantity?: number;
          cost_price?: number;
          selling_price?: number;
          low_stock_threshold?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ─── Derived convenience types ────────────────────────────────────────────────

export type Profile       = Database["public"]["Tables"]["profiles"]["Row"];
export type Transaction   = Database["public"]["Tables"]["transactions"]["Row"];
export type Budget        = Database["public"]["Tables"]["budgets"]["Row"];
export type Goal          = Database["public"]["Tables"]["goals"]["Row"];
export type Notification  = Database["public"]["Tables"]["notifications"]["Row"];
export type Subscription  = Database["public"]["Tables"]["subscriptions"]["Row"];

export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type BudgetInsert      = Database["public"]["Tables"]["budgets"]["Insert"];
export type GoalInsert        = Database["public"]["Tables"]["goals"]["Insert"];

export type FamilyGroup       = Database["public"]["Tables"]["family_groups"]["Row"];
export type FamilyMember      = Database["public"]["Tables"]["family_members"]["Row"];
export type FamilyInvite      = Database["public"]["Tables"]["family_invites"]["Row"];
export type InventoryItem     = Database["public"]["Tables"]["inventory_items"]["Row"];

export type FamilyGroupInsert   = Database["public"]["Tables"]["family_groups"]["Insert"];
export type FamilyMemberInsert  = Database["public"]["Tables"]["family_members"]["Insert"];
export type FamilyInviteInsert  = Database["public"]["Tables"]["family_invites"]["Insert"];
export type InventoryItemInsert = Database["public"]["Tables"]["inventory_items"]["Insert"];
