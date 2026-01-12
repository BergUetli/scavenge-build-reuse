# 🚀 COMPLETE MIGRATION GUIDE: Lovable → Vercel + Your Own Supabase

**Objective**: Migrate from Lovable's Supabase to YOUR Supabase account for full control

**Time Required**: 2-4 hours  
**Cost**: $0/month (Supabase free tier)  
**Difficulty**: Medium

---

## 📋 **What We're Migrating:**

### **From**:
```
┌─────────────────────────────────────┐
│  LOVABLE CLOUD                      │
│  ├── Frontend ❌ (migrated)         │
│  ├── Backend ⚠️ (still here)        │
│  └── Database ⚠️ (still here)       │
│                                     │
│  Lovable's Supabase instance        │
│  (You don't control this)           │
└─────────────────────────────────────┘
```

### **To**:
```
┌─────────────────────────────────────┐
│  VERCEL                             │
│  └── Frontend ✅                    │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  YOUR SUPABASE ACCOUNT              │
│  ├── Backend (Edge Functions) ✅    │
│  └── Database (Postgres) ✅         │
│                                     │
│  YOU control this                   │
└─────────────────────────────────────┘
```

---

## 🎯 **Phase 1: Create Your Supabase Account** (15 min)

### **Step 1: Sign Up**
1. Go to: https://supabase.com/
2. Click: **Start your project**
3. Sign up with: GitHub (recommended) or Email
4. Verify email if needed

