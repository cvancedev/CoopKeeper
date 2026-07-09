'use client';

import { useState } from 'react';
import {
  getCleaningEntries,
  addCleaningEntry,
  removeCleaningEntry,
  updateCleaningEntry,
} from '@/lib/storage';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { formatDate } from '@/lib/dateUtils';
import { Droplets, Trash2, Clock, Edit2 } from 'lucide-react';

export default function CleaningLog() {
  const entries = useSyncedStorageValue(getCleaningEntries);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const isHydrated = useHydrated();

  const handleAddEntry = () => {
    if (notes.trim()) {
      if (editingId) {
        updateCleaningEntry(editingId, notes);
        setEditingId(null);
      } else {
        addCleaningEntry(notes);
      }

      setNotes('');
    }
  };

  const handleRemove = (id: string) => {
    removeCleaningEntry(id);

    if (editingId === id) {
      setEditingId(null);
      setNotes('');
    }
  };

  const handleEditStart = (id: string) => {
    const entry = entries.find(item => item.id === id);
    if (!entry) {
      return;
    }

    setEditingId(id);
    setNotes(entry.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNotes('');
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-6 h-6 text-green-700" />
        <h2 className="text-2xl font-bold text-green-900">Cleaning Log</h2>
      </div>
      
      <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-green-100">
        <div className="mb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter cleaning notes (e.g., 'Changed water, swept coop')"
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none bg-white text-green-900 placeholder-green-400 transition"
            rows={3}
          />
          <button
            onClick={handleAddEntry}
            className="mt-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 active:scale-95 transition font-medium w-full"
          >
            {editingId ? 'Save Changes' : 'Log Entry'}
          </button>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="mt-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition font-medium w-full"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-green-900 mb-3 text-sm uppercase tracking-wide">Recent Entries</h3>
          {entries.length === 0 ? (
            <p className="text-green-700 text-sm italic">No cleaning entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg p-3 border border-green-100 hover:border-green-300 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mb-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.date)}
                      </div>
                      <p className="text-green-900 text-sm wrap-break-words">{entry.notes}</p>
                    </div>
                    <button
                      onClick={() => handleEditStart(entry.id)}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-green-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
