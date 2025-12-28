-- 1. TARIFFS (Configuration)
create table public.tariffs (
  code text primary key, -- ex: '97', '35', '01'
  description text,
  izly_real_cost decimal(10, 2), -- Coût réel au Crous (1.00)
  app_refund_amount decimal(10, 2) -- Combien on reverse à l'utilisateur (1.20)
);

-- Insert default data
insert into public.tariffs (code, description, izly_real_cost, app_refund_amount) values
('97', 'Boursier', 1.00, 1.20),
('35', 'Alternant/Précaire', 0.30, 0.50),
('01', 'Non Boursier', 3.30, 0.00); -- Non éligible à la vente

-- 2. PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique,
  full_name text,
  izly_login text, -- Encrypted or stored securely
  izly_user_id text, -- ID technique Izly (scraped)
  phone text,
  birth_date text,
  
  -- Address
  address_street text,
  address_zip text,
  address_city text,
  
  -- Business Logic
  tariff_code text references public.tariffs(code), -- '97' fetched from scraping
  
  -- Wallets
  izly_balance decimal(10, 2), -- Solde réel (Lecture seule)
  app_wallet_balance decimal(10, 2) default 0.00, -- Cagnotte gagnée
  
  last_synced_at timestamp with time zone default now()
);

-- 3. TRANSACTIONS (Internal History)
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  type text, -- 'RECHARGE', 'PAYMENT', 'TRANSFER', 'APP_SALE'
  amount decimal(10, 2),
  label text,
  izly_date timestamp, -- Date réelle de la transaction Izly
  created_at timestamp default now()
);
