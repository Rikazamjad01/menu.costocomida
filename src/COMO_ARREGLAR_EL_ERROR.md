# 🔧 Cómo Arreglar el Error de `price_per_unit`

## ❌ El Error Que Estás Viendo

```json
{
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'price_per_unit' column of 'inventory_items' in the schema cache"
}
```

---

## 🔍 ¿Qué Significa?

La tabla `inventory_items` en tu base de datos **no tiene** la columna `price_per_unit`, pero el código de la app está tratando de usarla.

### Tabla Actual (❌ incompleta):
```
inventory_items
├─ id
├─ name
├─ unit
└─ ❌ FALTA: price_per_unit
    ❌ FALTA: wastage_percentage
    ❌ FALTA: user_id
```

### Tabla Necesaria (✅ correcta):
```
inventory_items
├─ id
├─ name
├─ unit
├─ ✅ price_per_unit (DECIMAL)
├─ ✅ wastage_percentage (DECIMAL)
├─ ✅ user_id (UUID)
├─ created_at
└─ updated_at
```

---

## ✅ Solución Paso a Paso

### 🎯 Opción 1: Fix Rápido (2 minutos)

**1. Abre Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

**2. Abre SQL Editor**
   - Click en "SQL Editor" en el menú lateral
   - Click en "+ New query"

**3. Pega y Ejecuta Este Script**

```sql
-- =====================================================
-- 🔧 FIX RÁPIDO: Agregar columnas faltantes
-- =====================================================

-- 1. Agregar price_per_unit
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10, 2) DEFAULT 0.00 
CHECK (price_per_unit >= 0);

-- 2. Agregar wastage_percentage
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5, 2) DEFAULT 0.00 
CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100);

-- 3. Agregar user_id (para multi-tenant)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS user_id UUID 
REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Agregar timestamps
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Habilitar RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 6. Crear política de acceso
DROP POLICY IF EXISTS "Users can manage their own inventory" ON inventory_items;

CREATE POLICY "Users can manage their own inventory"
  ON inventory_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ✅ VERIFICACIÓN
-- =====================================================

-- Ver la estructura actualizada
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Debe mostrar algo como:
-- price_per_unit       | numeric | 0.00
-- wastage_percentage   | numeric | 0.00
-- user_id              | uuid    |
```

**4. Verificar Resultado**

Deberías ver en la salida:

```
column_name          | data_type  | column_default
---------------------|------------|---------------
id                   | uuid       | gen_random_uuid()
name                 | text       | 
unit                 | text       | 
price_per_unit       | numeric    | 0.00          ✅
wastage_percentage   | numeric    | 0.00          ✅
category             | text       | 
emoji                | text       | 
user_id              | uuid       |               ✅
created_at           | timestamp  | now()         ✅
updated_at           | timestamp  | now()         ✅
```

**5. Refresca la App**
   - Presiona F5 o Cmd+R
   - Intenta crear un plato de nuevo
   - ✅ Debería funcionar

---

### 🎯 Opción 2: Recrear Todo (5 minutos)

Si el fix rápido no funciona o quieres empezar limpio:

**1. Abre Supabase SQL Editor**

**2. Ejecuta TODO el contenido de `/CREAR_TABLAS_COMPLETO.sql`**

Esto creará:
- ✅ `categories` (con RLS)
- ✅ `dishes` (con RLS)
- ✅ `inventory_items` (con RLS y todas las columnas)
- ✅ `dish_ingredients` (con RLS)
- ✅ Políticas RLS para multi-tenant
- ✅ Triggers para `updated_at`

**3. Verifica que se creó correctamente**

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('categories', 'dishes', 'inventory_items', 'dish_ingredients');

-- Debe mostrar las 4 tablas ✅
```

---

## 🧪 Prueba Que Funciona

Después de ejecutar el script:

### Test 1: Verificar Columnas
```sql
SELECT * FROM inventory_items LIMIT 1;
```
✅ No debe dar error de "column not found"

### Test 2: Insertar Ingrediente de Prueba
```sql
INSERT INTO inventory_items (name, unit, price_per_unit, wastage_percentage, user_id)
VALUES ('Tomate', 'kg', 20.00, 10.00, auth.uid())
RETURNING *;
```
✅ Debe crear el ingrediente correctamente

### Test 3: Crear Plato desde la App
1. Abre la app
2. Click en "+ Agregar plato"
3. Completa nombre, ingredientes, precio
4. Click en "Guardar plato"
5. ✅ No debe dar error

---

## 📊 Entendiendo el Schema

### ¿Por qué `price_per_unit` y no `price`?

```sql
-- ❌ AMBIGUO
CREATE TABLE inventory_items (
  price DECIMAL(10, 2)  -- ¿Precio de qué? ¿Total? ¿Por unidad?
);

