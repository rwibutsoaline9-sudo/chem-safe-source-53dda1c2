
-- Allow anon users to read payment_settings so the public view works for checkout
CREATE POLICY "payment_settings_public_read"
ON public.payment_settings
FOR SELECT
TO anon
USING (true);
