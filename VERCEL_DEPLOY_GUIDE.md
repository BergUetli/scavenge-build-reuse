# 🚀 DEPLOY TO VERCEL (FREE)

## ✅ What You Get with Vercel

- **100% FREE** forever
- **Unlimited deployments** 
- **Auto-deploy from GitHub** (every push = auto-deploy!)
- **Fast CDN** (global edge network)
- **Custom domains** (optional)
- **No credit limits**

---

## 📋 SETUP INSTRUCTIONS (5 minutes)

### **Method 1: Web UI (Easiest - Recommended)**

1. **Go to Vercel**:
   - Visit: https://vercel.com/signup
   - Click "Continue with GitHub"
   - Authorize Vercel

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Find repository: `BergUetli/scavenge-build-reuse`
   - Click "Import"

3. **Configure Build Settings**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
   
   Get these from your Supabase project settings.

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! ✅

6. **Get Your URL**:
   - Vercel gives you: `your-project.vercel.app`
   - Or connect custom domain (optional)

---

### **Method 2: CLI (If you prefer terminal)**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /path/to/scavenge-build-reuse
vercel

# 4. Follow prompts:
# - Link to existing project? No
# - Project name? scavenge-build-reuse
# - Directory? ./
# - Override settings? No

# 5. Set environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 6. Deploy to production
vercel --prod
```

---

## 🔄 AUTO-DEPLOY SETUP

**Enable automatic deployments**:

1. In Vercel dashboard:
   - Go to Project Settings
   - Git tab
   - Enable "Production Branch": `main`
   - ✅ Auto-deploy on push enabled!

2. Now every time you push to GitHub:
   - Vercel automatically detects it
   - Builds and deploys
   - Takes 2-3 minutes
   - Live! 🎉

---

## 📝 WHAT'S READY

All the code is already on GitHub:
- ✅ v0.3: Admin dashboard
- ✅ v0.4: Disassembly wizard
- ✅ v0.4.1: Text optimization
- ✅ v0.5: YouTube video integration
- ✅ vercel.json config file (just added)

**One deploy catches everything up!**

---

## 🔑 WHERE TO GET ENVIRONMENT VARIABLES

You need these from Supabase:

1. Go to: https://supabase.com/dashboard/project/ceccmwopwtjvtkdeayrk/settings/api

2. Copy:
   ```
   Project URL: https://ceccmwopwtjvtkdeayrk.supabase.co
   anon/public key: eyJ... (long string)
   ```

3. Add to Vercel as:
   ```
   VITE_SUPABASE_URL = https://ceccmwopwtjvtkdeayrk.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJ...
   ```

---

## ⚡ QUICK START (Fastest Way)

**Just 3 steps**:

1. **Sign up**: https://vercel.com/signup (use GitHub)
2. **Import**: Click "Add New" → "Project" → Select `scavenge-build-reuse`
3. **Add env vars** → Click "Deploy"

**That's it!** 🎉

---

## 🆚 VERCEL VS LOVABLE

| Feature | Lovable | Vercel |
|---------|---------|--------|
| **Cost** | Limited credits | ✅ FREE forever |
| **Deploys/month** | ~10-50 (depends on credits) | ✅ **UNLIMITED** |
| **Auto-deploy** | Sometimes works | ✅ **Always works** |
| **Speed** | 2-3 min | ✅ 2-3 min |
| **Custom domain** | Yes | ✅ Yes |
| **CDN** | Yes | ✅ Yes (global) |
| **Build logs** | Limited | ✅ Full logs |

**Winner**: Vercel (no brainer for production)

---

## 🎯 AFTER DEPLOYMENT

Once deployed on Vercel:

1. **You'll get a URL**: `your-project.vercel.app`
2. **Share that URL** instead of Lovable URL
3. **Every GitHub push** = auto-deploy (no credits needed!)
4. **I can deploy updates** by just pushing to GitHub

---

## ❓ NEED HELP?

**If you get stuck**:
1. Screenshot the error
2. Tell me which step
3. I'll help troubleshoot

**Common issues**:
- **Build fails**: Check environment variables are set
- **404 errors**: Check `vercel.json` is in repo (it is!)
- **Blank page**: Check Supabase keys are correct

---

## 🚀 READY TO DEPLOY?

**Go here now**: https://vercel.com/signup

**Steps**:
1. Sign in with GitHub
2. Import `scavenge-build-reuse` repository
3. Add Supabase environment variables
4. Click Deploy
5. Tell me your new Vercel URL!

**Should take 5 minutes total.** ⏱️

Let me know when you're done! 🎉
