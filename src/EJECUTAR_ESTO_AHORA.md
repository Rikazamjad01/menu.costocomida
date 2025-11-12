# 🚨 ACCIÓN INMEDIATA REQUERIDA

## ❌ Error Actual
```
Could not find the 'price_per_unit' column of 'inventory_items' 
in the schema cache
```

## 🔍 Diagnóstico
La tabla `inventory_items` existe pero **le falta la columna** `price_per_unit`.

## ✅ Solución en 3 Pasos

### 📝 PASO 1: Abre Supabase SQL Editor
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en "SQL Editor" en el menú lateral izquierdo
3. Click en "+ New query"

---

### 🔧 PASO 2: Ejecuta Este Script

Copia y pega TODO el contenido de `/CREAR_TABLAS_COMPLETO.sql` en el editor y ejecuta:

**O si prefieres un fix rápido, ejecuta SOLO esto:**

```sql
-- =====================================================
-- 🔧 FIX RÁPIDO: Agregar columna faltante
-- =====================================================

-- Agregar price_per_unit si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10, 2) DEFAULT 0.00 CHECK (price_per_unit >= 0);

-- Agregar wastage_percentage si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100);

-- Agregar user_id si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar created_at si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Agregar updated_at si no existe
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verificar que se agregaron correctamente
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;
```

---

### ✅ PASO 3: Verificar
Deberías ver en los resultados algo como:

```
column_name          | data_type        | column_default
---------------------|------------------|------------------
id                   | uuid             | gen_random_uuid()
name                 | text             | 
unit                 | text             | 
price_per_unit       | numeric          | 0.00          ✅
wastage_percentage   | numeric          | 0.00          ✅
category             | text             | 'Ingrediente'
emoji                | text             | '🍴'
user_id              | uuid             |               ✅
created_at           | timestamp        | now()         ✅
updated_at           | timestamp        | now()         ✅
```

---

## 🎯 Después de Ejecutar el Script

1. **Refresca la app** (F5 o Cmd+R)
2. **Intenta crear un plato de nuevo**
3. **Debería funcionar** ✅

---

## 🔍 Si Aún Falla

### Error: "column price_per_unit still not found"

**Solución:**
```sql
-- Ver el schema exacto
SELECT * FROM inventory_items LIMIT 1;

-- Si la tabla está vacía o corrupta, recréala:
DROP TABLE IF EXISTS inventory_items CASCADE;

-- Luego ejecuta /CREAR_TABLAS_COMPLETO.sql
```

### Error: "permission denied"

**Solución:**
```sql
-- Verificar que RLS esté configurado
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso
CREATE POLICY "Users can manage their own inventory"
  ON inventory_items
  FOR ALL
  USING (auth.uid() = user_id);
```

### Error: "user_id cannot be null"

**Solución:**
```sql
-- Actualizar registros existentes con tu user_id
UPDATE inventory_items 
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Hacer user_id NOT NULL
ALTER TABLE inventory_items 
ALTER COLUMN user_id SET NOT NULL;
```

---

## 📊 Estado de las Tablas Necesarias

| Tabla | Columnas Críticas | Estado |
|-------|-------------------|--------|
| **inventory_items** | `price_per_unit`, `wastage_percentage` | ❌ FALTA |
| **dishes** | `name`, `category_id`, `price` | ✅ OK |
| **dish_ingredients** | `dish_id`, `inventory_item_id`, `quantity` | ✅ OK |
| **categories** | `name`, `emoji` | ✅ OK |

---

## 🎯 Checklist de Validación

Después de ejecutar el script, verifica:

- [ ] Puedo ejecutar: `SELECT * FROM inventory_items LIMIT 1;` sin error
- [ ] La tabla tiene columna `price_per_unit`
- [ ] La tabla tiene columna `wastage_percentage`
- [ ] La tabla tiene columna `user_id`
- [ ] Puedo crear un plato desde la app
- [ ] Los ingredientes se guardan correctamente
- [ ] No veo más errores en consola

---

## 💡 Entendiendo el Problema

### ¿Por qué pasó esto?

**Escenario probable:**
1. Alguien creó la tabla `inventory_items` manualmente
2. O se ejecutó un script antiguo que no incluía `price_per_unit`
3. El código de la app espera `price_per_unit` (nombre correcto)
4. Pero la tabla no tiene esa columna

### ¿Por qué `price_per_unit` y no `price`?

```sql
-- ❌ MAL (ambiguo)
price DECIMAL(10, 2)

-- ✅ BIEN (específico)
price_per_unit DECIMAL(10, 2)
```

`price_per_unit` es más claro porque especifica que es el precio **por unidad de compra** (kg, lt, etc.), no el precio total ni el precio de venta.

---

## 🚀 Una Vez Corregido

Podrás:
- ✅ Crear ingredientes nuevos
- ✅ Seleccionar ingredientes existentes
- ✅ Auto-rellenar precio y merma
- ✅ Guardar platos completos
- ✅ Calcular costos con doble merma
- ✅ Ver rentabilidad por plato

---

**Versión:** 1.0  
**Prioridad:** 🚨 CRÍTICA  
**Tiempo estimado:** 2 minutos  
**Siguiente paso:** Ejecutar script y probar app
