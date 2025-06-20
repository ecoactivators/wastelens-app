-- Create rewards and points tables for the gamification system

-- User points tracking
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned integer DEFAULT 0,
  current_balance integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  lifetime_rank text DEFAULT 'Eco Beginner',
  weekly_earned integer DEFAULT 0,
  monthly_earned integer DEFAULT 0,
  week_start_date date,
  month_start_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id text NOT NULL, -- Generated quest ID like 'daily-scan-2025-01-20'
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'monthly', 'milestone')),
  category text NOT NULL CHECK (category IN ('scanning', 'environmental', 'streak', 'special')),
  target_value integer NOT NULL,
  current_progress integer DEFAULT 0,
  points_reward integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  expires_at timestamptz,
  icon text,
  color text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

-- Available rewards catalog
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  points_cost integer NOT NULL,
  category text NOT NULL CHECK (category IN ('eco', 'discount', 'experience', 'premium')),
  image_url text,
  available boolean DEFAULT true,
  in_stock integer DEFAULT 0,
  estimated_delivery text,
  features jsonb DEFAULT '[]'::jsonb,
  value_description text, -- e.g., "$25 value"
  popularity integer DEFAULT 3 CHECK (popularity >= 1 AND popularity <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User reward redemptions
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id text REFERENCES rewards_catalog(id),
  points_spent integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number text,
  shipping_address jsonb NOT NULL,
  estimated_delivery_date date,
  redeemed_at timestamptz DEFAULT now(),
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Points transactions log
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'refund')),
  points_amount integer NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('scan', 'quest', 'streak', 'reward_redemption', 'manual')),
  source_id text, -- ID of the scan, quest, etc.
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- User points policies
CREATE POLICY "Users can read own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON user_points
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
  ON user_points
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User quests policies
CREATE POLICY "Users can read own quests"
  ON user_quests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests"
  ON user_quests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON user_quests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Rewards catalog policies (read-only for users)
CREATE POLICY "Anyone can read rewards catalog"
  ON rewards_catalog
  FOR SELECT
  TO authenticated
  USING (true);

-- User rewards policies
CREATE POLICY "Users can read own rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards"
  ON user_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON user_rewards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Points transactions policies
CREATE POLICY "Users can read own transactions"
  ON points_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON points_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_completed ON user_quests(completed, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type, created_at DESC);

