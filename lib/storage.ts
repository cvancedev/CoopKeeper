import { AppData } from './types';
import {
  APP_DATA_UPDATED_EVENT,
  APP_SCHEMA_VERSION,
  APP_STORAGE_KEY,
  APP_SYNC_STATUS_EVENT,
  createDefaultAppData,
  createRecordId,
  normalizeAppData,
} from './appData';
import {
  getTodayDateString,
  getCurrentLocalDateTimeString,
  isSameLocalDate,
  isValidLocalDateString,
  parseLocalDate,
  parseLocalDateTime,
  getThisWeekRange,
} from './dateUtils';
import {
  APP_SECTIONS,
  type AppSectionKey,
  canUseFirestore,
  loadAppDataFromFirestore,
  saveAppDataSectionsToFirestore,
} from './firestore';

const defaultAppData: AppData = createDefaultAppData();

type BootstrapState = 'idle' | 'loading' | 'ready' | 'error';
type CloudSyncState = 'idle' | 'queued' | 'syncing' | 'error';

interface PendingCloudWrite {
  data: AppData;
  sections: Set<AppSectionKey>;
}

export interface CloudSyncStatus {
  bootstrapState: BootstrapState;
  cloudSyncState: CloudSyncState;
  firestoreEnabled: boolean;
  pendingSectionCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

let bootstrapPromise: Promise<void> | null = null;
let pendingCloudWrite: PendingCloudWrite | null = null;

let syncStatus: CloudSyncStatus = {
  bootstrapState: 'idle',
  cloudSyncState: 'idle',
  firestoreEnabled: false,
  pendingSectionCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isCloudSyncEnabled(): boolean {
  return isBrowser() && canUseFirestore();
}

function emitSyncStatus(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(APP_SYNC_STATUS_EVENT));
}

function setSyncStatus(partial: Partial<CloudSyncStatus>): void {
  syncStatus = {
    ...syncStatus,
    ...partial,
  };
  emitSyncStatus();
}

function setSyncError(message: string, error?: unknown): void {
  console.error(message, error);
  setSyncStatus({
    bootstrapState: syncStatus.bootstrapState === 'loading' ? 'error' : syncStatus.bootstrapState,
    cloudSyncState: 'error',
    lastError: message,
  });
}

export function getCloudSyncStatus(): CloudSyncStatus {
  return {
    ...syncStatus,
    firestoreEnabled: isCloudSyncEnabled(),
    pendingSectionCount: pendingCloudWrite ? pendingCloudWrite.sections.size : 0,
  };
}

function readLocalAppData(): AppData {
  if (!isBrowser()) return defaultAppData;

  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return defaultAppData;

    return normalizeAppData(JSON.parse(raw));
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultAppData;
  }
}

function writeLocalAppData(data: AppData): void {
  if (!isBrowser()) return;

  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(APP_DATA_UPDATED_EVENT));
}

function isSectionEqual(current: unknown, previous: unknown): boolean {
  return JSON.stringify(current) === JSON.stringify(previous);
}

function getChangedSections(previous: AppData, next: AppData): AppSectionKey[] {
  return APP_SECTIONS.filter(section => !isSectionEqual(previous[section], next[section]));
}

function combineById<T extends { id: string }>(base: T[], incoming: T[]): T[] {
  const merged = new Map<string, T>();

  for (const item of base) {
    merged.set(item.id, item);
  }

  for (const item of incoming) {
    merged.set(item.id, item);
  }

  return [...merged.values()];
}

function mergeEggEntries(
  remoteEntries: AppData['eggs']['entries'],
  localEntries: AppData['eggs']['entries']
): AppData['eggs']['entries'] {
  const mergedByDate = new Map<string, AppData['eggs']['entries'][number]>();

  const allEntries = [...remoteEntries, ...localEntries];

  for (const entry of allEntries) {
    const existing = mergedByDate.get(entry.date);
    if (!existing) {
      mergedByDate.set(entry.date, entry);
      continue;
    }

    const existingUpdated = parseLocalDateTime(existing.updatedAt).getTime();
    const incomingUpdated = parseLocalDateTime(entry.updatedAt).getTime();

    if (incomingUpdated >= existingUpdated) {
      mergedByDate.set(entry.date, entry);
    }
  }

  return [...mergedByDate.values()];
}

