/**
 * SCRAPGADGET DATABASE LOOKUP MODULE
 * 
 * Helper functions for checking ScrapGadget database before expensive AI calls
 * Import this into identify-component/index.ts
 */

export interface QuickIdentificationResult {
  brand: string | null;
  model: string | null;
  deviceName: string | null;
  confidence: number;
}

export interface ScrapGadgetResult {
  gadget: any;
  components: any[];
}

// AI Provider type (must match main module)
type AIProvider = 'openai' | 'gemini' | 'claude';

/**
 * Quick AI call to identify just the brand and model
 * This is much cheaper than full component identification
 * Cost: ~$0.0001 vs $0.002-0.01 for full analysis
 */
export async function quickIdentifyDevice(
  callAI: (provider: AIProvider, apiKey: string, systemPrompt: string, userContent: any[]) => Promise<any>,
  provider: AIProvider,
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<QuickIdentificationResult> {
  console.log('[QuickID] Starting quick device identification...');
  const startTime = Date.now();
  
  const quickPrompt = `You are a device identification expert. Analyze this image and identify ONLY:
1. Brand/Manufacturer (e.g., "Bose", "Apple", "Logitech", "Sony", "JBL")
2. Model number or model name (e.g., "SoundLink Mini II", "G502", "AirPods Pro", "WH-1000XM4")
3. Full device name (e.g., "Bose SoundLink Mini II Bluetooth Speaker")

Look for:
- Brand logos and text
- Model numbers printed on the device
- Distinctive design features
- Product labels and stickers

Return ONLY valid JSON (no markdown, no code fences):
{
  "brand": "Brand Name" or null,
  "model": "Model Name/Number" or null,
  "device_name": "Full Device Name" or null,
  "confidence": 0.0-1.0
}

Be as specific as possible. If you see "SoundLink Mini II" write exactly that, not just "SoundLink". Return null if you cannot identify.`;

  const userContent = [
    { type: 'text', text: 'Identify the brand and model of this device.' },
    {
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${imageBase64}`,
        detail: 'low'
      }
    }
  ];

  try {
    const result = await callAI(provider, apiKey, quickPrompt, userContent);
    
    // Parse JSON from response
    let parsed;
    try {
      const content = result.content.trim();
      // Remove markdown code fences if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1] || content);
    } catch (e) {
      console.error('[QuickID] Failed to parse JSON:', result.content);
      return { brand: null, model: null, deviceName: null, confidence: 0 };
    }
    
    console.log(`[QuickID] ✅ Completed in ${Date.now() - startTime}ms`);
    console.log(`[QuickID] Result: ${parsed.brand} ${parsed.model} (confidence: ${parsed.confidence})`);
    
    return {
      brand: parsed.brand || null,
      model: parsed.model || null,
      deviceName: parsed.device_name || null,
      confidence: parsed.confidence || 0.5
    };
  } catch (error) {
    console.error('[QuickID] Error:', error);
    return { brand: null, model: null, deviceName: null, confidence: 0 };
  }
}

/**
 * Search ScrapGadget database for matching device
 * Uses full-text search with brand/model filters
 */
export async function searchScrapGadgetDB(
  supabase: any,
  brand: string | null,
  model: string | null,
  deviceName: string | null,
  userHint?: string
): Promise<ScrapGadgetResult | null> {
  console.log('[ScrapGadgetDB] Searching database...');
  const startTime = Date.now();
  
  // Build search query
  let searchQuery = '';
  if (deviceName) searchQuery += deviceName + ' ';
  if (brand) searchQuery += brand + ' ';
  if (model) searchQuery += model + ' ';
  if (userHint) searchQuery += userHint + ' ';
  searchQuery = searchQuery.trim();
  
  if (!searchQuery || searchQuery.length < 3) {
    console.log('[ScrapGadgetDB] Query too short, skipping database lookup');
    return null;
  }
  
  console.log(`[ScrapGadgetDB] Query: "${searchQuery}"`);
  console.log(`[ScrapGadgetDB] Filters: brand="${brand}", model="${model}"`);
  
  try {
    // Call the search function from our migration
    const { data, error } = await supabase.rpc('search_scrap_gadgets', {
      search_query: searchQuery,
      search_brand: brand,
      search_model: model,
      limit_results: 5
    });
    
    if (error) {
      console.error('[ScrapGadgetDB] Search error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`[ScrapGadgetDB] ❌ No matches found (${Date.now() - startTime}ms)`);
      return null;
    }
    
    // Log all matches found
    console.log(`[ScrapGadgetDB] Found ${data.length} potential matches:`);
    data.forEach((match: any, idx: number) => {
      console.log(`  ${idx + 1}. ${match.device_name} (score: ${match.similarity_score.toFixed(3)})`);
    });
    
    // Get the best match (highest similarity score)
    const bestMatch = data[0];
    
    // Confidence threshold - only use if similarity is decent
    if (bestMatch.similarity_score < 0.05) {
      console.log(`[ScrapGadgetDB] ❌ Best match score too low (${bestMatch.similarity_score.toFixed(3)}), rejecting`);
      return null;
    }
    
    // Fetch full gadget data with all components
    const { data: fullData, error: fetchError } = await supabase.rpc('get_gadget_breakdown', {
      gadget_uuid: bestMatch.id
    });
    
    if (fetchError || !fullData) {
      console.error('[ScrapGadgetDB] Failed to fetch full breakdown:', fetchError);
      return null;
    }
    
    const elapsedTime = Date.now() - startTime;
    console.log(`[ScrapGadgetDB] ✅ MATCH FOUND: "${fullData.gadget.device_name}" (${elapsedTime}ms)`);
    console.log(`[ScrapGadgetDB] Components: ${fullData.components.length} items`);
    console.log(`[ScrapGadgetDB] Cost saved: ~$0.002-0.01`);
    
    return {
      gadget: fullData.gadget,
      components: fullData.components || []
    };
    
  } catch (error) {
    console.error('[ScrapGadgetDB] Unexpected error:', error);
    return null;
  }
}

/**
 * Convert ScrapGadget database result to AI response format
 * This makes the database result look identical to an AI response
 */
export function convertScrapGadgetToAIResponse(gadget: any, components: any[]): any {
  console.log('[ScrapGadgetDB] Converting to AI response format...');
  
  const calculateDepreciatedValue = (
    newValue: number,
    depreciationRate: number,
    ageYears: number,
    range: 'low' | 'high'
  ): number => {
    if (!newValue) return 0;
    const multiplier = range === 'low' ? 0.3 : 0.7;
    const depreciated = newValue * (1 - depreciationRate * ageYears);
    const value = Math.max(0.01, depreciated * multiplier);
    return Math.round(value * 100) / 100;
  };
  
  const deviceAge = gadget.estimated_device_age_years || 3;
  
  const items = components.map((comp: any) => ({
    component_name: comp.component_name,
    category: comp.category,
    specifications: comp.specifications || {},
    technical_specs: comp.technical_specs || {},
    reusability_score: comp.reusability_score,
    estimated_age_years: deviceAge,
    market_value_new: comp.market_value_new,
    depreciation_rate: comp.depreciation_rate || 0.15,
    market_value_low: calculateDepreciatedValue(
      comp.market_value_new,
      comp.depreciation_rate || 0.15,
      deviceAge,
      'low'
    ),
    market_value_high: calculateDepreciatedValue(
      comp.market_value_new,
      comp.depreciation_rate || 0.15,
      deviceAge,
      'high'
    ),
    condition: 'Good',
    confidence: comp.confidence || 0.92,
    description: comp.description,
    common_uses: comp.common_uses || [],
    quantity: comp.quantity || 1
  }));
  
  const totalValueLow = items.reduce((sum: number, item: any) => sum + (item.market_value_low || 0), 0);
  const totalValueHigh = items.reduce((sum: number, item: any) => sum + (item.market_value_high || 0), 0);
  
  return {
    parent_object: gadget.device_name,
    estimated_device_age_years: deviceAge,
    items: items,
    total_estimated_value_low: Math.round(totalValueLow * 100) / 100,
    total_estimated_value_high: Math.round(totalValueHigh * 100) / 100,
    salvage_difficulty: gadget.disassembly_difficulty || 'Medium',
    tools_needed: gadget.tools_required || [],
    disassembly: {
      steps: gadget.disassembly_steps || [
        "Refer to iFixit or manufacturer teardown guide for detailed disassembly steps.",
        "This device is cataloged in our database with verified component information."
      ],
      difficulty: gadget.disassembly_difficulty || 'Medium',
      time_estimate: gadget.disassembly_time_estimate || '20-30 minutes',
      injury_risk: gadget.injury_risk || 'Low',
      damage_risk: gadget.damage_risk || 'Medium',
      safety_warnings: gadget.safety_warnings || [],
      tutorial_url: gadget.ifixit_url || null,
      video_url: gadget.youtube_teardown_url || null
    },
    message: `✅ Found in ScrapGadget Database! This is a verified device with ${components.length} known components.`,
    from_database: true,
    verified: gadget.verified || false,
    gadget_id: gadget.id
  };
}

/**
 * Log analytics for ScrapGadget matches
 * Tracks cost savings and match effectiveness
 */
export async function logScrapGadgetMatch(
  supabase: any,
  userId: string | undefined,
  gadgetId: string | null,
  imageHash: string | undefined,
  matchType: 'exact_match' | 'fuzzy_match' | 'ai_fallback' | 'cache_hit',
  matchConfidence: number,
  costSavedUsd: number,
  responseTimeMs: number
): Promise<void> {
  try {
    await supabase
      .from('scrap_gadget_match_log')
      .insert({
        user_id: userId || null,
        gadget_id: gadgetId,
        image_hash: imageHash || null,
        match_type: matchType,
        match_confidence: matchConfidence,
        cost_saved_usd: costSavedUsd,
        response_time_ms: responseTimeMs
      });
    
    console.log(`[Analytics] Logged: ${matchType}, saved: $${costSavedUsd.toFixed(6)}, time: ${responseTimeMs}ms`);
  } catch (error) {
    console.error('[Analytics] Failed to log match:', error);
  }
}
