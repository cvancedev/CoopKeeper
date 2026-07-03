'use client';

import { useEffect, useState } from 'react';
import { EggEntry } from '@/lib/types';
import { getEggEntries, getWeeklyEggTotal, addEggEntry, removeEggEntry } from '@/lib/storage';

export default function EggTracker() {
  const [entries, setEntries] = useState<EggEntry[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setEntries(getEggEntries());
    setWeeklyTotal(getWeeklyEggTotal());
    setIsHydrated(true);
  }, []);

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
    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-amber-900 mb-4">🥚 Egg Tracker</h2>
      
      <div className="bg-white rounded p-4 mb-4 border border-amber-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-amber-700">Today's Count</p>
            <p className="text-3xl font-bold text-amber-900">{todayEntry?.count || 0}</p>
          </div>
          <div>
            <p className="text-sm text-amber-700">Weekly Total</p>
            <p className="text-3xl font-bold text-amber-600">{weeklyTotal}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Number of eggs"
            className="flex-1 px-3 py-2 border border-amber-200 rounded focus:outline-none focus:border-amber-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
          />
          <button
            onClick={handleAddEntry}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
          >
            Add
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-amber-900 mb-2 text-sm">Daily Log</h3>
          {entries.length === 0 ? (
            <p className="text-amber-700 text-sm">No entries yet</p>
          ) : (
            <div className="space-y-1">
              {entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(entry => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center text-sm bg-amber-100 p-2 rounded"
                  >
                    <span className="text-amber-900">
                      {new Date(entry.date).toLocaleDateString()}: <strong>{entry.count}</strong> eggs
                    </span>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-amber-600 hover:text-amber-900 font-bold text-xs"
                    >
                      ✕
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
