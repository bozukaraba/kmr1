import { createClient } from '@supabase/supabase-js'

// Get environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that we have proper Supabase credentials
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
  console.warn('Supabase credentials not configured. Please connect to Supabase to use the application.')
}

// Use dummy values that won't cause URL constructor to fail if credentials aren't set
const validUrl = (supabaseUrl && supabaseUrl !== 'your-project-url') ? supabaseUrl : 'https://placeholder.supabase.co'
const validKey = (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') ? supabaseAnonKey : 'placeholder-key'

export const supabase = createClient(validUrl, validKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'personel'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'personel'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'personel'
          created_at?: string
          updated_at?: string
        }
      }
      social_media_reports: {
        Row: {
          id: string
          user_id: string
          month_year: string
          follower_count: number
          post_count: number
          highest_engagement_link: string
          lowest_engagement_link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          month_year: string
          follower_count: number
          post_count: number
          highest_engagement_link?: string
          lowest_engagement_link?: string
        }
        Update: {
          month_year?: string
          follower_count?: number
          post_count?: number
          highest_engagement_link?: string
          lowest_engagement_link?: string
        }
      }
      media_reports: {
        Row: {
          id: string
          user_id: string
          month_year: string
          status: 'olumlu' | 'olumsuz' | 'kritik'
          news_subject: string
          access_link: string
          news_sources: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          month_year: string
          status: 'olumlu' | 'olumsuz' | 'kritik'
          news_subject: string
          access_link?: string
          news_sources?: string[]
        }
        Update: {
          month_year?: string
          status?: 'olumlu' | 'olumsuz' | 'kritik'
          news_subject?: string
          access_link?: string
          news_sources?: string[]
        }
      }
      website_analytics: {
        Row: {
          id: string
          user_id: string
          month_year: string
          visitor_count: number
          page_views: number
          bounce_rate: number
          avg_session_duration: number
          conversion_count: number
          popular_pages: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          month_year: string
          visitor_count: number
          page_views: number
          bounce_rate: number
          avg_session_duration: number
          conversion_count: number
          popular_pages?: string[]
        }
        Update: {
          month_year?: string
          visitor_count?: number
          page_views?: number
          bounce_rate?: number
          avg_session_duration?: number
          conversion_count?: number
          popular_pages?: string[]
        }
      }
      rpa_reports: {
        Row: {
          id: string
          user_id: string
          month_year: string
          incoming_mail_count: number
          distributed_mail_count: number
          top_departments: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          month_year: string
          incoming_mail_count: number
          distributed_mail_count: number
          top_departments?: string[]
        }
        Update: {
          month_year?: string
          incoming_mail_count?: number
          distributed_mail_count?: number
          top_departments?: string[]
        }
      }
    }
  }
}