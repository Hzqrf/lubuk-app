# Lubuk Social Platform Implementation Guide

## Overview

This guide covers the complete implementation of Lubuk's social platform transformation from a fishing map utility to an Instagram + Strava for Fishing experience.

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── follows/route.ts          # Follow/unfollow endpoints
│   │   ├── likes/route.ts             # Like/unlike endpoints
│   │   ├── comments/route.ts          # Comment management
│   │   └── notifications/route.ts     # Notification endpoints
│   ├── profile/
│   │   └── [id]/page.tsx              # User profile pages
│   ├── feed/
│   │   └── page.tsx                   # Social feed
│   └── followers/
│       └── [id]/page.tsx              # Followers/following pages
├── features/
│   ├── profiles/
│   │   ├── profileService.ts          # Profile management service
│   │   └── UserProfilePage.tsx        # Profile UI component
│   ├── follows/
│   │   ├── followService.ts           # Follow system service
│   │   └── FollowButton.tsx           # Follow/unfollow button component
│   ├── likes/
│   │   └── likesService.ts            # Likes management service
│   ├── comments/
│   │   ├── commentsService.ts         # Comments management service
│   │   └── CommentDrawer.tsx          # Comments UI
│   ├── notifications/
│   │   ├── notificationsService.ts    # Notifications service
│   │   ├── activityService.ts         # Activity events service
│   │   ├── badgesService.ts           # Badges & reputation service
│   │   └── NotificationsCenter.tsx    # Notifications UI
│   ├── feed/
│   │   ├── SocialFeed.tsx             # Main social feed component
│   │   └── FeedCard.tsx               # Feed card component
│   └── sharing/
│       └── ShareableCatchCard.tsx     # Shareable catch cards
├── lib/
│   ├── types.ts                       # Comprehensive TypeScript types
│   └── store/
│       └── useSocialStore.ts          # Zustand social store
└── supabase/
    ├── schema.sql                     # Original schema
    └── social_schema.sql              # Extended schema for social features
```

## Phase 1: Database Setup

### 1. Run Schema Migrations

```bash
# Navigate to supabase dashboard and run:
# OR run locally:
supabase db push
```

**What gets created:**
- `follows` table - Social graph
- `activity_events` table - Activity feed
- `notifications` table - Real-time notifications
- `user_badges` table - Achievements
- Extended `profiles` table with bio, followers, following counts
- Materialized view `catch_stats` for trending

### 2. Set up RLS Policies

All policies are automatically created via triggers in the schema file.

### 3. Enable Real-time Subscriptions

In Supabase dashboard:
- Go to Realtime
- Enable for: `notifications`, `activity_events`

## Phase 2: Core Services Integration

### Services Overview

#### 1. Profile Service (`profileService.ts`)
```typescript
// Usage
import { profileService } from '@/features/profiles/profileService';

// Get profile
const profile = await profileService.getProfile(userId);

// Update profile
await profileService.updateProfile(userId, {
  display_name: 'New Name',
  bio: 'New bio'
});

// Upload avatar
const url = await profileService.uploadAvatar(userId, file);
```

#### 2. Follow Service (`followService.ts`)
```typescript
import { followService } from '@/features/follows/followService';

// Follow user
await followService.followUser(userId, targetId);

// Unfollow
await followService.unfollowUser(userId, targetId);

// Get followers
const followers = await followService.getFollowers(userId);

// Get suggested users
const suggested = await followService.getSuggestedUsers(userId);

// Get following feed
const feed = await followService.getFollowingFeed(userId);
```

#### 3. Likes Service (`likesService.ts`)
```typescript
import { likesService } from '@/features/likes/likesService';

// Like a catch
await likesService.likeCatch(userId, catchId);

// Toggle like
const isNowLiked = await likesService.toggleLike(userId, catchId);

// Get like stats
const stats = await likesService.getLikeStats(catchId, userId);
```

#### 4. Comments Service (`commentsService.ts`)
```typescript
import { commentsService } from '@/features/comments/commentsService';

