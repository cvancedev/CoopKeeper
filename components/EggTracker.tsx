'use client';

import { useState } from 'react';
import { EggEntry } from '@/lib/types';
import { getEggEntries, getWeeklyEggTotal, addEggEntry, removeEggEntry } from '@/lib/storage';
import { useHydrated } from '@/lib/hooks';
import { Egg, Trash2 } from 'lucide-react';

export default function EggTracker() {
  const [entries, setEntries] = useState<EggEntry[]>(() =>
    typeof window === 'undefined' ? [] : getEggEntries()
  );
  const [weeklyTotal, setWeeklyTotal] = useState(() =>
    typeof window === 'undefined' ? 0 : getWeeklyEggTotal()
  );
  const [inputValue, setInputValue] = useState('');
  const isHydrated = useHydrated();

  const handleAddEntry = () => {
    const count = parseInt(inputValue) || 0;
    if (count > 0) {
      addEggEntry(count);
      setEntries(getEggEntries());
      setWeeklyTotal(getWeeklyEggTotal());
      setInputValue('');
    }
  };

  const handleRemove = (id: string) => {
    removeEggEntry(id);
    setEntries(getEggEntries());
    setWeeklyTotal(getWeeklyEggTotal());
  };

  if (!isHydrated) return null;

  const todayEntry = entries.find(
    e => e.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Egg className="w-6 h-6 text-amber-700" />
        <h2 className="text-2xl font-bold text-amber-900">Egg Tracker</h2>
      </div>
      
      <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-4 mb-4 border border-amber-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Today&apos;s Count</p>
            <p className="text-4xl font-bold text-amber-900 mt-1">{todayEntry?.count || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Weekly Total</p>
            <p className="text-4xl font-bold text-orange-600 mt-1">{weeklyTotal}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Number of eggs"
            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition bg-white text-amber-900"
            onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
          />
          <button
            onClick={handleAddEntry}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 active:scale-95 transition font-medium"
          >
            Add
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-amber-900 mb-3 text-sm uppercase tracking-wide">Daily Log</h3>
          {entries.length === 0 ? (
            <p className="text-amber-700 text-sm italic">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(entry => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center text-sm bg-white rounded-lg p-3 border border-amber-100 hover:border-amber-300 transition"
                  >
                    <span className="text-amber-900">
                      {new Date(entry.date).toLocaleDateString()}: <strong className="text-amber-700">{entry.count}</strong>
                    </span>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-amber-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
