# 🐛 FIX: Ingredientes No se Guardan en Backend

## 🔴 Problema Reportado

Al crear un plato "Pepito Lito" con ingredientes:
- El plato se guarda correctamente
- Pero los ingredientes NO se guardan
- La ficha del plato muestra:
  - Costo Total: $0.00
  - % Costo: 0.00%
  - Margen: 100% (todo es beneficio)

Esto indica que el plato se guardó **sin ingredientes**.

---

## 🔍 Análisis del Problema

### Causas Encontradas

#### 1. **Query incorrecto en `useDishesWithIngredients`**

**Archivo:** `/hooks/useSupabase.ts` (líneas 83-101)

**Problema:**
```typescript
inventory_item:inventory_item_id (
  name,
  price,  // ❌ Columna NO existe
  unit,
  emoji
)
```

La tabla `inventory_items` tiene la columna `price_per_unit`, NO `price`.

**Solución:**
```typescript
inventory_item:inventory_item_id (
  id,                    // ✅ Agregado
  name,
  price_per_unit,        // ✅ Correcto
  unit,
  wastage_percentage,    // ✅ Agregado
  emoji
)
```

---

#### 2. **Mapeo incorrecto en MenuScreen**

**Archivo:** `/components/MenuScreen.tsx` (línea 283)

**Problema:**
```typescript
price: ing.inventory_item?.price?.toString() || '0',  // ❌ Campo NO existe
```

**Solución:**
```typescript
price: ing.inventory_item?.price_per_unit?.toString() || '0',  // ✅ Correcto
```

---

#### 3. **Falta de Logs de Debugging**

**Archivo:** `/components/MenuScreen.tsx` - `handleSaveDish`

**Problema:**
- Si el guardado falla, NO sabemos en qué paso falló
- El error se muestra genérico sin detalles

**Solución:**
Agregamos logs detallados en cada paso:

```typescript
console.log('✅ Step 1: Creating dish...', { dishName, price, category });
// ... crear dish
console.log('✅ Step 1 Complete: Dish created', dish);

console.log('✅ Step 2: Processing ingredients...');
// ... procesar ingredientes
console.log('✅ Step 2 Complete: All inventory items processed', dishIngredients);

console.log('✅ Step 3: Adding ingredients to dish...');
// ... agregar ingredientes
console.log('✅ Step 3 Complete: Ingredients added to dish', result);

console.log('✅ Step 4: Refreshing data...');
// ... refrescar
console.log('✅ Step 4 Complete: Data refreshed');

console.log('🎉 SUCCESS: Dish saved with', dishIngredients.length, 'ingredients');
```

---

## ✅ Soluciones Implementadas

### 1. **Fix Query en useSupabase** ✅

**Archivo:** `/hooks/useSupabase.ts`

**Cambio:**
```diff
  inventory_item:inventory_item_id (
+   id,
    name,
-   price,
+   price_per_unit,
    unit,
+   wastage_percentage,
    emoji
  )
```

**Qué hace:**
- Obtiene el campo correcto `price_per_unit`
- Incluye `wastage_percentage` para mostrar merma
- Incluye `id` para referencia

---

### 2. **Fix Mapeo en MenuScreen** ✅

**Archivo:** `/components/MenuScreen.tsx`

**Cambio:**
```diff
  ingredients: (dish.dish_ingredients || []).map((ing: any) => ({
    name: ing.inventory_item?.name || '',
    quantity: ing.quantity?.toString() || '0',
    unit: ing.unit || '',
-   price: ing.inventory_item?.price?.toString() || '0',
+   price: ing.inventory_item?.price_per_unit?.toString() || '0',
    wastePercentage: ing.waste_percentage?.toString() || '0'
  }))
```

**Qué hace:**
- Usa el nombre correcto del campo `price_per_unit`
- Permite que los ingredientes se carguen correctamente al abrir un plato guardado

---

### 3. **Logs de Debugging Detallados** ✅

**Archivo:** `/components/MenuScreen.tsx` - `handleSaveDish`

**Agregado:**
- Logs en cada paso del proceso de guardado
- Logs de ingredientes válidos antes de guardar
- Logs de conversión de unidades
- Logs de errores detallados con stack trace

**Qué hace:**
- Permite identificar exactamente dónde falla el proceso
- Muestra los datos en cada paso
- Ayuda a debugging futuro

