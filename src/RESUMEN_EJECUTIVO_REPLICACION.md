# 📊 RESUMEN EJECUTIVO - Replicación Lead Magnet → Main App

## 🎯 Objetivo
Replicar funcionalidades clave del **Lead Magnet** al **Main App** de CostoComida, manteniendo el mismo sistema visual pero adaptando la lógica de ingredientes.

---

## 🔑 Diferencia Clave

| Aspecto | Lead Magnet (Actual) | Main App (A Desarrollar) |
|---------|---------------------|--------------------------|
| **Ingredientes** | ✅ Crear nuevos on-the-fly | ❌ Solo del inventario existente |
| **Propósito** | Lead capture rápido | Gestión completa de restaurante |
| **Usuarios** | Prospects (trial) | Clientes premium |
| **Inventario** | No existe tabla separada | ✅ Tabla `inventory_items` dedicada |

---

## 📦 Componentes a Replicar

### 1. ✅ DishDetailSheet.tsx
**Ruta:** `/components/DishDetailSheet.tsx`

**Replicar:** ✅ EXACTO al 100%

**Features:**
- Métricas principales (Costo Total + Margen Bruto)
- Pricing row (Precio Público, Impuestos, Precio Neto)
- Desglose visual de ingredientes
- Gráfico de Pie (Recharts)
- Preparación del plato (textarea)
- Alérgenos (badges interactivos)
- Auto-save cuando hay cambios

**Tamaño:** 390×757px (90vh mobile)

---

### 2. ✅ Alertas de Rentabilidad por Categoría
**Ruta:** `/components/MenuScreen.tsx` (líneas 437-486)

**Replicar:** ✅ Lógica y UI

**Features:**
- Card destacada con categoría más rentable
- Badge de estado (Saludable/Ajustar/Riesgo)
- Cálculo de margen promedio por categoría
- Colores dinámicos según margen:
  - Verde ≥65%
  - Naranja 50-64%
  - Rojo <50%

**Fórmulas:**
```typescript
// Margen por categoría
avgMargin = sum(margins) / totalDishes

// Color del badge
if (margin >= 65) return 'Saludable' (verde)
if (margin >= 50) return 'Ajustar' (naranja)
return 'Riesgo' (rojo)
```

---

### 3. ✅ Dashboard de Rentabilidad por Categoría
**Componente:** Nuevo - `ProfitabilityBarChart.tsx`

**Features:**
- Gráfico de barras (Recharts)
- Eje X: Emojis de categorías
- Eje Y: Porcentaje de margen (0-100%)
- Barras con colores dinámicos (verde/naranja/rojo)
- Tooltip personalizado
- Ordenado por margen (descendente)

**Tamaño:** 100% width × 320px height

---

### 4. ❌ Creación de Platos (MODIFICAR)
**Ruta:** `/components/MenuScreen.tsx` (líneas 682-850)

**Cambios necesarios:**

#### ❌ NO Replicar:
```typescript
// ❌ Función que permite crear ingredientes nuevos
const handleCreateNewIngredient = (index: number, name: string) => {
  // ... código que permite crear ingrediente nuevo
}
```

#### ✅ SÍ Replicar:
```typescript
// ✅ Solo permitir selección del inventario
const handleSelectExistingIngredient = (index: number, item: any) => {
  // ... código que rellena datos del inventario
}
```

#### Modificaciones UI:
1. En `IngredientCombobox`:
   ```tsx
   <IngredientCombobox
     allowCreateNew={false}  // ⚠️ Cambiar a false
     inventoryItems={inventoryItems}
     onSelectExisting={handleSelectExistingIngredient}
     // No incluir onCreateNew
   />
   ```

2. Agregar validación:
   ```tsx
   {inventoryItems.length === 0 && (
     <div className="bg-[#FFFBF5] border border-[#F59E0B] rounded-[16px] p-4">
       <p className="text-[#F59E0B]">
         ⚠️ No hay ingredientes en tu inventario.
         <a href="/inventory" className="underline">Agregar ingredientes</a>
       </p>
     </div>
   )}
   ```

---

## 🗄️ Schema de Base de Datos

### Tablas Necesarias:

