/*
  # Reporting Tables Setup

  1. New Tables
    - `social_media_reports` - Social media monthly reports
    - `media_reports` - Press news reports  
    - `website_analytics` - Website analytics data
    - `rpa_reports` - RPA automation reports

  2. Security
    - Enable RLS on all tables
    - Personnel can only see their own data
    - Admin can see all data
*/

-- Social Media Reports
CREATE TABLE IF NOT EXISTS social_media_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  follower_count integer NOT NULL DEFAULT 0,
  post_count integer NOT NULL DEFAULT 0,
  highest_engagement_link text DEFAULT '',
  lowest_engagement_link text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media Reports
CREATE TABLE IF NOT EXISTS media_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  status text NOT NULL CHECK (status IN ('olumlu', 'olumsuz', 'kritik')),
  news_subject text NOT NULL,
  access_link text DEFAULT '',
  news_sources text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Website Analytics
CREATE TABLE IF NOT EXISTS website_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  visitor_count integer NOT NULL DEFAULT 0,
  page_views integer NOT NULL DEFAULT 0,
  bounce_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  avg_session_duration numeric(10,2) NOT NULL DEFAULT 0.00,
  conversion_count integer NOT NULL DEFAULT 0,
  popular_pages text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RPA Reports
CREATE TABLE IF NOT EXISTS rpa_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  incoming_mail_count integer NOT NULL DEFAULT 0,
  distributed_mail_count integer NOT NULL DEFAULT 0,
  top_departments text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE social_media_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Social Media Reports
CREATE POLICY "Users can read own social media reports"
  ON social_media_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own social media reports"
  ON social_media_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own social media reports"
  ON social_media_reports FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all social media reports"
  ON social_media_reports FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for Media Reports
CREATE POLICY "Users can read own media reports"
  ON media_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own media reports"
  ON media_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own media reports"
  ON media_reports FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all media reports"
  ON media_reports FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for Website Analytics
CREATE POLICY "Users can read own website analytics"
  ON website_analytics FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own website analytics"
  ON website_analytics FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own website analytics"
  ON website_analytics FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all website analytics"
  ON website_analytics FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for RPA Reports
CREATE POLICY "Users can read own rpa reports"
  ON rpa_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own rpa reports"
  ON rpa_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rpa reports"
  ON rpa_reports FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all rpa reports"
  ON rpa_reports FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );