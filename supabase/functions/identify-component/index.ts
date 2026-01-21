/**
 * SCAVENGER AI IDENTIFICATION EDGE FUNCTION
 * 
 * Multi-provider AI component identification with vision capabilities.
 * Supports: OpenAI (gpt-4o-mini), Google Gemini, Anthropic Claude
 * 
 * Cost optimizations:
 * - Uses cheaper models by default (gpt-4o-mini, gemini-2.5-flash, claude-3-haiku)
 * - Caches results by image hash (scan_cache table)
 * - Uses 'low' detail for pre-compressed images
 * - Reduced max_tokens
 * 
 * Supports multiple images for better identification accuracy.
 * 
 * Updated: 2026-01-20 - Trigger redeployment for v0.8.17
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { logger } from "../_shared/logger.ts";

// ScrapGadget database lookup module
import {
  quickIdentifyDevice,
  searchScrapGadgetDB,
  convertScrapGadgetToAIResponse,
  logScrapGadgetMatch,
  type QuickIdentificationResult,
  type ScrapGadgetResult
} from "./scrapgadget-lookup.ts";

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
      apiKey: Deno.env.get('SCAVY_GEMINI_KEY') || Deno.env.get('GOOGLE_AI_API_KEY'),
      envVar: 'SCAVY_GEMINI_KEY', 
      name: 'Google Gemini 2.5 Flash'
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

// Cost per 1K tokens for different providers (approximate)
const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  openai: { input: 0.00015, output: 0.0006 },      // GPT-4o-mini
  gemini: { input: 0.000075, output: 0.0003 },    // Gemini 1.5 Flash
  claude: { input: 0.00025, output: 0.00125 }      // Claude 3 Haiku
};

interface AICallResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

// Call OpenAI API
async function callOpenAI(apiKey: string, systemPrompt: string, userContent: any[]): Promise<AICallResult> {
  logger.info('Calling OpenAI GPT-4o-mini');
  
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
      max_tokens: 3000,  // Balanced for speed and completeness (reduced from 8000)
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('OpenAI API error', new Error(errorText), { status: response.status });
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;
  logger.info('OpenAI tokens', { input: inputTokens, output: outputTokens });
  
  return {
    content: data.choices?.[0]?.message?.content || '',
    inputTokens,
    outputTokens,
    model: 'gpt-4o-mini'
  };
}

// Call Google Gemini API
async function callGemini(apiKey: string, systemPrompt: string, userContent: any[]): Promise<AICallResult> {
  logger.info('Calling Google Gemini 2.5 Flash');
  
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: 3000,  // Balanced for speed and completeness (reduced from 6000)
          temperature: 0.2
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Gemini API error', new Error(errorText), { status: response.status });
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  // Gemini returns token count in usageMetadata
  const inputTokens = data.usageMetadata?.promptTokenCount || 0;
  const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
  logger.info('Gemini tokens', { input: inputTokens, output: outputTokens });
  
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    inputTokens,
    outputTokens,
    model: 'gemini-2.5-flash'
  };
}

// Call Anthropic Claude API
async function callClaude(apiKey: string, systemPrompt: string, userContent: any[]): Promise<AICallResult> {
  logger.info('Calling Anthropic Claude 3 Haiku');
  
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
      max_tokens: 3000,  // Balanced for speed and completeness (reduced from 6000)
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Claude API error', new Error(errorText), { status: response.status });
    throw new Error(`Claude error: ${response.status}`);
  }

  const data = await response.json();
  // Claude returns usage.input_tokens and usage.output_tokens
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;
  logger.info('Claude tokens', { input: inputTokens, output: outputTokens });
  
  return {
    content: data.content?.[0]?.text || '',
    inputTokens,
    outputTokens,
    model: 'claude-3-haiku'
  };
}

// Calculate cost in USD
function calculateCost(provider: AIProvider, inputTokens: number, outputTokens: number): number {
  const rates = COST_PER_1K_TOKENS[provider] || COST_PER_1K_TOKENS.openai;
  const cost = (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
  return Math.round(cost * 1000000) / 1000000; // Round to 6 decimal places
}

// Main AI call dispatcher
async function callAI(
  provider: AIProvider,
  apiKey: string,
  systemPrompt: string,
  userContent: any[]
): Promise<AICallResult> {
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
7. estimated_age_years: ESTIMATE the age of the device based on its design, connectors, chip dates, wear. Use clues like:
   - USB Micro = likely 4-10 years old
   - USB-C = likely 0-5 years old  
   - Mini USB = likely 8-15 years old
   - Physical wear, yellowing = older
   - Modern styling = newer
   If unsure, assume 3-5 years for consumer electronics.
8. market_value_new: Estimated NEW/retail value in USD for this component quantity
9. depreciation_rate: Annual depreciation rate (0.10 = 10% per year). Use:
   - 0.15-0.20 for fast-depreciating items (phones, laptops, batteries)
   - 0.10-0.15 for standard electronics (speakers, displays, modules)
   - 0.05-0.10 for slow-depreciating items (passive components, connectors, motors)
10. market_value_low: RESALE value LOW = market_value_new × (1 - depreciation_rate × estimated_age_years) × 0.3. Never below $0.01.
11. market_value_high: RESALE value HIGH = market_value_new × (1 - depreciation_rate × estimated_age_years) × 0.7. Never below market_value_low.
12. condition: New, Good, Fair, or For Parts (factor this into value - Fair items get 70% of calculated value, For Parts gets 40%)
13. confidence: Your confidence in identification (0.0 to 1.0)
14. description: What this component does and why it's useful for makers
15. common_uses: Array of 3-5 project ideas this could enable
16. quantity: Estimated count (number, use 1 if single item)

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
  "estimated_device_age_years": number (your best guess at device age based on clues),
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
      "estimated_age_years": number,
      "market_value_new": number,
      "depreciation_rate": number,
      "market_value_low": number (depreciated resale value low),
      "market_value_high": number (depreciated resale value high),
      "condition": "string",
      "confidence": number,
      "description": "string",
      "common_uses": ["string"],
      "quantity": number
    }
  ],
  "total_estimated_value_low": number (sum of all depreciated market_value_low),
  "total_estimated_value_high": number (sum of all depreciated market_value_high),
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
    logger.debug('JSON parse failed, attempting repair');
    
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
      logger.debug('Repairing truncated JSON');
      candidate = repairTruncatedJson(candidate);
      return JSON.parse(candidate);
    }
  }
}

/**
 * Attempt to repair truncated JSON by closing open brackets/braces
 */
