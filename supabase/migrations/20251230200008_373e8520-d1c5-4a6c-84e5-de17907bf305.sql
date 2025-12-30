-- Add technical_specs column to user_inventory
ALTER TABLE public.user_inventory 
ADD COLUMN technical_specs jsonb DEFAULT '{}'::jsonb;

-- Add description and common_uses columns for full component data
ALTER TABLE public.user_inventory 
ADD COLUMN description text,
ADD COLUMN common_uses text[] DEFAULT '{}'::text[];