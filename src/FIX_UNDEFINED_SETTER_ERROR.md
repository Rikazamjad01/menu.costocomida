# Fix: Undefined Setter Error

## ✅ Error Fixed

**Error:**
```
ReferenceError: setSelectedDishForDetail is not defined
    at onClick (components/MenuScreen.tsx:1160:38)
```

**Root Cause:**
The "Ver detalles" button inside the dish card was still using the old `setSelectedDishForDetail` and `setShowDishDetail` setters that were removed during the state normalization.

---

## 🔧 Fix Applied

### Location: `/components/MenuScreen.tsx:1160`

**Before (Broken):**
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedDishForDetail(dish);  // ❌ Undefined
    setShowDishDetail(true);          // ❌ Undefined
  }}
  className="text-[14px] text-[#7BB97A] hover:text-[#4e9643] transition-colors font-['Inter'] font-medium"
>
  Ver detalles
</button>
```

**After (Fixed):**
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    openDishDetail({ id: dish.id, name: dish.name });  // ✅ Uses new function
  }}
  className="text-[14px] text-[#7BB97A] hover:text-[#4e9643] transition-colors font-['Inter'] font-medium"
>
  Ver detalles
</button>
```

---

## 📊 Complete State Management

### State Variables (Lines 148-150)
```tsx
const [dishDetailOpen, setDishDetailOpen] = useState(false);
const [selectedDishId, setSelectedDishId] = useState<string | undefined>(undefined);
const [selectedDishName, setSelectedDishName] = useState<string | undefined>(undefined);
```

### Opener Function (Lines 153-158)
```tsx
function openDishDetail(d: { id: string; name?: string }) {
  console.log('[DishDetail] Opening dish detail', { id: d.id, name: d.name });
  setSelectedDishId(d.id);
  setSelectedDishName(d.name ?? 'Plato');
  setDishDetailOpen(true);
}
```

### Usage Locations
All these now use `openDishDetail()`:

1. **Dish card click** (line ~1132)
   ```tsx
   onClick={() => openDishDetail({ id: dish.id, name: dish.name })}
   ```

2. **"Ver detalles" button** (line ~1160) ✅ **FIXED**
   ```tsx
   onClick={(e) => {
     e.stopPropagation();
     openDishDetail({ id: dish.id, name: dish.name });
   }}
   ```

---

## ✅ Verification

### All References Updated
- ✅ No more `setSelectedDishForDetail`
- ✅ No more `setShowDishDetail`
- ✅ All uses go through `openDishDetail()`
- ✅ Consistent state management

### Console Output
When clicking either the card or "Ver detalles" button:
```
[DishDetail] Opening dish detail { id: "abc-123", name: "Pasta Carbonara" }
[DishDetails] two-step OK { dishId: "abc-123", items: 3, ingredientCost: 45.50, costPct: 47.89 }
```

---

## 🎯 Why This Happened

During the state normalization:
1. We renamed `showDishDetail` → `dishDetailOpen`
2. We removed `selectedDishForDetail` (replaced with `selectedDishId` + `selectedDishName`)
3. We created the `openDishDetail()` function
4. We updated the main dish card click handler
5. **But we missed the "Ver detalles" button** ❌

The "Ver detalles" button was a secondary click target inside the card that we overlooked during the refactor.

---

## 🚀 Status

**Error:** ✅ Fixed  
**File:** `/components/MenuScreen.tsx`  
**Lines Changed:** 1160  
**Breaking Changes:** None  
**Schema Changes:** None  

All dish detail opening flows now use the normalized state management system.

---

**Fix Date:** November 6, 2024  
**Type:** Bug Fix (Runtime Error)  
**Status:** ✅ Resolved
