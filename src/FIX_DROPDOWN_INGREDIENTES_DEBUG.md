# 🐛 Fix: Dropdown de Ingredientes No Muestra Items

## Problema Reportado
- Cuando seleccionas un ingrediente guardado (ej: 'lechuga'), da error
- Los ingredientes no se ven en el dropdown

## Posibles Causas

### 1. **Datos no cargados desde Supabase**
- La tabla `inventory_items` está vacía
- El usuario no tiene ingredientes guardados
- Error de permisos (RLS)

### 2. **Estructura de datos incorrecta**
- Los nombres de columnas no coinciden
- `price_per_unit` es `null` o `undefined`
- Formato de datos incorrecto

### 3. **Error de renderizado**
- El componente no recibe los datos correctamente
- El array está vacío

---

## Soluciones Implementadas

### ✅ 1. Validación de Datos en Hook

**Archivo:** `/hooks/useSupabase.ts`

```typescript
// Map data to ensure consistent naming
const mappedItems = (data || []).map((item: any) => ({
  id: item.id,
  name: item.name,
  unit: item.unit,
  price_per_unit: item.price_per_unit,
  wastage_percentage: item.wastage_percentage,
  category: item.category,
  emoji: item.emoji,
  user_id: item.user_id,
  created_at: item.created_at,
  updated_at: item.updated_at
}));
```

**Qué hace:**
- Mapea explícitamente todos los campos
- Asegura que los nombres sean consistentes
- Evita problemas de snake_case vs camelCase

---

### ✅ 2. Validación al Seleccionar Ingrediente

**Archivo:** `/components/MenuScreen.tsx`

```typescript
const handleSelectExistingIngredient = (index: number, item: any) => {
  console.log('🔍 handleSelectExistingIngredient - Selected item:', item);
  
  // Validar que el item tenga los campos necesarios
  if (!item || !item.id || !item.name) {
    console.error('❌ Item inválido:', item);
    toast.error('Error al seleccionar ingrediente');
    return;
  }
  
  // Usar valores por defecto si faltan campos
  purchaseUnit: item.unit || 'kg',
  pricePerPurchaseUnit: (item.price_per_unit || 0).toString(),
  ingredientWastage: (item.wastage_percentage || 0).toString(),
}
```

**Qué hace:**
- Valida que el item tenga los campos mínimos requeridos
- Usa valores por defecto si faltan datos
- Muestra error al usuario si el item es inválido

---

### ✅ 3. Debug Logs

**Archivos:**
- `MenuScreen.tsx`: Log de inventoryIngredients
- `IngredientCombobox.tsx`: Log de inventoryItems recibidos

```typescript
console.log('🔍 MenuScreen - inventoryIngredients:', inventoryIngredients);
console.log('🔍 MenuScreen - inventoryIngredients count:', inventoryIngredients.length);
console.log('🔍 IngredientCombobox - inventoryItems:', inventoryItems);
console.log('🔍 IngredientCombobox - current value:', value);
```

**Qué hace:**
- Muestra en consola los datos que se están pasando
- Ayuda a identificar si los datos llegan correctamente
- Permite ver la estructura exacta de los objetos

---

### ✅ 4. Validación de Renderizado

**Archivo:** `/components/IngredientCombobox.tsx`

```typescript
{item.price_per_unit != null && item.price_per_unit !== undefined && item.unit && (
  <span className="text-[14px] text-[#4D6B59] ml-2">
    ${Number(item.price_per_unit).toFixed(2)}/{item.unit}
  </span>
)}
```

**Qué hace:**
- Verifica que price_per_unit no sea null ni undefined
- Convierte a Number para asegurar formato correcto
- Solo muestra si tiene valor válido

---

## 🔍 Pasos de Debugging

### Paso 1: Ver Console Logs

1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Busca los logs con emoji 🔍
4. Verifica:
   ```javascript
   🔍 MenuScreen - inventoryIngredients: [...]
   🔍 MenuScreen - inventoryIngredients count: 5
   🔍 IngredientCombobox - inventoryItems: [...]
   ```

### Paso 2: Verificar Estructura de Datos

**Esperado:**
```javascript
{
  id: "uuid-123",
  name: "lechuga",
  unit: "kg",
  price_per_unit: 2.50,
  wastage_percentage: 10,
  ...
}
```

**Si falta price_per_unit:**
```javascript
{
  id: "uuid-123",
  name: "lechuga",
  unit: "kg",
  price_per_unit: null,  // ❌ PROBLEMA
  ...
}
```

### Paso 3: Verificar Base de Datos

**Ejecuta en Supabase SQL Editor:**

```sql
-- Ver todos los ingredientes del usuario actual
SELECT 
  id,
  name,
  unit,
  price_per_unit,
  wastage_percentage,
  user_id
FROM inventory_items
WHERE user_id = auth.uid()
ORDER BY name;
```

**Verificar:**
- ✅ Hay ingredientes en la tabla
- ✅ `price_per_unit` tiene valores (no NULL)
- ✅ `unit` tiene valores
- ✅ `user_id` coincide con el usuario actual

