'use client';

import { useState } from 'react';
import { Hen } from '@/lib/types';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import {
  getHens,
  addHen,
  removeHen,
  toggleHenFavorite,
  updateHenNotes,
  updateHenPhoto,
} from '@/lib/storage';
import { getTodayDateString, parseLocalDate } from '@/lib/dateUtils';
import { Heart, Trash2, Edit2, Check, X, CalendarDays, Camera } from 'lucide-react';

const MAX_PHOTO_SIZE_BYTES = 500 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

function HenPhoto({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="h-14 w-14 rounded-full object-cover border-2 border-pink-100 bg-pink-50 shrink-0"
      />
    );
  }

  return (
    <div className="h-14 w-14 rounded-full border-2 border-pink-100 bg-pink-50 text-pink-400 flex items-center justify-center text-2xl shrink-0">
      🐔
    </div>
  );
}

function calcAge(hatchDate?: string): string {
  if (!hatchDate) return 'Age unknown';
  const birth = parseLocalDate(hatchDate);
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
  const hens = useSyncedStorageValue(getHens);
  const [newName, setNewName] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newHatchDate, setNewHatchDate] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newPhotoError, setNewPhotoError] = useState('');
  const [newPhotoInputKey, setNewPhotoInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingPhotoHenId, setEditingPhotoHenId] = useState<string | null>(null);
  const [editingPhotoUrl, setEditingPhotoUrl] = useState<string | null>(null);
  const [editingPhotoSelected, setEditingPhotoSelected] = useState(false);
  const [editingPhotoError, setEditingPhotoError] = useState('');
  const [editingPhotoInputKey, setEditingPhotoInputKey] = useState(0);
  const isHydrated = useHydrated();

  const handlePhotoFile = async (
    file: File | null,
    setPreview: (value: string | null) => void,
    setError: (value: string) => void,
    setSelected?: (value: boolean) => void
  ) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      setPreview(null);
      setSelected?.(false);
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setError('Please choose an image smaller than 500 KB.');
      setPreview(null);
      setSelected?.(false);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreview(dataUrl);
      setError('');
      setSelected?.(true);
    } catch {
      setError('Unable to read that image. Please try another file.');
      setPreview(null);
      setSelected?.(false);
    }
  };

  const handleAddHen = () => {
    if (newName.trim() && newBreed.trim()) {
      addHen(newName, newBreed, '', newHatchDate || undefined, newPhotoUrl);
      setNewName('');
      setNewBreed('');
      setNewHatchDate('');
      setNewPhotoUrl(null);
      setNewPhotoError('');
      setNewPhotoInputKey(key => key + 1);
    }
  };

  const handleRemoveHen = (id: string) => {
    removeHen(id);
  };

  const handleToggleFavorite = (id: string) => {
    toggleHenFavorite(id);
  };

  const handleSaveNotes = (id: string) => {
    updateHenNotes(id, editingNotes);
    setEditingId(null);
    setEditingNotes('');
  };

  const handlePhotoEditStart = (hen: Hen) => {
    setEditingPhotoHenId(hen.id);
    setEditingPhotoUrl(hen.photoUrl ?? null);
    setEditingPhotoSelected(false);
    setEditingPhotoError('');
    setEditingPhotoInputKey(key => key + 1);
  };

  const handleSavePhoto = (henId: string) => {
    if (editingPhotoHenId === henId && editingPhotoSelected) {
      updateHenPhoto(henId, editingPhotoUrl);
    }

    setEditingPhotoHenId(null);
    setEditingPhotoUrl(null);
    setEditingPhotoSelected(false);
    setEditingPhotoError('');
  };

  const handleCancelPhotoEdit = () => {
    setEditingPhotoHenId(null);
    setEditingPhotoUrl(null);
    setEditingPhotoSelected(false);
    setEditingPhotoError('');
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
            max={getTodayDateString()}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 transition"
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-pink-800 mb-1 uppercase tracking-wide">
            Photo (optional)
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-pink-100 bg-white p-3">
            <HenPhoto photoUrl={newPhotoUrl} name={newName || 'Hen photo preview'} />
            <div className="min-w-0 flex-1">
              <input
                key={newPhotoInputKey}
                type="file"
                accept="image/*"
                onChange={async e => {
                  const file = e.target.files?.[0] ?? null;
                  await handlePhotoFile(file, setNewPhotoUrl, setNewPhotoError);
                }}
                className="block w-full text-xs text-pink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-700 file:px-3 file:py-2 file:text-white hover:file:bg-pink-800"
              />
              <p className="mt-1 text-[11px] text-pink-600">
                Image only, up to 500 KB. Saved locally as a data URL.
              </p>
              {newPhotoError && <p className="mt-1 text-[11px] text-red-600">{newPhotoError}</p>}
            </div>
          </div>
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
                    <div className="flex items-center gap-3">
                      <HenPhoto photoUrl={hen.photoUrl} name={hen.name} />
                      <div className="min-w-0 flex-1">
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

                {editingPhotoHenId === hen.id ? (
                  <div className="mt-3 rounded-lg border border-pink-100 bg-pink-50 p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <HenPhoto photoUrl={editingPhotoUrl ?? hen.photoUrl} name={hen.name} />
                      <div className="min-w-0 flex-1">
                        <label className="block text-xs font-semibold text-pink-800 mb-1 uppercase tracking-wide">
                          Update Photo
                        </label>
                        <input
                          key={editingPhotoInputKey}
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            const file = e.target.files?.[0] ?? null;
                            await handlePhotoFile(file, setEditingPhotoUrl, setEditingPhotoError, setEditingPhotoSelected);
                          }}
                          className="block w-full text-xs text-pink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-700 file:px-3 file:py-2 file:text-white hover:file:bg-pink-800"
                        />
                        <p className="mt-1 text-[11px] text-pink-600">
                          Leave it blank to keep the current photo.
                        </p>
                      </div>
                    </div>
                    {editingPhotoError && <p className="mb-2 text-[11px] text-red-600">{editingPhotoError}</p>}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSavePhoto(hen.id)}
                        className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        Save photo
                      </button>
                      <button
                        onClick={handleCancelPhotoEdit}
                        className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePhotoEditStart(hen)}
                    className="mt-2 text-xs text-pink-700 hover:text-pink-900 font-semibold flex items-center gap-1 hover:bg-pink-50 px-2 py-1 rounded transition"
                  >
                    <Camera className="w-3 h-3" />
                    {hen.photoUrl ? 'Change photo' : 'Add photo'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
