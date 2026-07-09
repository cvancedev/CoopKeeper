import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppData } from './types';
import {
  APP_DATA_UPDATED_EVENT,
  APP_SCHEMA_VERSION,
  APP_STORAGE_KEY,
  normalizeAppData,
} from './appData';
import { getFirestoreDb, isFirebaseConfigured } from './firebase';

const FARM_DOC_PATH = ['farms', 'demo-coopkeeper'] as const;

export const APP_SECTIONS = [
  'eggs',
  'cleaning',
  'feed',
  'hens',
  'weights',
  'health',
  'expenses',
  'tasks',
] as const;

export type AppSectionKey = (typeof APP_SECTIONS)[number];

export interface FirestoreSyncResult {
  ok: boolean;
  message?: string;
  error?: unknown;
}

export function canUseFirestore(): boolean {
  return isFirebaseConfigured() && getFirestoreDb() !== null;
}

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map(item => removeUndefinedValues(item))
      .filter(item => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefinedValues(entryValue)])
    ) as T;
  }

  return value;
}

function getFarmDocRef() {
  const db = getFirestoreDb();
  return db ? doc(db, FARM_DOC_PATH[0], FARM_DOC_PATH[1]) : null;
}

function toSchemaVersion(value: number | undefined): number {
  return typeof value === 'number' ? value : APP_SCHEMA_VERSION;
}

function buildSectionPayload(data: AppData, sections: AppSectionKey[]): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    schemaVersion: toSchemaVersion(data.schemaVersion),
  };

  for (const section of sections) {
    payload[section] = removeUndefinedValues(data[section]);
  }

  return payload;
}

export async function loadAppDataFromFirestore(): Promise<AppData | null> {
  const farmDoc = getFarmDocRef();
  if (!farmDoc) return null;

  try {
    const snapshot = await getDoc(farmDoc);
    if (!snapshot.exists()) return null;

    return normalizeAppData(snapshot.data() as Partial<AppData>);
  } catch (error) {
    console.error('Error loading CoopKeeper data from Firestore:', error);
    return null;
  }
}

export async function saveAppDataSectionsToFirestore(
  data: AppData,
  sections: AppSectionKey[]
): Promise<FirestoreSyncResult> {
  const farmDoc = getFarmDocRef();
  if (!farmDoc) {
    return { ok: false, message: 'Firestore is not configured.' };
  }

  const uniqueSections = [...new Set(sections)];
  if (uniqueSections.length === 0) {
    return { ok: true };
  }

  try {
    const payload = buildSectionPayload(data, uniqueSections);
    await setDoc(farmDoc, payload, { merge: true });
    return { ok: true };
  } catch (error) {
    console.error('Error saving CoopKeeper data to Firestore:', error);
    return {
      ok: false,
      message: 'Failed to save cloud data to Firestore.',
      error,
    };
  }
}

export async function saveAppDataToFirestore(data: AppData): Promise<FirestoreSyncResult> {
  return saveAppDataSectionsToFirestore(data, [...APP_SECTIONS]);
}

export async function bootstrapFirestoreAppData(): Promise<AppData | null> {
  const remoteData = await loadAppDataFromFirestore();
  if (!remoteData || typeof window === 'undefined') return remoteData;

  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(remoteData));
  window.dispatchEvent(new Event(APP_DATA_UPDATED_EVENT));
  return remoteData;
}