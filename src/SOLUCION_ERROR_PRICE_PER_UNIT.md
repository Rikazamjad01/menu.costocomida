# 🔧 Solución: Error price_per_unit y Simplificación de Unidades

## ❌ Error que Estabas Viendo

```
Error saving dish: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'price_per_unit' column of 'inventory_items' in the schema cache"
}
```

## ✅ Cambios Aplicados en el Código

### 1. Simplificación de Unidades ✅
- **Antes:** Aparecían "g" y "gramos" (duplicados)
- **Ahora:** Solo aparece "gr" (limpio y simple)
- Actualizado en:
  - `/components/IngredientFormItem.tsx`
  - `/components/MenuScreen.tsx`
  - Lógica de conversión de unidades

### 2. Merma es Opcional ✅
- La merma del ingrediente es **opcional** (default: 0%)
- La merma del plato completo es **opcional** (default: 0%)
- Solo son **obligatorios**:
  - ✅ Nombre del ingrediente
  - ✅ Cantidad en plato
  - ✅ Precio por unidad de compra
  - ✅ Unidad de compra
  - ✅ Unidad en plato

---

## 🚨 ACCIÓN REQUERIDA: Ejecutar Script SQL

Para que el guardado de platos funcione, **DEBES ejecutar este script en Supabase**:

### 📝 PASO 1: Abre Supabase SQL Editor
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** en el menú lateral

### 📝 PASO 2: Copia y Ejecuta Este Script

```sql
-- =====================================================
-- FIX: Agregar columnas faltantes a inventory_items
-- =====================================================

-- Agregar price_per_unit (columna principal faltante)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10, 2) DEFAULT 0.00 CHECK (price_per_unit >= 0);

-- Agregar wastage_percentage (merma del ingrediente)
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (wastage_percentage >= 0 AND wastage_percentage <= 100);

-- Agregar user_id para aislamiento multi-tenant
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Users can manage their own inventory" ON inventory_items;

-- Crear política RLS para que cada usuario vea solo sus ingredientes
CREATE POLICY "Users can manage their own inventory"
  ON inventory_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verificar que las columnas se crearon correctamente
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;
```

### 📝 PASO 3: Ejecuta el Script
- Click en **Run** (o presiona `Cmd/Ctrl + Enter`)
- Espera a que termine (debería tomar 1-2 segundos)

### 📝 PASO 4: Verifica el Resultado
Deberías ver una tabla con todas las columnas de `inventory_items`, incluyendo:
- ✅ `id`
- ✅ `name`
- ✅ `unit`
- ✅ `price_per_unit` ← **ESTA ES LA CLAVE**
- ✅ `wastage_percentage`
- ✅ `user_id`
- ✅ `category`
- ✅ `emoji`
- ✅ `created_at`
- ✅ `updated_at`

### 📝 PASO 5: Refresca la App
- Vuelve a tu app
- Presiona `F5` o `Cmd+R`

---

## 🧪 Prueba que Todo Funciona

### Test 1: Crear Plato con Ingrediente Nuevo
1. Click "**+ Agregar plato**"
2. Nombre: "Ensalada César"
3. Categoría: Selecciona una
4. Click en el combobox de ingredientes
5. Escribe: "**Lechuga Romana**"
6. Click "**Crear 'Lechuga Romana'**"
7. Completa:
   - Unidad de compra: `kg`
   - Precio/kg: `15`
   - Unidad en plato: `gr`
   - Cantidad: `200`
   - % Merma: `10` (o déjalo en 0 si no hay merma)
8. ✅ Verifica que el costo se calcule automáticamente
9. Precio de venta: `80`
10. Click "**Guardar plato**"
11. ✅ Deberías ver: "**¡Plato agregado!**"

### Test 2: Agregar Ingrediente Existente
1. En el mismo plato o uno nuevo, click "**+ Agregar ingrediente**"
2. Click en el combobox
3. Selecciona "**Lechuga Romana**" (que acabas de crear)
4. ✅ Verifica que se auto-rellenen:
   - Unidad de compra: `kg`
   - Precio/kg: `15`
   - % Merma: `10`
5. Solo tienes que completar:
   - Unidad en plato: `gr`
   - Cantidad: `100`
6. ✅ El costo se calcula automáticamente

---

## 🎯 Unidades Disponibles Ahora

Las unidades han sido simplificadas:

| Unidad | Uso |
|--------|-----|
| `kg` | Kilogramos (compra) |
| `gr` | Gramos (uso en plato) |
| `lt` | Litros (compra) |
| `ml` | Mililitros (uso en plato) |
| `piezas` | Unidades individuales |
| `tazas` | Medida de volumen |
| `unidades` | Genérico |

### Conversiones Automáticas
- `kg` ↔ `gr`: 1 kg = 1000 gr
- `lt` ↔ `ml`: 1 lt = 1000 ml
- Otras unidades: 1:1

---

## 💡 Ejemplo Completo

### Ingrediente: Pollo
- **Unidad de compra:** `kg`
- **Precio/kg:** `$80.00`
- **% Merma del ingrediente:** `15%` (piel, huesos, grasa)

### En el Plato: Tacos de Pollo
- **Unidad en plato:** `gr`
- **Cantidad:** `150` (150 gramos por orden)

### Cálculo Automático:
```
Precio por gramo sin merma: $80 / 1000gr = $0.08/gr
Con 15% merma, solo uso 85% del pollo
Precio real: $0.08 / 0.85 = $0.094/gr
Costo para 150gr: 150gr × $0.094/gr = $14.12
```

✅ **El sistema calcula todo esto automáticamente**

---

## ❓ Si Algo Falla

### Error: "Column not found"
→ ¿Ejecutaste el script SQL?  
→ ¿Refrescaste la app después?

### Error: "User not authenticated"
→ Cierra sesión y vuelve a iniciar  
→ Verifica que estés logueado

### El ingrediente no se guarda
→ ¿Completaste nombre, precio y cantidad?  
→ ¿El precio es mayor a 0?

### Los cálculos están mal
→ Verifica la unidad de compra vs unidad en plato  
→ Verifica que la conversión sea correcta (kg → gr)

---

## 📊 Resumen

| Problema | Estado |
|----------|--------|
| ❌ Error `price_per_unit` | 🔧 **Requiere SQL** |
| ✅ Unidades duplicadas (g, gramos) | ✅ **Corregido → gr** |
| ✅ Merma obligatoria | ✅ **Ahora opcional** |
| ✅ Validaciones | ✅ **Solo campos necesarios** |

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2024  
**Prioridad:** 🚨 CRÍTICA - Ejecutar SQL antes de probar  
**Tiempo estimado:** 2 minutos
