# 🗄️ Quick Start: Set Up Supabase Database

**Project**: https://cemlaexpettqxvslaqop.supabase.co

---

## 📋 **Step 1: Run Database Schema** (5 min)

### **Method 1: Via Supabase Dashboard** (EASIEST) ⭐

1. **Download the schema file**: 
   - File: `COMPLETE_SCHEMA.sql` (2,359 lines)
   - Location: Project root folder
   
2. **Go to Supabase SQL Editor**:
   - Open: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/sql/new
   
3. **Open the file**:
   - Click: **Import SQL** (top right, or paste manually)
   - Or: Copy entire contents of `COMPLETE_SCHEMA.sql`
   
4. **Paste and Run**:
   - Paste into SQL editor
   - Click: **Run** (or Ctrl/Cmd + Enter)
   - Wait: ~30-60 seconds
   
5. **Verify**:
   - Go to: **Table Editor** (left sidebar)
   - You should see 13 tables created ✅

### **Method 2: Via SQL Commands** (Split into smaller chunks)

If the full schema is too large, you can run migrations one by one:

1. **Go to**: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/sql/new

2. **Run migrations in order**:

**Migration 1** (Initial tables):
```bash
# Copy from: supabase/migrations/20251230151107_*.sql
```

**Migration 2** (Scrap Gadgets database):
```bash
# Copy from: supabase/migrations/20260108145951_create_scrapgadget_database.sql
```

**Migration 3** (Seed data):
```bash  
# Copy from: supabase/migrations/20260108150100_seed_scrapgadget_database.sql
```

And so on for each migration file.

---

## ✅ **Tables That Will Be Created**:

1. **user_profiles** - User settings
2. **scan_history** - Scan records
3. **scan_cache** - AI result cache (cost savings!)
4. **inventory** - User's saved components
5. **projects** - DIY projects database
6. **project_components** - Required components
7. **user_projects** - User's built projects
8. **scrap_gadgets** - Main gadget database (empty initially, will be populated)
9. **scrap_gadget_components** - Component breakdowns
10. **scrap_gadget_submissions** - Admin review queue
11. **component_images** - Cached images
12. **build_plans** - User build plans
13. **profiles** - Extended user profiles

Plus:
- **Functions**: `search_scrap_gadgets()`, `get_gadget_breakdown()`
- **Indexes**: For fast searches
- **RLS Policies**: Security rules

---

## 🔐 **Step 2: Set Up Authentication** (2 min)

### **Enable Email Auth**:

1. Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/auth/providers
2. Ensure **Email** provider is enabled ✅
3. Optional: Enable Google/GitHub OAuth if desired

---

## 📦 **Step 3: Verify Database** (1 min)

### **Check Tables**:
1. Go to: **Table Editor**
2. Click: `scrap_gadgets` table
3. Should be empty initially (will populate as users scan)

### **Test Query**:
1. Go to: **SQL Editor**
2. Run:
```sql
SELECT COUNT(*) FROM scan_history;
```
Expected: `0` (no scans yet)

---

## 🐛 **Troubleshooting**

### **Error: "relation already exists"**
**Cause**: Tables already created  
**Fix**: Either:
- Skip (tables already exist)
- Or reset database:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run schema again
```

### **Error: "permission denied"**
**Cause**: Not database owner  
**Fix**: Ensure you're logged into correct Supabase project

### **Error: "syntax error"**
**Cause**: SQL copy-paste issue  
**Fix**: Ensure entire SQL copied correctly, no truncation

---

## ✅ **Quick Checklist**

Database setup:
- [ ] Ran COMPLETE_SCHEMA.sql in Supabase SQL Editor
- [ ] Verified 13 tables created in Table Editor
- [ ] Email auth enabled in Auth settings
- [ ] Test query runs successfully

---

## 🎯 **Next: Deploy Edge Functions**

After database is set up:

1. [ ] Add Supabase access token to GitHub Secrets
2. [ ] Add API keys (OPENAI_API_KEY or GEMINI_API_KEY) to Supabase
3. [ ] Add SUPABASE_SERVICE_ROLE_KEY to Supabase
4. [ ] Manually trigger GitHub Actions workflow
5. [ ] Verify 3 functions deployed

See: `GITHUB_ACTIONS_SETUP.md` for full guide.

---

**Let me know when database setup is done!** 🚀
