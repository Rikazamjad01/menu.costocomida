# 🎨 FIGMA DESIGN PROMPT - CostoComida Main App

## 🎯 Objetivo
Diseñar el **Main App** de CostoComida (gestión completa de restaurante) utilizando el **mismo sistema visual del lead magnet** que ya tienes.

---

## 📐 Canvas Setup

### Frames a Crear:
1. **Desktop**: 1440×900 px (landscape, prioridad)
2. **Mobile**: 390×844 px (portrait, para modals)

### Estructura de Archivos en Figma:
```
📁 CostoComida Main App
  📄 1. Design System (referencia del lead magnet)
  📄 2. Dashboard
  📄 3. Inventario
  📄 4. Menú
  📄 5. Configuración
  📄 6. Modals & Sheets
  📄 7. Components Library
```

---

## 🎨 Sistema Visual (COPIAR DEL LEAD MAGNET)

### Color Tokens
Crea estas variables de color en Figma:

```
Primary/Gradient Start: #A6D49F
Primary/Gradient End: #7BB97A
Primary/Dark: #4e9643

Surface/Primary: #FFFFFF
Surface/Accent: #F5FAF7

Ink/Darkest: #1A1A1A
Ink/Dark: #2F3A33
Ink/Medium: #4D6B59
Ink/Light: #9FB3A8
Ink/Border: #CFE0D8

Semantic/Success: #4e9643
Semantic/Warning: #F59E0B
Semantic/Error: #DC2626
Semantic/Info: #3B82F6
```

### Typography Styles
Crea estos text styles en Figma:

```
Display XL
  Font: Poppins Bold
  Size: 56px
  Line: 64px
  Letter Spacing: -2%
  Color: Ink/Darkest

H1 - Page Title
  Font: Poppins Bold
  Size: 36px
  Line: 44px
  Letter Spacing: -2%
  Color: Ink/Darkest

H2 - Section Title
  Font: Poppins SemiBold
  Size: 28px
  Line: 36px
  Letter Spacing: -2%
  Color: Ink/Darkest

H3 - Card Title
  Font: Poppins SemiBold
  Size: 22px
  Line: 30px
  Letter Spacing: -2%
  Color: Ink/Darkest

H4 - Subsection
  Font: Poppins SemiBold
  Size: 18px
  Line: 26px
  Letter Spacing: -2%
  Color: Ink/Darkest

Body - Regular
  Font: Inter Regular
  Size: 16px
  Line: 24px
  Color: Ink/Dark

Body - Medium
  Font: Inter Medium
  Size: 16px
  Line: 24px
  Color: Ink/Dark

Small - Regular
  Font: Inter Regular
  Size: 14px
  Line: 20px
  Color: Ink/Medium

Small - Medium
  Font: Inter Medium
  Size: 14px
  Line: 20px
  Color: Ink/Medium

Tiny - Regular
  Font: Inter Regular
  Size: 12px
  Line: 16px
  Color: Ink/Light

Button Text
  Font: Inter Medium
  Size: 16px
  Line: 24px
  Color: White or Ink/Dark
```

### Component Styles

**Border Radius:**
- Cards: 16px
- Modals: 24px
- Small elements: 12px
- Buttons: 16px

**Shadows:**
- Level 1: `0px 1px 2px rgba(16, 24, 40, 0.06)`
- Level 2: `0px 4px 12px rgba(16, 24, 40, 0.08)`

**Fixed Heights:**
- Buttons: 48px
- Inputs: 48px
- Select dropdowns: 48px

---

## 📱 Páginas a Diseñar

### 1. 📊 Dashboard (Desktop 1440×900)

