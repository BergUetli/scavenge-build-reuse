/**
 * SCAVENGER AI IDENTIFICATION EDGE FUNCTION
 * 
 * Multi-provider AI component identification with vision capabilities.
 * Supports: OpenAI (gpt-4o-mini), Google Gemini, Anthropic Claude
 * 
 * Cost optimizations:
 * - Uses cheaper models by default (gpt-4o-mini, gemini-1.5-flash, claude-3-haiku)
 * - Caches results by image hash (scan_cache table)
 * - Uses 'low' detail for pre-compressed images
 * - Reduced max_tokens
 * 
 * Supports multiple images for better identification accuracy.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported AI providers
type AIProvider = 'openai' | 'gemini' | 'claude';

interface ProviderConfig {
  apiKey: string | undefined;
  envVar: string;
  name: string;
}

function getProviderConfigs(): Record<AIProvider, ProviderConfig> {
  return {
    openai: {
      apiKey: Deno.env.get('OPENAI_API_KEY'),
      envVar: 'OPENAI_API_KEY',
      name: 'OpenAI GPT-4o-mini'
    },
    gemini: {
      apiKey: Deno.env.get('GOOGLE_AI_API_KEY'),
      envVar: 'GOOGLE_AI_API_KEY', 
      name: 'Google Gemini 1.5 Flash'
    },
    claude: {
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
      envVar: 'ANTHROPIC_API_KEY',
      name: 'Anthropic Claude 3 Haiku'
    }
  };
}

// Get the first available provider
function getAvailableProvider(): { provider: AIProvider; config: ProviderConfig } | null {
  const configs = getProviderConfigs();
  
  // Check in order of preference (cheapest first)
  const preferenceOrder: AIProvider[] = ['gemini', 'openai', 'claude'];
  
  for (const provider of preferenceOrder) {
    if (configs[provider].apiKey) {
      return { provider, config: configs[provider] };
    }
  }
  return null;
}

// Call OpenAI API
async function callOpenAI(apiKey: string, systemPrompt: string, userContent: any[]): Promise<string> {
  console.log('[OpenAI] Calling GPT-4o-mini...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenAI] API error:', response.status, errorText);
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Call Google Gemini API
async function callGemini(apiKey: string, systemPrompt: string, userContent: any[]): Promise<string> {
  console.log('[Gemini] Calling Gemini 1.5 Flash...');
  
  // Build Gemini-formatted content
  const parts: any[] = [{ text: systemPrompt + '\n\n' + userContent[0].text }];
  
  // Add images
  for (let i = 1; i < userContent.length; i++) {
    if (userContent[i].type === 'image_url') {
      const imageUrl = userContent[i].image_url.url;
      const base64Match = imageUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (base64Match) {
        parts.push({
          inline_data: {
            mime_type: base64Match[1],
            data: base64Match[2]
          }
        });
      }
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: 6000,
          temperature: 0.2
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini] API error:', response.status, errorText);
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Call Anthropic Claude API
async function callClaude(apiKey: string, systemPrompt: string, userContent: any[]): Promise<string> {
  console.log('[Claude] Calling Claude 3 Haiku...');
  
  // Build Claude-formatted content
  const content: any[] = [];
  
  // Add text
  content.push({ type: 'text', text: userContent[0].text });
  
  // Add images
  for (let i = 1; i < userContent.length; i++) {
    if (userContent[i].type === 'image_url') {
      const imageUrl = userContent[i].image_url.url;
      const base64Match = imageUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (base64Match) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: base64Match[1],
            data: base64Match[2]
          }
        });
      }
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Claude] API error:', response.status, errorText);
    throw new Error(`Claude error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// Main AI call dispatcher
async function callAI(
  provider: AIProvider,
  apiKey: string,
  systemPrompt: string,
  userContent: any[]
): Promise<string> {
  switch (provider) {
    case 'openai':
      return callOpenAI(apiKey, systemPrompt, userContent);
    case 'gemini':
      return callGemini(apiKey, systemPrompt, userContent);
    case 'claude':
      return callClaude(apiKey, systemPrompt, userContent);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Generate the identification prompt with configurable component limits
function getIdentificationPrompt(minComponents: number, maxComponents: number): string {
  return `You are Scavenger AI, an expert at identifying salvageable components from electronics, devices, and materials.

Your task is to analyze the provided image(s) and BREAK DOWN the object into its individual salvageable internal components.

CRITICAL: IDENTIFY AS MANY COMPONENTS AS POSSIBLE!
For a typical electronic device, you should identify ${minComponents}-${maxComponents}+ components. Be THOROUGH - don't just list the obvious ones!

IMPORTANT RULES:
1. If multiple images are provided, they show the SAME OBJECT from different angles - combine the information
2. If the image shows a device (keyboard, phone, laptop, appliance, etc.), list ALL INTERNAL components that could be harvested
3. IGNORE: plastic casing, screws, rubber feet, labels, packaging, structural plastic parts
4. FOCUS ON: chips, ICs, capacitors, resistors, motors, switches, LEDs, displays, sensors, connectors, cables, PCBs, batteries, speakers, antennas, etc.
5. Estimate QUANTITIES for repeated components (e.g., "~50 mechanical switches" for a keyboard)
6. Group similar components when there are many (e.g., "SMD Capacitors (various values)" rather than listing each)
7. YOU MUST IDENTIFY AT LEAST ${minComponents} COMPONENTS - look harder if you haven't found that many!

EXAMPLE - For a Bluetooth speaker, identify ALL of these:
- Bluetooth/WiFi module (CSR, Qualcomm, etc.)
- Audio amplifier IC (TI, Maxim, etc.)
- Digital Signal Processor (DSP) chip
- Main speaker driver(s)
- Passive radiator(s)
- Lithium-ion battery
- Battery protection circuit/BMS
- Battery charging IC
- Power management IC
- USB Type-C/Micro-USB charging port
- AUX input jack (3.5mm)
- Control buttons / tactile switches
- LED indicators
- Antenna (PCB or wire antenna)
- Main PCB (with SMD components)
- Electrolytic capacitors
- SMD capacitors/resistors
- Ribbon cables/connectors

For EACH salvageable component inside the object, provide:
1. component_name: Specific name with quantity if applicable (e.g., "Full-Range Speaker Driver (2 pcs)", "CSR8675 Bluetooth Audio Module")
2. category: One of: ICs/Chips, Passive Components, Electromechanical, Connectors, Display/LEDs, Sensors, Power, PCB, Other
3. specifications: Key specs as object (e.g., {"type": "Class D Amplifier", "power": "10W"} or {"capacity": "1000mAh", "voltage": "3.7V"})
4. technical_specs: CRITICAL - identify specific parts for lookup:
   - voltage: Operating voltage (e.g., "5V", "3.3V", "12V") - CRITICAL for rebuilding
   - power_rating: Power/current specs (e.g., "500mA", "10W", "2A") - CRITICAL for rebuilding  
   - part_number: IC/chip part number - LOOK CAREFULLY at chip markings! Read text printed on ICs/chips. If not visible, INFER likely parts based on device brand/type:
     * Bose speakers: likely use TI TPA3116/TPA3118 amp, CSR8675 BT, BQ24195 charger
     * JBL speakers: likely use Harman DSP, Qualcomm QCC series BT
     * Sony speakers: likely use custom Sony chips
   - notes: One-line tip for reuse
5. source_info: For user lookup:
   - datasheet_url: Link to datasheet if you know it (e.g., ti.com, st.com, microchip.com datasheets)
   - purchase_url: Where to buy (Digi-Key, Mouser, LCSC)
6. reusability_score: 1-10 based on how useful for DIY projects (10 = Arduino, ESP32, OLED displays; 1 = proprietary chips)
7. market_value_low: Estimated low value in USD for the quantity
8. market_value_high: Estimated high value in USD for the quantity
9. condition: New, Good, Fair, or For Parts
10. confidence: Your confidence in identification (0.0 to 1.0)
11. description: What this component does and why it's useful for makers
12. common_uses: Array of 3-5 project ideas this could enable
13. quantity: Estimated count (number, use 1 if single item)

CRITICAL FOR TECHNICAL SPECS - READ THIS CAREFULLY:
- For ICs/Chips: ALWAYS try to identify the part_number! Look at chip markings, read any text on the IC package
- Common ICs to look for: microcontrollers (STM32, ATmega, ESP32, PIC), USB controllers, audio codecs, power management ICs, LED drivers, motor drivers, Bluetooth/WiFi modules
- If you recognize the device brand/type, INFER likely chips even if not directly visible
- For passive components: focus on voltage/current ratings
- For source_info: include datasheet URLs from official sources (ti.com, st.com, microchip.com, analog.com, nxp.com, infineon.com)

ALSO PROVIDE DISASSEMBLY INSTRUCTIONS for the parent object:
- steps: Array of clear, numbered steps to safely disassemble and extract components
- difficulty: Easy (snap-fit, no tools), Medium (screws, basic tools), Hard (glued, soldering required)
- time_estimate: How long it takes (e.g., "5-10 minutes", "30 minutes - 1 hour")
- injury_risk: Risk of injury during disassembly - Low (safe, no sharp edges), Medium (sharp edges, spring tension), High (high voltage, toxic materials, explosion risk)
- damage_risk: Risk of damaging components during extraction - Low (easy to remove intact), Medium (requires care), High (fragile, likely to break)
- safety_warnings: Array of safety concerns (e.g., "Disconnect battery first", "Capacitors may hold charge")
- tutorial_url: Link to a disassembly guide if one exists (iFixit, YouTube, etc.) - only include if confident it exists
- video_url: Link to video tutorial if known

ALWAYS respond with valid JSON:
{
  "parent_object": "string (what the main object is, e.g., 'Bose SoundLink Mini Bluetooth Speaker')",
  "items": [
    {
      "component_name": "string",
      "category": "string",
      "specifications": {},
      "technical_specs": {
        "voltage": "string or null",
        "power_rating": "string or null",
        "part_number": "string or null",
        "notes": "string or null"
      },
      "source_info": {
        "datasheet_url": "string or null", 
        "purchase_url": "string or null"
      },
      "reusability_score": number,
      "market_value_low": number,
      "market_value_high": number,
      "condition": "string",
      "confidence": number,
      "description": "string",
      "common_uses": ["string"],
      "quantity": number
    }
  ],
  "total_estimated_value_low": number,
  "total_estimated_value_high": number,
  "salvage_difficulty": "Easy | Medium | Hard",
  "tools_needed": ["string array of tools needed to disassemble"],
  "disassembly": {
    "steps": ["Step 1: ...", "Step 2: ...", ...],
    "difficulty": "Easy | Medium | Hard",
    "time_estimate": "string",
    "injury_risk": "Low | Medium | High",
    "damage_risk": "Low | Medium | High",
    "safety_warnings": ["string array"] or null,
    "tutorial_url": "string or null",
    "video_url": "string or null"
  },
  "message": "string (optional tips or warnings)"
}`;
}
function extractJsonFromAI(aiResponse: string) {
  let text = aiResponse.trim();
  
  // Remove markdown fences (handle incomplete closing fence too)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)(?:\s*```|$)/i);
  if (fenceMatch?.[1]) text = fenceMatch[1].trim();

  try {
    return JSON.parse(text);
  } catch (e1) {
    console.log('[JSON] Initial parse failed, attempting repair...');
    
    // Find the JSON object boundaries
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) {
      throw new Error('No JSON object found in AI response');
    }
    
    let candidate = text.slice(firstBrace);
    
    // Try parsing as-is first
    try {
      return JSON.parse(candidate);
    } catch (e2) {
      // Attempt to repair truncated JSON
      console.log('[JSON] Attempting to repair truncated JSON...');
      candidate = repairTruncatedJson(candidate);
      return JSON.parse(candidate);
    }
  }
}

/**
 * Attempt to repair truncated JSON by closing open brackets/braces
 */
