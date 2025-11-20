# 🍽️ REPLICACIÓN COMPLETA: Lead Magnet → Main App

## 📋 Resumen Ejecutivo

Este documento detalla cómo replicar los componentes clave del **Lead Magnet** (funnel de 2 pantallas) al **Main App** de CostoComida, manteniendo la ficha de resumen del plato, alertas de rentabilidad por categoría, y dashboard de análisis.

**DIFERENCIA CLAVE:**  
- **Lead Magnet**: Los usuarios pueden crear ingredientes nuevos on-the-fly mientras crean platos
- **Main App**: Los ingredientes DEBEN venir del inventario existente (no se crean nuevos durante la creación de platos)

---

## 🎯 Componentes a Replicar

### 1. **DishDetailSheet.tsx** - Ficha de Resumen del Plato ✅
**Ubicación actual:** `/components/DishDetailSheet.tsx`

#### Funcionalidades:
- ✅ Métricas principales en cards
  - 💰 Costo Total (con % del precio neto)
  - 📈 Margen Bruto (con % de margen)
- ✅ Pricing row compacto (3 columnas)
  - Precio Público
  - Impuestos (con % configurable)
  - Precio Neto (precio - impuestos)
- ✅ Desglose visual de ingredientes
  - Lista detallada con cantidades, precios unitarios, merma
  - Barra de % de costo por ingrediente (verde/naranja/rojo)
  - Cálculo de costo base + merma por ingrediente
