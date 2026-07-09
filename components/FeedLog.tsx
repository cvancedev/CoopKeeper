'use client';

import { useState } from 'react';
import { getFeedEntries, addFeedEntry, removeFeedEntry, updateFeedEntry } from '@/lib/storage';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { formatDate } from '@/lib/dateUtils';
import { Leaf, Trash2, Calendar, Edit2 } from 'lucide-react';

const FEED_TYPES = ['Pellets', 'Scratch', 'Treats', 'Vegetables', 'Other'];

export default function FeedLog() {
  const entries = useSyncedStorageValue(getFeedEntries);
  const [feedType, setFeedType] = useState(FEED_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const isHydrated = useHydrated();

  const handleAddEntry = () => {
    if (editingId) {
      updateFeedEntry(editingId, feedType, notes);
      setEditingId(null);
    } else {
      addFeedEntry(feedType, notes);
    }

    setNotes('');
    setFeedType(FEED_TYPES[0]);
  };

  const handleRemove = (id: string) => {
    removeFeedEntry(id);

    if (editingId === id) {
      setEditingId(null);
      setFeedType(FEED_TYPES[0]);
      setNotes('');
    }
  };

  const handleEditStart = (id: string) => {
    const entry = entries.find(item => item.id === id);
    if (!entry) {
      return;
    }

    setEditingId(id);
    setFeedType(entry.feedType);
    setNotes(entry.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFeedType(FEED_TYPES[0]);
    setNotes('');
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Leaf className="w-6 h-6 text-yellow-700" />
        <h2 className="text-2xl font-bold text-orange-900">Feed Log</h2>
      </div>
      
      <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
        <div className="mb-4">
          <div className="mb-3">
            <label className="block text-sm font-semibold text-orange-900 mb-2 uppercase tracking-wide">
              Feed Type
            </label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white text-orange-900 transition"
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
            className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 resize-none text-sm bg-white text-orange-900 placeholder-yellow-700 transition"
            rows={2}
          />
          <button
            onClick={handleAddEntry}
            className="mt-2 px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-800 active:scale-95 transition font-medium w-full"
          >
            {editingId ? 'Save Changes' : 'Log Feed'}
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
          <h3 className="font-semibold text-orange-900 mb-3 text-sm uppercase tracking-wide">Recent Logs</h3>
          {entries.length === 0 ? (
            <p className="text-orange-700 text-sm italic">No feed entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg p-3 border border-yellow-100 hover:border-yellow-300 transition"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-white bg-yellow-700 px-2.5 py-1 rounded-md">
                          {entry.feedType}
                        </span>
                        <span className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-orange-900 text-sm wrap-break-words">{entry.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditStart(entry.id)}
                      className="text-yellow-600 hover:text-yellow-800 p-1 hover:bg-yellow-50 rounded transition shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-yellow-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
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
