-- G3MX Marketplace — Supabase schema
-- =========================================================
-- Run in Supabase Dashboard → SQL Editor → New Query → Paste → Run.
-- Idempotent: safe to re-run.
--
-- Auth model: Privy is the source of truth for identity.
-- `user_id` columns store the Privy user id (a `did:privy:...` string).
-- Supabase Auth is NOT used.
-- =========================================================

-- ── listings ──────────────────────────────────────────────

create table if not exists public.listings (
  id                  text primary key,
  user_id             text not null,
  game                text not null,
  service_type        text not null,
  title               text not null,
  description         text,
  cover_image         text,
  from_idx            int not null,
  to_idx              int not null,
  from_rank_id        text,
  to_rank_id          text,
  region              text not null,
  queue_type          text not null,
  price_usd           numeric(12, 2) not null,
  eta_hours           int not null,
  response_minutes    int not null,
  booster_tag         text not null,
  booster_avatar_seed text not null,
  booster_rating      numeric(3, 2) not null default 5.0,
  orders_completed    int not null default 0,
  rarity              text not null default 'rare',
  hot                 boolean not null default false,
  options             jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists listings_user_id_idx     on public.listings(user_id);
create index if not exists listings_game_idx        on public.listings(game);
create index if not exists listings_created_at_idx  on public.listings(created_at desc);

alter table public.listings enable row level security;

drop policy if exists "listings: anyone can read"   on public.listings;
drop policy if exists "listings: anyone can insert" on public.listings;
drop policy if exists "listings: anyone can update" on public.listings;
drop policy if exists "listings: anyone can delete" on public.listings;

-- MVP-permissive policies. Tighten once a Privy→Supabase JWT bridge exists.
create policy "listings: anyone can read"   on public.listings for select using (true);
create policy "listings: anyone can insert" on public.listings for insert with check (true);
create policy "listings: anyone can update" on public.listings for update using (true);
create policy "listings: anyone can delete" on public.listings for delete using (true);

-- ── orders ────────────────────────────────────────────────

create table if not exists public.orders (
  id               text primary key,
  buyer_user_id    text not null,
  service          jsonb not null,
  booster          jsonb not null,
  ranks            jsonb not null,
  pricing          jsonb not null,
  options          jsonb not null,
  status           text not null default 'pending',
  sla              jsonb not null,
  timeline         jsonb not null default '[]'::jsonb,
  unread_messages  int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_buyer_user_id_idx on public.orders(buyer_user_id);
create index if not exists orders_status_idx        on public.orders(status);
create index if not exists orders_created_at_idx    on public.orders(created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders: anyone can read"   on public.orders;
drop policy if exists "orders: anyone can insert" on public.orders;
drop policy if exists "orders: anyone can update" on public.orders;
drop policy if exists "orders: anyone can delete" on public.orders;

create policy "orders: anyone can read"   on public.orders for select using (true);
create policy "orders: anyone can insert" on public.orders for insert with check (true);
create policy "orders: anyone can update" on public.orders for update using (true);
create policy "orders: anyone can delete" on public.orders for delete using (true);

-- ── updated_at triggers ──────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
