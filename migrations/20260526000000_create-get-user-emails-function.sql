-- Create a function to fetch user emails from auth.users
-- This function runs with SECURITY DEFINER to bypass schema restrictions

CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, email
  FROM auth.users
  WHERE id = ANY(user_ids)
$$;
