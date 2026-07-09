import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

function assert(condition, description) {
  if (!condition) {
    throw new Error(description);
  }
  console.log(`PASS: ${description}`);
}

function assertNoRegex(text, regex, description) {
  assert(!regex.test(text), description);
}

function assertRegex(text, regex, description) {
  assert(regex.test(text), description);
}

const firestore = read('lib/firestore.ts');
const storage = read('lib/storage.ts');
const backup = read('lib/backup.ts');
const appData = read('lib/appData.ts');
const backupUi = read('components/BackupRestore.tsx');

console.log('Running CoopKeeper data safety regression checks...');

// 1) No new Date.now IDs in storage write paths.
assertNoRegex(
  storage,
  /id:\s*Date\.now\(\)\.toString\(\)/,
  'New records do not use Date.now-based IDs in storage write paths'
);
assertRegex(
  storage,
  /id:\s*createRecordId\(\)/,
  'Storage write paths use createRecordId() for new record IDs'
);

// 2) Firestore writes are merge-safe.
assertRegex(
  firestore,
  /setDoc\(farmDoc,\s*payload,\s*\{\s*merge:\s*true\s*\}\)/,
  'Firestore section writes use setDoc merge:true'
);

// 3) Startup path does not write from getAppData read path.
assertRegex(
  storage,
  /export\s+function\s+getAppData\(\):\s*AppData\s*\{\s*return\s+readLocalAppData\(\);\s*\}/,
  'getAppData read path is read-only and does not trigger save writes'
);

// 4) Stale local cache does not automatically overwrite remote on bootstrap.
assertRegex(
  storage,
  /const\s+nextData\s*=\s*pendingCloudWrite\s*\?\s*mergeAppDataForSafety\(remoteData,\s*pendingCloudWrite\.data\)\s*:\s*remoteData;/,
  'Bootstrap prefers remote data and merges only queued local writes'
);

// 5) Backup payload includes required fields.
assertRegex(
  backup,
  /return\s*\{[\s\S]*schemaVersion:[\s\S]*appVersion:[\s\S]*exportedAt:[\s\S]*source:[\s\S]*data:/,
  'Backup payload includes schemaVersion, appVersion, exportedAt, source, and data'
);

// 6) Backup restore requires confirmation in UI.
assertRegex(
  backupUi,
  /window\.confirm\(/,
  'Backup restore requires explicit user confirmation'
);

// 7) Pre-restore backup is created before applying restore.
assertRegex(
  backupUi,
  /createBackupPayload\('pre-restore-auto',\s*getAppData\(\)\)/,
  'Restore flow creates pre-restore backup payload'
);
assertRegex(
  backupUi,
  /downloadBackup\(preRestorePayload,\s*getBackupFileName\('coopkeeper-pre-restore-backup'\)\)/,
  'Restore flow downloads pre-restore backup file'
);

// 8) Backup import validates payload structure.
assertRegex(
  backup,
  /export\s+function\s+validateBackupPayload\(raw:\s*unknown\):\s*ValidatedBackup\s*\{/,
  'Backup import uses explicit payload validation'
);

// 9) Schema version defaults exist for backward compatibility.
assertRegex(
  appData,
  /export\s+const\s+APP_SCHEMA_VERSION\s*=\s*1;/,
  'Schema version constant is defined'
);
assertRegex(
  appData,
  /schemaVersion:\s*typeof\s+rawData\?\.schemaVersion\s*===\s*'number'\s*\?\s*rawData\.schemaVersion\s*:\s*APP_SCHEMA_VERSION/,
  'Normalization provides backward-compatible schema defaulting'
);

console.log('All data safety regression checks passed.');
