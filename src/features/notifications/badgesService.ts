// ============================================================
// BADGES SERVICE - Reputation & Achievements
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { Badge, BadgeType, BadgeDefinition } from '@/lib/types';
import { profileService } from '@/features/profiles/profileService';

const supabase = createClient();

// Badge definitions
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  beginner_angler: {
    type: 'beginner_angler',
    title: 'Beginner Angler',
    description: 'Caught your first fish',
    icon_emoji: '🎣',
    condition: (stats) => stats.totalCatches >= 1,
  },
  toman_hunter: {
    type: 'toman_hunter',
    title: 'Toman Hunter',
    description: 'Caught 5 Toman',
    icon_emoji: '🐟',
    condition: (stats) => stats.tomanCount >= 5,
  },
  top_contributor: {
    type: 'top_contributor',
    title: 'Top Contributor',
    description: 'Accumulated 100 likes',
    icon_emoji: '⭐',
    condition: (stats) => stats.totalLikesReceived >= 100,
  },
  early_explorer: {
    type: 'early_explorer',
    title: 'Early Explorer',
    description: 'Joined in the first month',
    icon_emoji: '🗺️',
    condition: (stats) => {
      const joinDate = new Date(stats.created_at);
      const launchDate = new Date('2026-05-01');
      return joinDate <= launchDate;
    },
  },
  social_butterfly: {
    type: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Have 50 followers',
    icon_emoji: '🦋',
    condition: (stats) => stats.totalFollowers >= 50,
  },
  catch_master: {
    type: 'catch_master',
    title: 'Catch Master',
    description: 'Caught 50 fish',
    icon_emoji: '👑',
    condition: (stats) => stats.totalCatches >= 50,
  },
};

export const badgesService = {
  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
  },

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeType: BadgeType): Promise<Badge | null> {
    try {
      const badgeDef = BADGE_DEFINITIONS[badgeType];
      if (!badgeDef) {
        throw new Error(`Unknown badge type: ${badgeType}`);
      }

      // Check if user already has this badge
      const existing = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badgeType)
        .single();

      if (!existing.error || existing.data) {
        return null; // Already has this badge
      }

      const { data, error } = await supabase
        .from('user_badges')
        .insert([
          {
            user_id: userId,
            badge_type: badgeType,
            title: badgeDef.title,
            description: badgeDef.description,
            icon_emoji: badgeDef.icon_emoji,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  },

  /**
   * Check and award badges for a user
   */
  async checkAndAwardBadges(userId: string): Promise<BadgeType[]> {
    try {
      const profile = await profileService.getProfile(userId);
      if (!profile) return [];

      // Get user's catch data
      const { data: catches } = await supabase
        .from('catches')
        .select('fish_species')
        .eq('user_id', userId);

      const stats = {
        totalCatches: profile.total_catches,
        totalFollowers: profile.total_followers,
        totalLikesReceived: 0, // Would need to calculate from likes
        tomanCount: (catches || []).filter((c) => c.fish_species === 'toman').length,
        created_at: profile.created_at,
      };

      // Check each badge condition
      const awardedBadges: BadgeType[] = [];

      for (const [badgeType, badgeDef] of Object.entries(BADGE_DEFINITIONS)) {
        if (badgeDef.condition(stats)) {
          const awarded = await this.awardBadge(userId, badgeType as BadgeType);
          if (awarded) {
            awardedBadges.push(badgeType as BadgeType);
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  },

  /**
   * Calculate reputation score
   */
  async calculateReputationScore(userId: string): Promise<number> {
    try {
      const profile = await profileService.getProfile(userId);
      if (!profile) return 0;

      // Get likes received
      const { count: likesReceived } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in(
          'catch_id',
          (
            await supabase.from('catches').select('id').eq('user_id', userId)
          ).data?.map((c) => c.id) || []
        );

      // Get badges
      const badges = await this.getUserBadges(userId);

      // Calculate score
      const catchesScore = profile.total_catches * 10;
      const followersScore = profile.total_followers * 5;
      const likesScore = (likesReceived || 0) * 2;
      const badgesScore = badges.length * 25;

      return catchesScore + followersScore + likesScore + badgesScore;
    } catch (error) {
      console.error('Error calculating reputation score:', error);
      return 0;
    }
  },

  /**
   * Get user's reputation tier
   */
  async getUserReputationTier(userId: string): Promise<'beginner' | 'intermediate' | 'expert' | 'legend'> {
    try {
      const score = await this.calculateReputationScore(userId);

      if (score >= 500) return 'legend';
      if (score >= 250) return 'expert';
      if (score >= 100) return 'intermediate';
      return 'beginner';
    } catch (error) {
      console.error('Error getting reputation tier:', error);
      return 'beginner';
    }
  },

  /**
   * Get leaderboard (top users by reputation)
   */
  async getLeaderboard(limit = 50): Promise<any[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_followers', { ascending: false })
        .order('total_catches', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Enrich with badges and reputation
      return Promise.all(
        (profiles || []).map(async (profile) => {
          const badges = await this.getUserBadges(profile.id);
          const score = await this.calculateReputationScore(profile.id);
          return { ...profile, badges, reputationScore: score };
        })
      );
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  /**
   * Get users with a specific badge
   */
  async getUsersWithBadge(badgeType: BadgeType, limit = 20): Promise<any[]> {
    try {
      const { data: badgeData, error: badgeError } = await supabase
        .from('user_badges')
        .select('user_id')
        .eq('badge_type', badgeType)
        .limit(limit);

      if (badgeError) throw badgeError;

      const userIds = badgeData?.map((b) => b.user_id) || [];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      return profiles || [];
    } catch (error) {
      console.error('Error fetching users with badge:', error);
      return [];
    }
  },
};
