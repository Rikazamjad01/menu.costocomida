-- ============================================
-- 🔧 ARREGLAR COLUMNAS FALTANTES
-- ============================================
-- EJECUTA ESTO EN SUPABASE SQL EDITOR

-- 1. Agregar wastage_percentage a inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- 2. Agregar waste_percentage a dish_ingredients
ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- 3. Verificar que price_per_unit existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'price_per_unit'
  ) THEN
    -- Si no existe, crearla
    ALTER TABLE inventory_items 
    ADD COLUMN price_per_unit NUMERIC DEFAULT 0;
    
    -- Si había una columna 'price', copiar los valores
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      AND column_name = 'price'
    ) THEN
      UPDATE inventory_items SET price_per_unit = price WHERE price_per_unit = 0;
    END IF;
  END IF;
END $$;

-- 4. Verificar columnas finales
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name IN ('price_per_unit', 'wastage_percentage', 'price')
ORDER BY column_name;

-- Deberías ver:
-- price_per_unit    | numeric | YES | 0
-- wastage_percentage | numeric | YES | 0

-- 5. IMPORTANTE: Recargar schema cache de Supabase
-- Ejecuta esto para forzar a Supabase a recargar el schema:
NOTIFY pgrst, 'reload schema';

-- 6. Verificar que funciona
SELECT * FROM inventory_items LIMIT 1;
