
-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "System can insert subscriptions" ON public.subscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id UUID,
  data JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Extend payment_settings with new columns
ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
  ADD COLUMN IF NOT EXISTS stripe_mode TEXT NOT NULL DEFAULT 'test',
  ADD COLUMN IF NOT EXISTS subscriptions_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS one_time_enabled BOOLEAN NOT NULL DEFAULT true;

-- Extend orders with fraud tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fraud_flag TEXT DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Extend transactions with fraud tracking
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS fraud_flag TEXT DEFAULT 'safe';

-- Triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
