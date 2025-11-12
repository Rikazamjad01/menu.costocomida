# 🔍 Debug Analysis - Current Error State

**Date:** November 6, 2024  
**Status:** 🔴 Application Non-Functional  
**Root Cause:** PostgREST Schema Cache + Column Mismatches  

---

## 🚨 Active Errors

### Error #1: PGRST204 - Schema Cache Not Updated

**Full Error Message:**
```json
{
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache"
}
```

**When it Occurs:**
- Creating a dish with ingredients
- Fetching inventory items
- Any query that selects `wastage_percentage` column

**Stack Trace Location:**
```
lib/supabase-helpers.ts:313
  → createInventoryItem()
  → supabase.from('inventory_items').insert([{...}])
```

**Why It's Happening:**

1. **Column WAS Added to Database:**
   ```sql
   -- This was executed successfully
   ALTER TABLE inventory_items 
   ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;
   ```

2. **But PostgREST Didn't Reload Schema:**
   - PostgREST caches database schema at startup
   - After `ALTER TABLE` DDL, cache becomes stale
   - Queries fail because PostgREST thinks column doesn't exist

3. **Frontend Code Expects Column:**
   ```typescript
   // Code tries to insert wastage_percentage
   const { data, error } = await supabase
     .from('inventory_items')
     .insert([{
       name: itemData.name,
       unit: itemData.unit,
       price_per_unit: itemData.price,
       wastage_percentage: itemData.wastage_percentage || 0,  // ❌ PGRST204
       user_id: userId
     }]);
   ```

**Fix Attempts:**

✅ **Attempt 1:** Add column
```sql
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;
```
**Result:** Column exists in DB ✅, but PostgREST doesn't know ❌

⚠️ **Attempt 2:** Reload schema via NOTIFY
```sql
NOTIFY pgrst, 'reload schema';
```
**Result:** Command executed, but unclear if PostgREST received it ❓

❌ **Attempt 3:** Frontend code updated
- All queries now include `wastage_percentage`
**Result:** Code is correct, but still getting PGRST204 ❌

**What We Know:**

