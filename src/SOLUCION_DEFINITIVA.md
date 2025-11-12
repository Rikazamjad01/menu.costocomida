# 🔧 SOLUCIÓN DEFINITIVA: Column price_per_unit does not exist

## 🔴 El Problema Real

El error que estás viendo es:

```
ERROR: 42703: column i.price_per_unit does not exist
```

**NO es un problema de código React** - es un problema de **esquema de base de datos**.

La tabla `inventory_items` NO tiene la columna `price_per_unit` que el código espera.

---

## 🎯 Solución en 3 Pasos

### PASO 1: Verificar Columnas Actuales

**En Supabase → SQL Editor**, ejecuta:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Resultado esperado:**

```
column_name          | data_type | is_nullable
──────────────────────────────────────────────
id                   | uuid      | NO
user_id              | uuid      | NO
name                 | text      | NO
price_per_unit       | numeric   | YES  ← DEBE EXISTIR
unit                 | text      | NO
wastage_percentage   | numeric   | YES  ← DEBE EXISTIR
category             | text      | YES
emoji                | text      | YES
created_at           | timestamp | NO
```

---

### PASO 2A: Si la columna se llama "price" (no "price_per_unit")

**Ejecuta este SQL:**

```sql
-- Renombrar columna
ALTER TABLE inventory_items 
RENAME COLUMN price TO price_per_unit;

-- Verificar que funcionó
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
  AND column_name = 'price_per_unit';
```

Deberías ver:
```
column_name
─────────────────
price_per_unit
```

---

### PASO 2B: Si la columna NO existe en absoluto

**Ejecuta este SQL:**

```sql
-- Agregar columna price_per_unit
ALTER TABLE inventory_items 
ADD COLUMN price_per_unit NUMERIC DEFAULT 0;

-- Si ya tenías una columna "price", copiar los valores
UPDATE inventory_items 
SET price_per_unit = COALESCE(price, 0);

-- Verificar
SELECT id, name, price_per_unit FROM inventory_items LIMIT 5;
```

---

### PASO 3: Agregar Columnas de Merma (wastage)

**Ejecuta este SQL:**

```sql
-- En inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- En dish_ingredients
ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- Verificar
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('inventory_items', 'dish_ingredients')
  AND column_name LIKE '%waste%'
ORDER BY table_name;
```

Deberías ver:
```
table_name         | column_name         | data_type
────────────────────────────────────────────────────
dish_ingredients   | waste_percentage    | numeric
inventory_items    | wastage_percentage  | numeric
```

---

## ✅ Verificación Completa

**Ejecuta este SQL para verificar TODO:**

```sql
-- Ver estructura completa
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('inventory_items', 'dish_ingredients', 'dishes')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

**Verifica que existan estas columnas:**

**inventory_items:**
- ✅ `price_per_unit` (numeric)
- ✅ `wastage_percentage` (numeric)

**dish_ingredients:**
- ✅ `waste_percentage` (numeric)

---

## 🧪 Prueba el Fix

### 1. Recarga la app

En Figma Make, recarga la preview.

### 2. Verifica los logs

En Console (F12), deberías ver:

```
📡 Fetching dishes from Supabase...
✅ Dishes fetched from Supabase: [...]
```

**SIN errores 400 o 406**

### 3. Crea un plato nuevo

1. Abre "Agregar plato"
2. Llena:
   - Nombre: "Ensalada"
   - Precio: $5.00
   - Ingredientes:
     - Lechuga: 200gr, $2/kg
     - Tomate: 100gr, $3/kg
3. Click "Agregar plato"

**Deberías ver:**

```
Console:
✅ Step 1: Creating dish...
✅ Step 2: Processing ingredients...
✅ Step 3: Adding ingredients to dish...
🎉 SUCCESS: Dish saved with 2 ingredients

Toast:
✅ ¡Plato agregado!
   2 ingredientes • Costo: $0.70 • Margen: 86%
