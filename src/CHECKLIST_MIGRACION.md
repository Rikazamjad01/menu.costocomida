# ✅ Checklist de Migración Completa

## 📋 Antes de Empezar

- [ ] Tengo acceso al proyecto de Supabase
- [ ] Tengo permisos para ejecutar SQL
- [ ] Tengo acceso al SQL Editor de Supabase
- [ ] He leído `GUIA_REINGENIERIA_COMPLETA.md`

---

## 🗄️ Paso 1: Migración de Base de Datos

### A. Ejecutar Script SQL

- [ ] Abrir Supabase → SQL Editor
- [ ] Copiar TODO el contenido de `MIGRACION_AUTH_COMPLETA.sql`
- [ ] Pegar en SQL Editor
- [ ] Click en **Run**
- [ ] Verificar que NO hay errores rojos

### B. Limpiar Datos Antiguos (Opcional)

Si quieres empezar desde cero:

- [ ] Copiar contenido de `LIMPIAR_TODO_EMPEZAR_FRESCO.sql`
- [ ] Pegar en SQL Editor
- [ ] Click en **Run**
- [ ] Verificar que las tablas están vacías

### C. Verificar Migración

```sql
-- Copiar y ejecutar esto para verificar
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_settings', 'menu_categories', 'dishes', 'dish_ingredients', 'inventory_items');
```

- [ ] Todas las tablas muestran `rowsecurity = true` ✅

---

## 🔧 Paso 2: Verificar Servidor

### A. Healthcheck

En el navegador, abre:
```
https://[tu-proyecto].supabase.co/functions/v1/make-server-af6f0d00/health
```

- [ ] Retorna `{"status":"ok"}` ✅

### B. Verificar Endpoint de Signup

En consola del navegador:

```javascript
const projectId = 'tu-proyecto-id';
const publicAnonKey = 'tu-anon-key';

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-af6f0d00/auth/signup`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    })
  }
);

const data = await response.json();
console.log(data);
```

- [ ] Retorna un usuario ✅ (o error de "already registered")

---

## 🧪 Paso 3: Probar la Aplicación

### A. Signup

- [ ] Recargar la página (F5)
- [ ] Click en "Empezar Ahora"
- [ ] Llenar formulario:
  - Email: `test1@ejemplo.com`
  - Password: `password123`
  - Nombre: `Usuario Test`
  - País: México
  - Tipo de negocio: Restaurante
- [ ] Click en "Comenzar a Calcular"
- [ ] Verificar en consola:
  - ✅ "User created with confirmed email"
  - ✅ "Auto-login successful, session established"
  - ✅ "User settings created"
- [ ] La app debe ir a la pantalla principal ✅

### B. Verificar Usuario en Supabase

- [ ] Ir a Supabase → Authentication → Users
- [ ] Debe aparecer `test1@ejemplo.com` ✅
- [ ] Email confirmado: ✅ (check verde)

### C. Crear Categoría

- [ ] En la app, click en "Editar categorías" (icono lápiz)
- [ ] Click en "+"
- [ ] Crear categoría: "Test" con emoji 🧪
- [ ] Click en "Guardar"
- [ ] NO debe haber errores en consola ✅
- [ ] La categoría debe aparecer inmediatamente ✅

### D. Crear Plato

- [ ] Seleccionar la categoría "Test"
- [ ] Click en "+"
- [ ] Nombre: "Plato Test"
- [ ] Precio: 100
- [ ] Agregar ingrediente:
  - Nombre: "Tomate"
  - Precio: 20
  - Unidad: kg
  - Cantidad: 0.5
  - Merma: 10%
- [ ] Click en "Guardar Plato"
- [ ] El plato debe aparecer ✅
- [ ] NO debe haber errores en consola ✅

### E. Verificar Datos en Supabase

Ejecutar en SQL Editor:

```sql
-- Ver categorías del usuario
SELECT * FROM menu_categories WHERE user_id IS NOT NULL;

-- Ver platos del usuario
SELECT * FROM dishes WHERE user_id IS NOT NULL;