function repairTruncatedJson(json: string, depth: number = 0): string {
  // Prevent infinite recursion
  if (depth > 3) {
    logger.warn('Max recursion depth reached in JSON repair');
    return json;
  }
  
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
    // Recalculate after truncation with depth tracking
    return repairTruncatedJson(json, depth + 1);
  }
  
  // Remove trailing commas before closing
  json = json.replace(/,\s*$/, '');
  
  // Close any open structures
  let closing = '';
  for (let i = 0; i < openBrackets; i++) closing += ']';
  for (let i = 0; i < openBraces; i++) closing += '}';
  
  logger.debug('JSON repaired', { brackets: openBrackets, braces: openBraces, depth });
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
      logger.debug('Partial brand detected', { brand: partialInfo.brand });
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
      logger.debug('Partial object type', { type: partialInfo.object_type });
      break;
    }
  }
  
  // Try to detect category
  const categoryMatch = text.match(/category[:\s]+["']?(Electronics|Wood|Metal|Fabric|Mechanical|ICs\/Chips|Passive Components|Electromechanical|Connectors|Display\/LEDs|Sensors|Power|PCB|Other)["']?/i);
  if (categoryMatch) {
    partialInfo.category = categoryMatch[1];
    logger.debug('Partial category', { category: partialInfo.category });
  }
  
  // Try to detect condition
  const conditionMatch = text.match(/condition[:\s]+["']?(New|Good|Fair|For Parts|Poor)["']?/i);
  if (conditionMatch) {
    partialInfo.condition = conditionMatch[1];
    logger.debug('Partial condition', { condition: partialInfo.condition });
  }
  
  return partialInfo;
}

serve(async (req) => {
  const totalStart = Date.now();
  logger.info('Request started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parseStart = Date.now();
    const body = await req.json();
    logger.timing('Body parsing', Date.now() - parseStart);
    logger.debug('Request body keys', { keys: Object.keys(body) });
    
    // Check if any AI provider is available FIRST
    const availableProvider = getAvailableProvider();
    if (!availableProvider) {
      logger.error('No AI provider configured');
      const configs = getProviderConfigs();
      const missingKeys = Object.entries(configs)
        .map(([provider, config]) => config.envVar)
        .join(', ');
      return new Response(
        JSON.stringify({ 
          error: `No AI provider API keys configured. Please set one of: ${missingKeys}` 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logger.info('AI provider available', { provider: availableProvider.provider });
    
    // Initialize Supabase client for cache operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Support both single image (legacy) and multiple images
    let images: Array<{ imageBase64: string; mimeType: string }> = [];
    const userHint: string | undefined = body.userHint;
    const imageHash: string | undefined = body.imageHash;
    const requestedProvider: AIProvider | undefined = body.provider;
    const userId: string | undefined = body.userId;
    const isCorrection: boolean = body.isCorrection || false;
    
    if (userHint) {
      logger.debug('User hint provided', { hint: userHint });
    }
    
    if (requestedProvider) {
      logger.debug('Requested provider', { provider: requestedProvider });
    }
    
    // Check cache first if we have a hash
    if (imageHash) {
      const cacheStart = Date.now();
      logger.debug('Checking cache', { hash: imageHash });
      
      const { data: cachedResult, error: cacheError } = await supabase
        .from('scan_cache')
        .select('scan_result, id, hit_count')
        .eq('image_hash', imageHash)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      logger.timing('Cache lookup', Date.now() - cacheStart);
      
      if (cachedResult && !cacheError) {
        logger.info('Cache hit', { totalTime: Date.now() - totalStart, hitCount: cachedResult.hit_count + 1 });
        
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
      
      logger.debug('Cache miss, proceeding with AI call');
    }

    // =============================================
    // SCRAPGADGET DATABASE LOOKUP
    // Check database before expensive AI call
    // =============================================
    
    logger.info('ScrapGadget database lookup started');
    const dbLookupStart = Date.now();
    
    // Setup for ScrapGadget lookup
    if (body.images && Array.isArray(body.images)) {
      logger.debug('Received images', { count: body.images.length });
      images = body.images;
    } else if (body.imageBase64) {
      logger.debug('Received single image (legacy format)');
      images = [{ imageBase64: body.imageBase64, mimeType: body.mimeType || 'image/jpeg' }];
    }

    if (images.length === 0) {
      logger.error('No images in request');
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which AI provider to use
    const configs = getProviderConfigs();
    let selectedProvider: AIProvider;
    let apiKey: string;
    
    if (requestedProvider && configs[requestedProvider].apiKey) {
      selectedProvider = requestedProvider;
      apiKey = configs[requestedProvider].apiKey!;
    } else {
      const available = getAvailableProvider();
      if (!available) {
        logger.error('No AI provider configured');
        return new Response(
          JSON.stringify({ 
            error: 'No AI provider configured.',
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
    
    logger.info('Using provider', { provider: configs[selectedProvider].name });
    
    // Quick AI identification (cheap: ~$0.0001)
    let quickId: QuickIdentificationResult | null = null;
    try {
      logger.debug('Running quick device identification');
      quickId = await quickIdentifyDevice(
        callAI,
        selectedProvider,
        apiKey,
        images[0].imageBase64,
        images[0].mimeType
      );
    } catch (error) {
      logger.error('Quick ID failed', error as Error);
      quickId = { brand: null, model: null, deviceName: null, confidence: 0 };
    }
    
    // Search database if we have brand info
    let dbResult: ScrapGadgetResult | null = null;
    if (quickId && quickId.confidence > 0.5) {
      logger.debug('Searching ScrapGadget DB', { brand: quickId.brand, model: quickId.model || '' });
      dbResult = await searchScrapGadgetDB(
        supabase,
        quickId.brand,
        quickId.model,
        quickId.deviceName,
        userHint
      );
    }
    
    // DATABASE HIT - Return immediately!
    if (dbResult) {
      const dbTime = Date.now() - dbLookupStart;
      logger.info('ScrapGadget database HIT', { lookupTime: dbTime, savings: '$0.005' });
      
      const result = convertScrapGadgetToAIResponse(dbResult.gadget, dbResult.components);
      
      // Log analytics
      await logScrapGadgetMatch(
        supabase,
        userId,
        dbResult.gadget.id,
        imageHash,
        quickId?.model ? 'exact_match' : 'fuzzy_match',
        quickId?.confidence || 0.8,
        0.005,
        dbTime
      );
      
      // Increment gadget scan count
      supabase.from('scrap_gadgets')
        .update({ scan_count: (dbResult.gadget.scan_count || 0) + 1 })
        .eq('id', dbResult.gadget.id)
        .then(() => {});
      
      // Cache result for future
      if (imageHash) {
        supabase.from('scan_cache')
          .upsert({
            image_hash: imageHash,
            scan_result: result,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            hit_count: 0
          }, { onConflict: 'image_hash' })
          .then(() => {});
      }
      
      logger.timing('Total (ScrapGadget DB)', Date.now() - totalStart);
      logger.info('ScrapGadget DB lookup complete (HIT)');
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // DATABASE MISS - Continue with full AI
    logger.debug('Not in ScrapGadget DB', { lookupTime: Date.now() - dbLookupStart });
    logger.info('Proceeding with full AI analysis');
    logger.info('ScrapGadget DB lookup complete (MISS)');
    
    // Fetch component limit settings from database
    const settingsStart = Date.now();
    let minComponents = 8;
    let maxComponents = 20;
    try {
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'component_limit')
        .single();
      
      logger.timing('Settings fetch', Date.now() - settingsStart);
      
      if (settingsData?.value) {
        const limits = settingsData.value as { min?: number; max?: number };
        if (limits.min) minComponents = limits.min;
        if (limits.max) maxComponents = limits.max;
        logger.debug('Using component limits from settings', { min: minComponents, max: maxComponents });
      }
    } catch (e) {
      logger.timing('Settings fetch (defaults)', Date.now() - settingsStart);
    }

    // Generate the prompt with configured limits
    const promptStart = Date.now();
    const systemPrompt = getIdentificationPrompt(minComponents, maxComponents);
    logger.timing('Prompt generation', Date.now() - promptStart);

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
    const aiCallStart = Date.now();
    logger.debug('Starting AI API call', { provider: selectedProvider });
    let aiResult: AICallResult;
    try {
      aiResult = await callAI(selectedProvider, apiKey, systemPrompt, userContent);
    } catch (error) {
      logger.error(`${selectedProvider} API call failed`, error as Error, { duration: Date.now() - aiCallStart });
      return new Response(
        JSON.stringify({ 
          error: `${configs[selectedProvider].name} error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          provider: selectedProvider
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logger.timing('AI API call', Date.now() - aiCallStart);

    const aiResponse = aiResult.content;
    const costUsd = calculateCost(selectedProvider, aiResult.inputTokens, aiResult.outputTokens);
    logger.info('AI cost', { cost: `$${costUsd.toFixed(6)}`, inputTokens: aiResult.inputTokens, outputTokens: aiResult.outputTokens });

    if (!aiResponse) {
      logger.error('No response content from AI');
      return new Response(
        JSON.stringify({ error: 'No identification results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logger.debug('AI response preview', { preview: aiResponse.substring(0, 200) });

    let parsedResponse;
    try {
      parsedResponse = extractJsonFromAI(aiResponse);
    } catch (parseError) {
      logger.error('Failed to parse AI response', parseError as Error);
      
      // Try to extract partial information from the raw response
      const partialInfo = extractPartialInfo(aiResponse);
      logger.debug('Partial info extracted', { info: partialInfo });
      
      return new Response(
        JSON.stringify({
          items: [],
          partial_detection: partialInfo,
          message: 'Full breakdown failed, but here is what was detected.',
          raw_response: aiResponse,
          cost: {
            provider: selectedProvider,
            model: aiResult.model,
            input_tokens: aiResult.inputTokens,
            output_tokens: aiResult.outputTokens,
            cost_usd: costUsd
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log partial detections as they're found
    logger.info('=== IDENTIFICATION RESULTS ===');
    if (parsedResponse.parent_object) {
      logger.info('Parent object detected', { object: parsedResponse.parent_object });
    }
    if (parsedResponse.salvage_difficulty) {
      logger.info('Salvage difficulty', { difficulty: parsedResponse.salvage_difficulty });
    }
    if (parsedResponse.tools_needed?.length) {
      logger.info('Tools needed', { tools: parsedResponse.tools_needed.join(', ') });
    }
    if (parsedResponse.total_estimated_value_low !== undefined) {
      logger.info('Value range', { low: parsedResponse.total_estimated_value_low, high: parsedResponse.total_estimated_value_high });
    }
    
    // Log each identified component
    if (parsedResponse.items?.length > 0) {
      logger.info('Salvageable components found', { count: parsedResponse.items.length });
      parsedResponse.items.forEach((item: any, idx: number) => {
        const brand = item.specifications?.brand || item.specifications?.manufacturer || '';
        const brandStr = brand ? ` (${brand})` : '';
        logger.debug(`Component ${idx + 1}`, { name: item.component_name, brand: item.brand, category: item.category, confidence: Math.round((item.confidence || 0) * 100) });
      });
    }
    logger.info('='.repeat(30));

    // Save cost to database if user is authenticated
    if (userId) {
      logger.debug('Saving cost for user', { userId });
      supabase
        .from('scan_costs')
        .insert({
          user_id: userId,
          provider: selectedProvider,
          model: aiResult.model,
          input_tokens: aiResult.inputTokens,
          output_tokens: aiResult.outputTokens,
          cost_usd: costUsd,
          is_correction: isCorrection
        })
        .then(({ error }) => {
          if (error) {
            logger.error('Failed to save cost', error as Error);
          } else {
            logger.debug('Cost saved successfully');
          }
        });
    }

    // Cache the result if we have a hash (save for 7 days)
    if (imageHash && parsedResponse.items?.length > 0) {
      logger.debug('Caching result', { hash: imageHash });
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
            logger.error('Failed to cache result', error as Error);
          } else {
            logger.debug('Result cached successfully');
          }
        });
    }

    // Add cost info to response
    parsedResponse.cost = {
      provider: selectedProvider,
      model: aiResult.model,
      input_tokens: aiResult.inputTokens,
      output_tokens: aiResult.outputTokens,
      cost_usd: costUsd
    };

    logger.timing('Total request', Date.now() - totalStart);
    

    // Submit new device to ScrapGadget database
    if (parsedResponse.items && parsedResponse.items.length >= 5 && userId) {
      logger.info('Submitting new device to ScrapGadget');
      try {
        await supabase.from("scrap_gadget_submissions").insert({
          user_id: userId,
          ai_scan_result: parsedResponse,
          image_urls: [],
          matched_gadget_id: null,
          submission_type: "new_device",
          user_notes: userHint || null,
          status: "pending"
        });
        logger.info('ScrapGadget submission created');
      } catch (error) {
        logger.error('ScrapGadget submission failed', error as Error);
      }
    }
    
    // Log AI fallback analytics
    await logScrapGadgetMatch(
      supabase,
      userId,
      null,
      imageHash,
      "ai_fallback",
      0,
      0,
      Date.now() - totalStart
    );

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Function error', error as Error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
