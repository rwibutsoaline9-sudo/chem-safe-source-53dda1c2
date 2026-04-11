
-- Remove the dangerous policy that exposes secret keys to anon
DROP POLICY IF EXISTS "payment_settings_public_read" ON public.payment_settings;

-- Drop the view approach entirely
DROP VIEW IF EXISTS public.payment_settings_public;

-- Create a security definer function that only returns safe fields
CREATE OR REPLACE FUNCTION public.get_public_payment_settings()
RETURNS TABLE (
  stripe_enabled boolean,
  stripe_public_key text,
  stripe_mode text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT stripe_enabled, stripe_public_key, stripe_mode
  FROM public.payment_settings
  LIMIT 1;
$$;
