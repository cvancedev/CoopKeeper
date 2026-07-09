'use client';

import { useState } from 'react';
import {
  getHens,
  getHealthEntries,
  addHealthEntry,
  removeHealthEntry,
  updateHealthEntry,
} from '@/lib/storage';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { getTodayDateString, formatDate } from '@/lib/dateUtils';
import { Heart, Trash2, Calendar, AlertCircle, CheckCircle, Clock, Edit2, X } from 'lucide-react';

const CATEGORIES = ['Illness', 'Injury', 'Medication', 'Vaccine', 'Checkup', 'Other'];
const STATUSES = ['Watching', 'Treated', 'Recovered'];

function getStatusIcon(status: string) {
  switch (status) {
    case 'Recovered':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Treated':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'Watching':
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    default:
      return null;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Illness':
      return 'bg-red-100 text-red-800';
    case 'Injury':
      return 'bg-orange-100 text-orange-800';
    case 'Medication':
      return 'bg-blue-100 text-blue-800';
    case 'Vaccine':
      return 'bg-green-100 text-green-800';
    case 'Checkup':
      return 'bg-teal-100 text-teal-800';
    case 'Other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function HealthLog() {
  const hens = useSyncedStorageValue(getHens);
  const entries = useSyncedStorageValue(getHealthEntries);

  const [selectedHenId, setSelectedHenId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [symptoms, setSymptoms] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [vetContacted, setVetContacted] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [status, setStatus] = useState(STATUSES[0]);
  const [notes, setNotes] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryHenName, setEditingEntryHenName] = useState('');

  const isHydrated = useHydrated();

  const resetForm = () => {
    setSelectedHenId('');
    setDate(getTodayDateString());
    setCategory(CATEGORIES[0]);
    setSymptoms('');
    setTreatment('');
    setMedicationName('');
    setDosage('');
    setVetContacted(false);
    setFollowUpDate('');
    setStatus(STATUSES[0]);
    setNotes('');
    setEditingEntryId(null);
    setEditingEntryHenName('');
  };

  const handleAddEntry = () => {
    if (selectedHenId && symptoms.trim() && treatment.trim()) {
      const hen = hens.find(h => h.id === selectedHenId);
      const selectedHenName = hen?.name ?? editingEntryHenName;
      if (selectedHenName) {
        if (editingEntryId) {
          updateHealthEntry(
            editingEntryId,
            selectedHenId,
            selectedHenName,
            date,
            category as 'Illness' | 'Injury' | 'Medication' | 'Vaccine' | 'Checkup' | 'Other',
            symptoms,
            treatment,
            status as 'Watching' | 'Treated' | 'Recovered',
            vetContacted,
            medicationName || undefined,
            dosage || undefined,
            followUpDate || undefined,
            notes
          );
          resetForm();
          return;
        }

        addHealthEntry(
          selectedHenId,
          selectedHenName,
          date,
          category as 'Illness' | 'Injury' | 'Medication' | 'Vaccine' | 'Checkup' | 'Other',
          symptoms,
          treatment,
          status as 'Watching' | 'Treated' | 'Recovered',
          vetContacted,
          medicationName || undefined,
          dosage || undefined,
          followUpDate || undefined,
          notes
        );
        resetForm();
      }
    }
  };

  const handleRemove = (id: string) => {
    removeHealthEntry(id);

    if (editingEntryId === id) {
      resetForm();
    }
  };

  const handleEditStart = (id: string) => {
    const entry = entries.find(item => item.id === id);
    if (!entry) {
      return;
    }

    setEditingEntryId(entry.id);
    setEditingEntryHenName(entry.henName);
    setSelectedHenId(entry.henId);
    setDate(entry.date);
    setCategory(entry.category);
    setSymptoms(entry.symptoms);
    setTreatment(entry.treatment);
    setMedicationName(entry.medicationName ?? '');
    setDosage(entry.dosage ?? '');
    setVetContacted(entry.vetContacted);
    setFollowUpDate(entry.followUpDate ?? '');
    setStatus(entry.status);
    setNotes(entry.notes);
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-teal-700" />
        <h2 className="text-2xl font-bold text-teal-900">Health Log</h2>
      </div>

      <div className="bg-linear-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-100 mb-4">
        <h3 className="font-semibold text-teal-900 mb-3 text-sm uppercase tracking-wide">
          {editingEntryId ? 'Edit Health Record' : 'Add Health Record'}
        </h3>

        {hens.length === 0 ? (
          <p className="text-teal-700 text-sm italic">Add hens first to track health</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Hen
                </label>
                <select
                  value={selectedHenId}
                  onChange={e => setSelectedHenId(e.target.value)}
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 transition"
                >
                  <option value="">Select a hen...</option>
                  {editingEntryId && selectedHenId && !hens.some(hen => hen.id === selectedHenId) && (
                    <option value={selectedHenId}>{editingEntryHenName}</option>
                  )}
                  {hens.map(hen => (
                    <option key={hen.id} value={hen.id}>
                      {hen.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={getTodayDateString()}
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 transition"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 transition"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Symptoms/Issue
                </label>
                <textarea
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms or issue..."
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-xs resize-none bg-white text-teal-900 placeholder-teal-400 transition"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Treatment Given
                </label>
                <textarea
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}
                  placeholder="Describe treatment..."
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-xs resize-none bg-white text-teal-900 placeholder-teal-400 transition"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Medication Name (optional)
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={e => setMedicationName(e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 placeholder-teal-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Dosage (optional)
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g., 250mg twice daily"
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 placeholder-teal-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                  Follow-up Date (optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white text-teal-900 transition"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vetContacted}
                  onChange={e => setVetContacted(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded focus:ring-2 focus:ring-teal-200"
                />
                <span className="text-sm font-medium text-teal-900">Vet was contacted</span>
              </label>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-teal-800 mb-1 uppercase tracking-wide">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-xs resize-none bg-white text-teal-900 placeholder-teal-400 transition"
                rows={2}
              />
            </div>

            <button
              onClick={handleAddEntry}
              className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 active:scale-95 transition text-sm font-medium"
            >
              {editingEntryId ? 'Save Changes' : 'Log Health Record'}
            </button>
            {editingEntryId && (
              <button
                onClick={resetForm}
                className="w-full mt-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition text-sm font-medium flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-teal-900 mb-3 text-sm uppercase tracking-wide">
          Recent Records
        </h3>
        {entries.length === 0 ? (
          <p className="text-teal-700 text-sm italic">No health records yet</p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-3 border border-teal-100 hover:border-teal-200 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-teal-900 truncate">{entry.henName}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(entry.status)}
                        <span className="text-xs font-medium text-gray-700">{entry.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-teal-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditStart(entry.id)}
                      className="text-teal-600 hover:text-teal-800 p-1 hover:bg-teal-50 rounded transition shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="text-teal-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {entry.symptoms && (
                  <p className="text-xs text-teal-900 mb-1">
                    <span className="font-semibold">Symptoms:</span> {entry.symptoms}
                  </p>
                )}

                {entry.treatment && (
                  <p className="text-xs text-teal-900 mb-1">
                    <span className="font-semibold">Treatment:</span> {entry.treatment}
                  </p>
                )}

                {entry.medicationName && (
                  <p className="text-xs text-teal-900 mb-1">
                    <span className="font-semibold">Medication:</span> {entry.medicationName}
                    {entry.dosage ? ` - ${entry.dosage}` : ''}
                  </p>
                )}

                {entry.followUpDate && (
                  <p className="text-xs text-teal-900 mb-1">
                    <span className="font-semibold">Follow-up:</span>{' '}
                    {formatDate(entry.followUpDate)}
                  </p>
                )}

                {entry.vetContacted && (
                  <p className="text-xs text-teal-900 mb-1">
                    <span className="font-semibold">✓ Vet was contacted</span>
                  </p>
                )}

                {entry.notes && (
                  <p className="text-xs text-teal-900 mb-1 italic bg-teal-50 p-2 rounded">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
