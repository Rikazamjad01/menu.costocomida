# 🎯 Cómo Funciona el Sistema de Ingredientes

## ✅ Flujo Completo Reparado

### 1️⃣ **Buscar Ingrediente Existente**

**Acción:** Click en "Buscar ingrediente..."

**Resultado:**
- Se abre dropdown con ingredientes guardados
- Muestra: nombre, precio/unidad, % merma

**Ejemplo:**
```
[Buscar ingrediente... ▼]
  
  🔍 Buscar o escribir nuevo...
  
  ✓ Lechuga                $15.00/kg
    Merma: 10%
    
  ✓ Tomate                 $20.00/kg
    Merma: 5%
    
  + Agregar nuevo ingrediente
```

---

### 2️⃣ **Seleccionar Ingrediente Existente**

**Acción:** Click en "Lechuga"

**Resultado:** ✅ AUTO-RELLENO
- ✅ Unidad de compra: `kg`
- ✅ Precio/kg: `$15.00`
- ✅ % Merma: `10%`
- 🔒 Campos bloqueados (pero editables con botón "Editar")

**Qué completar:**
- Unidad en plato: `gramos`
- Cantidad: `200`

---

### 3️⃣ **Crear Ingrediente Nuevo (Opción A)**

**Acción:** Escribir nombre nuevo y presionar Enter o click en botón

**Ejemplo:**
```
🔍 Buscar o escribir nuevo...
    [Aguacate________]
    
    No se encontró "Aguacate"
    
    [+ Crear "Aguacate"]  ← Click aquí
```

**Resultado:**
- ✅ Nombre: `Aguacate` (ya capturado)
- Badge: "Nuevo ingrediente - se guardará para uso futuro"
- Campos habilitados para llenar:
  - Unidad de compra
  - Precio/unidad
  - Unidad en plato
  - Cantidad
  - % Merma

---

### 4️⃣ **Crear Ingrediente Nuevo (Opción B)**

**Acción:** Click en "+ Agregar nuevo ingrediente" (al final del dropdown)

**Resultado:**
- Se cierra dropdown
- Campos habilitados
- Usuario completa todo manualmente

---

### 5️⃣ **Editar Ingrediente Existente**

**Acción:** Click en botón "✏️ Editar" 

**Antes:**
```
Ingrediente 1                    [Guardado]  [✏️]
─────────────────────────────────────────────────
Unidad de compra: kg             🔒 (bloqueado)
Precio/kg: $15.00                🔒 (bloqueado)
% Merma: 10%                     🔒 (bloqueado)
```

**Después:**
```
Ingrediente 1                    [Guardado]  [✖️]
─────────────────────────────────────────────────
Unidad de compra: [kg ▼]         ✏️ (editable)
Precio/kg: [$15.00]              ✏️ (editable)
% Merma: [10]                    ✏️ (editable)
```

---

## 📊 Ejemplo Completo: Crear Plato "Ensalada César"

### Paso 1: Nombre del plato
```
Nombre del plato
[Ensalada César____________]
```

### Paso 2: Ingrediente 1 - Lechuga (existente)
```
Ingrediente 1                            [Guardado]  [✏️]
──────────────────────────────────────────────────────────
[Lechuga ▼]  ← Click selecciona existente

Auto-relleno:
✅ Unidad de compra: kg
✅ Precio/kg: $15.00
✅ % Merma: 10%

Completar:
Unidad en plato: [gramos ▼]
Cantidad: [200]

Cálculo automático:
💰 Costo: $3.33
```

### Paso 3: Ingrediente 2 - Aderezo César (nuevo)
```
Ingrediente 2
──────────────────────────────────────────────────────────
[Buscar ingrediente... ▼]
  🔍 [Aderezo César___]
  
  No se encontró "Aderezo César"
  [+ Crear "Aderezo César"]  ← Click aquí

Completar:
Unidad de compra: [lt ▼]
Precio/lt: [$80.00]
Unidad en plato: [ml ▼]
Cantidad: [50]
% Merma: [5]

Cálculo automático:
💰 Costo: $4.21
```