function mergeAppDataForSafety(remoteData: AppData, localData: AppData): AppData {
  return normalizeAppData({
    ...remoteData,
    schemaVersion: Math.max(remoteData.schemaVersion ?? APP_SCHEMA_VERSION, APP_SCHEMA_VERSION),
    eggs: { entries: mergeEggEntries(remoteData.eggs.entries, localData.eggs.entries) },
    cleaning: { entries: combineById(remoteData.cleaning.entries, localData.cleaning.entries) },
    feed: { entries: combineById(remoteData.feed.entries, localData.feed.entries) },
    hens: { hens: combineById(remoteData.hens.hens, localData.hens.hens) },
    weights: { entries: combineById(remoteData.weights.entries, localData.weights.entries) },
    health: { entries: combineById(remoteData.health.entries, localData.health.entries) },
    expenses: { entries: combineById(remoteData.expenses.entries, localData.expenses.entries) },
    tasks: {
      tasks: combineById(remoteData.tasks.tasks, localData.tasks.tasks),
      lastResetDate: remoteData.tasks.lastResetDate ?? localData.tasks.lastResetDate,
    },
  });
}

function queueCloudWrite(data: AppData, sections: AppSectionKey[]): void {
  if (sections.length === 0) {
    return;
  }

  if (!pendingCloudWrite) {
    pendingCloudWrite = {
      data,
      sections: new Set(sections),
    };
  } else {
    pendingCloudWrite.data = data;
    for (const section of sections) {
      pendingCloudWrite.sections.add(section);
    }
  }

  setSyncStatus({
    cloudSyncState: 'queued',
    pendingSectionCount: pendingCloudWrite.sections.size,
  });
}

async function flushPendingCloudWrite(): Promise<void> {
  if (!pendingCloudWrite || syncStatus.bootstrapState !== 'ready') {
    return;
  }

  const pending = pendingCloudWrite;
  setSyncStatus({
    cloudSyncState: 'syncing',
    pendingSectionCount: pending.sections.size,
  });

  const result = await saveAppDataSectionsToFirestore(pending.data, [...pending.sections]);
  if (!result.ok) {
    const message = result.message ?? 'Failed to sync queued cloud changes.';
    setSyncError(message, result.error);
    return;
  }

  pendingCloudWrite = null;
  setSyncStatus({
    cloudSyncState: 'idle',
    pendingSectionCount: 0,
    lastError: null,
    lastSyncedAt: getCurrentLocalDateTimeString(),
  });
}

function hasAnyEntries(data: AppData): boolean {
  return (
    data.eggs.entries.length > 0 ||
    data.cleaning.entries.length > 0 ||
    data.feed.entries.length > 0 ||
    data.hens.hens.length > 0 ||
    data.weights.entries.length > 0 ||
    data.health.entries.length > 0 ||
    data.expenses.entries.length > 0 ||
    data.tasks.tasks.length > 0
  );
}

function ensureBootstrapStarted(): void {
  if (!isCloudSyncEnabled()) {
    return;
  }

  if (syncStatus.bootstrapState === 'loading' || syncStatus.bootstrapState === 'ready') {
    return;
  }

  void bootstrapCloudAppData();
}

function applyDailyTaskResetIfNeeded(data: AppData): boolean {
  const today = getTodayDateString();
  const lastReset = data.tasks.lastResetDate;

  if (lastReset === today) {
    return false;
  }

  data.tasks.tasks = data.tasks.tasks.map(task => ({
    ...task,
    completed: false,
  }));
  data.tasks.lastResetDate = today;

  return true;
}

function ensureDailyTaskReset(): void {
  const currentData = getAppData();
  if (!applyDailyTaskResetIfNeeded(currentData)) {
    return;
  }

  saveAppData(currentData, ['tasks']);
}

// Get all app data from localStorage
export function getAppData(): AppData {
  return readLocalAppData();
}

