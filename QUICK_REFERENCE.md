# Lubuk Social Platform - Quick Reference Guide

## Quick Links

- **Main Guide:** `SOCIAL_PLATFORM_GUIDE.md`
- **Integration Steps:** `INTEGRATION_CHECKLIST.md`
- **Full Summary:** `SOCIAL_PLATFORM_SUMMARY.md`
- **Database Schema:** `supabase/social_schema.sql`
- **TypeScript Types:** `src/lib/types.ts`

---

## Service Quick Reference

### Profile Service
```typescript
import { profileService } from '@/features/profiles/profileService';

// Get profile
const profile = await profileService.getProfile('user-id');

// Update profile
await profileService.updateProfile(userId, { display_name, bio });

// Upload avatar
const url = await profileService.uploadAvatar(userId, file);

// Get user stats
const stats = await profileService.getUserStats(userId);

// Get recent catches
const catches = await profileService.getUserCatches(userId, limit=12);
```

### Follow Service
```typescript
import { followService } from '@/features/follows/followService';

// Follow user
await followService.followUser(followerId, followingId);

// Unfollow
await followService.unfollowUser(followerId, followingId);

// Check if following
const isFollowing = await followService.isFollowing(userId, targetId);

// Get followers
const followers = await followService.getFollowers(userId, limit=50, offset=0);

// Get following
const following = await followService.getFollowing(userId, limit=50, offset=0);

// Get follow stats
const { followers, following } = await followService.getFollowStats(userId);

// Get following feed
const feed = await followService.getFollowingFeed(userId, limit=20, offset=0);

// Get suggested users
const suggested = await followService.getSuggestedUsers(userId, limit=10);
```

### Likes Service
```typescript
import { likesService } from '@/features/likes/likesService';

// Like catch
await likesService.likeCatch(userId, catchId);

// Unlike catch
await likesService.unlikeCatch(userId, catchId);

// Toggle like
const isNowLiked = await likesService.toggleLike(userId, catchId);

// Check if liked
const hasLiked = await likesService.hasLiked(userId, catchId);

// Get all likes for catch
const likes = await likesService.getLikesForCatch(catchId);

// Get like stats
const stats = await likesService.getLikeStats(catchId, userId);

// Get like profiles
const profiles = await likesService.getLikeProfiles(catchId, limit=10);

// Get user's liked catches
const likedCatches = await likesService.getUserLikedCatches(userId, limit=20);
```

### Comments Service
```typescript
import { commentsService } from '@/features/comments/commentsService';

// Add comment
const comment = await commentsService.addComment(userId, catchId, content);

// Delete comment
await commentsService.deleteComment(commentId, userId);

// Get comments for catch
const comments = await commentsService.getCommentsForCatch(catchId);

// Get comment count
const count = await commentsService.getCommentCount(catchId);

// Get user's comments
const userComments = await commentsService.getUserComments(userId, limit=20);

// Get recent comments
const recent = await commentsService.getRecentComments(limit=20);
```

### Notifications Service
```typescript
import { notificationsService } from '@/features/notifications/notificationsService';

// Create notification
await notificationsService.createNotification(
  recipientId, actorId, 'follow', catchId
);

// Get notifications
const notifs = await notificationsService.getNotifications(userId, limit=20);

// Get unread count
const count = await notificationsService.getUnreadCount(userId);

// Mark as read
await notificationsService.markAsRead(notificationId);

// Mark all as read
await notificationsService.markAllAsRead(userId);

// Delete notification
await notificationsService.deleteNotification(notificationId);

// Clean old notifications
await notificationsService.deleteOldNotifications(userId, daysOld=30);

// Check for duplicates
const hasDuplicate = await notificationsService.hasDuplicateNotification(
  recipientId, actorId, 'like', catchId, withinMinutes=30
);

// Get notification summary
const summary = await notificationsService.getNotificationSummary(userId);

// Subscribe to real-time
const sub = notificationsService.subscribeToNotifications(
  userId, 
  (notification) => console.log('New notification!', notification)
);
```

### Activity Service
```typescript
import { activityService } from '@/features/notifications/activityService';

// Log activity
await activityService.logActivity(actorId, 'catch', catchId);
await activityService.logActivity(actorId, 'follow', null, followingId);
await activityService.logActivity(actorId, 'like', catchId);
await activityService.logActivity(actorId, 'comment', commentId);

// Get user's activity
const activities = await activityService.getUserActivity(userId, limit=20);

// Get following feed
const feed = await activityService.getFollowingActivityFeed(userId, limit=20);

// Get global activity
const global = await activityService.getGlobalActivity(limit=50);

// Get activity by type
const catches = await activityService.getActivityByType('catch', limit=20);
```

