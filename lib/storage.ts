import { AppData } from './types';
import {
  getTodayDateString,
  getCurrentLocalDateTimeString,
  parseLocalDate,
  parseLocalDateTime,
  getThisWeekRange,
} from './dateUtils';

const STORAGE_KEY = 'coopkeeper-data';

// Initialize default app data
const defaultAppData: AppData = {
  eggs: { entries: [] },
  cleaning: { entries: [] },
  feed: { entries: [] },
  hens: { hens: [] },
  weights: { entries: [] },
  health: { entries: [] },
  expenses: { entries: [] },
  tasks: { tasks: [] },
};

// Get all app data from localStorage
export function getAppData(): AppData {
  if (typeof window === 'undefined') return defaultAppData;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultAppData;
    
    // Parse and merge with defaults to ensure all fields exist
    const parsed = JSON.parse(data);
    const appData = {
      eggs: { entries: [...(parsed.eggs?.entries ?? [])] },
      cleaning: { entries: [...(parsed.cleaning?.entries ?? [])] },
      feed: { entries: [...(parsed.feed?.entries ?? [])] },
      hens: { hens: [...(parsed.hens?.hens ?? [])] },
      weights: { entries: [...(parsed.weights?.entries ?? [])] },
      health: { entries: [...(parsed.health?.entries ?? [])] },
      expenses: { entries: [...(parsed.expenses?.entries ?? [])] },
      tasks: {
        tasks: [...(parsed.tasks?.tasks ?? [])],
        lastResetDate: parsed.tasks?.lastResetDate,
      },
    };
    
    // Reset task completion status if it's a new day
    resetDailyTasksIfNeeded(appData);
    
    return appData;
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
    window.dispatchEvent(new Event('coopkeeper-data-updated'));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// Egg Tracker utilities
export function addEggEntry(count: number): void {
  const data = getAppData();
  const today = getTodayDateString();
  
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
  const [weekStart] = getThisWeekRange();
  
  return data.eggs.entries
    .filter(entry => entry.date >= weekStart)
    .reduce((sum, entry) => sum + entry.count, 0);
}

// Cleaning Log utilities
export function addCleaningEntry(notes: string): void {
  const data = getAppData();
  data.cleaning.entries.push({
    id: Date.now().toString(),
    date: getTodayDateString(),
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
  const entries = getAppData().cleaning.entries;
  return [...entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

// Feed Log utilities
export function addFeedEntry(feedType: string, notes: string): void {
  const data = getAppData();
  data.feed.entries.push({
    id: Date.now().toString(),
    date: getTodayDateString(),
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
  const entries = getAppData().feed.entries;
  return [...entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

// Favorite Hens utilities
export function addHen(name: string, breed: string, notes: string = '', hatchDate?: string): void {
  const data = getAppData();
  data.hens.hens.push({
    id: Date.now().toString(),
    name,
    breed,
    isFavorite: false,
    notes,
    hatchDate,
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
    date: getTodayDateString(),
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
  const entries = getAppData().weights.entries;
  return [...entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

export function getHenWeights(henName: string): AppData['weights']['entries'] {
  return getWeightEntries().filter(e => e.henName === henName);
}

// Health Log utilities
export function addHealthEntry(
  henId: string,
  henName: string,
  date: string,
  category: 'Illness' | 'Injury' | 'Medication' | 'Vaccine' | 'Checkup' | 'Other',
  symptoms: string,
  treatment: string,
  status: 'Watching' | 'Treated' | 'Recovered',
  vetContacted: boolean,
  medicationName?: string,
  dosage?: string,
  followUpDate?: string,
  notes: string = ''
): void {
  const data = getAppData();
  data.health.entries.push({
    id: Date.now().toString(),
    henId,
    henName,
    date,
    category,
    symptoms,
    treatment,
    medicationName,
    dosage,
    vetContacted,
    followUpDate,
    status,
    notes,
    createdAt: getCurrentLocalDateTimeString(),
  });
  saveAppData(data);
}

export function removeHealthEntry(id: string): void {
  const data = getAppData();
  data.health.entries = data.health.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getHealthEntries(): AppData['health']['entries'] {
  const entries = getAppData().health?.entries ?? [];
  return [...entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

export function getHenHealthEntries(henId: string): AppData['health']['entries'] {
  return getHealthEntries().filter(e => e.henId === henId);
}

// Expense Tracker utilities
export function addExpense(
  date: string,
  category: 'Feed' | 'Bedding' | 'Medication' | 'Vet' | 'Supplies' | 'Equipment' | 'Other',
  description: string,
  amount: number,
  notes: string = ''
): void {
  const data = getAppData();
  data.expenses.entries.push({
    id: Date.now().toString(),
    date,
    category,
    description,
    amount,
    notes: notes || undefined,
    createdAt: getCurrentLocalDateTimeString(),
  });
  saveAppData(data);
}

export function removeExpense(id: string): void {
  const data = getAppData();
  data.expenses.entries = data.expenses.entries.filter(e => e.id !== id);
  saveAppData(data);
}

export function getExpenses(): AppData['expenses']['entries'] {
  const entries = getAppData().expenses?.entries ?? [];
  return [...entries].sort(
    (a, b) => {
      const aCreated = a.createdAt ? parseLocalDateTime(a.createdAt).getTime() : parseLocalDate(a.date).getTime();
      const bCreated = b.createdAt ? parseLocalDateTime(b.createdAt).getTime() : parseLocalDate(b.date).getTime();
      return bCreated - aCreated;
    }
  );
}

// Farm Tasks utilities
function resetDailyTasksIfNeeded(data: AppData): void {
  const today = getTodayDateString();
  const lastReset = data.tasks.lastResetDate;
  
  if (lastReset !== today) {
    // Reset all task completion status for new day
    data.tasks.tasks = data.tasks.tasks.map(task => (
      { ...task, completed: false }
    ));
    data.tasks.lastResetDate = today;
    saveAppData(data);
  }
}

export function addFarmTask(title: string): void {
  const data = getAppData();
  data.tasks.tasks.push({
    id: Date.now().toString(),
    title,
    completed: false,
    createdDate: getTodayDateString(),
  });
  saveAppData(data);
}

export function removeFarmTask(id: string): void {
  const data = getAppData();
  data.tasks.tasks = data.tasks.tasks.filter(t => t.id !== id);
  saveAppData(data);
}

export function toggleFarmTask(id: string): void {
  const data = getAppData();
  const task = data.tasks.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveAppData(data);
  }
}

export function getFarmTasks(): AppData['tasks']['tasks'] {
  const data = getAppData();
  return data.tasks.tasks;
}

export function getTaskStats(): { completed: number; remaining: number } {
  const tasks = getFarmTasks();
  const completed = tasks.filter(t => t.completed).length;
  return {
    completed,
    remaining: tasks.length - completed,
  };
}

// Dashboard utilities
export function getDashboardStats() {
  const data = getAppData();
  const today = getTodayDateString();
  const [weekStart] = getThisWeekRange();

  // Total Hens
  const totalHens = data.hens.hens.length;

  // Eggs Today
  const eggsToday = data.eggs.entries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.count, 0);

  // Eggs This Week
  const eggsThisWeek = data.eggs.entries
    .filter(e => e.date >= weekStart)
    .reduce((sum, e) => sum + e.count, 0);

  // Active Health Cases (Watching or Treated)
  const activeHealthCases = data.health.entries.filter(
    e => e.status === 'Watching' || e.status === 'Treated'
  ).length;

  // Last Cleaning Date
  const lastCleaning = [...data.cleaning.entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  )[0];
  const lastCleaningDate = lastCleaning?.date || null;

  // Feed Logs This Week
  const feedLogsThisWeek = data.feed.entries.filter(
    e => e.date >= weekStart
  ).length;

  // Most Recent Weight Entry
  const mostRecentWeight = [...data.weights.entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  )[0];

  // Expenses This Month
  const currentMonth = new Date();
  const expensesThisMonth = data.expenses.entries
    .filter(expense => {
      const expenseDate = parseLocalDate(expense.date);
      return (
        expenseDate.getFullYear() === currentMonth.getFullYear() &&
        expenseDate.getMonth() === currentMonth.getMonth()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalHens,
    eggsToday,
    eggsThisWeek,
    activeHealthCases,
    lastCleaningDate,
    feedLogsThisWeek,
    mostRecentWeight,
    expensesThisMonth,
  };
}
