/**
 * SCAVENGER AI IDENTIFICATION EDGE FUNCTION
 * 
 * This function uses Lovable AI (Gemini 2.5 Flash) with vision capabilities
 * to identify components and materials from images.
 * 
 * Supports multiple images for better identification accuracy.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IDENTIFICATION_PROMPT = `You are Scavenger AI, an expert at identifying salvageable components from electronics, devices, and materials.

Your task is to analyze the provided image(s) and BREAK DOWN the object into its individual salvageable internal components.

IMPORTANT RULES:
1. If multiple images are provided, they show the SAME OBJECT from different angles - combine the information
2. If the image shows a device (keyboard, phone, laptop, appliance, etc.), list the INTERNAL components that could be harvested from it
3. IGNORE: plastic casing, screws, rubber feet, labels, packaging, structural plastic parts
4. FOCUS ON: chips, ICs, capacitors, resistors, motors, switches, LEDs, displays, sensors, connectors, cables, PCBs, batteries, speakers, etc.
5. Estimate QUANTITIES for repeated components (e.g., "~50 mechanical switches" for a keyboard)
6. Group similar components when there are many (e.g., "SMD Capacitors (various values)" rather than listing each)

For EACH salvageable component inside the object, provide:
1. component_name: Specific name with quantity if applicable (e.g., "Mechanical Key Switches (~87 pcs)", "USB Controller IC")
2. category: One of: ICs/Chips, Passive Components, Electromechanical, Connectors, Display/LEDs, Sensors, Power, PCB, Other
3. specifications: Key specs as object (e.g., {"type": "Cherry MX Brown", "actuation": "45g"} or {"capacity": "1000μF", "voltage": "16V"})
4. technical_specs: DETAILED technical data (CRITICAL - be specific, use "Unknown" if not identifiable):
   - ic_number: The EXACT IC/chip part number if visible (e.g., "STM32F103C8T6", "ATmega328P", "TPS54531"). Say "Unknown" if not readable.
   - manufacturer: Chip/component manufacturer (e.g., "Texas Instruments", "STMicroelectronics", "Analog Devices")
   - package_type: IC package (e.g., "LQFP-48", "QFN-32", "DIP-8", "SOT-23")
   - pin_count: Number of pins (integer)
   - voltage_range: Operating voltage (e.g., "3.3V-5V", "1.8V-3.6V")
   - current_rating: Current specs if applicable (e.g., "500mA max", "3A continuous")
   - frequency: Clock/operating frequency if applicable (e.g., "72MHz", "16MHz")
   - datasheet_url: URL to official datasheet if known (prefer manufacturer sites like ti.com, st.com, analog.com)
   - notes: Any technical notes about the component
5. source_info: Official sources for this component (IMPORTANT - use real, official URLs when known):
   - manufacturer_url: Official manufacturer product page (e.g., "https://www.ti.com/product/LM7805")
   - datasheet_url: Direct link to official PDF datasheet
   - purchase_url: Where to buy (Digi-Key, Mouser, LCSC, etc.)
   - source_name: Name of primary source (e.g., "Texas Instruments", "STMicroelectronics")
6. reusability_score: 1-10 based on how useful for DIY projects (10 = Arduino, ESP32, OLED displays; 1 = proprietary chips)
7. market_value_low: Estimated low value in USD for the quantity
8. market_value_high: Estimated high value in USD for the quantity
9. condition: New, Good, Fair, or For Parts
10. confidence: Your confidence in identification (0.0 to 1.0)
11. description: What this component does and why it's useful for makers
12. common_uses: Array of 3-5 project ideas this could enable
13. quantity: Estimated count (number, use 1 if single item)

CRITICAL FOR TECHNICAL SPECS:
- If you can see text on a chip/IC, include the EXACT part number in ic_number
- If you cannot read it, say "Unknown" - NEVER make up part numbers
- DSPs, microcontrollers, and ICs should ALWAYS have technical_specs filled out as much as possible
- For generic components (resistors, capacitors), focus on electrical specs
- For source_info, only include URLs you are confident are correct - leave null if unsure

ALSO PROVIDE DISASSEMBLY INSTRUCTIONS for the parent object:
- steps: Array of clear, numbered steps to safely disassemble and extract components
- difficulty: Easy (snap-fit, no tools), Medium (screws, basic tools), Hard (glued, soldering required)
- time_estimate: How long it takes (e.g., "5-10 minutes", "30 minutes - 1 hour")
- safety_warnings: Array of safety concerns (e.g., "Disconnect battery first", "Capacitors may hold charge")
- tutorial_url: Link to a disassembly guide if one exists (iFixit, YouTube, etc.) - only include if confident it exists
- video_url: Link to video tutorial if known

ALWAYS respond with valid JSON:
{
  "parent_object": "string (what the main object is, e.g., 'Mechanical Keyboard')",
  "items": [
    {
      "component_name": "string",
      "category": "string",
      "specifications": {},
      "technical_specs": {
        "ic_number": "string or null",
        "manufacturer": "string or null",
        "package_type": "string or null",
        "pin_count": "number or null",
        "voltage_range": "string or null",
        "current_rating": "string or null",
        "frequency": "string or null",
        "datasheet_url": "string or null",
        "notes": "string or null"
      },
      "source_info": {
        "manufacturer_url": "string or null",
        "datasheet_url": "string or null", 
        "purchase_url": "string or null",
        "source_name": "string or null"
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
    "safety_warnings": ["string array"] or null,
    "tutorial_url": "string or null",
    "video_url": "string or null"
  },
  "message": "string (optional tips or warnings)"
}`;

function extractJsonFromAI(aiResponse: string) {
  let text = aiResponse.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) text = fenceMatch[1].trim();

  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('No JSON object found in AI response');
    }
    const candidate = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }
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
    
    // Support both single image (legacy) and multiple images
    let images: Array<{ imageBase64: string; mimeType: string }> = [];
    
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending ${images.length} image(s) to Lovable AI for identification...`);

    // Build content array with all images
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: `I'm providing ${images.length} image(s) of the same object from different angles. Analyze ALL images together to identify the object and its salvageable components. Return ONLY valid JSON (no markdown, no code fences). If unsure, set confidence lower and still return a complete JSON object. Keep tools_needed to <= 8 items and common_uses to <= 4.`
      }
    ];

    // Add all images
    for (const img of images) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${img.mimeType};base64,${img.imageBase64}`
        }
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: IDENTIFICATION_PROMPT
          },
          {
            role: 'user',
            content: userContent
          }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI identification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

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