### Badges Service
```typescript
import { badgesService, BADGE_DEFINITIONS } from '@/features/notifications/badgesService';

// Check and award badges
const awarded = await badgesService.checkAndAwardBadges(userId);

// Get user badges
const badges = await badgesService.getUserBadges(userId);

// Award specific badge
const badge = await badgesService.awardBadge(userId, 'beginner_angler');

// Calculate reputation score
const score = await badgesService.calculateReputationScore(userId);

// Get reputation tier
const tier = await badgesService.getUserReputationTier(userId);
// Returns: 'beginner' | 'intermediate' | 'expert' | 'legend'

// Get leaderboard
const leaderboard = await badgesService.getLeaderboard(limit=50);

// Get users with badge
const users = await badgesService.getUsersWithBadge('top_contributor', limit=20);

// Badge definitions
const defs = BADGE_DEFINITIONS; // Map of all badge types
```

---

## Zustand Store Usage

```typescript
import { useSocialStore } from '@/lib/store/useSocialStore';

function MyComponent() {
  const {
    // Follow state
    following,
    toggleFollow,
    fetchFollowing,
    
    // Like state
    likes,
    toggleLike,
    fetchLikes,
    
    // Comment state
    comments,
    addComment,
    deleteComment,
    fetchComments,
    
    // Notification state
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    
    // UI state
    isLoading,
    error,
    
    // Utility
    reset
  } = useSocialStore();

  // Use any of these...
}
```

---

## Component Usage

### Profile Page
```typescript
import { UserProfilePage } from '@/features/profiles/UserProfilePage';

// In /app/profile/[id]/page.tsx
export default function Page({ params }) {
  return <UserProfilePage userId={params.id} />;
}
```

### Follow Button
```typescript
import { FollowButton, FollowStats } from '@/features/follows/FollowButton';

// Reusable follow button
<FollowButton userId="user-id" />

// With callback
<FollowButton 
  userId="user-id"
  onFollowChange={(isFollowing) => console.log(isFollowing)}
/>

// Display stats
<FollowStats userId="user-id" layout="horizontal" />
```

### Social Feed
```typescript
import { SocialFeed } from '@/features/feed/SocialFeed';

// Full feed with tabs
<SocialFeed />
```

### Notifications
```typescript
import { 
  NotificationBadge, 
  NotificationsCenter 
} from '@/features/notifications/NotificationsCenter';

const [opened, setOpened] = useState(false);

// Badge in header
<NotificationBadge onClick={() => setOpened(true)} />

// Drawer
<NotificationsCenter opened={opened} onClose={() => setOpened(false)} />
```

### Shareable Card
```typescript
import { ShareableCatchCardModal } from '@/features/sharing/ShareableCatchCard';

const [shareOpen, setShareOpen] = useState(false);

<ShareableCatchCardModal
  opened={shareOpen}
  onClose={() => setShareOpen(false)}
  catchData={catchData}
/>
```

### Followers/Following
```typescript
import { UserConnectionsPage } from '@/features/profiles/UserConnectionsPage';

// In /app/followers/[id]/page.tsx
export default function Page({ params }) {
  return <UserConnectionsPage userId={params.id} type="followers" />;
}

// In /app/following/[id]/page.tsx
export default function Page({ params }) {
  return <UserConnectionsPage userId={params.id} type="following" />;
}
```

---

## Common Patterns

### Optimistic Update Pattern
```typescript
// Like with optimistic UI
const handleLike = async (catchId) => {
  // Immediate UI update
  setHasLiked(true);
  setLikeCount(prev => prev + 1);
  
  // Then update server
  try {
    await likesService.toggleLike(userId, catchId);
  } catch (error) {
    // Revert on error
    setHasLiked(false);
    setLikeCount(prev => prev - 1);
  }
};
```

### Follow Toggle Pattern
```typescript
const handleFollow = async (targetId) => {
  const isFollowing = following.has(targetId);
  
  // Update store
  const newState = await toggleFollow(currentUserId, targetId);
  
  // Store handles state update
  // Components re-render automatically
};
```

### Real-time Subscription Pattern
```typescript
useEffect(() => {
  if (!user?.id) return;

  const subscription = notificationsService.subscribeToNotifications(
    user.id,
    (notification) => {
      // Handle new notification
      console.log('New:', notification);
      // Trigger toast, sound, etc.
    }
  );

  return () => subscription?.unsubscribe();
}, [user?.id]);
```

### Pagination Pattern
```typescript
const [page, setPage] = useState(0);
const limit = 20;

const loadMore = async () => {
  const offset = page * limit;
  const data = await followService.getFollowers(
    userId, 
    limit, 
    offset
  );
  setFollowers(prev => [...prev, ...data]);
  setPage(prev => prev + 1);
};
```

