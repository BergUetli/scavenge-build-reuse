-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add hierarchical structure to components table
ALTER TABLE public.components 
ADD COLUMN parent_component_id UUID REFERENCES public.components(id) ON DELETE SET NULL,
ADD COLUMN abstraction_level TEXT DEFAULT 'device' CHECK (abstraction_level IN ('device', 'module', 'ic', 'discrete')),
ADD COLUMN brand TEXT,
ADD COLUMN model TEXT,
ADD COLUMN source TEXT DEFAULT 'manual',
ADD COLUMN verified BOOLEAN DEFAULT false;

-- Create index for hierarchical queries
CREATE INDEX idx_components_parent ON public.components(parent_component_id);
CREATE INDEX idx_components_brand_model ON public.components(brand, model);

-- Create datasets table for tracking uploaded data sources
CREATE TABLE public.datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    field_mappings JSONB DEFAULT '{}'::jsonb,
    original_fields JSONB DEFAULT '[]'::jsonb,
    records_count INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    error_log TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on datasets
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- RLS policies for datasets (admin only)
CREATE POLICY "Admins can view datasets"
ON public.datasets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage datasets"
ON public.datasets
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on datasets
CREATE TRIGGER update_datasets_updated_at
BEFORE UPDATE ON public.datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow admins to manage components
CREATE POLICY "Admins can manage components"
ON public.components
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));