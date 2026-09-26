create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('buyer','artist','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.artwork_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;

drop table if exists public.orders cascade;
drop table if exists public.artworks cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 email text,
 role public.user_role not null default 'buyer',
 avatar_url text,
 phone text,
 created_at timestamptz not null default now()
);

create table public.artworks (
 id uuid primary key default gen_random_uuid(),
 artist_id uuid not null references public.profiles(id) on delete cascade,
 title text not null,
 description text default '',
 price numeric(12,2) not null check(price>=0),
 category text not null,
 type text not null,
 medium text default '',
 size text default '',
 image_url text default '',
 status public.artwork_status not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.orders (
 id uuid primary key default gen_random_uuid(),
 buyer_id uuid not null references public.profiles(id) on delete restrict,
 razorpay_order_id text unique,
 razorpay_payment_id text,
 razorpay_signature text,
 items jsonb not null default '[]'::jsonb,
 subtotal numeric(12,2) not null default 0,
 shipping numeric(12,2) not null default 0,
 total numeric(12,2) not null default 0,
 status text not null default 'created',
 paid_at timestamptz,
 created_at timestamptz not null default now()
);

create index artworks_status_idx on public.artworks(status);
create index artworks_artist_idx on public.artworks(artist_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''), 'buyer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index orders_buyer_idx on public.orders(buyer_id);

alter table public.profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.orders enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid()=id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid()=id);

create policy "public read approved art" on public.artworks for select using (status='approved' or auth.uid()=artist_id);
create policy "artists create own art" on public.artworks for insert with check (auth.uid()=artist_id);
create policy "artists update own pending art" on public.artworks for update using (auth.uid()=artist_id);

create policy "buyer own orders" on public.orders for select using (auth.uid()=buyer_id);

insert into storage.buckets (id,name,public) values ('artworks','artworks',true) on conflict (id) do nothing;
create policy "public read artwork images" on storage.objects for select using (bucket_id='artworks');
create policy "authenticated upload artwork images" on storage.objects for insert to authenticated with check (bucket_id='artworks');
create policy "authenticated update artwork images" on storage.objects for update to authenticated using (bucket_id='artworks');