```sql
1. inventory_items
   ├─ id (UUID)
   ├─ user_id (UUID, FK auth.users)
   ├─ name (TEXT)
   ├─ category (TEXT)
   ├─ emoji (TEXT)
   ├─ unit (TEXT)
   └─ price_per_unit (DECIMAL)

2. menu_categories
   ├─ id (UUID)
   ├─ user_id (UUID, FK auth.users)
   ├─ name (TEXT)
   ├─ emoji (TEXT)
   └─ is_hidden (BOOLEAN)

3. dishes
   ├─ id (UUID)
   ├─ user_id (UUID, FK auth.users)
   ├─ name (TEXT)
   ├─ category_id (UUID, FK menu_categories)
   ├─ price (DECIMAL)
   ├─ preparation (TEXT)
   └─ allergens (TEXT[])

4. dish_ingredients
   ├─ id (UUID)
   ├─ dish_id (UUID, FK dishes)
   ├─ inventory_item_id (UUID, FK inventory_items)
   ├─ quantity (DECIMAL)
   ├─ unit (TEXT)
   └─ waste_percentage (DECIMAL)

5. user_settings
   ├─ id (UUID)
   ├─ user_id (UUID, FK auth.users)
   ├─ user_name (TEXT)
   ├─ currency (TEXT)
   └─ tax_percentage (DECIMAL)
```

**Ver:** `/REPLICACION_MAIN_APP_COMPLETA.md` sección "Schema de Base de Datos" para SQL completo

---

## 🎨 Diseño en Figma

### Prompt Completo:
📄 **Ver:** `/FIGMA_PROMPT_MAIN_APP.md`

### Páginas a Diseñar:

1. **Dashboard** (Desktop 1440×900)
   - Card de categoría más rentable
   - Gráfico de barras de rentabilidad
   - Métricas generales (3 cards)

2. **Inventario** (Desktop 1440×900)
   - Tabla de ingredientes
   - Búsqueda y filtros
   - Modal de agregar/editar ingrediente

3. **Menú** (Desktop 1440×900)
   - Categorías colapsables
   - Cards de platos (grid 4 cols)
   - Modal de crear/editar plato
   - DishDetailSheet (mobile 390×844)

4. **Configuración** (Desktop 1440×900)
   - Perfil
   - Moneda e impuestos
   - Gestión de categorías

### Sistema Visual:
- ✅ IDÉNTICO al lead magnet
- Colors: Gradiente #A6D49F → #7BB97A
- Fonts: Poppins (headings) + Inter (body)
- Radius: 16px (cards), 24px (modals)
- Shadows: Sutiles Level 1 y 2

---

## 📊 Cálculos Implementados

### 1. Costo de Ingrediente (con merma)
```typescript
const baseCost = quantity * pricePerUnit;
const wasteAmount = baseCost * (wastePercentage / 100);
const totalCost = baseCost + wasteAmount;
```

### 2. Precio Neto (después de impuestos)
```typescript
const taxAmount = publicPrice * (taxPercentage / 100);
const netPrice = publicPrice - taxAmount;
```

### 3. Margen de Beneficio
```typescript
const margin = ((netPrice - cost) / netPrice) * 100;
```

### 4. Costo % y Beneficio %
```typescript
const costPercentage = (totalCost / netPrice) * 100;
const profitPercentage = 100 - costPercentage;
```

---

## 🚀 Plan de Implementación

### Fase 1: Setup (2-3 días)
- [ ] Crear tablas en Supabase (SQL)
- [ ] Configurar RLS policies
- [ ] Poblar categorías default
- [ ] Setup hooks de Supabase

### Fase 2: Componentes Base (3-4 días)
- [ ] Copiar `DishDetailSheet.tsx` exacto
- [ ] Crear `CategoryProfitabilityCard.tsx`
- [ ] Crear `ProfitabilityBarChart.tsx`
- [ ] Crear `InventoryTable.tsx`
- [ ] Crear `Sidebar.tsx`

### Fase 3: Páginas (4-5 días)
- [ ] Dashboard principal
- [ ] Inventario de ingredientes
- [ ] Menú de platos
- [ ] Configuración

