import type { AppData } from './types';
import { APP_SCHEMA_VERSION, normalizeAppData } from './appData';
import { APP_SECTIONS } from './firestore';
import { getAppData, saveAppData } from './storage';

export interface BackupPayload {
  schemaVersion: number;
  appVersion: string | null;
  exportedAt: string;
  source: string;
  data: AppData;
}

export interface BackupSummary {
  eggEntryCount: number;
  taskCount: number;
  expenseCount: number;
  feedLogCount: number;
  cleaningLogCount: number;
  henCount: number;
  weightEntryCount: number;
  healthRecordCount: number;
}

export interface ValidatedBackup {
  payload: BackupPayload;
  normalizedData: AppData;
  summary: BackupSummary;
}

function nowIsoString(): string {
  return new Date().toISOString();
}

function getAppVersion(): string | null {
  const envVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  return envVersion && envVersion.trim().length > 0 ? envVersion.trim() : null;
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-');
}

export function createBackupSummary(data: AppData): BackupSummary {
  return {
    eggEntryCount: data.eggs.entries.length,
    taskCount: data.tasks.tasks.length,
    expenseCount: data.expenses.entries.length,
    feedLogCount: data.feed.entries.length,
    cleaningLogCount: data.cleaning.entries.length,
    henCount: data.hens.hens.length,
    weightEntryCount: data.weights.entries.length,
    healthRecordCount: data.health.entries.length,
  };
}

export function createBackupPayload(source: string, data: AppData = getAppData()): BackupPayload {
  const normalizedData = normalizeAppData({
    ...data,
    schemaVersion: data.schemaVersion ?? APP_SCHEMA_VERSION,
  });

  return {
    schemaVersion: normalizedData.schemaVersion ?? APP_SCHEMA_VERSION,
    appVersion: getAppVersion(),
    exportedAt: nowIsoString(),
    source,
    data: normalizedData,
  };
}

export function getBackupFileName(prefix: string = 'coopkeeper-backup'): string {
  const timestamp = sanitizeFilenamePart(nowIsoString().replace(/[:.]/g, '-'));
  return `${sanitizeFilenamePart(prefix)}-${timestamp}.json`;
}

export function backupPayloadToJson(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup(payload: BackupPayload, fileName: string = getBackupFileName()): void {
  if (typeof window === 'undefined') {
    throw new Error('Backup export is only available in the browser.');
  }

  const blob = new Blob([backupPayloadToJson(payload)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportBackup(source: string = 'manual-export'): BackupPayload {
  const payload = createBackupPayload(source);
  downloadBackup(payload);
  return payload;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidTimestamp(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}

export function validateBackupPayload(raw: unknown): ValidatedBackup {
  if (!isObject(raw)) {
    throw new Error('Backup file must contain a JSON object.');
  }

  const schemaVersion = raw.schemaVersion;
  const exportedAt = raw.exportedAt;
  const source = raw.source;
  const rawData = raw.data;

  if (typeof schemaVersion !== 'number' || !Number.isFinite(schemaVersion)) {
    throw new Error('Backup file is missing a valid schemaVersion.');
  }

  if (typeof exportedAt !== 'string' || !isValidTimestamp(exportedAt)) {
    throw new Error('Backup file is missing a valid exportedAt timestamp.');
  }

  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new Error('Backup file is missing a valid source field.');
  }

  if (!isObject(rawData)) {
    throw new Error('Backup file is missing the data object.');
  }

  const normalizedData = normalizeAppData({
    ...(rawData as Partial<AppData>),
    schemaVersion,
  });

  const payload: BackupPayload = {
    schemaVersion,
    appVersion: typeof raw.appVersion === 'string' ? raw.appVersion : null,
    exportedAt,
    source,
    data: normalizedData,
  };

  return {
    payload,
    normalizedData,
    summary: createBackupSummary(normalizedData),
  };
}

export async function parseAndValidateBackupFile(file: File): Promise<ValidatedBackup> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  return validateBackupPayload(parsed);
}

export function restoreBackupData(data: AppData): void {
  const normalizedData = normalizeAppData({
    ...data,
    schemaVersion: data.schemaVersion ?? APP_SCHEMA_VERSION,
  });

  saveAppData(normalizedData, [...APP_SECTIONS]);
}
