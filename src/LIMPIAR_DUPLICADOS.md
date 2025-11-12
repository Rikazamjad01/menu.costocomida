# 🧹 Limpiar Categorías Duplicadas

## 📊 Paso 1: Ver todas las categorías

```sql
-- Ver TODAS las categorías en default_categories
SELECT 
  id,
  name,
  emoji,
  created_at
FROM default_categories
ORDER BY name, created_at;
```

## 🔍 Paso 2: Detectar duplicados en default_categories

```sql
-- Ver cuántas veces aparece cada categoría
SELECT 
  name,
  emoji,
  COUNT(*) as cantidad,
  string_agg(id::text, ', ') as ids
FROM default_categories
GROUP BY name, emoji
HAVING COUNT(*) > 1
ORDER BY name;
```

## 🗑️ Paso 3: ELIMINAR TODOS los duplicados (CUIDADO)

```sql
-- PRIMERO: Eliminar TODAS las categorías default
-- (Esto no afecta las categorías que ya tienen los usuarios)
DELETE FROM default_categories;

-- SEGUNDO: Insertar las categorías LIMPIAS (una sola vez)
INSERT INTO default_categories (name, emoji) VALUES
  ('Entradas', '🥗'),
  ('Platos Fuertes', '🍽️'),
  ('Bebidas', '🥤'),
  ('Postres', '🍰'),
  ('Guarniciones', '🍟'),
  ('Especiales', '⭐')
ON CONFLICT DO NOTHING;
```

## 👥 Paso 4: Ver categorías de UN usuario específico

```sql
-- Reemplaza 'USER_ID_AQUI' con el UUID real del usuario
SELECT 
  mc.id,
  mc.name,
  mc.emoji,
  mc.user_id,
  mc.created_at,
  us.user_name,
  us.user_email
FROM menu_categories mc
LEFT JOIN user_settings us ON mc.user_id = us.user_id
WHERE mc.user_id = 'USER_ID_AQUI'
ORDER BY mc.name;
```

## 🔎 Paso 5: Ver TODOS los usuarios y sus categorías

```sql
-- Ver resumen de categorías por usuario
SELECT 
  us.user_name,
  us.user_email,
  COUNT(mc.id) as total_categorias
FROM user_settings us
LEFT JOIN menu_categories mc ON us.user_id = mc.user_id
GROUP BY us.user_id, us.user_name, us.user_email
ORDER BY us.user_name;
```

## 🧹 Paso 6: Limpiar duplicados de un usuario específico

```sql
-- Eliminar categorías duplicadas de un usuario
-- (Mantiene solo la primera de cada categoría)
WITH duplicates AS (
  SELECT 
    id,
    name,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, name 
      ORDER BY created_at ASC
    ) as row_num
  FROM menu_categories
  WHERE user_id = 'USER_ID_AQUI'  -- Reemplaza con el UUID real
)
DELETE FROM menu_categories
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);
```

## 🔄 Paso 7: Copiar categorías default a un usuario (si no tiene)

```sql
-- Solo ejecuta esto si un usuario NO tiene categorías
-- Reemplaza 'USER_ID_AQUI' con el UUID real del usuario
INSERT INTO menu_categories (user_id, name, emoji, is_hidden)
SELECT 
  'USER_ID_AQUI'::uuid,  -- Reemplaza con el UUID real
  name,
  emoji,
  false
FROM default_categories
ON CONFLICT DO NOTHING;
```

## 🎯 SOLUCIÓN RÁPIDA: Empezar de cero

Si todo está muy duplicado y quieres empezar limpio:

```sql
-- ⚠️ CUIDADO: Esto elimina TODO
-- Solo ejecuta si estás seguro y es un entorno de desarrollo

-- 1. Eliminar todas las categorías de usuarios
DELETE FROM menu_categories;

-- 2. Eliminar todas las categorías default
DELETE FROM default_categories;

-- 3. Insertar categorías default limpias
INSERT INTO default_categories (name, emoji) VALUES
  ('Entradas', '🥗'),
  ('Platos Fuertes', '🍽️'),
  ('Bebidas', '🥤'),
  ('Postres', '🍰'),
  ('Guarniciones', '🍟'),
  ('Especiales', '⭐');

-- 4. Copiar a todos los usuarios existentes
INSERT INTO menu_categories (user_id, name, emoji, is_hidden)
SELECT 
  us.user_id,
  dc.name,
  dc.emoji,
  false
FROM user_settings us
CROSS JOIN default_categories dc
ON CONFLICT DO NOTHING;

-- 5. Verificar que todo está bien
SELECT 
  us.user_name,
  us.user_email,
  COUNT(mc.id) as total_categorias
FROM user_settings us
LEFT JOIN menu_categories mc ON us.user_id = mc.user_id
GROUP BY us.user_id, us.user_name, us.user_email
ORDER BY us.user_name;
```

## 📋 Obtener el UUID de un usuario

Si no sabes el UUID de un usuario, consíguelo así:

```sql
-- Por email
SELECT 
  user_id,
  user_name,
  user_email
FROM user_settings
WHERE user_email = 'tu@email.com';

-- Ver todos los usuarios
SELECT 
  user_id,
  user_name,
  user_email,
  created_at
FROM user_settings
ORDER BY created_at DESC;
```

## 🔍 Query de diagnóstico completo

```sql
-- Ver el estado completo de la base de datos
SELECT 
  'default_categories' as tabla,
  COUNT(*) as total
FROM default_categories

UNION ALL

SELECT 
  'menu_categories' as tabla,
  COUNT(*) as total
FROM menu_categories

UNION ALL

SELECT 
  'user_settings' as tabla,
  COUNT(*) as total
FROM user_settings

UNION ALL

SELECT 
  'dishes' as tabla,
  COUNT(*) as total
FROM dishes;
```

## ✅ Verificación final

Después de limpiar, verifica:

```sql
-- 1. Default categories (debe haber exactamente 6)
SELECT COUNT(*) as total_default FROM default_categories;
-- Resultado esperado: 6

-- 2. Cada usuario debe tener 6 categorías
SELECT 
  user_id,
  COUNT(*) as total_categorias
FROM menu_categories
GROUP BY user_id
HAVING COUNT(*) != 6;
-- Resultado esperado: 0 filas (vacío)

-- 3. No debe haber duplicados
SELECT 
  user_id,
  name,
  COUNT(*) as cantidad
FROM menu_categories
GROUP BY user_id, name
HAVING COUNT(*) > 1;
-- Resultado esperado: 0 filas (vacío)
```

---

## 🚫 Para prevenir duplicados en el futuro

**REGLA DE ORO:** 
- El script de default_categories **solo se ejecuta UNA VEZ** cuando creas la base de datos
- Si ya lo ejecutaste, **NO lo vuelvas a ejecutar**
- Si necesitas agregar más categorías, usa `ON CONFLICT DO NOTHING` siempre

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Aplicación:** CostoComida - Limpieza de Datos
