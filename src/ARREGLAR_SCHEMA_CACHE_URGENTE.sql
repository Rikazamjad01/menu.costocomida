-- ============================================
-- 🚨 ARREGLAR SCHEMA CACHE URGENTE
-- ============================================
-- Error: PGRST204 - Column not found in schema cache

-- ============================================
-- PASO 1: Verificar que las columnas existen
-- ============================================

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('inventory_items', 'dish_ingredients')
  AND column_name LIKE '%waste%'
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Deberías ver:
-- inventory_items   | wastage_percentage | numeric | YES | 0
-- dish_ingredients  | waste_percentage   | numeric | YES | 0

-- ============================================
-- PASO 2: Si NO existen, crearlas
-- ============================================

-- Agregar wastage_percentage a inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- Agregar waste_percentage a dish_ingredients
ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- ============================================
-- PASO 3: RECARGAR SCHEMA CACHE (CRÍTICO)
-- ============================================

-- Método 1: NOTIFY
NOTIFY pgrst, 'reload schema';

-- Esperar 2 segundos...

-- ============================================
-- PASO 4: Verificar que PostgREST ve las columnas
-- ============================================

-- Si tienes acceso a la API REST de Supabase, ejecuta esto en tu navegador:
-- GET https://[TU-PROJECT-ID].supabase.co/rest/v1/?apikey=[TU-ANON-KEY]
-- Debería retornar el schema completo

-- ============================================
-- PASO 5: Si el NOTIFY no funciona
-- ============================================

-- Ve a Supabase Dashboard:
-- 1. Settings → API → PostgREST
-- 2. Click "Restart PostgREST"
-- 3. Espera 30 segundos

-- ============================================
-- PASO 6: Verificación final
-- ============================================

-- Ver todas las columnas de inventory_items
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Deberías ver:
-- id
-- user_id
-- name
-- unit
-- price_per_unit
-- wastage_percentage  ← DEBE ESTAR AQUÍ
-- category
-- emoji
-- created_at

-- ============================================
-- OPCIÓN ALTERNATIVA: Recrear la tabla
-- ============================================

-- ⚠️ Solo si todo lo demás falla
-- Esto eliminará TODOS los datos de inventory_items

-- Hacer backup primero
CREATE TABLE inventory_items_backup AS 
SELECT * FROM inventory_items;

-- Eliminar tabla vieja
DROP TABLE inventory_items CASCADE;

-- Recrear tabla con todas las columnas
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  wastage_percentage NUMERIC DEFAULT 0,
  category TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Restaurar datos
INSERT INTO inventory_items 
SELECT * FROM inventory_items_backup;

-- Recargar schema
NOTIFY pgrst, 'reload schema';

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Si el error persiste después de todo:

-- 1. Ver versión de PostgREST
SELECT current_setting('server_version');

-- 2. Ver si hay locks en la tabla
SELECT * FROM pg_locks WHERE relation = 'inventory_items'::regclass;

-- 3. Ver si hay transacciones pendientes
SELECT * FROM pg_stat_activity 
WHERE datname = current_database() 
  AND state = 'active';

-- 4. Forzar VACUUM
VACUUM FULL inventory_items;
ANALYZE inventory_items;

-- 5. Recargar schema nuevamente
NOTIFY pgrst, 'reload schema';
