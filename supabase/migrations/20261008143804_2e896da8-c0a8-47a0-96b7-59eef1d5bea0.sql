CREATE TABLE public.returns_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.refund_requests(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  from_email text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.returns_emails TO authenticated;
GRANT ALL ON public.returns_emails TO service_role;
ALTER TABLE public.returns_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view returns emails" ON public.returns_emails FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins edit returns emails" ON public.returns_emails FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete returns emails" ON public.returns_emails FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_returns_emails_updated_at BEFORE UPDATE ON public.returns_emails FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX returns_emails_created_idx ON public.returns_emails (created_at DESC);