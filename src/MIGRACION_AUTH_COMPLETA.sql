-- =====================================================
-- 🔐 MIGRACIÓN COMPLETA A AUTENTICACIÓN REAL
-- =====================================================
-- Este script transforma la app de "sesión casera" a auth real
-- EJECUTAR EN SUPABASE SQL EDITOR EN ESTE ORDEN
-- =====================================================

-- =====================================================
-- PASO 1: AGREGAR COLUMNAS user_id A TODAS LAS TABLAS
-- =====================================================

-- 1.1 user_settings (conectar con auth.users)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1.2 menu_categories
ALTER TABLE menu_categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1.3 dishes
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1.4 dish_ingredients (hereda user_id del dish)
-- No necesita user_id directamente, pero podemos agregarlo para queries más eficientes
ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1.5 inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- PASO 2: CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_user_id ON menu_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_dishes_user_id ON dishes(user_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_user_id ON dish_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);

-- =====================================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: ELIMINAR POLÍTICAS ANTIGUAS (SI EXISTEN)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON menu_categories;

DROP POLICY IF EXISTS "Users can view own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can insert own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can update own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can delete own dishes" ON dishes;

DROP POLICY IF EXISTS "Users can view own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can insert own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can update own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can delete own dish ingredients" ON dish_ingredients;

DROP POLICY IF EXISTS "Users can view own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory_items;

-- =====================================================
-- PASO 5: CREAR POLÍTICAS RLS
-- =====================================================

-- 5.1 user_settings
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON user_settings FOR DELETE
USING (auth.uid() = user_id);

-- 5.2 menu_categories
CREATE POLICY "Users can view own categories"
ON menu_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
ON menu_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
ON menu_categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
ON menu_categories FOR DELETE
USING (auth.uid() = user_id);

-- 5.3 dishes
CREATE POLICY "Users can view own dishes"
ON dishes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dishes"
ON dishes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dishes"
ON dishes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dishes"
ON dishes FOR DELETE
USING (auth.uid() = user_id);

-- 5.4 dish_ingredients
CREATE POLICY "Users can view own dish ingredients"
ON dish_ingredients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dish ingredients"
ON dish_ingredients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dish ingredients"
ON dish_ingredients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dish ingredients"
ON dish_ingredients FOR DELETE
USING (auth.uid() = user_id);

-- 5.5 inventory_items
CREATE POLICY "Users can view own inventory"
ON inventory_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
ON inventory_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
ON inventory_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
ON inventory_items FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- PASO 6: FUNCIÓN TRIGGER PARA AUTO-LLENAR user_id
-- =====================================================

-- Esta función se ejecuta automáticamente al insertar
-- y llena el user_id si no se proporciona

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 7: CREAR TRIGGERS EN TODAS LAS TABLAS
-- =====================================================

DROP TRIGGER IF EXISTS set_user_id_trigger ON user_settings;
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON user_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON menu_categories;
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON dishes;
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON dishes
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON dish_ingredients;
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON dish_ingredients
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_trigger ON inventory_items;
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.set_user_id();

-- =====================================================
-- PASO 8: VERIFICACIÓN
-- =====================================================

-- Verifica que RLS esté habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_settings', 'menu_categories', 'dishes', 'dish_ingredients', 'inventory_items');

-- Verifica que las políticas existan
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verifica que las columnas user_id existan
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'user_id'
  AND table_name IN ('user_settings', 'menu_categories', 'dishes', 'dish_ingredients', 'inventory_items');

-- =====================================================
-- ✅ MIGRACIÓN COMPLETA
-- =====================================================

-- IMPORTANTE: 
-- Después de ejecutar este script, todos los datos existentes
-- tendrán user_id = NULL. Necesitarás:
--
-- 1. Asignar user_id a datos existentes manualmente, O
-- 2. Limpiar datos de prueba y empezar desde cero
--
-- Para limpiar todo y empezar desde cero:
-- DELETE FROM dish_ingredients;
-- DELETE FROM dishes;
-- DELETE FROM menu_categories;
-- DELETE FROM inventory_items;
-- DELETE FROM user_settings;
-- 
-- ¡Ahora tu app tiene autenticación real! 🎉
