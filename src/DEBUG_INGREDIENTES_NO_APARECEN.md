# 🐛 DEBUG: Ingredientes No Aparecen

## 🔴 Problema

Después del fix de `price` → `price_per_unit`, los ingredientes que ya existían dejaron de aparecer en los platos.

---

## 🔍 Diagnóstico Paso a Paso

### 1. **Abre DevTools → Console** (F12)

Deberías ver estos logs automáticamente cuando la app carga:

```
📡 Fetching dishes from Supabase...
✅ Dishes fetched from Supabase: [Array de platos]
📊 Dishes count: 3
  📍 Dish "Pepito Lito": {
    id: "...",
    ingredients_count: 3,
    ingredients: [...]
  }
  📍 Dish "Pizza": {
    id: "...",
    ingredients_count: 2,
    ingredients: [...]
  }
```

---

### 2. **Verifica los Logs de Transformación**

Después de los logs anteriores, deberías ver:

```
🔍 dishesFromSupabase RAW: [Array de platos]
🔍 Processing dish: Pepito Lito {
  dish_ingredients: [...],
  ingredients_count: 3
}
  🔍 Processing ingredient: {
    raw_ing: {...},
    inventory_item: {...},
    name: "Pan",
    price_per_unit: 3.00,
    quantity: 0.1,
    unit: "kg",
    waste_percentage: 0
  }
  🔍 Processing ingredient: {
    raw_ing: {...},
    inventory_item: {...},
    name: "Carne",
    price_per_unit: 8.00,
    ...
  }
  ✅ Final ingredients for Pepito Lito: [
    {name: "Pan", quantity: "0.1", unit: "kg", price: "3", wastePercentage: "0"},
    {name: "Carne", quantity: "0.2", unit: "kg", price: "8", wastePercentage: "5"},
    ...
  ]
```

---

## 🧪 Casos Posibles

### Caso 1: `inventory_item` es `null`

**Logs que verás:**
```
🔍 Processing ingredient: {
  raw_ing: {...},
  inventory_item: null,     // ❌ PROBLEMA
  name: "",
  price_per_unit: undefined,
  quantity: 0.1,
  unit: "kg"
}
```

**Causa:**
- El `dish_ingredient` existe en la BD
- Pero el `inventory_item_id` apunta a un item que no existe
- O el join no funcionó

**Solución SQL:**
```sql
-- Verificar dish_ingredients sin inventory_item
SELECT 
  di.id,
  di.dish_id,
  di.inventory_item_id,
  di.quantity,
  di.unit,
  d.name as dish_name,
  i.name as inventory_item_name
FROM dish_ingredients di
JOIN dishes d ON d.id = di.dish_id
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE di.user_id = auth.uid()
  AND i.id IS NULL;  -- Encuentra los que NO tienen inventory_item
```

**Si encuentra filas:**
```sql
-- Eliminar dish_ingredients huérfanos
DELETE FROM dish_ingredients
WHERE user_id = auth.uid()
  AND inventory_item_id NOT IN (
    SELECT id FROM inventory_items WHERE user_id = auth.uid()
  );
```

---

### Caso 2: `dish_ingredients` está vacío

**Logs que verás:**
```
🔍 Processing dish: Pepito Lito {
  dish_ingredients: [],        // ❌ PROBLEMA
  ingredients_count: 0
}
```

**Causa:**
- El plato existe pero no tiene ingredientes en `dish_ingredients`
- Fueron borrados o nunca se guardaron

**Solución SQL:**
```sql
-- Ver platos sin ingredientes
SELECT 
  d.id,
  d.name,
  d.price,
  d.created_at,
  COUNT(di.id) as ingredients_count
FROM dishes d
LEFT JOIN dish_ingredients di ON di.dish_id = d.id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name, d.price, d.created_at
HAVING COUNT(di.id) = 0
ORDER BY d.created_at DESC;
```

**Acción:**
- Estos platos deben tener ingredientes agregados manualmente
- O eliminarlos y recrearlos

---

### Caso 3: `price_per_unit` es `null`

**Logs que verás:**
```
🔍 Processing ingredient: {
  raw_ing: {...},
  inventory_item: {
    id: "...",
    name: "Pan",
    price_per_unit: null,    // ❌ PROBLEMA
    unit: "kg"
  },
  name: "Pan",
  price_per_unit: null,
  ...
}
```

**Causa:**
- El `inventory_item` existe pero `price_per_unit` es NULL
- Posiblemente se guardó con un bug anterior

**Solución SQL:**
```sql
-- Ver inventory_items sin precio
SELECT 
  id,
  name,
  unit,
  price_per_unit,
  created_at
FROM inventory_items
WHERE user_id = auth.uid()
  AND (price_per_unit IS NULL OR price_per_unit = 0)
ORDER BY created_at DESC;
```

