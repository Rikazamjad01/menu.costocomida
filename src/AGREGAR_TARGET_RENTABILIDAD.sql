-- ===================================================================
-- 🎯 AGREGAR OBJETIVOS DE RENTABILIDAD A CATEGORÍAS
-- ===================================================================
-- 
-- 📋 INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Copia y pega este script completo
-- 3. Haz click en "Run" (o presiona Ctrl/Cmd + Enter)
-- 4. Verifica que las columnas se crearon correctamente
--
-- 🔐 SEGURIDAD:
-- - Este script NO modifica datos existentes
-- - Solo AGREGA columnas nuevas (opcionales)
-- - Las categorías existentes seguirán funcionando igual
--
-- ===================================================================

-- 1. Agregar columnas para almacenar el objetivo de rentabilidad
ALTER TABLE menu_categories 
ADD COLUMN IF NOT EXISTS target_cost_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_margin_percentage DECIMAL(5,2);

-- 2. Agregar comentarios para documentación
COMMENT ON COLUMN menu_categories.target_cost_percentage IS 'Objetivo de costo de materia prima como % del precio neto (0-100)';
COMMENT ON COLUMN menu_categories.target_margin_percentage IS 'Objetivo de margen neto como % del precio neto (0-100). target_cost_percentage + target_margin_percentage = 100';

-- 3. Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_categories' 
  AND column_name IN ('target_cost_percentage', 'target_margin_percentage');

-- 4. Ver categorías existentes (para verificar)
SELECT 
  id,
  name,
  emoji,
  target_cost_percentage,
  target_margin_percentage
FROM menu_categories
ORDER BY created_at DESC;

-- ===================================================================
-- ✅ RESULTADO ESPERADO:
-- ===================================================================
-- Deberías ver:
-- 1. Dos filas en el query #3 mostrando las columnas nuevas
-- 2. Tus categorías existentes en el query #4 con NULL en los targets
--
-- ===================================================================
-- 💡 CÓMO FUNCIONA:
-- ===================================================================
-- - Si una categoría tiene estos valores definidos, se usan para comparación
-- - Si NO tiene valores (NULL), se mantiene el comportamiento por defecto
-- - La suma target_cost_percentage + target_margin_percentage debe ser 100
-- - Los platos mantienen su relación con las categorías (NO se pierden)
--
-- ===================================================================
