// ============================================================
// TYPES - Comprehensive Social Platform Types
// ============================================================

// ============================================================
// PROFILES
// ============================================================
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  total_catches: number;
  total_followers: number;
  total_following: number;
  fish_species_count: number;
  favorite_species: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  display_name: string;
  bio: string;
  avatar_url?: string;
}

// ============================================================
// FOLLOWS / SOCIAL GRAPH
// ============================================================
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowStats {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

// ============================================================
// LIKES SYSTEM
// ============================================================
export interface Like {
  id: string;
  user_id: string;
  catch_id: string;
  created_at: string;
}

export interface LikeStats {
  count: number;
  hasLiked: boolean;
  likedBy: string[]; // user_ids
}

// ============================================================
// COMMENTS SYSTEM
// ============================================================
export interface Comment {
  id: string;
  user_id: string;
  catch_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export interface CommentWithProfile extends Comment {
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

export interface CommentFormData {
  content: string;
}

// ============================================================
// CATCHES (Enhanced)
// ============================================================
export interface Catch {
  id: string;
  user_id: string;
  fish_species: string;
  note: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CatchWithProfile extends Catch {
  profiles: Profile;
}

export interface CatchCard extends CatchWithProfile {
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
}

// ============================================================
// ACTIVITY EVENTS
// ============================================================
export type ActivityEventType = 'catch' | 'follow' | 'like' | 'comment';

export interface ActivityEvent {
  id: string;
  actor_id: string;
  event_type: ActivityEventType;
  subject_id: string | null;
  subject_user_id: string | null;
  created_at: string;
}

export interface ActivityEventWithProfiles extends ActivityEvent {
  actorProfile?: Profile;
  subjectProfile?: Profile;
}

// Activity Feed Item (for display)
export interface ActivityFeedItem {
  id: string;
  actor: Profile;
  action: string; // "caught", "followed", "liked", "commented"
  subject?: CatchCard | Profile;
  timestamp: string;
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export type NotificationEventType = 'follow' | 'like' | 'comment';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  event_type: NotificationEventType;
  catch_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithProfiles extends Notification {
  actor: Profile;
  catch?: CatchCard;
}

// Notification summary for display
export interface NotificationSummary {
  unreadCount: number;
  notifications: NotificationWithProfiles[];
}

// ============================================================
// BADGES / ACHIEVEMENTS
// ============================================================
export type BadgeType =
  | 'beginner_angler'
  | 'toman_hunter'
  | 'top_contributor'
  | 'early_explorer'
  | 'social_butterfly'
  | 'catch_master';

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  title: string;
  description: string;
  icon_emoji: string;
  unlocked_at: string;
}

export interface BadgeDefinition {
  type: BadgeType;
  title: string;
  description: string;
  icon_emoji: string;
  condition: (stats: any) => boolean;
}

// ============================================================
// FEEDS
// ============================================================
export interface FeedItem extends CatchCard {
  profiles: Profile;
}

export type FeedType = 'following' | 'trending' | 'nearby';

// ============================================================
// USER STATS / REPUTATION
// ============================================================
export interface UserStats {
  totalCatches: number;
  totalFollowers: number;
  totalFollowing: number;
  fishSpeciesCount: number;
  totalLikes: number;
  badges: Badge[];
  reputationScore: number;
}

export interface UserReputationScore {
  score: number;
  rank: 'beginner' | 'intermediate' | 'expert' | 'legend';
  percentile: number;
}

// ============================================================
// SOCIAL FEED TYPES
// ============================================================
export interface SocialFeedFilters {
  type: FeedType;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
  page: number;
}

// ============================================================
// SHAREABLE CATCH CARD
// ============================================================
export interface ShareableCatchCard {
  catchId: string;
  imageUrl: string;
  species: string;
  username: string;
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  timestamp: string;
  catchNote: string | null;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================
// STORE STATE TYPES
// ============================================================
export interface SocialStoreState {
  // Follows
  following: Set<string>;
  followers: Map<string, number>;
  isFollowing: boolean;

  // Likes
  likes: Map<string, LikeStats>;
  userLikes: Set<string>;

  // Comments
  comments: Map<string, CommentWithProfile[]>;

  // Notifications
  notifications: NotificationWithProfiles[];
  unreadCount: number;

  // Activity
  activity: ActivityFeedItem[];

  // Loading states
  isLoading: boolean;
  error: string | null;
}

// ============================================================
// FORM TYPES
// ============================================================
export interface CatchFormData {
  fish_species: string;
  note?: string;
  latitude: number;
  longitude: number;
  image?: File;
}

export interface ProfileUpdateFormData {
  display_name: string;
  bio?: string;
  avatar?: File;
}

// ============================================================
// FISHING SESSIONS
// ============================================================
export interface FishingSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  location_name: string | null;
  notes: string | null;
  weather_snapshot: any | null;
  created_at: string;
}

export interface SessionCoordinate {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// ============================================================
// GROUPS
// ============================================================
export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  creator_id: string | null;
  location_name: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles?: Profile;
}

// ============================================================
// TOURNAMENTS
// ============================================================
export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  target_species: string | null;
  rules: string | null;
  created_at: string;
}

export interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  catch_id: string;
  score: number;
  rank: number | null;
  created_at: string;
}

// ============================================================
// SPECIES COLLECTION (FishDex)
// ============================================================
export interface SpeciesDictionary {
  id: string;
  name: string;
  scientific_name: string | null;
  habitat: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface UserSpeciesCollection {
  user_id: string;
  species_id: string;
  first_caught_at: string;
  total_caught: number;
  biggest_weight: number | null;
  biggest_length: number | null;
  species?: SpeciesDictionary;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================
export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  badge_url: string | null;
  required_metric: string;
  target_value: number;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// ============================================================
// REPUTATION
// ============================================================
export interface UserReputation {
  user_id: string;
  score: number;
  rank_title: string;
  last_updated: string;
}

// ============================================================
// EXPORT
// ============================================================
