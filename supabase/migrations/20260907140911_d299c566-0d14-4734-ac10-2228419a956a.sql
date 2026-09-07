CREATE TABLE public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_reference TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product_name TEXT NOT NULL,
  quantity TEXT,
  purchase_date DATE,
  reason TEXT NOT NULL,
  details TEXT,
  preferred_resolution TEXT NOT NULL DEFAULT 'refund',
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT refund_requests_status_check CHECK (status IN ('new','reviewing','approved','rejected','refunded')),
  CONSTRAINT refund_requests_resolution_check CHECK (preferred_resolution IN ('refund','replacement','credit','other'))
);

GRANT INSERT ON public.refund_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refund_requests TO authenticated;
GRANT ALL ON public.refund_requests TO service_role;

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit valid refund requests"
ON public.refund_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(order_reference)) BETWEEN 1 AND 100
  AND length(trim(customer_name)) BETWEEN 1 AND 120
  AND length(trim(email)) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR length(phone) <= 40)
  AND length(trim(product_name)) BETWEEN 1 AND 200
  AND (quantity IS NULL OR length(quantity) <= 80)
  AND length(trim(reason)) BETWEEN 1 AND 200
  AND (details IS NULL OR length(details) <= 3000)
  AND (admin_notes IS NULL)
  AND status = 'new'
);

CREATE POLICY "Admins can read refund requests"
ON public.refund_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update refund requests"
ON public.refund_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete refund requests"
ON public.refund_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_refund_requests_updated_at
BEFORE UPDATE ON public.refund_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX refund_requests_created_at_idx ON public.refund_requests (created_at DESC);
CREATE INDEX refund_requests_status_idx ON public.refund_requests (status);