- ✅ Gráfico de Pie (Recharts)
  - Distribución Beneficio Neto vs Costo Total
  - Colores: Verde (#7BB97A) y Naranja (#F59E0B)
- ✅ Preparación del plato (textarea editable)
- ✅ Alérgenos (badges interactivos con 8 opciones)
  - Gluten 🌾, Pescado 🐟, Lácteos 🥛, Huevo 🥚
  - Frutos Secos 🥜, Soja 🫘, Mariscos 🦐, Sulfitos 🍷
- ✅ Botón "Guardar Cambios" (solo visible si hay cambios)
- ✅ Botón "Editar" en header (blanco sobre fondo #2F3A33)
- ✅ Header oscuro (#2F3A33) con nombre del plato
- ✅ Sheet de 90vh con scroll

#### Cálculos Implementados:
```typescript
// 1. Costo por ingrediente (con merma)
const baseCost = quantity * price;
const wasteAmount = baseCost * (wastePercentage / 100);
const totalCost = baseCost + wasteAmount;

// 2. Precio neto (después de impuestos)
const taxAmount = salePrice * (taxPercentage / 100);
const netSalePrice = salePrice - taxAmount;

// 3. Beneficio neto
const netProfit = netSalePrice - totalCost;

// 4. Porcentajes
const costPercentage = (totalCost / netSalePrice) * 100;
const profitPercentage = 100 - costPercentage;
```

#### Props Interface:
```typescript
interface DishDetailSheetProps {
  dish: {
    id: string;
    name: string;
    price: number;
    preparation?: string;
    allergens?: string[];
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
      price: string;
      wastePercentage: string;
    }>;
  } | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdate?: () => void;
  currencySymbol: string;
  taxPercentage: number;
}
```

---

### 2. **MenuScreen.tsx** - Dashboard Principal (PARCIAL)
**Ubicación actual:** `/components/MenuScreen.tsx`

#### Funcionalidades a Replicar:

##### ✅ A. Alertas de Categorías Rentables
**Código ubicación:** Líneas 437-486 de MenuScreen.tsx

```typescript
// Calcular rentabilidad por categoría
const getCategoryStats = () => {
  const stats: any = {};
  
  categories.forEach(cat => {
    const categoryDishes = menuItems.filter(d => d.category === cat.id);
    const totalDishes = categoryDishes.length;
    
    if (totalDishes === 0) {
      stats[cat.id] = { avgMargin: 0, totalDishes: 0, totalRevenue: 0 };
      return;
    }

    const margins = categoryDishes.map(d => {
      const cost = calculateDishCost(d.ingredients);
      const price = d.price || 0;
      const taxPercent = parseFloat(taxPercentage) || 0;
      return calculateMargin(price, cost, taxPercent);
    });

    const avgMargin = margins.reduce((sum, m) => sum + m, 0) / totalDishes;
    
    stats[cat.id] = {
      avgMargin: Math.round(avgMargin),
      totalDishes,
      totalRevenue: categoryDishes.reduce((sum, d) => sum + (d.price || 0), 0)
    };
  });

  return stats;
};

// Encontrar categoría más rentable
const mostProfitableCategory = categories
  .filter(c => !c.hidden && categoryStats[c.id]?.totalDishes > 0)
  .sort((a, b) => (categoryStats[b.id]?.avgMargin || 0) - (categoryStats[a.id]?.avgMargin || 0))[0];

// Colores por margen
const getMarginColor = (margin: number) => {
  if (margin >= 65) return 'text-[#4e9643]'; // Verde
  if (margin >= 50) return 'text-[#F59E0B]'; // Naranja
  return 'text-[#DC2626]'; // Rojo
};

// Badges por margen
const getMarginBadge = (margin: number) => {
  if (margin >= 65) return { text: 'Saludable', bg: 'bg-[#4e9643] text-white' };
  if (margin >= 50) return { text: 'Ajustar', bg: 'bg-[#F59E0B] text-white' };
  return { text: 'Riesgo', bg: 'bg-[#DC2626] text-white' };
};
```

**UI Component:**
- 🏆 Card destacada con la categoría más rentable
- 🎨 Emoji + nombre de categoría
- 📊 Margen promedio con badge (Saludable/Ajustar/Riesgo)
- 📈 Total de platos en la categoría

##### ✅ B. Dashboard de Rentabilidad por Categoría
**Gráfico de barras con Recharts:**

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Preparar datos para el gráfico
const chartData = categories
  .filter(c => !c.hidden && categoryStats[c.id]?.totalDishes > 0)
  .map(c => ({
    name: c.emoji,
    fullName: c.label,
    margin: categoryStats[c.id]?.avgMargin || 0,
    dishes: categoryStats[c.id]?.totalDishes || 0
  }))
  .sort((a, b) => b.margin - a.margin);

// Colores dinámicos por barra
const getBarColor = (margin: number) => {
  if (margin >= 65) return '#4e9643'; // Verde
  if (margin >= 50) return '#F59E0B'; // Naranja
  return '#DC2626'; // Rojo
};

// Componente del gráfico
<ResponsiveContainer width="100%" height={240}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#CFE0D8" />
    <XAxis 
      dataKey="name" 
      tick={{ fill: '#4D6B59', fontSize: 20 }}
      axisLine={{ stroke: '#CFE0D8' }}
    />
    <YAxis 
      tick={{ fill: '#4D6B59', fontSize: 12 }}
      axisLine={{ stroke: '#CFE0D8' }}
      label={{ value: 'Margen %', angle: -90, position: 'insideLeft', fill: '#4D6B59' }}
    />
    <Tooltip 
      content={(props) => {
        if (!props.active || !props.payload?.[0]) return null;
        const data = props.payload[0].payload;
        return (
          <div className="bg-white p-3 rounded-[12px] border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
            <p className="font-['Poppins'] font-semibold text-[14px] text-[#1A1A1A]">
              {data.fullName}
            </p>
            <p className="font-['Inter'] text-[12px] text-[#4D6B59] mt-1">
              Margen: {data.margin.toFixed(1)}%
            </p>
            <p className="font-['Inter'] text-[12px] text-[#4D6B59]">
              Platos: {data.dishes}
            </p>
          </div>
        );
      }}
    />
    <Bar dataKey="margin" radius={[8, 8, 0, 0]}>
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={getBarColor(entry.margin)} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

##### ✅ C. Cálculo de Márgenes con Impuestos
**Helper Functions:**

```typescript
// Calcular costo de un plato
const calculateDishCost = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ing) => {
    const quantity = parseFloat(ing.quantity) || 0;
    const price = parseFloat(ing.price) || 0;
    const waste = parseFloat(ing.wastePercentage) || 0;
    
    // Costo base
    const baseCost = quantity * price;
    
    // Agregar merma
    const wasteAmount = baseCost * (waste / 100);
    
    return total + baseCost + wasteAmount;
  }, 0);
};

// Calcular precio neto (descontando impuestos)
const calculateNetPrice = (publicPrice: number, taxPercent: number): number => {
  const taxAmount = publicPrice * (taxPercent / 100);
  return publicPrice - taxAmount;
};

// Calcular margen de beneficio
const calculateMargin = (publicPrice: number, cost: number, taxPercent: number = 0): number => {
  if (publicPrice <= 0) return 0;
  const netPrice = calculateNetPrice(publicPrice, taxPercent);
  return ((netPrice - cost) / netPrice) * 100;
};
```

---

### 3. **Creación de Platos con Ingredientes del Inventario**

#### ❌ NO Replicar (Lead Magnet):
```typescript
// ❌ Función que permite crear ingredientes nuevos
const handleCreateNewIngredient = (index: number, name: string) => {
  const updated = [...ingredients];
  updated[index] = {
    name: name, // Ingrediente nuevo
    purchaseUnit: '',
    pricePerPurchaseUnit: '',
    dishUnit: '',
    quantityInDish: '',
    ingredientWastage: '0',
    inventoryItemId: undefined,
    isExisting: false,
    isEditing: true,
  };
  setIngredients(updated);
};
```

#### ✅ SÍ Replicar (Main App):
```typescript
// ✅ Solo permitir seleccionar ingredientes existentes del inventario
const handleSelectExistingIngredient = (index: number, item: any) => {
  console.log('🔍 handleSelectExistingIngredient - Selected item:', item);
  
  // Validar que el item exista en el inventario
  if (!item || !item.id || !item.name) {
    console.error('❌ Item inválido:', item);
    toast.error('Error al seleccionar ingrediente');
    return;
  }
  
  const updated = [...ingredients];
  updated[index] = {
    ...updated[index],
    inventoryItemId: item.id,
    isExisting: true,
    isEditing: false,
    name: item.name,
    purchaseUnit: item.unit || 'kg',
    pricePerPurchaseUnit: (item.price_per_unit || 0).toString(),
    ingredientWastage: '0',
    // Mantener valores de dishUnit y quantityInDish
    unit: item.unit || 'kg',
    price: (item.price_per_unit || 0).toString(),
    wastePercentage: '0',
  };
  setIngredients(updated);
  console.log('✅ Ingrediente del inventario seleccionado:', updated[index]);
};
```

**Componente de UI:**
- Usar `IngredientCombobox.tsx` (ya existe)
- Configurar `allowCreateNew={false}` en el Main App
- Mostrar mensaje si no hay ingredientes en inventario:
  ```tsx
  {inventoryItems.length === 0 && (
    <div className="bg-[#FFFBF5] border border-[#F59E0B] rounded-[16px] p-4 mb-4">
      <p className="text-[#F59E0B] font-['Inter'] text-[14px]">
        ⚠️ No hay ingredientes en tu inventario. 
        <a href="/inventory" className="underline ml-1">Agregar ingredientes</a>
      </p>
    </div>
  )}
  ```

---

## 🗄️ Schema de Base de Datos

### Tablas Principales

#### 1. **inventory_items**
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  emoji TEXT DEFAULT '🥗',
  unit TEXT NOT NULL, -- 'kg', 'lt', 'ml', 'gr', 'piezas', 'tazas'
  price_per_unit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);

-- RLS Policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2. **menu_categories**
```sql
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  is_hidden BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_menu_categories_user_id ON menu_categories(user_id);
CREATE INDEX idx_menu_categories_display_order ON menu_categories(display_order);

-- RLS Policies
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own menu categories"
  ON menu_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menu categories"
  ON menu_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menu categories"
  ON menu_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menu categories"
  ON menu_categories FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3. **dishes**
```sql
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  preparation TEXT, -- Instrucciones de preparación
  allergens TEXT[] DEFAULT '{}', -- Array de IDs de alérgenos
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dishes_user_id ON dishes(user_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);

-- RLS Policies
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dishes"
  ON dishes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dishes"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. **dish_ingredients**
```sql
CREATE TABLE dish_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 3) NOT NULL, -- Cantidad usada en el plato
  unit TEXT NOT NULL, -- Unidad usada en el plato
  waste_percentage DECIMAL(5, 2) DEFAULT 0, -- % de merma del ingrediente en este plato
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);
CREATE INDEX idx_dish_ingredients_inventory_item_id ON dish_ingredients(inventory_item_id);

-- RLS Policies
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dish ingredients for their dishes"
  ON dish_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_ingredients.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert dish ingredients for their dishes"
  ON dish_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_ingredients.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update dish ingredients for their dishes"
  ON dish_ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_ingredients.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete dish ingredients for their dishes"
  ON dish_ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dishes 
      WHERE dishes.id = dish_ingredients.dish_id 
      AND dishes.user_id = auth.uid()
    )
  );
```

#### 5. **user_settings**
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  currency TEXT DEFAULT 'MXN', -- 'MXN', 'USD', 'COP', 'ARS', etc.
  tax_percentage DECIMAL(5, 2) DEFAULT 0, -- % de impuestos (IVA, etc.)
  country TEXT,
  business_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🔧 Hooks de Supabase

### Archivo: `/hooks/useSupabase.ts`

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();

// Hook para obtener platos con ingredientes
export function useDishesWithIngredients() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          category:menu_categories(id, name, emoji),
          dish_ingredients(
            id,
            quantity,
            unit,
            waste_percentage,
            inventory_item:inventory_items(
              id,
              name,
              price_per_unit,
              unit,
              category,
              emoji
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refetch();
  }, []);
  
  return { dishes, loading, refetch };
}

// Hook para obtener categorías del menú
export function useMenuCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refetch();
  }, []);
  
  return { categories, loading, refetch };
}

