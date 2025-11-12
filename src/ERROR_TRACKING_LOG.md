# 🐛 Error Tracking Log - Real-Time Status

**Last Updated:** November 6, 2024  
**Status:** 🔴 CRITICAL - Application Blocked  

---

## 🚨 Critical Error: PGRST204

### Error Details

```json
{
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache"
}
```

### Console Output

```
❌ ❌ ERROR saving dish: {
  "code": "PGRST204",
  "details": null,
  "hint": null,
  "message": "Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache"
}
❌ ❌ Error stack: 
❌ ❌ Error details: {
  "message": "Could not find the 'wastage_percentage' column of 'inventory_items' in the schema cache",
  "code": "PGRST204",
  "details": null,
  "hint": null
}
```

### When It Occurs

**Trigger:** Creating a dish with ingredients

**User Action Flow:**
1. Click "Agregar plato"
2. Fill in dish name, category, price
3. Add ingredient with name, price, unit, quantity
4. Click "Agregar plato" button
5. ❌ **ERROR: PGRST204**

**Frontend Location:**
- File: `components/DishFullModal.tsx`
- Function: `handleCreateDish()`
- API Call: `lib/supabase-helpers.ts:createInventoryItem()`

**Backend Location:**
- Supabase PostgREST API
- Table: `inventory_items`
- Column: `wastage_percentage`

### Impact

- **Severity:** 🔴 P0 - CRITICAL
- **Users Affected:** 100% (all users)
- **Core Functionality Blocked:**
  - ❌ Cannot create dishes
  - ❌ Cannot add ingredients
  - ❌ Cannot calculate profitability
  - ❌ App is essentially non-functional

### Root Cause Analysis

#### What Happened (Timeline)

1. **Initial Schema** (Day 1)
   ```sql
   CREATE TABLE inventory_items (
     id UUID,
     name TEXT,
     unit TEXT,
     price NUMERIC,  -- Original column name
     ...
   );
   ```

2. **Feature Addition** (Day 2)
   - Added waste tracking functionality
   - Needed new column: `wastage_percentage`

3. **Schema Change Executed** (Day 3)
   ```sql
   ALTER TABLE inventory_items 
   ADD COLUMN wastage_percentage NUMERIC DEFAULT 0;
   
   ALTER TABLE inventory_items 
   RENAME COLUMN price TO price_per_unit;
   ```
   ✅ **Result:** Columns exist in database

4. **Code Updated** (Day 3)
   - Updated all code references to use `price_per_unit`
   - Updated queries to select `wastage_percentage`
   ✅ **Result:** Code is correct

5. **PostgREST Cache NOT Reloaded** (Day 3)
   - PostgREST still uses old schema cache
   - Cache doesn't include new columns
   ❌ **Result:** API queries fail with PGRST204

#### Why It's Broken

**The Mismatch:**

```
┌─────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                 │
│                                                          │
│  inventory_items table:                                 │
│    ✅ id                                                │
│    ✅ user_id                                           │
│    ✅ name                                              │
│    ✅ unit                                              │
│    ✅ price_per_unit  (renamed from 'price')           │
│    ✅ wastage_percentage  (newly added)                │
│    ✅ category                                          │
│    ✅ emoji                                             │
│    ✅ created_at                                        │
│    ✅ updated_at                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
                           │ Schema should be synced
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 POSTGREST (API Layer)                    │
│                                                          │
│  Cached schema for inventory_items:                     │
│    ✅ id                                                │
│    ✅ user_id                                           │
│    ✅ name                                              │
│    ✅ unit                                              │
│    ❌ price  (old column, doesn't exist anymore)       │
│    ❌ wastage_percentage  (NOT IN CACHE!)              │
│                                                          │
│  ❌ CACHE IS STALE!                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
                           │ API requests
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                        │
│                                                          │
│  Code tries to insert:                                  │
│    {                                                     │
│      name: "Lechuga",                                   │
│      unit: "kg",                                        │
│      price_per_unit: 40.00,                             │
│      wastage_percentage: 5  ← PostgREST says: "❌"     │
│    }                                                     │
│                                                          │
│  ❌ Error: Column not found in cache                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Summary:**
- Database: ✅ Has `wastage_percentage`
- PostgREST: ❌ Doesn't know it exists
- Frontend: ✅ Tries to use it
- **Result:** 🔴 PGRST204 Error

### Attempted Fixes

#### Fix Attempt #1: Add Column via DDL ✅ DONE

```sql
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS wastage_percentage NUMERIC DEFAULT 0;
```

**Result:** ✅ Column exists in database
**Verification:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory_items' AND column_name = 'wastage_percentage';
-- Returns: wastage_percentage ✅
```

