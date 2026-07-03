# CoopKeeper - Chicken Coop Tracker

A beautiful, offline-first chicken coop management tracker built with Next.js, TypeScript, and Tailwind CSS. All data is stored locally in your browser using localStorage - no backend, database, authentication, or internet connection required.

## Features

### 🥚 **Egg Tracker**
- Track daily egg count entries
- View today's egg count
- See weekly total automatically
- Daily log history with ability to delete entries

### 🧹 **Cleaning Log**
- Log coop cleaning activities with timestamps and notes
- View recent cleaning entries
- Keep track of maintenance tasks

### 🌾 **Feed Log**
- Record feed type (Pellets, Scratch, Treats, Vegetables, Other)
- Add optional notes with each feeding
- Track feeding history

### 🐔 **Favorite Hens**
- Add and manage your hens with name, breed, and notes
- Mark hens as favorites with a ⭐
- Edit hen notes anytime
- Delete hens when needed

### ⚖️ **Weight Tracker**
- Track individual hen weights over time
- Record weight by date
- View weight history organized by hen
- Track trends for individual birds

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser localStorage (no server required)
- **UI**: Responsive, mobile-friendly design

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
coopkeeper/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with component grid
│   ├── globals.css         # Global styles
│   └── favicon.ico
├── components/
│   ├── EggTracker.tsx      # Egg count tracking
│   ├── CleaningLog.tsx     # Coop cleaning log
│   ├── FeedLog.tsx         # Feed tracking
│   ├── FavoriteHens.tsx    # Hen management
│   └── WeightTracker.tsx   # Weight tracking
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   └── storage.ts          # localStorage utilities
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

## Component Details

### EggTracker (`components/EggTracker.tsx`)
- `use client` component for interactivity
- Manages daily egg entries
- Calculates weekly totals automatically
- Hydration-aware with `isHydrated` state

### CleaningLog (`components/CleaningLog.tsx`)
- Records cleaning activities with timestamps
- Displays entries sorted by date (newest first)
- Textarea for detailed notes
- Delete individual entries

### FeedLog (`components/FeedLog.tsx`)
- Dropdown selector for feed type
- Optional notes field
- Shows all feed entries with type badges
- Recent logs sorted by date

### FavoriteHens (`components/FavoriteHens.tsx`)
- Add new hens with name and breed
- Toggle favorite status with ⭐
- Edit notes for each hen
- Delete hens

### WeightTracker (`components/WeightTracker.tsx`)
- Select hen from dropdown (requires hens to be added first)
- Record weight with date
- View history grouped by hen
- Track changes over time

## localStorage API

All data is managed through utilities in `lib/storage.ts`:

### Egg Tracker
- `getEggEntries()` - Get all egg entries
- `addEggEntry(count)` - Add eggs for today
- `removeEggEntry(id)` - Delete an entry
- `getWeeklyEggTotal()` - Calculate 7-day total

### Cleaning Log
- `getCleaningEntries()` - Get all entries
- `addCleaningEntry(notes)` - Add new entry
- `removeCleaningEntry(id)` - Delete entry

### Feed Log
- `getFeedEntries()` - Get all entries
- `addFeedEntry(feedType, notes)` - Log feeding
- `removeFeedEntry(id)` - Delete entry

### Favorite Hens
- `getHens()` - Get all hens
- `addHen(name, breed, notes)` - Add hen
- `removeHen(id)` - Delete hen
- `toggleHenFavorite(id)` - Toggle favorite status
- `updateHenNotes(id, notes)` - Update hen notes
- `getFavoriteHens()` - Get favorite hens only

### Weight Tracker
- `getWeightEntries()` - Get all entries
- `addWeightEntry(henName, weight)` - Record weight
- `removeWeightEntry(id)` - Delete entry
- `getHenWeights(henName)` - Get weights for specific hen

## Data Structure

All data is stored as a single JSON object in localStorage:

```typescript
{
  eggs: {
    entries: [{ id, date, count }]
  },
  cleaning: {
    entries: [{ id, date, notes }]
  },
  feed: {
    entries: [{ id, date, feedType, notes }]
  },
  hens: {
    hens: [{ id, name, breed, isFavorite, notes }]
  },
  weights: {
    entries: [{ id, henName, date, weight }]
  }
}
```

## Design Features

- **Rustic Farm Theme**: Warm colors with gradient background (yellows, oranges, reds)
- **Color-Coded Sections**:
  - 🥚 Egg Tracker: Amber/gold theme
  - 🧹 Cleaning Log: Green theme
  - 🌾 Feed Log: Orange theme
  - 🐔 Favorite Hens: Pink theme
  - ⚖️ Weight Tracker: Blue theme
- **Responsive Grid**: Adapts to mobile, tablet, and desktop
- **Accessible UI**: Clear buttons, readable text, good contrast

## Browser Support

Works in all modern browsers that support:
- ES2020+
- localStorage API
- CSS Grid and Flexbox
- React 18+

## Development

### Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Create optimized production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Type Safety

The entire app is built with TypeScript. All types are defined in `lib/types.ts` with full coverage of data structures and component props.

### Hydration Safety

All client components use `isHydrated` state to prevent hydration mismatches when dealing with `typeof window` checks.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Static Export

```bash
npm run build
# Then serve the `out` directory with any static host
```

## Storage Limits

localStorage typically supports 5-10MB per domain. For the typical use case of this app (tracking a small flock), this is more than sufficient.

## Privacy

All data stays on your device. No data is sent to any server. No analytics, no tracking, no accounts required.

## Future Enhancements

Possible features for future versions:
- Export data to CSV
- Import data from files
- Dark mode
- Multiple coop management
- Batch operations
- Charts and analytics
- Reminders and notifications

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit issues or PRs.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   C o o p K e e p e r  
 