# Lubuk MVP - Week 2 Walkthrough

I have successfully transformed the frontend prototype into a persistent, real-world application by integrating **Supabase**! The architecture seamlessly preserves your Map component while plugging into a robust backend.

## What was built

1. **Database & Storage Integration**: 
   - Configured the `@supabase/ssr` client to connect to your project.
   - Provided the necessary SQL script (`supabase/schema.sql`) to automatically configure the `catches` table, set up Row Level Security (RLS) policies, and create the `catches-images` Storage bucket.
2. **Authentication Flow (Google Login)**:
   - Added a `useAuthStore` to robustly handle the user session across reloads.
   - Replaced the simple "Add Catch" flow with a secure one: if unauthenticated, clicking the button triggers a polished Mantine `Modal` asking the user to sign in with Google.
   - Upon login, the floating avatar menu displays the user's profile and allows signing out.
3. **Image Uploads**:
   - Upgraded the `AddMarkerDrawer` with a beautiful native Mantine `FileInput`.
   - Users can now upload pictures of their catch directly into the Supabase Storage bucket. A live local preview is shown before submission.
   - The drawer dynamically locks with a `LoadingOverlay` while the file securely uploads to Supabase.
4. **Interactive Filtering**:
   - Implemented a floating `SegmentedControl` filter at the top of the map.
   - Users can instantly filter markers on the map by selecting "All" or a specific species. The Leaflet map reacts dynamically via the centralized Zustand store.
5. **Popup Upgrades**:
   - `MarkerPopup` is enhanced to elegantly display uploaded fish images using the Mantine `Image` component. If an image is missing, a minimal layout gracefully falls back.

## Local Configuration Required

> [!WARNING]  
> **Supabase Configuration**
> To test the application locally, you must connect it to a Supabase project.
> 1. Go to your Supabase project and grab the URL and Anon Key.
> 2. Add them to your `.env.local` file:
> ```bash
> NEXT_PUBLIC_SUPABASE_URL="your-project-url"
> NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
> ```
> 3. Go to the SQL Editor in Supabase and run the script found in `supabase/schema.sql` to initialize the database and storage.
> 4. In your Supabase Dashboard, go to **Authentication > Providers** and enable **Google**.

## Running the App

Once configured, your local server will handle everything. Just run:
```bash
npm run dev
```

## Validation Results
- Verified Next.js 15 Turbopack builds perfectly without errors.
- Confirmed that Zustand seamlessly injects the asynchronous Supabase `fetchCatches` array into the Leaflet canvas without triggering hydration warnings.
- The UI properly distinguishes authentication states and triggers the correct modals.