1. ✅ Column EXISTS in database (verified via `information_schema`)
2. ✅ Frontend code is CORRECT (selects/inserts column properly)
3. ❌ PostgREST cache is STALE (doesn't know column exists)
4. ❓ Schema reload command may not be working

**Next Debug Steps:**

1. **Verify PostgREST can see column:**
   ```bash
   # Direct API call to bypass cache
   curl -X GET 'https://YOUR_PROJECT.supabase.co/rest/v1/inventory_items?select=wastage_percentage&limit=1' \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
   
   **Expected if cache is stale:**
   ```json
   {
     "code": "42703",
     "message": "column inventory_items.wastage_percentage does not exist"
   }
   ```

2. **Check PostgREST version:**
   - Older versions may not support runtime schema reload
   - May need full server restart

3. **Restart PostgREST from Supabase Dashboard:**
   - Settings → API → Restart Server
   - This forces schema cache rebuild

4. **Verify column definition:**
   ```sql
   SELECT 
     column_name,
     data_type,
     column_default,
     is_nullable
   FROM information_schema.columns
   WHERE table_name = 'inventory_items'
     AND column_name = 'wastage_percentage';
   ```
   
   **Expected:**
   ```
   column_name         | data_type | column_default | is_nullable
   ────────────────────────────────────────────────────────────────
   wastage_percentage  | numeric   | 0              | YES
   ```

---

### Error #2: 42703 - Column Does Not Exist (price)

**Full Error Message:**
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column inventory_items_2.price does not exist"
}
```

**When it Occurs:**
- Calculating dish profitability
- Fetching dishes with nested ingredients

**Stack Trace Location:**
```
hooks/useSupabase.ts:241-267
  → useDishProfitabilityAnalysis()
  → supabase.from('dishes').select(`
       dish_ingredients (
         inventory_item:inventory_item_id (
           price  ❌ This column doesn't exist anymore
         )
       )
     `)
```

**Why It's Happening:**

1. **Column Was Renamed:**
   ```sql
   -- Executed successfully
   ALTER TABLE inventory_items 
   RENAME COLUMN price TO price_per_unit;
   ```

2. **But Code Still References Old Name:**
   ```typescript
   // OLD CODE (before fix)
   const { data: dishes } = await supabase
     .from('dishes')
     .select(`
       dish_ingredients (
         inventory_item:inventory_item_id (
           price  // ❌ Column no longer exists
         )
       )
     `);
   
   const price = parseFloat(ing.inventory_item.price) || 0;  // ❌
   ```

**Fix Applied:**

✅ **Updated all code references:**
```typescript
// NEW CODE (after fix)
const { data: dishes } = await supabase
  .from('dishes')
  .select(`
    dish_ingredients (
      inventory_item:inventory_item_id (
        price_per_unit  // ✅ Correct column name
      )
    )
  `);

const pricePerUnit = parseFloat(ing.inventory_item.price_per_unit) || 0;  // ✅
```

**Files Updated:**
- ✅ `hooks/useSupabase.ts` (line 251, 266)
- ✅ `lib/supabase-helpers.ts` (all references)
- ✅ `components/MenuScreen.tsx` (data transformation)
- ✅ `components/DishDetailSheet.tsx` (display logic)

**Current Status:**
- ✅ Code fix is COMPLETE
- ⚠️ May still error if schema cache is stale (see Error #1)

---

### Error #3: 42703 - Column Does Not Exist (waste_percentage)

**Full Error Message:**
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column dish_ingredients.waste_percentage does not exist"
}
```

**When it Occurs:**
- Fetching dishes with ingredients
- Calculating ingredient costs with waste

**Stack Trace Location:**
```
hooks/useSupabase.ts:56-72
  → useDishesWithIngredients()
  → supabase.from('dishes').select(`
       dish_ingredients (
         waste_percentage  ❌ Column missing
       )
     `)
```

**Why It's Happening:**

1. **Column Was Never Created Initially:**
   - Original schema didn't include waste tracking
   - Feature was added later

2. **Column Added via DDL:**
   ```sql
   ALTER TABLE dish_ingredients 
   ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;
   ```

3. **But PostgREST Cache Stale (Same as Error #1):**
   - Column exists in DB ✅
   - PostgREST doesn't know about it ❌

**Fix Status:**
- ✅ SQL executed to add column
- ✅ Code updated to use column
- ❌ PostgREST cache needs reload (blocking)

---

### Error #4: 406 Not Acceptable

**Full Error Message:**
```
GET https://PROJECT.supabase.co/rest/v1/inventory_items?select=*&user_id=eq.UUID
Response: 406 (Not Acceptable)
```

**When it Occurs:**
- Fetching inventory items
- Finding existing ingredients by name
- Any query to `inventory_items` table

**Why It's Happening:**

**Theory #1: RLS Policy Conflict**
- Multiple policies with same operation
- Conflicting USING/WITH CHECK clauses

**Theory #2: Invalid Auth Context**
- `auth.uid()` returns NULL in PostgREST context
- Policy condition fails: `auth.uid() = user_id`

**Theory #3: Malformed Query**
- Using deprecated query parameters
- PostgREST version mismatch

**Debug Steps Taken:**

1. ✅ **Dropped and recreated policies:**
   ```sql
   DROP POLICY IF EXISTS "Users can view own inventory items" ON inventory_items;
   
   CREATE POLICY "Users can view own inventory items"
     ON inventory_items FOR SELECT
     USING (auth.uid() = user_id);
   ```

2. ✅ **Verified auth.uid() in SQL Editor:**
   ```sql
   SELECT auth.uid();
   -- Returns: 7d5f0c13-dd39-432c-91b3-ee33bc0cbbdd ✅
   ```

3. ⚠️ **Tested query with explicit user_id:**
   ```sql
   SELECT * FROM inventory_items 
   WHERE user_id = '7d5f0c13-dd39-432c-91b3-ee33bc0cbbdd';
   -- Works in SQL Editor ✅
   -- Fails via API (406) ❌
   ```

**Possible Root Causes:**

1. **Auth token not being sent correctly:**
   ```typescript
   // Check if Authorization header is set
   const { data, error } = await supabase
     .from('inventory_items')
     .select('*');
   
   // Internally uses: Authorization: Bearer <access_token>
   ```

2. **Policy using wrong auth function:**
   ```sql
   -- Maybe should use request.jwt.claim instead?
   CREATE POLICY "test"
     ON inventory_items FOR SELECT
     USING (user_id = current_setting('request.jwt.claim.sub', true)::uuid);
   ```

3. **RLS on related tables blocking joins:**
   - Query tries to join `dishes` → `dish_ingredients` → `inventory_items`
   - One table's RLS blocks the entire query

**Workaround for Testing:**
```sql
-- ⚠️ TEMPORARILY disable RLS to test
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;

-- Test if queries work
-- ...

-- IMPORTANT: Re-enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
```

---

### Error #5: Invalid Login Credentials

**Full Error Message:**
```
AuthApiError: Invalid login credentials
```

**When it Occurs:**
- User tries to log in with email/password

**Why It's Happening:**

**Reason #1:** User doesn't exist
- Email was never registered
- Account was deleted

**Reason #2:** Wrong password
- Password doesn't match
- Case-sensitive mismatch

**Reason #3:** Email not confirmed
- Account requires email confirmation
- Confirmation link not clicked

**Fix Applied:**

✅ **Auto-confirm on signup:**
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test@ejemplo.com',
  password: 'Test123456!',
  email_confirm: true  // ✅ Skip email verification
});
```

✅ **Created test account:**
- Email: `test@ejemplo.com`
- Password: `Test123456!`

**Current Status:** ✅ RESOLVED (for new accounts)

**Note:** Old accounts may still fail if email not confirmed

---

## 🔬 Diagnostic Queries

### Query 1: Verify All Columns Exist

```sql
-- Check inventory_items
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name IN ('id', 'user_id', 'name', 'unit', 'price_per_unit', 'wastage_percentage')
ORDER BY ordinal_position;
```

**Expected Result:**
```
column_name         | data_type                | column_default
─────────────────────────────────────────────────────────────────
id                  | uuid                     | gen_random_uuid()
user_id             | uuid                     | NULL
name                | text                     | NULL
unit                | text                     | NULL
price_per_unit      | numeric                  | NULL
wastage_percentage  | numeric                  | 0
```

**If Missing:** Column doesn't exist, run:
```sql
ALTER TABLE inventory_items 
ADD COLUMN [missing_column] [data_type] DEFAULT [default_value];
```

---

### Query 2: Check RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'inventory_items'
ORDER BY cmd, policyname;
```

**Expected Result:**
```
tablename        | policyname                              | cmd    | permissive
──────────────────────────────────────────────────────────────────────────────
inventory_items  | Users can view own inventory items     | SELECT | PERMISSIVE
inventory_items  | Users can create own inventory items   | INSERT | PERMISSIVE
inventory_items  | Users can update own inventory items   | UPDATE | PERMISSIVE
inventory_items  | Users can delete own inventory items   | DELETE | PERMISSIVE
```

**If More Than 4 Policies:** Duplicates exist, drop extras:
```sql
DROP POLICY "duplicate_policy_name" ON inventory_items;
```

---

### Query 3: Test Auth Context

```sql
-- Check current user
SELECT 
  auth.uid() as current_user_id,
  current_setting('request.jwt.claim.sub', true) as jwt_sub;
```

**Expected Result:**
```
current_user_id                       | jwt_sub
──────────────────────────────────────────────────────────
7d5f0c13-dd39-432c-91b3-ee33bc0cbbdd | 7d5f0c13-dd39-432c-91b3-ee33bc0cbbdd
```

**If NULL:** Not authenticated in SQL session (normal)
- Auth only works in API requests, not SQL Editor

---

### Query 4: Test Data Access

```sql
-- Get current user ID (replace with actual UUID)
-- You can get this from browser console: supabase.auth.getUser()

-- Test SELECT with explicit user_id
SELECT * FROM inventory_items 
WHERE user_id = 'YOUR_USER_ID_HERE'
LIMIT 5;

-- Test INSERT
INSERT INTO inventory_items (name, unit, price_per_unit, wastage_percentage, user_id)
VALUES ('Test Item', 'kg', 10.00, 5, 'YOUR_USER_ID_HERE')
RETURNING *;

-- Clean up test
DELETE FROM inventory_items WHERE name = 'Test Item';
```

**If SELECT Works:** Database is fine
**If INSERT Fails:** RLS policy blocking or column missing

---

### Query 5: Check PostgREST Schema Cache

```bash
# Call PostgREST API directly
curl -X GET \
  'https://YOUR_PROJECT.supabase.co/rest/v1/inventory_items?select=id,name,price_per_unit,wastage_percentage&limit=1' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

**Success (200):**
```json
[
  {
    "id": "uuid",
    "name": "Lechuga",
    "price_per_unit": 40.00,
    "wastage_percentage": 5
  }
]
```

**Failure (42703):**
```json
{
  "code": "42703",
  "message": "column inventory_items.wastage_percentage does not exist",
  "hint": null
}
```
→ Schema cache is stale, restart PostgREST

---

## 🛠️ Step-by-Step Fix Procedure

### Step 1: Verify Database State

```sql
-- 1. Check if columns exist
\d inventory_items

-- Expected columns:
-- - id (uuid)
-- - user_id (uuid)
-- - name (text)
-- - unit (text)
-- - price_per_unit (numeric)  ← Must exist
-- - wastage_percentage (numeric)  ← Must exist
-- - category (text)
-- - emoji (text)
-- - created_at (timestamp)
-- - updated_at (timestamp)

-- 2. If missing, add them:
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC;

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;

ALTER TABLE dish_ingredients 
ADD COLUMN IF NOT EXISTS waste_percentage NUMERIC DEFAULT 0;

-- 3. If 'price' column exists, migrate data:
UPDATE inventory_items SET price_per_unit = price WHERE price_per_unit IS NULL;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS price;
```

---

### Step 2: Reload PostgREST Schema

**Option A: SQL Notification (Fast)**
```sql
NOTIFY pgrst, 'reload schema';
```

**Option B: Supabase Dashboard (Reliable)**
1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Click "Restart Server"
4. Wait ~10-30 seconds for restart

**Option C: SQL Function (Alternative)**
```sql
-- Create reload function if needed
CREATE OR REPLACE FUNCTION reload_postgrest_schema()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Call it
SELECT reload_postgrest_schema();
```

---

### Step 3: Verify Schema Reload

```bash
# Test API endpoint
curl -X GET \
  'https://PROJECT_ID.supabase.co/rest/v1/inventory_items?select=wastage_percentage&limit=1' \
  -H 'apikey: ANON_KEY'

# Expected: 200 OK (even if empty array)
# If 42703: Schema not reloaded, try Option B above
```

---

### Step 4: Clean Up RLS Policies

```sql
-- Drop ALL existing policies
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'inventory_items'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON inventory_items';
  END LOOP;
END $$;

-- Recreate ONLY these 4 policies
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- Verify only 4 policies exist
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'inventory_items';
```

---

### Step 5: Test Full Flow

**Test 1: Create Account**
```typescript
// In browser console
const { data, error } = await supabase.auth.signUp({
  email: 'newtest@ejemplo.com',
  password: 'Test123456!'
});
console.log('Signup result:', data, error);
```

**Test 2: Fetch Inventory**
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .limit(5);
console.log('Inventory:', data, error);
```

**Test 3: Create Inventory Item**
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .insert([{
    name: 'Test Ingredient',
    unit: 'kg',
    price_per_unit: 50.00,
    wastage_percentage: 5
  }])
  .select()
  .single();
console.log('Created:', data, error);
```

**Test 4: Create Dish**
```typescript
// Use the app UI
1. Click "Agregar plato"
2. Fill: "Test Dish", $100, category
3. Add ingredient: "Lechuga", 200gr, $40/kg, 5% waste
4. Click "Agregar plato"
5. Check console for errors
```

---

## 📊 Success Checklist

Before considering the issue resolved, verify:

- [ ] **Column Verification:**
  - [ ] `inventory_items.price_per_unit` exists
  - [ ] `inventory_items.wastage_percentage` exists
  - [ ] `dish_ingredients.waste_percentage` exists
  - [ ] No `inventory_items.price` column (should be renamed)

- [ ] **PostgREST Schema Cache:**
  - [ ] `NOTIFY pgrst, 'reload schema'` executed
  - [ ] OR PostgREST restarted from dashboard
  - [ ] API curl test returns 200 (not 42703)

- [ ] **RLS Policies:**
  - [ ] Only 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
  - [ ] No duplicate policies
  - [ ] No 406 errors in console

- [ ] **Application Functionality:**
  - [ ] Can create account
  - [ ] Can log in
  - [ ] Can view inventory items
  - [ ] Can create dish with ingredients
  - [ ] Can view dish details
  - [ ] Profitability calculations work
  - [ ] No PGRST204 errors
  - [ ] No 42703 errors

---

## 🎯 Priority Fix Order

**Critical Path (Fix in This Order):**

1. **Verify columns exist** (1 minute)
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'inventory_items';
   ```

2. **Reload PostgREST** (2 minutes)
   - Supabase Dashboard → Settings → API → Restart

3. **Test API directly** (1 minute)
   ```bash
   curl https://PROJECT.supabase.co/rest/v1/inventory_items?select=wastage_percentage&limit=1
   ```

4. **If still failing, check policies** (5 minutes)
   - Drop duplicates
   - Recreate standard policies

5. **Test in app** (5 minutes)
   - Create account
   - Create dish
   - Verify calculations

**Total Time:** ~15 minutes to full resolution (if PostgREST restart works)

---

**Last Updated:** November 6, 2024  
**Next Review:** After PostgREST restart attempt  
**Escalation:** If restart doesn't work, may need Supabase support to check PostgREST logs
