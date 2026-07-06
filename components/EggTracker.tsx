'use client';

import { useState } from 'react';
import { getEggEntries, getEggTotals, addEggEntry, updateEggEntry, removeEggEntry } from '@/lib/storage';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { getTodayDateString, formatDate, isValidLocalDateString, parseLocalDate } from '@/lib/dateUtils';
import { Egg, Trash2, Edit2, CalendarDays } from 'lucide-react';

function isWholeNumber(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

export default function EggTracker() {
  const entries = useSyncedStorageValue(getEggEntries);
  const eggTotals = useSyncedStorageValue(getEggTotals);
  const [date, setDate] = useState(getTodayDateString());
  const [count, setCount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const isHydrated = useHydrated();

  const handleAddEntry = () => {
    const trimmedDate = date.trim();

    if (!isValidLocalDateString(trimmedDate)) {
      setError('Please choose a valid date.');
      return;
    }

    if (!isWholeNumber(count)) {
      setError('Egg count must be a whole number.');
      return;
    }

    const parsedCount = Number(count);

    if (!Number.isInteger(parsedCount) || parsedCount < 0) {
      setError('Egg count must be zero or greater.');
      return;
    }

    if (editingId) {
      updateEggEntry(editingId, trimmedDate, parsedCount);
    } else {
      addEggEntry(trimmedDate, parsedCount);
    }

    setDate(getTodayDateString());
    setCount('');
    setEditingId(null);
    setError('');
  };

  const handleRemove = (id: string) => {
    removeEggEntry(id);
  };

  const handleEditStart = (entryId: string) => {
    const entry = entries.find(item => item.id === entryId);
    if (!entry) return;

    setEditingId(entry.id);
    setDate(entry.date);
    setCount(String(entry.count));
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDate(getTodayDateString());
    setCount('');
    setError('');
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Egg className="w-6 h-6 text-amber-700" />
        <h2 className="text-2xl font-bold text-amber-900">Egg Tracker</h2>
      </div>
      
      <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-4 mb-4 border border-amber-100">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center bg-white rounded-lg border border-amber-100 p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Eggs Today</p>
            <p className="text-3xl font-bold text-amber-900 mt-1">{eggTotals.today}</p>
          </div>
          <div className="text-center bg-white rounded-lg border border-amber-100 p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Eggs This Week</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{eggTotals.week}</p>
          </div>
          <div className="text-center bg-white rounded-lg border border-amber-100 p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Eggs This Month</p>
            <p className="text-3xl font-bold text-orange-700 mt-1">{eggTotals.month}</p>
          </div>
          <div className="text-center bg-white rounded-lg border border-amber-100 p-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Lifetime Eggs</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">{eggTotals.lifetime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition bg-white text-amber-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">
              Egg Count
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition bg-white text-amber-900"
              onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
            />
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={handleAddEntry}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 active:scale-95 transition font-medium sm:shrink-0"
          >
            {editingId ? 'Save Changes' : 'Add Egg Entry'}
          </button>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition font-medium sm:shrink-0"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-amber-900 mb-3 text-sm uppercase tracking-wide">Daily Log</h3>
          {entries.length === 0 ? (
            <p className="text-amber-700 text-sm italic">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries
                .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
                .map(entry => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center gap-2 text-sm bg-white rounded-lg p-3 border border-amber-100 hover:border-amber-300 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <CalendarDays className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="text-amber-900 font-medium truncate">{formatDate(entry.date)}</span>
                      </div>
                      <p className="text-amber-700">
                        <strong>{entry.count}</strong> eggs
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditStart(entry.id)}
                        className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="text-amber-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
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