**Si encuentra items sin precio:**
```sql
-- Opción 1: Eliminar items sin precio (si no tienen platos asociados)
DELETE FROM inventory_items
WHERE user_id = auth.uid()
  AND (price_per_unit IS NULL OR price_per_unit = 0)
  AND id NOT IN (
    SELECT DISTINCT inventory_item_id 
    FROM dish_ingredients 
    WHERE user_id = auth.uid()
  );

-- Opción 2: Actualizar con precio por defecto (0.01 para que no sea 0)
UPDATE inventory_items
SET price_per_unit = 0.01
WHERE user_id = auth.uid()
  AND (price_per_unit IS NULL OR price_per_unit = 0);
```

---

### Caso 4: Query de Supabase Falla

**Logs que verás:**
```
📡 Fetching dishes from Supabase...
❌ Error fetching dishes: {message: "..."}
```

**Causa:**
- Error de permisos RLS
- Error en el query
- Campo no existe en la tabla

**Solución:**

**Verificar permisos RLS:**
```sql
-- Ver políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('dishes', 'dish_ingredients', 'inventory_items')
ORDER BY tablename, policyname;
```

**Crear políticas si faltan:**
```sql
-- Dishes
CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

-- Dish Ingredients
CREATE POLICY "Users can view own dish ingredients"
  ON dish_ingredients FOR SELECT
  USING (auth.uid() = user_id);

-- Inventory Items
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);
```

**Verificar estructura de tablas:**
```sql
-- Ver columnas de inventory_items
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Debe incluir:**
- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `price_per_unit` (numeric) ← **Importante**
- `unit` (text)
- `wastage_percentage` (numeric)
- `created_at` (timestamp)

---

## 🎯 Queries de Diagnóstico Completo

### Query 1: Vista Completa de Platos e Ingredientes

```sql
SELECT 
  d.name as plato,
  d.price as precio_venta,
  di.quantity as cantidad,
  di.unit as unidad,
  i.name as ingrediente,
  i.price_per_unit as precio_por_unidad,
  i.unit as unidad_inventario,
  di.waste_percentage as merma,
  (di.quantity * i.price_per_unit) as costo
FROM dishes d
LEFT JOIN dish_ingredients di ON di.dish_id = d.id
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.user_id = auth.uid()
ORDER BY d.name, i.name;
```

**Resultado esperado:**
```
plato           | precio_venta | cantidad | unidad | ingrediente | precio_por_unidad | costo
─────────────────────────────────────────────────────────────────────────────────────────────
Pepito Lito     | 6.00         | 0.100    | kg     | Pan         | 3.00              | 0.30
Pepito Lito     | 6.00         | 0.200    | kg     | Carne       | 8.00              | 1.60
Pizza Margarita | 10.00        | 0.500    | kg     | Harina      | 2.00              | 1.00
Pizza Margarita | 10.00        | 0.200    | kg     | Queso       | 8.00              | 1.60
```

**Si algún campo es NULL:**
- `ingrediente` NULL → problema en `dish_ingredients.inventory_item_id`
- `precio_por_unidad` NULL → problema en `inventory_items.price_per_unit`
- `cantidad` NULL → problema en `dish_ingredients.quantity`

---

### Query 2: Resumen por Plato

```sql
SELECT 
  d.id,
  d.name as plato,
  d.price as precio,
  COUNT(di.id) as num_ingredientes,
  SUM(di.quantity * COALESCE(i.price_per_unit, 0)) as costo_total,
  d.price - SUM(di.quantity * COALESCE(i.price_per_unit, 0)) as beneficio,
  CASE 
    WHEN d.price > 0 THEN 
      ((d.price - SUM(di.quantity * COALESCE(i.price_per_unit, 0))) / d.price * 100)
    ELSE 0
  END as margen_porcentaje
FROM dishes d
LEFT JOIN dish_ingredients di ON di.dish_id = d.id
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name, d.price
ORDER BY d.created_at DESC;
```

**Resultado esperado:**
```
plato           | precio | num_ingredientes | costo_total | beneficio | margen_porcentaje
─────────────────────────────────────────────────────────────────────────────────────────────
Pizza Margarita | 10.00  | 2                | 2.60        | 7.40      | 74.0
Pepito Lito     | 6.00   | 3                | 2.00        | 4.00      | 66.7
```

**Si costo_total = 0 pero num_ingredientes > 0:**
- Todos los `price_per_unit` son NULL o 0
- Ejecuta Query 3 para ver detalles

---

### Query 3: Ingredientes con Problemas

```sql
-- Ingredientes sin precio o con precio 0
SELECT 
  i.id,
  i.name,
  i.price_per_unit,
  i.unit,
  i.wastage_percentage,
  i.created_at,
  COUNT(di.id) as used_in_dishes
FROM inventory_items i
LEFT JOIN dish_ingredients di ON di.inventory_item_id = i.id
WHERE i.user_id = auth.uid()
  AND (i.price_per_unit IS NULL OR i.price_per_unit = 0)
