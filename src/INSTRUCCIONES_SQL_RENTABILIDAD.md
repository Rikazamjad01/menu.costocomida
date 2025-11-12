# 📊 Instrucciones: Agregar Target de Rentabilidad

## ✅ Qué acabamos de implementar

Hemos actualizado el sistema de rentabilidad con los siguientes cambios:

### 1. **Eliminación de umbrales fijos**
- ❌ Antes: Colores fijos (Verde ≥65%, Naranja 50-64%, Rojo <50%)
- ✅ Ahora: Escala gradual de verdes basada en porcentaje (sin juicios)

**Nuevos colores:**
- 80%+ → Verde oscuro intenso (#4e9643)
- 60-80% → Verde principal (#7BB97A)
- 40-60% → Verde medio-claro (#8BC980)
- 20-40% → Verde muy claro (#A6D49F)
- <20% → Gris-verde neutro (#9FB3A8)

### 2. **Objetivo de Rentabilidad por Categoría**
Nuevo formulario en "Nueva Categoría" y "Editar Categoría" que permite definir:
- **Costo de Materia Prima %** (ej: 30%)
- **Margen Neto %** (ej: 70%)
- Ambos valores suman 100% automáticamente

### 3. **Edición de Categorías**
- ✅ Nuevo botón Edit (ícono lápiz) en cada categoría
- ✅ Los platos NO se pierden al cambiar nombre/emoji (usan IDs internos)
- ✅ Formulario pre-poblado con datos actuales

---

## 🔧 PASO OBLIGATORIO: Ejecutar SQL en Supabase

### ⚠️ Importante
**Debes ejecutar el archivo SQL antes de usar las nuevas funciones**, de lo contrario obtendrás errores al crear/editar categorías.

### Pasos:

1. **Abrir Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto "CostoComida"

2. **Ir a SQL Editor**
   - En el menú lateral: **SQL Editor**
   - Click en "New query"

3. **Copiar y Ejecutar SQL**
   - Abre el archivo: `/AGREGAR_TARGET_RENTABILIDAD.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click en **RUN** (o Ctrl/Cmd + Enter)

4. **Verificar Resultado**
   Deberías ver en los resultados:
   ```
   ✅ ALTER TABLE successful
   ✅ 2 columns created:
      - target_cost_percentage
      - target_margin_percentage
   ```

---

## 📋 SQL Contenido (Referencia)

El script agrega dos columnas opcionales a `menu_categories`:

```sql
ALTER TABLE menu_categories 
ADD COLUMN IF NOT EXISTS target_cost_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_margin_percentage DECIMAL(5,2);
```

**Características:**
- ✅ Columnas opcionales (nullable)
- ✅ Permite decimales (ej: 30.50%)
- ✅ NO afecta categorías existentes
- ✅ Compatible con versiones anteriores

---

## 🎯 Cómo Usar las Nuevas Funciones

### Crear Categoría con Target
1. Click en "Agregar nueva categoría"
2. Ingresa nombre y emoji
3. (Opcional) Define objetivo:
   - Selecciona "Costo Materia Prima %" o "Margen Neto %"
   - Ingresa el valor deseado (0-100)
   - El otro valor se calcula automáticamente
4. Click "Crear categoría"

### Editar Categoría Existente
1. En el header de la categoría, click en el ícono **Edit (lápiz verde)**
2. Modifica nombre, emoji o target
3. Click "Guardar cambios"
4. ✅ Los platos de la categoría NO se pierden

### Interpretar Badges de Margen
- Los badges ahora muestran solo el **porcentaje** (ej: "72%")
- El color varía en escala de verdes (más oscuro = mejor)
- Ya NO dice "Saludable", "Ajustar" o "Riesgo"

---

## 🐛 Troubleshooting

### Error: "column does not exist"
**Causa:** No ejecutaste el SQL en Supabase
**Solución:** Ve a la sección "Pasos" arriba y ejecuta el SQL

### Error: "duplicate column name"
**Causa:** Ya ejecutaste el SQL antes (esto es OK)
**Solución:** No hagas nada, las columnas ya existen

### Los targets no se guardan
**Causa:** Valores fuera de rango o suma ≠ 100%
**Solución:** La suma de costo + margen debe ser 100%

### No veo el botón de editar
**Causa:** Necesitas refrescar la página
**Solución:** Recarga la app (F5 o Cmd+R)

---

## ✨ Próximas Mejoras (Futuras)

Ideas para versiones futuras:
1. **Comparación visual**: Badge con "▲ +5%" si supera el target
2. **Alertas**: Notificación si un plato está muy por debajo del target
3. **Targets predefinidos**: Templates por tipo de restaurante
4. **Histórico**: Ver evolución de margen vs target en el tiempo

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2024  
**Autor:** CostoComida Dev Team
