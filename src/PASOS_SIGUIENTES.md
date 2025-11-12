# 🚀 Pasos Siguientes - Rentabilidad Gradual + Edición de Categorías

## ✅ Lo que Ya Está Hecho

- ✅ Sistema de escala gradual de verdes implementado
- ✅ Eliminados umbrales fijos (65%, 50%)
- ✅ Leyenda del gráfico removida
- ✅ Badges muestran solo porcentaje con color dinámico
- ✅ Formulario de nueva categoría con targets de rentabilidad
- ✅ Botón de editar (✏️) en header de categorías
- ✅ Dialog de edición pre-poblado
- ✅ Función de actualización que preserva platos
- ✅ Helpers de Supabase actualizados
- ✅ Script SQL preparado

---

## 📋 Lo que Tú Debes Hacer AHORA

### 1️⃣ Ejecutar el Script SQL (2 minutos)

```bash
1. Ir a: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Click en "SQL Editor" (panel izquierdo)
4. Click en "New query"
5. Copiar TODO el contenido de: AGREGAR_TARGET_RENTABILIDAD.sql
6. Pegar en el editor
7. Click en "Run" (o Ctrl/Cmd + Enter)
8. Verificar que sale: ✅ Success
```

**Resultado esperado:**
```
Query 3: Debe mostrar 2 filas
  - target_cost_percentage | numeric | NULL | YES
  - target_margin_percentage | numeric | NULL | YES

Query 4: Debe mostrar tus categorías existentes
  - id | name | emoji | NULL | NULL
```

---

### 2️⃣ Probar la App (5 minutos)

#### Test 1: Crear Nueva Categoría con Targets
```bash
1. Click en "+ Nueva categoría"
2. Nombre: "Bebidas Premium"
3. Emoji: 🍹
4. Click en "Costo Materia Prima %"
5. Ingresar: 15
6. Verificar preview: Costo 15% | Margen 85%
7. Click en "Crear categoría"
8. Verificar toast: "¡Categoría creada!"
```

#### Test 2: Editar Categoría Existente
```bash
1. Buscar una categoría que tenga platos
2. Click en el botón ✏️ (Edit)
3. Cambiar nombre: "Nueva Especialidad"
4. Cambiar emoji: 🎯
5. Ajustar target: Margen 70%
6. Click en "Guardar cambios"
7. Verificar toast: "¡Categoría actualizada!"
8. Abrir la categoría → Verificar que los platos siguen ahí
```

#### Test 3: Ver Escala Gradual
```bash
1. Scroll al dashboard
2. Ver gráfico de rentabilidad
3. Verificar que:
   - ✅ Barras tienen tonos de verde graduales
   - ✅ NO hay leyenda de colores (≥65%, 50-64%, etc.)
   - ✅ Aparece texto: "Compara los márgenes..."
4. Ver badges de platos
5. Verificar que:
   - ✅ Solo muestra porcentaje (ej: "67%")
   - ✅ Color es gradual (verde oscuro = alto %)
```

---

## 🐛 Si Algo Sale Mal

### ❌ Error: "column does not exist"
**Causa:** No ejecutaste el script SQL  
**Solución:** Volver al Paso 1️⃣

### ❌ Error: "Los platos desaparecieron"
**Causa:** Imposible (las relaciones usan UUIDs)  
**Solución:** Refresca la página (F5)

### ❌ Error: "El dialog no se abre"
**Causa:** Error de compilación  
**Solución:** 
```bash
1. Abrir consola del navegador (F12)
2. Ver errores en rojo
3. Compartir el error
```

### ❌ Los targets no se guardan
**Causa:** Error en el SQL o en el helper  
**Solución:**
```bash
1. Abrir consola del navegador (F12)
2. Ver tab "Network"
3. Crear/editar categoría
4. Ver request a Supabase
5. Compartir el error
```

---

## 📸 Screenshots para Verificar

### ✅ Gráfico Correcto:
```
┌──────────────────────────────┐
│ Rentabilidad por Categoría   │
├──────────────────────────────┤
│ 🌮 ████████ (75%)            │  ← Verde oscuro
│ 🍕 ██████ (62%)              │  ← Verde medio
│ 🥗 ████ (48%)                │  ← Verde claro
│                              │
│ "Compara los márgenes..."    │  ← Tooltip
└──────────────────────────────┘
```

### ✅ Badge Correcto:
```
┌────────────────────────┐
│ Tacos al Pastor        │
│ [67%] margen           │  ← Badge verde con solo %
│ $120.00                │
│ Costo: $40.00          │
└────────────────────────┘
```

### ✅ Dialog de Edición:
```
┌─────────────────────────────┐
│ Editar categoría        [X] │
├─────────────────────────────┤
│ Nombre: [Tacos________]     │
│                             │
│ Emoji: 🌮 🍕 🍔 🍟 🌯...    │
│                             │
│ Objetivo de Rentabilidad:   │
│ [Costo MP %] [Margen Neto %]│
│ Valor: [30] %               │
│                             │
│ Vista previa:               │
│ 🌮 Tacos                    │
│                             │
│ [Cancelar] [Guardar]        │
└─────────────────────────────┘
```

---

## 🎯 Cuando Todo Funcione

Confirma con:
- ✅ "El SQL se ejecutó correctamente"
- ✅ "Puedo crear categorías con targets"
- ✅ "Puedo editar categorías sin perder platos"
- ✅ "Los colores son graduales y los badges muestran solo %"

Y te ayudo con el siguiente paso! 🚀

---

**Tiempo estimado:** 7 minutos  
**Nivel:** Fácil (copiar/pegar + clicks)
