'use client';

import { useState } from 'react';
import { Hen } from '@/lib/types';
import { useHydrated } from '@/lib/hooks';
import {
  getHens,
  addHen,
  removeHen,
  toggleHenFavorite,
  updateHenNotes,
} from '@/lib/storage';
import { Heart, Trash2, Edit2, Check, X, CalendarDays } from 'lucide-react';

function calcAge(hatchDate?: string): string {
  if (!hatchDate) return 'Age unknown';
  const birth = new Date(hatchDate);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (totalMonths < 0) return 'Age unknown';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}

export default function FavoriteHens() {
  const [hens, setHens] = useState<Hen[]>(() =>
    typeof window === 'undefined' ? [] : getHens()
  );
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newHatchDate, setNewHatchDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const isHydrated = useHydrated();

  const handleAddHen = () => {
    if (newName.trim() && newBreed.trim()) {
      addHen(newName, newBreed, '', newHatchDate || undefined);
      setHens(getHens());
      setNewName('');
      setNewBreed('');
      setNewHatchDate('');
    }
  };

  const handleRemoveHen = (id: string) => {
    removeHen(id);
    setHens(getHens());
  };

  const handleToggleFavorite = (id: string) => {
    toggleHenFavorite(id);
    setHens(getHens());
  };

  const handleSaveNotes = (id: string) => {
    updateHenNotes(id, editingNotes);
    setHens(getHens());
    setEditingId(null);
    setEditingNotes('');
  };

  const handleEditStart = (hen: Hen) => {
    setEditingId(hen.id);
    setEditingNotes(hen.notes);
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-pink-900">Favorite Hens</h2>
      </div>
      
      <div className="bg-linear-to-br from-rose-50 to-pink-50 rounded-lg p-4 border border-pink-100 mb-4">
        <h3 className="font-semibold text-pink-900 mb-3 text-sm uppercase tracking-wide">Add New Hen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Hen name"
            className="px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 placeholder-pink-400 transition"
          />
          <input
            type="text"
            value={newBreed}
            onChange={(e) => setNewBreed(e.target.value)}
            placeholder="Breed"
            className="px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 placeholder-pink-400 transition"
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-pink-800 mb-1 uppercase tracking-wide">
            Hatch Date (optional)
          </label>
          <input
            type="date"
            value={newHatchDate}
            onChange={(e) => setNewHatchDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 transition"
          />
        </div>
        <button
          onClick={handleAddHen}
          className="w-full px-4 py-2 bg-pink-700 text-white rounded-lg hover:bg-pink-800 active:scale-95 transition text-sm font-medium"
        >
          Add Hen
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <h3 className="font-semibold text-pink-900 mb-3 text-sm uppercase tracking-wide">Your Hens</h3>
        {hens.length === 0 ? (
          <p className="text-pink-700 text-sm italic">No hens added yet</p>
        ) : (
          <div className="space-y-2">
            {hens.map(hen => (
              <div
                key={hen.id}
                className={`p-3 rounded-lg border transition ${
                  hen.isFavorite
                    ? 'bg-white border-red-200 ring-1 ring-red-100'
                    : 'bg-white border-pink-100 hover:border-pink-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(hen.id)}
                        className="text-lg hover:scale-110 transition shrink-0"
                      >
                        {hen.isFavorite ? (
                          <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                        ) : (
                          <Heart className="w-5 h-5 text-pink-300" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="font-bold text-pink-900 truncate">{hen.name}</p>
                        <p className="text-xs text-pink-600">{hen.breed}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveHen(hen.id)}
                    className="text-pink-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Age */}
                <div className="flex items-center gap-1 mb-2">
                  <CalendarDays className="w-3 h-3 text-pink-500 shrink-0" />
                  <span className="text-xs text-pink-700 font-medium">{calcAge(hen.hatchDate)}</span>
                </div>

                {editingId === hen.id ? (
                  <div className="mb-2">
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="w-full px-2 py-1 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs resize-none bg-white text-pink-900 placeholder-pink-400 transition"
                      rows={2}
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleSaveNotes(hen.id)}
                        className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {hen.notes && (
                      <p className="text-xs text-pink-900 mb-2 italic bg-pink-50 p-2 rounded">
                        &ldquo;{hen.notes}&rdquo;
                      </p>
                    )}
                    <button
                      onClick={() => handleEditStart(hen)}
                      className="text-xs text-pink-700 hover:text-pink-900 font-semibold flex items-center gap-1 hover:bg-pink-50 px-2 py-1 rounded transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      {hen.notes ? 'Edit notes' : 'Add notes'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
