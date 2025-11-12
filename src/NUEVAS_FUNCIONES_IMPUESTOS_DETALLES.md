# 🎉 Nuevas Funciones: Impuestos y Vista Detallada de Platos

## ✅ Cambios Implementados

### 1. **Campo de Impuestos Global** 🧾

**Ubicación:** Configuración de cuenta (Settings)

**Características:**
- Campo de porcentaje de impuestos (0-100%)
- Se guarda a nivel de usuario en `user_settings`
- Se aplica automáticamente a todos los platos
- Se pre-llena en nuevos platos

**Cómo usar:**
1. Click en el ícono de Settings (⚙️)
2. Sección "Preferencias"
3. Campo "Impuestos (%)"
4. Ingresa el porcentaje (ej: 4.00 para 4%)
5. Click "Guardar cambios"

**Ejemplo:**
```
Impuestos: 4.00%

Plato 1: $100 → Impuestos: $4.00 → Neto: $96.00
Plato 2: $50  → Impuestos: $2.00 → Neto: $48.00
```

---

### 2. **Vista Detallada de Platos** 📊

**Cómo acceder:**
- Click en cualquier plato de la lista
- O click en "Ver detalles"

**Información mostrada:**

#### A. Resumen de Precios (header oscuro)
```
┌─────────────────────────────────────────┐
│ PRECIO DE VENTA AL PÚBLICO    $15.00   │
│ IMPUESTOS %                   4.00%    │
├─────────────────────────────────────────┤
│ PRECIO DE VENTA NETO          $14.40   │
└─────────────────────────────────────────┘
```

#### B. Resumen de Costos (card verde claro)
```
┌─────────────────────────────────────────┐
│ COSTO TOTAL DE LA RECETA      $4.32    │
│ % COSTO DE LA RECETA          29.98%   │
│ ─────────────────────────────────────  │
│ MARGEN DE BENEFICIO NETO      $10.08   │
└─────────────────────────────────────────┘
```

#### C. Gráfico Circular (Pie Chart)
- **Naranja:** Costo Total (%)
- **Verde:** Beneficio Neto (%)
- Muestra visualmente la distribución del margen

#### D. Tabla de Ingredientes
```
┌────────────────┬──────────┬────────┬────────────┐
│ Nombre         │ Cantidad │ Coste  │ Coste Total│
│                │ (gr/ml)  │ (kg/lt)│            │
├────────────────┼──────────┼────────┼────────────┤
│ Salmón fresco  │   400    │  7.95  │    3.18    │
│ Patatas        │   350    │  1.55  │    0.54    │
│ Pimiento verde │   100    │  1.30  │    0.13    │
│ ...            │   ...    │  ...   │    ...     │
├────────────────┴──────────┴────────┼────────────┤
│                    COSTE TOTAL     │    4.32    │
└────────────────────────────────────┴────────────┘
```

**Acciones:**
- **Editar:** Abre el formulario de edición (próximamente)
- **X (Cerrar):** Cierra la vista detallada

---

## 🔧 Cambios Técnicos

### Archivos Modificados

#### 1. `/components/MenuScreen.tsx`
- ✅ Agregado estado `taxPercentage`
- ✅ Agregado estado `selectedDishForDetail`
- ✅ Agregado estado `showDishDetail`
- ✅ Actualizado `handleSaveAccountSettings` para guardar impuestos
- ✅ Actualizado useEffect para cargar impuestos desde settings
- ✅ Agregado campo de impuestos en Settings UI
- ✅ Click en plato abre vista detallada
- ✅ Import de `DishDetailSheet`

#### 2. `/components/DishDetailSheet.tsx` (NUEVO)
- ✅ Componente completo de vista detallada
- ✅ Cálculo de impuestos sobre precio de venta
- ✅ Precio neto = Precio - Impuestos
- ✅ Margen neto = Precio neto - Costo total
- ✅ Gráfico circular (Pie Chart) con Recharts
- ✅ Tabla de ingredientes con cantidades y costos
- ✅ Botón de editar (placeholder)
- ✅ Diseño responsive con Sheet de bottom drawer

#### 3. `/lib/supabase-helpers.ts`
- ✅ Agregado `tax_percentage` a `createUserSettings`
- ✅ Agregado `tax_percentage` a `updateUserSettings`

#### 4. `/AGREGAR_IMPUESTOS_COLUMNA.sql` (NUEVO)
- ✅ Script SQL para agregar columna `tax_percentage` a `user_settings`

---

## 🚀 Configuración Requerida

### PASO 1: Ejecutar Script SQL

**Ubicación:** Supabase → SQL Editor

```sql
-- Agregar columna tax_percentage a user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 0.00 
CHECK (tax_percentage >= 0 AND tax_percentage <= 100);
```

### PASO 2: Refresca la App
- F5 o Cmd+R

### PASO 3: Configura tus Impuestos
1. Click Settings (⚙️)
2. Sección "Preferencias"
3. Campo "Impuestos (%)"
4. Ingresa tu porcentaje (ej: 4 para 4%)
5. Click "Guardar cambios"

### PASO 4: Prueba
1. Crea un plato nuevo
2. Click en el plato
3. Verás toda la información detallada con impuestos