**Status:** ✅ SUCCESSFUL (but doesn't fix PGRST204)

---

#### Fix Attempt #2: Reload Schema via NOTIFY ⚠️ UNCERTAIN

```sql
NOTIFY pgrst, 'reload schema';
```

**Result:** ❓ Command executed, unclear if PostgREST received it
**Verification:** No clear way to verify from SQL

**Status:** ⚠️ UNCERTAIN (may not be working)

---

#### Fix Attempt #3: Update Frontend Code ✅ DONE

Updated all files to use correct column names:
- ✅ `lib/supabase-helpers.ts`
- ✅ `hooks/useSupabase.ts`
- ✅ `components/MenuScreen.tsx`
- ✅ `components/DishDetailSheet.tsx`
- ✅ `components/DishFullModal.tsx`

**Result:** ✅ Code is correct
**Status:** ✅ SUCCESSFUL (but doesn't fix PGRST204 because cache is stale)

---

#### Fix Attempt #4: Clean Up RLS Policies ✅ DONE

Removed duplicate policies, ensured only 4 policies per table.

**Result:** ✅ Policies are clean
**Status:** ✅ SUCCESSFUL (unrelated to PGRST204, but good)

---

### Current Status

- **Database Schema:** ✅ CORRECT
- **Frontend Code:** ✅ CORRECT
- **PostgREST Cache:** ❌ STALE
- **Application:** 🔴 BROKEN

**Blocking Issue:** PostgREST schema cache needs to be reloaded

---

## 🔧 Fix Procedure (For Senior Developer)

### Step 1: Verify Column Exists in Database (2 min)

```sql
-- Run in Supabase SQL Editor
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name IN ('price_per_unit', 'wastage_percentage')
ORDER BY column_name;
```

**Expected Result:**
```
column_name         | data_type | column_default
─────────────────────────────────────────────────
price_per_unit      | numeric   | NULL
wastage_percentage  | numeric   | 0
```

**If Missing:** Run `CANONICAL_SCHEMA_AND_VERIFICATION.sql` Part 2

---

### Step 2: Reload PostgREST Schema Cache (5 min)

**Option A: SQL Notification (Fast)**
```sql
NOTIFY pgrst, 'reload schema';
```

**Option B: Dashboard Restart (Recommended - More Reliable)**

1. Go to Supabase Dashboard
2. Navigate to: **Settings** → **API**
3. Click: **"Restart Server"** button
4. Wait 30 seconds for restart to complete
5. Look for green "Running" status

**Why Option B is Better:**
- Guarantees cache reload
- Clears any other cached state
- Takes only ~30 seconds
- 100% reliable

---

### Step 3: Verify Cache Reloaded (2 min)

**Test with curl:**
```bash
curl -X GET \
  'https://YOUR_PROJECT_ID.supabase.co/rest/v1/inventory_items?select=wastage_percentage&limit=1' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

**Success Response (200 OK):**
```json
[]
```
or
```json
[
  {
    "wastage_percentage": 0
  }
]
```

**Failure Response (Still Broken):**
```json
{
  "code": "42703",
  "message": "column inventory_items.wastage_percentage does not exist",
  "hint": null
}
```

**If Still Failing:**
- Wait another 30 seconds (cache may still be building)
- Try Option B restart again
- Check PostgREST logs in Supabase Dashboard (Settings → Logs)

---

### Step 4: Test in Application (5 min)

1. **Open app in browser**
2. **Create test account** (or login)
   - Email: `test@ejemplo.com`
   - Password: `Test123456!`

3. **Create test dish:**
   - Click "Agregar plato"
   - Name: "Ensalada César"
   - Category: "Entradas"
   - Price: $120.00

4. **Add ingredient:**
   - Name: "Lechuga"
   - Quantity: 200
   - Unit: kg
   - Price: $40.00
   - Waste: 5%

5. **Save dish:**
   - Click "Agregar plato"
   - Watch console for errors

**Success Indicators:**
- ✅ No PGRST204 error in console
- ✅ Toast: "¡Plato agregado exitosamente!"
- ✅ Dish appears in list
- ✅ Can click dish to see details
- ✅ Cost calculation is correct

**Failure Indicators:**
- ❌ PGRST204 error in console
- ❌ Toast: "Error al crear el plato"
- ❌ Dish doesn't appear

---

### Step 5: Verify Calculations (3 min)

**If dish created successfully:**

1. Click on the dish in the list
2. Sheet opens with details

**Verify These Calculations:**

**Example: Ensalada César**
- Public Price: $120.00
- Tax (16%): $19.20
- Net Price: $100.80

**Ingredients:**
- Lechuga: 200gr @ $40/kg = 200gr @ $0.04/gr = $8.00
- With 5% waste: 200 * 1.05 = 210gr effective
- Cost: 210gr * $0.04/gr = $8.40

**Totals:**
- Total Cost: $8.40
- Cost %: (8.40 / 100.80) * 100 = 8.33%
- Profit %: 100 - 8.33 = 91.67%

**Manual Verification:**
Open browser console and run:
```javascript
// Check calculation
const publicPrice = 120;
const tax = publicPrice * 0.16;
const netPrice = publicPrice - tax;
const quantity = 200;
const pricePerKg = 40;
const pricePerGr = pricePerKg / 1000;
const waste = 5;
const effectiveQty = quantity * (1 + waste / 100);
const cost = effectiveQty * pricePerGr;
const costPct = (cost / netPrice) * 100;
const profitPct = 100 - costPct;

console.log('Net Price:', netPrice); // Should be 100.80
console.log('Cost:', cost.toFixed(2)); // Should be 8.40
console.log('Cost %:', costPct.toFixed(2)); // Should be 8.33
console.log('Profit %:', profitPct.toFixed(2)); // Should be 91.67
```

---

## 📊 Testing Checklist

### Pre-Fix State ❌

- [ ] PGRST204 error when creating dish
- [ ] Console shows "Could not find wastage_percentage"
- [ ] Dish creation fails
- [ ] No dishes in list
- [ ] App unusable

### Post-Fix State (Expected) ✅

- [ ] No PGRST204 errors
- [ ] Can create dishes successfully
- [ ] Ingredients save with waste %
- [ ] Calculations are correct
- [ ] Autocomplete works
- [ ] Dish details show properly
- [ ] Profitability dashboard displays
- [ ] No console errors

---

## 🔍 Additional Debugging

### If Error Persists After Restart

**Check PostgREST Logs:**
1. Supabase Dashboard
2. Project Settings → Logs
3. Select "PostgREST" from dropdown
4. Look for:
   - "schema cache loaded" (should appear after restart)
   - Any errors about columns
   - Any warnings about database connection

**Check Database Connection:**
```sql
-- Verify you're connected as the right user
SELECT current_user, current_database();

-- Check table owner
SELECT tableowner FROM pg_tables WHERE tablename = 'inventory_items';
```

**Check for Database Locks:**
```sql
SELECT * FROM pg_locks WHERE relation = 'inventory_items'::regclass;
```

**Nuclear Option (Last Resort):**
```sql
-- ⚠️ ONLY IF NOTHING ELSE WORKS
-- Temporarily disable RLS to isolate issue
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;

-- Test if queries work now
-- ...

-- IMMEDIATELY re-enable
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
```

---

## 📈 Success Criteria

**Error is RESOLVED when:**

✅ **Database:**
- [ ] `wastage_percentage` column exists
- [ ] `price_per_unit` column exists  
- [ ] No `price` column (old name)

✅ **PostgREST:**
- [ ] Schema cache includes new columns
- [ ] API returns 200 for wastage_percentage queries
- [ ] No PGRST204 errors

✅ **Frontend:**
- [ ] Can create dishes
- [ ] Can add ingredients with waste %
- [ ] Autocomplete works
- [ ] Calculations correct
- [ ] No console errors

✅ **User Experience:**
- [ ] Full dish creation flow works
- [ ] Details sheet displays
- [ ] Profitability dashboard shows data
- [ ] App is fully functional

---

## 🔄 Progress Tracking

**Last Updated:** November 6, 2024

| Fix Step | Status | Time | Notes |
|----------|--------|------|-------|
| 1. Add wastage_percentage column | ✅ DONE | - | Column exists in DB |
| 2. Rename price → price_per_unit | ✅ DONE | - | Renamed successfully |
| 3. Update frontend code | ✅ DONE | - | All refs updated |
| 4. Execute NOTIFY reload | ⚠️ TRIED | - | Unclear if worked |
| 5. Restart PostgREST | ⏳ PENDING | - | **← NEXT STEP** |
| 6. Verify with curl | ⏳ PENDING | - | Waiting for restart |
| 7. Test in app | ⏳ PENDING | - | Waiting for restart |
| 8. Verify calculations | ⏳ PENDING | - | Waiting for restart |

**Current Blocker:** PostgREST needs manual restart from dashboard

**Estimated Resolution:** 10-15 minutes (assuming restart works)

---

## 🆘 Escalation Path

**If Fix Doesn't Work:**

1. **Check PostgREST Version**
   - Settings → API → Version
   - Some old versions don't support schema reload

2. **Contact Supabase Support**
   - Dashboard → Help → Submit Ticket
   - Include this error log
   - Mention PGRST204 schema cache issue

3. **Temporary Workaround**
   - Deploy new Supabase project
   - Run canonical schema from scratch
   - Migrate data if needed

4. **Alternative Architecture**
   - Use Supabase Edge Functions instead of PostgREST
   - Bypass schema cache entirely
   - More complexity, but guaranteed to work

---

**This log tracks the EXACT error state and resolution progress.**

**For Senior Developer:** Update status above as you work through fixes.

**Last Error Occurrence:** November 6, 2024 (just now)  
**Priority:** 🔴 P0 - CRITICAL  
**Owner:** Senior Developer (TBD)
