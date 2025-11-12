-- =====================================================
-- 🏗️ AGREGAR PREPARACIÓN Y ALÉRGENOS A DISHES
-- =====================================================
-- Este script agrega las columnas preparation y allergens a dishes
-- Ejecuta este script en el SQL Editor de Supabase
-- =====================================================

-- 1️⃣ Agregar columna preparation (preparación del plato)
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS preparation TEXT;

COMMENT ON COLUMN dishes.preparation IS 'Instrucciones de preparación del plato';


-- 2️⃣ Agregar columna allergens (alérgenos)
-- Usamos JSONB para almacenar un array de alérgenos
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN dishes.allergens IS 'Array de alérgenos (JSON): ["gluten", "pescado", "lacteos", etc.]';


-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver las nuevas columnas
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dishes'
  AND column_name IN ('preparation', 'allergens')
ORDER BY ordinal_position;


-- Ver ejemplo de datos
SELECT 
  id,
  name,
  preparation,
  allergens,
  created_at
FROM dishes
LIMIT 5;


-- =====================================================
-- ✅ LISTO
-- =====================================================

-- Ahora puedes:
-- 1. Agregar preparación del plato en el detalle
-- 2. Marcar alérgenos con badges clickeables
-- 3. Los datos se guardan automáticamente en la base de datos

-- =====================================================
-- 📋 EJEMPLO DE USO
-- =====================================================

-- Actualizar un plato con preparación y alérgenos:
/*
UPDATE dishes 
SET 
  preparation = 'Mezclar todos los ingredientes y hornear a 180°C por 20 minutos',
  allergens = '["gluten", "lacteos", "huevo"]'::jsonb
WHERE id = 'tu-dish-id-aqui';
*/
