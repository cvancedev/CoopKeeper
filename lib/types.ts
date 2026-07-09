// Egg Tracker Types
export interface EggEntry {
  id: string;
  date: string;
  count: number;
  createdAt: string;
  updatedAt: string;
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
  photoUrl?: string | null;
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

// Health Log Types
export interface HealthEntry {
  id: string;
  henId: string;
  henName: string;
  date: string;
  category: 'Illness' | 'Injury' | 'Medication' | 'Vaccine' | 'Checkup' | 'Other';
  symptoms: string;
  treatment: string;
  medicationName?: string;
  dosage?: string;
  vetContacted: boolean;
  followUpDate?: string;
  status: 'Watching' | 'Treated' | 'Recovered';
  notes: string;
  createdAt: string;
}

export interface HealthData {
  entries: HealthEntry[];
}

// Expense Tracker Types
export type ExpenseCategory =
  | 'Feed'
  | 'Bedding'
  | 'Medication'
  | 'Vet'
  | 'Supplies'
  | 'Equipment'
  | 'Other';

export interface ExpenseEntry {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface ExpenseData {
  entries: ExpenseEntry[];
}

// Farm Tasks Types
export interface FarmTask {
  id: string;
  title: string;
  completed: boolean;
  createdDate: string;
}

export interface FarmTaskData {
  tasks: FarmTask[];
  lastResetDate?: string;
}

// Combined App State
export interface AppData {
  schemaVersion?: number;
  eggs: EggData;
  cleaning: CleaningData;
  feed: FeedData;
  hens: HensData;
  weights: WeightData;
  health: HealthData;
  expenses: ExpenseData;
  tasks: FarmTaskData;
}
