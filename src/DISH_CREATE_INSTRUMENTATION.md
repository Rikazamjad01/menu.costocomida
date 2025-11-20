# Dish Creation Instrumentation

## ✅ Implementation Complete

The "Agregar plato" submission flow has been instrumented with detailed PostgREST error logging and visual status tracking.

---

## 🎯 What Was Changed

### 1. Enhanced Logging in `lib/supabase-helpers.ts`

#### `createDish()`
- **Before:** Silent failures, generic error messages
- **After:** Detailed console logging with:
  - `[DishCreate] payload` - Shows exact data being sent
  - `[DishCreate] ERROR` - Shows code, message, details, hint, status
  - `[DishCreate] OK` - Confirms successful creation

#### `addMultipleDishIngredients()`
- **Before:** Silent failures
- **After:** Detailed console logging with:
  - `[DishIngredientInsert] payload` - Shows all ingredients being inserted
  - `[DishIngredientInsert] ERROR` - Shows code, message, details, hint, status
  - `[DishIngredientInsert] OK` - Confirms successful insertion

#### `createInventoryItem()`
- **Before:** Silent failures
- **After:** Detailed console logging with:
  - `[InventoryItemCreate] payload` - Shows exact data
  - `[InventoryItemCreate] ERROR` - Shows code, message, details, hint, status
  - `[InventoryItemCreate] OK` - Confirms creation

#### `findOrCreateInventoryItem()`
- **Before:** Silent search/create
- **After:** Detailed console logging with:
  - `[InventoryItemFind] searching for` - Shows search term
  - `[InventoryItemFind] found existing` - When found
  - `[InventoryItemFind] updating existing` - When needs update
  - `[InventoryItemFind] creating new` - When creating
  - `[InventoryItemFind] ERROR` - Any search errors

---

### 2. Status Tracking in `MenuScreen.tsx`

#### New State Variables
```typescript
const [dishCreateStatus, setDishCreateStatus] = useState<'idle' | 'saving' | 'error'>('idle');
const [lastErrorCode, setLastErrorCode] = useState<string>('');
```

#### Updated `handleSaveDish()`
- Sets status to `'saving'` when starting
- Sets status to `'error'` and captures error code on failure
- Sets status to `'idle'` on success
- Clears error code on success
- Enhanced toast messages with error codes

---

### 3. Visual Status Line

Added under the submit button in the "Agregar plato" dialog:

```tsx
<p className="text-xs text-[#9FB3A8] text-center mt-2 font-['Inter']" data-testid="dish-status-line">
  {dishCreateStatus === 'idle' && 'Listo para crear'}
  {dishCreateStatus === 'saving' && 'Guardando…'}
  {dishCreateStatus === 'error' && lastErrorCode && `Error: ${lastErrorCode}`}
</p>
```

#### Visual States
- **Idle:** "Listo para crear" (gray text)
- **Saving:** "Guardando…" (gray text, button disabled)
- **Error:** "Error: PGRST204" (gray text, shows error code)

#### Button States
- **Normal:** "Guardar plato" (enabled)
- **Saving:** "Guardando…" (disabled, 50% opacity)

---

## 🔍 Console Output Examples

### Successful Dish Creation
```
[DishCreate] payload { name: "Tacos al Pastor", category_id: "...", price: 45, user_id: "..." }
[DishCreate] OK { id: "...", name: "Tacos al Pastor", ... }

[InventoryItemFind] searching for Carne de Cerdo
[InventoryItemFind] found existing abc123

[InventoryItemFind] searching for Piña
[InventoryItemFind] creating new
[InventoryItemCreate] payload { name: "Piña", unit: "kg", price_per_unit: 25, ... }
[InventoryItemCreate] OK { id: "xyz789", ... }

[DishIngredientInsert] payload [{ dish_id: "...", inventory_item_id: "abc123", ... }, ...]
[DishIngredientInsert] OK [{ id: "...", ... }]

🎉 SUCCESS: Dish saved with 5 ingredients
```

### Failed Dish Creation (Schema Error)
```
[DishCreate] payload { name: "Enchiladas", category_id: "...", price: 60, user_id: "..." }
[DishCreate] ERROR {
  code: "PGRST204",
  message: "Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache",
  details: null,
  hint: null,
  status: 400
}

❌ ERROR saving dish: Error {...}
❌ Error stack: ...
❌ Error details: { message: "...", name: "Error", code: "PGRST204", ... }
```

### Failed Ingredient Insert (Missing Column)
```
[DishCreate] OK { id: "...", ... }

[InventoryItemFind] searching for Queso
[InventoryItemCreate] payload { name: "Queso", unit: "kg", ... }
[InventoryItemCreate] ERROR {
  code: "PGRST204",
  message: "Could not find the 'wastage_percentage' column...",
  details: null,
  hint: null,
  status: 400
}

❌ ERROR saving dish: Error {...}
```

---

## 🎨 Visual Changes

### Before
```
┌─────────────────────────────────────────┐
│ [Cancelar]  [Guardar plato]             │
└─────────────────────────────────────────┘
```

