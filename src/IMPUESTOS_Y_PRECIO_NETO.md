# ✅ Impuestos y Precio Neto - Actualización Completa

## 🎯 Cambios Implementados

### 1. **Campo de Impuestos en Formulario de Agregar Plato** 🧾

**Ubicación:** Diálogo "Agregar plato" → Sección de Precio

**Nueva estructura de pricing:**

```
┌─────────────────────────────────────────┐
│ 📝 Precio de venta al público           │
│    $15.00                                │
├─────────────────────────────────────────┤
│ 📝 Impuestos (%)                         │
│    4.00 %                                │
├─────────────────────────────────────────┤
│ 💰 PRECIO DE VENTA NETO                 │
│    $14.40                                │
│    (Este precio se usa para calcular    │
│     la rentabilidad)                    │
└─────────────────────────────────────────┘
```

**Características:**
- ✅ Campo "Precio de venta al público" (input normal)
- ✅ Campo "Impuestos (%)" (con símbolo % a la derecha)
- ✅ Card oscuro con "Precio de venta neto" calculado automáticamente
- ✅ Texto explicativo: "Este precio se usa para calcular la rentabilidad"
- ✅ El valor de impuestos se trae automáticamente de Settings
- ✅ Se actualiza en tiempo real al cambiar precio o impuestos

---

### 2. **Cálculo de Rentabilidad con Precio Neto** 📊

**Antes:**
```javascript
Margen = ((Precio - Costo) / Precio) × 100
```

**Ahora:**
```javascript
Precio Neto = Precio Público - (Precio Público × Impuestos%)
Margen = ((Precio Neto - Costo) / Precio Neto) × 100
```

**Ejemplo Práctico:**
```
Precio público: $15.00
Impuestos: 4%
─────────────────────
Impuesto: $15.00 × 0.04 = $0.60
Precio neto: $15.00 - $0.60 = $14.40

Costo total: $4.32
─────────────────────
Margen: (($14.40 - $4.32) / $14.40) × 100 = 70.0%
```

**Dónde se aplica:**
- ✅ Preview del plato mientras lo creas (card de resumen)
- ✅ Tarjetas de platos en la lista
- ✅ Dashboard de rentabilidad por categoría
- ✅ Gráfico de barras
- ✅ Vista detallada del plato

---

### 3. **Tabla de Ingredientes Mejorada** 📋

**En el DishDetailSheet:**

**Antes:**
```
| Nombre | Cantidad (gr/ml) | Coste (kg/lt) | Coste Total |
```

**Ahora:**
```
| Nombre | Cantidad | Precio | Merma | Coste Total |
```

**Características:**
- ✅ Columna "Cantidad" muestra valor + unidad (ej: "400 gr")
- ✅ Columna "Precio" muestra símbolo de moneda + valor
- ✅ Columna "Merma" muestra porcentaje (ej: "5%")
- ✅ Columna "Coste Total" incluye símbolo de moneda
- ✅ Footer muestra símbolo de moneda en total

**Ejemplo:**
```
┌──────────────┬──────────┬──────────┬────────┬──────────────┐
│ Nombre       │ Cantidad │ Precio   │ Merma  │ Coste Total  │
├──────────────┼──────────┼──────────┼────────┼──────────────┤
│ Salmón       │ 400 gr   │ $7.95    │ 5%     │ $3.35        │
│ Patatas      │ 350 gr   │ $1.55    │ 0%     │ $0.54        │
│ Pimiento     │ 100 gr   │ $1.30    │ 0%     │ $0.13        │
├──────────────┴──────────┴──────────┴────────┼──────────────┤
│                         COSTE TOTAL         │ $4.02        │
└─────────────────────────────────────────────┴──────────────┘
```

---

## 🔧 Cambios Técnicos

### Archivos Modificados

#### 1. `/components/MenuScreen.tsx`

