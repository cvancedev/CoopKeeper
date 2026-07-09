'use client';

import { useState } from 'react';
import {
  createBackupPayload,
  downloadBackup,
  exportBackup,
  getBackupFileName,
  parseAndValidateBackupFile,
  restoreBackupData,
  type ValidatedBackup,
} from '@/lib/backup';
import { getAppData } from '@/lib/storage';
import { ShieldCheck, Download, Upload, AlertCircle } from 'lucide-react';

export default function BackupRestore() {
  const [preview, setPreview] = useState<ValidatedBackup | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleExport = () => {
    try {
      exportBackup('manual-export');
      setSuccessMessage('Backup export started. Your JSON file should download shortly.');
      setError('');
    } catch {
      setError('Unable to export backup. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleImportFile = async (file: File | null) => {
    setPreview(null);
    setError('');
    setSuccessMessage('');

    if (!file) {
      setSelectedFileName('');
      return;
    }

    setSelectedFileName(file.name);
    setIsParsing(true);

    try {
      const validated = await parseAndValidateBackupFile(file);
      setPreview(validated);
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'Unable to read backup file.';
      setError(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleRestore = () => {
    if (!preview) {
      return;
    }

    const confirmed = window.confirm(
      'Restore this backup? This will replace current CoopKeeper data on this device and sync to cloud if enabled.'
    );

    if (!confirmed) {
      return;
    }

    setIsRestoring(true);

    try {
      const preRestorePayload = createBackupPayload('pre-restore-auto', getAppData());
      downloadBackup(preRestorePayload, getBackupFileName('coopkeeper-pre-restore-backup'));

      restoreBackupData(preview.normalizedData);
      setSuccessMessage('Backup restored successfully. A pre-restore backup was downloaded automatically.');
      setError('');
      setPreview(null);
      setSelectedFileName('');
    } catch {
      setError('Restore failed. Your existing data was not changed.');
      setSuccessMessage('');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-6 h-6 text-indigo-700" />
        <h2 className="text-2xl font-bold text-indigo-900">Backup &amp; Restore</h2>
      </div>

      <div className="bg-linear-to-br from-indigo-50 to-sky-50 rounded-lg p-4 border border-indigo-100">
        <p className="text-sm text-indigo-900 mb-4">
          Export a full JSON backup, then import and preview before restoring.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 active:scale-95 transition font-medium inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Backup
          </button>

          <label className="px-4 py-2 bg-white text-indigo-900 border border-indigo-200 rounded-lg hover:border-indigo-300 transition font-medium inline-flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Backup
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async e => {
                const inputElement = e.currentTarget;
                const file = e.target.files?.[0] ?? null;
                await handleImportFile(file);
                if (inputElement) {
                  inputElement.value = '';
                }
              }}
            />
          </label>
        </div>

        {selectedFileName && (
          <p className="text-xs text-indigo-700 mb-2">
            Selected file: {selectedFileName}
          </p>
        )}

        {isParsing && (
          <p className="text-xs text-indigo-700 mb-2">Validating backup file...</p>
        )}

        {error && (
          <div className="mb-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-3 rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        {preview && (
          <div className="mt-4 bg-white rounded-lg border border-indigo-100 p-4">
            <h3 className="font-semibold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Restore Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <PreviewItem label="Egg Entries" value={preview.summary.eggEntryCount} />
              <PreviewItem label="Tasks" value={preview.summary.taskCount} />
              <PreviewItem label="Expenses" value={preview.summary.expenseCount} />
              <PreviewItem label="Feed Logs" value={preview.summary.feedLogCount} />
              <PreviewItem label="Cleaning Logs" value={preview.summary.cleaningLogCount} />
              <PreviewItem label="Hens" value={preview.summary.henCount} />
              <PreviewItem label="Weight Entries" value={preview.summary.weightEntryCount} />
              <PreviewItem label="Health Records" value={preview.summary.healthRecordCount} />
            </div>

            <p className="text-xs text-indigo-700 mb-3">
              Backup source: {preview.payload.source} | Exported: {new Date(preview.payload.exportedAt).toLocaleString()}
            </p>

            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition font-medium"
            >
              {isRestoring ? 'Restoring...' : 'Restore This Backup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700 mb-1">{label}</p>
      <p className="text-lg font-bold text-indigo-900">{value}</p>
    </div>
  );
}
