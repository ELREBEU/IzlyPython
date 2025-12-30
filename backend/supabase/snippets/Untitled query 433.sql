ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS icon_type text default 'INFO';
NOTIFY pgrst, 'reload config';