// Save all app data to localStorage and queue/flush cloud sync safely
export function saveAppData(data: AppData, changedSections?: AppSectionKey[]): void {
  if (!isBrowser()) return;

  const previousData = readLocalAppData();
  const normalizedData = normalizeAppData({
    ...data,
    schemaVersion: APP_SCHEMA_VERSION,
  });

  writeLocalAppData(normalizedData);

  if (!isCloudSyncEnabled()) {
    setSyncStatus({
      firestoreEnabled: false,
      cloudSyncState: 'idle',
      lastError: null,
    });
    return;
  }

  setSyncStatus({ firestoreEnabled: true });

  const sections = changedSections ?? getChangedSections(previousData, normalizedData);
  if (sections.length === 0) {
    return;
  }

  if (syncStatus.bootstrapState !== 'ready') {
    queueCloudWrite(normalizedData, sections);
    ensureBootstrapStarted();
    return;
  }

  queueCloudWrite(normalizedData, sections);
  void flushPendingCloudWrite();
}

export async function bootstrapCloudAppData(): Promise<void> {
  if (!isBrowser()) return;

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  if (!isCloudSyncEnabled()) {
    setSyncStatus({
      firestoreEnabled: false,
      bootstrapState: 'ready',
      cloudSyncState: 'idle',
      lastError: null,
    });
    return;
  }

  setSyncStatus({
    firestoreEnabled: true,
    bootstrapState: 'loading',
    cloudSyncState: pendingCloudWrite ? 'queued' : 'idle',
    lastError: null,
  });

  bootstrapPromise = (async () => {
    try {
      const remoteData = await loadAppDataFromFirestore();

      if (remoteData) {
        const localData = readLocalAppData();
        const mergedLocalData = pendingCloudWrite
          ? mergeAppDataForSafety(localData, pendingCloudWrite.data)
          : localData;
        const nextData = mergeAppDataForSafety(remoteData, mergedLocalData);
        writeLocalAppData(nextData);

        if (pendingCloudWrite) {
          pendingCloudWrite.data = nextData;
        }
      } else {
        const localData = readLocalAppData();
        if (hasAnyEntries(localData)) {
          queueCloudWrite(localData, [...APP_SECTIONS]);
        }
      }

      const afterBootstrapData = readLocalAppData();
      if (applyDailyTaskResetIfNeeded(afterBootstrapData)) {
        saveAppData(afterBootstrapData, ['tasks']);
      }

      setSyncStatus({
        bootstrapState: 'ready',
        cloudSyncState: pendingCloudWrite ? 'queued' : 'idle',
        lastError: null,
      });

      await flushPendingCloudWrite();
    } catch (error) {
      setSyncError('Cloud bootstrap failed. Data continues to be saved locally.', error);
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
}

// Egg Tracker utilities
function isThisMonth(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function getEggEntryTimestamp(entry: AppData['eggs']['entries'][number]): number {
  if (entry.updatedAt) {
    return parseLocalDateTime(entry.updatedAt).getTime();
  }

  if (entry.createdAt) {
    return parseLocalDateTime(entry.createdAt).getTime();
  }

  return parseLocalDate(entry.date).getTime();
}

export function addEggEntry(date: string, count: number): void {
  if (!isValidLocalDateString(date) || !Number.isInteger(count) || count < 0) {
    return;
  }

  const data = getAppData();
  const now = getCurrentLocalDateTimeString();
  const existingIndex = data.eggs.entries.findIndex(entry => entry.date === date);

  if (existingIndex !== -1) {
    data.eggs.entries[existingIndex].count = count;
    data.eggs.entries[existingIndex].updatedAt = now;
  } else {
    data.eggs.entries.push({
      id: createRecordId(),
      date,
      count,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveAppData(data, ['eggs']);
}

export function updateEggEntry(id: string, date: string, count: number): void {
  if (!isValidLocalDateString(date) || !Number.isInteger(count) || count < 0) {
    return;
  }

  const data = getAppData();
  const now = getCurrentLocalDateTimeString();
  const entryIndex = data.eggs.entries.findIndex(entry => entry.id === id);

  if (entryIndex === -1) {
    return;
  }

  const conflictingIndex = data.eggs.entries.findIndex(entry => entry.date === date && entry.id !== id);

  if (conflictingIndex !== -1) {
    data.eggs.entries[conflictingIndex].count = count;
    data.eggs.entries[conflictingIndex].updatedAt = now;
    data.eggs.entries.splice(entryIndex, 1);
  } else {
    data.eggs.entries[entryIndex].date = date;
    data.eggs.entries[entryIndex].count = count;
    data.eggs.entries[entryIndex].updatedAt = now;
  }

  saveAppData(data, ['eggs']);
}

export function removeEggEntry(id: string): void {
  const data = getAppData();
  data.eggs.entries = data.eggs.entries.filter(e => e.id !== id);
  saveAppData(data, ['eggs']);
}

export function getEggEntries(): AppData['eggs']['entries'] {
  return [...getAppData().eggs.entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime() || getEggEntryTimestamp(b) - getEggEntryTimestamp(a)
  );
}

export function getWeeklyEggTotal(): number {
  const data = getAppData();
  const [weekStart] = getThisWeekRange();

  return data.eggs.entries
    .filter(entry => entry.date >= weekStart)
    .reduce((sum, entry) => sum + entry.count, 0);
}

export function getEggTotals() {
  const data = getAppData();
  const [weekStart] = getThisWeekRange();
  const now = new Date();

  return data.eggs.entries.reduce(
    (totals, entry) => {
      totals.lifetime += entry.count;

      if (isSameLocalDate(entry.date, now)) {
        totals.today += entry.count;
      }

      if (entry.date >= weekStart) {
        totals.week += entry.count;
      }

      if (isThisMonth(entry.date)) {
        totals.month += entry.count;
      }

      return totals;
    },
    {
      today: 0,
      week: 0,
      month: 0,
      lifetime: 0,
    }
  );
}

// Cleaning Log utilities
export function addCleaningEntry(notes: string): void {
  const data = getAppData();
  data.cleaning.entries.push({
    id: createRecordId(),
    date: getTodayDateString(),
    notes,
  });
  saveAppData(data, ['cleaning']);
}

export function removeCleaningEntry(id: string): void {
  const data = getAppData();
  data.cleaning.entries = data.cleaning.entries.filter(e => e.id !== id);
  saveAppData(data, ['cleaning']);
}

export function updateCleaningEntry(id: string, notes: string): void {
  const data = getAppData();
  const entry = data.cleaning.entries.find(e => e.id === id);
  if (!entry) {
    return;
  }

  entry.notes = notes;
  saveAppData(data, ['cleaning']);
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
    id: createRecordId(),
    date: getTodayDateString(),
    feedType,
    notes,
  });
  saveAppData(data, ['feed']);
}

export function removeFeedEntry(id: string): void {
  const data = getAppData();
  data.feed.entries = data.feed.entries.filter(e => e.id !== id);
  saveAppData(data, ['feed']);
}

export function updateFeedEntry(id: string, feedType: string, notes: string): void {
  const data = getAppData();
  const entry = data.feed.entries.find(e => e.id === id);
  if (!entry) {
    return;
  }

  entry.feedType = feedType;
  entry.notes = notes;
  saveAppData(data, ['feed']);
}

export function getFeedEntries(): AppData['feed']['entries'] {
  const entries = getAppData().feed.entries;
  return [...entries].sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

// Favorite Hens utilities
export function addHen(
  name: string,
  breed: string,
  notes: string = '',
  hatchDate?: string,
  photoUrl?: string | null
): void {
  const data = getAppData();
  data.hens.hens.push({
    id: createRecordId(),
    name,
    breed,
    isFavorite: false,
    notes,
    hatchDate,
    photoUrl: photoUrl ?? null,
  });
  saveAppData(data, ['hens']);
}

export function removeHen(id: string): void {
  const data = getAppData();
  data.hens.hens = data.hens.hens.filter(h => h.id !== id);
  saveAppData(data, ['hens']);
}

export function toggleHenFavorite(id: string): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (hen) {
    hen.isFavorite = !hen.isFavorite;
    saveAppData(data, ['hens']);
  }
}

export function updateHenNotes(id: string, notes: string): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (hen) {
    hen.notes = notes;
    saveAppData(data, ['hens']);
  }
}

export function updateHenPhoto(id: string, photoUrl: string | null): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (hen) {
    hen.photoUrl = photoUrl;
    saveAppData(data, ['hens']);
  }
}

export function updateHen(
  id: string,
  name: string,
  breed: string,
  notes: string,
  hatchDate?: string,
  isFavorite?: boolean,
  photoUrl?: string | null
): void {
  const data = getAppData();
  const hen = data.hens.hens.find(h => h.id === id);
  if (!hen) {
    return;
  }

  hen.name = name;
  hen.breed = breed;
  hen.notes = notes;
  hen.hatchDate = hatchDate;

  if (typeof isFavorite === 'boolean') {
    hen.isFavorite = isFavorite;
  }

  if (photoUrl !== undefined) {
    hen.photoUrl = photoUrl;
  }

  saveAppData(data, ['hens']);
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
    id: createRecordId(),
    henName,
    date: getTodayDateString(),
    weight,
  });
  saveAppData(data, ['weights']);
}

export function removeWeightEntry(id: string): void {
  const data = getAppData();
  data.weights.entries = data.weights.entries.filter(e => e.id !== id);
  saveAppData(data, ['weights']);
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
    id: createRecordId(),
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
  saveAppData(data, ['health']);
}

export function removeHealthEntry(id: string): void {
  const data = getAppData();
  data.health.entries = data.health.entries.filter(e => e.id !== id);
  saveAppData(data, ['health']);
}

export function updateHealthEntry(
  id: string,
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
  const entry = data.health.entries.find(e => e.id === id);
  if (!entry) {
    return;
  }

  entry.henId = henId;
  entry.henName = henName;
  entry.date = date;
  entry.category = category;
  entry.symptoms = symptoms;
  entry.treatment = treatment;
  entry.status = status;
  entry.vetContacted = vetContacted;
  entry.medicationName = medicationName;
  entry.dosage = dosage;
  entry.followUpDate = followUpDate;
  entry.notes = notes;

  saveAppData(data, ['health']);
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
    id: createRecordId(),
    date,
    category,
    description,
    amount,
    notes: notes || undefined,
    createdAt: getCurrentLocalDateTimeString(),
  });
  saveAppData(data, ['expenses']);
}

