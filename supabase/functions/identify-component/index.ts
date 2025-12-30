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

// System prompt for component identification
const IDENTIFICATION_PROMPT = `You are Scavenger AI, an expert at identifying salvageable components and materials from images.

Your task is to analyze the image and identify any components, materials, or parts that could be reused in DIY projects.

For each item identified, provide:
1. component_name: The specific name (e.g., "ESP32-DevKitC", "Oak Wood Plank", "NEMA 17 Stepper Motor")
2. category: One of: Electronics, Wood, Metal, Fabric, Mechanical, Other
3. specifications: Key technical specs as an object (e.g., {"voltage": "3.3V", "pins": 38} or {"type": "Hardwood", "grain": "Straight"})
4. reusability_score: 1-10 based on how versatile and useful this component is for projects
5. market_value_low: Estimated low resale value in USD
6. market_value_high: Estimated high resale value in USD
7. condition: New, Good, Fair, or For Parts (based on visible condition)
8. confidence: Your confidence in the identification (0.0 to 1.0)
9. description: Brief description of what this component does or is used for
10. common_uses: Array of 3-5 common project types this could be used for

If you cannot identify anything salvageable, return an empty items array with a message explaining why.

IMPORTANT: Always respond with valid JSON in this exact format:
{
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
      "common_uses": ["string"]
    }
  ],
  "message": "string (optional, for additional context or if nothing found)"
}`;

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
                text: 'Please identify all salvageable components and materials in this image. Provide detailed specifications and reusability assessment.'
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
        max_tokens: 2000,
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
      // Extract JSON from markdown code blocks if present
      let jsonString = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a structured error with the raw response for debugging
      return new Response(
        JSON.stringify({ 
          items: [],
          message: 'Could not parse identification results',
          raw_response: aiResponse
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
