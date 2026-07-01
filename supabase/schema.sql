-- Supabase Schema for Lubuk MVP (Idempotent)

-- 1. Create catches table
create table if not exists public.catches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  fish_species text not null,
  note text,
  image_url text,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.catches enable row level security;

-- 3. RLS Policies for catches table
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view catches') then
    create policy "Anyone can view catches" on public.catches for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can insert catches') then
    create policy "Authenticated users can insert catches" on public.catches for insert with check ( auth.uid() = user_id );
  end if;
end $$;

-- 4. Create Storage Bucket for images
insert into storage.buckets (id, name, public) 
values ('catches-images', 'catches-images', true)
on conflict (id) do nothing;

-- 5. Storage Policies
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access') then
    create policy "Public Access" on storage.objects for select using ( bucket_id = 'catches-images' );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can upload images') then
    create policy "Authenticated users can upload images" on storage.objects for insert with check ( 
      bucket_id = 'catches-images' and auth.role() = 'authenticated'
    );
  end if;
end $$;

-- 6. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  total_catches integer default 0,
  favorite_species text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone.') then
    create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile.') then
    create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile.') then
    create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );
  end if;
end $$;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Create likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  catch_id uuid references public.catches on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, catch_id)
);

alter table public.likes enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view likes') then
    create policy "Anyone can view likes" on public.likes for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own likes') then
    create policy "Users can insert their own likes" on public.likes for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own likes') then
    create policy "Users can delete their own likes" on public.likes for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- 8. Create comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  catch_id uuid references public.catches on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.comments enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view comments') then
    create policy "Anyone can view comments" on public.comments for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own comments') then
    create policy "Users can insert their own comments" on public.comments for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete their own comments') then
    create policy "Users can delete their own comments" on public.comments for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- 9. Create reports table (Moderation)
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users on delete set null,
  catch_id uuid references public.catches on delete cascade,
  comment_id uuid references public.comments on delete cascade,
  reason text not null,
  status text default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reports enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can insert reports') then
    create policy "Users can insert reports" on public.reports for insert with check ( auth.role() = 'authenticated' );
  end if;
end $$;

-- 10. Create achievements table
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_type text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_type)
);

alter table public.achievements enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view achievements') then
    create policy "Anyone can view achievements" on public.achievements for select using ( true );
  end if;
end $$;

-- Function to increment user total_catches on new catch
create or replace function public.increment_total_catches()
returns trigger as $$
begin
  update public.profiles
  set total_catches = total_catches + 1
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_catch_inserted on public.catches;
create trigger on_catch_inserted
  after insert on public.catches
  for each row execute procedure public.increment_total_catches();

-- Final Constraints (Run separately if needed, but safe here)
do $$ 
begin
  -- 1. Backfill profiles for any existing catches that are missing them
  -- This prevents the foreign key constraint from failing due to orphaned data
  insert into public.profiles (id, display_name)
  select distinct user_id, 'Angler'
  from public.catches
  where user_id not in (select id from public.profiles)
  on conflict (id) do nothing;

  -- 2. Add the constraint
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'catches_profile_fk') then
    alter table public.catches add constraint catches_profile_fk foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;


