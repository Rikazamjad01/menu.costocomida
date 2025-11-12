# 🧪 Sistema Avanzado de Ingredientes con Merma

## ✅ Lo que se ha implementado

### 1. **Script SQL para Merma en Ingredientes**
- ✅ Archivo: `/ACTUALIZAR_MERMA_INGREDIENTES.sql`
- ✅ Agrega columna `wastage_percentage` a `inventory_items`
- ✅ Validación: valor entre 0-100
- ✅ Default: 0% (sin merma)

**Ejecutar en Supabase SQL Editor:**
```sql
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5,2) DEFAULT 0.00;

ALTER TABLE inventory_items
ADD CONSTRAINT check_wastage_percentage_range 
CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100);
```

---

### 2. **Componente IngredientCombobox**
- ✅ Archivo: `/components/IngredientCombobox.tsx`
- ✅ Dropdown con búsqueda de ingredientes existentes
- ✅ Opción "+ Agregar nuevo ingrediente"
- ✅ Muestra precio y % merma de ingredientes guardados
- ✅ Auto-completa al seleccionar existente

---

### 3. **Componente IngredientFormItem**
- ✅ Archivo: `/components/IngredientFormItem.tsx`
- ✅ Formulario completo para un ingrediente
- ✅ Campos:
  - Nombre (con combobox)
  - Unidad de compra (kg, lt, ml, gramos, etc.)
  - Precio por unidad de compra
  - Unidad en plato (puede ser diferente)
  - Cantidad en plato
  - % Merma del ingrediente
- ✅ Badge "Guardado" para ingredientes existentes
- ✅ Botón "Editar" para modificar valores pre-cargados
- ✅ Cálculo automático del costo con merma

---

### 4. **Sistema de Cálculo de Costos con Merma**
Ubicación: `/components/MenuScreen.tsx`

#### Funciones implementadas:

**a) Conversión de Unidades**
```typescript
convertToBaseUnit(quantity, unit)
getConversionFactor(fromUnit, toUnit)
```
- Convierte kg ↔ gramos
- Convierte lt ↔ ml
- Soporta piezas, tazas (1:1)

**b) Cálculo de Costo por Ingrediente**
```typescript
calculateIngredientCost(pricePerUnit, purchaseUnit, quantityInDish, dishUnit, wastagePercent)
```

**Ejemplo de cálculo:**
```
Ingrediente: Tomate
- Compra: $20/kg
- Merma: 10%
- Uso en plato: 500 gramos

Cálculo:
1. Precio sin merma: $20/1000g = $0.02/g
2. Con 10% merma, de 100g comprados solo uso 90g
3. Precio real: $20/(1000g * 0.9) = $0.0222/g
4. Costo para 500g: 500g * $0.0222/g = $11.11
```

**c) Costo Total de Ingredientes**
```typescript
calculateTotalIngredientsCost()
```
- Suma costos de todos los ingredientes
- Cada uno con su merma aplicada

**d) Costo Final del Plato**
```typescript
calculateFinalDishCost()
```
- Toma costo total de ingredientes
- Aplica merma del plato completo
- Ejemplo: $50 ingredientes + 5% merma plato = $52.50

---

### 5. **Interfaz Actualizada de Ingrediente**
```typescript
interface Ingredient {
  // Identificación
  inventoryItemId?: string;
  isExisting: boolean;
  isEditing: boolean;
  
  // Datos básicos
  name: string;
  
  // Compra
  purchaseUnit: string;
  pricePerPurchaseUnit: string;
  
  // Uso en plato
  dishUnit: string;
  quantityInDish: string;
  
  // Merma
  ingredientWastage: string;
  
  // Legacy (compatibilidad)
  quantity: string;
  unit: string;
  price: string;
  wastePercentage: string;
}
```

---

### 6. **Helpers de Supabase Actualizados**
Ubicación: `/lib/supabase-helpers.ts`

**Actualizaciones:**
- ✅ `createInventoryItem()` - soporta `wastage_percentage`
- ✅ `findOrCreateInventoryItem()` - soporta `wastage_percentage`
- ✅ `updateInventoryItem()` - soporta `wastage_percentage`
- ✅ Mapeo correcto de campos: `price` → `price_per_unit`

---

### 7. **UI del Formulario de Plato**

**Nuevo campo: Merma del Plato**
```tsx
<Input
  id="dishWastage"
  value={dishWastage}
  onChange={(e) => setDishWastage(e.target.value)}
  placeholder="0"
/>
```

