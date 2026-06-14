
-- Remove permissive INSERT policies that allowed anyone to fabricate orders.
-- Payment edge functions use the service role and bypass RLS.
DROP POLICY IF EXISTS "orders_insert_any" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert_any" ON public.order_items;

REVOKE INSERT ON public.orders FROM anon, authenticated;
REVOKE INSERT ON public.order_items FROM anon, authenticated;

-- Tighten contact form INSERT: still public, but require valid non-empty fields
-- and a reasonable email shape. Service role keeps full access.
DROP POLICY IF EXISTS "Allow anyone to insert contact messages" ON public.contact_messages;

CREATE POLICY "Public can submit valid contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(business_name)) BETWEEN 1 AND 200
  AND length(btrim(contact_name)) BETWEEN 1 AND 200
  AND length(btrim(email)) BETWEEN 3 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(phone)) BETWEEN 1 AND 50
  AND length(btrim(product)) BETWEEN 1 AND 200
  AND length(btrim(quantity)) BETWEEN 1 AND 100
  AND (message IS NULL OR length(message) <= 5000)
  AND status IS NULL
);
