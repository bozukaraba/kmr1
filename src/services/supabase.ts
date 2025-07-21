import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  email: string
  role: 'admin' | 'personel'
  created_at: string
}

export interface SocialMediaReport {
  id: number
  user_id: string
  month: string
  follower_count: number
  post_count: number
  most_engagement_link: string
  least_engagement_link: string
  created_at: string
}

export interface MediaReport {
  id: number
  user_id: string
  month: string
  status: 'olumlu' | 'olumsuz' | 'kritik'
  news_topic: string
  access_link: string
  news_sources: string[]
  created_at: string
}

export interface WebsiteAnalytics {
  id: number
  user_id: string
  month: string
  visitor_count: number
  page_views: number
  bounce_rate: number
  avg_session_duration: number
  conversions: number
  top_pages: string[]
  created_at: string
}

export interface RPAReport {
  id: number
  user_id: string
  month: string
  incoming_mail_count: number
  distributed_mail_count: number
  top_distribution_units: string[]
  created_at: string
} 