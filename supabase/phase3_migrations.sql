-- Phase 3 Migrations for Lubuk Community Ecosystem

-- 1. Fishing Sessions
CREATE TABLE IF NOT EXISTS public.fishing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location_name TEXT,
    notes TEXT,
    weather_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We assume session points might be stored in a separate table if tracking continuously
CREATE TABLE IF NOT EXISTS public.session_coordinates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.fishing_sessions(id) ON DELETE CASCADE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.catches ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.fishing_sessions(id) ON DELETE SET NULL;

-- 2. Groups
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' NOT NULL, -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tournaments (Admin Only as requested)
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    target_species TEXT,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tournament_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    catch_id UUID REFERENCES public.catches(id) ON DELETE CASCADE NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tournament_id, catch_id)
);

-- 4. Species Collection (FishDex)
CREATE TABLE IF NOT EXISTS public.species_dictionary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    habitat TEXT,
    rarity TEXT DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'legendary'
    description TEXT,
    image_url TEXT,
    color TEXT DEFAULT 'blue',   -- marker color: green, red, blue, yellow, teal, purple, orange
    emoji TEXT DEFAULT '🐟',     -- map marker emoji
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns to existing table if running as update
ALTER TABLE public.species_dictionary ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';
ALTER TABLE public.species_dictionary ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🐟';

CREATE TABLE IF NOT EXISTS public.user_species_collection (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    species_id UUID REFERENCES public.species_dictionary(id) ON DELETE CASCADE NOT NULL,
    first_caught_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_caught INTEGER DEFAULT 1 NOT NULL,
    biggest_weight DOUBLE PRECISION,
    biggest_length DOUBLE PRECISION,
    PRIMARY KEY (user_id, species_id)
);

