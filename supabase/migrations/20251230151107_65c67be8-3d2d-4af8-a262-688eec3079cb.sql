-- =============================================
-- SCAVENGER APP DATABASE SCHEMA
-- Tables for components, projects, and user inventory
-- =============================================

-- COMPONENTS TABLE: Stores known component/material types
CREATE TABLE public.components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Electronics', 'Wood', 'Metal', 'Fabric', 'Mechanical', 'Other')),
  specifications JSONB DEFAULT '{}'::jsonb,
  reusability_score INTEGER CHECK (reusability_score >= 1 AND reusability_score <= 10),
  market_value DECIMAL(10, 2),
  datasheet_url TEXT,
  image_url TEXT,
  description TEXT,
  common_uses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PROJECTS TABLE: Stores DIY project ideas
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_time TEXT NOT NULL,
  category TEXT NOT NULL,
  tutorial_url TEXT,
  thumbnail_url TEXT,
  required_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_tools TEXT[],
  skills_needed TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- USER PROFILES TABLE: Extends auth.users with profile data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  items_scanned INTEGER DEFAULT 0,
  items_saved INTEGER DEFAULT 0,
  co2_saved DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- USER INVENTORY TABLE: Tracks user's salvaged components
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Good', 'Fair', 'For Parts')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Used')),
  specifications JSONB DEFAULT '{}'::jsonb,
  reusability_score INTEGER CHECK (reusability_score >= 1 AND reusability_score <= 10),
  market_value DECIMAL(10, 2),
  image_url TEXT,
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SCAN HISTORY TABLE: Tracks recent scans for quick access
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence DECIMAL(3, 2),
  image_url TEXT,
  ai_response JSONB,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- COMPONENTS: Public read access (reference data)
CREATE POLICY "Components are viewable by everyone" 
ON public.components FOR SELECT 
USING (true);

-- PROJECTS: Public read access (reference data)
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects FOR SELECT 
USING (true);

-- PROFILES: Users can view and manage their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- USER INVENTORY: Users can only access their own inventory
CREATE POLICY "Users can view their own inventory" 
ON public.user_inventory FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own inventory" 
ON public.user_inventory FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.user_inventory FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own inventory" 
ON public.user_inventory FOR DELETE 
USING (auth.uid() = user_id);

-- SCAN HISTORY: Users can only access their own scan history
CREATE POLICY "Users can view their own scan history" 
ON public.scan_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own scan history" 
ON public.scan_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scan history" 
ON public.scan_history FOR DELETE 
USING (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_inventory_updated_at
  BEFORE UPDATE ON public.user_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();