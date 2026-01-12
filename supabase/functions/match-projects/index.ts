/**
 * SCAVENGER PROJECT MATCHING EDGE FUNCTION
 * 
 * This function uses AI to match user's inventory components
 * with suitable DIY projects from the database.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for project matching
const MATCHING_PROMPT = `You are Scavenger AI's project matcher. Given a user's inventory of components and a list of available projects, determine which projects the user can build.

For each project, analyze:
1. Which required components the user already has
2. Which components are missing
3. Estimated cost to complete (for missing parts)
4. A match score (0-100) based on how many components they have

Return results sorted by match score (highest first).

IMPORTANT: Respond with valid JSON in this exact format:
{
  "matched_projects": [
    {
      "project_id": "uuid",
      "project_name": "string",
      "match_score": number,
      "components_have": ["string"],
      "components_missing": [{"name": "string", "estimated_cost": number}],
      "total_missing_cost": number,
      "recommendation": "string (brief note on why this is a good match)"
    }
  ]
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inventory, projects } = await req.json();

    if (!inventory || !projects) {
      return new Response(
        JSON.stringify({ error: 'Inventory and projects are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Matching projects for inventory with', inventory.length, 'items');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MATCHING_PROMPT },
          {
            role: 'user',
            content: `User's Inventory:\n${JSON.stringify(inventory, null, 2)}\n\nAvailable Projects:\n${JSON.stringify(projects, null, 2)}\n\nFind the best project matches for this inventory.`
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
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Project matching failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    let parsedResponse;
    try {
      let jsonString = aiResponse;
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ matched_projects: [], error: 'Failed to parse matches' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-projects function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
