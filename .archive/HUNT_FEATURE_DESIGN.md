# 🔍 HUNT FEATURE - TECHNICAL DESIGN

**Feature**: Find devices that contain specific components  
**Example**: "Where can I find an A14 Bionic chip?" → "iPhone 12, iPhone 12 Pro, iPad Air 4th gen"

---

## 📊 **DATABASE ARCHITECTURE**

### **Existing Tables** (Already Have!):
```sql
scrap_gadgets (
  id, device_name, brand, model, category, 
  release_year, tutorial_url, video_url, ...
)

scrap_gadget_components (
  id, gadget_id, component_name, category,
  specifications, technical_specs, 
  reusability_score, market_value_new, ...
)
```

**Perfect!** We already have a two-way relationship:
- Gadget → Components (one-to-many)
- Component → Gadgets (many-to-many via join)

---

## 🔍 **HUNT QUERY STRATEGY**

### **Option 1: Direct SQL Search** ⭐ (BEST - Fast, No AI Needed)

**Search Components by Name**:
```sql
-- Find all devices containing "A14" or "Bionic"
SELECT 
  g.device_name,
  g.brand,
  g.model,
  g.release_year,
  g.tutorial_url,
  g.video_url,
  c.component_name,
  c.specifications,
  c.reusability_score,
  c.market_value_new
FROM scrap_gadgets g
JOIN scrap_gadget_components c ON c.gadget_id = g.id
WHERE 
  c.component_name ILIKE '%A14%' 
  OR c.component_name ILIKE '%Bionic%'
  OR c.specifications::text ILIKE '%A14%'
ORDER BY g.release_year DESC, c.market_value_new DESC
LIMIT 20;
```

**Pros**:
- ⚡ Instant results (no AI call)
- 💰 Zero cost
- ✅ 100% accurate
- 🔄 Uses existing data

**Cons**:
- Only works if database is populated

---

### **Option 2: Cached AI Results** (Fallback)

**For components NOT in database**:
1. Check cache table first (`component_sources_cache`)
2. If cache exists and < 30 days old → use it
3. If not cached or stale → call AI, store result
4. Return cached results

**Cache Table Structure**:
```sql
CREATE TABLE component_sources_cache (
  id uuid PRIMARY KEY,
  component_name text UNIQUE,
  component_category text,
  search_query text, -- normalized search
  devices jsonb, -- array of device matches
  ai_generated boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  cache_expires_at timestamptz, -- configurable expiry
  hit_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

---

## 🎯 **HYBRID APPROACH** (Recommended)

### **Flow**:
```
User searches: "A14 Bionic"
  ↓
1. DIRECT DB SEARCH (scrap_gadget_components)
   ↓
   Found results? → Return immediately ✅
   ↓
2. CHECK CACHE (component_sources_cache)
   ↓
   Cache exists & fresh? → Return cached ✅
   ↓
3. AI FALLBACK (OpenAI)
   ↓
   Generate results → Cache for 30 days → Return
```

**Cost Analysis**:
- 1st search: $0.002 (AI call)
- Next 1000+ searches: $0 (cached)
- Average: ~$0.000002 per search

---

## 🛠️ **IMPLEMENTATION PLAN**

### **Phase 1: Database Search** (1-2 hours)

**A. Create PostgreSQL Function**:
```sql
CREATE FUNCTION search_component_sources(
  search_query text,
  limit_results int DEFAULT 20
) RETURNS TABLE (
  device_name text,
  brand text,
  model text,
  release_year int,
  component_name text,
  component_category text,
  reusability_score int,
  market_value_new numeric,
  tutorial_url text,
  video_url text,
  match_score float
) AS $$
  -- Use full-text search + trigram similarity
  SELECT 
    g.device_name,
    g.brand,
    g.model,
    g.release_year,
    c.component_name,
    c.category,
    c.reusability_score,
    c.market_value_new,
    g.tutorial_url,
    g.video_url,
    greatest(
      similarity(c.component_name, search_query),
      ts_rank(to_tsvector('english', c.component_name), plainto_tsquery(search_query))
    ) as match_score
  FROM scrap_gadgets g
  JOIN scrap_gadget_components c ON c.gadget_id = g.id
  WHERE 
    c.component_name ILIKE ('%' || search_query || '%')
    OR to_tsvector('english', c.component_name) @@ plainto_tsquery(search_query)
    OR c.specifications::text ILIKE ('%' || search_query || '%')
  ORDER BY match_score DESC, g.release_year DESC
  LIMIT limit_results;
