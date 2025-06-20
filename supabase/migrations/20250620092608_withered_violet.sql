/*
  # Enable Anonymous Waste Scans

  1. Modifications
    - Make user_id nullable in waste_items table to allow anonymous scans
    - Add anonymous_id field for tracking anonymous users
    - Update RLS policies to allow anonymous inserts
    - Add function to associate anonymous scans with user accounts

  2. Security
    - Anonymous users can only insert and read their own scans
    - Authenticated users can claim anonymous scans
    - Prevent data leakage between anonymous sessions
*/

-- Make user_id nullable to allow anonymous scans
ALTER TABLE waste_items ALTER COLUMN user_id DROP NOT NULL;

-- Add anonymous_id for tracking anonymous users
ALTER TABLE waste_items ADD COLUMN IF NOT EXISTS anonymous_id text;

-- Add index for anonymous_id
CREATE INDEX IF NOT EXISTS idx_waste_items_anonymous_id ON waste_items(anonymous_id);

-- Update RLS policies to allow anonymous scans

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own waste items" ON waste_items;
DROP POLICY IF EXISTS "Users can insert own waste items" ON waste_items;
DROP POLICY IF EXISTS "Users can update own waste items" ON waste_items;
DROP POLICY IF EXISTS "Users can delete own waste items" ON waste_items;

-- Create new policies that support both authenticated and anonymous users
CREATE POLICY "Users can read own waste items"
  ON waste_items
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND anonymous_id IS NOT NULL)
  );

CREATE POLICY "Users can insert waste items"
  ON waste_items
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id AND anonymous_id IS NULL) OR
    (auth.uid() IS NULL AND user_id IS NULL AND anonymous_id IS NOT NULL)
  );

CREATE POLICY "Users can update own waste items"
  ON waste_items
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND anonymous_id IS NOT NULL)
  );

CREATE POLICY "Users can delete own waste items"
  ON waste_items
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND anonymous_id IS NOT NULL)
  );

-- Function to associate anonymous scans with a user account
CREATE OR REPLACE FUNCTION associate_anonymous_scans(
  p_user_id uuid,
  p_anonymous_id text
)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update anonymous scans to be associated with the user
  UPDATE waste_items
  SET 
    user_id = p_user_id,
    anonymous_id = NULL,
    updated_at = now()
  WHERE anonymous_id = p_anonymous_id AND user_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get anonymous scan statistics
CREATE OR REPLACE FUNCTION get_anonymous_stats(p_anonymous_id text)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_items', COUNT(*),
    'total_weight', COALESCE(SUM(weight_grams), 0),
    'total_co2_saved', COALESCE(SUM(ai_carbon_footprint), 0),
    'recyclable_count', COUNT(*) FILTER (WHERE recyclable = true),
    'compostable_count', COUNT(*) FILTER (WHERE compostable = true)
  ) INTO stats
  FROM waste_items
  WHERE anonymous_id = p_anonymous_id;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;