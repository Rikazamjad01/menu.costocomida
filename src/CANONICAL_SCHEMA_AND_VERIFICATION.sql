-- ============================================
-- 🏗️ CANONICAL SCHEMA - CostoComida MVP
-- ============================================
-- This is the definitive, correct schema
-- Version: 1.0
-- Last Updated: November 6, 2024
-- ============================================

-- ============================================
-- PART 1: VERIFICATION QUERIES
-- Run these FIRST to see current state
-- ============================================

-- 1. Check which columns exist in inventory_items
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Expected columns:
-- - id (uuid)
-- - user_id (uuid)
-- - name (text)
-- - unit (text)
-- - price_per_unit (numeric)  ← MUST EXIST (not 'price')
-- - wastage_percentage (numeric)  ← MUST EXIST
-- - category (text)
-- - emoji (text)
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)


-- 2. Check which columns exist in dish_ingredients
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'dish_ingredients'
ORDER BY ordinal_position;

-- Expected columns:
-- - id (uuid)
-- - user_id (uuid)
-- - dish_id (uuid)
-- - inventory_item_id (uuid)
-- - quantity (numeric)
-- - unit (text)
-- - waste_percentage (numeric)  ← MUST EXIST
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)


-- 3. Check RLS policies count
SELECT 
  tablename,
  COUNT(*) as policy_count,
  array_agg(policyname ORDER BY cmd) as policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_settings',
    'menu_categories',
    'inventory_items',
    'dishes',
    'dish_ingredients'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)


-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_settings',
    'menu_categories',
    'inventory_items',
    'dishes',
    'dish_ingredients'
  )
ORDER BY tablename;

-- Expected: All tables should have rls_enabled = true


-- 5. List all tables with row counts
SELECT 
  schemaname,
  relname as tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN (
    'user_settings',
    'menu_categories',
    'inventory_items',
    'dishes',
    'dish_ingredients'
  )
ORDER BY relname;


-- ============================================
-- PART 2: FIXES (Run if verification shows issues)
-- ============================================

-- ==================== FIX 1: Add Missing Columns ====================

-- Add wastage_percentage to inventory_items if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'wastage_percentage'
  ) THEN
    ALTER TABLE inventory_items 
    ADD COLUMN wastage_percentage NUMERIC DEFAULT 0;
    RAISE NOTICE '✅ Added wastage_percentage to inventory_items';
  ELSE
    RAISE NOTICE '✓ wastage_percentage already exists in inventory_items';
  END IF;
END $$;


-- Add waste_percentage to dish_ingredients if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dish_ingredients' 
    AND column_name = 'waste_percentage'
  ) THEN
    ALTER TABLE dish_ingredients 
    ADD COLUMN waste_percentage NUMERIC DEFAULT 0;
    RAISE NOTICE '✅ Added waste_percentage to dish_ingredients';
  ELSE
    RAISE NOTICE '✓ waste_percentage already exists in dish_ingredients';
  END IF;
END $$;


-- ==================== FIX 2: Rename price to price_per_unit ====================

DO $$
BEGIN
  -- Check if 'price' column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'price'
  ) THEN
    
    -- Check if 'price_per_unit' already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      AND column_name = 'price_per_unit'
    ) THEN
      -- Rename price to price_per_unit
      ALTER TABLE inventory_items 
      RENAME COLUMN price TO price_per_unit;
      RAISE NOTICE '✅ Renamed price to price_per_unit';
    ELSE
      -- Both exist, migrate data then drop old column
      UPDATE inventory_items 
      SET price_per_unit = price 
      WHERE price_per_unit IS NULL;
      
      ALTER TABLE inventory_items DROP COLUMN price;
      RAISE NOTICE '✅ Migrated price to price_per_unit and dropped old column';
    END IF;
    
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'price_per_unit'
  ) THEN
    -- Neither exists, create price_per_unit
    ALTER TABLE inventory_items 
    ADD COLUMN price_per_unit NUMERIC NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Created price_per_unit column';
  ELSE
    RAISE NOTICE '✓ price_per_unit already exists';
  END IF;
END $$;


-- ==================== FIX 3: Clean Up RLS Policies ====================

-- Function to clean up and recreate policies for a table
CREATE OR REPLACE FUNCTION reset_table_policies(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pol record;
BEGIN
  -- Drop all existing policies
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = table_name
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, table_name);
  END LOOP;
  
  RAISE NOTICE '✅ Dropped all policies for %', table_name;
  
  -- Create standard policies
  EXECUTE format(
    'CREATE POLICY "Users can view own %s"
     ON %I FOR SELECT
     USING (auth.uid() = user_id)',
    table_name, table_name
  );
  
  EXECUTE format(
    'CREATE POLICY "Users can create own %s"
     ON %I FOR INSERT
     WITH CHECK (auth.uid() = user_id)',
    table_name, table_name
  );
  
  EXECUTE format(
    'CREATE POLICY "Users can update own %s"
     ON %I FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id)',
    table_name, table_name
  );
  
  EXECUTE format(
    'CREATE POLICY "Users can delete own %s"
     ON %I FOR DELETE
     USING (auth.uid() = user_id)',
    table_name, table_name
  );
  
  RAISE NOTICE '✅ Created 4 standard policies for %', table_name;
END;
$$;