function repairTruncatedJson(json: string): string {
  // Track open brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }
  
  // If we're in a string, close it
  if (inString) {
    // Find the last quote and truncate incomplete string values
    const lastQuote = json.lastIndexOf('"');
    if (lastQuote > 0) {
      // Check if this is a key or value - look for patterns like "key": "incomplete
      const beforeQuote = json.substring(0, lastQuote);
      const colonQuoteMatch = beforeQuote.match(/:\s*$/);
      if (colonQuoteMatch) {
        // We're in a value string, close it with empty/null
        json = beforeQuote + 'null';
      } else {
        json = json.substring(0, lastQuote + 1);
      }
    }
    // Recalculate after truncation
    return repairTruncatedJson(json);
  }
  
  // Remove trailing commas before closing
  json = json.replace(/,\s*$/, '');
  
  // Close any open structures
  let closing = '';
  for (let i = 0; i < openBrackets; i++) closing += ']';
  for (let i = 0; i < openBraces; i++) closing += '}';
  
  console.log(`[JSON] Repaired by closing ${openBrackets} brackets and ${openBraces} braces`);
  return json + closing;
}

/**
 * Extract partial information from raw AI response when JSON parsing fails
 */
function extractPartialInfo(text: string): Record<string, string | null> {
  const partialInfo: Record<string, string | null> = {};
  
  // Try to detect brand mentions
  const brandPatterns = [
    /brand[:\s]+["']?([A-Za-z0-9\s]+)["']?/i,
    /manufacturer[:\s]+["']?([A-Za-z0-9\s]+)["']?/i,
    /(Apple|Samsung|Sony|LG|Dell|HP|Logitech|Corsair|Razer|ASUS|MSI|Intel|AMD|NVIDIA|Microsoft|Google)/i
  ];
  for (const pattern of brandPatterns) {
    const match = text.match(pattern);
    if (match) {
      partialInfo.brand = match[1].trim();
      console.log('[PARTIAL] Brand detected:', partialInfo.brand);
      break;
    }
  }
  
  // Try to detect object type
  const objectPatterns = [
    /parent_object[:\s]+["']?([^"'\n,}]+)["']?/i,
    /this (?:is|appears to be|looks like) (?:a |an )?([^.]+)/i,
    /identified as (?:a |an )?([^.]+)/i
  ];
  for (const pattern of objectPatterns) {
    const match = text.match(pattern);
    if (match) {
      partialInfo.object_type = match[1].trim();
      console.log('[PARTIAL] Object type detected:', partialInfo.object_type);
      break;
    }
  }
  
  // Try to detect category
  const categoryMatch = text.match(/category[:\s]+["']?(Electronics|Wood|Metal|Fabric|Mechanical|ICs\/Chips|Passive Components|Electromechanical|Connectors|Display\/LEDs|Sensors|Power|PCB|Other)["']?/i);
  if (categoryMatch) {
    partialInfo.category = categoryMatch[1];
    console.log('[PARTIAL] Category detected:', partialInfo.category);
  }
  
  // Try to detect condition
  const conditionMatch = text.match(/condition[:\s]+["']?(New|Good|Fair|For Parts|Poor)["']?/i);
  if (conditionMatch) {
    partialInfo.condition = conditionMatch[1];
    console.log('[PARTIAL] Condition detected:', partialInfo.condition);
  }
  
  return partialInfo;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[identify-component] Request body keys:', Object.keys(body));
    
    // Initialize Supabase client for cache operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Support both single image (legacy) and multiple images
    let images: Array<{ imageBase64: string; mimeType: string }> = [];
    const userHint: string | undefined = body.userHint;
    const imageHash: string | undefined = body.imageHash;
    const requestedProvider: AIProvider | undefined = body.provider;
    
    if (userHint) {
      console.log('[identify-component] User provided hint:', userHint);
    }
    
    if (requestedProvider) {
      console.log('[identify-component] Requested provider:', requestedProvider);
    }
    
    // Check cache first if we have a hash
    if (imageHash) {
      console.log('[identify-component] Checking cache for hash:', imageHash);
      
      const { data: cachedResult, error: cacheError } = await supabase
        .from('scan_cache')
        .select('scan_result, id, hit_count')
        .eq('image_hash', imageHash)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (cachedResult && !cacheError) {
        console.log('[identify-component] CACHE HIT! Returning cached result (hit count:', cachedResult.hit_count + 1, ')');
        
        // Update hit count asynchronously
        supabase
          .from('scan_cache')
          .update({ hit_count: cachedResult.hit_count + 1 })
          .eq('id', cachedResult.id)
          .then(() => {});
        
        return new Response(
          JSON.stringify({ ...cachedResult.scan_result, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('[identify-component] Cache miss, proceeding with API call');
    }
    
    if (body.images && Array.isArray(body.images)) {
      console.log('[identify-component] Received images array with', body.images.length, 'items');
      images = body.images;
    } else if (body.imageBase64) {
      console.log('[identify-component] Received single image (legacy format)');
      images = [{ imageBase64: body.imageBase64, mimeType: body.mimeType || 'image/jpeg' }];
    }

    if (images.length === 0) {
      console.error('[identify-component] No images found in request');
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each image
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.imageBase64 || img.imageBase64.length < 100) {
        console.error(`[identify-component] Image ${i} is invalid or too small`);
        return new Response(
          JSON.stringify({ error: `Image ${i + 1} is invalid` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[identify-component] Image ${i + 1}: ${img.mimeType}, ${img.imageBase64.length} chars`);
    }

    // Determine which AI provider to use
    const configs = getProviderConfigs();
    let selectedProvider: AIProvider;
    let apiKey: string;
    
    if (requestedProvider && configs[requestedProvider].apiKey) {
      // Use the requested provider if available
      selectedProvider = requestedProvider;
      apiKey = configs[requestedProvider].apiKey!;
    } else {
      // Fall back to first available provider
      const available = getAvailableProvider();
      if (!available) {
        console.error('No AI provider configured');
        return new Response(
          JSON.stringify({ 
            error: 'No AI provider configured. Add an API key for OpenAI, Google Gemini, or Anthropic Claude in Settings → Cloud → Secrets.',
            configuredProviders: Object.entries(configs)
              .filter(([_, c]) => c.apiKey)
              .map(([p]) => p)
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      selectedProvider = available.provider;
      apiKey = available.config.apiKey!;
    }

    console.log(`[identify-component] Using provider: ${configs[selectedProvider].name}`);

    // Fetch component limit settings from database
    let minComponents = 8;
    let maxComponents = 20;
    try {
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'component_limit')
        .single();
      
      if (settingsData?.value) {
        const limits = settingsData.value as { min?: number; max?: number };
        if (limits.min) minComponents = limits.min;
        if (limits.max) maxComponents = limits.max;
        console.log(`[identify-component] Using component limits from settings: ${minComponents}-${maxComponents}`);
      }
    } catch (e) {
      console.log('[identify-component] Using default component limits: 8-20');
    }

    // Generate the prompt with configured limits
    const systemPrompt = getIdentificationPrompt(minComponents, maxComponents);

    // Build content array with all images
    let promptText = `I'm providing ${images.length} image(s) of the same object from different angles. Analyze ALL images together to identify the object and its salvageable components. Return ONLY valid JSON (no markdown, no code fences). If unsure, set confidence lower and still return a complete JSON object. Keep tools_needed to <= 8 items and common_uses to <= 4. YOU MUST IDENTIFY AT LEAST ${minComponents} COMPONENTS.`;
    
    // Add user hint if provided
    if (userHint) {
      promptText += `\n\nIMPORTANT USER CONTEXT: The user has provided the following hint about this object: "${userHint}". Use this information to improve your identification accuracy.`;
    }
    
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [
      {
        type: 'text',
        text: promptText
      }
    ];

    // Add all images
    for (const img of images) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${img.mimeType};base64,${img.imageBase64}`,
          detail: 'low'
        }
      });
    }

    // Call the selected AI provider
    let aiResponse: string;
    try {
      aiResponse = await callAI(selectedProvider, apiKey, systemPrompt, userContent);
    } catch (error) {
      console.error(`[${selectedProvider}] API call failed:`, error);
      return new Response(
        JSON.stringify({ 
          error: `${configs[selectedProvider].name} error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          provider: selectedProvider
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse) {
      console.error('No response content from AI');
      return new Response(
        JSON.stringify({ error: 'No identification results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Response received:', aiResponse.substring(0, 200) + '...');

    let parsedResponse;
    try {
      parsedResponse = extractJsonFromAI(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Try to extract partial information from the raw response
      const partialInfo = extractPartialInfo(aiResponse);
      console.log('[identify-component] Partial info extracted:', partialInfo);
      
      return new Response(
        JSON.stringify({
          items: [],
          partial_detection: partialInfo,
          message: 'Full breakdown failed, but here is what was detected.',
          raw_response: aiResponse,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log partial detections as they're found
    console.log('=== IDENTIFICATION RESULTS ===');
    if (parsedResponse.parent_object) {
      console.log('[DETECTED] Parent Object:', parsedResponse.parent_object);
    }
    if (parsedResponse.salvage_difficulty) {
      console.log('[DETECTED] Salvage Difficulty:', parsedResponse.salvage_difficulty);
    }
    if (parsedResponse.tools_needed?.length) {
      console.log('[DETECTED] Tools Needed:', parsedResponse.tools_needed.join(', '));
    }
    if (parsedResponse.total_estimated_value_low !== undefined) {
      console.log('[DETECTED] Value Range: $' + parsedResponse.total_estimated_value_low + ' - $' + parsedResponse.total_estimated_value_high);
    }
    
    // Log each identified component
    if (parsedResponse.items?.length > 0) {
      console.log('[DETECTED] Found', parsedResponse.items.length, 'salvageable components:');
      parsedResponse.items.forEach((item: any, idx: number) => {
        const brand = item.specifications?.brand || item.specifications?.manufacturer || '';
        const brandStr = brand ? ` (${brand})` : '';
        console.log(`  ${idx + 1}. ${item.component_name}${brandStr} - ${item.category} - Confidence: ${Math.round((item.confidence || 0) * 100)}%`);
      });
    }
    console.log('==============================');

    // Cache the result if we have a hash (save for 7 days)
    if (imageHash && parsedResponse.items?.length > 0) {
      console.log('[identify-component] Caching result for hash:', imageHash);
      supabase
        .from('scan_cache')
        .upsert({
          image_hash: imageHash,
          scan_result: parsedResponse,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          hit_count: 0
        }, { onConflict: 'image_hash' })
        .then(({ error }) => {
          if (error) {
            console.error('[identify-component] Failed to cache result:', error.message);
          } else {
            console.log('[identify-component] Result cached successfully');
          }
        });
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in identify-component function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
