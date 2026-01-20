# Scavy - Electronics Salvage & Inventory App

**Live App**: https://scavenge-build-reuse.vercel.app  
**Repository**: https://github.com/BergUetli/scavenge-build-reuse  
**Version**: 0.8.21  
**License**: MIT

---

## 🎯 What is Scavy?

Scavy helps makers, hobbyists, and electronics enthusiasts **salvage reusable components** from old devices using AI-powered visual identification. Point your camera at a broken gadget, and Scavy tells you what's inside and how to reuse it.

### Key Features

- **AI Device Identification**: Scan electronics with your camera, get instant component breakdown
- **Smart Caching**: Database-backed results for consistent, fast re-scans
- **15,000+ Component Database**: Pre-loaded common components with specifications
- **Inventory Management**: Track your salvaged parts ("Cargo Hold")
- **DIY Project Matching**: Find projects you can build with your salvaged components
- **Disassembly Guides**: YouTube teardown videos for popular devices
- **Multi-Provider AI**: Supports OpenAI, Google Gemini, Anthropic Claude

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Radix UI
- React Router DOM
- React Query (data fetching)
- Zustand (state management)

**Backend**:
- Supabase (PostgreSQL database + Auth + Edge Functions)
- AI: OpenAI GPT-4o-mini, Google Gemini 2.5 Flash, Claude 3 Haiku
- Image Processing: Client-side compression + SHA-256 hashing

**Hosting**:
- Frontend: Vercel (auto-deploy from `main` branch)
- Backend: Supabase Edge Functions
- Database: Supabase PostgreSQL

---

## 📁 Project Structure

```
scavenge-build-reuse/
├── src/
│   ├── pages/              # Main application pages
│   │   ├── Scanner.tsx     # AI scanning interface (ACTIVE)
│   │   ├── Home.tsx        # Landing page
│   │   ├── Inventory.tsx   # User's salvaged components
│   │   ├── Projects.tsx    # DIY project browser
│   │   ├── Profile.tsx     # User profile & stats
│   │   ├── Settings.tsx    # App settings (AI provider, etc.)
│   │   └── Admin.tsx       # Component database management
│   │
│   ├── components/
│   │   ├── scanner/        # Scanner UI components
│   │   │   ├── CameraView.tsx          # Camera capture interface
│   │   │   ├── ComponentBreakdownV7.tsx # Results display (bubble UI)
│   │   │   ├── PerformanceMonitor.tsx  # Cache/AI/Database badge
│   │   │   └── DisassemblyWizard.tsx   # Teardown guide UI
│   │   ├── ui/             # Radix UI components (shadcn/ui)
│   │   └── ...             # Other reusable components
│   │
│   ├── hooks/              # React hooks
│   │   ├── useScanner.ts   # Scanner logic (capture, compress, AI call)
│   │   ├── useInventory.ts # Inventory CRUD
│   │   ├── useProjects.ts  # Project matching
│   │   └── ...
│   │
│   ├── lib/                # Core business logic
│   │   ├── scanFlow.ts     # Multi-stage scan orchestration
│   │   ├── imageUtils.ts   # Image compression + hashing
│   │   └── ...
│   │
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client configuration
│   │
│   └── types/              # TypeScript type definitions
│
├── supabase/
│   ├── functions/          # Edge Functions (Deno/TypeScript)
│   │   ├── identify-component/  # AI device identification
│   │   ├── generate-component-image/  # Component image generation
│   │   ├── match-projects/      # Project matching algorithm
│   │   └── _shared/        # Shared utilities (logger, etc.)
│   │
│   └── migrations/         # SQL database migrations
│       ├── 20260114000000_v0.7_scrapgadget_caching.sql
│       ├── 20260120_fix_missing_tables.sql
│       └── ...
│
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions CI/CD
│   ├── release.yml         # Version bumping & tagging
│   └── deploy-supabase-functions.yml  # Auto-deploy Edge Functions
│
├── .archive/               # Archived development notes
└── package.json            # Dependencies & scripts
```

---

## 🧠 How Scanning Works (Multi-Stage Flow)

Scavy uses a **3-stage progressive scan** to optimize speed and cost:

### Stage 1: Device Identification (~1-2s)

1. **User captures photo** via CameraView
2. **Client-side compression**: Max 800px, 60% JPEG quality
3. **Image hashing**: SHA-256 for cache lookups
4. **Cache check**: Query `scrap_gadget_devices` by `image_hash`
   - **Cache hit** → return cached device name + components instantly
   - **Cache miss** → proceed to AI call
5. **AI identification**: Call `identify-component` Edge Function
   - Input: Base64 image + optional user hint
   - Output: Device name, manufacturer, model, component list
6. **Cache result**: Store in `scrap_gadget_devices` + `scrap_gadget_device_components`

### Stage 2: Component List (0s cached, ~2-3s uncached)

- **If Stage 1 returned components**: Use them directly (skip Stage 2)
- **If Stage 1 cached**: Fetch components from `scrap_gadget_device_components`
- **If no cache**: Call AI again for component breakdown

### Stage 3: Component Details (lazy-loaded on demand)

