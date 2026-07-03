'use client';

import { useEffect, useState } from 'react';
import { Hen } from '@/lib/types';
import {
  getHens,
  addHen,
  removeHen,
  toggleHenFavorite,
  updateHenNotes,
} from '@/lib/storage';

export default function FavoriteHens() {
  const [hens, setHens] = useState<Hen[]>([]);
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setHens(getHens());
    setIsHydrated(true);
  }, []);

  const handleAddHen = () => {
    if (newName.trim() && newBreed.trim()) {
      addHen(newName, newBreed);
      setHens(getHens());
      setNewName('');
      setNewBreed('');
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
    <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-pink-900 mb-4">🐔 Favorite Hens</h2>
      
      <div className="bg-white rounded p-4 border border-pink-100 mb-4">
        <h3 className="font-semibold text-pink-900 mb-3 text-sm">Add New Hen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Hen name"
            className="px-3 py-2 border border-pink-200 rounded focus:outline-none focus:border-pink-400 text-sm"
          />
          <input
            type="text"
            value={newBreed}
            onChange={(e) => setNewBreed(e.target.value)}
            placeholder="Breed"
            className="px-3 py-2 border border-pink-200 rounded focus:outline-none focus:border-pink-400 text-sm"
          />
        </div>
        <button
          onClick={handleAddHen}
          className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition text-sm"
        >
          Add Hen
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <h3 className="font-semibold text-pink-900 mb-2 text-sm">Your Hens</h3>
        {hens.length === 0 ? (
          <p className="text-pink-700 text-sm">No hens added yet</p>
        ) : (
          <div className="space-y-2">
            {hens.map(hen => (
              <div
                key={hen.id}
                className={`p-3 rounded border ${
                  hen.isFavorite
                    ? 'bg-pink-100 border-pink-300'
                    : 'bg-pink-50 border-pink-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(hen.id)}
                        className="text-lg"
                      >
                        {hen.isFavorite ? '⭐' : '☆'}
                      </button>
                      <div>
                        <p className="font-bold text-pink-900">{hen.name}</p>
                        <p className="text-xs text-pink-700">{hen.breed}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveHen(hen.id)}
                    className="text-pink-600 hover:text-pink-900 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {editingId === hen.id ? (
                  <div className="mb-2">
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:border-pink-400 text-xs resize-none"
                      rows={2}
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleSaveNotes(hen.id)}
                        className="flex-1 px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {hen.notes && (
                      <p className="text-xs text-pink-900 mb-2 italic">
                        "{hen.notes}"
                      </p>
                    )}
                    <button
                      onClick={() => handleEditStart(hen)}
                      className="text-xs text-pink-600 hover:text-pink-900 font-semibold"
                    >
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
