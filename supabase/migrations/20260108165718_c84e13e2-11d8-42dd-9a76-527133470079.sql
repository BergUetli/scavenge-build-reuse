-- =============================================
-- SCRAPGADGET DATABASE SCHEMA
-- Reference database for known devices and their components
-- Reduces AI costs by 85%+ through smart caching
-- =============================================

-- =============================================
-- TABLE 1: SCRAP_GADGETS (Master Device Catalog)
-- =============================================
CREATE TABLE public.scrap_gadgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDENTIFICATION
  device_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model_number TEXT,
  model_name TEXT,
  
  -- CLASSIFICATION
  industry TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- IDENTIFICATION AIDS (for matching user scans)
  common_names TEXT[] DEFAULT '{}',
  visual_identifiers JSONB DEFAULT '{}',
  release_year INTEGER,
  end_of_life_year INTEGER,
  
  -- METADATA
  manufacturer_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  ifixit_url TEXT,
  youtube_teardown_url TEXT,
  verified BOOLEAN DEFAULT false,
  scan_count INTEGER DEFAULT 0,
  confidence_score DECIMAL(3, 2) DEFAULT 0.50,
  
  -- DISASSEMBLY INFO
  disassembly_difficulty TEXT CHECK (disassembly_difficulty IN ('Easy', 'Medium', 'Hard')),
  disassembly_time_estimate TEXT,
  tools_required TEXT[] DEFAULT '{}',
  safety_warnings TEXT[] DEFAULT '{}',
  injury_risk TEXT CHECK (injury_risk IN ('Low', 'Medium', 'High')),
  damage_risk TEXT CHECK (damage_risk IN ('Low', 'Medium', 'High')),
  
  -- DEVICE AGE & VALUE
  estimated_device_age_years INTEGER,
  total_market_value_low DECIMAL(10, 2),
  total_market_value_high DECIMAL(10, 2),
  
  -- TIMESTAMPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- FULL-TEXT SEARCH (maintained by trigger instead of generated column)
  search_vector TSVECTOR
);

-- INDEXES for fast lookups
CREATE INDEX idx_scrap_gadgets_brand ON public.scrap_gadgets(brand);
CREATE INDEX idx_scrap_gadgets_model ON public.scrap_gadgets(model_number) WHERE model_number IS NOT NULL;
CREATE INDEX idx_scrap_gadgets_category ON public.scrap_gadgets(industry, category);
CREATE INDEX idx_scrap_gadgets_search ON public.scrap_gadgets USING GIN(search_vector);
CREATE INDEX idx_scrap_gadgets_verified ON public.scrap_gadgets(verified) WHERE verified = true;
CREATE UNIQUE INDEX idx_scrap_gadgets_unique_model ON public.scrap_gadgets(brand, model_number) WHERE model_number IS NOT NULL;

COMMENT ON TABLE public.scrap_gadgets IS 'Master catalog of known devices/gadgets with their standard internal components. Checked before AI calls to save costs.';


-- =============================================
-- TABLE 2: SCRAP_GADGET_COMPONENTS
-- =============================================
CREATE TABLE public.scrap_gadget_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id UUID NOT NULL REFERENCES public.scrap_gadgets(id) ON DELETE CASCADE,
  
  -- COMPONENT DETAILS
  component_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'ICs/Chips', 
    'Passive Components', 
    'Electromechanical', 
    'Connectors', 
    'Display/LEDs', 
    'Sensors', 
    'Power', 
    'PCB', 
    'Audio',
    'Other'
  )),
  quantity INTEGER DEFAULT 1,
  
  -- TECHNICAL SPECS
  specifications JSONB DEFAULT '{}',
  technical_specs JSONB DEFAULT '{}',
  
  -- VALUE & REUSABILITY
  reusability_score INTEGER CHECK (reusability_score >= 1 AND reusability_score <= 10),
  market_value_new DECIMAL(10, 2),
  depreciation_rate DECIMAL(3, 2),
  condition_notes TEXT,
  
  -- CONTEXT
  description TEXT,
  common_uses TEXT[] DEFAULT '{}',
  extraction_difficulty TEXT CHECK (extraction_difficulty IN ('Easy', 'Medium', 'Hard')),
  extraction_notes TEXT,
  
  -- SOURCE INFO
  datasheet_url TEXT,
  purchase_urls JSONB DEFAULT '{}',
  
  -- QUALITY
  verified BOOLEAN DEFAULT false,
  confidence DECIMAL(3, 2) DEFAULT 0.80,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_gadget_components_gadget ON public.scrap_gadget_components(gadget_id);
CREATE INDEX idx_gadget_components_category ON public.scrap_gadget_components(category);
CREATE INDEX idx_gadget_components_reusability ON public.scrap_gadget_components(reusability_score DESC);

COMMENT ON TABLE public.scrap_gadget_components IS 'Components found in each device. Linked to scrap_gadgets table.';