### Paso 4: Verificar RLS (Row Level Security)

**Ejecuta en Supabase SQL Editor:**

```sql
-- Ver políticas de RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'inventory_items';
```

**Debe existir política de SELECT:**
```sql
CREATE POLICY "Users can view own inventory items"
ON inventory_items FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🔧 Soluciones Manuales

### Si el dropdown está vacío

**Opción 1: Verificar que haya ingredientes**

```sql
-- Contar ingredientes
SELECT COUNT(*) FROM inventory_items WHERE user_id = auth.uid();
```

Si count = 0, crea ingredientes de prueba:

```sql
INSERT INTO inventory_items (name, unit, price_per_unit, wastage_percentage, user_id)
VALUES 
  ('lechuga', 'kg', 2.50, 10, auth.uid()),
  ('tomate', 'kg', 3.00, 5, auth.uid()),
  ('cebolla', 'kg', 1.80, 0, auth.uid());
```

**Opción 2: Actualizar ingredientes con price_per_unit NULL**

```sql
-- Ver ingredientes sin precio
SELECT * FROM inventory_items 
WHERE user_id = auth.uid() AND price_per_unit IS NULL;

-- Actualizar con precio por defecto
UPDATE inventory_items
SET price_per_unit = 0.01
WHERE user_id = auth.uid() AND price_per_unit IS NULL;
```

**Opción 3: Refrescar inventario en la app**

1. Cierra el diálogo de agregar plato
2. Vuelve a abrirlo (esto llama a `refetchInventory()`)
3. Intenta de nuevo

---

## 🎯 Testing

### Caso de Prueba 1: Dropdown vacío

**Acción:**
1. Abre diálogo "Agregar plato"
2. Click en combobox de ingrediente
3. ¿Se ve la lista?

**Resultado esperado:**
- Si hay ingredientes: Se muestra lista
- Si no hay: "No se encontró" con botón "Crear"

**En console:**
```
🔍 MenuScreen - inventoryIngredients count: 5
🔍 IngredientCombobox - inventoryItems: [5 items]
```

### Caso de Prueba 2: Seleccionar ingrediente existente

**Acción:**
1. Click en combobox
2. Selecciona "lechuga"

**Resultado esperado:**
- Nombre se llena: "lechuga"
- Badge "Guardado" aparece
- Precio se llena automáticamente
- Merma se llena automáticamente

**En console:**
```
🔍 handleSelectExistingIngredient - Selected item: {id: "...", name: "lechuga", ...}
✅ Ingrediente actualizado: {isExisting: true, name: "lechuga", ...}
```

### Caso de Prueba 3: Ingrediente sin precio

**Acción:**
1. Selecciona ingrediente que tiene `price_per_unit: null`

**Resultado esperado:**
- Se llena con precio: "0"
- Toast error NO aparece
- Puedes editar el precio manualmente

**En console:**
```
🔍 handleSelectExistingIngredient - Selected item: {price_per_unit: null}
✅ Ingrediente actualizado: {pricePerPurchaseUnit: "0"}
```

---

## 📋 Checklist de Validación

- [ ] Console muestra inventoryIngredients con items
- [ ] Console muestra count > 0
- [ ] Dropdown muestra lista de ingredientes
- [ ] Al seleccionar ingrediente, se auto-llenan campos
- [ ] Badge "Guardado" aparece
- [ ] No hay errores en console
- [ ] Si no hay ingredientes, muestra "Crear nuevo"
- [ ] Crear nuevo ingrediente funciona
- [ ] El ingrediente creado aparece en próximas búsquedas

---

## 🚨 Errores Comunes

### Error 1: "Cannot read property 'price_per_unit' of undefined"

**Causa:** El item es undefined o null

**Solución:** Ya implementada con validación en `handleSelectExistingIngredient`

### Error 2: "Cannot read property 'toFixed' of null"

**Causa:** `price_per_unit` es null

**Solución:** Ya implementada con valores por defecto `(item.price_per_unit || 0)`

### Error 3: Dropdown vacío pero console muestra items

**Causa:** Problema de renderizado en Command component

**Solución:**
1. Verificar que `inventoryItems` prop llegue correctamente
2. Check console logs en IngredientCombobox
3. Verificar que `item.name` tenga valor

### Error 4: "Toast error: Error al seleccionar ingrediente"

**Causa:** Item inválido (sin id o name)

**Solución:**
1. Ver console: `❌ Item inválido:`
2. Verificar estructura del item
3. Asegurar que la query de Supabase traiga todos los campos

---

## 📖 Referencias

**Archivos modificados:**
1. `/hooks/useSupabase.ts` - Mapeo de datos
2. `/components/MenuScreen.tsx` - Validación al seleccionar
3. `/components/IngredientCombobox.tsx` - Debug logs y renderizado

**Documentos relacionados:**
- `/FLUJO_INGREDIENTE_NUEVO.md` - Flujo completo
- `/FUNCIONALIDAD_INGREDIENTES.md` - Cómo funciona el sistema

---

**Estado:** ✅ Implementado con validaciones  
**Versión:** 1.0  
**Fecha:** Noviembre 2024
