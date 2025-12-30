/**
 * SCAVENGER AI IDENTIFICATION EDGE FUNCTION
 * 
 * This function uses Lovable AI (Gemini 2.5 Flash) with vision capabilities
 * to identify components and materials from images.
 * 
 * Input: Base64 encoded image
 * Output: Component identification with specs, reusability score, and market value
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for component identification with sub-component breakdown
const IDENTIFICATION_PROMPT = `You are Scavenger AI, an expert at identifying salvageable components from electronics, devices, and materials.

Your task is to analyze the image and BREAK DOWN the object into its individual salvageable internal components.

IMPORTANT RULES:
1. If the image shows a device (keyboard, phone, laptop, appliance, etc.), list the INTERNAL components that could be harvested from it
2. IGNORE: plastic casing, screws, rubber feet, labels, packaging, structural plastic parts
3. FOCUS ON: chips, ICs, capacitors, resistors, motors, switches, LEDs, displays, sensors, connectors, cables, PCBs, batteries, speakers, etc.
4. Estimate QUANTITIES for repeated components (e.g., "~50 mechanical switches" for a keyboard)
5. Group similar components when there are many (e.g., "SMD Capacitors (various values)" rather than listing each)

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

EXAMPLE - For a mechanical keyboard image, you might return:
- Mechanical Key Switches (~87 pcs) - Cherry MX or similar
- USB Controller IC - Handles USB HID communication
- Stabilizer Assemblies (~8 pcs) - For larger keys
- RGB LEDs (~87 pcs) - If backlit model
- PCB - The keyboard's main circuit board
- USB-C Port - Connector for cable
- Diodes (~87 pcs) - For key matrix
- Microcontroller - Brain of the keyboard

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
  // If model still returns markdown, strip code fences.
  let text = aiResponse.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) text = fenceMatch[1].trim();

  // Try direct parse first.
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: grab the largest JSON object in the text.
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending image to Lovable AI for identification...');

    // Call Lovable AI Gateway with vision model
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
            content: [
              {
                type: 'text',
                text: 'Return ONLY valid JSON (no markdown, no code fences). If unsure, set confidence lower and still return a complete JSON object. Keep tools_needed to <= 8 items and common_uses to <= 4.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
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

    // Parse the JSON response from the AI
    let parsedResponse;
    try {
      parsedResponse = extractJsonFromAI(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a structured error with the raw response for debugging
      return new Response(
        JSON.stringify({
          items: [],
          message: 'No components could be extracted from the AI response. Please try again with a clearer photo.',
          raw_response: aiResponse,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully identified', parsedResponse.items?.length || 0, 'items');

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
