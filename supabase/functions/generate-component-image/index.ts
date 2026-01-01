/**
 * GENERATE COMPONENT IMAGE
 * 
 * Uses OpenAI's GPT Image Generation to create stock images of electronic components.
 * Caches images in the database to avoid redundant API calls.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { componentName, category } = await req.json();

    if (!componentName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Component name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize the component name and category for consistent lookups
    const normalizedName = componentName.toLowerCase().trim();
    const normalizedCategory = (category || 'unknown').toLowerCase().trim();

    console.log(`[generate-component-image] Checking cache for: ${normalizedName} (${normalizedCategory})`);

    // Check if image already exists in cache
    const { data: cachedImage, error: cacheError } = await supabase
      .from('component_images')
      .select('image_url')
      .eq('component_name', normalizedName)
      .eq('category', normalizedCategory)
      .single();

    if (cachedImage && !cacheError) {
      console.log(`[generate-component-image] Cache hit! Returning cached image for: ${normalizedName}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: cachedImage.image_url,
          componentName,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-component-image] Cache miss. Generating new image for: ${componentName} (${category})`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured. Add your key in Settings → Cloud → Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a detailed prompt for the component
    const prompt = `A clean, professional product photo of a ${componentName}, ${category} electronic component. White background, studio lighting, high detail, realistic. The component should be clearly visible and well-lit. No text or labels.`;

    console.log('[generate-component-image] Generating image with OpenAI gpt-image-1...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
        output_format: 'png',
        background: 'opaque'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'OpenAI rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid OpenAI API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: `OpenAI error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[generate-component-image] Response received');

    // OpenAI returns base64 data in b64_json format for gpt-image-1
    const imageData = data.data?.[0]?.b64_json;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to data URL format for storage and display
    const imageUrl = `data:image/png;base64,${imageData}`;

    // Store the generated image in cache for future use
    const { error: insertError } = await supabase
      .from('component_images')
      .insert({
        component_name: normalizedName,
        category: normalizedCategory,
        image_url: imageUrl
      });

    if (insertError) {
      // Log but don't fail - the image was still generated successfully
      console.error('[generate-component-image] Failed to cache image:', insertError.message);
    } else {
      console.log(`[generate-component-image] Image cached successfully for: ${normalizedName}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        componentName,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
