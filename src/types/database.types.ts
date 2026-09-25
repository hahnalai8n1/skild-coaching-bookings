// Hand-written to match supabase/migrations/0001_init.sql, in the same
// shape `supabase gen types typescript --project-id <ref>` would produce.
// In a longer-lived project this would be generated from the live schema
// instead, so it can never drift from the actual tables.

export type SessionStatus = "scheduled" | "cancelled";

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
        };
        Update: {
          full_name?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          coach_id: string;
          title: string;
          session_date: string; // YYYY-MM-DD
          start_time: string; // HH:MM:SS
          end_time: string; // HH:MM:SS
          location: string | null;
          notes: string | null;
          status: SessionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          coach_id: string;
          title: string;
          session_date: string;
          start_time: string;
          end_time: string;
          location?: string | null;
          notes?: string | null;
          status?: SessionStatus;
        };
        Update: {
          title?: string;
          session_date?: string;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          notes?: string | null;
          status?: SessionStatus;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_coach_id_fkey";
            columns: ["coach_id"];
            referencedRelation: "coaches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Coach = Database["public"]["Tables"]["coaches"]["Row"];
export type CoachingSession = Database["public"]["Tables"]["sessions"]["Row"];