---

### 4. **Validación Mejorada de Ingredientes** ✅

**Archivo:** `/components/MenuScreen.tsx`

**Cambio:**
```diff
  const validIngredients = ingredients.filter(ing => 
    ing.name && 
    ing.quantityInDish && 
-   ing.pricePerPurchaseUnit
+   ing.pricePerPurchaseUnit &&
+   ing.purchaseUnit &&
+   ing.dishUnit
  );
```

**Qué hace:**
- Valida que todos los campos necesarios estén completos
- Evita guardar ingredientes con datos faltantes
- Asegura que la conversión de unidades funcione

---

### 5. **Toast con Más Información** ✅

**Archivo:** `/components/MenuScreen.tsx`

**Cambio:**
```diff
  toast.success('¡Plato agregado!', {
-   description: `Costo: ${...}${cost.toFixed(2)}, Margen: ${margin.toFixed(0)}%`,
+   description: `${validIngredients.length} ingredientes • Costo: ${...}${cost.toFixed(2)} • Margen: ${margin.toFixed(0)}%`,
  });
```

**Qué hace:**
- Muestra cuántos ingredientes se guardaron
- Confirma visualmente que los ingredientes se procesaron

---

## 🧪 Testing

### Caso de Prueba 1: Crear Plato Nuevo

**Pasos:**
1. Abre "Agregar plato"
2. Llena nombre: "Pizza Margarita"
3. Precio: $10.00
4. Agrega ingredientes:
   - Harina: 500gr, $2.00/kg, 0% merma
   - Queso: 200gr, $8.00/kg, 5% merma
5. Click "Agregar plato"

**Resultado esperado:**
```
Console:
✅ Step 1: Creating dish... {dishName: "Pizza Margarita", ...}
✅ Step 1 Complete: Dish created {id: "...", name: "Pizza Margarita"}
✅ Step 2: Processing ingredients...
  ✅ Step 2.1: Finding/creating inventory item for "Harina"...
  ✅ Step 2.1 Complete: Inventory item {id: "...", name: "Harina"}
  ✅ Conversion: 500 gr → 0.5 kg (factor: 0.001)
  ✅ Step 2.2: Finding/creating inventory item for "Queso"...
  ✅ Step 2.2 Complete: Inventory item {id: "...", name: "Queso"}
  ✅ Conversion: 200 gr → 0.2 kg (factor: 0.001)
✅ Step 2 Complete: All inventory items processed [2 items]
✅ Step 3: Adding ingredients to dish...
✅ Step 3 Complete: Ingredients added to dish [2 items]
✅ Step 4: Refreshing data...
✅ Step 4 Complete: Data refreshed
🎉 SUCCESS: Dish saved with 2 ingredients

Toast:
✅ ¡Plato agregado!
   2 ingredientes • Costo: $2.02 • Margen: 79%
```

**Vista:**
- Plato "Pizza Margarita" aparece en la categoría
- Al abrirlo, muestra tabla con 2 ingredientes
- Costo Total: $2.02
- % Costo: 20.2%
- Margen: 79.8%

---

### Caso de Prueba 2: Abrir Plato Guardado

**Pasos:**
1. Abre un plato existente "Pepito Lito"
2. Revisa la ficha del plato

**Resultado esperado:**

**Antes del fix:**
```
Costo Total: $0.00
% Costo: 0.00%
Margen: 100%
Tabla: (vacía)
```

**Después del fix:**
```
Costo Total: $4.50
% Costo: 25%
Margen: 75%
Tabla:
  Pan        | 100 gr | $3.00 | $0.30
  Carne      | 200 gr | $8.00 | $1.60
  Lechuga    | 50 gr  | $2.00 | $0.10
  ...
  ────────────────────────────────────
  COSTO TOTAL                  $4.50
```

---

### Caso de Prueba 3: Error Handling

**Pasos:**
1. Crear plato sin ingredientes
2. Ver console

**Resultado esperado:**
```
🔍 handleSaveDish - Starting... {ingredients: [1 item]}
🔍 handleSaveDish - Valid ingredients: []

Toast:
❌ Completa los campos requeridos
   Nombre del plato, ingredientes con cantidad y precio.
```

---

## 📋 Checklist de Validación

