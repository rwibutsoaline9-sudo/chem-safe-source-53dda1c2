
-- 1. Orders: require non-null user match
DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
FOR SELECT TO authenticated
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- order_items / transactions inherit via join — recreate with strict null check
DROP POLICY IF EXISTS order_items_select_linked ON public.order_items;
CREATE POLICY order_items_select_linked ON public.order_items
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id
    AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid())
         OR public.has_role(auth.uid(), 'admin'))
));

DROP POLICY IF EXISTS transactions_select_linked ON public.transactions;
CREATE POLICY transactions_select_linked ON public.transactions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = transactions.order_id
    AND ((o.user_id IS NOT NULL AND o.user_id = auth.uid())
         OR public.has_role(auth.uid(), 'admin'))
));

-- 2. Contact messages: admin-only read/update
DROP POLICY IF EXISTS "Allow authenticated users to read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages" ON public.contact_messages
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Allow authenticated users to update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Contact settings: admin-only read
DROP POLICY IF EXISTS contact_settings_read ON public.contact_settings;
CREATE POLICY contact_settings_read ON public.contact_settings
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Marketing settings: admin-only writes
DROP POLICY IF EXISTS marketing_settings_write ON public.marketing_settings;
CREATE POLICY marketing_settings_write ON public.marketing_settings
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS marketing_settings_update ON public.marketing_settings;
CREATE POLICY marketing_settings_update ON public.marketing_settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Marketing settings should still be publicly readable (SEO config used at render time)
-- existing marketing_settings_read remains.

-- 5. Storage: product-images writes admin-only
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_auth" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_auth" ON storage.objects;

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- 6. Realtime: restrict contact_messages broadcast to admins
DROP POLICY IF EXISTS "Admins can subscribe to contact messages realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to contact messages realtime"
ON realtime.messages
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Lock down internal SECURITY DEFINER helpers from API callers
REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_product_slug() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
-- has_role and get_public_payment_settings remain callable (intentionally exposed).
