'use client';

import { useEffect, useState } from 'react';
import { WeightEntry } from '@/lib/types';
import { getHens, getWeightEntries, addWeightEntry, removeWeightEntry } from '@/lib/storage';

export default function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [hens, setHens] = useState<any[]>([]);
  const [selectedHen, setSelectedHen] = useState('');
  const [weight, setWeight] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const henList = getHens();
    setHens(henList);
    if (henList.length > 0) {
      setSelectedHen(henList[0].name);
    }
    setEntries(getWeightEntries());
    setIsHydrated(true);
  }, []);

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
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">⚖️ Weight Tracker</h2>
      
      <div className="bg-white rounded p-4 border border-blue-100 mb-4">
        <h3 className="font-semibold text-blue-900 mb-3 text-sm">Record Weight</h3>
        {hens.length === 0 ? (
          <p className="text-blue-700 text-sm">Add hens first to track weights</p>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Select Hen
              </label>
              <select
                value={selectedHen}
                onChange={(e) => setSelectedHen(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:border-blue-400 text-sm"
              >
                {hens.map(hen => (
                  <option key={hen.id} value={hen.name}>
                    {hen.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (lbs/kg)"
                className="flex-1 px-3 py-2 border border-blue-200 rounded focus:outline-none focus:border-blue-400 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
              />
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Weight History</h3>
        {Object.keys(groupedByHen).length === 0 ? (
          <p className="text-blue-700 text-sm">No weight entries yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedByHen).map(([henName, henEntries]) => (
              <div key={henName} className="bg-blue-100 p-3 rounded border border-blue-200">
                <p className="font-bold text-blue-900 text-sm mb-2">{henName}</p>
                <div className="space-y-1">
                  {henEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => (
                      <div
                        key={entry.id}
                        className="flex justify-between items-center text-xs bg-white p-2 rounded"
                      >
                        <span className="text-blue-900">
                          {new Date(entry.date).toLocaleDateString()}: <strong>{entry.weight}</strong>
                        </span>
                        <button
                          onClick={() => handleRemove(entry.id)}
                          className="text-blue-600 hover:text-blue-900 font-bold"
                        >
                          ✕
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
