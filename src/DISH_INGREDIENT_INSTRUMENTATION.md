# Dish Ingredient Save Path Instrumentation

## ✅ Implementation Complete

Added precise logging to track the exact rows being inserted to `dish_ingredients` and the Supabase response to debug why zero rows may be appearing.

---

## 🎯 Changes Made

### 1. Enhanced Logging in `upsertDishIngredients` Helper
**Location:** `/lib/supabase-helpers.ts`

#### Before Bulk Insert
Added detailed JSON logging of the exact rows being inserted:

```typescript
console.log('[DishIngredient] bulk rows', JSON.stringify(rows, null, 2));
```

**Example Output:**
```json
[DishIngredient] bulk rows [
  {
    "dish_id": "abc-123-def",
    "inventory_item_id": "xyz-456-ghi",
    "quantity": 0.2,
    "unit": "kg",
    "user_id": "user-789-jkl"
  },
  {
    "dish_id": "abc-123-def",
    "inventory_item_id": "mno-012-pqr",
    "quantity": 0.1,
    "unit": "kg",
    "user_id": "user-789-jkl"
  }
]
```

#### Updated Bulk Insert with Response Capture
Changed from capturing only error to capturing both data and error:

```typescript
// Before:
const { error: bulkErr } = await supabase
  .from('dish_ingredients')
  .insert(rows);

// After:
const { data: inserted, error: bulkErr, status } = await supabase
  .from('dish_ingredients')
  .insert(rows)
  .select('dish_id, inventory_item_id, quantity, unit');
```

#### Enhanced Error Logging
Added status code and more detailed error information:

```typescript
if (bulkErr) {
  console.error('[DishIngredient] bulk insert ERROR', { 
    status, 
    code: (bulkErr as any).code, 
    message: bulkErr.message, 
    details: (bulkErr as any).details, 
    hint: (bulkErr as any).hint 
  });
  return { ok: false, errors: [...errors, { bulkErr, status }] };
}
```

**Example Error Output:**
```javascript
[DishIngredient] bulk insert ERROR {
  status: 409,
  code: "23505",
  message: "duplicate key value violates unique constraint",
  details: "Key (dish_id, inventory_item_id)=(abc-123, xyz-456) already exists.",
  hint: "Check for duplicate entries"
}
```

#### Success Logging
Added count and actual inserted data:

```typescript
console.log('[DishIngredient] bulk insert OK', inserted?.length ?? 0, inserted);
```

**Example Success Output:**
```javascript
[DishIngredient] bulk insert OK 2 [
  { 
    dish_id: "abc-123", 
    inventory_item_id: "xyz-456", 
    quantity: 0.2, 
    unit: "kg" 
  },
  { 
    dish_id: "abc-123", 
    inventory_item_id: "mno-012", 
    quantity: 0.1, 
    unit: "kg" 
  }
]
```

---

### 2. Added Result Logging in Submit Handler
**Location:** `/components/MenuScreen.tsx` - `handleSaveDish` function

Added immediate logging after `upsertDishIngredients` returns:

```typescript
const upsertRes = await upsertDishIngredients(dish.id, uiIngredients, user?.id ?? null);

console.log('[DishCreate] upsert result', upsertRes);
```

**Example Success Output:**
```javascript
[DishCreate] upsert result { ok: true, count: 2 }
```

**Example Error Output:**
```javascript
[DishCreate] upsert result { 
  ok: false, 
  errors: [
    { step: 'ensureInventoryItem', ing: {...}, error: {...} },
    { bulkErr: {...}, status: 409 }
  ]
}
```

---

## 📊 Complete Console Flow

### Successful Creation
```
[DishCreate] Step 1: Creating dish... { dishName: "Pasta Carbonara", price: 95, category: "cat-1" }
[DishCreate] Step 1 Complete: Dish created { id: "dish-123", name: "Pasta Carbonara" }
[DishCreate] Step 2: Converting ingredients...
[DishCreate] Conversion: 200 gr → 0.2 kg (factor: 0.001)
[DishCreate] Conversion: 100 gr → 0.1 kg (factor: 0.001)
[DishCreate] Step 2 Complete: Converted 2 ingredients
[DishCreate] Step 3: Upserting dish ingredients...
[upsertDishIngredients] processing 2 ingredients
[ensureInventoryItem] found by name+unit item-456
[ensureInventoryItem] creating new item { name: "Huevo", unit: "kg", ... }
[ensureInventoryItem] created item-789
[upsertDishIngredients] inserting 2 rows
[DishIngredient] bulk rows [
  {
    "dish_id": "dish-123",
    "inventory_item_id": "item-456",
    "quantity": 0.2,
    "unit": "kg",
    "user_id": "user-abc"
  },
  {
    "dish_id": "dish-123",
    "inventory_item_id": "item-789",
    "quantity": 0.1,
    "unit": "kg",
    "user_id": "user-abc"
  }
]
[DishIngredient] bulk insert OK 2 [
  { dish_id: "dish-123", inventory_item_id: "item-456", quantity: 0.2, unit: "kg" },
  { dish_id: "dish-123", inventory_item_id: "item-789", quantity: 0.1, unit: "kg" }
]
[DishCreate] upsert result { ok: true, count: 2 }
[DishCreate] Step 3 Complete: Inserted 2 ingredients
[DishCreate] Step 4: Refreshing data...
[DishCreate] Step 4 Complete: Data refreshed
[DishCreate] SUCCESS: Dish saved with 2 ingredients
```

