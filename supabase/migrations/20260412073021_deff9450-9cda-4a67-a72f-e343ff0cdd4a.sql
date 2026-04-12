
CREATE TABLE public.message_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'admin' CHECK (sender_type IN ('admin', 'client')),
  content TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all replies"
ON public.message_replies FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert replies"
ON public.message_replies FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete replies"
ON public.message_replies FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_message_replies_message_id ON public.message_replies(message_id);
