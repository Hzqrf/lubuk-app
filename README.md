# Lubuk 🎣

**Lubuk** is a modern, community-driven fishing map platform. It allows anglers to explore fishing spots, pinpoint their precise locations, and log their catches with photos and details on an interactive map.

![Lubuk MVP Presentation](https://placehold.co/800x400?text=Lubuk+Fishing+Map)

## ✨ Features

- 🗺️ **Interactive Open-Source Map**: Built entirely on top of React Leaflet and OpenStreetMap. No paid Mapbox APIs required.
- 📍 **Precise Geolocation**: Instantly fly to your current location with a single tap, dropping a custom "You are here" marker.
- 🐟 **Custom Catch Logging**: Add markers for your catches directly on the map. Select species, write notes, and upload photos.
- 📸 **Cloud Image Storage**: Catch photos are securely uploaded and served globally via Supabase Storage.
- 🔐 **Authentication**: Secure Google OAuth integration ensuring only authenticated users can pollute the map with their catches.
- 🎯 **Dynamic Filtering**: Instantly filter the map to only show specific fish species (e.g., Haruan, Toman, Peacock Bass) without reloading the page.
- 🌓 **Dark Mode Support**: Deep integration with Mantine's color schemes with a custom dark-mode fallback tile layer.
- 📱 **Mobile First**: Built with responsive Drawers and Modals that feel like native iOS/Android applications.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Mantine UI v7](https://mantine.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Map Engine**: [React Leaflet](https://react-leaflet.js.org/) + [OpenStreetMap](https://www.openstreetmap.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Auth**: [Supabase](https://supabase.com/)

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lubuk-app.git
cd lubuk-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase (Backend)

You need a Supabase project to handle the database, authentication, and image storage.

1. Create a new project on [Supabase](https://supabase.com/).
2. Enable **Google Auth** in `Authentication > Providers`.
3. Navigate to the **SQL Editor** in your Supabase dashboard.
4. Copy the contents of the `supabase/schema.sql` file from this repository and run it. This script automatically:
   - Creates the `catches` table.
   - Sets up Row Level Security (RLS) policies.
   - Creates the `catches-images` public storage bucket.

### 4. Configure Environment Variables

Create a `.env.local` file in the root of the project by copying the example:

```bash
cp .env.example .env.local
```

Update it with your Supabase credentials found in `Project Settings > API`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

---

## 🏗️ Architecture Notes

To prevent Next.js Server-Side Rendering (SSR) from crashing when accessing `window` objects required by Leaflet, the map component (`MapComponent.tsx`) is heavily isolated. It is dynamically imported into `page.tsx` with `ssr: false`. 

All Supabase clients rely on `@supabase/ssr` to ensure secure browser state. Image compression and resizing are currently handled through native file validation bounds prior to upload.

## 📄 License

This project is open-source and available under the MIT License.
