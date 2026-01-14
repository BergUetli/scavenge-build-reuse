-- v0.7 ScrapGadget Caching Tables Migration
-- Purpose: Enable fast device and component lookups via database caching
-- Author: Scavy v0.7
-- Date: 2026-01-14

-- =============================================================================
-- TABLE 1: scrap_gadget_devices
-- Purpose: Cache device identification results by image hash and name
-- =============================================================================

CREATE TABLE IF NOT EXISTS scrap_gadget_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT UNIQUE NOT NULL,
  device_category TEXT,
  manufacturer TEXT,
  model TEXT,
  year INTEGER,
  component_count INTEGER DEFAULT 0,
  image_hash TEXT, -- SHA-256 hash for image-based cache lookup
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_devices_name 
  ON scrap_gadget_devices(device_name);
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_devices_hash 
  ON scrap_gadget_devices(image_hash) 
  WHERE image_hash IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_devices_manufacturer 
  ON scrap_gadget_devices(manufacturer) 
  WHERE manufacturer IS NOT NULL;

-- Comments
COMMENT ON TABLE scrap_gadget_devices IS 'Cache for device identification results from AI scans';
COMMENT ON COLUMN scrap_gadget_devices.image_hash IS 'SHA-256 hash of scan image for fast cache lookup';
COMMENT ON COLUMN scrap_gadget_devices.component_count IS 'Number of salvageable components in this device';

