# Lubuk Social Platform - Integration Checklist

## Quick Start (15-30 minutes)

### Step 1: Database Migration (5 min)

```bash
# 1. Copy social_schema.sql content
# 2. Go to Supabase Dashboard > SQL Editor
# 3. Create new query
# 4. Paste social_schema.sql content
# 5. Run the query

# Alternative (if using supabase CLI):
supabase db push --schema-only
```

### Step 2: Update Dependencies (2 min)

Verify these are in `package.json`:

```json
{
  "dependencies": {
    "zustand": "^5.0.13",
    "date-fns": "^4.1.0",
    "@tabler/icons-react": "^3.44.0"
  }
}
```

If missing, run:
```bash
npm install zustand@latest date-fns@latest @tabler/icons-react@latest
```

### Step 3: Add Files to Project (5 min)

Copy these core files:

```
✓ src/lib/types.ts                           (Types)
✓ src/features/profiles/profileService.ts    (Profile service)
✓ src/features/follows/followService.ts      (Follow service)
✓ src/features/likes/likesService.ts         (Likes service)
✓ src/features/comments/commentsService.ts   (Comments service)
✓ src/features/notifications/activityService.ts
✓ src/features/notifications/notificationsService.ts
✓ src/features/notifications/badgesService.ts
✓ src/lib/store/useSocialStore.ts            (Updated store)
✓ src/app/api/follows/route.ts               (API endpoints)
✓ src/app/api/likes/route.ts
✓ src/app/api/comments/route.ts
✓ src/app/api/notifications/route.ts
```

### Step 4: Create Page Routes (5 min)

Create these page files:

**`src/app/profile/[id]/page.tsx`:**
```typescript
'use client';
import { UserProfilePage } from '@/features/profiles/UserProfilePage';

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <UserProfilePage userId={params.id} />;
}
```

**`src/app/followers/[id]/page.tsx`:**
```typescript
'use client';
import { UserConnectionsPage } from '@/features/profiles/UserConnectionsPage';

export default function FollowersPage({ params }: { params: { id: string } }) {
  return <UserConnectionsPage userId={params.id} type="followers" />;
}
```

**`src/app/following/[id]/page.tsx`:**
```typescript
'use client';
import { UserConnectionsPage } from '@/features/profiles/UserConnectionsPage';

export default function FollowingPage({ params }: { params: { id: string } }) {
  return <UserConnectionsPage userId={params.id} type="following" />;
}
```

**`src/app/feed/page.tsx`:**
```typescript
'use client';
import { SocialFeed } from '@/features/feed/SocialFeed';

export default function FeedPage() {
  return <SocialFeed />;
}
```

### Step 5: Update Layout (3 min)

Update `src/app/layout.tsx` to add notifications:

```typescript
'use client';

import { useState } from 'react';
import { NotificationBadge, NotificationsCenter } from '@/features/notifications/NotificationsCenter';
import { BottomNav } from '@/components/ui/BottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notificationsOpened, setNotificationsOpened] = useState(false);

  return (
    <html>
      <body>
        {/* Header */}
        <header style={{ padding: '1rem', borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Lubuk</h1>
            <NotificationBadge onClick={() => setNotificationsOpened(true)} />
          </div>
        </header>

        {/* Main Content */}
        <main style={{ minHeight: 'calc(100vh - 120px)' }}>
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Notifications Drawer */}
        <NotificationsCenter
          opened={notificationsOpened}
          onClose={() => setNotificationsOpened(false)}
        />
      </body>
    </html>
  );
}
```

## File-by-File Integration

### 1. TypeScript Types

**File:** `src/lib/types.ts`

Provides all types for:
- Profiles, Follows, Likes, Comments
- Notifications, Activities, Badges
- Form data, API responses

### 2. Profile Service

**File:** `src/features/profiles/profileService.ts`

**Key Methods:**
- `getProfile(userId)` - Fetch user profile
- `updateProfile(userId, updates)` - Update profile
- `uploadAvatar(userId, file)` - Upload avatar
- `getUserCatches(userId)` - Get user's catches

**Example Usage:**
```typescript
import { profileService } from '@/features/profiles/profileService';

// In component:
const profile = await profileService.getProfile('user-123');
```

