# Project Structure

## The Redwood Portal - Complete Implementation

### Core Features Implemented

✅ **Entry Way (Auth)** - `components/EntryWay.tsx`
- Landing page with redwood canopy background image
- Name dropdown: "Identify yourself in the grove"
- Magic word authentication
- Smooth transition to dashboard

✅ **Canopy (Dashboard)** - `components/Canopy.tsx`
- Personalized greeting: "Welcome back to the clearing, [Name]"
- Woodland mood selector with three options:
  - Quiet Moss 🌿
  - Chaotic Squirrel 🐿️
  - Ancient Burl 🌳
- Mood icon displayed next to name
- Updates Google Sheet on selection

✅ **Root System (Planning)** - `components/RootSystem.tsx`
- Fetches events from Google Sheet
- Event cards with In/Out toggle buttons
- Secret events only shown to invited guests
- Real-time updates to Google Sheet

✅ **Whispering Wall (Guestbook)** - `components/WhisperingWall.tsx`
- Floating leaves design with masonry grid
- Soft green shades with random rotations
- 200 character limit
- Form to add new notes
- Displays all guest notes with timestamps

✅ **Forest Path (Itinerary)** - `components/ForestPath.tsx`
- Vertical timeline (trunk) with events branching off
- Mist Level status bar at top
- Events sorted chronologically
- Shows user's response status

✅ **Admin Mode** - `components/Navigation.tsx`
- Hidden admin icon (gear) for user "Stef"
- Direct link to Google Sheet
- Only visible when logged in as Stef

✅ **Navigation** - `components/Navigation.tsx`
- Sticky header with backdrop blur
- Desktop and mobile responsive menu
- Smooth transitions between pages
- Logout functionality

### Technical Implementation

**Framework & Tools:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with custom theme
- Framer Motion for animations

**Styling:**
- Redwood Minimalist theme
- Deep moss greens (#2D3A27)
- Bark browns
- Morning mist greys (#E5E7E6)
- Cormorant Garamond serif font
- Dappled light CSS gradients
- Mobile-responsive design

**Backend Integration:**
- Google Sheets via Google Apps Script
- RESTful API pattern
- Error handling and loading states
- Environment variable configuration

**Authentication:**
- localStorage-based auth
- Magic word verification
- Route protection
- Session persistence

### File Structure

```
stef40/
├── app/
│   ├── canopy/page.tsx          # Dashboard page
│   ├── forest-path/page.tsx      # Itinerary page
│   ├── root-system/page.tsx      # Planning page
│   ├── whispering-wall/page.tsx # Guestbook page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Entry way (home)
├── components/
│   ├── Canopy.tsx                # Dashboard component
│   ├── EntryWay.tsx              # Auth component
│   ├── ForestPath.tsx            # Itinerary component
│   ├── Navigation.tsx            # Nav with admin mode
│   ├── RootSystem.tsx            # Planning component
│   └── WhisperingWall.tsx        # Guestbook component
├── lib/
│   ├── auth.ts                   # Auth utilities
│   └── useGoogleSheets.ts        # Google Sheets API
├── google-apps-script-example.js  # Backend script template
├── middleware.ts                  # Route middleware
├── package.json                   # Dependencies
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
├── README.md                      # Project overview
└── SETUP.md                       # Setup instructions
```

### Environment Variables Required

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=your_google_apps_script_url
NEXT_PUBLIC_MAGIC_WORD=redwood
NEXT_PUBLIC_GOOGLE_SHEET_URL=your_google_sheet_url
```

### Next Steps

1. **Set up Google Sheet** with required tabs (see SETUP.md)
2. **Deploy Google Apps Script** (see google-apps-script-example.js)
3. **Configure environment variables** in `.env.local`
4. **Update guest names** in `components/EntryWay.tsx`
5. **Run `npm install`** to install dependencies
6. **Run `npm run dev`** to start development server

### Design Philosophy

The site embodies "Vibecoder" aesthetics:
- Low-tech utility (Google Sheets backend)
- High-concept design (redwood forest theme)
- Soulful, mindful experience
- Elegant minimalism
- Grounded in nature

Every interaction is designed to feel like walking through a redwood grove - calm, intentional, and beautiful.

