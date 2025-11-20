-- =====================================================
-- 🏗️ CREAR TODAS LAS TABLAS - COSTOCOMIDA
-- =====================================================
-- Este script crea todas las tablas necesarias para CostoComida
-- Ejecuta este script EN ORDEN en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- PASO 1: ELIMINAR TABLAS SI EXISTEN (OPCIONAL - CUIDADO)
-- =====================================================
-- ⚠️ DESCOMENTA SOLO SI QUIERES EMPEZAR DE CERO
-- ⚠️ ESTO BORRARÁ TODOS LOS DATOS EXISTENTES

-- DROP TABLE IF EXISTS dish_ingredients CASCADE;
-- DROP TABLE IF EXISTS dishes CASCADE;
-- DROP TABLE IF EXISTS inventory_items CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- PASO 2: CREAR TABLA DE CATEGORÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📁',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: cada usuario tiene nombres de categoría únicos
  CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Comentarios
COMMENT ON TABLE categories IS 'Categorías de platos del menú (Entradas, Platos Fuertes, Postres, etc.)';
COMMENT ON COLUMN categories.user_id IS 'ID del usuario dueño de esta categoría (aislamiento multi-tenant)';

-- =====================================================
-- PASO 3: CREAR TABLA DE PLATOS
-- =====================================================

CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: cada usuario tiene nombres de platos únicos
  CONSTRAINT unique_dish_per_user UNIQUE (user_id, name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dishes_user_id ON dishes(user_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category_id ON dishes(category_id);

-- Comentarios
COMMENT ON TABLE dishes IS 'Platos del menú con precio de venta';
COMMENT ON COLUMN dishes.price IS 'Precio de venta al público';
COMMENT ON COLUMN dishes.user_id IS 'ID del usuario dueño de este plato';

-- =====================================================
-- PASO 4: CREAR TABLA DE INGREDIENTES DEL INVENTARIO
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  wastage_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100),
  category TEXT DEFAULT 'Ingrediente',
  emoji TEXT DEFAULT '🍴',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: cada usuario tiene nombres de ingredientes únicos
  CONSTRAINT unique_inventory_item_per_user UNIQUE (user_id, name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);

-- Comentarios
COMMENT ON TABLE inventory_items IS 'Ingredientes del inventario con precio y merma';
COMMENT ON COLUMN inventory_items.unit IS 'Unidad de compra (kg, lt, ml, pzas, etc.)';
COMMENT ON COLUMN inventory_items.price_per_unit IS 'Precio de compra por unidad';
COMMENT ON COLUMN inventory_items.wastage_percentage IS 'Porcentaje de merma (0-100). Ej: 10% = de 100g comprados, solo 90g usables';
COMMENT ON COLUMN inventory_items.user_id IS 'ID del usuario dueño de este ingrediente';

-- =====================================================
-- PASO 5: CREAR TABLA DE INGREDIENTES POR PLATO
-- =====================================================

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 4) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  waste_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (waste_percentage >= 0 AND waste_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: un ingrediente no se puede repetir en el mismo plato
  CONSTRAINT unique_ingredient_per_dish UNIQUE (dish_id, inventory_item_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_inventory_item_id ON dish_ingredients(inventory_item_id);

-- Comentarios
COMMENT ON TABLE dish_ingredients IS 'Relación entre platos e ingredientes con cantidades';
COMMENT ON COLUMN dish_ingredients.quantity IS 'Cantidad del ingrediente usada en el plato (en la unidad especificada)';
COMMENT ON COLUMN dish_ingredients.unit IS 'Unidad de medida (debe coincidir con inventory_items.unit)';
COMMENT ON COLUMN dish_ingredients.waste_percentage IS 'Merma específica para este plato (puede ser diferente al ingrediente base)';

-- =====================================================
-- PASO 6: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 7: CREAR POLÍTICAS RLS PARA CATEGORIES
-- =====================================================

-- Permitir a usuarios ver solo sus categorías
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir a usuarios crear sus categorías
CREATE POLICY "Users can create their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permitir a usuarios actualizar sus categorías
CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir a usuarios eliminar sus categorías
CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PASO 8: CREAR POLÍTICAS RLS PARA DISHES
-- =====================================================

CREATE POLICY "Users can view their own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dishes"
  ON dishes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dishes"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PASO 9: CREAR POLÍTICAS RLS PARA INVENTORY_ITEMS
-- =====================================================

CREATE POLICY "Users can view their own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PASO 10: CREAR POLÍTICAS RLS PARA DISH_INGREDIENTS
-- =====================================================

-- Los usuarios pueden ver ingredientes de sus platos
CREATE POLICY "Users can view ingredients of their dishes"
  ON dish_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = dish_ingredients.dish_id
      AND dishes.user_id = auth.uid()
    )
  );