### After (Idle)
```
┌─────────────────────────────────────────┐
│ [Cancelar]  [Guardar plato]             │
│         Listo para crear                │
└─────────────────────────────────────────┘
```

### After (Saving)
```
┌─────────────────────────────────────────┐
│ [Cancelar]  [Guardando…] (disabled)     │
│           Guardando…                    │
└─────────────────────────────────────────┘
```

### After (Error)
```
┌─────────────────────────────────────────┐
│ [Cancelar]  [Guardar plato]             │
│        Error: PGRST204                  │
└─────────────────────────────────────────┘
```

---

## 📊 Error Codes You'll See

### Common PostgREST Errors

| Code | Meaning | Cause |
|------|---------|-------|
| `PGRST204` | Schema cache error | Column not found in PostgREST cache |
| `23505` | Unique violation | Duplicate key constraint |
| `42P01` | Undefined table | Table doesn't exist |
| `42703` | Undefined column | Column doesn't exist in DB |
| `PGRST116` | Not found | Single row query returned 0 rows (expected) |

---

## 🧪 Testing Instructions

### Test 1: Normal Flow
1. Open "Agregar plato" dialog
2. Fill in dish name, category, price
3. Add ingredients
4. Click "Guardar plato"
5. **Expected:**
   - Status shows "Guardando…"
   - Button disabled
   - Console shows `[DishCreate] payload`
   - Console shows `[DishCreate] OK`
   - Console shows ingredient processing
   - Status returns to "Listo para crear"
   - Dialog closes
   - Success toast appears

### Test 2: PGRST204 Error (Schema Cache)
1. If PostgREST cache is stale
2. Try to create a dish
3. **Expected:**
   - Status shows "Guardando…"
   - Console shows `[DishCreate] ERROR` with code `PGRST204`
   - Status shows "Error: PGRST204"
   - Toast shows error with code
   - Dialog stays open

### Test 3: Validation Error
1. Open dialog
2. Leave required fields empty
3. Click "Guardar plato"
4. **Expected:**
   - Status shows "Guardando…" briefly
   - Toast shows validation error
   - Status returns to "Listo para crear"
   - Dialog stays open

---

## 🔧 How to Use This for Debugging

### 1. Reproduce the Error
- Try to create a dish
- Watch the console output
- Note which step fails

### 2. Identify the Error Code
- Check the console for `[..Create] ERROR`
- Note the `code`, `message`, `details`, and `hint`
- Check the visual status line for quick feedback

### 3. Share with Senior Dev
- Copy the entire console output
- Include the error code from status line
- Mention which operation failed (Dish, Ingredient, InventoryItem)

### 4. Common Fixes

**PGRST204 (Schema Cache)**
```sql
-- On Supabase dashboard, run:
NOTIFY pgrst, 'reload schema';
-- OR restart PostgREST service
```

**42703 (Column Missing)**
```sql
-- Add the missing column
ALTER TABLE inventory_items 
ADD COLUMN wastage_percentage NUMERIC DEFAULT 0;

-- Then notify PostgREST
NOTIFY pgrst, 'reload schema';
```

---

## 🗑️ Easy to Remove

All instrumentation can be removed without breaking the app:

### Console Logs
- Just remove the `console.log()` and `console.error()` lines
- Keep the core logic intact

### Status Line
- Remove the `<p>` element with `data-testid="dish-status-line"`
- Remove state variables: `dishCreateStatus`, `lastErrorCode`
- Remove `setDishCreateStatus()` and `setLastErrorCode()` calls

### Total Impact
- 4 functions modified in `lib/supabase-helpers.ts`
- 1 handler modified in `MenuScreen.tsx`
- 2 state variables added
- 1 UI element added (7 lines)

---

## 📈 Benefits

### For Development
1. **Instant feedback** - See exactly what's failing
2. **Error codes** - Know which fix to apply
3. **Full context** - Payload, response, status all logged
4. **Visual status** - No need to open console

### For Debugging
1. **Reproducible** - Can share exact error output
2. **Traceable** - See which step in the flow fails
3. **Actionable** - Error codes point to solutions
4. **Complete** - No silent failures

### For Production
1. **Easy to remove** - No architectural changes
2. **Non-breaking** - All changes are additive
3. **User-friendly** - Status line shows progress
4. **Professional** - Proper error handling

---

## 🎯 Next Steps

1. **Test the instrumentation:**
   - Create a dish successfully
   - Force an error (invalid data)
   - Check console output

2. **Use for debugging:**
   - Capture the error output
   - Share with senior dev
   - Apply suggested fixes

3. **Monitor for patterns:**
   - Which errors are most common?
   - Which step fails most often?
   - Are there data quality issues?

4. **Consider keeping:**
   - The status line is helpful for users
   - The error logging helps with support
   - The structured errors are valuable

---

**Implementation Date:** November 6, 2024  
**Status:** ✅ Complete and Ready to Test  
**Type:** Development Instrumentation (Easy to Remove)  
**No Schema Changes:** ✅ Front-end only  
**No RLS Changes:** ✅ Pure logging
