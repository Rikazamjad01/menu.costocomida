-- ============================================
-- 🔒 FIX: Row Level Security (RLS) Policies
-- ============================================
-- Los errores 406 "Not Acceptable" indican problemas con RLS

-- ============================================
-- PASO 1: Verificar estado actual de RLS
-- ============================================

-- Ver qué tablas tienen RLS activado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('inventory_items', 'dishes', 'dish_ingredients', 'menu_categories', 'user_settings')
ORDER BY tablename;

-- Ver políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('inventory_items', 'dishes', 'dish_ingredients', 'menu_categories', 'user_settings')
ORDER BY tablename, policyname;

-- ============================================
-- PASO 2: Eliminar políticas existentes
-- ============================================

-- inventory_items
DROP POLICY IF EXISTS "Users can view own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can create own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON inventory_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON inventory_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON inventory_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON inventory_items;

-- dishes
DROP POLICY IF EXISTS "Users can view own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can create own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can update own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can delete own dishes" ON dishes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON dishes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dishes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON dishes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dishes;

-- dish_ingredients
DROP POLICY IF EXISTS "Users can view own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can create own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can update own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can delete own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON dish_ingredients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dish_ingredients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON dish_ingredients;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dish_ingredients;

-- menu_categories
DROP POLICY IF EXISTS "Users can view own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can create own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can update own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can delete own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON menu_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON menu_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON menu_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON menu_categories;

-- user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON user_settings;

-- ============================================
-- PASO 3: Habilitar RLS en todas las tablas
-- ============================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: Crear políticas SIMPLES y CORRECTAS
-- ============================================

-- ==================== inventory_items ====================

CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== dishes ====================

CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dishes"
  ON dishes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dishes"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== dish_ingredients ====================

CREATE POLICY "Users can view own dish ingredients"
  ON dish_ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dish ingredients"
  ON dish_ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dish ingredients"
  ON dish_ingredients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dish ingredients"
  ON dish_ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== menu_categories ====================

CREATE POLICY "Users can view own menu categories"
  ON menu_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own menu categories"
  ON menu_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menu categories"
  ON menu_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own menu categories"
  ON menu_categories FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== user_settings ====================

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASO 5: Verificar que todo está bien
-- ============================================

-- Ver políticas creadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('inventory_items', 'dishes', 'dish_ingredients', 'menu_categories', 'user_settings')
ORDER BY tablename, cmd, policyname;

-- Debería mostrar 4 políticas por tabla (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- PASO 6: Probar acceso con tu user_id
-- ============================================

-- Reemplaza 'TU_USER_ID_AQUI' con tu user_id real
-- Puedes obtenerlo de los logs o ejecutando:
-- SELECT auth.uid();

-- Probar SELECT
SELECT * FROM inventory_items WHERE user_id = auth.uid() LIMIT 1;

-- Probar INSERT
INSERT INTO inventory_items (name, unit, price_per_unit, wastage_percentage, user_id)
VALUES ('Test Ingrediente', 'kg', 5.00, 0, auth.uid())
RETURNING *;

-- Si funciona, eliminar el test
DELETE FROM inventory_items WHERE name = 'Test Ingrediente' AND user_id = auth.uid();

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Si sigues viendo error 406:

-- 1. Verificar que auth.uid() retorna tu ID
SELECT auth.uid() as my_user_id;

-- Si retorna NULL, no estás autenticado en la sesión SQL
-- Usa el user_id directamente en ese caso

-- 2. Verificar que tienes datos con tu user_id
SELECT 
  'inventory_items' as table_name,
  COUNT(*) as count,
  auth.uid() as my_user_id
FROM inventory_items
WHERE user_id = auth.uid()
UNION ALL
SELECT 
  'dishes',
  COUNT(*),
  auth.uid()
FROM dishes
WHERE user_id = auth.uid();

-- 3. Si no tienes datos, crear categorías prepopuladas
-- (Ejecutar solo si la tabla menu_categories está vacía)
DO $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NOT NULL THEN
    INSERT INTO menu_categories (name, emoji, user_id, is_hidden)
    VALUES 
      ('Entradas', '🥗', v_user_id, false),
      ('Platos Fuertes', '🍽️', v_user_id, false),
      ('Bebidas', '🥤', v_user_id, false),
      ('Postres', '🍰', v_user_id, false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- OPCIÓN NUCLEAR: Desactivar RLS temporalmente
-- ============================================

-- ⚠️ ADVERTENCIA: Esto hace que TODOS los datos sean públicos
-- Solo usar para debugging, NUNCA en producción

-- Para desactivar RLS (SOLO TEMPORALMENTE):
-- ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE dishes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE dish_ingredients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Para reactivar RLS:
-- ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN FINAL COMPLETA
-- ============================================

-- Ejecuta esto para ver un resumen completo:
SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN ('inventory_items', 'dishes', 'dish_ingredients', 'menu_categories', 'user_settings')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- Resultado esperado:
-- tablename          | rls_enabled | policy_count
-- ───────────────────────────────────────────────
-- dish_ingredients   | true        | 4
-- dishes             | true        | 4
-- inventory_items    | true        | 4
-- menu_categories    | true        | 4
-- user_settings      | true        | 4