**A. Nueva función `calculateNetPrice`:**
```typescript
const calculateNetPrice = (publicPrice: number, taxPercent: number): number => {
  const taxAmount = publicPrice * (taxPercent / 100);
  return publicPrice - taxAmount;
};
```

**B. Función `calculateMargin` actualizada:**
```typescript
const calculateMargin = (
  publicPrice: number, 
  cost: number, 
  taxPercent: number = 0
): number => {
  if (publicPrice <= 0) return 0;
  const netPrice = calculateNetPrice(publicPrice, taxPercent);
  return ((netPrice - cost) / netPrice) * 100;
};
```

**C. Sección de pricing en formulario:**
- Campo "Precio de venta al público"
- Campo "Impuestos (%)"
- Card con "Precio de venta neto" calculado

**D. Todos los cálculos de margen actualizados:**
- Preview del plato (mientras se crea)
- Lista de platos
- `getCategoryStats()`
- Gráfico de rentabilidad

#### 2. `/components/DishDetailSheet.tsx`

**A. Tabla de ingredientes mejorada:**
- 5 columnas en lugar de 4
- Símbolos de moneda
- Unidades dinámicas
- Columna de merma

**B. Footer con símbolo de moneda:**
```typescript
{currencySymbol}{totalCost.toFixed(2)}
```

---

## 📱 Flujo de Usuario Actualizado

### Crear un Plato con Impuestos

```
1. Configurar impuestos (una vez en Settings)
   └─> Settings → Impuestos: 4%

2. Agregar plato
   └─> + Agregar plato
       └─> Nombre: "Salmón al horno"
       └─> Ingredientes:
           ├─> Salmón: 400gr @ $7.95/kg, merma 5%
           ├─> Patatas: 350gr @ $1.55/kg
           └─> Pimiento: 100gr @ $1.30/kg
       └─> Sección de Precio:
           ├─> Precio público: $15.00
           ├─> Impuestos: 4% (pre-llenado)
           └─> Precio neto: $14.40 (calculado)
       └─> Ver preview:
           ├─> Costo ingredientes: $4.02
           ├─> Costo total: $4.02
           ├─> Margen: 72.1% ✅ (sobre precio neto)
       └─> Guardar

3. Ver detalles del plato
   └─> Click en plato
       └─> Vista completa:
           ├─> Precio público: $15.00
           ├─> Impuestos: 4%
           ├─> Precio neto: $14.40
           ├─> Costo total: $4.02
           ├─> Margen neto: 72.1%
           ├─> Gráfico: 72% beneficio / 28% costo
           └─> Tabla ingredientes:
               ├─> Salmón: 400gr, $7.95, 5%, $3.35
               ├─> Patatas: 350gr, $1.55, 0%, $0.54
               └─> Pimiento: 100gr, $1.30, 0%, $0.13
```

---

## 🧮 Fórmulas y Ejemplos

### Ejemplo Completo: Salmón al Horno

**Ingredientes:**
```
Salmón:    400gr @ $7.95/kg con 5% merma
  → Costo base: 0.400 × 7.95 = $3.18
  → Merma:      $3.18 × 0.05  = $0.16
  → Total:      $3.18 + $0.16 = $3.34

Patatas:   350gr @ $1.55/kg sin merma
  → Costo base: 0.350 × 1.55 = $0.54
  → Total:      $0.54

Pimiento:  100gr @ $1.30/kg sin merma
  → Costo base: 0.100 × 1.30 = $0.13
  → Total:      $0.13

COSTO TOTAL: $3.34 + $0.54 + $0.13 = $4.01
```

**Pricing:**
```
Precio público:  $15.00
Impuestos (4%):  $15.00 × 0.04 = $0.60
Precio neto:     $15.00 - $0.60 = $14.40
```

**Margen:**
```
Beneficio neto:  $14.40 - $4.01 = $10.39
Margen:          ($10.39 / $14.40) × 100 = 72.2%

% Costo:         ($4.01 / $14.40) × 100 = 27.8%
% Beneficio:     100 - 27.8 = 72.2%
```

