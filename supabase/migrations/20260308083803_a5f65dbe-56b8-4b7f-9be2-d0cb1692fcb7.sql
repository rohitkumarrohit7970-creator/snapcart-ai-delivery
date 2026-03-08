
-- Support conversations table
CREATE TABLE public.support_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  subject text NOT NULL,
  issue_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Support messages table
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS for support_conversations
CREATE POLICY "Users view own conversations" ON public.support_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create conversations" ON public.support_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own conversations" ON public.support_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all conversations" ON public.support_conversations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for support_messages
CREATE POLICY "Users view messages in own conversations" ON public.support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_conversations
      WHERE id = support_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users send messages in own conversations" ON public.support_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.support_conversations
      WHERE id = support_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all messages" ON public.support_messages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;