// Hook para obtener items del inventario
export function useInventoryItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refetch();
  }, []);
  
  return { items, loading, refetch };
}

// Hook para análisis de rentabilidad por plato
export function useDishProfitabilityAnalysis() {
  const [profitabilityData, setProfitabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    // Este hook puede calcular métricas agregadas en el cliente
    // o llamar a una función de Postgres/Edge Function
    setLoading(false);
  };
  
  useEffect(() => {
    refetch();
  }, []);
  
  return { profitabilityData, loading, refetch };
}

// Hook para configuración del usuario
export function useUserSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refetch();
  }, []);
  
  return { settings, loading, refetch };
}
```

---

## 🎨 PROMPT PARA FIGMA - Main App Design

### 📝 Prompt Completo para Diseño en Figma

```markdown
# 🍽️ CostoComida - Main App Design (Figma)

## Objetivo
Diseñar el **Main App** de CostoComida aplicando el sistema visual del lead magnet pero adaptado para un dashboard completo de gestión de restaurante.

---

## 📐 Especificaciones Técnicas

### Viewport
- **Mobile:** 390×844 px (portrait)
- **Desktop:** 1440×900 px (landscape, prioridad)
- **Approach:** Desktop-first para productividad

---

## 🎨 Sistema Visual (IDÉNTICO al Lead Magnet)

