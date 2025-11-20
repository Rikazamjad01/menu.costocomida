# ✅ Configuración Completa - CostoComida

## 🎯 Pasos a seguir (en orden)

### 1️⃣ Limpiar Duplicados en Base de Datos

Abre **Supabase Dashboard → SQL Editor** y ejecuta:

```sql
-- Eliminar TODOS los duplicados
DELETE FROM default_categories;

-- Insertar categorías limpias (solo una vez)
INSERT INTO default_categories (name, emoji) VALUES
  ('Almuerzo', '🍽️'),
  ('Aperitivos', '🥗'),
  ('Bebidas', '🥤'),
  ('Bebidas Alcohólicas', '🍷'),
  ('Cena', '🌙'),
  ('Comida', '🍛'),
  ('Desayuno', '☕'),
  ('Ensaladas', '🥬'),
  ('Postres', '🍰'),
  ('Sopas', '🍲');

-- Verificar (debe devolver 10)
SELECT COUNT(*) as total FROM default_categories;
```

**✅ Resultado esperado:** 10 categorías sin duplicados

---

### 2️⃣ Configurar Row-Level Security (RLS)

**⚠️ CRÍTICO:** Sin esto, cualquier usuario puede ver los datos de otros usuarios.

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_categories ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA: user_settings
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON user_settings FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS PARA: menu_categories
CREATE POLICY "Users can view their own categories"
ON menu_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON menu_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON menu_categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON menu_categories FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS PARA: dishes
CREATE POLICY "Users can view their own dishes"
ON dishes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dishes"
ON dishes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dishes"
ON dishes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dishes"
ON dishes FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS PARA: dish_ingredients
CREATE POLICY "Users can view ingredients of their own dishes"
ON dish_ingredients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = dish_ingredients.dish_id
    AND dishes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert ingredients to their own dishes"
ON dish_ingredients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = dish_ingredients.dish_id
    AND dishes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update ingredients of their own dishes"
ON dish_ingredients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = dish_ingredients.dish_id
    AND dishes.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = dish_ingredients.dish_id
    AND dishes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete ingredients from their own dishes"
ON dish_ingredients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dishes
    WHERE dishes.id = dish_ingredients.dish_id
    AND dishes.user_id = auth.uid()
  )
);

-- POLÍTICAS PARA: inventory_items
CREATE POLICY "Users can view their own inventory items"
ON inventory_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
ON inventory_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
ON inventory_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
ON inventory_items FOR DELETE
USING (auth.uid() = user_id);

-- POLÍTICAS PARA: default_categories
CREATE POLICY "Authenticated users can view default categories"
ON default_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only service role can insert default categories"
ON default_categories FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can update default categories"
ON default_categories FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Only service role can delete default categories"
ON default_categories FOR DELETE
TO service_role
USING (true);
```

**✅ Verificar que RLS está habilitado:**

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_settings',
  'menu_categories', 
  'dishes',
  'dish_ingredients',
  'inventory_items',
  'default_categories'
)
ORDER BY tablename;
```

Todas deben tener `rls_enabled = true`

---

### 3️⃣ Verificar que todo está correcto

```sql
-- 1. Verificar categorías default (debe ser 10)
SELECT COUNT(*) FROM default_categories;

-- 2. Ver todas las categorías sin duplicados
SELECT name, emoji FROM default_categories ORDER BY name;

-- 3. Verificar usuarios registrados
SELECT 
  user_name,
  user_email,
  created_at
FROM user_settings
ORDER BY created_at DESC;

-- 4. Ver categorías de cada usuario
SELECT 
  us.user_name,
  COUNT(mc.id) as total_categorias
FROM user_settings us
LEFT JOIN menu_categories mc ON us.user_id = mc.user_id
GROUP BY us.user_id, us.user_name
ORDER BY us.user_name;
```

---

## 🎨 Cambios Visuales Aplicados

Los componentes ahora siguen las **Guidelines correctas**:

