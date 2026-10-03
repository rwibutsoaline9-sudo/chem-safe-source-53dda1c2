GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
DROP POLICY IF EXISTS "Public can submit valid contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit valid contact messages" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(business_name)) BETWEEN 1 AND 200
  AND length(btrim(contact_name)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 3 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(phone)) BETWEEN 1 AND 50
  AND length(btrim(product)) BETWEEN 1 AND 4000
  AND length(btrim(quantity)) BETWEEN 1 AND 1000
  AND (message IS NULL OR length(message) <= 5000)
  AND (status IS NULL OR status = 'unread')
  AND document_url IS NULL
);