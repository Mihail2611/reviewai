-- Enable UUID extension
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, name) values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('wildberries', 'ozon')),
  name text not null,
  wb_supplier_id text,
  wb_api_key text,
  ozon_client_id text,
  ozon_api_key text,
  is_active boolean default true,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.stores enable row level security;
create policy "Users can manage own stores" on public.stores for all using (auth.uid() = user_id);

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  external_id text not null,
  platform text not null check (platform in ('wildberries', 'ozon')),
  product_name text not null,
  product_id text,
  product_image text,
  rating integer not null check (rating between 1 and 5),
  text text,
  author text,
  reviewed_at timestamptz,
  status text not null default 'new' check (status in ('new', 'pending', 'answered', 'ignored')),
  response_text text,
  responded_at timestamptz,
  raw_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(store_id, external_id, platform)
);
alter table public.reviews enable row level security;
create policy "Users can manage own reviews" on public.reviews for all using (auth.uid() = user_id);
create index reviews_user_id_idx on public.reviews(user_id);
create index reviews_store_id_idx on public.reviews(store_id);
create index reviews_status_idx on public.reviews(status);

create table public.ai_prompts (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  mode text not null default 'semi' check (mode in ('auto', 'semi', 'off')),
  custom_prompt text,
  tone text default 'friendly' check (tone in ('friendly', 'formal', 'apologetic')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(store_id, rating)
);
alter table public.ai_prompts enable row level security;
create policy "Users can manage own prompts" on public.ai_prompts for all using (auth.uid() = (select user_id from public.stores where id = store_id));

create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_stores_updated_at before update on public.stores for each row execute procedure public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute procedure public.set_updated_at();
create trigger set_ai_prompts_updated_at before update on public.ai_prompts for each row execute procedure public.set_updated_at();
