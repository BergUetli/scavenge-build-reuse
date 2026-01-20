# ✅ COMPLETE MIGRATION CHECKLIST

**From**: Lovable Cloud  
**To**: Vercel (Frontend) + Your Supabase (Backend)

---

## 🎯 **Current Status**

- ✅ Frontend migrated to Vercel (auto-deploy working)
- ✅ GitHub Actions workflow created
- ⏳ Database schema ready (needs to be run)
- ⏳ Edge Functions ready (needs deployment)
- ⏳ Environment variables (needs setup)

---

## 📋 **YOUR ACTION ITEMS**

### **Phase 1: Database Setup** (5 min)

- [ ] **1.1** Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/sql/new
- [ ] **1.2** Open `COMPLETE_SCHEMA.sql` file from project folder
- [ ] **1.3** Copy entire file (2,359 lines)
- [ ] **1.4** Paste into Supabase SQL Editor
- [ ] **1.5** Click **Run** (or Ctrl/Cmd + Enter)
- [ ] **1.6** Wait ~30-60 seconds
- [ ] **1.7** Verify in Table Editor: Should see 13 tables ✅

---

### **Phase 2: GitHub Actions Setup** (5 min)

#### **2A: Get Supabase Access Token**
- [ ] **2.1** Go to: https://supabase.com/dashboard/account/tokens
- [ ] **2.2** Click: **Generate new token**
- [ ] **2.3** Name: `GitHub Actions - Scavy`
- [ ] **2.4** Copy token (starts with `sbp_...`)

#### **2B: Add Token to GitHub**
- [ ] **2.5** Go to: https://github.com/BergUetli/scavenge-build-reuse/settings/secrets/actions
- [ ] **2.6** Click: **New repository secret**
- [ ] **2.7** Name: `SUPABASE_ACCESS_TOKEN`
- [ ] **2.8** Value: (paste token)
- [ ] **2.9** Click: **Add secret** ✅

---

### **Phase 3: API Keys Setup** (5 min)

**Go to**: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/settings/vault

#### **3A: Get AI Provider API Key** (choose ONE):

**Option A: OpenAI** (Recommended)
- [ ] **3.1** Go to: https://platform.openai.com/api-keys
- [ ] **3.2** Create new key (if needed)
- [ ] **3.3** Copy key (starts with `sk-proj-...`)

**Option B: Google Gemini** (Free tier)
- [ ] **3.1** Go to: https://aistudio.google.com/app/apikey
- [ ] **3.2** Create API key
- [ ] **3.3** Copy key

#### **3B: Add to Supabase Secrets**
- [ ] **3.4** In Supabase Vault, click: **New secret**
- [ ] **3.5** Name: `OPENAI_API_KEY` (or `GEMINI_API_KEY`)
- [ ] **3.6** Value: (paste your key)
- [ ] **3.7** Click: **Save** ✅

#### **3C: Get Service Role Key**
- [ ] **3.8** Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/settings/api
- [ ] **3.9** Copy: **service_role** key (secret, starts with `eyJ...`)
- [ ] **3.10** In Supabase Vault, add new secret:
  - Name: `SUPABASE_SERVICE_ROLE_KEY`
  - Value: (paste service key)
- [ ] **3.11** Click: **Save** ✅

---

### **Phase 4: Deploy Edge Functions** (3 min)

- [ ] **4.1** Go to: https://github.com/BergUetli/scavenge-build-reuse/actions
- [ ] **4.2** Click: **Deploy Supabase Edge Functions** (left sidebar)
- [ ] **4.3** Click: **Run workflow** (right side)
- [ ] **4.4** Select: **Branch: main**
- [ ] **4.5** Click: **Run workflow** ✅
- [ ] **4.6** Wait: ~2-3 minutes
- [ ] **4.7** Verify: Green ✅ checkmark appears

---

### **Phase 5: Verify Functions Deployed** (2 min)

- [ ] **5.1** Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/functions
- [ ] **5.2** Should see 3 functions:
  - ✅ identify-component
  - ✅ generate-component-image
  - ✅ match-projects

---

### **Phase 6: Update Vercel Environment Variables** (5 min)

- [ ] **6.1** Go to: https://vercel.com/dashboard
- [ ] **6.2** Click: **scavenge-build-reuse** project
- [ ] **6.3** Go to: **Settings** → **Environment Variables**

