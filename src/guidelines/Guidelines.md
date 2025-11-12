# 🍽️ CostoComida - Visual Guidelines

## 🎨 Visual System (Airbnb-quality, clean & premium)

### Viewport
- **Mobile:** 390×844 px (portrait, touch-optimized)
- **Desktop:** 1440×900 px (maximize real estate)
- **Approach:** Mobile-first, responsive design

---

## 🎨 Color System

### Primary Colors
```css
--primary-gradient-start: #A6D49F    /* Verde pastel principal */
--primary-gradient-end: #7BB97A      /* Verde acento */
--primary-dark: #4e9643              /* Verde oscuro para CTAs */
```

### Surface Colors
```css
--surface-primary: #FFFFFF           /* Fondo principal, cards */
--surface-accent: #F5FAF7            /* Tinte verde suave para acentos */
```

### Ink Scale (Text & Borders)
```css
--ink-darkest: #1A1A1A               /* Headings principales */
--ink-dark: #2F3A33                  /* Texto regular */
--ink-medium: #4D6B59                /* Texto secundario */
--ink-light: #9FB3A8                 /* Texto deshabilitado/hints */
--ink-border: #CFE0D8                /* Bordes suaves */
```

### Semantic Colors
```css
--success: #4e9643                   /* Verde éxito */
--warning: #F59E0B                   /* Naranja advertencia */
--error: #DC2626                     /* Rojo error */
--info: #3B82F6                      /* Azul información */
```

