# 🗄️ Scripts SQL para Supabase - CostoComida

## 📋 Índice
1. [Script Principal - Configuración Completa](#script-principal)
2. [Script de Actualización - Agregar Contraseña](#actualización-contraseña)
3. [Scripts Opcionales - Gestión de Datos](#scripts-opcionales)
4. [Verificación y Testing](#verificación)

---

## ⚠️ IMPORTANTE - Lee Antes de Ejecutar

### 📖 Cómo usar este documento:

1. **NO copies los encabezados con emojis** (### 📊 Ver Datos, etc.)
2. **Solo copia el código que está dentro de los bloques grises** (```sql ... ```)
3. **Lee las instrucciones** antes de cada bloque para saber qué hace
4. **Ejecuta un script a la vez** en el SQL Editor de Supabase

---

### 🎯 ¿Primera vez configurando la base de datos?
**→ Ve a [SCRIPT PRINCIPAL](#script-principal)** y ejecuta ese código completo

### 🔄 ¿Ya configuraste la base de datos antes?
**→ Ve a [SCRIPT DE ACTUALIZACIÓN](#actualización-contraseña)** y ejecuta solo ese código

---

## 🚀 SCRIPT PRINCIPAL - Configuración Completa {#script-principal}

### 📝 Instrucciones:
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copia y pega TODO el código de abajo
5. Click en **Run** (botón verde)
6. Espera el mensaje de éxito ✅

### 💾 Código SQL:

```sql
-- =====================================================
-- CostoComida Database Schema - Setup Completo
-- =====================================================
-- Versión: 2.0 (con soporte de contraseña)
-- Fecha: Noviembre 2024
-- =====================================================

-- ============================================
-- 1. TABLAS
-- ============================================

-- Tabla de configuración de usuario
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

-- Tabla de categorías de menú
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de inventario
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

-- Tabla de platos
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  price DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ingredientes de platos (relación muchos a muchos)
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
-- 2. ÍNDICES (Optimización de Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_dish ON dish_ingredients(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ingredients_inventory ON dish_ingredients(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);

-- ============================================
-- 3. DATOS INICIALES
-- ============================================

-- Insertar categorías prepopuladas
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

-- Insertar items de inventario de ejemplo
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

-- Función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at en cada tabla
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
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si ya existen
DROP POLICY IF EXISTS "Enable all for user_settings" ON user_settings;
DROP POLICY IF EXISTS "Enable all for menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Enable all for inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Enable all for dishes" ON dishes;
DROP POLICY IF EXISTS "Enable all for dish_ingredients" ON dish_ingredients;

-- Crear políticas permisivas (ajustar según necesidades en producción)
CREATE POLICY "Enable all for user_settings" ON user_settings FOR ALL USING (true);
CREATE POLICY "Enable all for menu_categories" ON menu_categories FOR ALL USING (true);
CREATE POLICY "Enable all for inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Enable all for dishes" ON dishes FOR ALL USING (true);
CREATE POLICY "Enable all for dish_ingredients" ON dish_ingredients FOR ALL USING (true);

-- =====================================================
-- ✅ CONFIGURACIÓN COMPLETA
-- =====================================================
-- La base de datos está lista para usar CostoComida
-- Puedes cerrar este editor y probar la aplicación
-- =====================================================
```

---

## 🔄 ACTUALIZACIÓN - Agregar Contraseña {#actualización-contraseña}

### ⚠️ SOLO ejecuta esto si:
- Ya configuraste la base de datos anteriormente
- La tabla `user_settings` ya existe
- Necesitas agregar soporte para contraseñas

### 💾 Código SQL:

```sql
-- =====================================================
-- Actualización: Agregar Contraseña a User Settings
-- =====================================================
-- Versión: 1.1
-- =====================================================

-- Agregar columna de contraseña si no existe
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ ACTUALIZACIÓN COMPLETA
-- =====================================================
```

---

## 🛠️ SCRIPTS OPCIONALES - Gestión de Datos {#scripts-opcionales}

> ⚠️ **IMPORTANTE:** Cada script está en su propio bloque. Copia SOLO el código que está dentro de los bloques grises (```sql ... ```), NO copies los encabezados con emojis.

---

### 🔍 Script 1: Ver Estructura de Tablas

**Copia y pega esto en SQL Editor:**

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**O este para ver detalles de user_settings:**

```sql
-- Ver estructura de user_settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
```

**O este para ver detalles de menu_categories:**

```sql
-- Ver estructura de menu_categories
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'menu_categories'
ORDER BY ordinal_position;
```

---

### 📊 Script 2: Ver Datos Existentes

**Para ver todos los usuarios:**

```sql
SELECT id, user_name, user_email, currency, created_at 
FROM user_settings;
```

**Para ver todas las categorías:**

```sql
SELECT id, name, emoji, is_hidden 
FROM menu_categories;
```

**Para ver items de inventario:**

```sql
SELECT id, name, unit, price, category, emoji 
FROM inventory_items;
```

**Para ver platos y sus categorías:**

```sql
SELECT d.id, d.name, d.price, c.name as category
FROM dishes d
LEFT JOIN menu_categories c ON d.category_id = c.id;
```

---

### 🗑️ Script 3: Limpiar Datos (⚠️ Usar con MUCHA Precaución)

> 🚨 **PELIGRO:** Estos scripts BORRAN datos permanentemente. Solo usar en desarrollo.

**Para borrar TODOS los usuarios:**

```sql
DELETE FROM user_settings;
```

**Para borrar todos los platos:**

```sql
DELETE FROM dishes;
```

**Para borrar categorías personalizadas (mantiene las 10 originales):**

```sql
DELETE FROM menu_categories 
WHERE name NOT IN (
  'Desayuno', 'Almuerzo', 'Comida', 'Cena', 'Postres', 
  'Bebidas', 'Bebidas Alcohólicas', 'Aperitivos', 'Ensaladas', 'Sopas'
);
```

**Para borrar items de inventario personalizados (mantiene los 7 originales):**

```sql
DELETE FROM inventory_items 
WHERE name NOT IN (
  'Huevos', 'Tortillas', 'Frijoles', 'Queso', 
  'Tomate', 'Cebolla', 'Aguacate'
);
```

---

### 🔐 Script 4: Asignar Contraseñas Temporales

**Para asignar contraseña temporal a usuarios sin contraseña:**

```sql
UPDATE user_settings 
SET password = 'temporal123' 
WHERE password IS NULL;
```

**Para verificar qué usuarios tienen o no contraseña:**

```sql
SELECT id, user_name, user_email, 
       CASE WHEN password IS NULL THEN 'Sin contraseña' ELSE 'Con contraseña' END as estado
FROM user_settings;
```

---

### 📈 Script 5: Estadísticas de la Base de Datos

**Para contar registros en todas las tablas:**

```sql
SELECT 
  'user_settings' as tabla, COUNT(*) as total FROM user_settings
UNION ALL
SELECT 
  'menu_categories', COUNT(*) FROM menu_categories
UNION ALL
SELECT 
  'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 
  'dishes', COUNT(*) FROM dishes
UNION ALL
SELECT 
  'dish_ingredients', COUNT(*) FROM dish_ingredients;
```

**Para ver platos con más ingredientes:**

```sql
SELECT d.name, COUNT(di.id) as num_ingredientes
FROM dishes d
LEFT JOIN dish_ingredients di ON d.id = di.dish_id
GROUP BY d.id, d.name
ORDER BY num_ingredientes DESC;
```

---

## ✅ VERIFICACIÓN Y TESTING {#verificación}

### 1. Verificar que las Tablas se Crearon

```sql
-- Debe mostrar 5 tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_settings', 
    'menu_categories', 
    'inventory_items', 
    'dishes', 
    'dish_ingredients'
  )
ORDER BY table_name;
```

**Resultado esperado:**
```
dish_ingredients
dishes
inventory_items
menu_categories
user_settings
```

### 2. Verificar Categorías Prepopuladas

```sql
-- Debe mostrar 10 categorías
SELECT name, emoji FROM menu_categories ORDER BY name;
```

**Resultado esperado:** 10 categorías (Desayuno, Almuerzo, etc.)

### 3. Verificar Items de Inventario

```sql
-- Debe mostrar 7 items
SELECT name, unit, price FROM inventory_items ORDER BY name;
```

**Resultado esperado:** 7 items (Huevos, Tortillas, etc.)

### 4. Verificar Columna de Password

```sql
-- Debe incluir 'password' en la lista
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
```

**Resultado esperado:** Debe aparecer la columna `password`

### 5. Verificar Políticas RLS

```sql
-- Ver todas las políticas activas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Resultado esperado:** 5 políticas (una por cada tabla)

---

## 🆘 Solución de Problemas

### ❌ Error: "relation already exists"
**Causa:** Las tablas ya fueron creadas anteriormente  
**Solución:** Esto es normal, el script usa `IF NOT EXISTS` y no causará problemas

### ❌ Error: "permission denied"
**Causa:** No tienes permisos de administrador  
**Solución:** Asegúrate de estar en el proyecto correcto de Supabase

### ❌ Error: "column already exists"
**Causa:** La columna password ya fue agregada  
**Solución:** Esto es normal si ejecutaste el script de actualización antes

### ❌ No veo datos en la aplicación
**Posibles causas:**
1. Las políticas RLS bloquean el acceso → Ejecuta la sección 5 del script principal
2. No se insertaron los datos de ejemplo → Ejecuta la sección 3 del script principal
3. Error de conexión con Supabase → Verifica las credenciales en `/utils/supabase/info.tsx`

### ❌ Login no funciona
**Verifica:**
1. Que la columna `password` exista en `user_settings`
2. Que el usuario tenga una contraseña asignada
3. Que las políticas RLS estén activas y permisivas

---

## 📞 Soporte

### Logs de Supabase
1. Ve a **Logs** en el menú lateral de Supabase
2. Selecciona **Postgres Logs**
3. Busca errores recientes

### Consola del Navegador
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo

### Verificar Conexión
```sql
-- Test simple de conexión
SELECT NOW() as fecha_hora_servidor;
```

---

## 📝 Notas Importantes

### 🔒 Seguridad
- ⚠️ Las contraseñas se guardan en **texto plano**
- ⚠️ Solo para **prototipo/MVP**
- ⚠️ **NO usar en producción** con datos reales
- ✅ Para producción, migrar a Supabase Auth con hash bcrypt

### 🎯 Estado del Sistema
- **RLS:** Habilitado pero permisivo (ajustar en producción)
- **Políticas:** Permitir todo (`USING (true)`)
- **Triggers:** Actualizan `updated_at` automáticamente
- **Índices:** Optimizados para queries comunes

### 📊 Capacidad
- **Usuarios:** Ilimitados
- **Categorías:** Ilimitadas
- **Platos:** Ilimitados
- **Ingredientes:** Ilimitados

---

## 🎉 ¡Listo!

Una vez ejecutado el script principal, tu base de datos estará completamente configurada y la aplicación CostoComida funcionará perfectamente.

### Próximos pasos:
1. ✅ Prueba registrar un nuevo usuario
2. ✅ Agrega algunos platos con ingredientes
3. ✅ Verifica que los cálculos de rentabilidad funcionen
4. ✅ Prueba el sistema de login
5. ✅ Gestiona categorías y cuenta

---

**Versión del documento:** 2.0  
**Última actualización:** Noviembre 2024  
**Compatibilidad:** Supabase Postgres 15+
