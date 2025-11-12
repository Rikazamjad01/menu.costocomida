# 🍽️ CostoComida - Lead Magnet MVP

Sistema de diagnóstico de costos para restaurantes que captura leads de early-access.

---

## 🚨 ESTADO ACTUAL DEL PROYECTO

**Status:** 🔴 **CRITICAL ERROR - App Non-Functional**

### ⚡ Si Eres el Senior Developer Asignado:

**ERROR ACTIVO:**
```
PGRST204: Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache
```

**SOLUCIÓN RÁPIDA (15 min):**
1. 📖 Lee: [QUICK_FIX_15_MINUTES.md](./QUICK_FIX_15_MINUTES.md)
2. 🔧 Ejecuta: Restart PostgREST desde Supabase Dashboard
3. ✅ Verifica: Crea un plato de prueba

**DOCUMENTACIÓN COMPLETA:**
- 📊 **[ERROR_TRACKING_LOG.md](./ERROR_TRACKING_LOG.md)** - Estado del error en tiempo real
- 📄 **[TECHNICAL_REPORT_SENIOR_DEV.md](./TECHNICAL_REPORT_SENIOR_DEV.md)** - Reporte técnico completo
- 📑 **[MASTER_INDEX.md](./MASTER_INDEX.md)** - Índice de toda la documentación
- 🎯 **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo

**TIEMPO ESTIMADO DE FIX:** 15-20 minutos

---

## 📱 Producto

**Funnel de 2 pantallas:**
1. **Pantalla de Bienvenida** - Captura lead (nombre + email)
2. **Pantalla Principal** - Dashboard completo con:
   - Gestión de cuenta
   - Categorías prepopuladas
   - Creación de platos con ingredientes
   - Sistema de ingredientes con merma
   - Dashboard de rentabilidad con cálculos automáticos

---

## 🎨 Diseño