---

## API Endpoints

### Follows
```
POST   /api/follows
       Body: { follower_id, following_id }

DELETE /api/follows?follower_id=X&following_id=Y
```

### Likes
```
POST   /api/likes
       Body: { user_id, catch_id }

DELETE /api/likes?user_id=X&catch_id=Y
```

### Comments
```
POST   /api/comments
       Body: { user_id, catch_id, content }

DELETE /api/comments?comment_id=X
```

### Notifications
```
GET    /api/notifications?user_id=X&limit=50

PUT    /api/notifications?notification_id=X

DELETE /api/notifications?notification_id=X
```

---

## Database Queries (Raw SQL)

```sql
-- Get user's followers
SELECT p.* FROM profiles p
JOIN follows f ON p.id = f.follower_id
WHERE f.following_id = 'user-id'
ORDER BY f.created_at DESC;

-- Get user's following feed
SELECT c.* FROM catches c
JOIN follows f ON c.user_id = f.following_id
WHERE f.follower_id = 'user-id'
ORDER BY c.created_at DESC
LIMIT 20;

-- Get top liked catches
SELECT c.*, COUNT(l.id) as like_count
FROM catches c
LEFT JOIN likes l ON c.id = l.catch_id
GROUP BY c.id
ORDER BY like_count DESC
LIMIT 20;

-- Get user's badges
SELECT * FROM user_badges
WHERE user_id = 'user-id'
ORDER BY unlocked_at DESC;

-- Get leaderboard
SELECT p.*, COUNT(f.id) as followers
FROM profiles p
LEFT JOIN follows f ON p.id = f.following_id
GROUP BY p.id
ORDER BY followers DESC, p.total_catches DESC
LIMIT 50;
```

---

## Debugging Tips

### Check Follow Status
```typescript
const isFollowing = await followService.isFollowing(userId, targetId);
console.log(isFollowing);
```

### Verify Like Recorded
```typescript
const likes = await likesService.getLikesForCatch(catchId);
console.log('Likes:', likes);
```

### Check Notifications
```typescript
const notifs = await notificationsService.getNotifications(userId);
console.log('Notifications:', notifs);
```

### Monitor Store State
```typescript
// In browser console
const state = useSocialStore.getState();
console.log('Following:', state.following);
console.log('Unread:', state.unreadCount);
```

### Check Database
```sql
-- In Supabase SQL editor
SELECT * FROM follows LIMIT 10;
SELECT * FROM likes LIMIT 10;
SELECT * FROM notifications LIMIT 10;
SELECT * FROM activity_events LIMIT 10;
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Badge Types

```typescript
'beginner_angler'    // 1st catch
'toman_hunter'       // 5 Toman
'top_contributor'    // 100 likes received
'early_explorer'     // Joined in first month
'social_butterfly'   // 50 followers
'catch_master'       // 50 catches
```

---

## Notification Types

```typescript
'follow'   // User followed you
'like'     // User liked your catch
'comment'  // User commented on catch
```

---

## Reputation Tiers

```typescript
'beginner'      // Score: 0-99
'intermediate'  // Score: 100-249
'expert'        // Score: 250-499
'legend'        // Score: 500+
```

---

## File Locations

```
Features:
├── src/features/profiles/
├── src/features/follows/
├── src/features/likes/
├── src/features/comments/
├── src/features/notifications/
├── src/features/feed/
└── src/features/sharing/

Services:
├── profileService.ts
├── followService.ts
├── likesService.ts
├── commentsService.ts
├── notificationsService.ts
├── activityService.ts
└── badgesService.ts

Pages:
├── /app/profile/[id]/page.tsx
├── /app/followers/[id]/page.tsx
├── /app/following/[id]/page.tsx
├── /app/feed/page.tsx
└── /app/api/*/route.ts

Store:
└── src/lib/store/useSocialStore.ts

Types:
└── src/lib/types.ts
```

---

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "RLS policy violation" | Check permissions in Supabase |
| "Already liked" | Handle 23505 constraint error |
| "No rows found" | Verify user/catch exists |
| "Notifications not showing" | Check real-time is enabled |
| "Profile undefined" | Verify profile exists or handle null |

---

## Performance Tips

- Use pagination (limit 20-50 items)
- Cache frequently accessed profiles
- Debounce search queries (300ms)
- Lazy load images with Next.js Image
- Use dynamic imports for heavy components
- Batch requests when possible

---

**Last Updated:** May 20, 2026
**Version:** 1.0
**Status:** Production Ready
