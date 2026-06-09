
-- 1. audit_logs: remove anon/authenticated INSERT
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- 2. subscriptions: remove open INSERT
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscriptions;

-- 3. transactions: remove open INSERT
DROP POLICY IF EXISTS "transactions_insert_any" ON public.transactions;

-- 4. whatsapp_settings: restrict SELECT to admins (no longer used by public site after SiteChat replaced WhatsAppButton)
DROP POLICY IF EXISTS "Anyone can view whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Admins can view whatsapp settings"
ON public.whatsapp_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
