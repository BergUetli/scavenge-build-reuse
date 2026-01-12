# 🚀 GitHub Actions Setup for Supabase Auto-Deploy

This guide shows how to set up automatic deployment of Supabase Edge Functions via GitHub Actions.

---

## 📋 **What We're Setting Up**

**Workflow**: Automatically deploy Edge Functions when you push to `main` branch

```
git push origin main
  ↓
GitHub Actions triggers
  ↓
Deploys 3 Edge Functions to Supabase:
  - identify-component
  - generate-component-image  
  - match-projects
  ↓
✅ Functions live in ~2 minutes
```

---

## 🔑 **Step 1: Get Supabase Access Token** (2 min)

### **Go to Supabase Dashboard**:
1. Open: https://supabase.com/dashboard/account/tokens
2. Click: **Generate new token**
3. Name: `GitHub Actions - Scavy`
4. Click: **Generate token**
5. **⚠️ COPY THE TOKEN** (you'll only see it once!)

Token format: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 **Step 2: Add Token to GitHub Secrets** (2 min)

### **Go to GitHub Repository**:
1. Open: https://github.com/BergUetli/scavenge-build-reuse
2. Click: **Settings** (top navigation)
3. Click: **Secrets and variables** → **Actions** (left sidebar)
4. Click: **New repository secret**

### **Add Secret**:
```
Name: SUPABASE_ACCESS_TOKEN
Secret: sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (paste your token)
```

5. Click: **Add secret** ✅

---

## 🔑 **Step 3: Add API Keys as Supabase Secrets** (5 min)

Your Edge Functions need API keys. You need to add these via Supabase CLI or dashboard.

### **Option A: Via Supabase Dashboard** (EASIEST)

1. Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/settings/functions
2. Scroll to: **Secrets**
3. Click: **Add new secret**

### **Secrets to Add**:

#### **Required: At least ONE AI provider**
```
Name: OPENAI_API_KEY
Value: sk-proj-... (get from https://platform.openai.com/api-keys)
```

**OR**

```
Name: GEMINI_API_KEY
Value: ... (get from https://aistudio.google.com/app/apikey)
```

**OR**

```
Name: ANTHROPIC_API_KEY
Value: sk-ant-... (get from https://console.anthropic.com/)
```

#### **Recommended: Supabase service key** (for database access from functions)
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... 
(get from: Settings → API → service_role key - secret!)
```

---

## ✅ **Step 4: Commit and Push Workflow** (1 min)

The workflow file is already created at:
```
.github/workflows/deploy-supabase-functions.yml
```

Now commit and push:

```bash
git add .github/workflows/deploy-supabase-functions.yml
git commit -m "Add GitHub Actions for Supabase Edge Functions auto-deploy"
git push origin main
```

---

## 🎯 **Step 5: Trigger First Deployment** (2 min)

### **Option A: Automatic Trigger**
The workflow will automatically run when you push changes to `supabase/functions/`.

### **Option B: Manual Trigger** (Do this now for first deployment!)

1. Go to: https://github.com/BergUetli/scavenge-build-reuse/actions
2. Click: **Deploy Supabase Edge Functions** (left sidebar)
3. Click: **Run workflow** dropdown (right side)
4. Select: **Branch: main**
5. Click: **Run workflow** ✅

Wait ~2-3 minutes for deployment.

---

## 📊 **Step 6: Verify Deployment** (2 min)

### **Check GitHub Actions**:
1. Go to: https://github.com/BergUetli/scavenge-build-reuse/actions
2. Look for green ✅ checkmark
3. Click on the workflow run to see logs

### **Check Supabase**:
1. Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/functions
2. You should see 3 functions:
   - ✅ identify-component
   - ✅ generate-component-image
   - ✅ match-projects

---

## 🧪 **Step 7: Test Edge Functions** (5 min)

### **Test in Supabase Dashboard**:

1. Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/functions
2. Click: **identify-component**
3. Click: **Invoke** tab
4. Paste test payload:

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "userId": "test-user"
}
```

5. Click: **Send request**
6. Expected: JSON response with identified components

---

## 🔄 **Future Workflow** (Auto-Deploy)

From now on:

```bash
# Edit Edge Function
code supabase/functions/identify-component/index.ts

# Commit and push
git add supabase/functions/
git commit -m "Update identify-component function"
git push origin main

# ✨ GitHub Actions automatically deploys! (2-3 min)
```

No manual steps needed! 🎉

---

## 🐛 **Troubleshooting**

### **Error: "Invalid access token"**
**Fix**: Check GitHub secret is set correctly  
**Action**: Go to GitHub → Settings → Secrets → Verify `SUPABASE_ACCESS_TOKEN`

### **Error: "Project not found"**
**Fix**: Wrong project ID in workflow  
**Action**: Verify project ID is `cemlaexpettqxvslaqop`

### **Error: "Function deployment failed"**
**Fix**: Check function code syntax  
**Action**: Review logs in GitHub Actions for specific error

### **Functions deployed but not working**
**Fix**: Missing API keys  
**Action**: Add secrets in Supabase dashboard (Step 3)

---

## 📋 **Complete Checklist**

Setup (one-time):
- [ ] Generated Supabase access token
- [ ] Added `SUPABASE_ACCESS_TOKEN` to GitHub Secrets
- [ ] Added API keys to Supabase Function Secrets (OPENAI_API_KEY or GEMINI_API_KEY)
- [ ] Added SUPABASE_SERVICE_ROLE_KEY to Supabase Function Secrets
- [ ] Committed workflow file
- [ ] Pushed to GitHub
- [ ] Manually triggered first deployment
- [ ] Verified functions in Supabase dashboard
- [ ] Tested a function

Ongoing (automatic):
- [ ] Edit function code
- [ ] Commit and push
- [ ] GitHub Actions deploys automatically ✨

---

## 🎯 **Next Steps**

Once Edge Functions are deployed:

1. ✅ Update Vercel environment variables (if not done)
2. ✅ Test scanner in your app
3. ✅ Verify AI identification works
4. ✅ Continue building features

---

## 💡 **Pro Tips**

### **Test Functions Locally**:
```bash
# Install Supabase CLI locally (if you have Docker)
supabase start
supabase functions serve identify-component
```

### **View Function Logs**:
1. Go to: Supabase Dashboard → Functions → [function name]
2. Click: **Logs** tab
3. See real-time invocation logs

### **Monitor Function Usage**:
1. Go to: Supabase Dashboard → Functions
2. View: Invocations, errors, execution time
3. Set up: Alerts for errors

---

**Ready to proceed? Let me know when you've:**
1. ✅ Generated Supabase access token
2. ✅ Added it to GitHub Secrets
3. ✅ Want me to commit and push the workflow

Then we'll trigger the first deployment! 🚀