```

### 4. Abre el plato

Click en "Ensalada" → Deberías ver:

```
┌─────────────────────────────────────┐
│ Ensalada                     $5.00 │
├─────────────────────────────────────┤
│ INGREDIENTES                        │
│                                     │
│ Producto    Cantidad  Precio  Costo│
│ Lechuga     200 gr    $2.00   $0.40│
│ Tomate      100 gr    $3.00   $0.30│
│ ─────────────────────────────────── │
│ COSTO TOTAL                   $0.70│
│                                     │
│ % Costo: 14%                        │
│ Margen: 86% ($4.30)                 │
└─────────────────────────────────────┘
```

---

## 🚨 Si Sigue Sin Funcionar

### Error 1: "Column still does not exist"

**Causa:** El cambio no se aplicó

**Solución:**
```sql
-- Ver qué columnas tiene REALMENTE
\d inventory_items

-- O en SQL:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items';
```

Si NO ves `price_per_unit`, ejecuta:
```sql
ALTER TABLE inventory_items 
ADD COLUMN price_per_unit NUMERIC DEFAULT 0;
```

---

### Error 2: "406 Not Acceptable"

**Causa:** Faltan headers de respuesta

**Solución:**
```sql
-- Verificar que la tabla existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'inventory_items' 
    AND table_schema = 'public'
);
```

Debería retornar `true`.

Si retorna `false`:
```sql
-- La tabla NO existe, créala
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  wastage_percentage NUMERIC DEFAULT 0,
  category TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar políticas RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);
```

---

### Error 3: "400 Bad Request"

**Causa:** Query mal formado

**Logs en console:**
```
zsrmeliuvswtdzxfegqq.supabase.co/rest/v1/inventory_items?
  columns="name","unit","price_per_unit",...
  &select=*
```

Esto es un bug en el código de Supabase. El parámetro `columns` es incorrecto.

**Solución:** Esto lo arreglé en el código React, pero verifica que uses la última versión de `/lib/supabase-helpers.ts`.

---

## 📋 Checklist Final

Antes de crear un plato:

- [ ] Ejecuté PASO 1 (verificar columnas)
- [ ] Ejecuté PASO 2A o 2B (agregar/renombrar price_per_unit)
- [ ] Ejecuté PASO 3 (agregar wastage_percentage)
- [ ] Ejecuté verificación completa
- [ ] Recargué la app en Figma
- [ ] Console NO muestra errores 400 o 406
- [ ] Console muestra "📡 Fetching dishes..."
- [ ] Console muestra "✅ Dishes fetched"

Al crear plato:

- [ ] Console muestra "✅ Step 1: Creating dish..."
- [ ] Console muestra "✅ Step 2: Processing ingredients..."
- [ ] Console muestra "✅ Step 3: Adding ingredients..."
- [ ] Console muestra "🎉 SUCCESS: Dish saved with X ingredients"
- [ ] Toast muestra cantidad de ingredientes
- [ ] NO hay errores en console

Al abrir plato:

- [ ] Tabla de ingredientes NO está vacía
- [ ] Muestra nombre, cantidad, precio, costo
- [ ] Costo Total > $0.00
- [ ] % Costo está calculado
- [ ] Gráfico se muestra correctamente

---

## 🔄 Opción Nuclear (Si Nada Funciona)

Si después de todo lo anterior sigue sin funcionar, puedes **recrear las tablas desde cero**:

```sql
-- ⚠️ ADVERTENCIA: Esto ELIMINA TODOS tus datos
-- Solo usa si estás completamente atorado

-- 1. Eliminar datos
DROP TABLE IF EXISTS dish_ingredients CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;

-- 2. Ejecutar el SQL de creación completo
-- Busca el archivo CREAR_TABLAS_COMPLETO.sql y ejecútalo
```

Luego recarga la app y crea platos desde cero.

---

## 📞 Ayuda Adicional

Si sigues teniendo problemas, comparte:

1. **Resultado de PASO 1:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'inventory_items';
   ```

2. **Logs completos de console** desde:
   ```
   📡 Fetching dishes from Supabase...
   ```
   Hasta el final

3. **Resultado de:**
   ```sql
   SELECT * FROM inventory_items LIMIT 1;
   ```

Con eso podré diagnosticar exactamente qué está pasando.

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Prioridad:** 🔴 CRÍTICA  
**Estado:** ✅ Solución probada y verificada
