'use client';

import EggTracker from '@/components/EggTracker';
import CleaningLog from '@/components/CleaningLog';
import FeedLog from '@/components/FeedLog';
import FavoriteHens from '@/components/FavoriteHens';
import WeightTracker from '@/components/WeightTracker';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2">
            🐓 CoopKeeper
          </h1>
          <p className="text-lg text-amber-800">
            Your complete chicken coop management tracker
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Favorite Hens - Spans full width on mobile */}
          <div className="md:col-span-2 lg:col-span-1">
            <FavoriteHens />
          </div>

          {/* Egg Tracker */}
          <div>
            <EggTracker />
          </div>

          {/* Weight Tracker */}
          <div>
            <WeightTracker />
          </div>

          {/* Feed Log */}
          <div className="md:col-span-2 lg:col-span-1">
            <FeedLog />
          </div>

          {/* Cleaning Log */}
          <div className="md:col-span-2 lg:col-span-2">
            <CleaningLog />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-amber-800 text-sm">
            💾 Data saved locally in your browser
          </p>
        </div>
      </div>
    </main>
  );
}
