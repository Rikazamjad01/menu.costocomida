-- ============================================
-- 🔧 FIX: Columnas Faltantes en Base de Datos
-- ============================================
-- ERROR: column price_per_unit does not exist
-- SOLUCIÓN: Renombrar o agregar columnas faltantes

-- ============================================
-- PASO 1: Ver estructura actual de inventory_items
-- ============================================

-- Ejecuta esto PRIMERO para ver qué columnas existen:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- SOLUCIÓN A: Si la columna se llama "price"
-- ============================================

-- Renombrar "price" a "price_per_unit"
ALTER TABLE inventory_items 
RENAME COLUMN price TO price_per_unit;

-- Verificar
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items' AND column_name = 'price_per_unit';

-- ============================================
-- SOLUCIÓN B: Si la columna NO existe
-- ============================================

-- Agregar columna "price_per_unit"
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;

-- Si ya tenías datos en "price", copiarlos
UPDATE inventory_items 
SET price_per_unit = price 
WHERE price_per_unit IS NULL AND price IS NOT NULL;

-- ============================================
-- PASO 2: Agregar columna wastage_percentage si no existe
-- ============================================

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- ============================================
-- PASO 3: Ver estructura de dish_ingredients
-- ============================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dish_ingredients'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- PASO 4: Agregar columna waste_percentage si no existe
-- ============================================

ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver todas las columnas de inventory_items
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('inventory_items', 'dish_ingredients')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Debería mostrar:
-- inventory_items:
--   - id (uuid)
--   - user_id (uuid)
--   - name (text)
--   - price_per_unit (numeric)  ← IMPORTANTE
--   - unit (text)
--   - wastage_percentage (numeric)  ← IMPORTANTE
--   - category (text)
--   - emoji (text)
--   - created_at (timestamp)

-- dish_ingredients:
--   - id (uuid)
--   - user_id (uuid)
--   - dish_id (uuid)
--   - inventory_item_id (uuid)
--   - quantity (numeric)
--   - unit (text)
--   - waste_percentage (numeric)  ← IMPORTANTE
--   - created_at (timestamp)

-- ============================================
-- LIMPIAR DATOS SI HAY PROBLEMAS
-- ============================================

-- Si los datos están corruptos, eliminarlos y empezar fresco:
-- ⚠️ ADVERTENCIA: Esto elimina TODOS tus platos e ingredientes

-- DELETE FROM dish_ingredients WHERE user_id = auth.uid();
-- DELETE FROM dishes WHERE user_id = auth.uid();
-- DELETE FROM inventory_items WHERE user_id = auth.uid();
