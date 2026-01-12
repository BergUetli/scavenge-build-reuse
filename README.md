# Scavy - Electronics Salvage & Inventory App

Turn e-waste into resources. Scan electronics, salvage components, build new projects.

---

## 🚀 **Deployment**

**Live App**: https://scavenge-build-reuse.vercel.app

**Tech Stack**:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Edge Functions + PostgreSQL)
- **Hosting**: Vercel (auto-deploy from GitHub)
- **AI**: OpenAI GPT-4o-mini (vision) + DALL-E

---

## 📦 **Local Development**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Setup**
```bash
# Clone the repository
git clone https://github.com/BergUetli/scavenge-build-reuse.git
cd scavenge-build-reuse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🗄️ **Database Setup**

This project uses Supabase for backend and database.

### **Supabase Configuration**
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your API credentials from Settings → API
4. Add to `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### **Database Schema**
All migrations are in `supabase/migrations/`. Run them via Supabase SQL Editor.

---

## 🔧 **Edge Functions**

Three Edge Functions power the AI features:
- `identify-component` - AI vision identification
- `generate-component-image` - DALL-E image generation  
- `match-projects` - AI project matching

Deploy via GitHub Actions (auto-configured) or manually via Supabase CLI.

---

## 📝 **Environment Variables**

Required variables for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_ref
```

For Vercel deployment, add these in Project Settings → Environment Variables.

---

## 🚀 **Deployment to Vercel**

This project is configured for automatic deployment:

1. Push to `main` branch
2. Vercel auto-deploys frontend (~2 minutes)
3. GitHub Actions auto-deploys Edge Functions to Supabase

### **Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🏗️ **Project Structure**

```
scavenge-build-reuse/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── integrations/     # Supabase client
│   └── types/            # TypeScript types
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── docs/                 # Documentation
```

---

## 🧪 **Testing**

```bash
# Run tests (if configured)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📊 **Features**

- ✅ AI-powered device identification (GPT-4 Vision)
- ✅ Component database (15,000+ devices)
- ✅ Interactive disassembly guides with YouTube integration
- ✅ User inventory management
- ✅ DIY project matching
- ✅ Admin review system for new devices
- ✅ Cost optimization via caching
- ✅ Mobile-optimized UI

---

## 🔐 **Security**

- Row Level Security (RLS) enabled on all tables
- API keys stored as environment variables
- Service role key never exposed to client
- CORS configured for Edge Functions

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is open source and available under the MIT License.

---

## 📞 **Support**

For issues or questions:
- Open an issue on GitHub
- Check documentation in `/docs` folder
- Review setup guides in project root

---

## 🎯 **Roadmap**

- [ ] Mobile app (React Native)
- [ ] Marketplace for components
- [ ] 3D disassembly visualizations
- [ ] Community-contributed teardowns
- [ ] Multi-language support

---

**Built with ❤️ for the maker community**
