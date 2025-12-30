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
4. reusability_score: 1-10 based on how useful for DIY projects (10 = Arduino, ESP32, OLED displays; 1 = proprietary chips)
5. market_value_low: Estimated low value in USD for the quantity
6. market_value_high: Estimated high value in USD for the quantity
7. condition: New, Good, Fair, or For Parts
8. confidence: Your confidence in identification (0.0 to 1.0)
9. description: What this component does and why it's useful for makers
10. common_uses: Array of 3-5 project ideas this could enable
11. quantity: Estimated count (number, use 1 if single item)

ALWAYS respond with valid JSON:
{
  "parent_object": "string (what the main object is, e.g., 'Mechanical Keyboard')",
  "items": [
    {
      "component_name": "string",
      "category": "string",
      "specifications": {},
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
      return new Response(
        JSON.stringify({
          items: [],
          message: 'No components could be extracted from the AI response. Please try again with clearer photos.',
          raw_response: aiResponse,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully identified', parsedResponse.items?.length || 0, 'items from', images.length, 'images');

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
