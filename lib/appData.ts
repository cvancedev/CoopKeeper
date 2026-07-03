import type { AppData } from './types';

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
    eggs: { entries: [...(rawData?.eggs?.entries ?? [])] },
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