**Resumen de Costos Mejorado:**
```
Costo ingredientes:     $50.00
+ Merma del plato (5%): $2.50
─────────────────────────────
Costo total:            $52.50
Margen:                 45.2%
```

---

## 🎯 Flujo Completo

### Agregar un Plato Nuevo

1. **Usuario escribe nombre del plato**
   - Ejemplo: "Tacos al pastor"

2. **Agregar Ingrediente 1:**
   - Click en combobox de ingredientes
   - Busca "Tortillas de maíz"
   - **Si existe:** Se auto-rellena precio, unidad, % merma
   - **Si no existe:** Opción "+ Agregar nuevo ingrediente"

3. **Auto-completado (si existe):**
   ```
   ✓ Unidad de compra: kg
   ✓ Precio/kg: $20.00
   ✓ % Merma: 5%
   ```

4. **Usuario completa:**
   - Unidad en plato: piezas
   - Cantidad: 6
   - (Puede editar precio/merma si necesita)

5. **Cálculo automático:**
   ```
   Costo: $1.26
   (considerando conversión + merma)
   ```

6. **Repetir para cada ingrediente**

7. **Merma del plato:**
   - Ejemplo: 3% (platos que se quiebran, se queman, etc.)

8. **Costo final:**
   ```
   Ingredientes:      $8.50
   + Merma plato (3%): $0.26
   ───────────────────────
   Total:             $8.76
   ```

9. **Guardar plato:**
   - Se guarda el plato
   - Se guardan/actualizan ingredientes en inventario
   - Se vinculan ingredientes al plato

---

## 📋 Pasos Pendientes para el Usuario

### 1. Ejecutar Script SQL
**Archivo:** `/ACTUALIZAR_MERMA_INGREDIENTES.sql`

1. Ir a Supabase Dashboard
2. SQL Editor
3. Copiar y pegar el script
4. Ejecutar

### 2. Verificar Migración Auth (si no se ha hecho)
**Archivo:** `/HAZ_ESTO_AHORA.md`

Si aún no has ejecutado la migración de autenticación, hazlo primero:
1. Ejecutar `/MIGRACION_AUTH_COMPLETA.sql`
2. Seguir pasos en `/HAZ_ESTO_AHORA.md`

---

## 🧮 Ejemplo Completo de Cálculo

### Plato: "Tacos al Pastor" (3 tacos)

**Ingredientes:**

1. **Tortillas de maíz**
   - Compra: $25/kg (1000g)
   - Merma ingrediente: 5%
   - Uso: 6 tortillas (120g)
   - Costo: $25/(1000g * 0.95) * 120g = **$3.16**

2. **Carne de cerdo**
   - Compra: $150/kg
   - Merma ingrediente: 15% (grasa, hueso)
   - Uso: 200g
   - Costo: $150/(1000g * 0.85) * 200g = **$35.29**

3. **Piña**
   - Compra: $30/kg
   - Merma ingrediente: 30% (cáscara, centro)
   - Uso: 50g
   - Costo: $30/(1000g * 0.7) * 50g = **$2.14**

4. **Cebolla**
   - Compra: $20/kg
   - Merma ingrediente: 10%
   - Uso: 30g
   - Costo: $20/(1000g * 0.9) * 30g = **$0.67**

**Subtotal ingredientes: $41.26**

**Merma del plato: 5%**
(tacos que se rompen, se queman, etc.)

**Costo total: $41.26 * 1.05 = $43.32**

**Precio de venta: $80**

**Margen: (80 - 43.32) / 80 = 45.9%** ✅ Saludable

---

## 🔄 Compatibilidad con Platos Existentes

Los platos creados con el sistema anterior seguirán funcionando:
- Los campos legacy (`quantity`, `unit`, `price`, `wastePercentage`) se mantienen
- Se sincronizan con los nuevos campos automáticamente
- No hay pérdida de datos

---

## 🎨 UI/UX Highlights

✅ **Combobox intuitivo** con búsqueda
✅ **Badge visual** para ingredientes guardados
✅ **Botón Editar** para modificar valores pre-cargados
✅ **Preview en tiempo real** del costo
✅ **Explicaciones inline** del % de merma
✅ **Resumen desglosado** de costos
✅ **Estados claros**: nuevo vs. existente

---

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Historial de precios de ingredientes
- [ ] Alertas cuando ingredientes suben de precio
- [ ] Sugerencias de sustitutos más baratos
- [ ] Análisis de tendencias de costos
- [ ] Recetas alternativas con menor costo
- [ ] Exportar lista de compras optimizada

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Estado:** ✅ Implementado y listo para usar
