export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type AccountStatus = "pending" | "approved" | "rejected" | "deactivated";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketCategory =
  | "Technical Issue"
  | "Account Issue"
  | "General Query"
  | "Other";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  phone?: string | null;
  department?: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  actor_id?: string | null;
  action: string;
  details?: Json;
  created_at: string;
};

// Joined types for UI presentation
export type SupportTicketWithUser = SupportTicket & {
  user?: Profile;
};

export type SupportMessageWithSender = SupportMessage & {
  sender?: Profile;
};

export type ActivityLogWithUsers = ActivityLog & {
  actor?: Profile | null;
  user?: Profile;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          account_status?: AccountStatus;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          account_status?: AccountStatus;
          phone?: string | null;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: {
          id?: string;
          ticket_number?: string;
          user_id: string;
          subject: string;
          category: TicketCategory;
          description: string;
          status?: TicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          user_id?: string;
          subject?: string;
          category?: TicketCategory;
          description?: string;
          status?: TicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      support_messages: {
        Row: SupportMessage;
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "support_tickets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: Notification;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          action?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
