# 🔍 Diagnóstico de Base de Datos

## 📋 Ejecuta este script para ver qué tienes

Copia y pega esto en **Supabase SQL Editor** y luego **pégame el resultado completo**:

```sql
-- =====================================================
-- DIAGNÓSTICO COMPLETO DE BASE DE DATOS
-- =====================================================

-- 1. VER TODAS LAS TABLAS
SELECT '=== TABLAS EXISTENTES ===' as seccion;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. VER ESTRUCTURA DE user_settings
SELECT '=== COLUMNAS DE user_settings ===' as seccion;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- 3. VER ESTRUCTURA DE menu_categories
SELECT '=== COLUMNAS DE menu_categories ===' as seccion;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'menu_categories'
ORDER BY ordinal_position;

-- 4. VER ESTRUCTURA DE dishes
SELECT '=== COLUMNAS DE dishes ===' as seccion;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dishes'
ORDER BY ordinal_position;

-- 5. VER ESTRUCTURA DE inventory_items
SELECT '=== COLUMNAS DE inventory_items ===' as seccion;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- 6. VER ESTRUCTURA DE dish_ingredients
SELECT '=== COLUMNAS DE dish_ingredients ===' as seccion;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dish_ingredients'
ORDER BY ordinal_position;

-- 7. CONTAR DATOS
SELECT '=== CANTIDAD DE REGISTROS ===' as seccion;
SELECT 
  'user_settings' as tabla, 
  COUNT(*) as total 
FROM user_settings
UNION ALL
SELECT 'menu_categories', COUNT(*) FROM menu_categories
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'dishes', COUNT(*) FROM dishes
UNION ALL
SELECT 'dish_ingredients', COUNT(*) FROM dish_ingredients;

-- 8. VER CATEGORÍAS
SELECT '=== CATEGORÍAS PREPOPULADAS ===' as seccion;
SELECT name, emoji, is_hidden FROM menu_categories ORDER BY name;

-- 9. VER ITEMS DE INVENTARIO
SELECT '=== ITEMS DE INVENTARIO ===' as seccion;
SELECT name, unit, price, category FROM inventory_items ORDER BY name;

-- 10. VER POLÍTICAS RLS
SELECT '=== POLÍTICAS RLS ===' as seccion;
SELECT 
  tablename, 
  policyname, 
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 11. VER TRIGGERS
SELECT '=== TRIGGERS ===' as seccion;
SELECT 
  trigger_name, 
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- =====================================================
-- FIN DEL DIAGNÓSTICO
-- =====================================================
```

## 📸 Cómo compartir el resultado

1. Ejecuta el script completo en Supabase
2. Espera a que termine (puede tardar 3-5 segundos)
3. Copia TODO el resultado que aparece
4. Pégamelo en el chat

Con eso podré ver exactamente qué tienes y qué falta.

---

## 🎯 Resultado esperado

Deberías ver secciones como:

```
=== TABLAS EXISTENTES ===
dish_ingredients
dishes
inventory_items
menu_categories
user_settings

=== COLUMNAS DE user_settings ===
id | uuid | NO | gen_random_uuid()
user_name | text | NO | NULL
user_email | text | YES | NULL
password | text | YES | NULL
currency | text | YES | 'MXN'
...

=== CANTIDAD DE REGISTROS ===
user_settings | 0
menu_categories | 10
inventory_items | 7
dishes | 0
dish_ingredients | 0
```

Si algo falta o está mal, me lo muestras y te digo exactamente qué ejecutar para arreglarlo.