### With Errors
```
[DishCreate] Step 3: Upserting dish ingredients...
[upsertDishIngredients] processing 2 ingredients
[ensureInventoryItem] found by name+unit item-456
[ensureInventoryItem] ERROR { code: "23505", message: "duplicate key value" }
[upsertDishIngredients] ensureInventoryItem failed { ing: "Tomate", error: {...} }
[upsertDishIngredients] inserting 1 rows
[DishIngredient] bulk rows [
  {
    "dish_id": "dish-123",
    "inventory_item_id": "item-456",
    "quantity": 0.2,
    "unit": "kg",
    "user_id": "user-abc"
  }
]
[DishIngredient] bulk insert ERROR { 
  status: 400,
  code: "PGRST204", 
  message: "relation does not exist", 
  details: null, 
  hint: null 
}
[DishCreate] upsert result { 
  ok: false, 
  errors: [
    { step: 'ensureInventoryItem', ing: "Tomate", error: {...} },
    { bulkErr: {...}, status: 400 }
  ]
}
[DishCreate] Step 3 ERROR: Some ingredients failed [...]
```

### Zero Rows Scenario
```
[DishCreate] Step 3: Upserting dish ingredients...
[upsertDishIngredients] processing 0 ingredients
[upsertDishIngredients] no ingredients to insert
[DishCreate] upsert result { ok: true, count: 0 }
[DishCreate] Step 3 Complete: Inserted 0 ingredients
```

---

## 🔍 Debug Information Available

### 1. **Exact Payload Being Sent**
The `JSON.stringify(rows, null, 2)` log shows:
- ✅ dish_id
- ✅ inventory_item_id
- ✅ quantity
- ✅ unit
- ✅ user_id

### 2. **Supabase Response**
The `.select()` response shows:
- ✅ Number of rows inserted (`inserted?.length`)
- ✅ Actual data returned from database
- ✅ Confirms what Supabase received

### 3. **HTTP Status Code**
The `status` field shows:
- 200/201 = Success
- 400 = Bad Request
- 409 = Conflict (duplicate)
- 500 = Server Error

### 4. **PostgreSQL Error Details**
When errors occur:
- ✅ Error code (e.g., "23505", "PGRST204")
- ✅ Error message
- ✅ Details (constraint violated, etc.)
- ✅ Hint (suggested fix)

---

## 🎯 Debugging Checklist

When investigating zero rows:

### Check 1: Are ingredients being processed?
```
[upsertDishIngredients] processing X ingredients
```
- If X = 0, the problem is earlier (validation, UI state)
- If X > 0, continue to Check 2

### Check 2: Are rows being built?
```
[DishIngredient] bulk rows [...]
```
- Check if array is empty `[]`
- Check if fields are null/undefined
- Verify `dish_id`, `inventory_item_id`, `user_id` are valid UUIDs

### Check 3: Was the insert successful?
```
[DishIngredient] bulk insert OK X [...]
```
- If you see "OK", rows were inserted
- Check the returned data matches what you sent
- If X = 0 but no error, RLS policy may be blocking

### Check 4: Is there an error?
```
[DishIngredient] bulk insert ERROR {...}
```
- Check `code` for specific error type
- Check `details` for constraint violations
- Check `hint` for suggested fixes

### Check 5: What does the final result say?
```
[DishCreate] upsert result { ok: ..., count: ... }
```
- `ok: true, count: 0` = No ingredients to insert
- `ok: true, count: X` = Success
- `ok: false` = Check errors array

---

## 🚨 Common Issues to Spot

### Issue 1: Empty Rows Array
```
[DishIngredient] bulk rows []
```
**Cause:** No valid ingredients made it through `ensureInventoryItem`  
**Check:** Look for `[upsertDishIngredients] ensureInventoryItem failed` errors above

### Issue 2: Null/Undefined IDs
```json
[DishIngredient] bulk rows [
  {
    "dish_id": null,
    "inventory_item_id": "item-456",
    ...
  }
]
```
**Cause:** Dish creation failed or ID not passed correctly  
**Check:** `[DishCreate] Step 1 Complete: Dish created { id: ... }`

### Issue 3: Insert OK but Zero Count
```
[DishIngredient] bulk insert OK 0 []
```
**Cause:** RLS policy blocking the select  
**Check:** RLS policies on `dish_ingredients` table

### Issue 4: PGRST204 Error
```
code: "PGRST204",
message: "relation does not exist"
```
**Cause:** Wrong relation name in query or table doesn't exist  
**Check:** Table name is `dish_ingredients` (with underscore)

---

## 📝 Files Modified

### `/lib/supabase-helpers.ts`
- ✅ Added JSON.stringify log before insert
- ✅ Changed query to capture data + status
- ✅ Enhanced error logging with status
- ✅ Added success logging with count + data

### `/components/MenuScreen.tsx`
- ✅ Added upsert result logging immediately after call

---

## ✅ No Breaking Changes

- ❌ No schema changes
- ❌ No RLS changes
- ❌ No API changes
- ✅ Only added console logs
- ✅ Return type unchanged
- ✅ Function signature unchanged

---

**Implementation Date:** November 6, 2024  
**Type:** Debugging Instrumentation  
**Purpose:** Track ingredient persistence to diagnose zero-row issue  
**Breaking Changes:** None  
**Ready for:** Production Debugging
