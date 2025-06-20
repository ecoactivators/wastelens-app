/*
  # Waste Lens Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `waste_items` - Individual waste scans with AI analysis
    - `user_goals` - User waste reduction goals
    - `user_stats` - Aggregated user statistics
    - `disposal_locations` - Saved disposal locations from map suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public read access where appropriate

  3. Features
    - Complete AI analysis storage including recommendations and map suggestions
    - User goal tracking and progress monitoring
    - Location-based disposal recommendations
    - Comprehensive analytics and statistics
*/

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  location_city text,
  location_region text,
  location_country text,
  onboarding_completed boolean DEFAULT false,
  guidelines_seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create waste_items table for scan data
CREATE TABLE IF NOT EXISTS waste_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic item information
  item_name text NOT NULL,
  description text,
  waste_type text NOT NULL,
  waste_category text NOT NULL,
  weight_grams integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  image_url text,
  
  -- AI Analysis data
  ai_material text,
  ai_environment_score integer CHECK (ai_environment_score >= 1 AND ai_environment_score <= 10),
  ai_confidence decimal(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  ai_carbon_footprint decimal(8,4) DEFAULT 0,
  ai_suggestions jsonb DEFAULT '[]'::jsonb,
  ai_map_suggestions jsonb DEFAULT '[]'::jsonb,
  
  -- Disposal properties
  recyclable boolean DEFAULT false,
  compostable boolean DEFAULT false,
  
  -- Location data
  scan_location_city text,
  scan_location_region text,
  scan_location_country text,
  scan_latitude decimal(10,8),
  scan_longitude decimal(11,8),
  
  -- Timestamps
  scanned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('reduce', 'recycle', 'compost')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_stats table for aggregated data
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Totals
  total_items_scanned integer DEFAULT 0,
  total_weight_grams integer DEFAULT 0,
  total_co2_saved decimal(8,4) DEFAULT 0,
  
  -- Current streak
  current_streak_days integer DEFAULT 0,
  longest_streak_days integer DEFAULT 0,
  last_scan_date date,
  
  -- Waste type breakdown
  food_waste_grams integer DEFAULT 0,
  plastic_waste_grams integer DEFAULT 0,
  paper_waste_grams integer DEFAULT 0,
  glass_waste_grams integer DEFAULT 0,
  metal_waste_grams integer DEFAULT 0,
  electronic_waste_grams integer DEFAULT 0,
  textile_waste_grams integer DEFAULT 0,
  organic_waste_grams integer DEFAULT 0,
  hazardous_waste_grams integer DEFAULT 0,
  other_waste_grams integer DEFAULT 0,
  
  -- Category breakdown
  recycling_grams integer DEFAULT 0,
  composting_grams integer DEFAULT 0,
  landfill_grams integer DEFAULT 0,
  other_category_grams integer DEFAULT 0,
  
  -- Weekly/Monthly totals
  current_week_grams integer DEFAULT 0,
  current_month_grams integer DEFAULT 0,
  week_start_date date,
  month_start_date date,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create disposal_locations table for saved locations
CREATE TABLE IF NOT EXISTS disposal_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  location_type text NOT NULL CHECK (location_type IN ('recycling_center', 'store', 'facility')),
  search_query text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  city text,
  region text,
  country text,
  times_used integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposal_locations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Waste items policies
CREATE POLICY "Users can read own waste items"
  ON waste_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waste items"
  ON waste_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waste items"
  ON waste_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own waste items"
  ON waste_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User goals policies
CREATE POLICY "Users can read own goals"
  ON user_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Disposal locations policies
CREATE POLICY "Users can read own disposal locations"
  ON disposal_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disposal locations"
  ON disposal_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disposal locations"
  ON disposal_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own disposal locations"
  ON disposal_locations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waste_items_user_id ON waste_items(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_items_scanned_at ON waste_items(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_items_waste_type ON waste_items(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_items_waste_category ON waste_items(waste_category);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_disposal_locations_user_id ON disposal_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_disposal_locations_type ON disposal_locations(location_type);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create function to update user stats when waste items are added
CREATE OR REPLACE FUNCTION update_user_stats_on_waste_item()
RETURNS TRIGGER AS $$
DECLARE
  current_date_val date := CURRENT_DATE;
  week_start date := date_trunc('week', current_date_val)::date;
  month_start date := date_trunc('month', current_date_val)::date;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update user stats
    INSERT INTO user_stats (
      user_id, 
      total_items_scanned, 
      total_weight_grams,
      total_co2_saved,
      last_scan_date,
      current_week_grams,
      current_month_grams,
      week_start_date,
      month_start_date
    )
    VALUES (
      NEW.user_id,
      1,
      NEW.weight_grams,
      COALESCE(NEW.ai_carbon_footprint, 0),
      current_date_val,
      NEW.weight_grams,
      NEW.weight_grams,
      week_start,
      month_start
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_items_scanned = user_stats.total_items_scanned + 1,
      total_weight_grams = user_stats.total_weight_grams + NEW.weight_grams,
      total_co2_saved = user_stats.total_co2_saved + COALESCE(NEW.ai_carbon_footprint, 0),
      last_scan_date = current_date_val,
      current_week_grams = CASE 
        WHEN user_stats.week_start_date = week_start THEN user_stats.current_week_grams + NEW.weight_grams
        ELSE NEW.weight_grams
      END,
      current_month_grams = CASE 
        WHEN user_stats.month_start_date = month_start THEN user_stats.current_month_grams + NEW.weight_grams
        ELSE NEW.weight_grams
      END,
      week_start_date = week_start,
      month_start_date = month_start,
      updated_at = now();
      
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user stats
DROP TRIGGER IF EXISTS update_stats_trigger ON waste_items;
CREATE TRIGGER update_stats_trigger
  AFTER INSERT ON waste_items
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_waste_item();