#### **6A: Delete Old Variables** (if they exist)
- [ ] **6.4** Delete: `VITE_SUPABASE_URL` (old Lovable URL)
- [ ] **6.5** Delete: `VITE_SUPABASE_PUBLISHABLE_KEY` (old key)

#### **6B: Add New Variables**
- [ ] **6.6** Click: **Add New**
- [ ] **6.7** Add Variable 1:
  - Name: `VITE_SUPABASE_URL`
  - Value: `https://cemlaexpettqxvslaqop.supabase.co`
  - Environments: ☑️ All (Production, Preview, Development)
  
- [ ] **6.8** Add Variable 2:
  - Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbWxhZXhwZXR0cXh2c2xhcW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjkyNjAsImV4cCI6MjA1MjIwNTI2MH0.sb_publishable_F_XAk1VrU5edA93nzzs8WQ_tDE-O2jO`
  - Environments: ☑️ All

- [ ] **6.9** Click: **Save**
- [ ] **6.10** When prompted, click: **Redeploy**
- [ ] **6.11** Wait: ~2-3 minutes for redeploy

---

### **Phase 7: Test Everything** (5 min)

#### **7A: Test Homepage**
- [ ] **7.1** Visit: https://scavenge-build-reuse.vercel.app
- [ ] **7.2** Page loads correctly ✅
- [ ] **7.3** Version shows: v0.5

#### **7B: Test Database Connection**
- [ ] **7.4** Open browser console (F12 → Console)
- [ ] **7.5** Paste:
```javascript
await supabase.from('scan_history').select('count')
```
- [ ] **7.6** Expected: `{ count: 0 }` (or similar) ✅

#### **7C: Test Scanner (AI)**
- [ ] **7.7** Go to: Scanner page
- [ ] **7.8** Upload/take photo of electronic device
- [ ] **7.9** Wait: ~5 seconds
- [ ] **7.10** Expected: AI identifies device ✅
- [ ] **7.11** Expected: Shows components breakdown

#### **7D: Test Save to Inventory**
- [ ] **7.12** After scan, click: **Add to Inventory** (or similar)
- [ ] **7.13** Go to: Inventory page
- [ ] **7.14** Expected: Component appears in inventory ✅

---

## 🎉 **Success Criteria**

✅ All checkboxes above completed  
✅ Homepage loads on Vercel  
✅ Database has 13 tables  
✅ 3 Edge Functions deployed  
✅ Scanner identifies devices  
✅ Components save to inventory

---

## 📊 **Summary**

**What We Migrated**:
- ✅ Frontend: Lovable → Vercel
- ✅ Backend: Lovable's Supabase → YOUR Supabase
- ✅ Database: Lovable's DB → YOUR DB
- ✅ Edge Functions: Lovable → YOUR Supabase
- ✅ Auto-deploy: GitHub Actions (Supabase) + Vercel (Frontend)

**What You Now Control**:
- ✅ 100% of your code
- ✅ 100% of your data
- ✅ 100% of your backend
- ✅ Full access to Supabase dashboard
- ✅ Can modify functions, database, etc.

**Ongoing Costs**:
- Vercel: $0/month (free tier)
- Supabase: $0/month (free tier sufficient for now)
- OpenAI API: ~$0.002-0.01 per scan (pay-as-you-go)

---

## 🐛 **If Something Goes Wrong**

### **Database schema fails**
- Error: "relation already exists"
- Fix: Database already has tables, skip or reset

### **GitHub Actions fails**
- Error: "Invalid access token"
- Fix: Double-check `SUPABASE_ACCESS_TOKEN` in GitHub Secrets

### **Functions deployed but not working**
- Error: "API key not found"
- Fix: Add `OPENAI_API_KEY` or `GEMINI_API_KEY` in Supabase Vault

### **Scanner doesn't work**
- Error: Check browser console
- Fix: Verify Vercel env vars are set correctly

---

## 📞 **Need Help?**

If stuck on any step, let me know which phase and step number!

---

## 🚀 **Next Steps After Migration**

Once everything works:
1. ✅ Fix UI clarity issues (homepage)
2. ✅ Add new features (v0.6)
3. ✅ Set up monitoring/alerts
4. ✅ Plan user onboarding

---

**Print this checklist and check off each item as you complete it!** ✅