// Add comment
await commentsService.addComment(userId, catchId, content);

// Get comments
const comments = await commentsService.getCommentsForCatch(catchId);

// Delete comment
await commentsService.deleteComment(commentId, userId);
```

#### 5. Notifications Service (`notificationsService.ts`)
```typescript
import { notificationsService } from '@/features/notifications/notificationsService';

// Create notification
await notificationsService.createNotification(
  recipientId,
  actorId,
  'like',
  catchId
);

// Get notifications
const notifications = await notificationsService.getNotifications(userId);

// Mark as read
await notificationsService.markAsRead(notificationId);

// Subscribe to real-time
const subscription = notificationsService.subscribeToNotifications(
  userId,
  (notification) => console.log('New notification!', notification)
);
```

#### 6. Badges Service (`badgesService.ts`)
```typescript
import { badgesService } from '@/features/notifications/badgesService';

// Check and award badges
const awardedBadges = await badgesService.checkAndAwardBadges(userId);

// Calculate reputation
const score = await badgesService.calculateReputationScore(userId);

// Get leaderboard
const leaderboard = await badgesService.getLeaderboard();
```

## Phase 3: UI Components Integration

### 1. User Profile Page

Create `/app/profile/[id]/page.tsx`:

```typescript
'use client';

import { UserProfilePage } from '@/features/profiles/UserProfilePage';

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <UserProfilePage userId={params.id} />;
}
```

### 2. Social Feed

Create `/app/feed/page.tsx`:

```typescript
'use client';

import { SocialFeed } from '@/features/feed/SocialFeed';

export default function FeedPage() {
  return <SocialFeed />;
}
```

### 3. Add Notifications UI to Layout

In `/app/layout.tsx`:

```typescript
import { NotificationBadge, NotificationsCenter } from '@/features/notifications/NotificationsCenter';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [notificationsOpened, setNotificationsOpened] = useState(false);

  return (
    <html>
      <body>
        {/* Header with notification badge */}
        <header>
          <NotificationBadge onClick={() => setNotificationsOpened(true)} />
        </header>

        {/* Notifications drawer */}
        <NotificationsCenter 
          opened={notificationsOpened}
          onClose={() => setNotificationsOpened(false)}
        />

        {/* Main content */}
        {children}
      </body>
    </html>
  );
}
```

## Phase 4: Zustand Store Usage

### Social Store

```typescript
import { useSocialStore } from '@/lib/store/useSocialStore';

function MyComponent() {
  const { following, likes, comments, toggleFollow, toggleLike } = useSocialStore();

  // Follow user
  const handleFollow = async (userId) => {
    const newFollowing = await toggleFollow(currentUserId, userId);
    console.log('Now following:', newFollowing);
  };

  // Like catch
  const handleLike = async (catchId) => {
    await toggleLike(catchId, userId);
  };

  return (
    // ... your component
  );
}
```

## Phase 5: Real-time Features

### Subscribe to Notifications

```typescript
import { notificationsService } from '@/features/notifications/notificationsService';

useEffect(() => {
  if (!user?.id) return;

  const subscription = notificationsService.subscribeToNotifications(
    user.id,
    (notification) => {
      // Handle new notification
      console.log('New notification:', notification);
      // Trigger toast, sound, etc.
    }
  );

  return () => {
    subscription?.unsubscribe();
  };
}, [user?.id]);
```

## Phase 6: Activity Feed

### Display Activity

```typescript
import { activityService } from '@/features/notifications/activityService';

const ActivityFeed = ({ userId }: { userId: string }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    activityService.getFollowingActivityFeed(userId).then(setActivities);
  }, [userId]);

  return (
    <Stack>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </Stack>
  );
};
```

## Phase 7: Badge System

### Award Badges Automatically

Call after user actions (catch, follow, receive likes):

```typescript
import { badgesService } from '@/features/notifications/badgesService';

// After creating a catch
await badgesService.checkAndAwardBadges(userId);

