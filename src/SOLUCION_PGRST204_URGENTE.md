# 🚨 SOLUCIÓN URGENTE - Error PGRST204

## El Problema

```
Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache
```

Este error significa que **PostgREST (la API de Supabase) NO ha actualizado su cache** después de agregar la columna.

---

## ✅ SOLUCIÓN EN 3 PASOS

### PASO 1: Ejecutar SQL en Supabase

**Ve a Supabase → SQL Editor y ejecuta esto:**

```sql
-- 1. Agregar columna si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- 2. RECARGAR SCHEMA CACHE (CRÍTICO)
NOTIFY pgrst, 'reload schema';

-- 3. Verificar que existe
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name = 'wastage_percentage';
```

**Resultado esperado:**
```
column_name         | data_type | column_default
─────────────────────────────────────────────
wastage_percentage  | numeric   | 0
```

✅ Si ves esto, continúa al PASO 2.

---

### PASO 2: Reiniciar PostgREST (Si PASO 1 no funciona)

**En Supabase Dashboard:**

1. Ve a **Settings** (⚙️ abajo a la izquierda)
2. Click **API**
3. En la sección **PostgREST**, busca el botón **"Restart"**
4. Click **Restart PostgREST**
5. **Espera 30 segundos**

---

### PASO 3: Recarga la App

1. **En Figma Make:**
   - Presiona **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac)

2. **Abre Console (F12)**

3. **Intenta crear un plato de nuevo**

---

## 🧪 PRUEBA

**Crea un plato con ingredientes opcionales:**

1. Click **"Agregar plato"**

2. Llena:
   - **Nombre:** "Sandwich de Jamón"
   - **Precio:** $50.00
   - **Categoría:** "Entradas"

3. **Ingredientes:**
   - **Pan:** 100gr, $30/kg, merma 0% (dejar vacío)
   - **Jamón:** 50gr, $80/kg, merma 5%
   - **Queso:** 30gr, $100/kg, merma 0% (dejar vacío)

4. Click **"Agregar plato"**

5. **Verifica en Console:**

✅ Deberías ver:
```
✅ Step 1: Creating dish...
✅ Step 2: Processing ingredients...
  ✅ Step 2.1: Finding/creating inventory item for "Pan"...
  ✅ Step 2.1 Complete: Inventory item
  ✅ Step 2.2: Finding/creating inventory item for "Jamón"...
  ✅ Step 2.2 Complete: Inventory item
  ✅ Step 2.3: Finding/creating inventory item for "Queso"...
  ✅ Step 2.3 Complete: Inventory item
✅ Step 3: Adding ingredients to dish...
🎉 SUCCESS: Dish saved with 3 ingredients
```

❌ NO deberías ver:
```
PGRST204
Could not find the 'wastage_percentage' column
```

---

## 🔍 VERIFICACIÓN ADICIONAL

Si el error persiste, ejecuta esto en SQL:

```sql
-- Ver schema que PostgREST está usando
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'inventory_items'
ORDER BY ordinal_position;
```

**Deberías ver TODAS estas columnas:**
```
inventory_items | id                  | uuid
inventory_items | user_id             | uuid
inventory_items | name                | text
inventory_items | unit                | text
inventory_items | price_per_unit      | numeric  ← DEBE EXISTIR
inventory_items | wastage_percentage  | numeric  ← DEBE EXISTIR
inventory_items | category            | text
inventory_items | emoji               | text
inventory_items | created_at          | timestamp with time zone
```

Si **NO ves `price_per_unit` o `wastage_percentage`**, ejecuta:

```sql
-- Agregar columnas faltantes
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- Si tenías columna "price" (sin _per_unit), copiar valores
UPDATE inventory_items 
SET price_per_unit = COALESCE(price, 0)
WHERE price_per_unit = 0 AND price IS NOT NULL;

-- Recargar schema
NOTIFY pgrst, 'reload schema';
```

---

## 🆘 Si NADA Funciona

### Opción Nuclear: Recrear la tabla

⚠️ **ADVERTENCIA:** Esto eliminará todos tus ingredientes guardados.

```sql
-- 1. Hacer backup
CREATE TABLE inventory_items_backup AS 
SELECT * FROM inventory_items;

-- 2. Ver cuántos registros tienes
SELECT COUNT(*) FROM inventory_items;

-- 3. Eliminar tabla
DROP TABLE inventory_items CASCADE;

-- 4. Recrear tabla correcta
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  wastage_percentage NUMERIC DEFAULT 0,
  category TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- 7. Restaurar datos (si tenías)
-- INSERT INTO inventory_items SELECT * FROM inventory_items_backup;

-- 8. Recargar schema
NOTIFY pgrst, 'reload schema';

-- 9. Eliminar backup
DROP TABLE inventory_items_backup;
```

---

## 📋 Checklist de Verificación

Antes de crear plato:

- [ ] Ejecuté `ALTER TABLE ... ADD COLUMN wastage_percentage`
- [ ] Ejecuté `NOTIFY pgrst, 'reload schema'`
- [ ] O reinicié PostgREST desde Dashboard
- [ ] Recargué la app (Ctrl+Shift+R)
- [ ] Console NO muestra errores PGRST204
- [ ] SELECT muestra la columna `wastage_percentage`

Al crear plato:

- [ ] Console muestra "✅ Step 1: Creating dish..."
- [ ] Console muestra "✅ Step 2: Processing ingredients..."
- [ ] Console muestra "🎉 SUCCESS: Dish saved"
- [ ] NO hay errores PGRST204
- [ ] Toast muestra "¡Plato agregado!"

---

## ✅ Cambios en el Código

He modificado el código para que:

1. **NO envíe `wastage_percentage`** si es 0 o undefined
2. **NO envíe `waste_percentage`** en dish_ingredients si es 0
3. **Solo envíe campos opcionales** cuando tienen valor

Esto hace que la app sea más robusta y no dependa de que las columnas existan si no se usan.

---

## 🎯 Resultado Esperado

Después de seguir estos pasos:

```
✅ Plato creado: "Sandwich de Jamón"
✅ Ingredientes: 3
✅ Costo calculado: $8.90
✅ Margen: 82%
```

**Sin errores PGRST204** ✅

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 2-5 minutos