### Usage Rules
- **NEVER use beige backgrounds** - use clean white (#FFFFFF)
- **Accent tints** (#F5FAF7) for subtle differentiation
- **Pure white for cards** with subtle shadows
- **Ink scale** for all text (no pure black #000000)
- **Borders** use #CFE0D8 for soft, clean look

---

## 📝 Typography

### Font Families
```css
--font-heading: 'Poppins', sans-serif      /* Headings, títulos */
--font-body: 'Inter', sans-serif           /* Body text, UI */
```

### Font Weights
```css
--weight-regular: 400
--weight-medium: 500
--weight-semibold: 600
--weight-bold: 700
```

### Type Scale

**Display XL**
```css
font-size: 56px;
line-height: 64px;
letter-spacing: -1.12px;  /* -2% */
font-weight: 700;
font-family: 'Poppins';
```

**H1 (Main Page Titles)**
```css
font-size: 36px;
line-height: 44px;
letter-spacing: -0.72px;  /* -2% */
font-weight: 700;
font-family: 'Poppins';
```

**H2 (Section Titles)**
```css
font-size: 28px;
line-height: 36px;
letter-spacing: -0.56px;  /* -2% */
font-weight: 600;
font-family: 'Poppins';
```

**H3 (Card Titles)**
```css
font-size: 22px;
line-height: 30px;
letter-spacing: -0.44px;  /* -2% */
font-weight: 600;
font-family: 'Poppins';
```

**Body (Regular Text)**
```css
font-size: 16px;
line-height: 24px;
letter-spacing: 0;
font-weight: 400;
font-family: 'Inter';
```

**Small (Labels, Hints)**
```css
font-size: 14px;
line-height: 20px;
letter-spacing: 0;
font-weight: 400;
font-family: 'Inter';
```

### Implementation Examples

```tsx
// H1 - Main screen title
className="text-[36px] leading-[44px] tracking-[-0.72px] font-bold font-['Poppins']"

// H2 - Section title
className="text-[28px] leading-[36px] tracking-[-0.56px] font-semibold font-['Poppins']"

// H3 - Card title
className="text-[22px] leading-[30px] tracking-[-0.44px] font-semibold font-['Poppins']"

// Body text
className="text-[16px] leading-[24px] font-normal font-['Inter']"

// Small text
className="text-[14px] leading-[20px] font-normal font-['Inter']"

// Button text
className="text-[16px] leading-[24px] font-medium font-['Inter']"
```

---

## 📏 Layout & Spacing

### Section Padding
- **Desktop:** 64px
- **Mobile:** 40px

### Grid System
- **Mobile:** 4 columns
- **Desktop:** 12 columns

### Spacing Scale
```css
--space-xs: 8px
--space-sm: 12px
--space-md: 16px
--space-lg: 20px
--space-xl: 24px
--space-2xl: 32px
--space-3xl: 40px
--space-4xl: 64px
```

### Negative Space
- Maintain generous whitespace between sections
- Use consistent margins (16px, 24px, 40px)
- Group related content with less space (8px-12px)

---

## 🎭 Shadows & Radii

### Border Radius
```css
--radius-card: 16px          /* Cards, buttons */
--radius-modal: 24px         /* Modals, sheets */
--radius-small: 8px          /* Small elements */
```

### Shadows
```css
/* Level 1 - Subtle elevation */
box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);

/* Level 2 - Card elevation */
box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
```

### Usage
```tsx
// Standard card
className="rounded-[16px] shadow-[0_1px_2px_rgba(16,24,40,0.06)]"

// Elevated card
className="rounded-[16px] shadow-[0_4px_12px_rgba(16,24,40,0.08)]"

// Modal
className="rounded-[24px] shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
```

---

## 🔘 Components

### Buttons

**Primary (Gradient)**
```tsx
<button className="
  h-[48px]
  px-6
  rounded-[16px]
  bg-gradient-to-r from-[#A6D49F] to-[#7BB97A]
  text-white
  font-medium
  font-['Inter']
  text-[16px]
  shadow-[0_4px_12px_rgba(16,24,40,0.08)]
  hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]
  transition-all
  duration-200
">
  Button Text
</button>
```

**Secondary (White)**
```tsx
<button className="
  h-[48px]
  px-6
  rounded-[16px]
  bg-white
  text-[#2F3A33]
  font-medium
  font-['Inter']
  text-[16px]
  border
  border-[#CFE0D8]
  shadow-[0_1px_2px_rgba(16,24,40,0.06)]
  hover:bg-[#F5FAF7]
  transition-all
  duration-200
">
  Button Text
</button>
```

### Input Fields
```tsx
<input className="
  h-[48px]
  px-4
  rounded-[16px]
  bg-white
  border
  border-[#CFE0D8]
  text-[#2F3A33]
  font-['Inter']
  text-[16px]
  placeholder:text-[#9FB3A8]
  focus:outline-none
  focus:ring-2
  focus:ring-[#7BB97A]
  focus:ring-opacity-25
  focus:border-[#7BB97A]
  transition-all
" />
```

### Cards
```tsx
<div className="
  bg-white
  rounded-[16px]
  p-[20px]
  shadow-[0_1px_2px_rgba(16,24,40,0.06)]
  border
  border-[#CFE0D8]
">
  {/* Content */}
</div>
```

### Badges
```tsx
// Success
<span className="
  inline-flex
  items-center
  px-3
  py-1
  rounded-full
  bg-[#4e9643]
  text-white
  font-medium
  font-['Inter']
  text-[14px]
">
  Saludable
</span>
```

---

## 🎨 Component-Specific Styling

### Dialog/Modal
```tsx
<DialogContent className="
  max-w-[420px]
  rounded-[24px]
  bg-white
  p-6
  shadow-[0_4px_12px_rgba(16,24,40,0.08)]
  border
  border-[#CFE0D8]
">
  <DialogHeader>
    <DialogTitle className="
      text-[22px]
      leading-[30px]
      tracking-[-0.44px]
      font-semibold
      font-['Poppins']
      text-[#1A1A1A]
    ">
      Modal Title
    </DialogTitle>
  </DialogHeader>
</DialogContent>
```

### Sheet (Bottom Drawer)
```tsx
<SheetContent 
  side="bottom"
  className="
    h-[85vh]
    rounded-t-[24px]
    bg-white
    border-t
    border-[#CFE0D8]
    shadow-[0_-4px_12px_rgba(16,24,40,0.08)]
  "
>
  {/* Content */}
</SheetContent>
```

---

## 🚨 States

### Hover
```css
/* Buttons */
hover:bg-[#F5FAF7]

/* Cards */
hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)]
```

### Focus
```css
focus:outline-none
focus:ring-2
focus:ring-[#7BB97A]
focus:ring-opacity-25
focus:border-[#7BB97A]
```

### Disabled
```css
/* Background */
bg-[#F5FAF7]

/* Text */
text-[#9FB3A8]

/* Cursor */
cursor-not-allowed
```

---

## ✅ Do's

- Use clean white (#FFFFFF) for main backgrounds
- Apply subtle shadows for depth (Level 1 & 2)
- Use Poppins for headings, Inter for body
- Apply -1% to -2% letter spacing on headings
- Maintain generous line-height for readability
- Use gradient buttons for primary CTAs
- Keep 16px radius for cards, 24px for modals
- Use #F5FAF7 for subtle accent backgrounds

## ❌ Don'ts

- Don't use beige backgrounds (#FFFDF5)
- Don't use pure black (#000000) for text
- Don't use Roboto Serif or Public Sans
- Don't use harsh shadows or reflections
- Don't skip letter-spacing on headings
- Don't use opacity for disabled states
- Don't forget hover/focus states
- Don't use inconsistent border radius

---

**Version:** 2.0 (Airbnb-quality update)  
**Last Updated:** November 2024  
**Application:** CostoComida Lead Magnet MVP
