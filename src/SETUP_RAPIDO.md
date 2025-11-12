# ⚡ Setup Rápido - CostoComida

## 🎯 Solo para Primera Vez

Si es tu **primera vez** configurando la base de datos, sigue estos pasos:

### Paso 1: Abre Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** (menú lateral)
4. Click en **New Query**

### Paso 2: Copia SOLO este código

**⬇️ COPIA DESDE AQUÍ ⬇️**

```sql
-- =====================================================
-- CostoComida Database Schema - Setup Completo
-- =====================================================
-- Versión: 2.0 (con soporte de contraseña)
-- =====================================================

-- ============================================
-- 1. TABLAS
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT,
  password TEXT,
  currency TEXT DEFAULT 'MXN',
  country TEXT DEFAULT 'MX',
  business_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT,
  emoji TEXT DEFAULT '🍴',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  price DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  waste_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_inventory ON dish_ingredients(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);

-- ============================================
-- 3. DATOS INICIALES
-- ============================================

INSERT INTO menu_categories (name, emoji) VALUES
  ('Desayuno', '🍳'),
  ('Almuerzo', '🍱'),
  ('Comida', '🍽️'),
  ('Cena', '🌙'),
  ('Postres', '🍰'),
  ('Bebidas', '🥤'),
  ('Bebidas Alcohólicas', '🍸'),
  ('Aperitivos', '🥙'),
  ('Ensaladas', '🥗'),
  ('Sopas', '🍲')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items (name, unit, price, category, emoji) VALUES
  ('Huevos', 'piezas', 3.50, 'Proteína', '🥚'),
  ('Tortillas', 'piezas', 1.50, 'Grano', '🫓'),
  ('Frijoles', 'gramos', 0.08, 'Grano', '🫘'),
  ('Queso', 'gramos', 0.30, 'Lácteo', '🧀'),
  ('Tomate', 'gramos', 0.05, 'Vegetal', '🍅'),
  ('Cebolla', 'gramos', 0.06, 'Vegetal', '🧅'),
  ('Aguacate', 'piezas', 12.00, 'Vegetal', '🥑')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at 
BEFORE UPDATE ON user_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON menu_categories;
CREATE TRIGGER update_menu_categories_updated_at 
BEFORE UPDATE ON menu_categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at 
BEFORE UPDATE ON inventory_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
CREATE TRIGGER update_dishes_updated_at 
BEFORE UPDATE ON dishes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for user_settings" ON user_settings;
DROP POLICY IF EXISTS "Enable all for menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Enable all for inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Enable all for dishes" ON dishes;
DROP POLICY IF EXISTS "Enable all for dish_ingredients" ON dish_ingredients;

CREATE POLICY "Enable all for user_settings" ON user_settings FOR ALL USING (true);
CREATE POLICY "Enable all for menu_categories" ON menu_categories FOR ALL USING (true);
CREATE POLICY "Enable all for inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Enable all for dishes" ON dishes FOR ALL USING (true);
CREATE POLICY "Enable all for dish_ingredients" ON dish_ingredients FOR ALL USING (true);

-- =====================================================
-- ✅ CONFIGURACIÓN COMPLETA
-- =====================================================
```

**⬆️ COPIA HASTA AQUÍ ⬆️**

### Paso 3: Ejecuta
1. Pega el código en el SQL Editor
2. Click en **Run** (botón verde)
3. Espera a que termine (5-10 segundos)
4. Deberías ver: "Success. No rows returned"

### Paso 4: Verifica (Opcional)

Copia y ejecuta esto para verificar que todo está bien:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver 5 tablas:
- ✅ dish_ingredients
- ✅ dishes
- ✅ inventory_items
- ✅ menu_categories
- ✅ user_settings

---

## 🎉 ¡Listo!

Tu base de datos ya está configurada. Ahora puedes:
1. Cerrar el SQL Editor
2. Volver a la aplicación
3. Registrar tu primer usuario
4. Empezar a agregar platos

---

## 🆘 ¿Problemas?

### Error: "relation already exists"
✅ **Esto es NORMAL.** Significa que las tablas ya existían. El script no las borrará ni duplicará.

### Error: "permission denied"
❌ No tienes permisos. Verifica que:
- Estás en el proyecto correcto
- Tu cuenta tiene permisos de administrador

### No veo las categorías en la app
1. Verifica que se insertaron con:
   ```sql
   SELECT name, emoji FROM menu_categories;
   ```
2. Deberías ver 10 categorías

### El login no funciona
1. Verifica que la columna password existe:
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'user_settings';
   ```
2. Debes ver `password` en la lista

---

**Tiempo total:** ~2 minutos ⏱️  
**Dificultad:** Muy fácil 😊
