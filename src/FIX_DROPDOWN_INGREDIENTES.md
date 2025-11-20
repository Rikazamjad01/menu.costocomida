# ✅ Fix: Dropdown de Ingredientes Muestra Items Recién Creados

## 🐛 Problema Detectado

Cuando guardabas un plato con un ingrediente nuevo (como "Pan"), al intentar crear otro plato, ese ingrediente **no aparecía en el dropdown** del combobox de ingredientes.

### Por qué pasaba esto:
1. Al guardar un plato, se creaban los ingredientes en la base de datos ✅
2. Pero **NO se refrescaba la lista de inventario** en memoria ❌
3. El combobox mostraba solo los ingredientes que estaban en memoria cuando cargaste la página

---

## ✅ Solución Aplicada

### 1. Extraer función `refetch` del hook de inventario

**Antes:**
```tsx
const { items: inventoryItemsFromSupabase } = useInventoryItems();
```

**Ahora:**
```tsx
const { items: inventoryItemsFromSupabase, refetch: refetchInventory } = useInventoryItems();
```

### 2. Refrescar inventario después de guardar plato

Cuando guardas un plato con ingredientes nuevos, ahora también se refresca el inventario:

```tsx
// 4. Refrescar datos para que los nuevos ingredientes aparezcan en el dropdown
await Promise.all([
  refetchDishes(),
  refetchInventory()  // ← NUEVO
]);
```

### 3. Refrescar inventario al abrir el diálogo

Creé una función helper `handleOpenAddDishDialog()` que:
- Selecciona la categoría
- Abre el diálogo
- **Refresca el inventario** para mostrar ingredientes recién creados

```tsx
const handleOpenAddDishDialog = (categoryId: string) => {
  setSelectedCategory(categoryId);
  setShowAddDishDialog(true);
  // Refrescar inventario para mostrar ingredientes recién creados
  refetchInventory();
};
```

### 4. Actualizar botones de "Agregar plato"

Todos los botones ahora usan la nueva función:

```tsx
<Button onClick={() => handleOpenAddDishDialog(category.id)}>
  Agregar plato
</Button>
```

---

## 🧪 Flujo de Prueba

### Test 1: Crear Plato con Ingrediente Nuevo
1. ✅ Click "Agregar plato"
2. ✅ Nombre: "Sándwich de Pan"
3. ✅ Click combobox ingredientes → Escribe "**Pan**"
4. ✅ Click "Crear 'Pan'"
5. ✅ Completa datos: kg, $20, gr, 100, 0%
6. ✅ Precio venta: $50
7. ✅ Click "Guardar plato"
8. ✅ Toast: "¡Plato agregado!"

### Test 2: Verificar que el Ingrediente Aparece
1. ✅ Click "Agregar otro plato" (o en otra categoría)
2. ✅ Click en combobox de ingredientes
3. ✅ **VERÁS "Pan" en la lista** con su precio y unidad
4. ✅ Selecciona "Pan"
5. ✅ Se auto-rellenan precio, unidad y merma

### Test 3: Crear Segundo Plato con el Mismo Ingrediente
1. ✅ Nombre: "Tostadas Francesas"
2. ✅ Ingrediente 1: Selecciona "**Pan**" del dropdown
3. ✅ Verifica auto-relleno: kg, $20, 0%
4. ✅ Cantidad: 150 gr
5. ✅ Click "Guardar plato"
6. ✅ Ambos platos ahora usan el mismo ingrediente del inventario

---

## 🎯 Cambios Adicionales

### Fix: Unidades Simplificadas

También cambié todas las referencias de "gramos" a "**gr**" para consistencia:

**Archivos actualizados:**
- `/components/MenuScreen.tsx`:
  - `dishUnit` inicial: `'gr'`
  - `addIngredient()`: `dishUnit: 'gr'`
  - Comentarios actualizados
- `/components/IngredientFormItem.tsx`:
  - Array de unidades: `['kg', 'lt', 'ml', 'gr', ...]`
  - Lógica de conversión: `kg ↔ gr`

---

## 📊 Resumen de Cambios

| Componente | Cambio | Impacto |
|------------|--------|---------|
| `MenuScreen.tsx` | Extraer `refetchInventory()` | Permite refrescar inventario |
| `MenuScreen.tsx` | Refrescar después de guardar | Ingredientes nuevos disponibles |
| `MenuScreen.tsx` | Nueva función `handleOpenAddDishDialog()` | Inventario fresco al abrir diálogo |
| `MenuScreen.tsx` | Unidades simplificadas a 'gr' | Consistencia en toda la app |
| `IngredientFormItem.tsx` | Unidades simplificadas a 'gr' | Dropdown limpio |

---

## 🎉 Resultado Final

### Antes ❌
```
1. Creas plato con "Pan" → Guardado ✅
2. Abres nuevo plato → Combobox ingredientes
3. "Pan" NO aparece ❌
4. Tienes que escribir "Pan" de nuevo ❌
```

### Ahora ✅
```
1. Creas plato con "Pan" → Guardado ✅
2. Inventario se refresca automáticamente ✅
3. Abres nuevo plato → Combobox ingredientes
4. "Pan" aparece en la lista con precio y unidad ✅
5. Click en "Pan" → Auto-rellena todo ✅
```

---

## 💡 Ventajas del Fix

1. **No hay duplicados** - Reutilizas ingredientes existentes
2. **Menos trabajo** - No tienes que escribir precio/unidad cada vez
3. **Consistencia** - Todos los platos usan los mismos ingredientes base
4. **Actualización en tiempo real** - Inventario siempre actualizado

---

## 🚨 Recordatorio: Script SQL

Este fix funciona **SOLO SI** ya ejecutaste el script SQL para crear la columna `price_per_unit`:

```sql
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10, 2) DEFAULT 0.00;
```

Si no lo has ejecutado, ve a `/SOLUCION_ERROR_PRICE_PER_UNIT.md`

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Estado:** ✅ Resuelto  
**Archivos modificados:** 2
