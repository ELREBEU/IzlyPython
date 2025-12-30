-- ============================================
-- IZLY TRADING - SCHÉMA COMPLET SUPABASE
-- ============================================
-- Reset complet puis création de toutes les tables

-- ÉTAPE 1: DROP des tables existantes (ordre inverse des foreign keys)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.trade_sessions CASCADE;
DROP TABLE IF EXISTS public.market_offers CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tariffs CASCADE;

-- ÉTAPE 2: ACTIVER L'EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CRÉATION DES TABLES
-- ============================================

-- 1. TARIFS (Configuration des prix)
CREATE TABLE public.tariffs (
  code text primary key,
  label text,
  izly_cost decimal(10, 2), -- Coût réel au Crous
  payout_amount decimal(10, 2) -- Montant reversé au vendeur
);

-- Données initiales
INSERT INTO public.tariffs (code, label, izly_cost, payout_amount) VALUES
('98', 'Boursier (Taux Max)', 1.00, 1.20),
('35', 'Alternant/Précaire', 0.30, 0.50),
('97', 'Non Boursier/Standard', 3.30, 0.00);

-- 2. PROFILS (Utilisateurs)
CREATE TABLE public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  
  -- Sécurité Izly (champs chiffrés)
  izly_login_encrypted text,
  izly_password_encrypted text,
  izly_user_id text,
  izly_identifier_qr_base64 text,
  
  -- Infos personnelles
  phone text,
  birth_date text,
  address_street text,
  address_zip text,
  address_city text,
  
  -- Business Logic
  tariff_code text references public.tariffs(code),
  izly_balance decimal(10, 2),
  app_wallet_balance decimal(10, 2) default 0.00,
  
  -- Réputation (marketplace)
  rating float default 5.0,
  trades_count int default 0,
  
  last_synced_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 3. FAVORIS (Carnet d'adresses)
CREATE TABLE public.favorites (
  user_id uuid references public.profiles(id) ON DELETE CASCADE,
  favorite_user_id uuid references public.profiles(id) ON DELETE CASCADE,
  created_at timestamp default now(),
  primary key (user_id, favorite_user_id)
);

-- 4. OFFRES DE MARCHÉ (Le "Dépôt")
CREATE TABLE public.market_offers (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.profiles(id) ON DELETE CASCADE,
  
  -- Contraintes
  min_balance_required decimal(10, 2) default 3.30,
  
  -- Localisation
  lat float,
  lng float,
  radius_meters int default 500,
  
  -- Statut: OPEN, LOCKED, COMPLETED, CANCELLED
  status text default 'OPEN',
  
  created_at timestamp default now(),
  expires_at timestamp
);

-- 5. SESSIONS DE TRADE (Transactions marketplace)
CREATE TABLE public.trade_sessions (
  id uuid primary key default uuid_generate_v4(),
  offer_id uuid references public.market_offers(id) ON DELETE CASCADE,
  buyer_id uuid references public.profiles(id) ON DELETE CASCADE,
  seller_id uuid references public.profiles(id) ON DELETE CASCADE,
  
  -- Montant
  agreed_price decimal(10, 2),
  
  -- Statut: CREATED, QR_SENT, CHECKING, FINALIZED, DISPUTE
  status text default 'CREATED',
  
  created_at timestamp default now(),
  finalized_at timestamp
);

-- 6. MESSAGES CHAT (Logs bot système)
CREATE TABLE public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.trade_sessions(id) ON DELETE CASCADE,
  sender text default 'SYSTEM', -- 'SYSTEM', 'BUYER', 'SELLER'
  content text,
  is_read boolean default false,
  created_at timestamp default now()
);

-- 7. TRANSACTIONS (Historique Izly)
CREATE TABLE public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) ON DELETE CASCADE,
  type text, -- 'RECHARGE', 'PAYMENT', 'TRANSFER', 'APP_SALE'
  amount decimal(10, 2),
  label text,
  izly_date timestamp,
  created_at timestamp default now()
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_market_offers_status ON public.market_offers(status);
CREATE INDEX idx_market_offers_seller ON public.market_offers(seller_id);
CREATE INDEX idx_trade_sessions_buyer ON public.trade_sessions(buyer_id);
CREATE INDEX idx_trade_sessions_seller ON public.trade_sessions(seller_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);

-- ============================================
-- ✅ TERMINÉ !
-- ============================================
-- 7 tables créées :
-- - tariffs (pricing)
-- - profiles (utilisateurs + réputation)
-- - favorites (carnet d'adresses)
-- - market_offers (dépôt de codes)
-- - trade_sessions (transactions)
-- - chat_messages (bot logs)
-- - transactions (historique Izly)
