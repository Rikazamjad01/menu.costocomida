-- =====================================================
-- 🗑️ LIMPIAR TODO Y EMPEZAR FRESCO
-- =====================================================
-- Este script elimina TODOS los datos y usuarios
-- Úsalo solo si quieres empezar desde cero
-- =====================================================

-- ADVERTENCIA: Este script es DESTRUCTIVO
-- Se borrarán TODOS los datos y usuarios
-- NO hay forma de recuperarlos después

-- =====================================================
-- PASO 1: Eliminar todos los datos de las tablas
-- =====================================================

DELETE FROM dish_ingredients;
DELETE FROM dishes;
DELETE FROM menu_categories;
DELETE FROM inventory_items;
DELETE FROM user_settings;

-- =====================================================
-- PASO 2: Eliminar todos los usuarios de Auth
-- =====================================================

-- Nota: Esto requiere permisos de admin
-- Si no funciona, elimina usuarios manualmente desde:
-- Authentication → Users → Delete

-- Eliminar usuarios sin email confirmado
DELETE FROM auth.users WHERE email_confirmed_at IS NULL;

-- Eliminar TODOS los usuarios (opcional, comentado por seguridad)
-- DELETE FROM auth.users;

-- =====================================================
-- PASO 3: Resetear secuencias (si existen)
-- =====================================================

-- No aplicable porque usamos UUIDs
-- Si usaras integers, descomentarías:
-- ALTER SEQUENCE dishes_id_seq RESTART WITH 1;

-- =====================================================
-- PASO 4: Verificación
-- =====================================================

-- Verificar que las tablas están vacías
SELECT 'user_settings' as table_name, COUNT(*) as count FROM user_settings
UNION ALL
SELECT 'menu_categories', COUNT(*) FROM menu_categories
UNION ALL
SELECT 'dishes', COUNT(*) FROM dishes
UNION ALL
SELECT 'dish_ingredients', COUNT(*) FROM dish_ingredients
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items;

-- Verificar usuarios de auth
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- =====================================================
-- ✅ LIMPIEZA COMPLETA
-- =====================================================

-- Ahora puedes crear una cuenta nueva y empezar desde cero
-- Recuerda:
-- 1. Crear cuenta nueva en la app
-- 2. Verificar que aparece en Authentication → Users
-- 3. Empezar a crear categorías y platos

-- =====================================================
-- 📝 NOTAS
-- =====================================================

-- Este script NO elimina:
-- - Las tablas (solo el contenido)
-- - Las políticas de RLS
-- - Los triggers
-- - Los índices

-- Para crear categorías prepopuladas nuevamente, ejecuta:
-- /SETUP_CATEGORIAS_INICIALES.sql (si lo tienes)
