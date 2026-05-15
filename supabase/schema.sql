-- Supabase Schema for Lubuk MVP

-- 1. Create catches table
create table public.catches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
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
-- Anyone can view catches
create policy "Anyone can view catches"
  on public.catches for select
  using ( true );

-- Authenticated users can insert their own catches
create policy "Authenticated users can insert catches"
  on public.catches for insert
  with check ( auth.uid() = user_id );

-- 4. Create Storage Bucket for images
insert into storage.buckets (id, name, public) 
values ('catches-images', 'catches-images', true);

-- 5. Storage Policies
-- Anyone can read images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'catches-images' );

-- Authenticated users can upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'catches-images' 
    and auth.role() = 'authenticated'
  );
