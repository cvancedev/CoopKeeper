'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Hen } from '@/lib/types';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { getHens, addHen, removeHen, toggleHenFavorite, updateHen } from '@/lib/storage';
import { getTodayDateString, parseLocalDate } from '@/lib/dateUtils';
import { Heart, Trash2, Edit2, CalendarDays, Camera, X } from 'lucide-react';

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
      <Image
        src={photoUrl}
        alt={name}
        width={56}
        height={56}
        unoptimized
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
  const [formName, setFormName] = useState('');
  const [formBreed, setFormBreed] = useState('');
  const [formHatchDate, setFormHatchDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | null>(null);
  const [formPhotoError, setFormPhotoError] = useState('');
  const [formPhotoInputKey, setFormPhotoInputKey] = useState(0);
  const [formIsFavorite, setFormIsFavorite] = useState(false);
  const [editingHenId, setEditingHenId] = useState<string | null>(null);
  const isHydrated = useHydrated();

  const resetForm = () => {
    setFormName('');
    setFormBreed('');
    setFormHatchDate('');
    setFormNotes('');
    setFormPhotoUrl(null);
    setFormPhotoError('');
    setFormPhotoInputKey(key => key + 1);
    setFormIsFavorite(false);
    setEditingHenId(null);
  };

  const handlePhotoFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFormPhotoError('Please choose an image file.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setFormPhotoError('Please choose an image smaller than 500 KB.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormPhotoUrl(dataUrl);
      setFormPhotoError('');
    } catch {
      setFormPhotoError('Unable to read that image. Please try another file.');
    }
  };

  const handleSave = () => {
    const trimmedName = formName.trim();
    const trimmedBreed = formBreed.trim();

    if (!trimmedName || !trimmedBreed) {
      return;
    }

    if (editingHenId) {
      updateHen(
        editingHenId,
        trimmedName,
        trimmedBreed,
        formNotes,
        formHatchDate || undefined,
        formIsFavorite,
        formPhotoUrl
      );
      resetForm();
      return;
    }

    addHen(trimmedName, trimmedBreed, '', formHatchDate || undefined, formPhotoUrl);
    resetForm();
  };

  const handleEditStart = (hen: Hen) => {
    setEditingHenId(hen.id);
    setFormName(hen.name);
    setFormBreed(hen.breed);
    setFormHatchDate(hen.hatchDate ?? '');
    setFormNotes(hen.notes);
    setFormPhotoUrl(hen.photoUrl ?? null);
    setFormPhotoError('');
    setFormPhotoInputKey(key => key + 1);
    setFormIsFavorite(hen.isFavorite);
  };

  const handleRemoveHen = (id: string) => {
    removeHen(id);

    if (editingHenId === id) {
      resetForm();
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleHenFavorite(id);

    if (editingHenId === id) {
      setFormIsFavorite(current => !current);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-pink-900">Favorite Hens</h2>
      </div>

      <div className="bg-linear-to-br from-rose-50 to-pink-50 rounded-lg p-4 border border-pink-100 mb-4">
        <h3 className="font-semibold text-pink-900 mb-3 text-sm uppercase tracking-wide">
          {editingHenId ? 'Edit Hen' : 'Add New Hen'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Hen name"
            className="px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 placeholder-pink-400 transition"
          />
          <input
            type="text"
            value={formBreed}
            onChange={(e) => setFormBreed(e.target.value)}
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
            value={formHatchDate}
            onChange={(e) => setFormHatchDate(e.target.value)}
            max={getTodayDateString()}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm bg-white text-pink-900 transition"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-pink-800 mb-1 uppercase tracking-wide">
            Photo (optional)
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-pink-100 bg-white p-3">
            <HenPhoto photoUrl={formPhotoUrl} name={formName || 'Hen photo preview'} />
            <div className="min-w-0 flex-1">
              <input
                key={formPhotoInputKey}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={async e => {
                  const file = e.target.files?.[0] ?? null;
                  await handlePhotoFile(file);
                }}
                className="block w-full text-xs text-pink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-700 file:px-3 file:py-2 file:text-white hover:file:bg-pink-800"
              />
              <p className="mt-1 text-[11px] text-pink-600">
                Take a photo with your camera or choose one from your gallery. Image only, up to 500 KB.
              </p>
              {formPhotoError && <p className="mt-1 text-[11px] text-red-600">{formPhotoError}</p>}
              {editingHenId && formPhotoUrl && (
                <button
                  onClick={() => setFormPhotoUrl(null)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-pink-700 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        {editingHenId && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-pink-800 mb-1 uppercase tracking-wide">
                Notes
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-xs resize-none bg-white text-pink-900 placeholder-pink-400 transition"
                rows={2}
              />
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsFavorite}
                  onChange={e => setFormIsFavorite(e.target.checked)}
                  className="w-4 h-4 text-pink-700 rounded focus:ring-2 focus:ring-pink-200"
                />
                <span className="text-sm font-medium text-pink-900">Mark as favorite</span>
              </label>
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-pink-700 text-white rounded-lg hover:bg-pink-800 active:scale-95 transition text-sm font-medium"
        >
          {editingHenId ? 'Save Changes' : 'Add Hen'}
        </button>
        {editingHenId && (
          <button
            onClick={resetForm}
            className="w-full mt-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition text-sm font-medium"
          >
            Cancel
          </button>
        )}
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditStart(hen)}
                      className="text-pink-600 hover:text-pink-900 p-1 hover:bg-pink-50 rounded transition shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveHen(hen.id)}
                      className="text-pink-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <CalendarDays className="w-3 h-3 text-pink-500 shrink-0" />
                  <span className="text-xs text-pink-700 font-medium">{calcAge(hen.hatchDate)}</span>
                </div>

                {hen.notes && (
                  <p className="text-xs text-pink-900 mb-2 italic bg-pink-50 p-2 rounded">
                    &ldquo;{hen.notes}&rdquo;
                  </p>
                )}

                <div className="text-xs text-pink-700 font-semibold flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {hen.photoUrl ? 'Photo saved' : 'No photo'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
