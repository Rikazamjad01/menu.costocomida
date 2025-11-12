# 🎨 Developer Tools - Visual Guide

## Where to Find It

```
App Screen
  ↓
Click Settings Icon ⚙️ (top right)
  ↓
Settings Sheet Opens
  ↓
Scroll Down Past:
  - Información personal
  - Preferencias
  - Seguridad
  ↓
⭐ Developer Tools Card ⭐
  ↓
Action Buttons (Save/Logout)
```

---

## Visual Layout

```
┌─────────────────────────────────────────────────┐
│ Settings Sheet                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ [User Info Section]                             │
│ [Preferences Section]                           │
│ [Security Section]                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Developer Tools                             │ │
│ │                                             │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │   Run API Smoke Test                    │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ Last run: OK                                │ │
│ │                                             │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ [{"wastage_percentage": 5}]             │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Save Button]                                   │
│ [Logout Button]                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Card Container
```
┌─────────────────────────────────────────────┐
│ Background: #FFFFFF                         │
│ Border: 1px solid #CFE0D8                   │
│ Border Radius: 16px                         │
│ Shadow: 0 1px 2px rgba(16,24,40,0.06)      │
│ Padding: 20px                               │
└─────────────────────────────────────────────┘
```

### 2. Title
```
Developer Tools
─────────────────
Font: Poppins
Size: 16px
Weight: 600 (semibold)
Color: #1A1A1A
Margin Bottom: 16px
```

### 3. Button
```
┌─────────────────────────────────────────────┐
│        Run API Smoke Test                   │
│ ─────────────────────────────────────────── │
│ Background: Gradient #A6D49F → #7BB97A     │
│ Color: White                                │
│ Height: 48px                                │
│ Border Radius: 16px                         │
│ Font: Inter, 16px, medium (500)            │
│ Shadow: 0 4px 12px rgba(16,24,40,0.08)     │
└─────────────────────────────────────────────┘

Hover: Opacity 90%
Disabled: Opacity 50% + cursor not-allowed
Running State: Shows "Running…"
```

### 4. Status Text
```
Last run: OK
─────────────
Font: Inter
Size: 14px
Weight: 400 (regular)
Color: #4D6B59
Margin: 12px 0
```

Status Options:
- "No test run yet." (idle)
- "Running…" (running)
- "Last run: OK" (success)
- "Last run: ERROR" (error)

### 5. Result Display (Pre Block)
```
┌─────────────────────────────────────────────┐
│ [{"wastage_percentage": 5}]                 │
│ ─────────────────────────────────────────── │
│ Background: #F5FAF7 at 40% opacity         │
│ Font: Monospace (system)                    │
│ Size: 12px                                  │
│ Line Height: 16px                           │
│ Color: #2F3A33                              │
│ Border Radius: 8px                          │
│ Padding: 12px                               │
│ Overflow: Auto (scrollable)                 │
│ Word Wrap: Pre-wrap                         │
└─────────────────────────────────────────────┘
```

---

## Color Palette Used

```css
/* Primary Colors */
--card-bg: #FFFFFF
--gradient-start: #A6D49F
--gradient-end: #7BB97A

/* Text Colors */
--heading: #1A1A1A
--body: #2F3A33
--secondary: #4D6B59

/* Surface Colors */
--result-bg: #F5FAF7 (40% opacity)

/* Borders */
--border: #CFE0D8

/* Shadows */
--shadow-sm: 0 1px 2px rgba(16,24,40,0.06)
--shadow-md: 0 4px 12px rgba(16,24,40,0.08)
```

---

## Typography Stack

```css
/* Headings */
font-family: 'Poppins', sans-serif;
font-weight: 600;
font-size: 16px;

/* Body Text */
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 14px;

/* Buttons */
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 16px;

/* Monospace (Results) */
font-family: monospace;
font-weight: 400;
font-size: 12px;
```

---

## States & Interactions

### Idle State
```
┌─────────────────────────────────────────────┐
│ Developer Tools                             │
│                                             │
│ [ Run API Smoke Test ]                      │
│                                             │
│ No test run yet.                            │
└─────────────────────────────────────────────┘
```

### Running State
```
┌─────────────────────────────────────────────┐
│ Developer Tools                             │
│                                             │
│ [ Running… ] (disabled, 50% opacity)        │
│                                             │
│ Running…                                    │
└─────────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────────┐
│ Developer Tools                             │
│                                             │
│ [ Run API Smoke Test ]                      │
│                                             │
│ Last run: OK                                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [{"wastage_percentage": 5}]             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Toast: ✅ "API OK"
Console: SmokeTest OK [data]
```

### Error State
```
┌─────────────────────────────────────────────┐
│ Developer Tools                             │
│                                             │
│ [ Run API Smoke Test ]                      │
│                                             │
│ Last run: ERROR                             │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ {                                        │ │
│ │   "code": "PGRST204",                   │ │
│ │   "message": "Could not find..."        │ │
│ │ }                                        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Toast: ❌ "API ERROR: PGRST204"
Console: SmokeTest ERROR {error object}
```

---

## Responsive Behavior

### Mobile (390px width)
- Card takes full width minus padding
- Button is full width
- Result block scrolls horizontally if needed
- Word wrap enabled for long lines

### Desktop (1440px width)
- Same layout (no changes needed)
- Developer Tools only appears in Settings Sheet

---

## Spacing & Layout

```
Card Container:
├─ Padding: 20px (all sides)
├─ Margin: Inherits from parent container
└─ Space-y: 12px between children

Content Stack:
├─ Title
│   └─ Margin Bottom: 16px
├─ Button
│   └─ Margin Bottom: 12px
├─ Status Text
│   └─ Margin Bottom: 12px
└─ Result Display
    └─ (only if content exists)
```

---

## Animation & Transitions

### Button
```css
transition: opacity 200ms ease-in-out;
```

Hover:
- Opacity: 90%
- Duration: 200ms

Disabled:
- Opacity: 50%
- Cursor: not-allowed
- No hover effect

### Toast Notifications
- Position: top-center
- Duration: 3s (default)
- Type: success (green) or error (red)
- Rich colors enabled

---

## Accessibility

### Button
- Keyboard accessible (Tab to focus, Enter to activate)
- Disabled state properly conveyed
- Clear label: "Run API Smoke Test"

### Status Text
- Screen reader friendly
- Dynamic content updates announced

### Result Display
- Scrollable with keyboard (Tab + Arrow keys)
- Selectable text for copying
- High contrast text (#2F3A33 on #F5FAF7)

---

## Browser Compatibility

### Tested
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Features Used
- CSS Grid/Flexbox
- localStorage API
- async/await
- JSON.stringify
- Gradient backgrounds
- Custom fonts (Poppins, Inter)

---

## Performance

### Metrics
- Component size: ~2KB
- Hook size: ~3KB
- Zero external dependencies (uses existing supabase client)
- localStorage operations: instant
- API call: ~100-500ms (network dependent)

### Optimizations
- No re-renders unless state changes
- localStorage only updated on test completion
- Debounced button to prevent double-clicks (disabled during run)

---

**Last Updated:** November 6, 2024  
**Design System:** CostoComida Guidelines v2.0  
**Compliance:** 100% adherence to visual guidelines
