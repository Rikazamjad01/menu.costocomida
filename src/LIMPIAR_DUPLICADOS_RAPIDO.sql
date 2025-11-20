-- ============================================
-- 🧹 LIMPIAR DUPLICADOS - Ejecución Rápida
-- ============================================

-- Paso 1: Eliminar TODOS los duplicados
DELETE FROM default_categories;

-- Paso 2: Insertar categorías limpias (sin duplicados)
INSERT INTO default_categories (name, emoji) VALUES
  ('Almuerzo', '🍽️'),
  ('Aperitivos', '🥗'),
  ('Bebidas', '🥤'),
  ('Bebidas Alcohólicas', '🍷'),
  ('Cena', '🌙'),
  ('Comida', '🍛'),
  ('Desayuno', '☕'),
  ('Ensaladas', '🥬'),
  ('Postres', '🍰'),
  ('Sopas', '🍲');

-- Paso 3: Verificar que quedó limpio (debe devolver 10)
SELECT COUNT(*) as total FROM default_categories;

-- Paso 4: Ver las categorías limpias
SELECT 
  name,
  emoji,
  created_at
FROM default_categories
ORDER BY name;

-- ============================================
-- 📋 COPIAR CATEGORÍAS A USUARIOS EXISTENTES
-- ============================================

-- SOLO ejecuta esto si tienes usuarios que ya se registraron
-- y quieres que tengan estas categorías

-- Primero, eliminar las categorías duplicadas de usuarios
DELETE FROM menu_categories;

-- Luego, copiar las categorías limpias a todos los usuarios
INSERT INTO menu_categories (user_id, name, emoji, is_hidden)
SELECT 
  us.user_id,
  dc.name,
  dc.emoji,
  false
FROM user_settings us
CROSS JOIN default_categories dc
ON CONFLICT DO NOTHING;

-- Verificar: Cada usuario debe tener exactamente 10 categorías
SELECT 
  us.user_name,
  us.user_email,
  COUNT(mc.id) as total_categorias
FROM user_settings us
LEFT JOIN menu_categories mc ON us.user_id = mc.user_id
GROUP BY us.user_id, us.user_name, us.user_email
ORDER BY us.user_name;