-- 5. Achievements & Reputation
CREATE TABLE IF NOT EXISTS public.achievement_dictionary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    badge_url TEXT,
    required_metric TEXT NOT NULL, -- e.g., 'total_catches', 'different_species'
    target_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievement_dictionary(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_reputation (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    score INTEGER DEFAULT 0 NOT NULL,
    rank_title TEXT DEFAULT 'New Angler' NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pre-populate Species (Malaysian Fish)
INSERT INTO public.species_dictionary (name, scientific_name, habitat, rarity, description, color, emoji) VALUES
('Haruan',       'Channa striata',        'Freshwater, swamps, paddy fields',  'common',    'Common snakehead, an aggressive and hardy predator popular with lure anglers.',          'green',  '🐟'),
('Toman',        'Channa micropeltes',    'Lakes, rivers, reservoirs',          'uncommon',  'Giant snakehead, one of the most powerful freshwater fighters in Malaysia.',              'red',    '🐡'),
('Patin',        'Pangasius nasutus',     'Rivers, lakes',                      'common',    'Malaysian catfish commonly targeted by bottom anglers using dough or shrimp paste.',      'blue',   '🐋'),
('Peacock Bass', 'Cichla ocellaris',      'Reservoirs, dams',                   'uncommon',  'Introduced sport fish known for its explosive strikes and beautiful markings.',            'yellow', '🐠'),
('Tilapia',      'Oreochromis niloticus', 'Ponds, rivers, rice fields',         'common',    'Widely found in still and slow-moving waters, a reliable catch for beginners.',           'teal',   '🎣'),
('Sebarau',      'Hampala macrolepidota', 'Clear, fast-flowing rivers',         'rare',      'Hampala barb, a prized sport fish that favours pristine jungle streams.',                 'purple', '🎏'),
('Kelah',        'Tor tambroides',        'Pristine jungle rivers',             'legendary', 'The Malaysian Mahseer – king of river fish, protected and revered by anglers.',           'orange', '👑'),
('Baung',        'Mystus nemurus',        'Rivers, estuaries',                  'common',    'Common river catfish with long whiskers, often caught at night.',                         'blue',   '🐠'),
('Lampam',       'Barbonymus schwanenfeldii','Floodplains, rivers',             'common',    'Tinfoil barb, a schooling fish frequently caught in large numbers.',                      'teal',   '🐟'),
('Siakap',       'Lates calcarifer',      'Estuaries, mangroves, coastal',      'uncommon',  'Asian sea bass (barramundi), popular in both saltwater and freshwater fishing.',           'green',  '🎣'),
('Tenggiri',     'Scomberomorus commerson','Offshore, open sea',                'rare',      'Spanish mackerel, a prized offshore game fish known for blazing speed.',                  'blue',   '🐋'),
('Jenahak',      'Lutjanus argentimaculatus','Coastal reefs, estuaries',        'uncommon',  'Mangrove jack, a hard-fighting reef and estuary predator.',                               'red',    '🐡'),
('Kerapu',       'Epinephelus spp.',      'Coral reefs, rocky coastlines',      'rare',      'Grouper species highly prized for their taste and powerful runs near structure.',          'orange', '🐠'),
('Ikan Duri',    'Pangasius micronemus',  'Rivers, lakes',                      'common',    'River catfish with sharp pectoral spines, a staple catch in kampung rivers.',             'blue',   '🎣'),
('Ikan Yu Pari', 'Carcharhinus leucas',   'Coastal, estuaries',                 'legendary', 'Bull shark occasionally found in Malaysian estuaries, an extremely rare encounter.',       'red',    '🦈')
ON CONFLICT (name) DO UPDATE SET
    scientific_name = EXCLUDED.scientific_name,
    habitat         = EXCLUDED.habitat,
    rarity          = EXCLUDED.rarity,
    description     = EXCLUDED.description,
    color           = EXCLUDED.color,
    emoji           = EXCLUDED.emoji;

-- Pre-populate Achievements
INSERT INTO public.achievement_dictionary (title, description, required_metric, target_value) VALUES
('First Catch', 'Recorded your very first catch', 'total_catches', 1),
('10 Catches', 'Reached 10 total catches', 'total_catches', 10),
('100 Catches', 'Reached 100 total catches', 'total_catches', 100),
('Explorer', 'Visited 5 different locations', 'locations_visited', 5),
('Haruan Hunter', 'Caught 5 Haruan', 'species_haruan', 5)
ON CONFLICT (title) DO NOTHING;

-- RLS & Policies
ALTER TABLE public.fishing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_coordinates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_species_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- Basic Policies (More complex ones can be added later)
-- Anyone can view public data
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view group posts" ON public.group_posts;
CREATE POLICY "Anyone can view group posts" ON public.group_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view tournament entries" ON public.tournament_entries;
CREATE POLICY "Anyone can view tournament entries" ON public.tournament_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view species dictionary" ON public.species_dictionary;
CREATE POLICY "Anyone can view species dictionary" ON public.species_dictionary FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievement_dictionary;
CREATE POLICY "Anyone can view achievements" ON public.achievement_dictionary FOR SELECT USING (true);

-- User specific data
DROP POLICY IF EXISTS "Users can manage their sessions" ON public.fishing_sessions;
CREATE POLICY "Users can manage their sessions" ON public.fishing_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their session coordinates" ON public.session_coordinates;
CREATE POLICY "Users can manage their session coordinates" ON public.session_coordinates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.fishing_sessions fs WHERE fs.id = session_id AND fs.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their species collection" ON public.user_species_collection;
CREATE POLICY "Users can view their species collection" ON public.user_species_collection FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their achievements" ON public.user_achievements;
CREATE POLICY "Users can view their achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their reputation" ON public.user_reputation;
CREATE POLICY "Users can view their reputation" ON public.user_reputation FOR SELECT USING (auth.uid() = user_id);

-- Group Actions
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Group members can insert posts" ON public.group_posts;
CREATE POLICY "Group members can insert posts" ON public.group_posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);
