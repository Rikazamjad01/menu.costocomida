-- =====================================================
-- 🔍 DIAGNÓSTICO: Verificar columna tax_percentage
-- =====================================================
-- Este script verifica que la columna tax_percentage existe
-- y muestra los valores actuales en user_settings
-- =====================================================

-- 1️⃣ Verificar que la columna existe
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name = 'tax_percentage';

-- Resultado esperado:
-- column_name      | data_type | column_default | is_nullable
-- tax_percentage   | numeric   | 0.00           | YES


-- 2️⃣ Ver todos los registros de user_settings con tax_percentage
SELECT 
  id,
  user_id,
  user_name,
  currency,
  tax_percentage,
  created_at
FROM user_settings
ORDER BY created_at DESC;


-- 3️⃣ Contar cuántos registros tienen tax_percentage NULL vs. con valor
SELECT 
  COUNT(*) FILTER (WHERE tax_percentage IS NULL) as null_count,
  COUNT(*) FILTER (WHERE tax_percentage IS NOT NULL) as not_null_count,
  COUNT(*) FILTER (WHERE tax_percentage = 0) as zero_count,
  COUNT(*) FILTER (WHERE tax_percentage > 0) as positive_count,
  COUNT(*) as total_count
FROM user_settings;


-- 4️⃣ Si la columna NO existe, ejecuta esto para crearla:
/*
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 0.00 
CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

COMMENT ON COLUMN user_settings.tax_percentage IS 
'Porcentaje de impuestos aplicado a los precios de venta (0-100). Ej: 4.00 = 4%';
*/


-- 5️⃣ Si quieres establecer un valor por defecto para registros existentes:
/*
UPDATE user_settings 
SET tax_percentage = 0.00 
WHERE tax_percentage IS NULL;
*/


-- 6️⃣ Para probar: establecer tax_percentage a 4% para tu usuario
/*
UPDATE user_settings 
SET tax_percentage = 4.00 
WHERE user_id = auth.uid();  -- Esto actualiza solo tu usuario autenticado

-- O si conoces tu user_id:
-- UPDATE user_settings 
-- SET tax_percentage = 4.00 
-- WHERE user_id = 'tu-user-id-aqui';
*/


-- =====================================================
-- 📋 INSTRUCCIONES
-- =====================================================
-- 1. Ejecuta las queries 1-3 para diagnosticar
-- 2. Si la columna no existe, ejecuta la query 4
-- 3. Si todos los valores están NULL, ejecuta la query 5
-- 4. Para probar, ejecuta la query 6 (descomenta primero)
-- 5. Refresca la app y verifica que los impuestos aparezcan
-- =====================================================