### 3. Follow Service

**File:** `src/features/follows/followService.ts`

**Key Methods:**
- `followUser(follower, following)` - Create follow
- `unfollowUser(follower, following)` - Remove follow
- `getFollowers(userId)` - Get follower list
- `getFollowing(userId)` - Get following list
- `getFollowingFeed(userId)` - Get feed from follows
- `getSuggestedUsers(userId)` - Get suggestions

**Example Usage:**
```typescript
import { followService } from '@/features/follows/followService';

// Follow a user
await followService.followUser(currentUserId, targetUserId);

// Get followers
const followers = await followService.getFollowers(userId);
```

### 4. Likes Service

**File:** `src/features/likes/likesService.ts`

**Key Methods:**
- `likeCatch(userId, catchId)` - Like a catch
- `unlikeCatch(userId, catchId)` - Unlike a catch
- `toggleLike(userId, catchId)` - Toggle like status
- `getLikesForCatch(catchId)` - Get all likes
- `getLikeStats(catchId, userId)` - Get stats

**Example Usage:**
```typescript
import { likesService } from '@/features/likes/likesService';

// Toggle like with optimistic UI
const isNowLiked = await likesService.toggleLike(userId, catchId);
```

### 5. Comments Service

**File:** `src/features/comments/commentsService.ts`

**Key Methods:**
- `addComment(userId, catchId, content)` - Add comment
- `deleteComment(commentId, userId)` - Delete comment
- `getCommentsForCatch(catchId)` - Get catch comments
- `getUserComments(userId)` - Get user's comments

**Example Usage:**
```typescript
import { commentsService } from '@/features/comments/commentsService';

// Add comment
await commentsService.addComment(userId, catchId, 'Nice fish!');

// Get comments
const comments = await commentsService.getCommentsForCatch(catchId);
```

### 6. Notifications Service

**File:** `src/features/notifications/notificationsService.ts`

**Key Methods:**
- `createNotification(recipient, actor, type, catchId)` - Create notification
- `getNotifications(userId)` - Get user notifications
- `markAsRead(notificationId)` - Mark as read
- `subscribeToNotifications(userId, callback)` - Real-time subscription

**Example Usage:**
```typescript
import { notificationsService } from '@/features/notifications/notificationsService';

// Subscribe to real-time
const sub = notificationsService.subscribeToNotifications(userId, (notif) => {
  console.log('New notification!', notif);
});
```

### 7. Activity Service

**File:** `src/features/notifications/activityService.ts`

**Key Methods:**
- `logActivity(actor, type, subject, targetUser)` - Log event
- `getUserActivity(userId)` - Get user's activity
- `getFollowingActivityFeed(userId)` - Get feed

**Example Usage:**
```typescript
import { activityService } from '@/features/notifications/activityService';

// Log activity after catch creation
await activityService.logActivity(userId, 'catch', catchId);
```

### 8. Badges Service

**File:** `src/features/notifications/badgesService.ts`

**Key Methods:**
- `checkAndAwardBadges(userId)` - Check and award
- `calculateReputationScore(userId)` - Get score
- `getUserBadges(userId)` - Get badges
- `getLeaderboard()` - Get top users

**Example Usage:**
```typescript
import { badgesService } from '@/features/notifications/badgesService';

// Award badges after action
await badgesService.checkAndAwardBadges(userId);

// Get user's reputation tier
const tier = await badgesService.getUserReputationTier(userId);
```

## Integration Points

### In FeedCard Component

Update existing FeedCard to use new systems:

```typescript
// Add to FeedCard.tsx
import { ShareableCatchCardModal } from '@/features/sharing/ShareableCatchCard';
import { useSocialStore } from '@/lib/store/useSocialStore';

function FeedCard({ catchData }: FeedCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { toggleLike, addComment, fetchComments, fetchLikes } = useSocialStore();
  const user = useAuthStore((state) => state.user);

  // ... existing code ...

  return (
    <>
      <Card>
        {/* ... existing content ... */}
        
        {/* Add share button */}
        <ActionIcon onClick={() => setShareModalOpen(true)}>
          <IconShare2 size={16} />
        </ActionIcon>
      </Card>

      {/* Share modal */}
      <ShareableCatchCardModal
        opened={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        catchData={catchData}
      />
    </>
  );
}
```