-- =============================================================================
-- TABLE 2: scrap_gadget_device_components
-- Purpose: Link devices to their components (many-to-many relationship)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scrap_gadget_device_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES scrap_gadget_devices(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  component_category TEXT,
  quantity INTEGER DEFAULT 1,
  is_detailed BOOLEAN DEFAULT FALSE, -- Has full details been loaded via Stage 3?
  sort_order INTEGER, -- For maintaining component order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate components per device
  UNIQUE(device_id, component_name)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_device_components_device 
  ON scrap_gadget_device_components(device_id);
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_device_components_name 
  ON scrap_gadget_device_components(component_name);
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_device_components_category 
  ON scrap_gadget_device_components(component_category) 
  WHERE component_category IS NOT NULL;

-- Comments
COMMENT ON TABLE scrap_gadget_device_components IS 'Links devices to their salvageable components';
COMMENT ON COLUMN scrap_gadget_device_components.is_detailed IS 'TRUE if Stage 3 details have been loaded for this component';
COMMENT ON COLUMN scrap_gadget_device_components.sort_order IS 'Display order (by category priority)';

-- =============================================================================
-- TABLE 3: scrap_gadget_component_details
-- Purpose: Store full component specifications (lazy-loaded in Stage 3)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scrap_gadget_component_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  specifications JSONB, -- Technical specifications as JSON
  value TEXT, -- Component value (e.g., "10kΩ", "16GB")
  reusability_score INTEGER CHECK (reusability_score >= 0 AND reusability_score <= 10),
  resale_value TEXT, -- e.g., "Low", "Medium", "High", "$5-10"
  reuse_potential TEXT, -- Description of reuse possibilities
  datasheet_url TEXT,
  tutorial_url TEXT,
  stock_image_key TEXT, -- Key for stock image lookup (e.g., "resistor", "capacitor")
  usage_count INTEGER DEFAULT 0, -- Track how often this component is accessed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_component_details_name 
  ON scrap_gadget_component_details(component_name);
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_component_details_category 
  ON scrap_gadget_component_details(category);
  
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_component_details_usage 
  ON scrap_gadget_component_details(usage_count DESC);

-- GIN index for JSONB specifications (for advanced queries)
CREATE INDEX IF NOT EXISTS idx_scrap_gadget_component_details_specs 
  ON scrap_gadget_component_details USING GIN (specifications);

-- Comments
COMMENT ON TABLE scrap_gadget_component_details IS 'Full component specifications loaded on-demand (Stage 3)';
COMMENT ON COLUMN scrap_gadget_component_details.specifications IS 'JSON object with technical specs (voltage, current, dimensions, etc.)';
COMMENT ON COLUMN scrap_gadget_component_details.stock_image_key IS 'Key for stock image mapping (e.g., "resistor" → /stock-images/resistor.png)';
COMMENT ON COLUMN scrap_gadget_component_details.usage_count IS 'Number of times this component detail has been accessed (for analytics)';

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scrap_gadget_devices
DROP TRIGGER IF EXISTS update_scrap_gadget_devices_updated_at ON scrap_gadget_devices;
CREATE TRIGGER update_scrap_gadget_devices_updated_at
  BEFORE UPDATE ON scrap_gadget_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scrap_gadget_device_components
DROP TRIGGER IF EXISTS update_scrap_gadget_device_components_updated_at ON scrap_gadget_device_components;
CREATE TRIGGER update_scrap_gadget_device_components_updated_at
  BEFORE UPDATE ON scrap_gadget_device_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scrap_gadget_component_details
DROP TRIGGER IF EXISTS update_scrap_gadget_component_details_updated_at ON scrap_gadget_component_details;
CREATE TRIGGER update_scrap_gadget_component_details_updated_at
  BEFORE UPDATE ON scrap_gadget_component_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment component usage count
CREATE OR REPLACE FUNCTION increment_component_usage(component_name_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE scrap_gadget_component_details
  SET usage_count = usage_count + 1
  WHERE component_name = component_name_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update device component count
CREATE OR REPLACE FUNCTION update_device_component_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE scrap_gadget_devices
  SET component_count = (
    SELECT COUNT(*) 
    FROM scrap_gadget_device_components 
    WHERE device_id = NEW.device_id
  )
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update component count when components are added/removed
DROP TRIGGER IF EXISTS update_component_count_on_insert ON scrap_gadget_device_components;
CREATE TRIGGER update_component_count_on_insert
  AFTER INSERT ON scrap_gadget_device_components
  FOR EACH ROW
  EXECUTE FUNCTION update_device_component_count();

DROP TRIGGER IF EXISTS update_component_count_on_delete ON scrap_gadget_device_components;
CREATE TRIGGER update_component_count_on_delete
  AFTER DELETE ON scrap_gadget_device_components
  FOR EACH ROW
  EXECUTE FUNCTION update_device_component_count();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE scrap_gadget_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_gadget_device_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_gadget_component_details ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read
CREATE POLICY "Allow read access to all authenticated users" 
  ON scrap_gadget_devices 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow read access to all authenticated users" 
  ON scrap_gadget_device_components 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow read access to all authenticated users" 
  ON scrap_gadget_component_details 
  FOR SELECT 
  USING (true);

-- Policy: Allow service role (backend) to insert/update/delete
CREATE POLICY "Allow service role full access" 
  ON scrap_gadget_devices 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" 
  ON scrap_gadget_device_components 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" 
  ON scrap_gadget_component_details 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- UTILITY VIEWS
-- =============================================================================

-- View: Device with component count and details
CREATE OR REPLACE VIEW scrap_gadget_devices_summary AS
SELECT 
  d.id,
  d.device_name,
  d.manufacturer,
  d.model,
  d.component_count,
  d.created_at,
  COUNT(DISTINCT dc.id) as actual_component_count,
  COUNT(DISTINCT CASE WHEN dc.is_detailed THEN dc.id END) as detailed_component_count,
  ARRAY_AGG(DISTINCT dc.component_category) FILTER (WHERE dc.component_category IS NOT NULL) as categories
FROM scrap_gadget_devices d
LEFT JOIN scrap_gadget_device_components dc ON d.id = dc.device_id
GROUP BY d.id, d.device_name, d.manufacturer, d.model, d.component_count, d.created_at;

COMMENT ON VIEW scrap_gadget_devices_summary IS 'Summary view of devices with component statistics';

-- View: Most popular components (by usage)
CREATE OR REPLACE VIEW scrap_gadget_popular_components AS
SELECT 
  component_name,
  category,
  usage_count,
  reusability_score,
  resale_value,
  created_at
FROM scrap_gadget_component_details
WHERE usage_count > 0
ORDER BY usage_count DESC
LIMIT 100;

COMMENT ON VIEW scrap_gadget_popular_components IS 'Top 100 most accessed components for analytics';

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Insert sample device (iPhone 12 Pro)
INSERT INTO scrap_gadget_devices (device_name, manufacturer, model, device_category, year, component_count)
VALUES ('iPhone 12 Pro', 'Apple', '12 Pro', 'Smartphone', 2020, 12)
ON CONFLICT (device_name) DO NOTHING;

-- Insert sample components for iPhone 12 Pro
DO $$
DECLARE
  device_id_var UUID;
BEGIN
  SELECT id INTO device_id_var FROM scrap_gadget_devices WHERE device_name = 'iPhone 12 Pro';
  
  IF device_id_var IS NOT NULL THEN
    INSERT INTO scrap_gadget_device_components (device_id, component_name, component_category, quantity, sort_order) VALUES
      (device_id_var, 'A14 Bionic Chip', 'ICs/Chips', 1, 1),
      (device_id_var, 'Battery', 'Power', 1, 2),
      (device_id_var, 'OLED Display', 'Display/Screen', 1, 3),
      (device_id_var, 'Triple Camera Module', 'Camera', 1, 4),
      (device_id_var, 'Logic Board', 'PCB', 1, 5),
      (device_id_var, 'Taptic Engine', 'Electromechanical', 1, 6),
      (device_id_var, 'Speaker', 'Audio', 2, 7),
      (device_id_var, 'Lightning Port', 'Connectors', 1, 8),
      (device_id_var, 'Face ID Module', 'Sensors', 1, 9),
      (device_id_var, 'WiFi Module', 'Connectors', 1, 10),
      (device_id_var, 'Antenna', 'Connectors', 4, 11),
      (device_id_var, 'Vibration Motor', 'Electromechanical', 1, 12)
    ON CONFLICT (device_id, component_name) DO NOTHING;
  END IF;
END $$;

-- Insert sample component details
INSERT INTO scrap_gadget_component_details (component_name, category, description, reusability_score, resale_value, stock_image_key) VALUES
  (
    'A14 Bionic Chip',
    'ICs/Chips',
    'Apple''s 5nm processor with 11.8 billion transistors. High-performance CPU and GPU.',
    3,
    'Low',
    'cpu'
  ),
  (
    'Battery',
    'Power',
    'Lithium-ion rechargeable battery. Can be reused if still holds charge.',
    8,
    'Medium',
    'battery'
  ),
  (
    'OLED Display',
    'Display/Screen',
    'Super Retina XDR display with HDR support. Reusable for repairs.',
    7,
    'High',
    'display'
  ),
  (
    'Triple Camera Module',
    'Camera',
    'Wide, ultra-wide, and telephoto lenses with LiDAR scanner.',
    6,
    'Medium',
    'camera'
  ),
  (
    'Logic Board',
    'PCB',
    'Main circuit board containing CPU, RAM, storage, and other components.',
    5,
    'Medium',
    'pcb'
  )
ON CONFLICT (component_name) DO NOTHING;

-- =============================================================================
-- ANALYTICS & MONITORING
-- =============================================================================

-- Function to get cache hit rate
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE (
  total_devices BIGINT,
  devices_with_hash BIGINT,
  total_components BIGINT,
  detailed_components BIGINT,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT d.id) as total_devices,
    COUNT(DISTINCT d.id) FILTER (WHERE d.image_hash IS NOT NULL) as devices_with_hash,
    COUNT(dc.id) as total_components,
    COUNT(dc.id) FILTER (WHERE dc.is_detailed) as detailed_components,
    ROUND(
      (COUNT(dc.id) FILTER (WHERE dc.is_detailed)::NUMERIC / NULLIF(COUNT(dc.id), 0)) * 100,
      2
    ) as cache_hit_rate
  FROM scrap_gadget_devices d
  LEFT JOIN scrap_gadget_device_components dc ON d.id = dc.device_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cache_stats IS 'Returns statistics about cache usage and hit rates';

-- =============================================================================
-- GRANTS (if using specific roles)
-- =============================================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON scrap_gadget_devices TO authenticated;
GRANT SELECT ON scrap_gadget_device_components TO authenticated;
GRANT SELECT ON scrap_gadget_component_details TO authenticated;
GRANT SELECT ON scrap_gadget_devices_summary TO authenticated;
GRANT SELECT ON scrap_gadget_popular_components TO authenticated;

-- Grant execute on utility functions
GRANT EXECUTE ON FUNCTION get_cache_stats TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if tables were created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('scrap_gadget_devices', 'scrap_gadget_device_components', 'scrap_gadget_component_details')
  ) THEN
    RAISE NOTICE '✅ ScrapGadget tables created successfully!';
  ELSE
    RAISE WARNING '⚠️ Some tables may not have been created';
  END IF;
END $$;

-- Display sample data count
DO $$
DECLARE
  device_count INTEGER;
  component_link_count INTEGER;
  component_detail_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO device_count FROM scrap_gadget_devices;
  SELECT COUNT(*) INTO component_link_count FROM scrap_gadget_device_components;
  SELECT COUNT(*) INTO component_detail_count FROM scrap_gadget_component_details;
  
  RAISE NOTICE 'Sample data inserted:';
  RAISE NOTICE '  - Devices: %', device_count;
  RAISE NOTICE '  - Component links: %', component_link_count;
  RAISE NOTICE '  - Component details: %', component_detail_count;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMENT ON SCHEMA public IS 'v0.7 ScrapGadget caching tables migration applied';