-- Insert sample rewards into catalog
INSERT INTO rewards_catalog (id, title, description, points_cost, category, image_url, in_stock, estimated_delivery, features, value_description, popularity) VALUES
('eco-water-bottle', 'Eco Water Bottle', 'Premium stainless steel water bottle made from recycled materials', 500, 'eco', 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg', 25, '5-7 business days', '["500ml capacity", "Made from recycled stainless steel", "Keeps drinks cold for 24 hours", "BPA-free and leak-proof", "Dishwasher safe"]', '$35 value', 5),
('reusable-mesh-bags', 'Reusable Mesh Bags Set', 'Set of 3 organic cotton mesh bags for plastic-free shopping', 300, 'eco', 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg', 50, '3-5 business days', '["Set of 3 different sizes", "100% organic cotton", "Machine washable", "Drawstring closure", "Perfect for fruits and vegetables"]', '$25 value', 4),
('bamboo-utensil-set', 'Bamboo Utensil Set', 'Portable bamboo utensil set with carrying case', 400, 'eco', 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg', 30, '5-7 business days', '["Fork, knife, spoon, and chopsticks", "Sustainable bamboo construction", "Compact carrying case", "Perfect for travel and work", "Easy to clean"]', '$30 value', 4),
('organic-coffee-beans', 'Organic Coffee Beans', 'Fair-trade organic coffee beans from sustainable farms', 600, 'premium', 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg', 20, '3-5 business days', '["1lb bag of premium beans", "Fair-trade certified", "Organic and sustainably grown", "Medium roast profile", "Freshly roasted to order"]', '$40 value', 5),
('eco-notebook', 'Recycled Paper Notebook', 'Beautiful notebook made from 100% recycled paper', 250, 'eco', 'https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg', 40, '3-5 business days', '["100% recycled paper", "Hardcover with elastic band", "200 lined pages", "Bookmark ribbon", "Eco-friendly packaging"]', '$20 value', 3),
('plant-starter-kit', 'Indoor Plant Starter Kit', 'Everything you need to start your indoor garden', 800, 'experience', 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg', 15, '7-10 business days', '["3 easy-care plant varieties", "Biodegradable pots", "Organic potting soil", "Care instruction guide", "Perfect for beginners"]', '$50 value', 4),
('solar-phone-charger', 'Solar Phone Charger', 'Portable solar charger for sustainable power on the go', 1200, 'premium', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', 10, '7-10 business days', '["10,000mAh battery capacity", "Solar panel charging", "Dual USB ports", "Waterproof design", "LED flashlight included"]', '$75 value', 5),
('compost-bin', 'Kitchen Compost Bin', 'Stylish countertop compost bin with charcoal filter', 700, 'eco', 'https://images.pexels.com/photos/4099355/pexels-photo-4099355.jpeg', 20, '5-7 business days', '["1.3 gallon capacity", "Charcoal filter eliminates odors", "Stainless steel construction", "Dishwasher safe", "Includes extra filters"]', '$45 value', 4)
ON CONFLICT (id) DO NOTHING;

-- Function to update user points when waste items are added
CREATE OR REPLACE FUNCTION update_user_points_on_waste_item()
RETURNS TRIGGER AS $$
DECLARE
  points_earned integer := 0;
  current_date_val date := CURRENT_DATE;
  week_start date := date_trunc('week', current_date_val)::date;
  month_start date := date_trunc('month', current_date_val)::date;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Calculate points based on weight (1 point per 10g)
    points_earned := GREATEST(FLOOR(NEW.weight_grams / 10), 3);
    
    -- Bonus points for recyclable items
    IF NEW.recyclable THEN
      points_earned := points_earned + 5;
    END IF;
    
    -- Bonus points for compostable items
    IF NEW.compostable THEN
      points_earned := points_earned + 8;
    END IF;
    
    -- Bonus points for special waste types
    CASE NEW.waste_type
      WHEN 'electronic' THEN points_earned := points_earned + 15;
      WHEN 'batteries' THEN points_earned := points_earned + 12;
      WHEN 'hazardous' THEN points_earned := points_earned + 20;
      WHEN 'textile' THEN points_earned := points_earned + 8;
      WHEN 'plastic_film' THEN points_earned := points_earned + 6;
      ELSE points_earned := points_earned + 2;
    END CASE;
    
    -- Environmental score multiplier
    IF NEW.ai_environment_score IS NOT NULL THEN
      points_earned := FLOOR(points_earned * (1 + (NEW.ai_environment_score::float / 10) * 0.5));
    END IF;
    
    -- Update or insert user points
    INSERT INTO user_points (
      user_id, 
      total_earned, 
      current_balance,
      weekly_earned,
      monthly_earned,
      week_start_date,
      month_start_date
    )
    VALUES (
      NEW.user_id,
      points_earned,
      points_earned,
      points_earned,
      points_earned,
      week_start,
      month_start
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_earned = user_points.total_earned + points_earned,
      current_balance = user_points.current_balance + points_earned,
      weekly_earned = CASE 
        WHEN user_points.week_start_date = week_start THEN user_points.weekly_earned + points_earned
        ELSE points_earned
      END,
      monthly_earned = CASE 
        WHEN user_points.month_start_date = month_start THEN user_points.monthly_earned + points_earned
        ELSE points_earned
      END,
      week_start_date = week_start,
      month_start_date = month_start,
      updated_at = now();
    
    -- Log the points transaction
    INSERT INTO points_transactions (
      user_id,
      transaction_type,
      points_amount,
      source_type,
      source_id,
      description,
      metadata
    ) VALUES (
      NEW.user_id,
      'earned',
      points_earned,
      'scan',
      NEW.id::text,
      'Points earned from scanning ' || NEW.item_name,
      jsonb_build_object(
        'waste_type', NEW.waste_type,
        'weight_grams', NEW.weight_grams,
        'recyclable', NEW.recyclable,
        'compostable', NEW.compostable
      )
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user points (replace existing trigger)
DROP TRIGGER IF EXISTS update_points_trigger ON waste_items;
CREATE TRIGGER update_points_trigger
  AFTER INSERT ON waste_items
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points_on_waste_item();

-- Function to handle reward redemption
CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id uuid,
  p_reward_id text,
  p_shipping_address jsonb
)
RETURNS jsonb AS $$
DECLARE
  reward_cost integer;
  user_balance integer;
  tracking_number text;
  redemption_id uuid;
BEGIN
  -- Get reward cost
  SELECT points_cost INTO reward_cost
  FROM rewards_catalog
  WHERE id = p_reward_id AND available = true;
  
  IF reward_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or unavailable');
  END IF;
  
  -- Get user's current balance
  SELECT current_balance INTO user_balance
  FROM user_points
  WHERE user_id = p_user_id;
  
  IF user_balance IS NULL OR user_balance < reward_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Generate tracking number
  tracking_number := 'WL' || EXTRACT(EPOCH FROM now())::bigint || UPPER(substring(md5(random()::text) from 1 for 4));
  
  -- Create redemption record
  INSERT INTO user_rewards (
    user_id,
    reward_id,
    points_spent,
    shipping_address,
    tracking_number,
    estimated_delivery_date
  ) VALUES (
    p_user_id,
    p_reward_id,
    reward_cost,
    p_shipping_address,
    tracking_number,
    CURRENT_DATE + INTERVAL '7 days'
  ) RETURNING id INTO redemption_id;
  
  -- Deduct points from user balance
  UPDATE user_points
  SET 
    current_balance = current_balance - reward_cost,
    total_spent = total_spent + reward_cost,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the points transaction
  INSERT INTO points_transactions (
    user_id,
    transaction_type,
    points_amount,
    source_type,
    source_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'spent',
    reward_cost,
    'reward_redemption',
    redemption_id::text,
    'Points spent on reward redemption',
    jsonb_build_object('reward_id', p_reward_id, 'tracking_number', tracking_number)
  );
  
  -- Decrease stock
  UPDATE rewards_catalog
  SET in_stock = GREATEST(in_stock - 1, 0)
  WHERE id = p_reward_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'redemption_id', redemption_id,
    'tracking_number', tracking_number,
    'points_spent', reward_cost,
    'remaining_balance', user_balance - reward_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;