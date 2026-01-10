-- v0.2 Database Cleanup Migration
-- Clear user data tables, keep static reference data

-- =============================================
-- CLEAR USER DATA TABLES
-- =============================================

-- Clear scan history (old component-based entries)
TRUNCATE TABLE scan_history CASCADE;

-- Clear user inventory (test data)
TRUNCATE TABLE user_inventory CASCADE;

-- Clear scan cache (old cache entries)
TRUNCATE TABLE scan_cache CASCADE;

-- Clear scan costs (old cost tracking)
TRUNCATE TABLE scan_costs CASCADE;

-- =============================================
-- KEEP THESE TABLES (Static Reference Data)
-- =============================================
-- components (15,243 electronic components)
-- projects (DIY projects reference)
-- scrap_gadgets (ScrapGadget database ~400k devices)
-- scrap_gadget_components (component mappings)
-- scrap_gadget_submissions (user submissions)
-- scrap_gadget_match_log (match history for optimization)
-- datasets (AI datasets)
-- app_settings (app configuration)
-- profiles (user profiles - keep structure, data stays)
-- user_roles (user roles - keep)

-- =============================================
-- VERIFICATION
-- =============================================

-- Check that static tables still have data
DO $$
DECLARE
  components_count INT;
  projects_count INT;
  scrap_gadgets_count INT;
BEGIN
  SELECT COUNT(*) INTO components_count FROM components;
  SELECT COUNT(*) INTO projects_count FROM projects;
  SELECT COUNT(*) INTO scrap_gadgets_count FROM scrap_gadgets;
  
  RAISE NOTICE 'Components: %', components_count;
  RAISE NOTICE 'Projects: %', projects_count;
  RAISE NOTICE 'Scrap Gadgets: %', scrap_gadgets_count;
  
  IF components_count = 0 THEN
    RAISE EXCEPTION 'ERROR: Components table is empty!';
  END IF;
  
  IF projects_count = 0 THEN
    RAISE EXCEPTION 'ERROR: Projects table is empty!';
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE scan_history IS 'v0.2: Now stores parent_object (high-level gadget) instead of individual components';
