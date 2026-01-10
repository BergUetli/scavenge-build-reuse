# v0.2 Database Cleanup

## 🗑️ **What This Does:**

Clears user data tables while keeping static reference data intact.

---

## ✅ **Tables That Will Be CLEARED:**

1. **`scan_history`** - Old component-based scan entries
2. **`user_inventory`** - Test inventory items  
3. **`scan_cache`** - Old AI response cache
4. **`scan_costs`** - Old scan cost tracking

---

## 🔒 **Tables That Will Be KEPT:**

1. **`components`** - 15,243 electronic components (static reference)
2. **`projects`** - DIY projects reference data
3. **`scrap_gadgets`** - ScrapGadget database (~400k devices)
4. **`scrap_gadget_components`** - Component mappings
5. **`scrap_gadget_submissions`** - User submissions
6. **`scrap_gadget_match_log`** - Match history
7. **`datasets`** - AI training datasets
8. **`app_settings`** - App configuration
9. **`profiles`** - User profiles (keeps structure)
10. **`user_roles`** - User roles

---

## 🚀 **How to Apply:**

### **Option 1: Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/ceccmwopwtjvtkdeayrk/sql
2. Copy the contents of: `supabase/migrations/20260110170000_v02_cleanup_user_data.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Check output for verification messages

### **Option 2: Command Line (Advanced)**

```bash
# If you have Supabase CLI installed
supabase db push
```

---

## ⚠️ **WARNING:**

This will **DELETE ALL**:
- Scan history
- User inventory items
- Cached AI responses
- Scan cost data

**Static reference data (components, projects, ScrapGadget DB) will NOT be affected.**

---

## 🧪 **Verification:**

After running the migration, you should see:

```
NOTICE:  Components: 15243
NOTICE:  Projects: XX
NOTICE:  Scrap Gadgets: XXXXX
```

If you see any errors about empty tables, the migration will fail (safety check).

---

## 📊 **Expected Results:**

```sql
-- Check cleared tables
SELECT COUNT(*) FROM scan_history;      -- Should be 0
SELECT COUNT(*) FROM user_inventory;    -- Should be 0
SELECT COUNT(*) FROM scan_cache;        -- Should be 0
SELECT COUNT(*) FROM scan_costs;        -- Should be 0

-- Check kept tables (should have data)
SELECT COUNT(*) FROM components;        -- Should be 15,243
SELECT COUNT(*) FROM projects;          -- Should be > 0
SELECT COUNT(*) FROM scrap_gadgets;     -- Should be > 400,000
```

---

## 🎯 **Why Clean User Data?**

1. **Old scan entries were wrong** - Showed components instead of parent devices
2. **Fresh start for v0.2** - New scans will have correct format
3. **No test data pollution** - Clean slate for production
4. **Performance** - Smaller tables, faster queries

---

## ♻️ **Can I Undo This?**

**NO** - This is a destructive operation. User data will be permanently deleted.

If you want to keep existing data:
1. Don't run this migration
2. Old scans will show components (not parent devices)
3. New scans (after v0.2) will show parent devices

---

**Ready to apply? Run the migration in Supabase Dashboard SQL Editor!**
