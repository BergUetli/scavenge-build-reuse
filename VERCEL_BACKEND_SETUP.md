# ⚡ Quick Setup: Connect Vercel to Supabase Backend

**Time Required**: 5 minutes  
**Status**: ⚠️ ACTION REQUIRED

---

## 🎯 What You Need to Do

Your backend is on Supabase and working fine. You just need to tell Vercel how to connect to it.

---

## 📝 **Step 1: Add Environment Variables to Vercel**

### **Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Click on: **scavenge-build-reuse** project
3. Click: **Settings** (top navigation)
4. Click: **Environment Variables** (left sidebar)

### **Add These 3 Variables**

#### **Variable 1**:
```
Name: VITE_SUPABASE_URL
Value: https://ceccmwopwtjvtkdeayrk.supabase.co
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

#### **Variable 2**:
```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY2Ntd29wd3RqdnRrZGVheXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDQzNDQsImV4cCI6MjA4MjY4MDM0NH0.obiCP3NJ7JB60VdjldMv59srRq1UT7qxA_JQmHXka1w
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

#### **Variable 3** (optional, for reference):
```
Name: VITE_SUPABASE_PROJECT_ID
Value: ceccmwopwtjvtkdeayrk
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

---

## 🔄 **Step 2: Redeploy** (automatically triggers after adding env vars)

After adding variables, Vercel will ask:
> "Redeploy to apply new environment variables?"

Click: **Redeploy** ✅

Wait: ~2 minutes for deployment

---

## ✅ **Step 3: Test Backend Connection**

### **Test 1: Visit Your App**
1. Go to: https://scavenge-build-reuse.vercel.app
2. Open browser console (F12 → Console tab)
3. Type:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```
4. Should see: `https://ceccmwopwtjvtkdeayrk.supabase.co`

### **Test 2: Try Scanner**
1. Click: **Get Started** → Scanner
2. Take/upload a photo of any electronic device
3. Wait for AI identification
4. **If it works** → ✅ Backend is connected!
5. **If error** → Check browser console for errors

---

## 🐛 **Troubleshooting**

### **Error: "Supabase URL is undefined"**
**Fix**: Environment variables not set in Vercel
**Action**: Go back to Step 1, double-check variable names

### **Error: "Network request failed"**
**Fix**: Supabase Edge Functions not deployed
**Action**: Check Supabase dashboard

### **Error: "Invalid API key"**
**Fix**: Wrong PUBLISHABLE_KEY
**Action**: Verify key matches `.env` file

---

## 📊 **After Setup - Monitor Backend Health**

### **Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/ceccmwopwtjvtkdeayrk
2. Check:
   - **Database**: Should show ~15K rows in `scrap_gadgets`
   - **Edge Functions**: Should show 3 functions deployed
   - **Auth**: Should show users (if any signed up)
   - **Usage**: Should be under free tier limits

### **Set Up Alerts**
1. Go to: Settings → Billing
2. Enable: **Email alerts at 80% usage**
3. Monitor: API requests, database size, bandwidth

---

## 💰 **Cost Breakdown**

### **Current Setup Costs**:
- **Vercel Frontend**: $0/month (free tier)
- **Supabase Backend**: $0/month (free tier is enough for now)

### **When You Need to Upgrade Supabase**:
- ⏰ More than 500MB database (currently ~200MB)
- ⏰ More than 2GB bandwidth/month
- ⏰ More than 500K Edge Function calls/month
- 💰 Cost: $25/month for Pro tier

**Estimate**: You won't need Pro tier for ~6-12 months

---

## 🎯 **What Happens After Setup**

### **Your Workflow**:
```
1. Write code locally
2. git push origin main
3. Vercel auto-deploys frontend (~2 min)
4. Frontend connects to Supabase backend
5. Everything works! ✅
```

### **No Manual Steps Needed**:
- ✅ Auto-deploy: Enabled
- ✅ Backend: Already deployed on Supabase
- ✅ Database: Already populated with 15K+ gadgets
- ✅ Edge Functions: Already deployed (AI, images, matching)

---

## 📋 **Checklist**

Before moving forward:
- [ ] Added 3 environment variables to Vercel
- [ ] Redeployed Vercel app
- [ ] Tested scanner (works?)
- [ ] Checked browser console (no errors?)
- [ ] Set up Supabase usage alerts

Once all checked → ✅ **Backend is fully set up!**

---

## 🚀 **Next Steps**

After backend is verified working:

**Option A**: Improve UI (homepage clarity, navigation)  
**Option B**: Add more features (v0.6)  
**Option C**: Set up analytics/monitoring  
**Option D**: Review and test existing features

**What would you like to do next?**
