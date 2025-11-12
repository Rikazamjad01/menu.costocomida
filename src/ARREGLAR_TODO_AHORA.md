# 🔧 ARREGLAR TODO - Instrucciones Finales

## 🎯 Resumen de Errores

Has encontrado estos errores:

1. ❌ Column `wastage_percentage` does not exist
2. ❌ Column `price` does not exist (debería ser `price_per_unit`)
3. ⚠️ Warning: Missing Description for DialogContent
4. ❌ Login error (necesitas crear una cuenta nueva)

---

## ✅ PASO 1: Ejecutar SQL en Supabase

**Ve a Supabase → SQL Editor y ejecuta esto:**

```sql
-- 1. Agregar wastage_percentage a inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

-- 2. Agregar waste_percentage a dish_ingredients
ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- 3. Verificar que price_per_unit existe (si no, se crea)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'price_per_unit'
  ) THEN
    ALTER TABLE inventory_items 
    ADD COLUMN price_per_unit NUMERIC DEFAULT 0;
    
    -- Si había una columna 'price', copiar los valores
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      AND column_name = 'price'
    ) THEN
      UPDATE inventory_items 
      SET price_per_unit = price 
      WHERE price_per_unit = 0;
    END IF;
  END IF;
END $$;

-- 4. IMPORTANTE: Recargar schema cache
NOTIFY pgrst, 'reload schema';

-- 5. Verificar columnas
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name IN ('price_per_unit', 'wastage_percentage')
ORDER BY column_name;
```

**Resultado esperado:**
```
column_name         | data_type | column_default
─────────────────────────────────────────────
price_per_unit      | numeric   | 0
wastage_percentage  | numeric   | 0
```

✅ Si ves estas 2 columnas, continúa al Paso 2.

---

## ✅ PASO 2: Políticas RLS

```sql
-- Eliminar políticas viejas
DROP POLICY IF EXISTS "Users can view own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can create own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory items" ON inventory_items;

-- Crear políticas correctas
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- Hacer lo mismo para dishes
DROP POLICY IF EXISTS "Users can view own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can create own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can update own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can delete own dishes" ON dishes;

CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dishes"
  ON dishes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dishes"
  ON dishes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dishes"
  ON dishes FOR DELETE USING (auth.uid() = user_id);

-- Y para dish_ingredients
DROP POLICY IF EXISTS "Users can view own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can create own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can update own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can delete own dish ingredients" ON dish_ingredients;

CREATE POLICY "Users can view own dish ingredients"
  ON dish_ingredients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dish ingredients"
  ON dish_ingredients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dish ingredients"
  ON dish_ingredients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dish ingredients"
  ON dish_ingredients FOR DELETE USING (auth.uid() = user_id);
```

---

## ✅ PASO 3: Verificar que Funcionó

```sql
-- Ver todas las columnas de inventory_items
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;
```

**Deberías ver:**
- ✅ `price_per_unit` (numeric)
- ✅ `wastage_percentage` (numeric)

**NO deberías ver:**
- ❌ `price` (si existe, es la columna vieja)

---

## ✅ PASO 4: Limpiar Datos Viejos (Opcional)

Si tienes datos viejos que no funcionan:

```sql
-- Ver cuántos platos e ingredientes tienes
SELECT 
  (SELECT COUNT(*) FROM dishes WHERE user_id = auth.uid()) as dishes_count,
  (SELECT COUNT(*) FROM dish_ingredients WHERE user_id = auth.uid()) as ingredients_count,
  (SELECT COUNT(*) FROM inventory_items WHERE user_id = auth.uid()) as inventory_count;
```

**Si quieres empezar de cero:**

```sql
-- ⚠️ Esto ELIMINA todos tus datos
DELETE FROM dish_ingredients WHERE user_id = auth.uid();
DELETE FROM dishes WHERE user_id = auth.uid();
DELETE FROM inventory_items WHERE user_id = auth.uid();
```

---

## ✅ PASO 5: Recarga la App

1. **En Figma Make:**
   - Presiona **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac)
   - Esto hace un hard refresh

2. **Abre Console (F12)**

3. **Verifica que NO haya errores:**

❌ NO deberías ver:
```
Error: column wastage_percentage does not exist
Error: column price does not exist
406 Not Acceptable
```

✅ DEBERÍAS ver:
```
✅ Active session found: [tu-user-id]
```

---

## ✅ PASO 6: Crear Cuenta Nueva

El error de login dice "Invalid credentials".

**Necesitas crear una cuenta nueva:**

1. En la app, click en **"Crear cuenta"**
2. Llena los datos:
   - Nombre: `Test User`
   - Email: `test@ejemplo.com`
   - Password: `Test123456!`
   - País: México
   - Moneda: MXN
   - Impuesto: 16%

3. Click **"Crear cuenta"**

4. Deberías ver:
   ```
   ✅ User created with confirmed email
   ✅ Auto-login successful
   ✅ User settings created
   ```

---

## ✅ PASO 7: Crear Plato de Prueba

1. Click **"Agregar plato"**

2. Llena:
   - **Nombre:** "Ensalada César"
   - **Categoría:** "Entradas"
   - **Precio:** $120.00

