-- Fix for "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- Run this in your Supabase SQL Editor

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_izly_date_amount_type_key 
UNIQUE (user_id, izly_date, amount, type);