### Fase 4: Modificaciones Clave (2 días)
- [ ] Modificar modal de crear plato
- [ ] Deshabilitar creación de ingredientes nuevos
- [ ] Agregar validaciones de inventario
- [ ] Integrar cálculos de rentabilidad

### Fase 5: Testing (2-3 días)
- [ ] Verificar cálculos de márgenes
- [ ] Probar conversión de unidades
- [ ] Validar merma de ingredientes
- [ ] Testing de DishDetailSheet
- [ ] Testing de gráficos

**Total estimado:** 13-17 días

---

## 📁 Archivos de Referencia

### Lead Magnet (Código Actual):
```
/components/MenuScreen.tsx
  - Líneas 437-486: Cálculo de rentabilidad por categoría
  - Líneas 682-850: Creación de platos

/components/DishDetailSheet.tsx
  - TODO el archivo (525 líneas)
  - Replicar EXACTO al 100%

/components/IngredientCombobox.tsx
  - Modificar: allowCreateNew={false}

/hooks/useSupabase.ts
  - useDishesWithIngredients()
  - useMenuCategories()
  - useInventoryItems()
  - useUserSettings()
```

### Main App (A Crear):
```
/components/CategoryProfitabilityCard.tsx [NUEVO]
/components/ProfitabilityBarChart.tsx [NUEVO]
/components/InventoryTable.tsx [NUEVO]
/components/Sidebar.tsx [NUEVO]

/pages/Dashboard.tsx [NUEVO]
/pages/Inventory.tsx [NUEVO]
/pages/Menu.tsx [NUEVO]
/pages/Settings.tsx [NUEVO]
```

---

## ⚠️ Puntos Críticos

### 1. DishDetailSheet DEBE ser exacto
- ❌ No modificar styling
- ❌ No cambiar estructura
- ✅ Solo ajustar props si necesario
- ✅ Mantener todos los cálculos

### 2. Ingredientes solo del inventario
- ❌ No permitir crear nuevos en modal de plato
- ✅ Validar que exista inventario antes de crear plato
- ✅ Mostrar mensaje si inventario vacío

### 3. Cálculos de margen con impuestos
- ✅ Usar `calculateNetPrice()`
- ✅ Aplicar tax_percentage de user_settings
- ✅ Mostrar precio público, impuestos y neto separados

### 4. Sistema visual consistente
- ✅ Usar Guidelines.md del lead magnet
- ✅ Colores exactos
- ✅ Typography scale exacta
- ✅ Componentes de shadcn/ui

---

## 📞 Próximos Pasos

1. **Leer documentación completa:**
   - 📄 `/REPLICACION_MAIN_APP_COMPLETA.md` (Código y schemas)
   - 📄 `/FIGMA_PROMPT_MAIN_APP.md` (Diseño detallado)

2. **Diseñar en Figma:**
   - Usar prompt de `/FIGMA_PROMPT_MAIN_APP.md`
   - Crear todas las páginas
   - Exportar components library

3. **Ejecutar SQL en Supabase:**
   - Crear tablas
   - Configurar RLS
   - Poblar datos default

4. **Desarrollar componentes:**
   - Copiar DishDetailSheet exacto
   - Crear componentes nuevos
   - Integrar con hooks de Supabase

5. **Testing exhaustivo:**
   - Validar cálculos
   - Probar flujos completos
   - Verificar datos en BD

---

## 🎯 Checklist Rápido

- [ ] Leer `/REPLICACION_MAIN_APP_COMPLETA.md`
- [ ] Leer `/FIGMA_PROMPT_MAIN_APP.md`
- [ ] Diseñar en Figma (4 páginas + modals)
- [ ] Ejecutar SQL en Supabase
- [ ] Copiar DishDetailSheet.tsx exacto
- [ ] Crear nuevos componentes
- [ ] Modificar creación de platos (solo inventario)
- [ ] Testing de cálculos
- [ ] Testing de UI/UX

---

**Documentos generados:**
1. ✅ `/REPLICACION_MAIN_APP_COMPLETA.md` - Código y schemas
2. ✅ `/FIGMA_PROMPT_MAIN_APP.md` - Diseño en Figma
3. ✅ `/RESUMEN_EJECUTIVO_REPLICACION.md` - Este documento

**Todo listo para empezar! 🚀**