#### Layout Structure:
```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px fixed)     │  MAIN CONTENT (1200px max)       │
│                            │                                  │
│  🍽️ CostoComida           │  ┌─ HEADER ──────────────────┐  │
│  ─────────────────         │  │ Dashboard                  │  │
│  📊 Dashboard (active)     │  │ Resumen general de tu      │  │
│  🥗 Inventario             │  │ restaurante                │  │
│  🍕 Menú                   │  └────────────────────────────┘  │
│  📈 Reportes               │                                  │
│  ⚙️  Configuración         │  ┌─ CATEGORÍA MÁS RENTABLE ──┐  │
│  ─────────────────         │  │  🏆                         │  │
│  👤 Juan Pérez             │  │  🍕 Pizzas                  │  │
│  🌐 MXN • 16% IVA          │  │  72% margen • Saludable    │  │
│  🚪 Cerrar Sesión          │  │  12 platos • $24,500       │  │
│                            │  └────────────────────────────┘  │
│                            │                                  │
│                            │  ┌─ RENTABILIDAD POR CATEGORÍA ┐│
│                            │  │                              ││
│                            │  │  [BAR CHART]                 ││
│                            │  │  🍕 ████████████ 72%         ││
│                            │  │  🥗 ██████████ 65%           ││
│                            │  │  🍔 ████████ 58%             ││
│                            │  │  🍰 ██████ 45%               ││
│                            │  │                              ││
│                            │  └──────────────────────────────┘│
│                            │                                  │
│                            │  ┌─ MÉTRICAS GENERALES ────────┐│
│                            │  │ [Grid 3 cols]                ││
│                            │  │ Total │ Margen  │ Ingresos  ││
│                            │  │ Platos│ Promedio│ Proyectados││
│                            │  │  48   │   63%   │   $85k    ││
│                            │  └──────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

#### Componentes Específicos:

**A. Card: Categoría Más Rentable**
- Background: Linear gradient `#F5FAF7` 0% → `#FFFFFF` 100%
- Border: 2px solid `#7BB97A`
- Border radius: 16px
- Padding: 24px
- Shadow: Level 2
- Content:
  - 🏆 Icon (32px, color #F59E0B)
  - Label "Categoría Más Rentable" (Tiny/Medium, uppercase, #7BB97A)
  - Emoji de categoría (32px)
  - Nombre de categoría (H2/Poppins SemiBold, #1A1A1A)
  - Badge "Saludable" (bg #4e9643, text white, rounded-full, 14px Inter Medium)
  - Margen "72%" (Display number 32px Poppins Bold, #4e9643)
  - Subtítulo "12 platos • $24,500 total" (Small/Regular, #4D6B59)

**B. Gráfico de Barras: Rentabilidad por Categoría**
- Container:
  - Background: white
  - Border: 1px solid #CFE0D8
  - Border radius: 16px
  - Padding: 20px
  - Shadow: Level 1
- Título: "Rentabilidad por Categoría" (H3/Poppins SemiBold)
- Chart area: 
  - Width: 100%
  - Height: 320px
  - Grid lines: Dashed #CFE0D8
  - X-axis: Emojis de categorías (20px)
  - Y-axis: 0-100%, labels 14px Inter Regular #4D6B59
  - Bars:
    - Width: Auto (responsive)
    - Border radius top: 8px
    - Colors dinámicos:
      - ≥65%: #4e9643 (verde)
      - 50-64%: #F59E0B (naranja)
      - <50%: #DC2626 (rojo)
  - Tooltip:
    - Background: white
    - Border: 1px solid #CFE0D8
    - Border radius: 12px
    - Padding: 12px
    - Shadow: Level 2
    - Content:
      - Nombre categoría (14px Poppins SemiBold)
      - "Margen: XX%" (12px Inter Regular #4D6B59)
      - "Platos: X" (12px Inter Regular #4D6B59)

**C. Cards de Métricas Generales**
- Layout: Grid 3 columnas, gap 16px
- Cada card:
  - Background: white
  - Border: 1px solid #CFE0D8
  - Border radius: 16px
  - Padding: 20px
  - Shadow: Level 1
  - Content:
    - Icon (lucide-react, 20px, color #7BB97A)
    - Label (12px Inter SemiBold uppercase, #4D6B59)
    - Value (32px Poppins Bold, #1A1A1A)
    - Subtitle opcional (14px Inter Regular, #9FB3A8)

---

### 2. 🥗 Inventario (Desktop 1440×900)

#### Layout:
```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR   │  MAIN CONTENT                                    │
│           │                                                   │
│           │  ┌─ HEADER ────────────────────────────────────┐ │
│           │  │ Inventario                                   │ │
│           │  │ Gestiona tus ingredientes                    │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                   │
│           │  ┌─ TOOLBAR ────────────────────────────────────┐│
│           │  │ [🔍 Buscar] [Categoría ▼] [➕ Nuevo Ingred.] ││
│           │  └──────────────────────────────────────────────┘│
│           │                                                   │
│           │  ┌─ TABLE ──────────────────────────────────────┐│
│           │  │ Nombre      │Cat.│Unit│Precio│Update│Actions││
│           │  │─────────────│────│────│──────│──────│───────││
│           │  │🥩 Carne Res │Carn│kg  │$180  │2h ago│⚙️  🗑️  ││
│           │  │🧀 Queso Moz │Láct│kg  │$250  │1d ago│⚙️  🗑️  ││
│           │  │🍅 Tomate    │Verd│kg  │$35   │3h ago│⚙️  🗑️  ││
│           │  │...                                            ││
│           │  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

#### Componentes:

**Toolbar:**
- Height: 56px
- Background: white
- Border bottom: 1px solid #CFE0D8
- Padding: 12px 20px
- Content:
  - Search input:
    - Width: 320px
    - Height: 48px
    - Icon: 🔍 (left, 16px)
    - Placeholder: "Buscar ingrediente..."
    - Border: 1px solid #CFE0D8
    - Border radius: 16px
    - Focus: border #7BB97A, ring 2px #7BB97A 25% opacity
  - Category filter:
    - Width: 200px
    - Height: 48px
    - Dropdown (select)
  - Button "Nuevo Ingrediente":
    - Primary gradient button
    - Height: 48px
    - Icon: ➕ (left)
    - Text: "Nuevo Ingrediente"

**Table:**
- Background: white
- Border: 1px solid #CFE0D8
- Border radius: 16px
- Columns:
  1. Nombre (emoji + text, 40% width)
  2. Categoría (badge, 15%)
  3. Unidad (text, 10%)
  4. Precio (currency, 15%)
  5. Última actualización (relative time, 12%)
  6. Acciones (icons, 8%)
- Row:
  - Height: 64px
  - Border bottom: 1px solid #CFE0D8
  - Hover: background #F5FAF7
  - Padding: 12px 20px

**Empty State:**
- Centered in table area
- Icon: 📦 (64px)
- Title: "No hay ingredientes" (H3)
- Description: "Agrega tu primer ingrediente..." (Body)
- Button: "Agregar Ingrediente" (primary)

---

### 3. 🍕 Menú (Desktop 1440×900)

#### Layout:
```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR   │  MAIN CONTENT                                    │
│           │                                                   │
│           │  ┌─ HEADER ────────────────────────────────────┐ │
│           │  │ Menú                                         │ │
│           │  │ Gestiona tus platos y categorías             │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                   │
│           │  ┌─ CATEGORY: 🍕 Pizzas ───────────────────────┐ │
│           │  │ 12 platos • Margen promedio: 72% • Saludable│ │
│           │  │                                              │ │
│           │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │ │
│           │  │  │Pizza │ │Pizza │ │Pizza │ │ ➕   │        │ │
│           │  │  │Margh.│ │Pepp. │ │Haway.│ │Nuevo│        │ │
│           │  │  │$180  │ │$220  │ │$250  │ │Plato│        │ │
│           │  │  │75%   │ │70%   │ │68%   │ │     │        │ │
│           │  │  └──────┘ └──────┘ └──────┘ └──────┘        │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                   │
│           │  ┌─ CATEGORY: 🥗 Ensaladas ────────────────────┐ │
│           │  │ [Similar structure]                          │ │
│           │  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

#### Componentes:

**Category Section:**
- Container:
  - Background: white
  - Border: 1px solid #CFE0D8
  - Border radius: 16px
  - Padding: 20px
  - Margin bottom: 24px
- Header:
  - Emoji (28px) + Name (H3)
  - Stats: "X platos • Margen promedio: XX% • Badge"
  - Badge colors:
    - ≥65%: bg #4e9643, text "Saludable"
    - 50-64%: bg #F59E0B, text "Ajustar"
    - <50%: bg #DC2626, text "Riesgo"
- Dishes Grid:
  - Columns: 4 (auto-fit)
  - Gap: 16px
  - Max width per card: 280px

**Dish Card:**
- Size: 280×320px
- Background: white
- Border: 1px solid #CFE0D8
- Border radius: 16px
- Padding: 16px
- Shadow: Level 1
- Hover: 
  - Shadow: Level 2
  - Transform: scale(1.02)
  - Transition: 200ms ease
- Content:
  - Image placeholder:
    - Aspect ratio: 16:9
    - Background: #F5FAF7
    - Border radius: 12px
    - Emoji centered (48px)
  - Name (H4, 18px Poppins SemiBold, #1A1A1A)
  - Price (22px Poppins Bold, #1A1A1A, currency symbol)
  - Badge margin:
    - Background color based on margin
    - Text: "XX% margen"
    - Border radius: full
    - Padding: 4px 12px
    - 14px Inter Medium

**"Nuevo Plato" Card:**
- Same size as Dish Card
- Border: 2px dashed #7BB97A
- Background: white
- Hover: background #F5FAF7
- Content:
  - Icon ➕ (48px, color #7BB97A)
  - Text "Nuevo Plato" (16px Inter Medium, #7BB97A)
  - Centered vertically and horizontally

---

### 4. ⚙️ Configuración (Desktop 1440×900)

#### Sections:

**A. Perfil**
- Name input
- Email input (read-only)
- Button "Cambiar Contraseña" (toggle)

**B. Moneda e Impuestos**
- Currency select dropdown
- Tax percentage input (number)
- Preview: "IVA 16%" badge

**C. Gestión de Categorías**
- List of categories
- Each row: Emoji + Name + Edit icon + Delete icon
- Button "Nueva Categoría"

**D. Sesión**
- Button "Cerrar Sesión" (red, destructive style)

---

### 5. 🔲 Modals & Sheets

#### A. Modal: Agregar/Editar Ingrediente

**Size:** 520×600px (centered overlay)

**Structure:**
```
┌────────────────────────────────────┐
│  Nuevo Ingrediente          [X]   │
├────────────────────────────────────┤
│                                    │
│  Nombre del ingrediente            │
│  ┌──────────────────────────────┐  │
│  │ Queso Mozzarella             │  │
│  └──────────────────────────────┘  │
│                                    │
│  Emoji                             │
│  ┌──────────────────────────────┐  │
│  │ 🧀                           │  │
│  └──────────────────────────────┘  │
│                                    │
│  Categoría                         │
│  ┌──────────────────────────────┐  │
│  │ Lácteos               ▼      │  │
│  └──────────────────────────────┘  │
│                                    │
│  Unidad de compra                  │
│  ┌──────────────────────────────┐  │
│  │ kg                    ▼      │  │
│  └──────────────────────────────┘  │
│                                    │
│  Precio por unidad                 │
│  ┌──────────────────────────────┐  │
│  │ $ 250.00                     │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│  [Cancelar]     [Guardar]         │
└────────────────────────────────────┘
```

**Styling:**
- Background: white
- Border radius: 24px
- Shadow: `0px 8px 24px rgba(16, 24, 40, 0.12)`
- Padding: 24px
- Header:
  - Title (H3)
  - Close button (X icon, 20px, top-right)
- Form fields:
  - Label (Small/Medium, #4D6B59)
  - Input (height 48px, all styles from design system)
  - Spacing between fields: 16px
- Footer:
  - Buttons aligned right
  - Gap: 12px
  - Cancel: secondary white button
  - Save: primary gradient button

---

#### B. Modal: Crear/Editar Plato

**Size:** 640×800px (centered overlay)

**Structure:**
```
┌────────────────────────────────────────┐
│  Nuevo Plato en "Pizzas"        [X]   │
├────────────────────────────────────────┤
│                                        │
│  Nombre del plato                      │
│  ┌──────────────────────────────────┐  │
│  │ Pizza Margherita                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Precio de venta                       │
│  ┌──────────────────────────────────┐  │
│  │ $ 180.00                         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌─ Ingredientes (del inventario) ──┐ │
│  │                                   │ │
│  │  🔍 Buscar ingrediente...         │ │
│  │                                   │ │
│  │  ┌───────────────────────────┐   │ │
│  │  │ 🧀 Queso Mozzarella       │   │ │
│  │  │ Qty: 250 gr • $250/kg     │   │ │
│  │  │ Merma: 5%     [✏️] [🗑️]    │   │ │
│  │  └───────────────────────────┘   │ │
│  │                                   │ │
│  │  ➕ Agregar otro ingrediente      │ │
│  └───────────────────────────────────┘ │
│                                        │
│  ⚠️ Solo puedes usar ingredientes     │
│     de tu inventario existente        │
│                                        │
├────────────────────────────────────────┤
│  [Cancelar]           [Guardar Plato] │
└────────────────────────────────────────┘
```

**Ingredientes Section:**
- Background: #F5FAF7
- Border: 1px solid #CFE0D8
- Border radius: 12px
- Padding: 16px
- Combobox:
  - Icon 🔍 left
  - Placeholder: "Buscar ingrediente..."
  - Dropdown list:
    - Each item: Emoji + Name + "Precio/Unit"
    - Hover: background #F5FAF7
    - Selected: background #7BB97A 10%
- Selected ingredient card:
  - Background: white
  - Border: 1px solid #CFE0D8
  - Border radius: 12px
  - Padding: 12px
  - Layout:
    - Top: Emoji + Name
    - Middle: Inline inputs (Qty, Unit, Waste%)
    - Right: Edit icon, Delete icon
- Button "Agregar otro":
  - Text button
  - Icon ➕ left
  - Color #7BB97A

**Warning Banner:**
- Background: #FFFBF5
- Border: 1px solid #F59E0B
- Border radius: 12px
- Padding: 12px
- Icon: ⚠️ left
- Text: 14px Inter Regular, #F59E0B

---

#### C. DishDetailSheet (Mobile 390×844)

**⚠️ CRITICAL: Este componente debe ser IDÉNTICO al del lead magnet**

**Layout:**
```
┌──────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║ 🍕 Pizza Margherita    [Editar] ║ │ ← Header #2F3A33
│ ╚══════════════════════════════════╝ │
│                                      │
│  ┌──────────┐  ┌──────────────────┐ │
│  │💰 Costo  │  │📈 Margen Bruto   │ │
│  │  $45.20  │  │   $134.80        │ │
│  │  33.5%   │  │   66.5% margen   │ │
│  └──────────┘  └──────────────────┘ │
│                                      │
│  ┌─────┐ ┌─────────┐ ┌────────────┐ │
│  │$180 │ │IVA $28.8│ │Neto $151.20│ │
│  └─────┘ └─────────┘ └────────────┘ │
│                                      │
│  ┌─ Desglose de Ingredientes ─────┐ │
│  │ 4 ingredientes • $45.20 total   │ │
│  │                                 │ │
│  │ ┌─────────────────────────┐    │ │
│  │ │ 🧀 Queso Mozzarella     │    │ │
│  │ │ 250 gr × $250/kg        │    │ │
│  │ │ • 5% merma              │    │ │
│  │ │               $65.63    │    │ │
│  │ │ ██████████ 45.1%        │    │ │
│  │ └─────────────────────────┘    │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─ Distribución Rentabilidad ────┐ │
│  │ [PIE CHART]                     │ │
│  │ 🟢 66.5% Beneficio Neto         │ │
│  │ 🟠 33.5% Costo Total            │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─ 👨‍🍳 Preparación del Plato ─────┐ │
│  │ [Textarea]                      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─ ⚠️ Alérgenos ──────────────────┐ │
│  │ [🌾Gluten] [🥛Lácteos] ...      │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌──────────────────────────────────┐│
│  │ Guardar Cambios                  ││
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Especificaciones Detalladas:**

1. **Sheet Container:**
   - Size: 390×757px (90vh of 844px)
   - Background: white
   - Border radius top: 24px
   - Border: none
   - Shadow: `0px -4px 12px rgba(16, 24, 40, 0.08)`

2. **Header:**
   - Height: 64px
   - Background: #2F3A33
   - Padding: 16px 20px
   - Layout: Flex, space-between
   - Title:
     - Text: Dish name
     - Font: 22px Poppins SemiBold
     - Color: white
     - Letter spacing: -2%
   - Button "Editar":
     - Height: 40px
     - Padding: 12px 16px
     - Background: white
     - Text color: #2F3A33
     - Border radius: 12px
     - Icon: ✏️ Edit2 (16px)
     - Hover: background #F5FAF7
   - Close button (X):
     - Position: absolute top-4 right-4
     - Color: **white** (IMPORTANTE)
     - Size: 16px
     - Opacity: 0.7
     - Hover: opacity 1.0

3. **Main Metrics Cards (Grid 2 cols):**
   - Gap: 12px
   - Card left (Costo Total):
     - Background: white
     - Border: 2px solid #F59E0B
     - Border radius: 16px
     - Padding: 20px
     - Label: "💰 Costo Total" (12px Inter SemiBold uppercase, #F59E0B)
     - Value: "$45.20" (32px Poppins Bold, #1A1A1A)
     - Subtitle: "33.5% del precio neto" (14px Inter Medium, #F59E0B)
   - Card right (Margen Bruto):
     - Background: Linear gradient #A6D49F → #7BB97A
     - Border: none
     - Border radius: 16px
     - Padding: 20px
     - Shadow: `0px 4px 12px rgba(123, 185, 122, 0.25)`
     - Label: "📈 Margen Bruto" (12px Inter SemiBold uppercase, white 90%)
     - Value: "$134.80" (32px Poppins Bold, white)
     - Subtitle: "66.5% margen" (14px Inter Medium, white)

4. **Pricing Row (Grid 3 cols):**
   - Gap: 12px
   - Each card:
     - Background: #2F3A33
     - Border radius: 16px
     - Padding: 16px
     - Label: 10px Inter Medium uppercase, white 60%
     - Value: 20px Poppins SemiBold, white
   - Card 3 (Precio Neto):
     - Background: Linear gradient #A6D49F → #7BB97A

5. **Desglose de Ingredientes:**
   - Container:
     - Background: white
     - Border: 1px solid #CFE0D8
     - Border radius: 16px
     - Overflow: hidden
   - Header:
     - Background: Linear gradient #A6D49F → #7BB97A
     - Padding: 12px 16px
     - Title: 16px Inter SemiBold, white
     - Subtitle: 12px Inter Regular, white 80%
   - Content:
     - Padding: 16px
     - Gap: 12px between items
   - Ingredient Item:
     - Background: #F5FAF7
     - Border radius: 12px
     - Padding: 12px
     - Layout:
       - Top: Name (14px Inter Medium) + Cost (18px Poppins SemiBold)
       - Middle: Details (12px Inter Regular, #4D6B59)
       - Bottom: Progress bar
     - Progress bar:
       - Background: white
       - Height: 8px
       - Border radius: full
       - Fill: Dynamic color (green/orange/red)
       - Width: Percentage of total cost

6. **Pie Chart:**
   - Container:
     - Background: white
     - Border: 1px solid #CFE0D8
     - Border radius: 16px
     - Padding: 16px
   - Title: 14px Inter SemiBold, #1A1A1A
   - Chart:
     - Size: 320×320px
     - Type: Recharts PieChart
     - Data: 2 slices (Beneficio, Costo)
     - Colors: #7BB97A (green), #F59E0B (orange)
     - Labels: Percentages inside slices
     - Legend: Bottom, center

7. **Preparación (Textarea):**
   - Container:
     - Background: white
     - Border: 1px solid #CFE0D8
     - Border radius: 16px
     - Padding: 20px
   - Header:
     - Icon: 👨‍🍳 ChefHat (18px, #7BB97A)
     - Title: 16px Inter SemiBold, #1A1A1A
   - Textarea:
     - Background: #F5FAF7
     - Border: 1px solid #CFE0D8
     - Border radius: 12px
     - Padding: 12px
     - Min height: 120px
     - Font: 14px Inter Regular, #2F3A33
     - Placeholder: #9FB3A8
     - Focus: border #7BB97A, ring 2px #7BB97A 25%

8. **Alérgenos:**
   - Container: Same as Preparación
   - Icon: ⚠️ AlertCircle (18px, #F59E0B)
   - Badges grid:
     - Flex wrap
     - Gap: 8px
   - Badge:
     - Padding: 8px 12px
     - Border radius: full
     - Border: 2px solid
     - Font: 14px Inter Medium
     - Transition: 200ms
     - Default:
       - Background: white
       - Border: #CFE0D8
       - Text: #4D6B59
       - Hover: border #F59E0B, bg #FFFBF5
     - Selected:
       - Background: #F59E0B
       - Border: #F59E0B
       - Text: white
       - Shadow: `0px 2px 8px rgba(245, 158, 11, 0.25)`

9. **Botón Guardar (Conditional):**
   - Only visible if `hasChanges === true`
   - Width: 100%
   - Height: 48px
   - Background: Linear gradient #A6D49F → #7BB97A
   - Border radius: 16px
   - Text: 16px Inter Medium, white
   - Shadow: `0px 4px 12px rgba(123, 185, 122, 0.25)`
   - Hover: shadow `0px 6px 16px rgba(123, 185, 122, 0.35)`
   - Disabled:
     - Opacity: 0.5
     - Cursor: not-allowed

---

## 🎯 Componentes Reutilizables

Crea estos como **Components** en Figma con **Auto Layout**:

### 1. Button/Primary
- Height: 48px
- Padding: 16px 24px
- Background: Linear gradient #A6D49F → #7BB97A
- Border radius: 16px
- Text: 16px Inter Medium, white
- Shadow: Level 2
- Hover: shadow increase
- Icon: Optional left (16px, white)

### 2. Button/Secondary
- Height: 48px
- Padding: 16px 24px
- Background: white
- Border: 1px solid #CFE0D8
- Border radius: 16px
- Text: 16px Inter Medium, #2F3A33
- Shadow: Level 1
- Hover: background #F5FAF7

### 3. Input/Text
- Height: 48px
- Padding: 12px 16px
- Background: white
- Border: 1px solid #CFE0D8
- Border radius: 16px
- Text: 16px Inter Regular, #2F3A33
- Placeholder: #9FB3A8
- Focus: border #7BB97A, ring

### 4. Badge/Status
- Variants: Saludable, Ajustar, Riesgo
- Padding: 4px 12px
- Border radius: full
- Font: 14px Inter Medium
- Colors:
  - Saludable: bg #4e9643, text white
  - Ajustar: bg #F59E0B, text white
  - Riesgo: bg #DC2626, text white

### 5. Card/Metric
- Auto layout vertical
- Padding: 20px
- Background: white
- Border: 1px solid #CFE0D8
- Border radius: 16px
- Shadow: Level 1
- Content:
  - Icon (20px, #7BB97A)
  - Label (12px Inter SemiBold uppercase, #4D6B59)
  - Value (32px Poppins Bold, #1A1A1A)
  - Subtitle (14px Inter Regular, #9FB3A8)

### 6. Sidebar/Nav-Item
- Height: 48px
- Padding: 12px 16px
- Border radius: 12px
- States:
  - Default: bg transparent, text #4D6B59
  - Hover: bg #F5FAF7
  - Active: bg #7BB97A 10%, text #4e9643
- Icon left (20px)
- Text: 16px Inter Medium

---

## ✅ Deliverables Checklist

### Páginas Completas:
- [ ] Dashboard (Desktop 1440×900)
- [ ] Inventario (Desktop 1440×900)
- [ ] Menú (Desktop 1440×900)
- [ ] Configuración (Desktop 1440×900)

### Modals & Sheets:
- [ ] Modal: Agregar/Editar Ingrediente (520×600)
- [ ] Modal: Crear/Editar Plato (640×800)
- [ ] DishDetailSheet (Mobile 390×757) - EXACTO del lead magnet

### Components Library:
- [ ] Buttons (Primary, Secondary, Destructive)
- [ ] Inputs (Text, Number, Select)
- [ ] Badges (all variants)
- [ ] Cards (all types)
- [ ] Sidebar navigation
- [ ] Table rows
- [ ] Modal structure
- [ ] Form fields

### Assets:
- [ ] Iconography (lucide-react compatible)
- [ ] Emojis para categorías e ingredientes
- [ ] Logo CostoComida
- [ ] Placeholder images

### Extras:
- [ ] Prototype flows (clickable)
- [ ] Hover states
- [ ] Empty states
- [ ] Loading states
- [ ] Error states

---

## 🚀 Workflow Tips

1. **Start with Design System:**
   - Crear color tokens primero
   - Luego typography styles
   - Luego components base

2. **Use Auto Layout:**
   - Todos los componentes deben usar Auto Layout
   - Facilita el responsive design
   - Permite variants más fáciles

3. **Create Variants:**
   - Buttons: Primary/Secondary/Destructive
   - Badges: Saludable/Ajustar/Riesgo
   - Inputs: Default/Focus/Error

4. **Organize Layers:**
   ```
   📄 Dashboard
     🔲 Frame (1440×900)
       📁 Sidebar
         📁 Navigation
         📁 User Info
       📁 Main Content
         📁 Header
         📁 Category Card
         📁 Bar Chart
         📁 Metrics Grid
   ```

5. **Name Consistently:**
   - Frames: `Desktop/Dashboard`
   - Components: `Button/Primary`
   - Instances: Descriptive names

6. **Use Plugins:**
   - Content Reel (para datos de ejemplo)
   - Iconify (para lucide-react icons)
   - Chart (para gráficos mockup)

---

## 📞 Referencias

- Lead Magnet actual: CostoComida funnel MVP
- Guidelines.md: Sistema visual completo
- Recharts Docs: https://recharts.org/
- Lucide Icons: https://lucide.dev/icons/

---

**Ready to design! 🎨**

Usa este prompt como guía completa. Si tienes dudas, consulta el código del lead magnet en `/components/DishDetailSheet.tsx` y `/components/MenuScreen.tsx`.
