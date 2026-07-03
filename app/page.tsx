'use client';

import EggTracker from '@/components/EggTracker';
import CleaningLog from '@/components/CleaningLog';
import FeedLog from '@/components/FeedLog';
import FavoriteHens from '@/components/FavoriteHens';
import WeightTracker from '@/components/WeightTracker';
import HealthLog from '@/components/HealthLog';


export default function Home() {
  return (
    <>
      {/* Farm Background */}
      <div className="farm-background" />
      <div className="farm-overlay" />

      <main className="relative min-h-screen pt-16 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="hero-section mb-24">
         
            {/* Main Title */}
            <h1 className="hero-title mb-6 drop-shadow-2xl">
              🐓 CoopKeeper
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Your complete chicken coop management dashboard
            </p>

            {/* Description */}
            <p className="hero-description">
              Track your flock, egg production, feeding, cleaning, and health from one beautiful place.
            </p>

          </div>

          {/* Grid Layout with Farm Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Favorite Hens */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="farm-card p-6 h-full">
                <FavoriteHens />
              </div>
            </div>

            {/* Egg Tracker */}
            <div>
              <div className="farm-card p-6 h-full">
                <EggTracker />
              </div>
            </div>

            {/* Weight Tracker */}
            <div>
              <div className="farm-card p-6 h-full">
                <WeightTracker />
              </div>
            </div>

            {/* Feed Log */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="farm-card p-6 h-full">
                <FeedLog />
              </div>
            </div>

            {/* Cleaning Log */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="farm-card p-6 h-full">
                <CleaningLog />
              </div>
            </div>

            {/* Health Log */}
            <div className="md:col-span-2 lg:col-span-2">
              <div className="farm-card p-6 h-full">
                <HealthLog />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <div className="inline-block farm-card px-6 py-4">
              <p className="text-amber-900 text-sm font-medium">
                💾 All your data is safely saved locally in your browser
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
