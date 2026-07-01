-- ============================================================
-- LUBUK SOCIAL PLATFORM - EXTENDED DATABASE SCHEMA
-- ============================================================
-- This extends the existing schema with comprehensive social features
-- for Phase 1 & 2 of social platform development

-- ============================================================
-- 1. FOLLOWS TABLE - Social Graph
-- ============================================================
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users on delete cascade not null,
  following_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent self-follow and duplicate follows
  constraint no_self_follow check (follower_id != following_id),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view follows') then
    create policy "Anyone can view follows" on public.follows for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can create own follows') then
    create policy "Users can create own follows" on public.follows for insert with check ( auth.uid() = follower_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete own follows') then
    create policy "Users can delete own follows" on public.follows for delete using ( auth.uid() = follower_id );
  end if;
end $$;

-- Index for efficient follower/following queries
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- ============================================================
-- 2. EXTEND PROFILES TABLE
-- ============================================================
-- Alter existing profiles table to add social features
alter table public.profiles 
  add column if not exists bio text,
  add column if not exists total_followers integer default 0,
  add column if not exists total_following integer default 0,
  add column if not exists fish_species_count integer default 0,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- ============================================================
-- 3. ACTIVITY EVENTS TABLE - Activity Feed Foundation
-- ============================================================
create table if not exists public.activity_events (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references auth.users on delete cascade not null,
  event_type text not null, -- 'catch', 'follow', 'like', 'comment'
  subject_id uuid, -- catch_id or user_id depending on event_type
  subject_user_id uuid references auth.users on delete cascade, -- target user for follow events
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_events enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view activity events') then
    create policy "Anyone can view activity events" on public.activity_events for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can create activity events') then
    create policy "Users can create activity events" on public.activity_events for insert with check ( auth.uid() = actor_id );
  end if;
end $$;

create index if not exists idx_activity_events_actor on public.activity_events(actor_id);
create index if not exists idx_activity_events_subject_user on public.activity_events(subject_user_id);
create index if not exists idx_activity_events_created on public.activity_events(created_at desc);

-- ============================================================
-- 4. NOTIFICATIONS TABLE
-- ============================================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references auth.users on delete cascade not null,
  actor_id uuid references auth.users on delete cascade not null,
  event_type text not null, -- 'follow', 'like', 'comment'
  catch_id uuid references public.catches on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist if table already exists
alter table if exists public.notifications
  add column if not exists recipient_id uuid references auth.users on delete cascade,
  add column if not exists actor_id uuid references auth.users on delete cascade,
  add column if not exists event_type text,
  add column if not exists catch_id uuid references public.catches on delete cascade,
  add column if not exists is_read boolean default false,
  add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

alter table public.notifications enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own notifications') then
    create policy "Users can view own notifications" on public.notifications for select using ( auth.uid() = recipient_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert notifications') then
    create policy "Users can insert notifications" on public.notifications for insert with check ( auth.uid() = recipient_id or auth.uid() = actor_id );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own notifications') then
    create policy "Users can update own notifications" on public.notifications for update using ( auth.uid() = recipient_id );
  end if;
end $$;

create index if not exists idx_notifications_recipient on public.notifications(recipient_id);
create index if not exists idx_notifications_created on public.notifications(created_at desc);
create index if not exists idx_notifications_unread on public.notifications(recipient_id, is_read);

-- ============================================================
-- 5. BADGES / ACHIEVEMENTS TABLE (Enhanced)
-- ============================================================
create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  badge_type text not null, -- 'beginner_angler', 'toman_hunter', 'top_contributor', 'early_explorer'
  title text not null,
  description text,
  icon_emoji text,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_type)
);

alter table public.user_badges enable row level security;

do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view user badges') then
    create policy "Anyone can view user badges" on public.user_badges for select using ( true );
  end if;
end $$;

-- ============================================================
-- 6. TRIGGER FUNCTIONS FOR SOCIAL STATS
-- ============================================================

-- Update follower counts when a follow is created
create or replace function public.increment_follower_count()
returns trigger as $$
begin
  update public.profiles
  set total_followers = total_followers + 1
  where id = new.following_id;
  
  update public.profiles
  set total_following = total_following + 1
  where id = new.follower_id;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute procedure public.increment_follower_count();

-- Update follower counts when a follow is deleted
create or replace function public.decrement_follower_count()
returns trigger as $$
begin
  update public.profiles
  set total_followers = total_followers - 1
  where id = old.following_id;
  
  update public.profiles
  set total_following = total_following - 1
  where id = old.follower_id;
  
  return old;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_deleted on public.follows;
create trigger on_follow_deleted
  after delete on public.follows
  for each row execute procedure public.decrement_follower_count();

-- Update fish species count
create or replace function public.update_species_count()
returns trigger as $$
begin
  update public.profiles
  set fish_species_count = (
    select count(distinct fish_species)
    from public.catches
    where user_id = new.user_id
  )
  where id = new.user_id;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_catch_created_species on public.catches;
create trigger on_catch_created_species
  after insert on public.catches
  for each row execute procedure public.update_species_count();

-- ============================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================
create index if not exists idx_catches_user_id on public.catches(user_id);
create index if not exists idx_catches_created_at on public.catches(created_at desc);
create index if not exists idx_catches_species on public.catches(fish_species);
create index if not exists idx_likes_user_id on public.likes(user_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comments_catch_id on public.comments(catch_id);
create index if not exists idx_profiles_display_name on public.profiles(display_name);

-- ============================================================
-- 8. MATERIALIZED VIEW FOR TRENDING CATCHES (Optional, Phase 2)
-- ============================================================
-- This helps with trending functionality - likes count, comment count
create materialized view if not exists public.catch_stats as
select 
  c.id,
  c.user_id,
  c.fish_species,
  c.created_at,
  coalesce(l.like_count, 0) as like_count,
  coalesce(cm.comment_count, 0) as comment_count,
  coalesce(l.like_count, 0) + coalesce(cm.comment_count, 0) * 2 as engagement_score
from public.catches c
left join (
  select catch_id, count(*) as like_count
  from public.likes
  group by catch_id
) l on c.id = l.catch_id
left join (
  select catch_id, count(*) as comment_count
  from public.comments
  group by catch_id
) cm on c.id = cm.catch_id;

-- Create index on materialized view for performance
create index if not exists idx_catch_stats_engagement on public.catch_stats(engagement_score desc);
create index if not exists idx_catch_stats_created on public.catch_stats(created_at desc);

-- ============================================================
-- MIGRATION NOTE
-- ============================================================
-- Run: supabase db push --schema-only
-- or apply manually through Supabase dashboard
