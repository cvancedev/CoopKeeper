import { AppData, EggData, CleaningData, FeedData, HensData, WeightData } from './types';

const STORAGE_KEY = 'coopkeeper-data';

// Initialize default app data
const defaultAppData: AppData = {
  eggs: { entries: [] },
  cleaning: { entries: [] },
  feed: { entries: [] },
  hens: { hens: [] },
  weights: { entries: [] },
};

// Get all app data from localStorage
export function getAppData(): AppData {
  if (typeof window === 'undefined') return defaultAppData;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultAppData;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultAppData;
  }
}

// Save all app data to localStorage
export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// Egg Tracker utilities
export function addEggEntry(count: number): void {
  const data = getAppData();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if entry for today exists
  const existingIndex = data.eggs.entries.findIndex(e => e.date === today);
  
  if (existingIndex !== -1) {
    data.eggs.entries[existingIndex].count += count;
  } else {
    data.eggs.entries.push({
      id: Date.now().toString(),
      date: today,
      count,
    });
  }
  
  saveAppData(data);
}

export function removeEggEntry(id: string): void {
  const data = getAppData();
  data.eggs.entries = data.eggs.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getEggEntries(): AppData['eggs']['entries'] {
  return getAppData().eggs.entries;
}

export function getWeeklyEggTotal(): number {
  const data = getAppData();
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return data.eggs.entries
    .filter(entry => new Date(entry.date) >= sevenDaysAgo)
    .reduce((sum, entry) => sum + entry.count, 0);
}

// Cleaning Log utilities
export function addCleaningEntry(notes: string): void {
  const data = getAppData();
  data.cleaning.entries.push({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    notes,
  });
  saveAppData(data);
}

export function removeCleaningEntry(id: string): void {
  const data = getAppData();
  data.cleaning.entries = data.cleaning.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getCleaningEntries(): AppData['cleaning']['entries'] {
  return getAppData().cleaning.entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Feed Log utilities
export function addFeedEntry(feedType: string, notes: string): void {
  const data = getAppData();
  data.feed.entries.push({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    feedType,
    notes,
  });
  saveAppData(data);
}

export function removeFeedEntry(id: string): void {
  const data = getAppData();
  data.feed.entries = data.feed.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getFeedEntries(): AppData['feed']['entries'] {
  return getAppData().feed.entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Favorite Hens utilities
export function addHen(name: string, breed: string, notes: string = ''): void {
  const data = getAppData();
  data.hens.hens.push({
    id: Date.now().toString(),
    name,
    breed,
    isFavorite: false,
    notes,
  });
  saveAppData(data);
}

export function removeHen(id: string): void {
  const data = getAppData();
  data.hens.hens = data.hens.hens.filter(h => h.id !== id);
  saveAppData(data);
}

export function toggleHenFavorite(id: string): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (hen) {
    hen.isFavorite = !hen.isFavorite;
    saveAppData(data);
  }
}

export function updateHenNotes(id: string, notes: string): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (hen) {
    hen.notes = notes;
    saveAppData(data);
  }
}

export function getHens(): AppData['hens']['hens'] {
  return getAppData().hens.hens;
}

export function getFavoriteHens(): AppData['hens']['hens'] {
  return getHens().filter(h => h.isFavorite);
}

// Weight Tracker utilities
export function addWeightEntry(henName: string, weight: number): void {
  const data = getAppData();
  data.weights.entries.push({
    id: Date.now().toString(),
    henName,
    date: new Date().toISOString().split('T')[0],
    weight,
  });
  saveAppData(data);
}

export function removeWeightEntry(id: string): void {
  const data = getAppData();
  data.weights.entries = data.weights.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getWeightEntries(): AppData['weights']['entries'] {
  return getAppData().weights.entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getHenWeights(henName: string): AppData['weights']['entries'] {
  return getWeightEntries().filter(e => e.henName === henName);
}