-- Los usuarios pueden agregar ingredientes a sus platos
CREATE POLICY "Users can add ingredients to their dishes"
  ON dish_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = dish_ingredients.dish_id
      AND dishes.user_id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar ingredientes de sus platos
CREATE POLICY "Users can update ingredients of their dishes"
  ON dish_ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = dish_ingredients.dish_id
      AND dishes.user_id = auth.uid()
    )
  );

-- Los usuarios pueden eliminar ingredientes de sus platos
CREATE POLICY "Users can delete ingredients of their dishes"
  ON dish_ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = dish_ingredients.dish_id
      AND dishes.user_id = auth.uid()
    )
  );

-- =====================================================
-- PASO 11: CREAR FUNCIONES TRIGGER PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para categorías
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para platos
DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para ingredientes
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASO 12: INSERTAR CATEGORÍAS POR DEFECTO (OPCIONAL)
-- =====================================================

-- ⚠️ Esto insertará categorías para TODOS los usuarios
-- ⚠️ Solo ejecuta si quieres categorías por defecto

/*
-- Función para crear categorías por defecto para un usuario
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (name, emoji, user_id)
  VALUES 
    ('Entradas', '🥗', NEW.id),
    ('Platos Fuertes', '🍝', NEW.id),
    ('Postres', '🍰', NEW.id),
    ('Bebidas', '🥤', NEW.id)
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear categorías cuando un usuario se registra
DROP TRIGGER IF EXISTS create_categories_on_signup ON auth.users;
CREATE TRIGGER create_categories_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
*/

-- =====================================================
-- PASO 13: VERIFICACIÓN
-- =====================================================

-- Ver todas las tablas creadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('categories', 'dishes', 'inventory_items', 'dish_ingredients')
ORDER BY table_name;

-- Ver columnas de inventory_items (verificar que price_per_unit existe)
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('categories', 'dishes', 'inventory_items', 'dish_ingredients')
ORDER BY tablename, policyname;

-- =====================================================
-- ✅ LISTO
-- =====================================================

-- Estructura completa creada:
-- 
-- 1. categories (id, name, emoji, user_id)
-- 2. dishes (id, name, category_id, price, user_id)
-- 3. inventory_items (id, name, unit, price_per_unit, wastage_percentage, user_id)
-- 4. dish_ingredients (id, dish_id, inventory_item_id, quantity, unit, waste_percentage)
--
-- Con RLS habilitado para aislamiento multi-tenant
-- Con triggers para updated_at
-- Con constraints para integridad de datos

-- =====================================================
-- 📋 PRÓXIMOS PASOS
-- =====================================================

-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Verifica que todas las tablas se crearon correctamente
-- 3. Prueba crear un plato con ingredientes desde la app
-- 4. Si algo falla, revisa los logs de error

-- =====================================================
-- 🔧 TROUBLESHOOTING
-- =====================================================

-- Si ves error "table already exists":
-- Las tablas ya existen, no hay problema. Puedes omitir ese error.

-- Si ves error "permission denied":
-- Asegúrate de estar ejecutando como usuario con permisos de admin.

-- Si ves error "column already exists":
-- Las columnas ya existen, no hay problema.

-- Si ves error "policy already exists":
-- Las políticas ya existen, elimínalas primero con:
-- DROP POLICY IF EXISTS "nombre_de_la_politica" ON nombre_tabla;
