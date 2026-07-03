'use client';

import { useState } from 'react';
import { Hen, WeightEntry } from '@/lib/types';
import { getHens, getWeightEntries, addWeightEntry, removeWeightEntry } from '@/lib/storage';
import { useHydrated } from '@/lib/hooks';
import { Scale, Trash2, TrendingUp } from 'lucide-react';

export default function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>(() =>
    typeof window === 'undefined' ? [] : getWeightEntries()
  );
  const [hens] = useState<Hen[]>(() =>
    typeof window === 'undefined' ? [] : getHens()
  );
  const [selectedHen, setSelectedHen] = useState(() => {
    if (typeof window === 'undefined') return '';
    const list = getHens();
    return list.length > 0 ? list[0].name : '';
  });
  const [weight, setWeight] = useState('');
  const isHydrated = useHydrated();

  const handleAddEntry = () => {
    const weightNum = parseFloat(weight);
    if (selectedHen && weightNum > 0) {
      addWeightEntry(selectedHen, weightNum);
      setEntries(getWeightEntries());
      setWeight('');
    }
  };

  const handleRemove = (id: string) => {
    removeWeightEntry(id);
    setEntries(getWeightEntries());
  };

  if (!isHydrated) return null;

  const groupedByHen = entries.reduce((acc, entry) => {
    if (!acc[entry.henName]) {
      acc[entry.henName] = [];
    }
    acc[entry.henName].push(entry);
    return acc;
  }, {} as Record<string, WeightEntry[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Scale className="w-6 h-6 text-blue-700" />
        <h2 className="text-2xl font-bold text-blue-900">Weight Tracker</h2>
      </div>
      
      <div className="bg-linear-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100 mb-4">
        <h3 className="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wide">Record Weight</h3>
        {hens.length === 0 ? (
          <p className="text-blue-700 text-sm italic">Add hens first to track weights</p>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-sm font-semibold text-blue-900 mb-2 uppercase tracking-wide">
                Select Hen
              </label>
              <select
                value={selectedHen}
                onChange={(e) => setSelectedHen(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm bg-white text-blue-900 transition"
              >
                {hens.map(hen => (
                  <option key={hen.id} value={hen.name}>
                    {hen.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (lbs/kg)"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm bg-white text-blue-900 placeholder-blue-400 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
              />
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 active:scale-95 transition font-medium"
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wide">Weight History</h3>
        {Object.keys(groupedByHen).length === 0 ? (
          <p className="text-blue-700 text-sm italic">No weight entries yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedByHen).map(([henName, henEntries]) => (
              <div key={henName} className="bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <p className="font-bold text-blue-900 text-sm">{henName}</p>
                </div>
                <div className="space-y-1">
                  {henEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => (
                      <div
                        key={entry.id}
                        className="flex justify-between items-center text-xs bg-blue-50 p-2 rounded-lg"
                      >
                        <span className="text-blue-900">
                          {new Date(entry.date).toLocaleDateString()}: <strong className="text-blue-700">{entry.weight}</strong>
                        </span>
                        <button
                          onClick={() => handleRemove(entry.id)}
                          className="text-blue-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
