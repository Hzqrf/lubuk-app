-- Week 4 Migrations for Lubuk
-- 1. Create weather cache table
create table if not exists public.weather_cache (
  id uuid default gen_random_uuid() primary key,
  latitude double precision not null,
  longitude double precision not null,
  weather_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create push subscriptions table
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, subscription)
);

-- 3. Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  data jsonb,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.weather_cache enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;

-- 5. RLS Policies
-- Weather cache policies (Anyone can read, anyone can cache weather)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view weather cache') then
    create policy "Anyone can view weather cache" on public.weather_cache for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Anyone can insert weather cache') then
    create policy "Anyone can insert weather cache" on public.weather_cache for insert with check ( true );
  end if;
end $$;

-- Push subscriptions policies (Users can manage their own)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can select their own subscriptions') then
    create policy "Users can select their own subscriptions" on public.push_subscriptions for select using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own subscriptions') then
    create policy "Users can insert their own subscriptions" on public.push_subscriptions for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own subscriptions') then
    create policy "Users can delete their own subscriptions" on public.push_subscriptions for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- Notifications policies (Users can select and update their own)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view their own notifications') then
    create policy "Users can view their own notifications" on public.notifications for select using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update their own notifications') then
    create policy "Users can update their own notifications" on public.notifications for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
  end if;
end $$;

-- 6. Performance & Spatial Indexes
create index if not exists idx_catches_latitude_longitude on public.catches (latitude, longitude);
create index if not exists idx_catches_fish_species on public.catches (fish_species);
create index if not exists idx_catches_created_at on public.catches (created_at desc);

create index if not exists idx_weather_cache_coords on public.weather_cache (latitude, longitude);
create index if not exists idx_notifications_user_id_is_read on public.notifications (user_id, is_read);