GROUP BY i.id, i.name, i.price_per_unit, i.unit, i.wastage_percentage, i.created_at
ORDER BY used_in_dishes DESC, i.created_at DESC;
```

**Si encuentra items:**
- `used_in_dishes = 0` → Puedes eliminarlos
- `used_in_dishes > 0` → Debes actualizar el precio

---

## 🛠️ Soluciones Rápidas

### Solución 1: Limpiar Todo y Empezar de Cero

```sql
-- ⚠️ ADVERTENCIA: Esto elimina TODOS tus platos e ingredientes
-- Solo úsalo si quieres empezar completamente de cero

-- Eliminar ingredientes de platos
DELETE FROM dish_ingredients WHERE user_id = auth.uid();

-- Eliminar platos
DELETE FROM dishes WHERE user_id = auth.uid();

-- Eliminar inventario
DELETE FROM inventory_items WHERE user_id = auth.uid();
```

Después de esto, crea platos nuevos desde cero usando el formulario.

---

### Solución 2: Arreglar Datos Existentes

```sql
-- Paso 1: Eliminar dish_ingredients huérfanos (sin inventory_item)
DELETE FROM dish_ingredients
WHERE user_id = auth.uid()
  AND inventory_item_id NOT IN (
    SELECT id FROM inventory_items WHERE user_id = auth.uid()
  );

-- Paso 2: Actualizar inventory_items sin precio
UPDATE inventory_items
SET price_per_unit = 1.00  -- Precio por defecto
WHERE user_id = auth.uid()
  AND (price_per_unit IS NULL OR price_per_unit = 0);

-- Paso 3: Verificar que todo esté bien
SELECT 
  d.name as plato,
  COUNT(di.id) as ingredientes,
  SUM(di.quantity * i.price_per_unit) as costo
FROM dishes d
LEFT JOIN dish_ingredients di ON di.dish_id = d.id
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name
ORDER BY d.name;
```

---

### Solución 3: Recrear un Plato Específico

Si un plato específico tiene problemas:

```sql
-- 1. Ver ingredientes actuales del plato
SELECT 
  di.*,
  i.name,
  i.price_per_unit
FROM dish_ingredients di
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE di.dish_id = 'DISH_ID_AQUI'
  AND di.user_id = auth.uid();

-- 2. Si tiene ingredientes pero sin inventory_item, eliminarlos
DELETE FROM dish_ingredients
WHERE dish_id = 'DISH_ID_AQUI'
  AND user_id = auth.uid();

-- 3. Eliminar el plato
DELETE FROM dishes
WHERE id = 'DISH_ID_AQUI'
  AND user_id = auth.uid();

-- 4. Crear el plato de nuevo usando el formulario
```

---

## 📋 Checklist de Debugging

### En Console (F12)

- [ ] Console muestra "📡 Fetching dishes from Supabase..."
- [ ] Console muestra "✅ Dishes fetched from Supabase"
- [ ] Dishes count > 0
- [ ] Cada dish tiene `ingredients_count` > 0
- [ ] Console muestra "🔍 Processing dish:" para cada plato
- [ ] Console muestra "🔍 Processing ingredient:" para cada ingrediente
- [ ] Cada ingrediente tiene `name`, `price_per_unit`, `quantity`
- [ ] NO hay ingredientes con `inventory_item: null`
- [ ] NO hay ingredientes con `price_per_unit: null`
- [ ] Console muestra "✅ Final ingredients" con array lleno

### En Supabase (SQL Editor)

- [ ] Query 1 muestra todos los platos con ingredientes
- [ ] Todos los campos tienen valores (no NULL)
- [ ] Query 2 muestra `num_ingredientes` > 0 para platos que deben tenerlos
- [ ] Query 2 muestra `costo_total` > 0
- [ ] Query 3 NO encuentra ingredientes sin precio
- [ ] Todas las tablas tienen políticas RLS activas

### En la UI

- [ ] Platos aparecen en la lista
- [ ] Al abrir un plato, muestra la ficha
- [ ] La tabla de ingredientes NO está vacía
- [ ] Costo Total > $0.00
- [ ] % Costo está calculado correctamente
- [ ] Gráfico muestra proporción correcta

---

## 🚨 Si Nada Funciona

Si después de todo lo anterior los ingredientes siguen sin aparecer:

1. **Comparte los logs de console completos:**
   - Copia todo lo que aparece desde "📡 Fetching dishes"
   - Incluyendo todos los "🔍 Processing ingredient"

2. **Ejecuta y comparte resultado de Query 1:**
   ```sql
   SELECT 
     d.name as plato,
     di.quantity,
     di.unit,
     i.name as ingrediente,
     i.price_per_unit
   FROM dishes d
   LEFT JOIN dish_ingredients di ON di.dish_id = d.id
   LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
   WHERE d.user_id = auth.uid()
   ORDER BY d.name;
   ```

3. **Verifica que el campo existe:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'inventory_items'
     AND column_name = 'price_per_unit';
   ```
   Debe retornar: `price_per_unit | numeric`

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Estado:** 🔍 Debugging en proceso  
**Prioridad:** 🔴 Alta