export function removeExpense(id: string): void {
  const data = getAppData();
  data.expenses.entries = data.expenses.entries.filter(e => e.id !== id);
  saveAppData(data, ['expenses']);
}

export function updateExpense(
  id: string,
  date: string,
  category: 'Feed' | 'Bedding' | 'Medication' | 'Vet' | 'Supplies' | 'Equipment' | 'Other',
  description: string,
  amount: number,
  notes: string = ''
): void {
  const data = getAppData();
  const entry = data.expenses.entries.find(e => e.id === id);
  if (!entry) {
    return;
  }

  entry.date = date;
  entry.category = category;
  entry.description = description;
  entry.amount = amount;
  entry.notes = notes || undefined;
  saveAppData(data, ['expenses']);
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
export function addFarmTask(title: string): void {
  ensureDailyTaskReset();
  const data = getAppData();
  data.tasks.tasks.push({
    id: createRecordId(),
    title,
    completed: false,
    createdDate: getTodayDateString(),
  });
  saveAppData(data, ['tasks']);
}

export function removeFarmTask(id: string): void {
  ensureDailyTaskReset();
  const data = getAppData();
  data.tasks.tasks = data.tasks.tasks.filter(t => t.id !== id);
  saveAppData(data, ['tasks']);
}

export function toggleFarmTask(id: string): void {
  ensureDailyTaskReset();
  const data = getAppData();
  const task = data.tasks.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveAppData(data, ['tasks']);
  }
}

export function updateFarmTaskTitle(id: string, title: string): void {
  ensureDailyTaskReset();
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return;
  }

  const data = getAppData();
  const task = data.tasks.tasks.find(t => t.id === id);
  if (task) {
    task.title = trimmedTitle;
    saveAppData(data, ['tasks']);
  }
}

export function getFarmTasks(): AppData['tasks']['tasks'] {
  ensureDailyTaskReset();
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
  const [weekStart] = getThisWeekRange();

  // Total Hens
  const totalHens = data.hens.hens.length;

  const eggTotals = getEggTotals();

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
    eggsToday: eggTotals.today,
    eggsThisWeek: eggTotals.week,
    eggsThisMonth: eggTotals.month,
    lifetimeEggs: eggTotals.lifetime,
    activeHealthCases,
    lastCleaningDate,
    feedLogsThisWeek,
    mostRecentWeight,
    expensesThisMonth,
  };
}
