-- Add AI provider preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ai_provider text NOT NULL DEFAULT 'openai';

-- Valid providers: 'openai', 'gemini', 'claude'
-- The API keys are stored as Supabase secrets, not in the database (security)