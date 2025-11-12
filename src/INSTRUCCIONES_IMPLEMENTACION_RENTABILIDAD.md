# 📊 Instrucciones: Sistema de Rentabilidad Gradual

## ✅ Cambios Implementados

### 1. **Sistema de Colores Gradual**
- ❌ **ELIMINADO:** Umbrales fijos (≥65% verde, 50-64% amarillo, <50% rojo)
- ✅ **NUEVO:** Escala gradual de verdes basada en porcentaje
  - 80%+ → Verde oscuro intenso (#4e9643)
  - 60-79% → Verde principal (#7BB97A)
  - 40-59% → Verde medio-claro (#8BC980)
  - 20-39% → Verde muy claro (#A6D49F)
  - 0-19% → Gris-verde neutro (#9FB3A8)

### 2. **Badges de Margen**
- ❌ **ELIMINADO:** Textos como "Saludable", "Ajustar", "Riesgo"
- ✅ **NUEVO:** Solo muestra el porcentaje (ej: "45%")
- ✅ Color de fondo dinámico según escala gradual

### 3. **Gráfico de Rentabilidad**
- ❌ **ELIMINADO:** Leyenda con umbrales fijos
- ✅ **NUEVO:** Texto explicativo: "Compara los márgenes entre categorías. Tonos más oscuros = mayor rentabilidad"

### 4. **Objetivos de Rentabilidad por Categoría**
#### Nueva funcionalidad en formularios de categoría:
- ✅ **Toggle:** Costo Materia Prima % vs Margen Neto %
- ✅ **Input numérico:** Ingresa valor (0-100)
- ✅ **Auto-cálculo:** El otro valor se calcula automáticamente (suma = 100%)
- ✅ **Preview:** Muestra distribución: "Costo: 30% | Margen: 70%"

#### Disponible en:
- 🆕 Dialog de "Nueva categoría"
- ✏️ Dialog de "Editar categoría" (pre-poblado con valores actuales)

### 5. **Edición de Categorías**
- ✅ Botón de Edit (icono lápiz) en cada categoría
- ✅ Dialog pre-poblado con datos actuales
- ✅ **SIN RIESGO:** Los platos mantienen su relación (usan IDs, no nombres)

---

## 🗄️ Base de Datos: Paso Obligatorio

### **Debes ejecutar este SQL en Supabase ANTES de usar la app:**

```sql
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- 1. Agregar columnas para objetivo de rentabilidad
ALTER TABLE menu_categories 
ADD COLUMN IF NOT EXISTS target_cost_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_margin_percentage DECIMAL(5,2);

-- 2. Agregar comentarios de documentación
COMMENT ON COLUMN menu_categories.target_cost_percentage IS 
  'Objetivo de costo de materia prima como % del precio neto (0-100)';
COMMENT ON COLUMN menu_categories.target_margin_percentage IS 
  'Objetivo de margen neto como % del precio neto (0-100). target_cost + target_margin = 100';

-- 3. Verificar que las columnas se crearon
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'menu_categories' 
  AND column_name IN ('target_cost_percentage', 'target_margin_percentage');
```

### **Cómo ejecutar:**
1. Ve a tu proyecto en Supabase Dashboard
2. Menu lateral → **SQL Editor**
3. Copia y pega el SQL de arriba
4. Click en **Run** (▶️)
5. Deberías ver: "Success. No rows returned"

### **Verificación:**
```sql
-- Ver estructura actualizada
SELECT id, name, emoji, target_cost_percentage, target_margin_percentage
FROM menu_categories
ORDER BY created_at DESC;
```

---

## 🎯 Cómo Usar el Sistema

### **Crear Categoría con Objetivo:**
1. Click en "Nueva categoría" (botón verde +)
2. Ingresa nombre y emoji
3. **Opcional:** Define objetivo de rentabilidad:
   - Toggle: Elige "Costo Materia Prima %" o "Margen Neto %"
   - Input: Ingresa valor (ej: 30)
   - Preview: Verás "Costo: 30% | Margen: 70%"
4. Click "Crear categoría"

### **Editar Categoría Existente:**
1. Click en el icono de lápiz (Edit2) en cualquier categoría
2. Modifica nombre, emoji o objetivo
3. Click "Guardar cambios"
4. ✅ **Tus platos NO se pierden** (usan IDs internos)

### **Interpretar Colores:**
- **Verde oscuro:** Alta rentabilidad (80%+)
- **Verde claro:** Rentabilidad moderada (40-60%)
- **Gris-verde:** Rentabilidad baja (0-20%)
- **Sin juicios:** No hay "bueno" o "malo", solo datos

---

## 🔧 Archivos Modificados

### Frontend:
- ✅ `/components/MenuScreen.tsx`
  - Funciones: `getMarginColor()`, `getMarginBadge()`
  - State: `editingCategory`, `showEditCategoryDialog`
  - Handlers: `handleOpenEditCategory()`, `handleUpdateCategory()`
  - UI: Botón Edit, Dialog de edición

### Backend/Helpers:
- ✅ `/lib/supabase-helpers.ts`
  - `createMenuCategory()` → Acepta target_cost/margin
  - `updateMenuCategory()` → Acepta target_cost/margin

### SQL:
- 📄 `/AGREGAR_TARGET_RENTABILIDAD.sql`

---

## 🐛 Troubleshooting

### **Error: "column does not exist"**
**Causa:** No ejecutaste el SQL de migración  
**Solución:** Ejecuta el SQL en Supabase SQL Editor

### **Los objetivos no se guardan**
**Causa:** Cache o error de red  
**Solución:**
1. Abre DevTools → Console
2. Busca errores en rojo
3. Verifica que el SQL se ejecutó correctamente

### **Los colores no cambian**
**Causa:** Navegador cacheó versión anterior  
**Solución:**
1. Hard refresh: `Ctrl+Shift+R` (Win) o `Cmd+Shift+R` (Mac)
2. O borra cache del navegador

---

## 🎉 Beneficios

### **Para el Usuario:**
- ✅ Define objetivos personalizados por categoría
- ✅ Compara rentabilidad visualmente (sin juicios)
- ✅ Edita categorías sin perder platos
- ✅ Escala de colores intuitiva

### **Para el Negocio:**
- ✅ Validación de PMF: "¿Los usuarios definen objetivos?"
- ✅ Datos para upgrade: Categorías con objetivos → Power users
- ✅ Flexibilidad: Cada restaurante tiene su propia estrategia

---

## 📊 Próximos Pasos Sugeridos

### **MVP Actual (Listo):**
- ✅ Escala de colores gradual
- ✅ Objetivos de rentabilidad por categoría
- ✅ Edición de categorías

### **Futuras Mejoras (Post-validación):**
- 📈 **Dashboard de comparación:** Objetivo vs Real
- 🎯 **Alertas:** "Tu categoría está 10% por debajo del objetivo"
- 📊 **Gráfico de tendencia:** Evolución del margen en el tiempo
- 🔔 **Notificaciones:** "Has alcanzado tu objetivo de 70% margen"

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Status:** ✅ Listo para usar (ejecuta el SQL primero)
