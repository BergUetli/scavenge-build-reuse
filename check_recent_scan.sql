-- Query to check your most recent scan
-- Run this in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/ceccmwopwtjvtkdeayrk/sql

SELECT 
  id,
  component_name,
  category,
  confidence,
  scanned_at,
  -- Check if it came from ScrapGadget database or AI
  CASE 
    WHEN ai_response->>'data_source' = 'scrapgadget_db' THEN 'ScrapGadget Database'
    WHEN ai_response->>'data_source' = 'scrapgadget' THEN 'ScrapGadget Database'
    WHEN ai_response->'source'->>'type' = 'scrapgadget' THEN 'ScrapGadget Database'
    WHEN ai_response->>'provider' IS NOT NULL THEN CONCAT('AI (', ai_response->>'provider', ')')
    ELSE 'Unknown'
  END as data_source,
  -- Show provider if it was AI
  ai_response->>'provider' as ai_provider,
  ai_response->>'model' as ai_model,
  -- Show if it was from database
  ai_response->'scrapgadget_match' as scrapgadget_info,
  -- Show full AI response for debugging
  ai_response
FROM scan_history
ORDER BY scanned_at DESC
LIMIT 1;