-- Ver ingredientes del plato
SELECT * FROM dish_ingredients WHERE user_id IS NOT NULL;
```

- [ ] Todos los registros tienen `user_id` ✅
- [ ] El `user_id` coincide con el del usuario creado ✅

---

## 🔒 Paso 4: Verificar Aislamiento de Datos

### A. Logout

- [ ] En la app, click en menú usuario (arriba derecha)
- [ ] Click en "Cerrar sesión"
- [ ] Debe volver a pantalla de bienvenida ✅

### B. Crear Segundo Usuario

- [ ] Click en "Empezar Ahora"
- [ ] Usar email diferente: `test2@ejemplo.com`
- [ ] Completar formulario
- [ ] Registrarse ✅

### C. Verificar Aislamiento

- [ ] El segundo usuario NO debe ver datos del primer usuario ✅
- [ ] Las categorías deben estar vacías (o solo las prepopuladas si las creaste)
- [ ] Los platos deben estar vacíos ✅

### D. Login con Primer Usuario

- [ ] Logout del segundo usuario
- [ ] Click en "¿Ya tienes cuenta? Inicia sesión"
- [ ] Email: `test1@ejemplo.com`
- [ ] Password: `password123`
- [ ] Login ✅
- [ ] Los datos del primer usuario deben aparecer ✅

---

## 🌐 Paso 5: Verificar Multi-dispositivo

### A. Abrir en Ventana Incógnito

- [ ] Abrir ventana incógnito
- [ ] Ir a la misma URL de la app
- [ ] Login con `test1@ejemplo.com`
- [ ] Los datos deben sincronizar ✅

### B. Crear Dato en Ventana 1

- [ ] En ventana normal, crear una categoría nueva
- [ ] Recargar ventana incógnito
- [ ] La categoría debe aparecer ✅

---

## 🔍 Paso 6: Verificar RLS

### A. Intentar Acceso Directo

En SQL Editor:

```sql
-- Esto debería retornar solo datos del usuario autenticado
SELECT * FROM dishes;
SELECT * FROM menu_categories;
```

- [ ] Solo retorna datos del usuario actual ✅
- [ ] NO retorna datos de otros usuarios ✅

### B. Verificar Políticas

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

- [ ] Cada tabla tiene 4 políticas (SELECT, INSERT, UPDATE, DELETE) ✅
- [ ] Todas usan `auth.uid() = user_id` ✅

---

## 📊 Paso 7: Verificar Triggers

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'set_user_id_trigger'
ORDER BY event_object_table;
```

- [ ] Hay 5 triggers (uno por tabla) ✅
- [ ] Todos ejecutan `set_user_id()` ✅

---

## ✅ Checklist Final

### Base de Datos
- [ ] Todas las tablas tienen columna `user_id`
- [ ] RLS está habilitado en todas las tablas
- [ ] Políticas están creadas correctamente
- [ ] Triggers funcionan automáticamente
- [ ] Índices están creados

### Servidor
- [ ] Endpoint healthcheck funciona
- [ ] Endpoint signup funciona
- [ ] Usuarios se crean con email confirmado
- [ ] No hay errores en logs

### Frontend
- [ ] Signup funciona
- [ ] Auto-login después de signup funciona
- [ ] Login manual funciona
- [ ] Logout funciona
- [ ] Creación de categorías funciona
- [ ] Creación de platos funciona
- [ ] Creación de ingredientes funciona

### Seguridad
- [ ] Datos aislados por usuario
- [ ] RLS previene acceso no autorizado
- [ ] Passwords hasheados
- [ ] Sesiones JWT funcionan
- [ ] Multi-dispositivo sincroniza

### Testing
- [ ] Probado con 2+ usuarios
- [ ] Verificado aislamiento de datos
- [ ] Probado logout/login
- [ ] Probado en incógnito
- [ ] Sin errores en consola

---

## 🎉 ¡Migración Completa!

Si todos los checkboxes están marcados ✅, tu migración fue exitosa.

### Próximos Pasos

1. Configurar email provider (opcional)
2. Personalizar políticas de RLS (si necesario)
3. Agregar social login (Google, Facebook, etc.)
4. Configurar password reset
5. Deployment a producción

---

## 🐛 Si Algo Falló

### ❌ Signup no funciona

- Verificar que el servidor esté corriendo (healthcheck)
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` está configurado
- Revisar logs del servidor en Supabase

### ❌ "Auth session missing"

- Ejecutar `LIMPIAR_TODO_EMPEZAR_FRESCO.sql`
- Recargar la página
- Crear cuenta nueva

### ❌ "User not authenticated"

- Verificar que ejecutaste `MIGRACION_AUTH_COMPLETA.sql`
- Verificar que RLS está habilitado
- Hacer logout y login de nuevo

### ❌ Datos de otros usuarios visibles

- Verificar que RLS está habilitado
- Verificar que las políticas existen
- Ejecutar queries de verificación de RLS

---

**Fecha:** Noviembre 2024  
**Versión:** 3.0  
**Tipo:** Checklist de Migración  
**Estado:** ✅ Listo para usar
