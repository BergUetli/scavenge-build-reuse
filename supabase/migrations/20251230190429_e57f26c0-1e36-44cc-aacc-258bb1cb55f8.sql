-- Create a table to cache component images
CREATE TABLE public.component_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(component_name, category)
);

-- Create index for faster lookups
CREATE INDEX idx_component_images_lookup ON public.component_images (component_name, category);

-- Enable RLS
ALTER TABLE public.component_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view cached images (public read)
CREATE POLICY "Component images are viewable by everyone" 
ON public.component_images 
FOR SELECT 
USING (true);

-- Allow service role to insert (edge functions use service role)
CREATE POLICY "Service role can insert component images" 
ON public.component_images 
FOR INSERT 
WITH CHECK (true);

-- Add comment explaining the table
COMMENT ON TABLE public.component_images IS 'Cache for AI-generated component images to avoid redundant API calls';