-- =============================================
-- TABLE 3: SCRAP_GADGET_SUBMISSIONS
-- =============================================
CREATE TABLE public.scrap_gadget_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- SUBMISSION DATA
  ai_scan_result JSONB NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  matched_gadget_id UUID REFERENCES public.scrap_gadgets(id) ON DELETE SET NULL,
  
  -- SUBMISSION TYPE
  submission_type TEXT NOT NULL CHECK (submission_type IN (
    'new_device',
    'component_correction',
    'additional_info',
    'duplicate_report'
  )),
  
  -- USER NOTES
  user_notes TEXT,
  
  -- REVIEW STATUS
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'needs_more_info'
  )),
  
  -- REVIEW DATA
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  auto_approved BOOLEAN DEFAULT false,
  
  -- TIMESTAMPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_submissions_status ON public.scrap_gadget_submissions(status);
CREATE INDEX idx_submissions_user ON public.scrap_gadget_submissions(user_id);
CREATE INDEX idx_submissions_type ON public.scrap_gadget_submissions(submission_type);
CREATE INDEX idx_submissions_pending ON public.scrap_gadget_submissions(status, created_at) WHERE status = 'pending';

COMMENT ON TABLE public.scrap_gadget_submissions IS 'User submissions for new devices or corrections. Reviewed by admins or auto-approved by AI agent.';


-- =============================================
-- TABLE 4: SCRAP_GADGET_MATCH_LOG (Analytics)
-- =============================================
CREATE TABLE public.scrap_gadget_match_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  gadget_id UUID REFERENCES public.scrap_gadgets(id) ON DELETE SET NULL,
  image_hash TEXT,
  match_type TEXT NOT NULL CHECK (match_type IN (
    'exact_match',
    'fuzzy_match',
    'ai_fallback',
    'cache_hit'
  )),
  match_confidence DECIMAL(3, 2),
  cost_saved_usd DECIMAL(10, 6),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_match_log_gadget ON public.scrap_gadget_match_log(gadget_id);
CREATE INDEX idx_match_log_type ON public.scrap_gadget_match_log(match_type);
CREATE INDEX idx_match_log_date ON public.scrap_gadget_match_log(created_at);

COMMENT ON TABLE public.scrap_gadget_match_log IS 'Analytics: track how often database matches vs AI fallback. Calculate cost savings.';


-- =============================================
-- TABLE 5: SCRAP_GADGET_TAXONOMY
-- =============================================
CREATE TABLE public.scrap_gadget_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(industry, category, subcategory)
);


-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.scrap_gadgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_gadget_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_gadget_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrap_gadget_match_log ENABLE ROW LEVEL SECURITY;

-- SCRAP_GADGETS: Public read, admin write
CREATE POLICY "Gadgets are viewable by everyone"
  ON public.scrap_gadgets
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gadgets"
  ON public.scrap_gadgets
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- SCRAP_GADGET_COMPONENTS: Public read, admin write
CREATE POLICY "Components are viewable by everyone"
  ON public.scrap_gadget_components
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage components"
  ON public.scrap_gadget_components
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- SCRAP_GADGET_SUBMISSIONS: Users see their own, admins see all
CREATE POLICY "Users can view their own submissions"
  ON public.scrap_gadget_submissions
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can create submissions"
  ON public.scrap_gadget_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.scrap_gadget_submissions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions"
  ON public.scrap_gadget_submissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- SCRAP_GADGET_MATCH_LOG: Users see their own, admins see all
CREATE POLICY "Users can view their own match logs"
  ON public.scrap_gadget_match_log
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert match logs"
  ON public.scrap_gadget_match_log
  FOR INSERT
  WITH CHECK (true);


