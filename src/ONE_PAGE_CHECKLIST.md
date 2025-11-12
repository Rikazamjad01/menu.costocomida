# ✅ One-Page Fix Checklist

**Problem:** PGRST204 - App can't create dishes  
**Fix:** Restart PostgREST  
**Time:** 15 minutes  

---

## 🎯 Quick Fix (Check off as you go)

### Setup (2 min)
- [ ] Read [DELIVERY_SUMMARY_FOR_SENIOR_DEV.md](./DELIVERY_SUMMARY_FOR_SENIOR_DEV.md)
- [ ] Open Supabase Dashboard
- [ ] Locate your CostoComida project

### Fix (2 min)
- [ ] Click "Settings" in left sidebar
- [ ] Click "API" 
- [ ] Scroll to "PostgREST Server" section
- [ ] Click "Restart Server" button
- [ ] Wait for green "Running" status (30 sec)

### Verify (3 min)
- [ ] Open app in browser
- [ ] Press F12 → Console tab
- [ ] Paste test query:
```javascript
const { data, error } = await supabase
  .from('inventory_items')
  .select('wastage_percentage')
  .limit(1);
console.log('Error:', error); // Should be null
```
- [ ] Verify error is `null`

### Test (8 min)
- [ ] Login or create account
- [ ] Click "Agregar plato"
- [ ] Enter: Name, Category, Price
- [ ] Add ingredient: Name, Qty, Unit, Price, Waste%
- [ ] Click "Agregar plato"
- [ ] ✅ Success toast appears
- [ ] ✅ Dish appears in list
- [ ] ✅ No PGRST204 error in console

### Confirm (1 min)
- [ ] Click on dish to view details
- [ ] Verify calculations are correct
- [ ] Check profit margin displays
- [ ] No console errors

---

## 🚨 If It Fails

### Still Getting PGRST204?
1. Wait 30 more seconds
2. Hard refresh page (Ctrl+Shift+R)
3. Try restart again
4. Check [ERROR_TRACKING_LOG.md](./ERROR_TRACKING_LOG.md) for troubleshooting

### Different Error?
- **42703:** Check [DEBUG_ANALYSIS_CURRENT_ERRORS.md](./DEBUG_ANALYSIS_CURRENT_ERRORS.md)
- **406:** Check [ARREGLAR_RLS_POLITICAS.sql](./ARREGLAR_RLS_POLITICAS.sql)
- **401:** Login issue, verify credentials

---

## 📚 Full Documentation

**Need more info?** See:
- [QUICK_FIX_15_MINUTES.md](./QUICK_FIX_15_MINUTES.md) - Detailed fix guide
- [TECHNICAL_REPORT_SENIOR_DEV.md](./TECHNICAL_REPORT_SENIOR_DEV.md) - Complete report
- [MASTER_INDEX.md](./MASTER_INDEX.md) - All documents indexed

---

**When all checkboxes are marked:** ✅ **DONE!**