3. **Ingredientes:**
   - Lechuga: 200gr, $40/kg, merma 5%
   - Pollo: 150gr, $80/kg, merma 10%
   - Queso: 50gr, $120/kg, merma 0%

4. Click **"Agregar plato"**

5. **Verifica en Console:**

✅ Deberías ver:
```
✅ Step 1: Creating dish...
✅ Step 1 Complete: Dish created
✅ Step 2: Processing ingredients...
  ✅ Step 2.1: Finding/creating inventory item for "Lechuga"...
  ✅ Step 2.1 Complete: Inventory item
  ✅ Step 2.2: Finding/creating inventory item for "Pollo"...
  ✅ Step 2.2 Complete: Inventory item
  ✅ Step 2.3: Finding/creating inventory item for "Queso"...
  ✅ Step 2.3 Complete: Inventory item
✅ Step 3: Adding ingredients to dish...
🎉 SUCCESS: Dish saved with 3 ingredients
```

❌ NO deberías ver:
```
Error fetching dishes
Error calculating profitability
ERROR saving dish
PGRST204
```

---

## ✅ PASO 8: Abrir el Plato

1. Click en **"Ensalada César"**

2. Deberías ver:

```
┌───────────────────────────────────────┐
│ Ensalada César                $120.00 │
├───────────────────────────────────────┤
│ PRECIO DE VENTA NETO                  │
│ $103.45 (después de 16% impuestos)    │
├───────────────────────────────────────┤
│ COSTO TOTAL DE LA RECETA              │
│ $23.10                                │
│                                       │
│ % COSTO: 22.3%                        │
│ MARGEN: 77.7%                         │
├───────────────────────────────────────┤
│ INGREDIENTES                          │
│                                       │
│ Lechuga  200gr  $40.00/kg   $8.40    │
│          (con 5% merma)               │
│                                       │
│ Pollo    150gr  $80.00/kg   $13.20   │
│          (con 10% merma)              │
│                                       │
│ Queso    50gr   $120.00/kg  $6.00    │
└───────────────────────────────────────┘
```

3. También deberías ver un **gráfico de pie** con:
   - Verde: Beneficio Neto (77.7%)
   - Naranja: Costo (22.3%)

---

## 🆘 Si Algo Sale Mal

### Error: "Schema cache not updated"

```sql
-- Recargar schema manualmente
NOTIFY pgrst, 'reload schema';

-- O reiniciar PostgREST desde Supabase Dashboard
-- Settings → API → Restart
```

### Error: Sigue diciendo "column does not exist"

```sql
-- Verificar que las columnas existen
\d inventory_items

-- O en SQL:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items';
```

Si NO ves `price_per_unit` o `wastage_percentage`:

```sql
-- Crearlas manualmente
ALTER TABLE inventory_items 
ADD COLUMN price_per_unit NUMERIC DEFAULT 0,
ADD COLUMN wastage_percentage NUMERIC DEFAULT 0;

ALTER TABLE dish_ingredients 
ADD COLUMN waste_percentage NUMERIC DEFAULT 0;

NOTIFY pgrst, 'reload schema';
```

### Error: "RLS policies blocking access"

```sql
-- Verificar políticas
SELECT policyname FROM pg_policies 
WHERE tablename = 'inventory_items';
```

Si está vacío, ejecuta el **PASO 2** de nuevo.

### Error: "Invalid login credentials"

Esto significa que el email/password no existe.

**Crea una cuenta nueva:**
1. Click "Crear cuenta"
2. Usa email único: `test+$(date +%s)@ejemplo.com`
3. Password: `Test123456!`

---

## 📋 Checklist Final

Antes de probar:

- [ ] Ejecuté PASO 1 (agregar columnas)
- [ ] Ejecuté PASO 2 (políticas RLS)
- [ ] Ejecuté `NOTIFY pgrst, 'reload schema'`
- [ ] Recargué la app (Ctrl+Shift+R)
- [ ] Console NO muestra errores 406/400
- [ ] Creé una cuenta nueva
- [ ] Console muestra "✅ User created"

Al crear plato:

- [ ] Console muestra "✅ Step 1: Creating dish..."
- [ ] Console muestra "✅ Step 2: Processing ingredients..."
- [ ] Console muestra "🎉 SUCCESS: Dish saved"
- [ ] NO hay errores en console
- [ ] Toast muestra "¡Plato agregado!"

Al abrir plato:

- [ ] Se ve la tabla de ingredientes
- [ ] Costo Total > $0.00
- [ ] % Costo está calculado
- [ ] Gráfico de pie se muestra
- [ ] NO hay warning de "Missing Description"

---

## ✅ Si Todo Funciona

**Comparte esto:**

```
✅ FUNCIONÓ! 

Plato creado:
- Nombre: [nombre]
- Ingredientes: [cantidad]
- Costo: $[costo]
- Margen: [%]

[Screenshot del plato abierto]
```

---

## ❌ Si NO Funciona

**Comparte esto:**

1. **SQL del PASO 1:**
   ```
   [resultado del SELECT final]
   ```

2. **Console logs:**
   ```
   [desde "✅ Active session" hasta el error]
   ```

3. **Screenshot** del error

Con eso podré ayudarte mejor! 🚀

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Prioridad:** 🔴 CRÍTICA
