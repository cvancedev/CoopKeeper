import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppData } from './types';
import { normalizeAppData } from './appData';
import { getFirestoreDb, isFirebaseConfigured } from './firebase';

const FARM_DOC_PATH = ['farms', 'demo-coopkeeper'] as const;

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

export async function loadAppDataFromFirestore(): Promise<AppData | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const snapshot = await getDoc(doc(db, FARM_DOC_PATH[0], FARM_DOC_PATH[1]));
    if (!snapshot.exists()) return null;

    return normalizeAppData(snapshot.data() as Partial<AppData>);
  } catch (error) {
    console.error('Error loading CoopKeeper data from Firestore:', error);
    return null;
  }
}

export async function saveAppDataToFirestore(data: AppData): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    await setDoc(doc(db, FARM_DOC_PATH[0], FARM_DOC_PATH[1]), removeUndefinedValues(data));
  } catch (error) {
    console.error('Error saving CoopKeeper data to Firestore:', error);
  }
}

export async function bootstrapFirestoreAppData(): Promise<AppData | null> {
  const remoteData = await loadAppDataFromFirestore();
  if (!remoteData || typeof window === 'undefined') return remoteData;

  localStorage.setItem('coopkeeper-data', JSON.stringify(remoteData));
  window.dispatchEvent(new Event('coopkeeper-data-updated'));
  return remoteData;
}