ALTER TABLE public.payment_settings DROP COLUMN IF EXISTS stripe_secret_key;
ALTER TABLE public.payment_settings DROP COLUMN IF EXISTS webhook_secret;