-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'personel')) DEFAULT 'personel',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media_reports table
CREATE TABLE social_media_reports (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  follower_count INTEGER NOT NULL,
  post_count INTEGER NOT NULL,
  most_engagement_link TEXT NOT NULL,
  least_engagement_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_reports table
CREATE TABLE media_reports (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  status TEXT CHECK (status IN ('olumlu', 'olumsuz', 'kritik')) NOT NULL,
  news_topic TEXT NOT NULL,
  access_link TEXT NOT NULL,
  news_sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create website_analytics table
CREATE TABLE website_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  visitor_count INTEGER NOT NULL,
  page_views INTEGER NOT NULL,
  bounce_rate DECIMAL(5,2) NOT NULL,
  avg_session_duration DECIMAL(10,2) NOT NULL,
  conversions INTEGER NOT NULL,
  top_pages TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rpa_reports table
CREATE TABLE rpa_reports (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  incoming_mail_count INTEGER NOT NULL,
  distributed_mail_count INTEGER NOT NULL,
  top_distribution_units TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for social_media_reports
CREATE POLICY "Users can view their own social media reports" ON social_media_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social media reports" ON social_media_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social media reports" ON social_media_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all social media reports" ON social_media_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for media_reports
CREATE POLICY "Users can view their own media reports" ON media_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media reports" ON media_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media reports" ON media_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all media reports" ON media_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for website_analytics
CREATE POLICY "Users can view their own website analytics" ON website_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own website analytics" ON website_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own website analytics" ON website_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all website analytics" ON website_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for rpa_reports
CREATE POLICY "Users can view their own RPA reports" ON rpa_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own RPA reports" ON rpa_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPA reports" ON rpa_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all RPA reports" ON rpa_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'personel');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_social_media_reports_user_id ON social_media_reports(user_id);
CREATE INDEX idx_social_media_reports_month ON social_media_reports(month);
CREATE INDEX idx_media_reports_user_id ON media_reports(user_id);
CREATE INDEX idx_media_reports_month ON media_reports(month);
CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_month ON website_analytics(month);
CREATE INDEX idx_rpa_reports_user_id ON rpa_reports(user_id);
CREATE INDEX idx_rpa_reports_month ON rpa_reports(month); 