import type { AppData } from './types';
import { getTodayDateString } from './dateUtils';

function normalizeEggEntry(entry: Partial<AppData['eggs']['entries'][number]>): AppData['eggs']['entries'][number] {
  const date = entry.date ?? getTodayDateString();
  const createdAt = entry.createdAt ?? `${date}T00:00:00`;

  return {
    id: entry.id ?? Date.now().toString(),
    date,
    count: Number.isFinite(entry.count) ? Number(entry.count) : 0,
    createdAt,
    updatedAt: entry.updatedAt ?? createdAt,
  };
}

export const APP_STORAGE_KEY = 'coopkeeper-data';
export const APP_DATA_UPDATED_EVENT = 'coopkeeper-data-updated';

export function createDefaultAppData(): AppData {
  return {
    eggs: { entries: [] },
    cleaning: { entries: [] },
    feed: { entries: [] },
    hens: { hens: [] },
    weights: { entries: [] },
    health: { entries: [] },
    expenses: { entries: [] },
    tasks: { tasks: [] },
  };
}

export function normalizeAppData(rawData: Partial<AppData> | null | undefined): AppData {
  return {
    eggs: { entries: [...(rawData?.eggs?.entries ?? []).map(entry => normalizeEggEntry(entry))] },
    cleaning: { entries: [...(rawData?.cleaning?.entries ?? [])] },
    feed: { entries: [...(rawData?.feed?.entries ?? [])] },
    hens: { hens: [...(rawData?.hens?.hens ?? [])] },
    weights: { entries: [...(rawData?.weights?.entries ?? [])] },
    health: { entries: [...(rawData?.health?.entries ?? [])] },
    expenses: { entries: [...(rawData?.expenses?.entries ?? [])] },
    tasks: {
      tasks: [...(rawData?.tasks?.tasks ?? [])],
      lastResetDate: rawData?.tasks?.lastResetDate,
    },
  };
}