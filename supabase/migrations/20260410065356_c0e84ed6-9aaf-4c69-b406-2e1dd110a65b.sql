
-- Create a safe view that only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.payment_settings_public AS
SELECT 
  id,
  stripe_enabled,
  stripe_public_key,
  stripe_mode,
  paypal_enabled,
  crypto_enabled,
  one_time_enabled,
  subscriptions_enabled
FROM public.payment_settings;

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "payment_settings_read" ON public.payment_settings;

-- Only admins can read the full payment_settings (which includes secret keys)
CREATE POLICY "payment_settings_admin_read"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- Grant public access to the safe view
GRANT SELECT ON public.payment_settings_public TO anon, authenticated;
