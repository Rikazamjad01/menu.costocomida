# 🔄 Actualizar Base de Datos - Agregar Password

## ⚠️ Solo para quienes YA configuraron la base de datos

Si **ya configuraste** la base de datos antes y solo necesitas agregar el campo de contraseña, sigue estos pasos:

---

## Paso 1: Abre Supabase SQL Editor

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** (menú lateral)
4. Click en **New Query**

---

## Paso 2: Copia SOLO este código

**⬇️ COPIA DESDE AQUÍ ⬇️**

```sql
-- Agregar columna de contraseña a user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS password TEXT;
```

**⬆️ COPIA HASTA AQUÍ ⬆️**

---

## Paso 3: Ejecuta

1. Pega el código en el SQL Editor
2. Click en **Run** (botón verde)
3. Espera 1-2 segundos
4. Deberías ver: "Success. No rows returned"

---

## Paso 4: Verifica (Opcional)

Copia y ejecuta esto para confirmar que la columna se agregó:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
```

Deberías ver `password` en la lista de columnas.

---

## 🎉 ¡Listo!

La actualización está completa. Ahora el sistema de login funcionará correctamente.

---

## 📝 Notas Importantes

### ¿Qué pasa con los usuarios existentes?

Si ya tienes usuarios en tu base de datos, **no tendrán contraseña asignada** (será `NULL`).

Tienes 3 opciones:

### Opción 1: Asignar contraseña temporal a todos

```sql
UPDATE user_settings 
SET password = 'temporal123' 
WHERE password IS NULL;
```

Luego comunica a tus usuarios que usen `temporal123` como contraseña.

### Opción 2: Asignar contraseña a un usuario específico

```sql
UPDATE user_settings 
SET password = 'tu_contraseña_aqui' 
WHERE user_email = 'email@ejemplo.com';
```

Reemplaza `tu_contraseña_aqui` y `email@ejemplo.com` con los valores reales.

### Opción 3: Borrar usuarios y empezar de cero

```sql
-- ⚠️ CUIDADO: Esto borra TODOS los usuarios
DELETE FROM user_settings;
```

Solo recomendado si estás en fase de testing.

---

## 🔍 Scripts Útiles

### Ver qué usuarios tienen o no contraseña:

```sql
SELECT 
  user_name, 
  user_email, 
  CASE 
    WHEN password IS NULL THEN '❌ Sin contraseña' 
    ELSE '✅ Con contraseña' 
  END as estado
FROM user_settings;
```

### Contar usuarios sin contraseña:

```sql
SELECT COUNT(*) as usuarios_sin_password 
FROM user_settings 
WHERE password IS NULL;
```

---

## 🆘 ¿Problemas?

### Error: "column already exists"
✅ **Esto es NORMAL.** Significa que ya ejecutaste este script antes. La columna ya existe.

### El login sigue sin funcionar
Verifica:
1. Que la columna password existe (usa el script de verificación arriba)
2. Que el usuario tiene una contraseña asignada (no es NULL)
3. Que estás usando el email y contraseña correctos

### ¿Cómo saber si un usuario tiene contraseña?

```sql
SELECT user_email, password 
FROM user_settings 
WHERE user_email = 'tu_email@ejemplo.com';
```

Si el campo `password` está vacío o dice `null`, ese usuario no tiene contraseña.

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Esta implementación guarda contraseñas en **texto plano** (sin encriptar).

### Para Prototipo/MVP (Actual):
- ✅ Funcional para validación
- ✅ Rápido de implementar
- ⚠️ NO usar con datos reales de clientes
- ⚠️ NO usar en producción

### Para Producción (Futuro):
Deberías migrar a **Supabase Auth** que incluye:
- 🔒 Hash bcrypt automático
- 🔑 Gestión de sesiones segura
- 📧 Recuperación de contraseña
- 🔐 2FA disponible
- 🌐 OAuth integrado (Google, Facebook, etc.)

---

**Tiempo total:** ~1 minuto ⏱️  
**Dificultad:** Muy fácil 😊