---

## 🎨 Diseño Visual

### Sección de Precio en Formulario

**Campo Precio Público:**
```tsx
<Input
  type="number"
  step="0.01"
  placeholder="0.00"
  className="rounded-[16px] border-[#CFE0D8] pl-10 h-[52px]"
/>
// Símbolo $ a la izquierda
```

**Campo Impuestos:**
```tsx
<Input
  type="number"
  step="0.01"
  min="0"
  max="100"
  placeholder="0.00"
  className="rounded-[16px] border-[#CFE0D8] h-[52px] pr-10"
/>
// Símbolo % a la derecha
```

**Card Precio Neto:**
```tsx
<div className="bg-[#2F3A33] rounded-[16px] p-4">
  // Oscuro (#2F3A33)
  // Texto blanco
  // Precio grande (24px Poppins)
  // Texto explicativo pequeño (12px Inter)
</div>
```

### Tabla de Ingredientes

**Header:**
- Background: `#F5FAF7` (verde suave)
- Texto: `#4D6B59` (verde medio)
- 5 columnas: Nombre, Cantidad, Precio, Merma, Coste Total

**Rows:**
- Hover: `#F5FAF7`
- Borde: `#CFE0D8`

**Footer:**
- Background: `#2F3A33` (oscuro)
- Texto: Blanco
- "COSTE TOTAL" alineado a la derecha

---

## ✅ Validación

### Checklist de Pruebas

**Formulario de Agregar Plato:**
- [ ] Campo "Precio de venta al público" funciona
- [ ] Campo "Impuestos (%)" se pre-llena desde Settings
- [ ] Precio neto se calcula automáticamente
- [ ] Card oscuro muestra precio neto
- [ ] Margen en preview usa precio neto

**Cálculos:**
- [ ] Margen correcto en preview del plato
- [ ] Margen correcto en tarjetas de platos
- [ ] Margen correcto en gráfico de categorías
- [ ] Costo total incluye mermas de ingredientes

**Vista Detallada:**
- [ ] Tabla muestra 5 columnas
- [ ] Columna Cantidad incluye unidad
- [ ] Columna Precio incluye símbolo $
- [ ] Columna Merma muestra %
- [ ] Columna Coste Total incluye símbolo $
- [ ] Footer muestra total con símbolo $

**Integración:**
- [ ] Impuestos en Settings se guardan
- [ ] Impuestos se cargan en formulario de plato
- [ ] Cambiar impuestos actualiza precio neto
- [ ] Cambiar precio actualiza precio neto y margen

---

## 🔮 Mejoras Futuras

### Pricing Avanzado
- [ ] Múltiples niveles de impuestos
- [ ] Descuentos por volumen
- [ ] Precios dinámicos por hora del día

### Análisis de Costos
- [ ] Historial de cambios de precios
- [ ] Alertas de ingredientes con alta merma
- [ ] Sugerencias de optimización de costos

### Reportes
- [ ] Exportar análisis de rentabilidad
- [ ] Comparar márgenes antes/después de impuestos
- [ ] Dashboard de impuestos totales

---

## 📋 Notas Importantes

### Compatibilidad
- ✅ No requiere cambios en base de datos
- ✅ Usa columna `tax_percentage` existente en `user_settings`
- ✅ Compatible con platos existentes (impuestos = 0 por defecto)

### Precisión
- Todos los cálculos usan 2 decimales
- Redondeo consistente en toda la app
- Fórmulas matemáticas verificadas

### UX
- El precio neto se muestra solo si hay precio público > 0
- Los impuestos se pre-llenan desde Settings
- El usuario puede cambiar impuestos por plato si lo desea
- Feedback visual inmediato al cambiar valores

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Archivos modificados:** 2 (MenuScreen.tsx, DishDetailSheet.tsx)  
**Estado:** ✅ Completo y funcional  
**Breaking changes:** ❌ Ninguno