### Paso 4: Merma del plato
```
% Merma del plato completo
[3]  (se aplica sobre el costo total)

Ej: platos que se rompen, se queman, etc.
```

### Paso 5: Resumen de costos
```
┌──────────────────────────────────┐
│ Costo ingredientes     $7.54     │
│ + Merma del plato (3%)  $0.23    │
├──────────────────────────────────┤
│ Costo total           $7.77      │
├──────────────────────────────────┤
│ Margen                68.5%      │
│ [Saludable]                      │
└──────────────────────────────────┘
```

### Paso 6: Precio de venta
```
Precio de venta
[$25.00________________]
```

### Paso 7: Guardar
```
[Guardar plato]  ← ✅ Click para guardar
```

**Resultado:**
- ✅ Plato guardado
- ✅ "Lechuga" ya existía (se reutiliza)
- ✅ "Aderezo César" se guarda en inventario
- ✅ Próxima vez que uses "Aderezo César", se auto-rellena

---

## 🔍 Troubleshooting

### ❌ "No puedo seleccionar ingredientes"
**Solución:** Ya corregido. El combobox ahora funciona correctamente.

### ❌ "Click en 'Agregar nuevo' no hace nada"
**Solución:** Ya corregido. Ahora captura el nombre que escribiste.

### ❌ "El ingrediente no se guarda"
**Verifica:**
1. ¿Completaste todos los campos?
   - Nombre ✓
   - Precio ✓
   - Cantidad ✓
2. ¿Seleccionaste una categoría para el plato?
3. ¿Pusiste precio de venta?

**Si falta algo, verás un toast de error:**
```
❌ Completa los campos requeridos
   Nombre del plato, ingredientes con cantidad y precio.
```

### ❌ "Los cálculos no son correctos"
**Recuerda:**
- Merma del ingrediente: `10%` significa que de 100g comprados, solo uso 90g
- Merma del plato: `5%` se aplica sobre el costo total de ingredientes
- Las unidades se convierten automáticamente (kg → gramos, lt → ml)

---

## 🎯 Checklist de Validación

Antes de reportar un problema, verifica:

- [ ] Ejecuté el script SQL para agregar `wastage_percentage`
- [ ] El combobox se abre al hacer click
- [ ] Puedo buscar ingredientes existentes
- [ ] Al seleccionar existente, se auto-rellena precio y merma
- [ ] Al escribir nuevo nombre, aparece botón "Crear [nombre]"
- [ ] Click en "Crear" captura el nombre correctamente
- [ ] Click en "+ Agregar nuevo ingrediente" funciona
- [ ] Los cálculos muestran costos correctos
- [ ] Puedo editar ingredientes existentes con botón "Editar"
- [ ] El plato se guarda correctamente
- [ ] Los ingredientes nuevos aparecen en próximos platos

---

## 📝 Notas Importantes

1. **Los ingredientes se comparten entre platos:**
   - Guardas "Tomate" una vez con precio $20/kg y merma 5%
   - Próximo plato: "Tomate" ya está guardado con esos valores

2. **Puedes modificar valores para un plato específico:**
   - Click en "Editar" permite cambiar precio/merma para este plato
   - No afecta el ingrediente guardado en inventario
   - Útil si compraste a diferente precio esta vez

3. **Conversión automática de unidades:**
   - Compra: kg → Uso: gramos ✅
   - Compra: lt → Uso: ml ✅
   - No necesitas calcular, el sistema lo hace

4. **La merma incrementa el costo:**
   - Sin merma: $20/kg = $0.02/g
   - Con 10% merma: $20/(1kg * 0.9) = $0.0222/g
   - El costo es mayor porque pagas por lo que se desperdicia

---

**Versión:** 1.2  
**Fecha:** Noviembre 2024  
**Estado:** ✅ Funcionando correctamente
