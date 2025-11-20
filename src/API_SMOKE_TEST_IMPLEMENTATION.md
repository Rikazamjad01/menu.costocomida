# API Smoke Test Implementation

## ✅ Implementation Complete

A removable "API Smoke Test" developer tool has been added to the Settings screen.

---

## 📍 Location

The developer tools are located at the **bottom of the Settings screen**, inside a Card titled "Developer Tools".

To access:
1. Open the app
2. Login/create account  
3. Click the Settings icon (⚙️) in the top right
4. Scroll to the bottom to find "Developer Tools"

---

## 🎨 UI Components

### Card: "Developer Tools"
- White background with subtle shadow
- Rounded corners (16px)
- Border: #CFE0D8

### Button: "Run API Smoke Test"
- Gradient background (#A6D49F → #7BB97A)
- Full width, 48px height
- Disabled state when running (shows "Running…")

### Status Text
- Shows current status below button
- Options:
  - "No test run yet." (idle)
  - "Running…" (running)
  - "Last run: OK" (success)
  - "Last run: ERROR" (error)

### Result Display
- Monospace `<pre>` block
- Light green background (#F5FAF7/40)
- 8px rounded corners
- Shows JSON formatted result or error
- Scrollable if content overflows

---

## 🔧 Technical Implementation

### Hook: `useApiSmokeTest.ts`

Located at: `/hooks/useApiSmokeTest.ts`

**State:**
```typescript
{
  status: 'idle' | 'running' | 'ok' | 'error',
  lastResult?: string,
  lastError?: string
}
```

**Function:**
- `runTest()` - Executes the smoke test

**Test Query:**
```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select('wastage_percentage')
  .limit(1);
```

**Result Handling:**
- ✅ **Success (error = null):**
  - Sets status to 'ok'
  - Stores result in state and localStorage
  - Shows toast: "API OK"
  - Logs: `console.log('SmokeTest OK', data)`

- ❌ **Error (error exists):**
  - Sets status to 'error'
  - Stores error in state and localStorage
  - Shows toast: "API ERROR: <code>"
  - Logs: `console.error('SmokeTest ERROR', error)`

**Persistence:**
- `localStorage.setItem('cc_smoketest_last_result', ...)`
- `localStorage.setItem('cc_smoketest_last_error', ...)`
- Results persist across page reloads

---

### Component: `DeveloperToolsCard.tsx`

Located at: `/components/DeveloperToolsCard.tsx`

**Features:**
- Uses `useApiSmokeTest` hook
- Displays status text dynamically
- Shows JSON formatted results
- Matches design guidelines (Poppins headings, Inter body)

**Styling:**
- Follows Guidelines.md exactly
- 16px border radius
- Proper font families
- Gradient buttons
- Subtle shadows

---

### Integration: `MenuScreen.tsx`

**Changes:**
1. Added import: `import { DeveloperToolsCard } from './DeveloperToolsCard';`
2. Added component before "Action Buttons" section in Settings Sheet
3. No schema or RLS changes required

---

## 🧪 Testing Instructions

### Test 1: Successful Query
1. Open Settings
2. Scroll to "Developer Tools"
3. Click "Run API Smoke Test"
4. **Expected:**
   - Button shows "Running…" briefly
   - Toast appears: "API OK"
   - Status shows: "Last run: OK"
   - Console shows: `SmokeTest OK [data]`
   - Result displays JSON array

### Test 2: Schema Cache Error (PGRST204)
If PostgREST cache is stale:
1. Run test
2. **Expected:**
   - Toast appears: "API ERROR: PGRST204"
   - Status shows: "Last run: ERROR"
   - Console shows: `SmokeTest ERROR {...}`
   - Error JSON displayed in pre block

### Test 3: Persistence
1. Run test (success or error)
2. Refresh page
3. Open Settings
4. **Expected:**
   - Status still shows last result
   - Result/error still visible
   - No need to run again to see last state

---

## 🗑️ Easy Removal

To remove this feature later:

1. **Delete files:**
   - `/hooks/useApiSmokeTest.ts`
   - `/components/DeveloperToolsCard.tsx`

2. **Edit MenuScreen.tsx:**
   - Remove line: `import { DeveloperToolsCard } from './DeveloperToolsCard';`
   - Remove line: `<DeveloperToolsCard />`

3. **Optional cleanup:**
   - Clear localStorage keys:
     - `cc_smoketest_last_result`
     - `cc_smoketest_last_error`

Total: 2 files to delete, 2 lines to remove from MenuScreen.tsx

---

## 📊 Use Cases

### 1. Verify PostgREST is Running
Quick check if the API layer is responding.

### 2. Confirm Schema Cache Updated
After DDL changes, verify PostgREST recognizes new columns.

### 3. Debug PGRST204 Errors
Reproduces the exact error condition that blocks dish creation.

### 4. Test RLS Policies
Verifies user can query inventory_items table.

### 5. Quick Health Check
One-click API verification without opening console.

---

## 🎯 Success Criteria

✅ **Implemented:**
- [x] Compact Dev section in Settings
- [x] Card titled "Developer Tools"
- [x] Button: "Run API Smoke Test"
- [x] Monospace result area
- [x] Hook with correct state/fn signature
- [x] Exact query specified
- [x] Correct result handling (toast, console, localStorage)
- [x] TypeScript functional components
- [x] Shadcn/ui Card and Button
- [x] Proper status text
- [x] No schema/RLS changes
- [x] Easy to remove later

---

## 🔍 File Changes

### New Files (2)
1. `/hooks/useApiSmokeTest.ts` - 94 lines
2. `/components/DeveloperToolsCard.tsx` - 56 lines

### Modified Files (1)
1. `/components/MenuScreen.tsx`:
   - Added import (1 line)
   - Added component (1 line)

**Total Impact:** 3 files, ~150 lines of code

---

## 🚀 Next Steps

1. **Test in development:**
   - Open Settings
   - Run smoke test
   - Verify console output
   - Check localStorage

2. **Use for debugging:**
   - If PGRST204 errors occur
   - Run smoke test to reproduce
   - Share error JSON with debugger

3. **Remove when stable:**
   - Once schema issues resolved
   - Delete 2 files, remove 2 lines
   - Feature leaves no trace

---

**Implementation Date:** November 6, 2024  
**Status:** ✅ Complete and Ready to Test  
**Type:** Developer Tool (Non-production)
