
-- chat_conversations: drop all permissive visitor policies
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can read conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update conversation last_message_at" ON public.chat_conversations;

-- Add admin-only SELECT/INSERT/UPDATE policies (DELETE policy already exists)
CREATE POLICY "Admins can view conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert conversations"
ON public.chat_conversations
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- chat_messages: drop visitor/anon policies
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Visitors and AI can insert messages" ON public.chat_messages;

-- Add admin SELECT (admin INSERT for admin replies and admin DELETE already exist)
CREATE POLICY "Admins can view messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Revoke anon privileges (table grants were broader); keep authenticated since admins need them
REVOKE ALL ON public.chat_conversations FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
