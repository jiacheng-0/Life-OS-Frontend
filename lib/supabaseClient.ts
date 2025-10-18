import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          goals: any
          preferences: any
          routines: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goals?: any
          preferences?: any
          routines?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goals?: any
          preferences?: any
          routines?: any
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          messages: any
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          messages: any
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: any
          timestamp?: string
        }
      }
    }
  }
}