$$ LANGUAGE sql STABLE;
```

**B. Create Cache Table**:
```sql
CREATE TABLE component_sources_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text NOT NULL,
  normalized_query text UNIQUE NOT NULL,
  devices jsonb NOT NULL,
  ai_generated boolean DEFAULT false,
  cache_duration_days int DEFAULT 30,
  last_updated timestamptz DEFAULT now(),
  expires_at timestamptz GENERATED ALWAYS AS (last_updated + (cache_duration_days || ' days')::interval) STORED,
  hit_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_component_sources_query ON component_sources_cache(normalized_query);
CREATE INDEX idx_component_sources_expires ON component_sources_cache(expires_at);
```

**C. Create Admin Settings Table**:
```sql
CREATE TABLE hunt_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Default settings
INSERT INTO hunt_settings (setting_key, setting_value, description) VALUES
  ('cache_duration_days', '30', 'How long to cache component source results'),
  ('enable_ai_fallback', 'true', 'Whether to use AI when DB search fails'),
  ('min_match_score', '0.3', 'Minimum similarity score for matches');
```

---

### **Phase 2: Create Edge Function** (1 hour)

**`supabase/functions/hunt-component/index.ts`**:
```typescript
/**
 * HUNT COMPONENT EDGE FUNCTION
 * 
 * Finds devices that contain a specific component.
 * Strategy:
 * 1. Search database first (fast, free)
 * 2. Check cache if DB empty
 * 3. Call AI as fallback (slow, costs money)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { componentName, userId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Normalize search query
    const normalizedQuery = componentName.toLowerCase().trim();
    
    console.log('Hunting for component:', normalizedQuery);

    // 1. SEARCH DATABASE FIRST
    const { data: dbResults, error: dbError } = await supabase
      .rpc('search_component_sources', {
        search_query: normalizedQuery,
        limit_results: 20
      });

    if (!dbError && dbResults && dbResults.length > 0) {
      console.log('Found in database:', dbResults.length, 'matches');
      
      return new Response(
        JSON.stringify({
          results: dbResults,
          source: 'database',
          cached: false,
          count: dbResults.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. CHECK CACHE
    const { data: cached } = await supabase
      .from('component_sources_cache')
      .select('*')
      .eq('normalized_query', normalizedQuery)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      console.log('Found in cache');
      
      // Update hit count
      await supabase
        .from('component_sources_cache')
        .update({ hit_count: (cached.hit_count || 0) + 1 })
        .eq('id', cached.id);

      return new Response(
        JSON.stringify({
          results: cached.devices,
          source: 'cache',
          cached: true,
          cache_age_days: Math.floor((Date.now() - new Date(cached.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          count: cached.devices.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. AI FALLBACK
    const { data: settings } = await supabase
      .from('hunt_settings')
      .select('setting_value')
      .eq('setting_key', 'enable_ai_fallback')
      .single();

    if (!settings || settings.setting_value !== true) {
      return new Response(
        JSON.stringify({
          results: [],
          source: 'none',
          message: 'No results found and AI fallback disabled'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI for suggestions
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an electronics expert. Given a component name, list consumer devices that commonly contain this component. Return as JSON array.'
          },
          {
            role: 'user',
            content: `What consumer electronic devices contain: ${componentName}?\n\nReturn JSON: [{"device_name":"iPhone 12","brand":"Apple","model":"iPhone 12","release_year":2020,"component_details":"A14 Bionic processor","reusability":"High"}]`
          }
        ],
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    const aiResults = JSON.parse(aiData.choices[0].message.content);

    // Cache AI results
    await supabase
      .from('component_sources_cache')
      .insert({
        component_name: componentName,
        normalized_query: normalizedQuery,
        devices: aiResults,
        ai_generated: true,
      });

    return new Response(
      JSON.stringify({
        results: aiResults,
        source: 'ai',
        cached: false,
        count: aiResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Hunt error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

### **Phase 3: UI Component** (2 hours)

**`src/pages/Hunt.tsx`**:
```typescript
import { useState } from 'react';
import { Search, Cpu, Smartphone, AlertCircle } from 'lucide-react';

export function Hunt() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    const response = await fetch('/functions/v1/hunt-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentName: searchQuery })
    });
    
    const data = await response.json();
    setResults(data.results);
    setSource(data.source);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">🔍 Component Hunt</h1>
      <p className="text-muted-foreground mb-6">
        Find devices that contain the component you need
      </p>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g., A14 Bionic, DDR4 RAM, Li-ion battery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-3 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg"
        >
          {loading ? 'Searching...' : 'Hunt'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu className="w-4 h-4" />
            {results.length} devices found
            {source === 'cache' && ' (cached)'}
            {source === 'ai' && ' (AI generated)'}
          </div>

          {results.map((result, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:bg-accent">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {result.device_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.brand} • {result.release_year}
                  </p>
                  <p className="text-sm mt-2">
                    {result.component_name || result.component_details}
                  </p>
                </div>
                
                {result.tutorial_url && (
                  <a
                    href={result.tutorial_url}
                    target="_blank"
                    className="text-primary hover:underline text-sm"
                  >
                    Teardown Guide →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### **Phase 4: Admin Settings** (1 hour)

**Add to Admin Dashboard** (`src/pages/Admin.tsx`):
```typescript
// Add tab for Hunt Settings
<TabsContent value="hunt-settings">
  <Card>
    <CardHeader>
      <CardTitle>Hunt Feature Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label>Cache Duration (days)</label>
        <input type="number" defaultValue={30} />
      </div>
      
      <div>
        <label>Enable AI Fallback</label>
        <Switch defaultChecked />
      </div>
      
      <div>
        <label>Minimum Match Score</label>
        <input type="number" step="0.1" defaultValue={0.3} />
      </div>
      
      <Button>Save Settings</Button>
    </CardContent>
  </Card>
</TabsContent>
```

---

## 📊 **PERFORMANCE & COST**

### **Scenario 1: Database Populated** (Best Case)
- Search time: ~50-200ms
- Cost: $0
- Accuracy: 100%

### **Scenario 2: Cache Hit** (Common)
- Search time: ~100-300ms
- Cost: $0
- Accuracy: 95%+ (AI generated)

### **Scenario 3: AI Fallback** (Rare)
- Search time: ~2-5 seconds
- Cost: $0.002 per search
- Accuracy: 90%+ (AI limitations)

### **Average Cost** (with caching):
- 1,000 searches: ~$0.05
- 10,000 searches: ~$0.50

---

## 🎯 **RECOMMENDATION**

**Implement Hybrid Approach**:
1. ✅ Direct database search (instant, free)
2. ✅ Cache layer (30-day expiry, configurable)
3. ✅ AI fallback (when needed)
4. ✅ Admin dashboard to control settings

**Timeline**:
- Phase 1 (DB): 2 hours
- Phase 2 (Edge Function): 1 hour
- Phase 3 (UI): 2 hours
- Phase 4 (Admin): 1 hour
**Total**: ~6 hours

---

**Should I start building this now?** 🚀

**A)** Yes, build the complete Hunt feature  
**B)** Build database + Edge Function first (test backend)  
**C)** Show me a working example first  
**D)** Make changes to the design  

Let me know! 🎯
