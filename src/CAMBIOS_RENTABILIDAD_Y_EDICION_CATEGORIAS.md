# ✅ Cambios Implementados: Rentabilidad Gradual + Edición de Categorías

## 🎯 Resumen de Cambios

### 1. **Escala Gradual de Rentabilidad** (eliminados umbrales fijos)

#### ❌ Antes:
```typescript
// Sistema de 3 colores con juicios de valor
if (margin >= 65) return 'Saludable' (verde)
if (margin >= 50) return 'Ajustar' (naranja)
else return 'Riesgo' (rojo)
```

#### ✅ Ahora:
```typescript
// Escala gradual de 5 tonos verdes (sin juicios)
margin >= 80: #4e9643 (verde oscuro intenso)
margin >= 60: #7BB97A (verde principal)
margin >= 40: #8BC980 (verde medio-claro)
margin >= 20: #A6D49F (verde muy claro)
else: #9FB3A8 (gris-verde neutro)
```

**Resultado:**
- ✅ Badge muestra solo el porcentaje (`42%` en vez de "Ajustar")
- ✅ Color gradual sin categorización binaria
- ✅ Leyenda del gráfico eliminada
- ✅ Tooltip descriptivo: "Compara los márgenes entre categorías. Tonos más oscuros = mayor rentabilidad"

---

### 2. **Objetivos de Rentabilidad por Categoría**

#### Nuevas Columnas en BD:
```sql
menu_categories
  ├─ target_cost_percentage (DECIMAL 5,2)     -- Ej: 30.00
  └─ target_margin_percentage (DECIMAL 5,2)   -- Ej: 70.00
```

**Regla:** `target_cost + target_margin = 100`

#### Formulario de Nueva/Editar Categoría:

```tsx
┌─────────────────────────────────────┐
│ Objetivo de Rentabilidad (Opcional) │
├─────────────────────────────────────┤
│ [Costo MP %] [Margen Neto %]       │  ← Toggle
│                                     │
│ Valor: [30] %                       │  ← Input 0-100
│                                     │
│ Distribución automática:            │
│ Costo: 30%  |  Margen: 70%         │  ← Preview
└─────────────────────────────────────┘
```

**Ejemplo de uso futuro:**
- Categoría "Postres" → Target: 25% costo / 75% margen
- Categoría "Bebidas" → Target: 15% costo / 85% margen
- Al comparar platos vs. target, se calcula varianza y se sugieren ajustes

---

### 3. **Edición de Categorías** (SIN pérdida de datos)

#### 🔐 Seguridad de Relaciones:

```sql
-- Los platos apuntan a categorías por UUID, no por nombre
dishes.category_id → menu_categories.id
  
Ejemplo:
  Plato "Tacos"
    ├─ category_id: "abc-123"  ← NUNCA cambia
  
  Categoría
    ├─ id: "abc-123"           ← NUNCA cambia
    ├─ name: "Antojitos"       ← PUEDE cambiar
    ├─ emoji: "🍴"             ← PUEDE cambiar
    └─ targets: 30/70          ← PUEDE cambiar
```

**✅ Resultado:** Cambiar nombre/emoji/targets NO afecta relación con platos

#### Nuevo Botón en Header de Categoría:

```tsx
┌──────────────────────────────────┐
│ 🌮 Tacos (3 platos • 65% margen) │
│                     [✏️][👁️][▼] │  ← Botón Edit agregado
└──────────────────────────────────┘
```

#### Flujo de Edición:

1. Click en ✏️ (Edit2)
2. Dialog se abre pre-poblado con:
   - Nombre actual
   - Emoji actual
   - Targets actuales (si existen)
3. Usuario modifica lo que quiera
4. Click en "Guardar cambios"
5. `updateMenuCategory()` actualiza solo esa categoría
6. Platos mantienen su `category_id` intacto

---

## 📝 Archivos Modificados

### 1. `/components/MenuScreen.tsx`
- ✅ Funciones `getMarginColor()` y `getMarginBadge()` reescritas
- ✅ State agregado: `editingCategory`, `showEditCategoryDialog`
- ✅ State de form: `newCategoryTargetType`, `newCategoryTargetValue`
- ✅ Botón Edit2 en header de categoría
- ✅ Dialog de edición (idéntico al de crear, pero pre-poblado)
- ✅ Función `handleUpdateCategory()`
- ✅ Función `handleCreateCategory()` actualizada para guardar targets
- ✅ Gráfico actualizado: colores graduales + leyenda removida
- ✅ Badge de plato: muestra solo `%` con color gradual

