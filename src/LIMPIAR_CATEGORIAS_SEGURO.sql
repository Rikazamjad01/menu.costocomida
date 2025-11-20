-- ============================================
-- 🧹 LIMPIAR CATEGORÍAS - Método Seguro
-- ============================================

-- Paso 1: Ver cuántas hay ahora
SELECT 
  'ANTES:' as estado,
  COUNT(*) as total_categorias
FROM default_categories;

-- Paso 2: Ver los duplicados específicos
SELECT 
  name,
  emoji,
  COUNT(*) as cantidad,
  string_agg(id::text, ', ') as ids
FROM default_categories
GROUP BY name, emoji
ORDER BY name;

-- Paso 3: Eliminar TODO (esto no afecta las categorías que ya tienen los usuarios)
TRUNCATE TABLE default_categories CASCADE;

-- Paso 4: Insertar categorías limpias
INSERT INTO default_categories (name, emoji) 
VALUES
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

-- Paso 5: Verificar que quedó limpio
SELECT 
  'DESPUÉS:' as estado,
  COUNT(*) as total_categorias
FROM default_categories;

-- Paso 6: Ver las categorías finales
SELECT 
  name,
  emoji,
  created_at
FROM default_categories
ORDER BY name;
