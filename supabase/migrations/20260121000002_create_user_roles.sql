-- =====================================================
-- USER ROLES TABLE FOR ADMIN ACCESS
-- Version: v0.9.6
-- =====================================================

-- Create user_roles table for admin/moderator access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own role, admins can view all
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON public.user_roles TO authenticated;

-- Insert your admin user (REPLACE with your actual user ID)
-- To get your user ID: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- Example:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('your-user-id-here', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

COMMENT ON TABLE public.user_roles IS 'User role assignments for admin/moderator access control';
COMMENT ON COLUMN public.user_roles.role IS 'User role: admin (full access), moderator (review access), or user (normal access)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ USER ROLES TABLE CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Add yourself as admin!';
  RAISE NOTICE '';
  RAISE NOTICE '1. Get your user ID:';
  RAISE NOTICE '   SELECT id, email FROM auth.users WHERE email = ''your-email@example.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '2. Make yourself admin:';
  RAISE NOTICE '   INSERT INTO public.user_roles (user_id, role)';
  RAISE NOTICE '   VALUES (''your-user-id-here'', ''admin'')';
  RAISE NOTICE '   ON CONFLICT (user_id) DO UPDATE SET role = ''admin'';';
  RAISE NOTICE '';
  RAISE NOTICE '3. Refresh the app and you''ll see the Admin Dashboard card!';
  RAISE NOTICE '';
END $$;
