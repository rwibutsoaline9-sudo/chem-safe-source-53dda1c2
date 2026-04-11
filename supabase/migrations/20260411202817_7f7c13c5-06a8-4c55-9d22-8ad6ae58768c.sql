
-- Fix: recreate view with security_invoker to avoid security definer view issue
DROP VIEW IF EXISTS public.payment_settings_public;
CREATE VIEW public.payment_settings_public 
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.payment_settings_public TO anon, authenticated;

-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