-- Apply to all tables
SELECT reset_table_policies('user_settings');
SELECT reset_table_policies('menu_categories');
SELECT reset_table_policies('inventory_items');
SELECT reset_table_policies('dishes');
SELECT reset_table_policies('dish_ingredients');


-- ==================== FIX 4: Ensure RLS is Enabled ====================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;


-- ==================== FIX 5: Reload PostgREST Schema Cache ====================

-- CRITICAL: This tells PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

-- Alternative: If above doesn't work, you MUST:
-- 1. Go to Supabase Dashboard
-- 2. Settings → API
-- 3. Click "Restart Server"


-- ============================================
-- PART 3: CANONICAL TABLE DEFINITIONS
-- ============================================
-- This is what the schema SHOULD look like
-- These are CREATE statements for reference
-- DO NOT run if tables already exist
-- ============================================

/*
-- user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  currency TEXT DEFAULT 'MXN',
  country TEXT DEFAULT 'México',
  business_type TEXT DEFAULT 'Restaurante',
  tax_percentage NUMERIC DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- menu_categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- inventory_items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  wastage_percentage NUMERIC DEFAULT 0,
  category TEXT,
  emoji TEXT DEFAULT '🍴',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- dishes
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  price NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- dish_ingredients
CREATE TABLE IF NOT EXISTS dish_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  waste_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/


-- ============================================
-- PART 4: INDEXES FOR PERFORMANCE
-- ============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_user_id ON menu_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_dishes_user_id ON dishes(user_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_user_id ON dish_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_inventory_item_id ON dish_ingredients(inventory_item_id);

-- Performance index for case-insensitive name searches
CREATE INDEX IF NOT EXISTS idx_inventory_items_name_lower ON inventory_items(LOWER(name));


-- ============================================
-- PART 5: SEED DATA (Optional)
-- ============================================

-- Create default menu categories for new users
-- This should be run manually for each user_id

/*
-- Replace USER_ID_HERE with actual UUID
INSERT INTO menu_categories (name, emoji, user_id, is_hidden)
VALUES 
  ('Entradas', '🥗', 'USER_ID_HERE', false),
  ('Platos Fuertes', '🍽️', 'USER_ID_HERE', false),
  ('Bebidas', '🥤', 'USER_ID_HERE', false),
  ('Postres', '🍰', 'USER_ID_HERE', false)
ON CONFLICT DO NOTHING;
*/


-- ============================================
-- PART 6: FINAL VERIFICATION
-- ============================================

-- Run these queries to verify everything is correct

-- 1. Count policies per table (should be 4 each)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_settings',
    'menu_categories',
    'inventory_items',
    'dishes',
    'dish_ingredients'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected:
-- dish_ingredients | 4
-- dishes           | 4
-- inventory_items  | 4
-- menu_categories  | 4
-- user_settings    | 4


-- 2. Verify critical columns exist
SELECT 
  'inventory_items' as table_name,
  EXISTS(SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'inventory_items' AND column_name = 'price_per_unit') as has_price_per_unit,
  EXISTS(SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'inventory_items' AND column_name = 'wastage_percentage') as has_wastage_percentage,
  NOT EXISTS(SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'inventory_items' AND column_name = 'price') as no_old_price_column
UNION ALL
SELECT 
  'dish_ingredients' as table_name,
  true as has_price_per_unit,
  EXISTS(SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'dish_ingredients' AND column_name = 'waste_percentage') as has_wastage_percentage,
  true as no_old_price_column;

-- Expected:
-- inventory_items  | true | true | true
-- dish_ingredients | true | true | true


-- 3. Test basic queries (replace USER_ID with actual UUID)
-- SELECT * FROM inventory_items WHERE user_id = 'USER_ID' LIMIT 5;
-- SELECT * FROM dishes WHERE user_id = 'USER_ID' LIMIT 5;


-- ============================================
-- PART 7: TROUBLESHOOTING COMMANDS
-- ============================================

-- If you still get errors after running this script:

-- 1. Check PostgREST logs in Supabase Dashboard
--    Project Settings → Logs → PostgREST

-- 2. Verify schema cache was reloaded
--    Look for "schema cache loaded" in logs

-- 3. Try manual server restart
--    Settings → API → Restart Server

-- 4. Test with curl (outside app)
--    curl 'https://PROJECT.supabase.co/rest/v1/inventory_items?select=wastage_percentage&limit=1' \
--      -H 'apikey: ANON_KEY'

-- 5. Temporarily disable RLS for debugging
--    ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
--    -- Test queries
--    ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 6. Check for foreign key constraints blocking deletes
--    SELECT * FROM information_schema.table_constraints 
--    WHERE table_name IN ('inventory_items', 'dishes', 'dish_ingredients');


-- ============================================
-- END OF CANONICAL SCHEMA
-- ============================================

-- Summary of what this script does:
-- ✅ Verifies current schema state
-- ✅ Adds missing columns
-- ✅ Renames price → price_per_unit
-- ✅ Cleans up RLS policies (removes duplicates)
-- ✅ Ensures RLS is enabled
-- ✅ Reloads PostgREST schema cache
-- ✅ Creates performance indexes
-- ✅ Provides verification queries

-- After running this script:
-- 1. Go to Supabase Dashboard → Settings → API → Restart Server
-- 2. Wait 30 seconds
-- 3. Test the app
-- 4. Check browser console for errors
-- 5. Report results

-- Last Updated: November 6, 2024
-- Version: 1.0
-- Status: Production Ready