- **Mobile:** 390×844 px (touch-optimized)
- **Colores:** Gradiente verde (#A6D49F → #7BB97A) + Blanco (#FFFFFF)
- **Tipografía:** Poppins (headings) + Inter (body)
- **Componentes:** Border radius 16px/24px, sombras sutiles
- **Calidad:** Airbnb-level UI/UX

---

## 🧮 Sistema de Costos con Doble Merma

### Ingrediente Individual
```
Ingrediente: Tomate
Precio de compra: $20/kg
Merma del ingrediente: 10%

Cálculo:
- Peso comprado: 1kg = 1000g
- Peso perdido: 100g (10%)
- Peso usable: 900g
- Costo real: $20/900g = $0.0222/g

👉 La merma INCREMENTA el costo por gramo
```

### Plato Completo
```
Plato: Ensalada César
Ingredientes:
  - Lechuga: 200g a $0.0222/g = $4.44
  - Tomate: 150g a $0.0222/g = $3.33
  - Aderezo: 50ml a $0.08/ml = $4.00

Subtotal ingredientes: $11.77

Merma del plato: 5% (platos rotos, quemados, etc.)
Merma adicional: $11.77 × 5% = $0.59

Costo total final: $12.36
```

### Rentabilidad
```
Precio de venta: $35.00
Costo total: $12.36
Margen: 64.7%

Clasificación:
- 🟢 Saludable: > 60%
- 🟡 Mejorable: 40-60%
- 🔴 Crítico: < 40%
```

---

## 🗂️ Estructura de la Base de Datos

### Tablas Principales

#### 1. `categories`
```sql
- id (UUID)
- name (TEXT) - "Entradas", "Platos Fuertes", etc.
- emoji (TEXT) - 🥗, 🍝, 🍰
- user_id (UUID) - Aislamiento multi-tenant
```

#### 2. `dishes`
```sql
- id (UUID)
- name (TEXT) - "Ensalada César"
- category_id (UUID) - FK a categories
- price (DECIMAL) - Precio de venta
- user_id (UUID)
```

#### 3. `inventory_items`
```sql
- id (UUID)
- name (TEXT) - "Tomate", "Lechuga"
- unit (TEXT) - kg, lt, ml, pzas
- price_per_unit (DECIMAL) - $20.00/kg
- wastage_percentage (DECIMAL) - 10.00
- user_id (UUID)
```

#### 4. `dish_ingredients`
```sql
- id (UUID)
- dish_id (UUID) - FK a dishes
- inventory_item_id (UUID) - FK a inventory_items
- quantity (DECIMAL) - 200.0
- unit (TEXT) - gramos
- waste_percentage (DECIMAL) - 10.00
```

---

## 🚀 Setup Inicial

### 1. Crear Tablas en Supabase
```bash
# Ejecutar en SQL Editor de Supabase
/CREAR_TABLAS_COMPLETO.sql
```

### 2. Verificar Estructura
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'inventory_items';

-- Debe mostrar:
-- price_per_unit (numeric) ✅
-- wastage_percentage (numeric) ✅
```

### 3. Habilitar RLS
Las políticas RLS ya están incluidas en el script. Verificar:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'inventory_items';
```

---

## 📝 Flujo de Usuario

### **Paso 1: Bienvenida**
Usuario ingresa nombre y email → Lead capturado

### **Paso 2: Crear Primera Categoría**
Click en "Agregar categoría" → Ingresa nombre + emoji

### **Paso 3: Crear Primer Plato**
1. Selecciona categoría
2. Ingresa nombre del plato
3. Agrega ingredientes (uno por uno)

### **Paso 4: Agregar Ingrediente**

**Opción A - Ingrediente Existente:**
```
1. Click en combobox "Buscar ingrediente..."
2. Selecciona "Tomate" de la lista
3. ✅ Auto-rellena: precio ($20/kg), merma (10%)
4. Completa: cantidad (200), unidad (gramos)
```

**Opción B - Ingrediente Nuevo:**
```
1. Click en combobox
2. Escribe: "Aguacate"
3. Click en [+ Crear "Aguacate"]
4. ✅ Nombre ya capturado
5. Completa: precio, unidad, cantidad, merma
6. ✅ Se guarda para uso futuro
```

### **Paso 5: Configurar Plato**
1. Agregar más ingredientes (click en "+")
2. Ingresar % merma del plato (default 0%)
3. Ingresar precio de venta
4. Ver cálculo automático de rentabilidad

### **Paso 6: Guardar**
Click en "Guardar plato" → Plato agregado a la categoría

---

## 🔧 Funcionalidades Clave

### ✅ Auto-Relleno de Ingredientes
- Al seleccionar ingrediente existente
- Precio, unidad y merma se pre-llenan
- Reduce tiempo de captura

### ✅ Conversión Automática de Unidades
```javascript
Compra: kg → Uso: gramos (÷ 1000)
Compra: lt → Uso: ml (÷ 1000)
```

### ✅ Cálculo Automático de Costos
```javascript
costoPorGramo = precioPorKg / (1000g × (1 - merma%))
costoIngrediente = costoPorGramo × cantidadUsada
costoPlato = Σ(costoIngredientes) × (1 + mermaPlato%)
margen = ((precioVenta - costoPlato) / precioVenta) × 100
```

### ✅ Sistema de Badges
- 🟢 "Saludable" - Margen > 60%
- 🟡 "Mejorable" - Margen 40-60%
- 🔴 "Crítico" - Margen < 40%

---

## 📚 Documentación Adicional

### 🚨 Problemas y Soluciones
- `/EJECUTAR_ESTO_AHORA.md` - Fix para error de `price_per_unit`
- `/FLUJO_INGREDIENTE_NUEVO.md` - Cómo funciona el sistema de ingredientes
- `/FUNCIONALIDAD_INGREDIENTES.md` - Guía completa del flujo

### 🎨 Diseño
- `/guidelines/Guidelines.md` - Sistema de diseño completo

### 🔧 Scripts SQL
- `/CREAR_TABLAS_COMPLETO.sql` - Crear toda la estructura
- `/ACTUALIZAR_MERMA_INGREDIENTES.sql` - Agregar campo de merma
- `/LIMPIAR_TODO_EMPEZAR_FRESCO.sql` - Reset completo (cuidado)

---

## 🐛 Troubleshooting

### Error: "price_per_unit column not found"
**Solución:** Ejecutar `/CREAR_TABLAS_COMPLETO.sql` en Supabase

### Error: "User not authenticated"
**Solución:** Verificar que el usuario esté logueado correctamente

### Error: "violates unique constraint"
**Solución:** Ya existe un ingrediente/plato con ese nombre para este usuario

### Los ingredientes no se guardan
**Verificar:**
1. Todos los campos están completos
2. Usuario está autenticado
3. RLS está habilitado
4. Políticas RLS están creadas

### Los cálculos son incorrectos
**Verificar:**
1. Unidades coinciden entre compra y uso
2. Merma está en % (0-100), no decimal
3. Precio por unidad es correcto
4. Conversión de unidades funciona

---

## 🎯 Checklist de Validación

Antes de reportar un problema:

- [ ] Ejecuté `/CREAR_TABLAS_COMPLETO.sql` en Supabase
- [ ] Verifiqué que `inventory_items` tiene `price_per_unit`
- [ ] Verifiqué que `inventory_items` tiene `wastage_percentage`
- [ ] RLS está habilitado en todas las tablas
- [ ] Puedo crear categorías
- [ ] Puedo crear platos
- [ ] El combobox de ingredientes se abre
- [ ] Puedo seleccionar ingredientes existentes
- [ ] Puedo crear ingredientes nuevos
- [ ] Los cálculos de costo son correctos
- [ ] El margen se muestra correctamente

---

## 📊 Ejemplo Completo

```
USUARIO: restaurante@ejemplo.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CATEGORÍA: Platos Fuertes 🍝
├─ Plato: Ensalada César
│  ├─ Ingrediente: Lechuga (existente)
│  │  ├─ Precio: $15/kg
│  │  ├─ Merma: 10%
│  │  ├─ Cantidad: 200g
│  │  └─ Costo: $3.33
│  │
│  ├─ Ingrediente: Tomate (existente)
│  │  ├─ Precio: $20/kg
│  │  ├─ Merma: 5%
│  │  ├─ Cantidad: 150g
│  │  └─ Costo: $3.16
│  │
│  ├─ Ingrediente: Aderezo César (nuevo)
│  │  ├─ Precio: $80/lt
│  │  ├─ Merma: 5%
│  │  ├─ Cantidad: 50ml
│  │  └─ Costo: $4.21
│  │
│  ├─ Merma del plato: 3%
│  ├─ Costo ingredientes: $10.70
│  ├─ + Merma plato: $0.32
│  ├─ = Costo total: $11.02
│  │
│  ├─ Precio venta: $35.00
│  ├─ Margen: 68.5%
│  └─ Badge: 🟢 Saludable

INVENTARIO ACTUALIZADO:
├─ Lechuga ($15/kg, 10% merma)
├─ Tomate ($20/kg, 5% merma)
└─ Aderezo César ($80/lt, 5% merma) ← NUEVO

PRÓXIMO PLATO:
"Ensalada Caprese" puede reutilizar:
✅ Tomate (precio y merma ya guardados)
+ Nuevo ingrediente: Mozzarella
```

---

## 🚀 Próximos Pasos

1. **Ejecutar script SQL** → Crear tablas
2. **Probar flujo completo** → Crear plato con ingredientes
3. **Validar cálculos** → Verificar que margen sea correcto
4. **Reportar bugs** → Con logs completos de error

---

**Versión:** 2.0  
**Última actualización:** Noviembre 2024  
**Stack:** React + Tailwind + Supabase  
**Viewport:** 390×844 px (mobile-first)