### Color Palette
```
Primary Gradient: #A6D49F → #7BB97A
Surface Primary: #FFFFFF
Surface Accent: #F5FAF7
Ink Darkest: #1A1A1A
Ink Dark: #2F3A33
Ink Medium: #4D6B59
Ink Light: #9FB3A8
Ink Border: #CFE0D8
Success: #4e9643
Warning: #F59E0B
Error: #DC2626
```

### Tipografía
- **Headings:** Poppins (SemiBold 600, Bold 700)
- **Body:** Inter (Regular 400, Medium 500)
- **Display XL:** 56px / 64px / -2% tracking
- **H1:** 36px / 44px / -2% tracking
- **H2:** 28px / 36px / -2% tracking
- **H3:** 22px / 30px / -2% tracking
- **Body:** 16px / 24px
- **Small:** 14px / 20px

### Componentes
- **Border Radius Card:** 16px
- **Border Radius Modal:** 24px
- **Button Height:** 48px
- **Input Height:** 48px
- **Shadow Level 1:** 0 1px 2px rgba(16,24,40,0.06)
- **Shadow Level 2:** 0 4px 12px rgba(16,24,40,0.08)

---

## 📱 Pantallas a Diseñar

### 1. **Dashboard Principal** (Home)

#### Layout Desktop (1440×900)
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar - 240px width]  │  [Main Content - Flex]          │
│                           │                                  │
│  🍽️ CostoComida           │  Header: "Dashboard"            │
│  ────────────────         │  Subtitle: "Resumen general"    │
│  📊 Dashboard             │                                  │
│  🥗 Inventario            │  ┌────────────────────────────┐ │
│  🍕 Menú                  │  │ 🏆 Categoría Más Rentable  │ │
│  📈 Reportes              │  │ 🍕 Pizzas - 72% margen     │ │
│  ⚙️ Configuración         │  │ 12 platos • $24,500 total  │ │
│  ────────────────         │  └────────────────────────────┘ │
│  👤 Juan Pérez            │                                  │
│  🌐 MXN • 16% IVA         │  ┌─ Rentabilidad por Categoría─┐│
│  🚪 Cerrar Sesión         │  │                              ││
│                           │  │  [Gráfico de Barras]         ││
│                           │  │  🍕 ████████████ 72%         ││
│                           │  │  🥗 ██████████ 65%           ││
│                           │  │  🍔 ████████ 58%             ││
│                           │  │  🍰 ██████ 45%               ││
│                           │  └──────────────────────────────┘│
│                           │                                  │
│                           │  ┌─ Métricas Generales ────────┐│
│                           │  │ Total Platos: 48             ││
│                           │  │ Margen Promedio: 63%         ││
│                           │  │ Ingresos Proyectados: $85k   ││
│                           │  └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Componentes del Dashboard:**

1. **Card Categoría Más Rentable**
   - Icono 🏆 dorado
   - Emoji de la categoría (grande, 32px)
   - Nombre de categoría (H2 Poppins 28px)
   - Badge de margen con color (Verde si ≥65%, Naranja si ≥50%, Rojo si <50%)
   - Subtítulo: "X platos • $XX,XXX total"
   - Fondo: Gradiente suave de #F5FAF7 a blanco
   - Border: 2px sólido #7BB97A si es saludable
   - Shadow: Level 2