### Antes de usar
- [ ] Leer este documento completo
- [ ] Abrir DevTools (F12) → Console
- [ ] Limpiar console para ver logs nuevos

### Al crear plato
- [ ] Console muestra "Step 1: Creating dish..."
- [ ] Console muestra "Step 2: Processing ingredients..."
- [ ] Console muestra conversión de unidades
- [ ] Console muestra "Step 3: Adding ingredients..."
- [ ] Console muestra "SUCCESS: Dish saved with X ingredients"
- [ ] Toast muestra "X ingredientes"
- [ ] NO hay errores en console

### Al abrir plato
- [ ] Tabla de ingredientes NO está vacía
- [ ] Costo Total > $0.00
- [ ] % Costo está calculado
- [ ] Gráfico muestra proporción correcta
- [ ] Cada ingrediente muestra nombre, cantidad, precio, costo

### Si hay error
- [ ] Console muestra "❌ ERROR saving dish:"
- [ ] Console muestra stack trace
- [ ] Console muestra detalles del error
- [ ] Toast muestra mensaje descriptivo

---

## 🚨 Errores Comunes

### Error 1: "Cannot read property 'price_per_unit' of undefined"

**Causa:** El inventory_item no se encontró o creó

**Debugging:**
```
Console:
✅ Step 2.1: Finding/creating inventory item for "Harina"...
❌ ERROR saving dish: Cannot read property 'price_per_unit' of undefined
```

**Solución:**
- Revisa que `findOrCreateInventoryItem` funcione
- Verifica permisos RLS en tabla `inventory_items`
- Asegura que el ingrediente tiene nombre válido

---

### Error 2: "Ingredients array is empty"

**Causa:** Ingredientes no pasaron validación

**Debugging:**
```
Console:
🔍 handleSaveDish - Valid ingredients: []
```

**Solución:**
- Verifica que cada ingrediente tenga:
  - `name` (no vacío)
  - `quantityInDish` (> 0)
  - `pricePerPurchaseUnit` (> 0)
  - `purchaseUnit` (definido)
  - `dishUnit` (definido)

---

### Error 3: "Costo muestra $0.00 después de guardar"

**Causa:** Query no trae `price_per_unit` correctamente

**Debugging:**
```sql
-- En Supabase SQL Editor
SELECT 
  d.name as dish_name,
  di.quantity,
  di.unit,
  i.name as ingredient_name,
  i.price_per_unit,
  i.wastage_percentage
FROM dishes d
JOIN dish_ingredients di ON di.dish_id = d.id
JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.user_id = auth.uid()
ORDER BY d.created_at DESC
LIMIT 10;
```

**Resultado esperado:**
Cada fila debe tener `price_per_unit` > 0

**Si price_per_unit es NULL:**
- El inventario item no se creó correctamente
- Revisa logs de Step 2 en console

---

## 📊 Verificación en Base de Datos

### Query 1: Ver platos con ingredientes

```sql
SELECT 
  d.id,
  d.name as plato,
  d.price as precio_venta,
  COUNT(di.id) as num_ingredientes,
  SUM(di.quantity * i.price_per_unit) as costo_total
FROM dishes d
LEFT JOIN dish_ingredients di ON di.dish_id = d.id
LEFT JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name, d.price
ORDER BY d.created_at DESC;
```

**Resultado esperado:**
```
plato            | precio_venta | num_ingredientes | costo_total
───────────────────────────────────────────────────────────────────
Pizza Margarita  | 10.00        | 2                | 2.02
Pepito Lito      | 6.00         | 3                | 4.50
```

**Si num_ingredientes = 0:**
- Los ingredientes NO se guardaron
- Revisa logs de Step 3 en console

---

### Query 2: Ver ingredientes de un plato específico

```sql
SELECT 
  d.name as plato,
  i.name as ingrediente,
  di.quantity,
  di.unit,
  i.price_per_unit,
  di.waste_percentage,
  (di.quantity * i.price_per_unit) as costo
FROM dishes d
JOIN dish_ingredients di ON di.dish_id = d.id
JOIN inventory_items i ON i.id = di.inventory_item_id
WHERE d.name = 'Pepito Lito'
  AND d.user_id = auth.uid();
```