### 2. `/lib/supabase-helpers.ts`
- ✅ `createMenuCategory()`: acepta `target_cost_percentage`, `target_margin_percentage`
- ✅ `updateMenuCategory()`: acepta `target_cost_percentage`, `target_margin_percentage`

### 3. `/AGREGAR_TARGET_RENTABILIDAD.sql`
- ✅ Script SQL con instrucciones claras
- ✅ Agrega 2 columnas opcionales (DECIMAL 5,2)
- ✅ NO modifica datos existentes
- ✅ Includes queries de verificación

---

## 🚀 Pasos Siguientes (Para el Usuario)

### Paso 1: Ejecutar SQL
```bash
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar/pegar contenido de AGREGAR_TARGET_RENTABILIDAD.sql
3. Click en "Run"
4. Verificar que aparecen 2 columnas nuevas
```

### Paso 2: Probar en la App
```bash
1. Crear nueva categoría → Definir targets (ej: 30% costo)
2. Ver que se guarda correctamente
3. Editar categoría existente → Click en ✏️
4. Cambiar nombre/emoji/targets
5. Verificar que platos siguen en la categoría
```

### Paso 3: Ver Escala Gradual
```bash
1. Ver gráfico de rentabilidad → Barras con tonos verdes graduales
2. Ver badges de platos → Solo muestran % con color gradual
3. Tooltip en gráfico → "Compara los márgenes..."
```

---

## 🎨 Cambios Visuales

### Antes vs. Después

#### Gráfico:
```diff
Antes:
┌─────────────────────────┐
│ ████ Verde (≥65%)       │
│ ████ Naranja (50-64%)   │
│ ████ Rojo (<50%)        │
│ [■ ≥65%] [■ 50-64%] [■ <50%] ← Leyenda
└─────────────────────────┘

Después:
┌─────────────────────────┐
│ ████ (80%) ← #4e9643    │
│ ████ (65%) ← #7BB97A    │
│ ████ (45%) ← #8BC980    │
│ ████ (25%) ← #A6D49F    │
│ "Tonos más oscuros = mayor rentabilidad"
└─────────────────────────┘
```

#### Badge de Plato:
```diff
Antes:
[Saludable] 67% margen     (verde)
[Ajustar] 55% margen       (naranja)
[Riesgo] 42% margen        (rojo)

Después:
[67%] margen               (verde oscuro #4e9643)
[55%] margen               (verde principal #7BB97A)
[42%] margen               (verde medio #8BC980)
```

---

## 🔍 Testing Checklist

- [ ] SQL ejecutado sin errores
- [ ] Columnas `target_cost_percentage` y `target_margin_percentage` existen
- [ ] Crear nueva categoría con targets → Se guarda correctamente
- [ ] Crear nueva categoría SIN targets → Se guarda con NULL
- [ ] Editar categoría: cambiar nombre → Platos siguen ahí
- [ ] Editar categoría: cambiar emoji → Platos siguen ahí
- [ ] Editar categoría: cambiar targets → Se actualiza correctamente
- [ ] Gráfico muestra colores graduales (no 3 colores fijos)
- [ ] Leyenda del gráfico NO aparece
- [ ] Badges muestran solo `%` con color gradual
- [ ] Botón ✏️ (Edit) aparece en todas las categorías

---

## 🐛 Troubleshooting

### Error: "column does not exist"
**Solución:** Ejecutar el script SQL `AGREGAR_TARGET_RENTABILIDAD.sql`

### Error: "Los platos desaparecieron al editar categoría"
**Solución:** Imposible. Las relaciones usan `category_id` (UUID), no nombres.

### Error: "Los targets no se guardan"
**Solución:** Verificar que las funciones `createMenuCategory` y `updateMenuCategory` en `supabase-helpers.ts` incluyen los campos `target_cost_percentage` y `target_margin_percentage`

### Los colores no se ven graduales
**Solución:** Verificar que las funciones `getMarginColor()` y `getMarginBadge()` están usando la nueva lógica (5 tonos en vez de 3)

---

## 📊 Métricas de Código

- **Líneas modificadas:** ~250
- **Archivos modificados:** 3
- **Nuevas funciones:** 1 (`handleUpdateCategory`)
- **Nuevos dialogs:** 1 (Edit Category)
- **Columnas SQL nuevas:** 2
- **Breaking changes:** 0 ✅

---

**Versión:** 1.0  
**Fecha:** 2024-11-08  
**Estado:** ✅ Implementado y listo para testing
