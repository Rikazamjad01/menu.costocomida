# 📝 Preparación del Plato y Alérgenos

## 🎯 Funcionalidad Implementada

Se han agregado dos nuevas secciones al detalle del plato para capturar información adicional importante:

### 1. **Preparación del Plato** 🧑‍🍳
- Campo de texto expandible para describir los pasos de preparación
- Auto-resize del textarea
- Se guarda automáticamente al hacer clic en "Guardar Cambios"

### 2. **Alérgenos** ⚠️
- Sistema de badges/chips clickeables para seleccionar alérgenos
- 8 alérgenos comunes preconfigurados:
  - 🌾 Gluten
  - 🐟 Pescado
  - 🥛 Lácteos
  - 🥚 Huevo
  - 🥜 Frutos Secos
  - 🫘 Soja
  - 🦐 Mariscos
  - 🍷 Sulfitos

---

## 📦 Cambios Realizados

### 1. **Base de Datos** (`AGREGAR_PREPARACION_ALERGENOS.sql`)
```sql
-- Columna para preparación
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS preparation TEXT;

-- Columna para alérgenos (array JSON)
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;
```

### 2. **Backend** (`/lib/supabase-helpers.ts`)
- ✅ Actualizado `createDish` para incluir `preparation` y `allergens`
- ✅ Actualizado `updateDish` para incluir `preparation` y `allergens`

### 3. **Hooks** (`/hooks/useSupabase.ts`)
- ✅ Actualizado `useDishesWithIngredients` para incluir campos en SELECT

### 4. **UI** (`/components/DishDetailSheet.tsx`)
- ✅ Agregado estado local para `preparation` y `selectedAllergens`
- ✅ Textarea para preparación con placeholder
- ✅ Sistema de badges clickeables para alérgenos
- ✅ Botón "Guardar Cambios" que aparece solo cuando hay cambios
- ✅ Toast notifications para confirmar guardado

### 5. **MenuScreen** (`/components/MenuScreen.tsx`)
- ✅ Actualizado `selectedDishForDetail` para incluir `preparation` y `allergens`
- ✅ Agregado callback `onUpdate` para refetch después de guardar

---

## 🎨 Diseño (siguiendo Guidelines)

### Preparación del Plato
```tsx
- Card blanco con border radius 16px
- Icono ChefHat verde (#7BB97A)
- Textarea con bg #F5FAF7
- Focus ring verde con opacity 25%
- Placeholder suave (#9FB3A8)
```

### Alérgenos
```tsx
- Card blanco con border radius 16px
- Icono AlertCircle naranja (#F59E0B)
- Badges con border-radius full (pills)
- Seleccionado: fondo naranja (#F59E0B) con sombra
- No seleccionado: fondo blanco con border #CFE0D8
- Hover: border naranja con bg muy suave
```

### Botón Guardar
```tsx
- Gradiente primario: #A6D49F → #7BB97A
- Altura: 48px
- Border radius: 16px
- Sombra con color del gradiente
- Solo aparece cuando hay cambios pendientes
```

---

## 🚀 Instrucciones de Uso

### Paso 1: Ejecutar SQL Migration
1. Abre Supabase SQL Editor
2. Copia el contenido de `/AGREGAR_PREPARACION_ALERGENOS.sql`
3. Ejecuta el script
4. Verifica que las columnas se crearon correctamente

### Paso 2: Usar la Funcionalidad
1. Abre un plato desde la lista
2. Scroll hacia abajo después del gráfico de rentabilidad
3. Escribe la preparación en el textarea
4. Selecciona los alérgenos haciendo clic en los badges
5. Haz clic en "Guardar Cambios"
6. Verás una confirmación en toast verde

### Paso 3: Verificar
- Los cambios se guardan en la base de datos
- Al cerrar y reabrir el plato, verás los datos guardados
- Los alérgenos seleccionados aparecen resaltados en naranja

---

## 🔍 Detalles Técnicos

### Estado Local
```tsx
const [preparation, setPreparation] = useState(dish.preparation || '');
const [selectedAllergens, setSelectedAllergens] = useState<string[]>(dish.allergens || []);
```

### Toggle Alérgenos
```tsx
const toggleAllergen = (allergenId: string) => {
  setSelectedAllergens(prev => {
    if (prev.includes(allergenId)) {
      return prev.filter(id => id !== allergenId);
    } else {
      return [...prev, allergenId];
    }
  });
};
```

### Detección de Cambios
```tsx
const hasChanges = 
  preparation !== (dish.preparation || '') || 
  JSON.stringify(selectedAllergens.sort()) !== JSON.stringify((dish.allergens || []).sort());
```

### Guardar
```tsx
const handleSave = async () => {
  await updateDish(dish.id, {
    preparation: preparation.trim() || undefined,
    allergens: selectedAllergens.length > 0 ? selectedAllergens : []
  });
  
  toast.success('Información guardada correctamente');
  if (onUpdate) onUpdate(); // Refetch dishes
};
```

---

## 📊 Estructura de Datos

### En la Base de Datos
```sql
-- Tabla: dishes
{
  id: uuid,
  name: text,
  price: numeric,
  preparation: text,              -- NUEVO ✨
  allergens: jsonb,                -- NUEVO ✨
  ...
}
```

### En JavaScript/TypeScript
```typescript
interface Dish {
  id: string;
  name: string;
  price: number;
  preparation?: string;
  allergens?: string[];  // ['gluten', 'lacteos', 'huevo']
  ...
}
```

---

## ✅ Checklist de Implementación

- [x] Crear SQL migration
- [x] Actualizar `createDish` y `updateDish`
- [x] Actualizar hook `useDishesWithIngredients`
- [x] Agregar estado local en `DishDetailSheet`
- [x] Crear UI para Preparación (textarea)
- [x] Crear UI para Alérgenos (badges)
- [x] Implementar toggle de alérgenos
- [x] Implementar guardar cambios
- [x] Agregar detección de cambios
- [x] Mostrar botón solo si hay cambios
- [x] Toast notifications
- [x] Refetch después de guardar
- [x] Seguir Guidelines de diseño
- [x] Testing básico

---

## 🎯 Próximas Mejoras Potenciales

1. **Auto-save**: Guardar automáticamente al escribir (con debounce)
2. **Alérgenos custom**: Permitir agregar alérgenos personalizados
3. **Templates de preparación**: Plantillas predefinidas por tipo de plato
4. **Iconos de alérgenos en lista**: Mostrar iconitos en la lista de platos
5. **Filtros por alérgenos**: Filtrar platos que no contengan ciertos alérgenos
6. **Rich text editor**: Editor con formato para la preparación
7. **Imágenes de preparación**: Subir fotos de los pasos
8. **Tiempo de preparación**: Campo para indicar minutos de prep

---

**Versión:** 1.0  
**Fecha:** Noviembre 2024  
**Autor:** CostoComida Team