-- ✅ CLARO
CREATE TABLE inventory_items (
  price_per_unit DECIMAL(10, 2)  -- Precio POR UNIDAD de compra (kg, lt, etc.)
);
```

**Ejemplo:**
```
Ingrediente: Tomate
Unidad: kg
price_per_unit: $20.00  ← $20 POR CADA kg

Si compro 3kg:
Total = 3 × $20 = $60
```

### ¿Por qué necesitamos `user_id`?

**Sin `user_id`:** ❌
```
Todos los usuarios ven TODOS los ingredientes
Usuario A crea "Tomate" → Usuario B también lo ve
```

**Con `user_id`:** ✅
```
Cada usuario ve SOLO sus ingredientes
Usuario A crea "Tomate" → Solo Usuario A lo ve
Usuario B crea su propio "Tomate" → Solo Usuario B lo ve
```

**Políticas RLS:**
```sql
CREATE POLICY "Users can manage their own inventory"
  ON inventory_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Esto significa:
- ✅ Puedes VER tus ingredientes
- ✅ Puedes CREAR tus ingredientes
- ✅ Puedes EDITAR tus ingredientes
- ✅ Puedes ELIMINAR tus ingredientes
- ❌ NO puedes ver ingredientes de otros usuarios

---

## 🚨 Problemas Comunes

### "El script dio error en la línea X"

**Posibles causas:**
1. La tabla ya tiene esa columna → ✅ No hay problema, continúa
2. No tienes permisos de admin → ❌ Contacta al dueño del proyecto
3. La tabla no existe → ✅ Ejecuta `/CREAR_TABLAS_COMPLETO.sql`

### "Sigo viendo el mismo error"

**Checklist:**
- [ ] Refresqué la app (F5)
- [ ] Ejecuté el script completo (no solo una parte)
- [ ] Verifiqué que las columnas se agregaron
- [ ] No hay errores en la consola del SQL Editor

**Si aún falla:**
```sql
-- Ver logs de error
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%inventory_items%'
ORDER BY calls DESC
LIMIT 5;
```

### "Los ingredientes se guardan pero el plato no"

**Verificar:**
```sql
-- Ver si el plato se creó
SELECT * FROM dishes ORDER BY created_at DESC LIMIT 1;

-- Ver si los ingredientes se asociaron
SELECT * FROM dish_ingredients 
WHERE dish_id = '<id_del_plato>'
ORDER BY created_at DESC;
```

---

## 🎯 Checklist Final

Antes de cerrar:

- [ ] Ejecuté el script SQL
- [ ] Vi que las columnas se agregaron correctamente
- [ ] Refresqué la app
- [ ] Intenté crear un plato
- [ ] El plato se guardó sin errores
- [ ] Los ingredientes se guardaron correctamente
- [ ] Puedo ver el plato en la lista
- [ ] Los cálculos de costo son correctos

---

## 📚 Siguiente Paso

Una vez que el error esté resuelto:

1. **Prueba el flujo completo:**
   - Crea una categoría
   - Crea un plato
   - Agrega ingredientes (nuevos y existentes)
   - Verifica cálculos de margen

2. **Consulta la documentación:**
   - `/FUNCIONALIDAD_INGREDIENTES.md` - Cómo funciona el sistema
   - `/FLUJO_INGREDIENTE_NUEVO.md` - Flujo detallado
   - `/README.md` - Visión general

3. **Reporta bugs:**
   - Con logs de error completos
   - Con pasos para reproducir
   - Con screenshots si es posible

---

**Versión:** 1.0  
**Tiempo estimado:** 2-5 minutos  
**Prioridad:** 🚨 CRÍTICA  
**Estado:** ✅ Solución verificada