---

## 📊 Fórmulas de Cálculo

### Cálculo de Impuestos
```javascript
const taxAmount = salePrice * (taxPercentage / 100);
const netSalePrice = salePrice - taxAmount;
```

**Ejemplo:**
```
Precio de venta: $15.00
Impuestos: 4%
Tax amount: $15.00 × 0.04 = $0.60
Precio neto: $15.00 - $0.60 = $14.40
```

### Cálculo de Margen Neto
```javascript
const totalCost = sum(ingredientCosts);
const netProfit = netSalePrice - totalCost;
const costPercentage = (totalCost / netSalePrice) * 100;
```

**Ejemplo:**
```
Precio neto: $14.40
Costo total: $4.32
Margen neto: $14.40 - $4.32 = $10.08
% Costo: ($4.32 / $14.40) × 100 = 30%
% Beneficio: 100 - 30 = 70%
```

---

## 🎨 Diseño Visual

### Colores del Gráfico
- **Costo Total:** `#F59E0B` (Naranja)
- **Beneficio Neto:** `#7BB97A` (Verde)

### Header Oscuro
- Background: Gradiente `#2F3A33` → `#1A1A1A`
- Texto: Blanco
- Botón Editar: Fondo blanco

### Cards
- Background precio: `#2F3A33` (Oscuro)
- Background costos: `#F5FAF7` (Verde suave)
- Borders: `#CFE0D8`

### Tabla
- Header: `#F5FAF7` (Verde suave)
- Hover rows: `#F5FAF7`
- Footer: `#2F3A33` (Oscuro)

---

## 🔮 Funcionalidades Futuras

### Edición de Platos
- Click "Editar" abrirá formulario pre-llenado
- Permitirá modificar ingredientes y precio
- Actualizará plato existente

### Exportar/Compartir
- PDF de la ficha del plato
- Compartir vía WhatsApp/Email
- Imprimir ficha técnica

### Análisis Avanzado
- Comparar márgenes entre platos
- Sugerencias de optimización
- Alertas de platos poco rentables

---

## 📱 Flujo de Usuario

### Flujo Completo: Crear y Ver Plato

```
1. Configurar impuestos (una vez)
   └─> Settings → Impuestos: 4%

2. Crear plato
   └─> + Agregar plato
       └─> Nombre: "Salmón al horno"
       └─> Categoría: Platos Fuertes
       └─> Ingredientes:
           ├─> Salmón: 400gr @ $7.95/kg
           ├─> Patatas: 350gr @ $1.55/kg
           └─> Pimiento: 100gr @ $1.30/kg
       └─> Precio venta: $15.00
       └─> Guardar

3. Ver detalles
   └─> Click en plato
       └─> Vista completa:
           ├─> Precio público: $15.00
           ├─> Impuestos: $0.60 (4%)
           ├─> Precio neto: $14.40
           ├─> Costo total: $4.32
           ├─> Margen neto: $10.08
           ├─> Gráfico: 70% beneficio / 30% costo
           └─> Tabla de ingredientes detallada
```

---

## 🐛 Troubleshooting

### Error: "tax_percentage column not found"
**Solución:** Ejecuta el script SQL `/AGREGAR_IMPUESTOS_COLUMNA.sql`

### No veo el campo de impuestos en Settings
**Solución:** 
1. Ejecuta el script SQL
2. Refresca la app (F5)
3. Cierra sesión y vuelve a iniciar

### El gráfico no se muestra
**Solución:** 
- Recharts ya está importado
- Verifica que el plato tenga precio > 0
- Verifica que tenga ingredientes

### Los cálculos están incorrectos
**Verifica:**
- Impuestos configurados correctamente (0-100)
- Precio de venta > 0
- Ingredientes con precio y cantidad

---

## 💡 Tips de Uso

### Mejores Prácticas

**Impuestos:**
- Configura una vez al inicio
- Usa el valor exacto de tu región
- Revisa periódicamente si cambia la legislación

**Precios:**
- Considera impuestos al fijar precio de venta
- Mantén márgenes saludables (>60%)
- Revisa costos de ingredientes regularmente

**Análisis:**
- Revisa vista detallada de cada plato
- Identifica platos con bajo margen
- Optimiza cantidades de ingredientes

---

## 📋 Checklist de Validación

- [ ] Ejecuté el script SQL de impuestos
- [ ] Refresqué la app
- [ ] Veo el campo de impuestos en Settings
- [ ] Guardé mi porcentaje de impuestos
- [ ] Creé un plato de prueba
- [ ] Click en el plato abre la vista detallada
- [ ] Veo el cálculo de impuestos correctamente
- [ ] Veo el precio neto
- [ ] Veo el margen de beneficio neto
- [ ] Veo el gráfico circular
- [ ] Veo la tabla de ingredientes completa
- [ ] Los cálculos son correctos
- [ ] Puedo cerrar la vista detallada

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Archivos nuevos:** 2 (DishDetailSheet.tsx, AGREGAR_IMPUESTOS_COLUMNA.sql)  
**Archivos modificados:** 2 (MenuScreen.tsx, supabase-helpers.ts)  
**Estado:** ✅ Completo y funcional