### In Map Component

Add follow button to marker popups:

```typescript
import { FollowButton } from '@/features/follows/FollowButton';

function MarkerPopup({ userId, catchData }: Props) {
  return (
    <Box>
      {/* Catch details */}
      <Text>{catchData.fish_species}</Text>
      
      {/* Follow button */}
      <FollowButton userId={userId} />
    </Box>
  );
}
```

### In Profile Component

Link to followers/following:

```typescript
<Text 
  onClick={() => router.push(`/followers/${userId}`)}
  style={{ cursor: 'pointer' }}
>
  {followerCount} Followers
</Text>
```

## Database Triggers Explained

### 1. Follower Count Triggers

Automatically updates `total_followers` and `total_following` in profiles table.

```sql
-- When follow created: increment both counts
-- When follow deleted: decrement both counts
```

### 2. Species Count Trigger

Updates `fish_species_count` when new catch added.

### 3. Total Catches Trigger

Already exists - increments `total_catches`.

## Testing

### Manual Testing Flow

1. **Follow System**
   - Follow a user → verify count increases
   - Unfollow → verify count decreases
   - Check follower list updates

2. **Likes System**
   - Like a catch → heart fills, count increases
   - Unlike → heart empties, count decreases
   - Verify optimistic updates

3. **Comments System**
   - Add comment → appears immediately
   - Delete own comment → removed
   - Verify profile links work

4. **Notifications**
   - Receive follow notification
   - Receive like notification
   - Receive comment notification
   - Mark as read
   - Delete notification

5. **Badges**
   - Create catch → "Beginner Angler" badge
   - Get 100 likes → "Top Contributor" badge
   - Get 50 followers → "Social Butterfly"

### Automated Testing (Optional)

```typescript
// Example test suite
describe('Social Platform', () => {
  it('should follow user', async () => {
    const result = await followService.followUser(user1, user2);
    expect(result).toBeDefined();
  });

  it('should like catch', async () => {
    await likesService.likeCatch(user1, catch1);
    const stats = await likesService.getLikeStats(catch1, user1);
    expect(stats.hasLiked).toBe(true);
  });

  it('should create notification', async () => {
    await notificationsService.createNotification(
      user2, user1, 'follow'
    );
    const notifs = await notificationsService.getNotifications(user2);
    expect(notifs.length).toBeGreaterThan(0);
  });
});
```

## Performance Monitoring

### Key Metrics to Track

1. **Follow operations**: < 500ms
2. **Like operations**: < 300ms  
3. **Comment operations**: < 600ms
4. **Notification fetch**: < 800ms
5. **Feed load**: < 2s for 20 items

### Optimization Tips

- Use pagination (limit 20 items)
- Implement infinite scroll with virtual scrolling
- Cache profile data locally
- Debounce search queries
- Preload user avatars

## Rollout Plan

### Phase 1 (Day 1-2)
- [ ] Deploy database schema
- [ ] Deploy services
- [ ] Deploy API endpoints
- [ ] Test basic functionality

### Phase 2 (Day 3-5)
- [ ] Deploy profile pages
- [ ] Deploy feed
- [ ] Deploy notifications UI
- [ ] Test user flows

### Phase 3 (Day 6+)
- [ ] Deploy activity feed
- [ ] Deploy badges system
- [ ] Deploy sharing features
- [ ] Monitor and optimize

## Rollback Plan

If issues arise:

```sql
-- Disable triggers temporarily
ALTER TABLE follows DISABLE TRIGGER on_follow_created;

-- Revert schema
-- Run previous backup

-- Re-enable
ALTER TABLE follows ENABLE TRIGGER on_follow_created;
```

## Monitoring & Analytics

### Key Events to Log

```typescript
// Track in analytics
- user_followed
- user_unfollowed
- catch_liked
- catch_unliked
- comment_added
- comment_deleted
- notification_viewed
- badge_awarded
```

## Support

For issues:

1. Check database logs in Supabase
2. Verify RLS policies
3. Test API endpoints directly
4. Check browser console
5. Review server logs

---

**Version:** 1.0
**Last Updated:** May 20, 2026
**Status:** Ready for Production
