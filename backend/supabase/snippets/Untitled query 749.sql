ALTER TABLE public.trade_sessions ADD COLUMN IF NOT EXISTS qr_code_token text;
NOTIFY pgrst, 'reload config';