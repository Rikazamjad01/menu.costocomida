-- =====================================================
-- 📊 AGREGAR CAMPO DE MERMA A INGREDIENTES
-- =====================================================
-- Este script agrega wastage_percentage a inventory_items
-- para guardar el porcentaje de merma por ingrediente
-- =====================================================

-- =====================================================
-- PASO 1: AGREGAR COLUMNA wastage_percentage
-- =====================================================

-- Agregar columna de porcentaje de merma (0-100)
-- Default 0% (sin merma)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Agregar constraint para validar que esté entre 0 y 100
ALTER TABLE inventory_items
DROP CONSTRAINT IF EXISTS check_wastage_percentage_range;

ALTER TABLE inventory_items
ADD CONSTRAINT check_wastage_percentage_range 
CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100);

-- =====================================================
-- PASO 2: AGREGAR COMENTARIOS
-- =====================================================

COMMENT ON COLUMN inventory_items.wastage_percentage IS 
'Porcentaje de merma del ingrediente (0-100). Ejemplo: 10% significa que de 100g comprados, solo 90g son usables.';

-- =====================================================
-- PASO 3: ACTUALIZAR INGREDIENTES EXISTENTES
-- =====================================================

-- Los ingredientes existentes tendrán 0% de merma por defecto
-- Los usuarios pueden actualizarlos después
UPDATE inventory_items 
SET wastage_percentage = 0.00 
WHERE wastage_percentage IS NULL;

-- =====================================================
-- PASO 4: VERIFICACIÓN
-- =====================================================

-- Ver estructura de la tabla
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Ver ingredientes con merma
SELECT 
  id,
  name,
  unit,
  price_per_unit,
  wastage_percentage,
  user_id
FROM inventory_items
LIMIT 10;

-- =====================================================
-- ✅ LISTO
-- =====================================================

-- Ahora inventory_items tiene:
-- - name (nombre del ingrediente)
-- - unit (kg, lt, ml, etc.)
-- - price_per_unit (precio por unidad)
-- - wastage_percentage (% de merma, 0-100)
-- - user_id (aislamiento por usuario)

-- Ejemplo de uso:
-- Ingrediente: Tomate
-- Precio: $20/kg
-- Merma: 10%
-- 
-- Si compro 1kg ($20):
-- - Peso comprado: 1000g
-- - Merma: 100g (10%)
-- - Peso usable: 900g
-- - Costo real: $20/900g = $0.0222/g
-- 
-- Sin merma hubiera sido: $20/1000g = $0.02/g
-- La merma incrementa el costo en 11.11%