### **Step 2: Create New Project**
1. Click: **New Project**
2. Fill in:
   - **Name**: `scavy` (or `scavenge-build-reuse`)
   - **Database Password**: (generate strong password, save it!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing Plan**: **Free** (0/month)
3. Click: **Create new project**
4. Wait: ~2 minutes for project to provision

### **Step 3: Get Your New Credentials**
Once project is ready:
1. Go to: **Settings** (left sidebar) → **API**
2. Copy these values:

```
PROJECT URL: https://xxxxx.supabase.co
ANON PUBLIC KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret!)
```

**⚠️ SAVE THESE!** You'll need them later.

---

## 🗄️ **Phase 2: Export Database from Lovable** (30 min)

### **Challenge**: You need to access Lovable's Supabase

**Problem**: We need the database schema and data from Lovable's Supabase, but you might not have direct access.

### **Option A: If You Can Access Lovable's Supabase Dashboard**

1. Go to Lovable project settings
2. Find: Supabase connection details
3. Go to: Supabase dashboard
4. Navigate to: **SQL Editor**
5. Run this to get schema:

```sql
-- Export table schemas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

6. For each table, export structure and data:
```sql
-- Example for scrap_gadgets table
COPY (SELECT * FROM scrap_gadgets) TO '/tmp/scrap_gadgets.csv' WITH CSV HEADER;
```

### **Option B: If You CAN'T Access Lovable's Supabase** (LIKELY)

**Solution**: Extract data from your running Vercel app

I'll create a script that uses your existing Supabase connection to export data:

```typescript
// scripts/export-from-lovable.ts
// This connects to Lovable's Supabase and exports data
```

Would you like me to create this export script?

---

## 📦 **Phase 3: Set Up Database Schema in Your Supabase** (45 min)

### **Step 1: Copy Migrations**

Your project already has migrations in `supabase/migrations/`:

```bash
cd /home/user/scavenge-build-reuse
ls supabase/migrations/
```

### **Step 2: Install Supabase CLI**

```bash
npm install -g supabase
supabase login
```

### **Step 3: Link to Your New Project**

```bash
cd /home/user/scavenge-build-reuse
supabase link --project-ref YOUR_NEW_PROJECT_REF
```

(Get `YOUR_NEW_PROJECT_REF` from your Supabase dashboard URL)

### **Step 4: Push Migrations**

```bash
supabase db push
```

This will create all tables, RLS policies, functions in your NEW Supabase.

---

## 🔧 **Phase 4: Copy Edge Functions** (30 min)

### **Step 1: Deploy Functions to Your Supabase**

```bash
cd /home/user/scavenge-build-reuse

# Deploy all Edge Functions
supabase functions deploy identify-component
supabase functions deploy generate-component-image
supabase functions deploy match-projects
```

### **Step 2: Set Environment Variables for Functions**

Each function needs API keys (OpenAI, Gemini, etc.):

```bash
# Set secrets for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GEMINI_API_KEY=...
supabase secrets set ANTHROPIC_API_KEY=...
```

**Where to get these keys?**
- **OpenAI**: https://platform.openai.com/api-keys
- **Google AI**: https://aistudio.google.com/app/apikey
- **Anthropic**: https://console.anthropic.com/

---

## 📊 **Phase 5: Migrate Data** (30 min)

### **Option A: If You Exported Data from Lovable**

Import CSV files into your new Supabase:

```bash
# Upload via Supabase dashboard
# Go to: Table Editor → Import data from CSV
```

### **Option B: Copy Directly (If Both Accessible)**

Run SQL queries to copy data:

```sql
-- In your NEW Supabase SQL Editor
-- Connect to old database and copy
-- (requires database link - advanced)
```

### **Option C: Start Fresh (If Data Not Critical)**

If your Lovable instance data is just test data:
1. Skip data migration
2. Start with fresh database
3. Users will need to re-scan devices
4. Database will rebuild as users scan

---

## 🔗 **Phase 6: Update Vercel Environment Variables** (5 min)

### **Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click: **scavenge-build-reuse**
3. Go to: **Settings** → **Environment Variables**

### **Update These Variables**

**Delete old Lovable variables** (if they exist):
- ❌ `VITE_SUPABASE_URL` (old Lovable URL)
- ❌ `VITE_SUPABASE_PUBLISHABLE_KEY` (old key)

**Add new YOUR Supabase variables**:
```
VITE_SUPABASE_URL = https://YOUR_NEW_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Apply to All Environments**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

### **Click: Redeploy**

---

## ✅ **Phase 7: Test Everything** (15 min)

### **Test 1: Frontend Loads**
```
Visit: https://scavenge-build-reuse.vercel.app
Expected: Homepage loads ✅
```

### **Test 2: Database Connection**
```
Open browser console (F12)
Type: await supabase.from('scrap_gadgets').select('count')
Expected: { count: X, error: null } ✅
```

### **Test 3: AI Identification**
```
Go to: Scanner
Upload: Any electronic device image
Wait: ~5 seconds
Expected: AI identifies components ✅
```

### **Test 4: Save to Inventory**
```
After scan: Click "Add to Inventory"
Go to: Inventory page
Expected: Component appears ✅
```

### **Test 5: Admin Review (if admin)**
```
Go to: /admin
Expected: Pending submissions load ✅
```

---

## 🐛 **Troubleshooting**

### **Error: "Failed to fetch"**
**Cause**: Environment variables not set in Vercel  
**Fix**: Double-check Step 6

### **Error: "Invalid API key"**
**Cause**: Wrong Supabase key  
**Fix**: Verify key from Supabase dashboard → Settings → API

### **Error: "Table 'scrap_gadgets' does not exist"**
**Cause**: Migrations not run  
**Fix**: Run `supabase db push` in Step 3

### **Error: "Function not found"**
**Cause**: Edge Functions not deployed  
**Fix**: Run `supabase functions deploy` in Step 4

---

## 💰 **Cost After Migration**

### **Free Tier Limits** (Supabase):
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 500K Edge Function invocations/month
- ✅ Unlimited API requests
- ✅ Unlimited Auth users

### **When You'll Need to Upgrade** ($25/month):
- ⏰ Database > 500MB (you're at ~200MB now)
- ⏰ Bandwidth > 2GB/month
- ⏰ Edge Functions > 500K/month

**Estimate**: Free tier sufficient for 6-12 months

---

## 🎯 **Summary Checklist**

Before starting:
- [ ] Identify what data needs to be migrated
- [ ] Have OpenAI/Gemini API keys ready
- [ ] Have 2-4 hours available

During migration:
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Save credentials
- [ ] Export Lovable data (or decide to start fresh)
- [ ] Link Supabase CLI
- [ ] Push migrations
- [ ] Deploy Edge Functions
- [ ] Set function secrets
- [ ] Import data (if needed)
- [ ] Update Vercel env vars
- [ ] Redeploy Vercel

After migration:
- [ ] Test homepage loads
- [ ] Test database connection
- [ ] Test scanner/AI
- [ ] Test inventory save
- [ ] Test admin page (if admin)
- [ ] Set up billing alerts

---

## 🚨 **Critical Decision: Data Migration**

**Question**: Do you need to migrate existing data from Lovable's database?

**Option A: Migrate Data** (Recommended if you have real users)
- ✅ Preserve user accounts
- ✅ Keep scan history
- ✅ Preserve inventory
- ⏱️ Extra 1-2 hours of work

**Option B: Start Fresh** (OK if it's just test data)
- ✅ Clean slate
- ✅ Faster migration
- ⏱️ Save 1-2 hours
- ⚠️ Lose existing data

**Which do you need?**

---

## 🤔 **Do You Want Me To:**

**Option A**: Create automated export script to get data from Lovable  
**Option B**: Guide you through manual export steps  
**Option C**: Skip data migration and start fresh  
**Option D**: Show me how to check what data exists first  

**What would you like to do?** 🚀
