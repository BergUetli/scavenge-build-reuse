-- =====================================================
-- SCAVY COMPLETE DATABASE FIX v0.9.4
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- ============================================
-- PART 1: FIX 406 ERRORS (RLS on cache tables)
-- ============================================

-- Disable RLS on public cache tables (these are shared, not user-specific)
ALTER TABLE public.scrap_gadget_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_gadget_device_components DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_cache DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (should show 'f' for false)
DO $$
BEGIN
  RAISE NOTICE 'Checking RLS status...';
END $$;

SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('scrap_gadget_devices', 'scrap_gadget_device_components', 'scan_cache')
ORDER BY tablename;

-- ============================================
-- PART 2: FIX 500 ERRORS (Create missing tables)
-- ============================================

-- Create scan_logs table if it doesn't exist (for dashboard)
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Scan identification
  image_hash TEXT NOT NULL,
  device_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  
  -- Performance metrics
  stage1_time_ms INTEGER NOT NULL,
  stage2_time_ms INTEGER,
  total_time_ms INTEGER NOT NULL,
  
  -- Cache/AI tracking
  cache_hit BOOLEAN NOT NULL DEFAULT false,
  data_source TEXT NOT NULL CHECK (data_source IN ('cache', 'database', 'ai')),
  
  -- AI cost tracking
  ai_provider TEXT CHECK (ai_provider IN ('openai', 'gemini', 'claude')),
  ai_model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  
  -- Results
  component_count INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for scan_logs
CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON public.scan_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_user_id ON public.scan_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scan_logs_cache_hit ON public.scan_logs(cache_hit);
CREATE INDEX IF NOT EXISTS idx_scan_logs_data_source ON public.scan_logs(data_source);
CREATE INDEX IF NOT EXISTS idx_scan_logs_ai_provider ON public.scan_logs(ai_provider) WHERE ai_provider IS NOT NULL;

-- Enable RLS on scan_logs (user data, needs protection)
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scan logs" ON public.scan_logs;
DROP POLICY IF EXISTS "Service role can insert scan logs" ON public.scan_logs;

-- Recreate policies
CREATE POLICY "Users can view their own scan logs"
  ON public.scan_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can insert scan logs"
  ON public.scan_logs
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.scan_logs TO authenticated;

-- ============================================
-- PART 3: VERIFICATION
-- ============================================

-- Check that all required tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN (
    'scan_cache',
    'scrap_gadget_devices',
    'scrap_gadget_device_components',
    'profiles',
    'user_inventory',
    'scan_logs'
  );
  
  IF table_count = 6 THEN
    RAISE NOTICE '✅ SUCCESS: All 6 required tables exist';
  ELSE
    RAISE NOTICE '⚠️  WARNING: Only % of 6 required tables exist', table_count;
  END IF;
END $$;

-- List all tables and their RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 ENABLED'
    ELSE '🔓 DISABLED'
  END AS rls_status,
  CASE tablename
    WHEN 'scan_cache' THEN 'Should be DISABLED (shared cache)'
    WHEN 'scrap_gadget_devices' THEN 'Should be DISABLED (shared cache)'
    WHEN 'scrap_gadget_device_components' THEN 'Should be DISABLED (shared cache)'
    WHEN 'scan_logs' THEN 'Should be ENABLED (user data)'
    WHEN 'profiles' THEN 'Should be ENABLED (user data)'
    WHEN 'user_inventory' THEN 'Should be ENABLED (user data)'
    ELSE 'Unknown'
  END AS expected
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'scan_cache',
  'scrap_gadget_devices',
  'scrap_gadget_device_components',
  'profiles',
  'user_inventory',
  'scan_logs'
)
ORDER BY tablename;

-- Final verification query
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ DATABASE FIX COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify the output above shows all tables';
  RAISE NOTICE '2. Wait 2-3 min for Vercel to deploy v0.9.4';
  RAISE NOTICE '3. Hard refresh the app (Ctrl+Shift+R)';
  RAISE NOTICE '4. Try scanning a device';
  RAISE NOTICE '5. Check console - should see no 406 or 500 errors';
  RAISE NOTICE '';
END $$;
