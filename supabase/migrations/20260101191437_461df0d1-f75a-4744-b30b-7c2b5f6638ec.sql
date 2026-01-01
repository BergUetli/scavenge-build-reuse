-- Create table for tracking AI scan costs per user
CREATE TABLE public.scan_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scan_id uuid REFERENCES public.scan_history(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric(10, 6) NOT NULL DEFAULT 0,
  is_correction boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_costs ENABLE ROW LEVEL SECURITY;

-- Users can view their own scan costs
CREATE POLICY "Users can view their own scan costs"
ON public.scan_costs
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all scan costs
CREATE POLICY "Admins can view all scan costs"
ON public.scan_costs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert scan costs
CREATE POLICY "Service role can insert scan costs"
ON public.scan_costs
FOR INSERT
WITH CHECK (true);

-- Add index for user queries
CREATE INDEX idx_scan_costs_user_id ON public.scan_costs(user_id);
CREATE INDEX idx_scan_costs_created_at ON public.scan_costs(created_at DESC);