2. **Gráfico de Barras - Rentabilidad por Categoría**
   - Título: "Rentabilidad por Categoría" (H3 Poppins)
   - Recharts BarChart
   - Eje X: Emojis de categorías (20px)
   - Eje Y: Porcentaje de margen (0-100%)
   - Barras con border-radius 8px top
   - Colores dinámicos por barra (verde/naranja/rojo según margen)
   - Tooltip personalizado (fondo blanco, border #CFE0D8, shadow)
   - Grid con líneas punteadas (#CFE0D8)
   - Altura: 320px

3. **Cards de Métricas Generales**
   - Grid de 3 columnas
   - Cada card:
     - Icono relevante (lucide-react)
     - Label superior (12px Inter uppercase #4D6B59)
     - Valor grande (32px Poppins Bold #1A1A1A)
     - Subtítulo opcional (14px Inter #9FB3A8)
     - Fondo blanco, border #CFE0D8, radius 16px

---

### 2. **Inventario de Ingredientes**

#### Features Clave:
- ✅ Lista completa de ingredientes del inventario
- ✅ Búsqueda por nombre
- ✅ Filtros por categoría (Carnes, Verduras, Lácteos, etc.)
- ✅ Agregar nuevo ingrediente (modal)
- ✅ Editar ingrediente existente (modal)
- ✅ Eliminar ingrediente (confirmación)
- ✅ Vista de tabla con columnas:
  - Nombre + Emoji
  - Categoría
  - Unidad de compra
  - Precio por unidad
  - Última actualización
  - Acciones (Editar/Eliminar)

#### Diseño Visual:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: "Inventario"                                       │
│  Subtitle: "Gestiona tus ingredientes"                      │
│                                                              │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ 🔍 Buscar │  │ Categoría ▼  │  │ ➕ Nuevo Ingrediente │ │
│  └───────────┘  └──────────────┘  └──────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Nombre         │ Categoría  │ Unidad │ Precio │ ... │ ││
│  │────────────────│────────────│────────│────────│─────│ ││
│  │ 🥩 Carne Res   │ Carnes     │ kg     │ $180   │ ⚙️ 🗑️ ││
│  │ 🧀 Queso       │ Lácteos    │ kg     │ $250   │ ⚙️ 🗑️ ││
│  │ 🍅 Tomate      │ Verduras   │ kg     │ $35    │ ⚙️ 🗑️ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Modal: Agregar/Editar Ingrediente**
- Título: "Nuevo Ingrediente" o "Editar: [Nombre]"
- Campos:
  - Nombre (text input)
  - Emoji (emoji picker o input)
  - Categoría (dropdown)
  - Unidad de compra (dropdown: kg, lt, ml, gr, piezas)
  - Precio por unidad (number input con símbolo de moneda)
- Botones:
  - "Cancelar" (blanco, secundario)
  - "Guardar" (gradiente verde, primario)

---

### 3. **Menú - Gestión de Platos**

#### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  Header: "Menú"                                             │
│  Subtitle: "Gestiona tus platos y categorías"              │
│                                                              │
│  ┌─ 🍕 Pizzas (12 platos) ───────────────────────────────┐  │
│  │  Margen promedio: 72% • Saludable                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │ │
│  │  │ Pizza      │  │ Pizza      │  │ ➕ Nuevo   │        │ │
│  │  │ Margherita │  │ Pepperoni  │  │ Plato      │        │ │
│  │  │ $180       │  │ $220       │  │            │        │ │
│  │  │ 75% margen │  │ 70% margen │  │            │        │ │
│  │  └────────────┘  └────────────┘  └────────────┘        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ 🥗 Ensaladas (8 platos) ─────────────────────────────┐  │
│  │  Margen promedio: 65% • Saludable                       │ │
│  │  [Cards de platos...]                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Card de Plato:**
- Fondo blanco, border #CFE0D8, radius 16px
- Padding: 16px
- Imagen placeholder (opcional) o emoji
- Nombre del plato (H3 Poppins 18px)
- Precio (H4 Poppins 22px con símbolo de moneda)
- Badge de margen con color
- Hover: Shadow Level 2, scale 1.02
- Click: Abre **DishDetailSheet** (EXACTO al del lead magnet)

**Botón "Nuevo Plato":**
- Card con border punteado (#7BB97A)
- Icono ➕ grande
- Texto "Nuevo Plato"
- Hover: fondo #F5FAF7
- Click: Abre modal de creación

---

### 4. **Modal: Crear/Editar Plato**

#### Diseño Visual:
```
┌──────────────────────────────────────────┐
│  Nuevo Plato en "Pizzas"          [X]   │
├──────────────────────────────────────────┤
│                                          │
│  Nombre del plato                        │
│  ┌────────────────────────────────────┐  │
│  │ Pizza Margherita                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Precio de venta                         │
│  ┌────────────────────────────────────┐  │
│  │ $ 180.00                           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ Ingredientes (del inventario) ────┐ │
│  │                                     │ │
│  │  🔍 Buscar ingrediente...           │ │
│  │  ┌─────────────────────────────┐   │ │
│  │  │ 🧀 Queso Mozzarella         │   │ │
│  │  │ 250 gr  •  $250/kg          │   │ │
│  │  │ Merma: 5%        [Editar] 🗑️ │   │ │
│  │  └─────────────────────────────┘   │ │
│  │                                     │ │
│  │  🧀 Queso Mozzarella (seleccionado)│ │
│  │  ┌───────┐  ┌───────┐  ┌───────┐  │ │
│  │  │ Cant. │  │ Unidad│  │ Merma │  │ │
│  │  │  250  │  │   gr  │  │   5%  │  │ │
│  │  └───────┘  └───────┘  └───────┘  │ │
│  │                                     │ │
│  │  ➕ Agregar otro ingrediente        │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ⚠️ Solo puedes usar ingredientes de tu │
│     inventario existente                 │
│                                          │
│  ┌────────────┐  ┌────────────────────┐ │
│  │ Cancelar   │  │ Guardar Plato      │ │
│  └────────────┘  └────────────────────┘ │
└──────────────────────────────────────────┘
```

**IMPORTANTE:**
- ❌ NO mostrar opción de crear ingrediente nuevo
- ✅ Solo permitir seleccionar del inventario existente
- ✅ Si no hay ingredientes, mostrar alerta:
  ```
  ⚠️ No tienes ingredientes en tu inventario
  [Ir a Inventario] para agregar ingredientes
  ```

**Combobox de Ingredientes:**
- Usar componente `IngredientCombobox.tsx`
- Configurar `allowCreateNew={false}`
- Mostrar sugerencias del inventario
- Filtrar en tiempo real
- Mostrar: Emoji + Nombre + Precio/Unidad

---

### 5. **DishDetailSheet - Ficha de Resumen del Plato**

#### ⚠️ REPLICAR EXACTO DEL LEAD MAGNET

**Componente:** `/components/DishDetailSheet.tsx`

**Layout Mobile (390×844):**
```
┌──────────────────────────────────────────┐
│ ╔══════════════════════════════════════╗ │
│ ║ 🍕 Pizza Margherita        [Editar] ║ │ ← Header oscuro (#2F3A33)
│ ╚══════════════════════════════════════╝ │
│  ┌────────────┐  ┌────────────────────┐  │
│  │💰 Costo    │  │📈 Margen Bruto     │  │
│  │   $45.20   │  │   $134.80          │  │
│  │   33.5%    │  │   66.5% margen     │  │
│  └────────────┘  └────────────────────┘  │
│                                          │
│  ┌─────┐  ┌─────────┐  ┌──────────────┐ │
│  │$180 │  │IVA $28.8│  │Neto $151.20  │ │
│  └─────┘  └─────────┘  └──────────────┘ │
│                                          │
│  ┌─ Desglose de Ingredientes ─────────┐ │
│  │  4 ingredientes • $45.20 total      │ │
│  │                                     │ │
│  │  ┌─────────────────────────────┐   │ │
│  │  │ 🧀 Queso Mozzarella         │   │ │
│  │  │ 250 gr × $250/kg            │   │ │
│  │  │ • 5% merma                  │   │ │
│  │  │                    $65.63   │   │ │
│  │  │ ██████████ 45.1%            │   │ │ ← Barra color
│  │  └─────────────────────────────┘   │ │
│  │  [Más ingredientes...]              │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌─ Distribución de Rentabilidad ─────┐ │
│  │  [Pie Chart]                        │ │
│  │  🟢 66.5% Beneficio Neto            │ │
│  │  🟠 33.5% Costo Total               │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌─ 👨‍🍳 Preparación del Plato ──────────┐ │
│  │  [Textarea editable]                │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌─ ⚠️ Alérgenos ──────────────────────┐ │
│  │  [🌾 Gluten] [🥛 Lácteos] ...       │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Guardar Cambios                   │  │ ← Solo si hay cambios
│  └────────────────────────────────────┘  │
└───────────────────────────────────────���──┘
```

**ESPECIFICACIONES EXACTAS:**
- Height: 90vh
- Border radius top: 24px
- Header background: #2F3A33
- Botón X: Blanco (text-white)
- Botón Editar: Blanco con text #2F3A33
- Cards de métricas: Exactos (borders, colores, tamaños)
- Gráfico de pie: Recharts, colores #7BB97A y #F59E0B
- Badges de alérgenos: Interactivos, border 2px
- Todo el styling IDÉNTICO al código existente

---

### 6. **Configuración**

#### Sections:
1. **Perfil**
   - Nombre del usuario
   - Email
   - Cambiar contraseña (toggle para mostrar/ocultar)

2. **Moneda e Impuestos**
   - Selector de moneda (MXN, USD, COP, etc.)
   - % de impuestos (IVA)
   - Visualización: "IVA 16%" en badge

3. **Gestión de Categorías**
   - Lista de categorías con opciones de editar/eliminar
   - Agregar nueva categoría (emoji + nombre)
   - Drag & drop para reordenar (opcional)

4. **Sesión**
   - Botón "Cerrar Sesión" (rojo, secundario)

---

## 🔄 Flujo de Navegación

```
Dashboard → Ver categoría más rentable
          → Ver gráfico de barras
          → Click en barra → Ir a Menú filtrado por esa categoría

Inventario → Agregar ingrediente → Modal
           → Editar ingrediente → Modal
           → Eliminar → Confirmación

Menú → Ver categorías con platos
     → Click en plato → DishDetailSheet (modal bottom)
     → Click "Editar" en DishDetailSheet → Modal Editar Plato
     → Click "Nuevo Plato" → Modal Crear Plato
       → Seleccionar ingredientes DEL INVENTARIO
       → Guardar → Refresh menú

Configuración → Cambiar % impuestos → Afecta todos los cálculos
              → Cambiar moneda → Afecta símbolos en toda la app
```

---

## 📦 Componentes Reutilizables

### 1. **CategoryProfitabilityCard**
```tsx
<div className="bg-gradient-to-br from-[#F5FAF7] to-white rounded-[16px] border-2 border-[#7BB97A] p-6 shadow-[0_4px_12px_rgba(123,185,122,0.15)]">
  <div className="flex items-center gap-3 mb-3">
    <div className="text-[32px]">🏆</div>
    <div className="flex-1">
      <p className="text-[12px] leading-[16px] font-['Inter'] font-semibold text-[#7BB97A] uppercase tracking-wide">
        Categoría Más Rentable
      </p>
      <h3 className="text-[28px] leading-[36px] tracking-[-0.56px] font-semibold font-['Poppins'] text-[#1A1A1A] flex items-center gap-2">
        <span className="text-[28px]">{emoji}</span>
        {categoryName}
      </h3>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <Badge className="bg-[#4e9643] text-white px-3 py-1 rounded-full text-[14px] font-['Inter'] font-medium">
      Saludable
    </Badge>
    <span className="text-[32px] leading-[40px] tracking-[-0.64px] font-bold font-['Poppins'] text-[#4e9643]">
      {margin}%
    </span>
  </div>
  <p className="text-[14px] leading-[20px] font-['Inter'] text-[#4D6B59] mt-2">
    {totalDishes} platos • {currencySymbol}{totalRevenue.toFixed(2)} total
  </p>
</div>
```

### 2. **ProfitabilityBarChart**
```tsx
<div className="bg-white rounded-[16px] border border-[#CFE0D8] p-5">
  <h3 className="text-[22px] leading-[30px] tracking-[-0.44px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-4">
    Rentabilidad por Categoría
  </h3>
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={chartData}>
      {/* Configuración exacta del gráfico */}
    </BarChart>
  </ResponsiveContainer>
</div>
```

### 3. **DishCard**
```tsx
<div className="bg-white rounded-[16px] border border-[#CFE0D8] p-4 hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all cursor-pointer">
  <div className="aspect-video bg-[#F5FAF7] rounded-[12px] mb-3 flex items-center justify-center text-[48px]">
    {emoji || '🍽️'}
  </div>
  <h4 className="text-[18px] leading-[26px] tracking-[-0.36px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-1">
    {dishName}
  </h4>
  <p className="text-[22px] leading-[30px] tracking-[-0.44px] font-bold font-['Poppins'] text-[#1A1A1A] mb-2">
    {currencySymbol}{price.toFixed(2)}
  </p>
  <Badge className={badgeClass}>
    {margin}% margen
  </Badge>
</div>
```

---

## ✅ Checklist de Elementos a Diseñar en Figma

### Páginas:
- [ ] Dashboard Principal (Desktop 1440×900)
- [ ] Inventario de Ingredientes (Desktop 1440×900)
- [ ] Menú - Gestión de Platos (Desktop 1440×900)
- [ ] Configuración (Desktop 1440×900)

### Modales:
- [ ] Modal: Agregar/Editar Ingrediente
- [ ] Modal: Crear/Editar Plato
- [ ] DishDetailSheet: Ficha de Resumen (Mobile 390×844)
- [ ] Dialog: Confirmación de Eliminación

### Componentes:
- [ ] Sidebar de navegación
- [ ] CategoryProfitabilityCard
- [ ] ProfitabilityBarChart (Recharts mockup)
- [ ] DishCard
- [ ] IngredientRow (tabla)
- [ ] Badge variants (Saludable/Ajustar/Riesgo)
- [ ] Botones primarios/secundarios
- [ ] Inputs y Selects

### Estados:
- [ ] Hover states (cards, botones)
- [ ] Empty states (sin ingredientes, sin platos)
- [ ] Loading states (skeleton loaders)
- [ ] Error states (validación de forms)

---

## 🎯 Prioridades de Diseño

### Must Have:
1. ✅ Dashboard con gráfico de barras de rentabilidad
2. ✅ DishDetailSheet EXACTO al lead magnet
3. ✅ Modal de creación de plato con ingredientes del inventario
4. ✅ Inventario de ingredientes con tabla
5. ✅ Sidebar de navegación

### Nice to Have:
- Animaciones de transición entre páginas
- Drag & drop para reordenar categorías
- Export de reportes (PDF/Excel)
- Modo oscuro (opcional)

---

## 📏 Reglas de Diseño Estrictas

1. **NUNCA usar beige** (#FFFDF5) - Solo blanco puro (#FFFFFF)
2. **Mantener sistema de colores exacto** - No inventar nuevos colores
3. **Typography scale estricta** - No crear nuevos tamaños de fuente
4. **Border radius consistente** - 16px cards, 24px modals
5. **Spacing grid** - Múltiplos de 8px (8, 16, 24, 40, 64)
6. **Shadows sutiles** - Solo Level 1 y Level 2
7. **Botones height fijo** - 48px always
8. **Inputs height fijo** - 48px always

---

## 🚀 Entregables Esperados

### Archivos de Figma:
1. **Main-App-Desktop.fig**
   - Todas las páginas desktop (1440×900)
   - Componentes reutilizables
   - Auto-layout configurado

2. **Main-App-Modals.fig**
   - Todos los modals y sheets
   - Estados interactivos
   - Variantes de componentes

3. **Design-System.fig**
   - Paleta de colores
   - Typography scale
   - Component library
   - Iconos (lucide-react)

### Extras:
- Prototipo interactivo (Figma prototype)
- Export de assets (SVG icons si aplica)
- Guía de implementación (opcional)

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0  
**Compatibilidad:** React + Tailwind + shadcn/ui
```

---

## 🚀 Próximos Pasos para Implementación

### 1. **Setup de Base de Datos**
```bash
# Ejecutar migraciones en Supabase
# 1. Crear tablas (SQL arriba)
# 2. Configurar RLS policies
# 3. Poblar categorías default
```

### 2. **Crear Estructura de Archivos**
```
/main-app
  /components
    DishDetailSheet.tsx (copiar del lead magnet)
    CategoryProfitabilityCard.tsx (nuevo)
    ProfitabilityBarChart.tsx (nuevo)
    DishCard.tsx (nuevo)
    InventoryTable.tsx (nuevo)
    Sidebar.tsx (nuevo)
  /pages
    Dashboard.tsx
    Inventory.tsx
    Menu.tsx
    Settings.tsx
  /hooks
    useSupabase.ts (actualizado)
  /lib
    supabase-helpers.ts (actualizado)
```

### 3. **Integración de Componentes**
1. Copiar `DishDetailSheet.tsx` exacto del lead magnet
2. Crear `CategoryProfitabilityCard.tsx` con cálculos
3. Implementar `ProfitabilityBarChart.tsx` con Recharts
4. Modificar modal de creación de plato:
   - Remover opción de crear ingrediente nuevo
   - Solo permitir selección del inventario
   - Agregar validación: inventario no vacío

### 4. **Testing Checklist**
- [ ] Verificar cálculos de margen con impuestos
- [ ] Validar conversión de unidades (kg→gr, lt→ml)
- [ ] Probar merma de ingredientes en costos
- [ ] Confirmar que DishDetailSheet muestra datos correctos
- [ ] Verificar gráfico de barras con datos reales
- [ ] Testear creación de plato solo con inventario existente

---

## 📞 Soporte

Si tienes dudas sobre la implementación:
1. Revisar `/REPLICACION_MAIN_APP_COMPLETA.md` (este documento)
2. Comparar con código del lead magnet en `/components/MenuScreen.tsx`
3. Verificar schemas de BD
4. Consultar Guidelines.md para sistema visual

---

**Fin del documento** 🎉