- **User clicks "Learn More"** on a component
- **Fetch from database**: `scrap_gadget_component_details`
- **If missing**: Generate via AI and cache

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles & AI provider preference | `user_id`, `ai_provider`, `items_scanned` |
| `user_inventory` | User's salvaged components | `user_id`, `component_name`, `quantity`, `condition` |
| `scan_cache` | AI response caching (7-day TTL) | `image_hash`, `scan_result`, `hit_count` |
| `scrap_gadget_devices` | Device identification cache | `device_name`, `manufacturer`, `model`, `image_hash` |
| `scrap_gadget_device_components` | Device → Component mapping | `device_id`, `component_name`, `quantity` |
| `scrap_gadget_component_details` | Full component specifications | `component_name`, `specifications`, `reusability_score` |

### Security

- **Row Level Security (RLS)** enabled on all user tables
- Users can only access their own inventory/profile
- Cache tables are public-read, service-role-write

---

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Local Setup

```bash
# Clone repository
git clone https://github.com/BergUetli/scavenge-build-reuse.git
cd scavenge-build-reuse

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY
# - VITE_SUPABASE_PROJECT_ID

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### Environment Variables

**Required** (in `.env` for local dev, Vercel for production):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**Edge Function Secrets** (set in Supabase Dashboard → Settings → Edge Functions):

```env
SCAVY_GEMINI_KEY=your-gemini-api-key
# OR
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-claude-key
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run build:dev    # Build with dev mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## 📦 Deployment

### Frontend (Vercel)

**Auto-deploy**: Pushes to `main` branch trigger automatic deployment

**Manual deploy**:
```bash
npm run build
vercel --prod
```

### Edge Functions (Supabase)

**Auto-deploy**: Changes to `supabase/functions/**` trigger GitHub Actions workflow

**Manual deploy**:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy specific function
supabase functions deploy identify-component --project-ref cemlaexpettqxvslaqop

# Deploy all functions
supabase functions deploy --project-ref cemlaexpettqxvslaqop
```

### Database Migrations

**Migrations must be run manually** in Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/sql
2. Click "+ New query"
3. Copy SQL from `supabase/migrations/*.sql`
4. Run (Ctrl+Enter)

---

## 🔧 Configuration

### AI Provider Selection

Users can choose their preferred AI provider in **Settings**:

- **Gemini** (recommended): Free tier, fast, good quality
- **OpenAI**: GPT-4o-mini, best accuracy, costs ~$0.001/scan
- **Claude**: Claude 3 Haiku, balanced quality/cost

**Fallback order** (if user pref unavailable): Gemini → OpenAI → Claude

### Cost Optimization

- **Image compression**: 800px max, 60% quality (~50-70% size reduction)
- **Caching**: 7-day cache, image hash + device name lookups
- **Model selection**: Cheapest models by default (GPT-4o-mini, Gemini 2.5 Flash)

---

## 🧪 Testing

### Test Scanner Flow

1. **First scan** (AI badge should show):
   ```
   - Capture photo of device (e.g., TV remote)
   - Click "Analyze"
   - Should see device name + components
   - Badge: Purple "AI" badge
   ```

2. **Re-scan same device** (Database badge should show):
   ```
   - Capture photo of same device
   - Click "Analyze"
   - Should see SAME components as before
   - Badge: Blue "database" badge
   ```

### Check Console Logs

```javascript
// Stage 1 cache hit:
[Stage1] Database cache hit for hash: abc123...

// Stage 1 cache miss + AI call:
[Stage1] Edge function response: { hasParentObject: true, itemsLength: 15 }

// Stage 2 using cached components:
[Scanner v0.7] Stage 2: Using 15 components from Stage 1 (no AI call needed!)
```

---

## 🐛 Troubleshooting

### Scanner fails with "Edge Function returned non-2xx"

**Check**:
1. Edge Function secrets configured? (Supabase Dashboard → Settings → Edge Functions)
2. At least one AI provider key set? (`SCAVY_GEMINI_KEY` or `OPENAI_API_KEY`)

**Fix**: Get free Gemini key at https://aistudio.google.com/apikey

### 406 Not Acceptable on database queries

**Issue**: Missing database tables

**Fix**: Run `supabase/migrations/*.sql` in Supabase SQL Editor

### Results inconsistent across scans

**Expected**: After v0.8.19, results should be cached and consistent

**Check**: 
- Console log should show `[Stage1] Database cache hit` on re-scan
- Badge should change from purple "AI" to blue "database"

---

## 🗂️ File Cleanup

### Removed Files (moved to `.archive/`)

- Old release notes: `v0.2_RELEASE_NOTES.md`, `v0.3_RELEASE_NOTES.md`, etc.
- Migration guides: `MIGRATION_GUIDE_LOVABLE_TO_SUPABASE.md`, etc.
- Deployment notes: `VERCEL_DEPLOY_GUIDE.md`, etc.
- Audit documents: `SCAN_LOGIC_AUDIT.md`, etc.

### Unused Code (to be removed in next release)

- `src/pages/HomeB.tsx` - Old home page variant
- `src/pages/ScannerV7.tsx` - Old scanner version
- `src/pages/Scanner.v0.6.2.backup.tsx` - Backup file

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting (auto-format on save recommended)
- Functional components with hooks (no class components)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

For attribution requirements, see [ATTRIBUTION.md](ATTRIBUTION.md)

---

## 🆘 Support

- **GitHub Issues**: https://github.com/BergUetli/scavenge-build-reuse/issues
- **Author**: Rishi Prasad <rishi_prasad@hotmail.com>

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Component marketplace (buy/sell salvaged parts)
- [ ] 3D component visualizations
- [ ] Community teardown guides
- [ ] Multi-language support
- [ ] Offline mode with local AI models

---

**Built with ❤️ by the maker community**