### ✅ Colores actualizados:
- ❌ ~~`#fcfdfb` (beige)~~ → ✅ `#FFFFFF` (blanco puro)
- ❌ ~~`#1d281b`~~ → ✅ `#1A1A1A` (ink-darkest)
- ❌ ~~`rgba(24,46,20,0.75)`~~ → ✅ `#4D6B59` (ink-medium)
- ❌ ~~`rgba(24,46,20,0.6)`~~ → ✅ `#9FB3A8` (ink-light)
- ❌ ~~`rgba(24,46,20,0.08)`~~ → ✅ `#CFE0D8` (ink-border)

### ✅ Tipografía actualizada:
- ❌ ~~`Roboto Serif`~~ → ✅ `Poppins` (headings)
- ❌ ~~`Public Sans`~~ → ✅ `Inter` (body)
- ✅ Letter-spacing correcto: `-0.56px` para H2, `0` para body
- ✅ Line-height correcto: `36px` para H2, `24px` para body

### ✅ Componentes actualizados:
- ✅ Botones con gradiente `from-[#A6D49F] to-[#7BB97A]`
- ✅ Border radius: `16px` para cards/buttons, `24px` para modals
- ✅ Inputs con border `#CFE0D8` y focus `#7BB97A`
- ✅ Shadows sutiles: `0_4px_12px_rgba(16,24,40,0.08)`

---

## 🐛 Fix del Bug de Autenticación

**Problema resuelto:** Cuando un usuario se registraba, no quedaba autenticado automáticamente.

**Solución aplicada:** En `/lib/supabase-helpers.ts`, ahora después del `signUp()` se ejecuta automáticamente un `signInWithPassword()` para autenticar al usuario inmediatamente.

**Código agregado:**
```typescript
// IMPORTANT: Sign in immediately after sign up to authenticate the user
console.log('🔐 Signing in user automatically...');
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: userData.user_email,
  password: userData.password
});
```

---

## ✅ Checklist Final

Antes de probar la aplicación:

- [ ] ✅ Ejecuté el script de limpieza de duplicados
- [ ] ✅ Verifiqué que hay exactamente 10 categorías
- [ ] ✅ Ejecuté el script completo de RLS
- [ ] ✅ Verifiqué que todas las tablas tienen RLS habilitado
- [ ] ✅ Los componentes visuales están actualizados (ya hecho en el código)
- [ ] ✅ El auto-login después de signup está funcionando (ya hecho en el código)

---

## 🚀 Probar la Aplicación

1. **Recargar la página** (F5) para que carguen los cambios
2. **Crear una cuenta nueva** con un email de prueba
3. **Verificar que:**
   - ✅ Después de registrarte, quedas autenticado automáticamente
   - ✅ Ves tu nombre en el header: "Bienvenido, [Tu Nombre]"
   - ✅ Ves las 10 categorías cargadas (Almuerzo, Aperitivos, etc.)
   - ✅ Puedes crear platos sin errores
   - ✅ No hay errores en la consola del navegador

---

## 📝 Archivos Creados

- ✅ `/LIMPIAR_DUPLICADOS_RAPIDO.sql` - Script para limpiar duplicados
- ✅ `/CONFIGURAR_RLS.md` - Documentación completa de RLS
- ✅ `/LIMPIAR_DUPLICADOS.md` - Guía detallada de limpieza
- ✅ `/CONFIGURACION_COMPLETA.md` - Este archivo (resumen completo)

---

## 🆘 Si algo falla

### Error: "No userId found"
- **Causa:** RLS no está habilitado o políticas incorrectas
- **Solución:** Ejecutar el script RLS completo

### Error: "No categories found"
- **Causa:** El script de default_categories no se ejecutó o RLS bloqueó la lectura
- **Solución:** Ejecutar script de limpieza de duplicados + verificar RLS

### Error: "User already registered"
- **Causa:** El email ya existe en la BD
- **Solución:** Usar otro email o hacer login

### No se ven las categorías después del login
- **Causa:** Las categorías no se copiaron al usuario
- **Solución:** Ejecutar el script de copia de categorías en `/LIMPIAR_DUPLICADOS_RAPIDO.sql`

---

**Versión:** 3.0  
**Fecha:** Noviembre 2024  
**Estado:** ✅ Listo para producción