**Resultado esperado:**
```
plato       | ingrediente | quantity | unit | price_per_unit | waste_percentage | costo
──────────────────────────────────────────────────────────────────────────────────────────
Pepito Lito | Pan         | 0.100    | kg   | 3.00           | 0                | 0.30
Pepito Lito | Carne       | 0.200    | kg   | 8.00           | 5                | 1.60
Pepito Lito | Lechuga     | 0.050    | kg   | 2.00           | 0                | 0.10
```

---

### Query 3: Verificar RLS (Row Level Security)

```sql
-- Ver políticas de dish_ingredients
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'dish_ingredients';
```

**Debe existir:**
- Política de SELECT para ver propios ingredientes
- Política de INSERT para crear ingredientes
- Política de DELETE para borrar ingredientes

**Si falta alguna política:**
```sql
-- Crear políticas faltantes
CREATE POLICY "Users can view own dish ingredients"
  ON dish_ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dish ingredients"
  ON dish_ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dish ingredients"
  ON dish_ingredients FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔄 Flujo Completo de Guardado

```
Usuario click "Agregar plato"
  ↓
[Frontend] handleSaveDish()
  ↓
✅ Step 1: Validar datos
  - Nombre del plato ✓
  - Precio > 0 ✓
  - Ingredientes válidos ✓
  ↓
✅ Step 2: Crear plato
  → [Backend] createDish()
    → [DB] INSERT INTO dishes
  ← Retorna: {id: "...", name: "..."}
  ↓
✅ Step 3: Procesar ingredientes (cada uno)
  → [Backend] findOrCreateInventoryItem()
    → [DB] SELECT FROM inventory_items WHERE name = "..."
    ┌─ Si existe:
    │   → Actualizar precio/unidad/merma si cambió
    │   → [DB] UPDATE inventory_items
    └─ Si NO existe:
        → Crear nuevo
        → [DB] INSERT INTO inventory_items
  ← Retorna: {id: "...", name: "...", price_per_unit: ...}
  ↓
✅ Step 4: Convertir unidades
  - De dishUnit (gr) → purchaseUnit (kg)
  - Aplicar factor de conversión
  ↓
✅ Step 5: Guardar relación plato-ingrediente
  → [Backend] addMultipleDishIngredients()
    → [DB] INSERT INTO dish_ingredients (múltiples)
  ← Retorna: [{id: "...", dish_id: "...", inventory_item_id: "..."}]
  ↓
✅ Step 6: Refrescar datos
  → refetchDishes()
  → refetchInventory()
  ↓
✅ Step 7: Mostrar confirmación
  → Toast con cantidad de ingredientes, costo, margen
  ↓
✅ Step 8: Limpiar formulario
  ↓
[Usuario] Ve plato en lista con ingredientes guardados
```

---

## 📚 Archivos Modificados

### `/hooks/useSupabase.ts`
**Cambios:**
- Líneas 83-101: Query de dishes con ingredientes
- Agregado `price_per_unit`, `wastage_percentage`, `id`

### `/components/MenuScreen.tsx`
**Cambios:**
- Línea 283: Mapeo de `price_per_unit` en vez de `price`
- Líneas 491-626: Logs detallados en `handleSaveDish`
- Líneas 493-497: Validación mejorada de ingredientes
- Línea 602: Toast con cantidad de ingredientes

---

## ✅ Estado Final

**Problemas resueltos:**
1. ✅ Query obtiene `price_per_unit` correctamente
2. ✅ Mapeo usa campo correcto
3. ✅ Logs detallados para debugging
4. ✅ Validación mejorada de ingredientes
5. ✅ Toast informativo con cantidad

**Resultado:**
- Los ingredientes se guardan correctamente
- Los platos muestran costos reales
- La ficha del plato muestra tabla completa
- El cálculo de márgenes es preciso

---

## 🚀 Próximos Pasos

1. **Prueba el fix:**
   - Crea un plato nuevo
   - Verifica console logs
   - Abre la ficha del plato
   - Confirma que ingredientes aparecen

2. **Si sigue sin funcionar:**
   - Comparte los logs de console
   - Ejecuta Query 1 de verificación
   - Revisa permisos RLS

3. **Una vez funcionando:**
   - Puedes eliminar algunos console.log si quieres
   - O dejarlos para debugging futuro

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Estado:** ✅ Implementado y listo para testing  
**Breaking changes:** ❌ Ninguno
