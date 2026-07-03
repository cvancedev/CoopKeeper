'use client';

import { useEffect, useState } from 'react';
import { FeedEntry } from '@/lib/types';
import { getFeedEntries, addFeedEntry, removeFeedEntry } from '@/lib/storage';

const FEED_TYPES = ['Pellets', 'Scratch', 'Treats', 'Vegetables', 'Other'];

export default function FeedLog() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [feedType, setFeedType] = useState(FEED_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setEntries(getFeedEntries());
    setIsHydrated(true);
  }, []);

  const handleAddEntry = () => {
    addFeedEntry(feedType, notes);
    setEntries(getFeedEntries());
    setNotes('');
  };

  const handleRemove = (id: string) => {
    removeFeedEntry(id);
    setEntries(getFeedEntries());
  };

  if (!isHydrated) return null;

  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-orange-900 mb-4">🌾 Feed Log</h2>
      
      <div className="bg-white rounded p-4 border border-orange-100">
        <div className="mb-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-orange-900 mb-1">
              Feed Type
            </label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              className="w-full px-3 py-2 border border-orange-200 rounded focus:outline-none focus:border-orange-400"
            >
              {FEED_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes (e.g., 'Amount given, hens' reaction')"
            className="w-full px-3 py-2 border border-orange-200 rounded focus:outline-none focus:border-orange-400 resize-none text-sm"
            rows={2}
          />
          <button
            onClick={handleAddEntry}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            Log Feed
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-orange-900 mb-2 text-sm">Recent Logs</h3>
          {entries.length === 0 ? (
            <p className="text-orange-700 text-sm">No feed entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-orange-100 p-3 rounded border border-orange-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white bg-orange-600 px-2 py-1 rounded">
                          {entry.feedType}
                        </span>
                        <span className="text-xs text-orange-600 font-semibold">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-orange-900 text-sm mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-orange-600 hover:text-orange-900 font-bold ml-2"
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
