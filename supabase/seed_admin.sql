-- MANUALLY SEED THE MASTER ADMIN
-- Run this in the Supabase SQL Editor

-- 1. First, sign up the user through the website with:
-- Email: adminexpert@invest.com
-- Password: 12345678

-- 2. Then run this SQL to ensure they have the role:
DO $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO _user_id FROM auth.users WHERE email = 'adminexpert@invest.com';
  
  IF _user_id IS NOT NULL THEN
    -- Ensure they are in the profiles table
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (_user_id, 'Master Admin', 'adminexpert@invest.com')
    ON CONFLICT (id) DO UPDATE SET email = 'adminexpert@invest.com';

    -- Assign the admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove admin role from anyone else if desired (Optional)
    -- DELETE FROM public.user_roles WHERE user_id != _user_id AND role = 'admin';
  END IF;
END $$;
