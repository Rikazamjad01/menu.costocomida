# ✅ SIGUIENTE PASO - Arreglar Errores 406 y 400

Ya ejecutaste el SQL para renombrar `price` → `price_per_unit`. ✅

Ahora tienes **2 errores más** que resolver:

---

## 🔴 Error 1: 406 Not Acceptable

```
zsrmeliuvswtdzxfegqq.supabase.co/rest/v1/inventory_items?
  select=*&user_id=eq.xxx&name=ilike.Pan&limit=1
Failed: 406 Not Acceptable
```

**Causa:** Las políticas RLS (Row Level Security) están bloqueando el acceso.

### Solución:

**En Supabase → SQL Editor, ejecuta:**

```sql
-- Paso 1: Eliminar políticas viejas
DROP POLICY IF EXISTS "Users can view own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can create own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory items" ON inventory_items;

-- Paso 2: Crear políticas correctas
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

-- Paso 3: Hacer lo mismo para dishes
DROP POLICY IF EXISTS "Users can view own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can create own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can update own dishes" ON dishes;
DROP POLICY IF EXISTS "Users can delete own dishes" ON dishes;

CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dishes"
  ON dishes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dishes"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);

-- Paso 4: Y para dish_ingredients
DROP POLICY IF EXISTS "Users can view own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can create own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can update own dish ingredients" ON dish_ingredients;
DROP POLICY IF EXISTS "Users can delete own dish ingredients" ON dish_ingredients;

CREATE POLICY "Users can view own dish ingredients"
  ON dish_ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dish ingredients"
  ON dish_ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dish ingredients"
  ON dish_ingredients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dish ingredients"
  ON dish_ingredients FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔴 Error 2: 400 Bad Request (columnas)

```
zsrmeliuvswtdzxfegqq.supabase.co/rest/v1/inventory_items?
  columns="name","unit","price_per_unit",...
  &select=*
Failed: 400 Bad Request
```

**Causa:** El parámetro `columns=` no es válido en Supabase.

Este error está viniendo de algún código viejo o caché. 

### Solución:

1. **Recarga DURO la app** (Ctrl+Shift+R en Chrome, Cmd+Shift+R en Mac)
2. Si sigue pasando, **limpia el caché del browser**
3. Si TODAVÍA pasa, abre Console y compárteme el **stack trace completo** del error 400

---

## ✅ Verificación

Después de ejecutar el SQL de arriba:

### 1. Recarga la app en Figma

### 2. Abre Console (F12)

Deberías ver:

```
✅ Active session found: 7d5f0c13-dd39-432c-91b3-ee33bc0cbbdd
```

**SIN errores 406 o 400**

### 3. Intenta crear un plato

1. Click en "Agregar plato"
2. Llena los datos:
   - Nombre: "Ensalada César"
   - Precio: $8.00
   - Ingredientes:
     - Lechuga: 200gr, $2/kg
     - Pollo: 150gr, $8/kg

3. Click "Agregar plato"

### 4. Verifica en Console:

Deberías ver:

```
✅ Step 1: Creating dish...
✅ Step 1 Complete: Dish created
✅ Step 2: Processing ingredients...
  ✅ Step 2.1: Finding/creating inventory item for "Lechuga"...
  ✅ Step 2.1 Complete: Inventory item
  ✅ Step 2.2: Finding/creating inventory item for "Pollo"...
  ✅ Step 2.2 Complete: Inventory item
✅ Step 3: Adding ingredients to dish...
🎉 SUCCESS: Dish saved with 2 ingredients
```

### 5. Abre el plato

Click en "Ensalada César"

Deberías ver la tabla de ingredientes con:
- Lechuga: 200gr, $0.40
- Pollo: 150gr, $1.20
- **Costo Total: $1.60**
- **% Costo: 20%**
- **Margen: 80% ($6.40)**

---

## 🆘 Si Sigue Sin Funcionar

### Opción 1: Ver políticas actuales

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('inventory_items', 'dishes', 'dish_ingredients')
ORDER BY tablename, cmd;
```

Deberías ver 12 políticas en total (4 por tabla).

### Opción 2: Desactivar RLS temporalmente (solo para debugging)

```sql
-- ⚠️ Solo temporalmente para probar
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE dishes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients DISABLE ROW LEVEL SECURITY;
```

Recarga la app. Si funciona, significa que el problema SÍ son las políticas RLS.

Luego reactiva RLS:

```sql
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
```

Y ejecuta las políticas del principio de este documento.

### Opción 3: Verificar autenticación

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT auth.uid() as my_user_id;
```

Si retorna NULL, no estás autenticado en la sesión SQL.

Si retorna tu UUID, entonces el problema es otro.

---

## 📋 Checklist

Ejecuta esto en orden:

- [ ] Ejecuté el SQL de políticas RLS (Error 1)
- [ ] Recargué la app con Ctrl+Shift+R
- [ ] Console NO muestra errores 406
- [ ] Console NO muestra errores 400
- [ ] Puedo crear un plato nuevo
- [ ] Los ingredientes se guardan
- [ ] Puedo abrir el plato y ver la tabla de ingredientes
- [ ] El costo se calcula correctamente

Si TODOS los checkboxes están ✅, ¡funcionó!

---

## 🎯 Próximo Paso

Una vez que esto funcione, comparte:

1. ✅ "Funcionó! Creé un plato y se ve así: [screenshot]"

O:

2. ❌ "Sigue sin funcionar. Los logs dicen: [copia logs de console]"

Con eso podré ayudarte mejor! 🚀
