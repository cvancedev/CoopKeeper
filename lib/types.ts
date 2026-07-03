// Egg Tracker Types
export interface EggEntry {
  id: string;
  date: string;
  count: number;
}

export interface EggData {
  entries: EggEntry[];
}

// Cleaning Log Types
export interface CleaningEntry {
  id: string;
  date: string;
  notes: string;
}

export interface CleaningData {
  entries: CleaningEntry[];
}

// Feed Log Types
export interface FeedEntry {
  id: string;
  date: string;
  feedType: string;
  notes: string;
}

export interface FeedData {
  entries: FeedEntry[];
}

// Favorite Hens Types
export interface Hen {
  id: string;
  name: string;
  breed: string;
  isFavorite: boolean;
  notes: string;
  hatchDate?: string; // ISO date string (YYYY-MM-DD), optional for backward compat
}

export interface HensData {
  hens: Hen[];
}

// Weight Tracker Types
export interface WeightEntry {
  id: string;
  henName: string;
  date: string;
  weight: number; // in pounds or kg
}

export interface WeightData {
  entries: WeightEntry[];
}

// Combined App State
export interface AppData {
  eggs: EggData;
  cleaning: CleaningData;
  feed: FeedData;
  hens: HensData;
  weights: WeightData;
}
