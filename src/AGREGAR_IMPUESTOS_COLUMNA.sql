-- =====================================================
-- 🏗️ AGREGAR COLUMNA DE IMPUESTOS A USER_SETTINGS
-- =====================================================
-- Este script agrega la columna tax_percentage a user_settings
-- Ejecuta este script en el SQL Editor de Supabase
-- =====================================================

-- Agregar columna tax_percentage (porcentaje de impuestos)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

-- Comentario descriptivo
COMMENT ON COLUMN user_settings.tax_percentage IS 'Porcentaje de impuestos aplicado a los precios de venta (0-100). Ej: 4.00 = 4%';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver columnas de user_settings (verificar que tax_percentage existe)
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ LISTO
-- =====================================================

-- Ahora puedes:
-- 1. Ir a Configuración de cuenta en la app
-- 2. Establecer el porcentaje de impuestos (ej: 4%)
-- 3. Este valor se aplicará a todos los platos automáticamente
-- 4. Se mostrará en la vista detallada del plato

-- =====================================================
-- 📋 PRÓXIMOS PASOS
-- =====================================================

-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Verifica que la columna se agregó correctamente
-- 3. Refresca la app
-- 4. Ve a Settings y agrega tu porcentaje de impuestos
-- 5. Crea un plato y verás los impuestos calculados automáticamente
