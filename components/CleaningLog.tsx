'use client';

import { useEffect, useState } from 'react';
import { CleaningEntry } from '@/lib/types';
import { getCleaningEntries, addCleaningEntry, removeCleaningEntry } from '@/lib/storage';

export default function CleaningLog() {
  const [entries, setEntries] = useState<CleaningEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setEntries(getCleaningEntries());
    setIsHydrated(true);
  }, []);

  const handleAddEntry = () => {
    if (notes.trim()) {
      addCleaningEntry(notes);
      setEntries(getCleaningEntries());
      setNotes('');
    }
  };

  const handleRemove = (id: string) => {
    removeCleaningEntry(id);
    setEntries(getCleaningEntries());
  };

  if (!isHydrated) return null;

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-green-900 mb-4">🧹 Cleaning Log</h2>
      
      <div className="bg-white rounded p-4 border border-green-100">
        <div className="mb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter cleaning notes (e.g., 'Changed water, swept coop')"
            className="w-full px-3 py-2 border border-green-200 rounded focus:outline-none focus:border-green-400 resize-none"
            rows={3}
          />
          <button
            onClick={handleAddEntry}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Log Entry
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-green-900 mb-2 text-sm">Recent Entries</h3>
          {entries.length === 0 ? (
            <p className="text-green-700 text-sm">No cleaning entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-green-100 p-3 rounded border border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-semibold">
                        {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-green-900 text-sm mt-1">{entry.notes}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-green-600 hover:text-green-900 font-bold ml-2"
                    >
                      ✕
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