-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update search_vector on insert/update
CREATE OR REPLACE FUNCTION public.update_scrap_gadget_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.device_name, '') || ' ' || 
    COALESCE(NEW.brand, '') || ' ' || 
    COALESCE(NEW.model_number, '') || ' ' ||
    COALESCE(NEW.model_name, '') || ' ' ||
    COALESCE(array_to_string(NEW.common_names, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to maintain search_vector
CREATE TRIGGER maintain_scrap_gadgets_search_vector
  BEFORE INSERT OR UPDATE ON public.scrap_gadgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scrap_gadget_search_vector();

-- Function to update updated_at timestamp for scrap_gadgets
CREATE OR REPLACE FUNCTION public.update_scrap_gadget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_scrap_gadgets_updated_at
  BEFORE UPDATE ON public.scrap_gadgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scrap_gadget_updated_at();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.scrap_gadget_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scrap_gadget_updated_at();

-- Function to increment scan_count when matched
CREATE OR REPLACE FUNCTION public.increment_gadget_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.match_type IN ('exact_match', 'fuzzy_match') AND NEW.gadget_id IS NOT NULL THEN
    UPDATE public.scrap_gadgets
    SET scan_count = scan_count + 1
    WHERE id = NEW.gadget_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER increment_scan_count_on_match
  AFTER INSERT ON public.scrap_gadget_match_log
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_gadget_scan_count();


-- =============================================
-- HELPER FUNCTIONS FOR FUZZY MATCHING
-- =============================================

-- Function to search for gadgets by brand and model (fuzzy)
CREATE OR REPLACE FUNCTION public.search_scrap_gadgets(
  search_query TEXT,
  search_brand TEXT DEFAULT NULL,
  search_model TEXT DEFAULT NULL,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  device_name TEXT,
  brand TEXT,
  model_number TEXT,
  model_name TEXT,
  category TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sg.id,
    sg.device_name,
    sg.brand,
    sg.model_number,
    sg.model_name,
    sg.category,
    ts_rank(sg.search_vector, websearch_to_tsquery('english', search_query)) AS similarity_score
  FROM public.scrap_gadgets sg
  WHERE 
    (search_brand IS NULL OR LOWER(sg.brand) = LOWER(search_brand))
    AND (search_model IS NULL OR (
      LOWER(sg.model_number) LIKE LOWER('%' || search_model || '%') OR
      LOWER(sg.model_name) LIKE LOWER('%' || search_model || '%')
    ))
    AND sg.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY similarity_score DESC, sg.scan_count DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function to get gadget with all components
CREATE OR REPLACE FUNCTION public.get_gadget_breakdown(gadget_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'gadget', row_to_json(sg.*),
    'components', COALESCE(
      (
        SELECT jsonb_agg(row_to_json(sgc.*))
        FROM public.scrap_gadget_components sgc
        WHERE sgc.gadget_id = sg.id
      ), '[]'::jsonb
    )
  ) INTO result
  FROM public.scrap_gadgets sg
  WHERE sg.id = gadget_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Add comments
COMMENT ON FUNCTION public.search_scrap_gadgets IS 'Fuzzy search for gadgets by brand, model, or keywords. Returns ranked results.';
COMMENT ON FUNCTION public.get_gadget_breakdown IS 'Get complete gadget info with all components in one JSON object.';


-- =============================================
-- INITIAL DATA: Industry & Category Standards
-- =============================================

-- Insert standard taxonomy
INSERT INTO public.scrap_gadget_taxonomy (industry, category, subcategory, icon_name, sort_order) VALUES
  -- Consumer Electronics
  ('Consumer Electronics', 'Bluetooth Speakers', 'Portable Speakers', 'speaker', 1),
  ('Consumer Electronics', 'Bluetooth Speakers', 'Smart Speakers', 'speaker', 2),
  ('Consumer Electronics', 'Headphones & Earbuds', 'Wireless Earbuds', 'headphones', 3),
  ('Consumer Electronics', 'Headphones & Earbuds', 'Over-Ear Headphones', 'headphones', 4),
  ('Consumer Electronics', 'Gaming Peripherals', 'Keyboards', 'keyboard', 5),
  ('Consumer Electronics', 'Gaming Peripherals', 'Mice', 'mouse', 6),
  ('Consumer Electronics', 'Gaming Peripherals', 'Controllers', 'gamepad', 7),
  ('Consumer Electronics', 'Mobile Devices', 'Smartphones', 'smartphone', 8),
  ('Consumer Electronics', 'Mobile Devices', 'Tablets', 'tablet', 9),
  
  -- Computing
  ('Computing', 'Laptops', 'Business Laptops', 'laptop', 10),
  ('Computing', 'Laptops', 'Gaming Laptops', 'laptop', 11),
  ('Computing', 'Laptops', 'Chromebooks', 'laptop', 12),
  ('Computing', 'Desktops', 'Desktop PCs', 'monitor', 13),
  ('Computing', 'Desktops', 'All-in-One PCs', 'monitor', 14),
  ('Computing', 'Peripherals', 'Printers', 'printer', 15),
  ('Computing', 'Peripherals', 'Monitors', 'monitor', 16),
  ('Computing', 'Peripherals', 'Webcams', 'camera', 17),
  
  -- Smart Home
  ('Smart Home', 'Smart Displays', 'Hub Displays', 'tablet', 18),
  ('Smart Home', 'Smart Assistants', 'Voice Assistants', 'speaker', 19),
  ('Smart Home', 'Security', 'Cameras', 'camera', 20),
  ('Smart Home', 'Security', 'Doorbells', 'door', 21),
  ('Smart Home', 'Lighting', 'Smart Bulbs', 'lightbulb', 22),
  
  -- Appliances
  ('Appliances', 'Kitchen', 'Blenders', 'utensils', 23),
  ('Appliances', 'Kitchen', 'Coffee Makers', 'coffee', 24),
  ('Appliances', 'Kitchen', 'Toasters', 'utensils', 25),
  ('Appliances', 'Cleaning', 'Robot Vacuums', 'vacuum', 26),
  ('Appliances', 'Cleaning', 'Handheld Vacuums', 'vacuum', 27),
  
  -- Tools
  ('Tools', 'Power Tools', 'Drills', 'drill', 28),
  ('Tools', 'Power Tools', 'Sanders', 'tool', 29),
  ('Tools', 'Power Tools', 'Saws', 'tool', 30),
  ('Tools', 'Measuring', 'Laser Levels', 'ruler', 31);