// Badges awarded automatically:
// - beginner_angler: First catch
// - toman_hunter: 5 toman catches
// - top_contributor: 100 likes received
// - early_explorer: Joined in first month
// - social_butterfly: 50 followers
// - catch_master: 50 catches
```

## API Routes

### Follow Endpoints

```
POST /api/follows
Body: { follower_id, following_id }

DELETE /api/follows?follower_id=X&following_id=Y
```

### Like Endpoints

```
POST /api/likes
Body: { user_id, catch_id }

DELETE /api/likes?user_id=X&catch_id=Y
```

### Comment Endpoints

```
POST /api/comments
Body: { user_id, catch_id, content }

DELETE /api/comments?comment_id=X
```

### Notification Endpoints

```
GET /api/notifications?user_id=X&limit=50

PUT /api/notifications?notification_id=X

DELETE /api/notifications?notification_id=X
```

## Environment Variables

Ensure these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Features Matrix

### Phase 1 - Complete

- [x] User Profiles with bio, stats
- [x] Follow/Unfollow system
- [x] Likes system with optimistic updates
- [x] Comments system
- [x] Social feed (Following, Trending, Activity)
- [x] Notifications center
- [x] Badge/Achievement system
- [x] Shareable catch cards
- [x] Profile customization

### Phase 2 - Foundation Ready

- [x] Activity feed infrastructure
- [x] Reputation scoring system
- [x] Leaderboard queries
- [x] Real-time subscriptions (ready for WebSocket)
- [x] Follow graph for personalization

## Performance Optimization

### Database Indexes

All indexes are created in the schema:

```sql
-- Key indexes for fast queries
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comments_catch_id ON comments(catch_id);
CREATE INDEX idx_activity_events_actor ON activity_events(actor_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
```

### Query Optimization

- Use select() with specific fields
- Limit results with pagination
- Cache user profiles
- Debounce frequent operations

### Lazy Loading

All components use React's dynamic imports:

```typescript
import dynamic from 'next/dynamic';

const UserProfilePage = dynamic(
  () => import('@/features/profiles/UserProfilePage'),
  { ssr: false }
);
```

## Testing Checklist

- [ ] Follow user and verify counts update
- [ ] Unfollow and verify counts decrease
- [ ] Like catch and verify engagement
- [ ] Add comment and verify display
- [ ] Receive notification for follow
- [ ] Receive notification for like
- [ ] Receive notification for comment
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Upload avatar
- [ ] Update profile bio
- [ ] View followers/following lists
- [ ] View activity feed
- [ ] Check badges awarded
- [ ] View leaderboard
- [ ] Share catch card
- [ ] Download catch card

## Troubleshooting

### Notifications not showing

1. Check notifications table has rows: `SELECT * FROM notifications LIMIT 10;`
2. Verify RLS policies allow read: `SELECT * FROM pg_policies WHERE tablename='notifications';`
3. Check real-time is enabled in Supabase dashboard

### Follow counts not updating

1. Verify triggers exist: `SELECT * FROM pg_trigger WHERE tgrelname='follows';`
2. Check profiles table has columns: `SELECT * FROM profiles LIMIT 1;`
3. Run manual trigger: `SELECT increment_follower_count();`

### Comments not appearing

1. Check RLS policy on comments table
2. Verify profiles relationship is loaded
3. Check comment content length <= 1000 chars

## Future Enhancements

- [ ] Push notifications
- [ ] Email notifications
- [ ] User blocking
- [ ] Muting users
- [ ] Trending algorithm
- [ ] Hashtags system
- [ ] Mentions (@username)
- [ ] DMs (Direct messages)
- [ ] Reported content handling
- [ ] Content moderation tools
- [ ] Analytics dashboard
- [ ] Social media sharing integrations

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Mantine UI Components](https://mantine.dev/components/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Last Updated:** May 20, 2026
**Status:** Production Ready - Phase 1 & Foundation for Phase 2
