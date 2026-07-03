'use client';

import { useState } from 'react';
import { ExpenseEntry, ExpenseCategory } from '@/lib/types';
import { addExpense, getExpenses, removeExpense } from '@/lib/storage';
import { useHydrated } from '@/lib/hooks';
import { getTodayDateString, formatDate, parseLocalDate } from '@/lib/dateUtils';
import { ReceiptText, Trash2, Calendar, DollarSign } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Feed',
  'Bedding',
  'Medication',
  'Vet',
  'Supplies',
  'Equipment',
  'Other',
];

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  Feed: 'bg-amber-100 text-amber-900',
  Bedding: 'bg-lime-100 text-lime-900',
  Medication: 'bg-emerald-100 text-emerald-900',
  Vet: 'bg-green-100 text-green-900',
  Supplies: 'bg-yellow-100 text-yellow-900',
  Equipment: 'bg-stone-100 text-stone-900',
  Other: 'bg-slate-100 text-slate-900',
};

function isThisMonth(dateString: string): boolean {
  const date = parseLocalDate(dateString);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function ExpenseTracker() {
  const [entries, setEntries] = useState<ExpenseEntry[]>(() =>
    typeof window === 'undefined' ? [] : getExpenses()
  );
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<ExpenseCategory>('Feed');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const isHydrated = useHydrated();

  const monthlyTotals = entries.reduce(
    (totals, entry) => {
      if (!isThisMonth(entry.date)) return totals;

      totals.total += entry.amount;
      totals.byCategory[entry.category] += entry.amount;
      return totals;
    },
    {
      total: 0,
      byCategory: {
        Feed: 0,
        Bedding: 0,
        Medication: 0,
        Vet: 0,
        Supplies: 0,
        Equipment: 0,
        Other: 0,
      } as Record<ExpenseCategory, number>,
    }
  );

  const handleAddExpense = () => {
    const parsedAmount = Number.parseFloat(amount);

    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    addExpense(
      date,
      category,
      description.trim(),
      parsedAmount,
      notes.trim()
    );
    setEntries(getExpenses());
    setDate(getTodayDateString());
    setCategory('Feed');
    setDescription('');
    setAmount('');
    setNotes('');
  };

  const handleRemove = (id: string) => {
    removeExpense(id);
    setEntries(getExpenses());
  };

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <ReceiptText className="w-6 h-6 text-emerald-700" />
        <h2 className="text-2xl font-bold text-emerald-900">Expenses</h2>
      </div>

      <div className="bg-linear-to-br from-lime-50 to-amber-50 rounded-lg p-4 border border-lime-100 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={getTodayDateString()}
              className="w-full px-3 py-2 border border-lime-200 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 text-sm bg-white text-emerald-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 border border-lime-200 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 text-sm bg-white text-emerald-900 transition"
            >
              {CATEGORIES.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., 50 lb layer feed"
              className="w-full px-3 py-2 border border-lime-200 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 text-sm bg-white text-emerald-900 placeholder-emerald-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-lime-200 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 text-sm bg-white text-emerald-900 placeholder-emerald-400 transition"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-emerald-800 mb-1 uppercase tracking-wide">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Vendor, receipt details, or other notes..."
            className="w-full px-3 py-2 border border-lime-200 rounded-lg focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 text-xs resize-none bg-white text-emerald-900 placeholder-emerald-400 transition"
            rows={2}
          />
        </div>

        <button
          onClick={handleAddExpense}
          className="w-full px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 active:scale-95 transition text-sm font-medium"
        >
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg border border-lime-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-emerald-700" />
          <h3 className="font-semibold text-emerald-900 text-sm uppercase tracking-wide">
            This Month
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="col-span-2 md:col-span-3 rounded-lg border border-emerald-100 bg-linear-to-br from-emerald-50 to-lime-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
              Total This Month
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              {moneyFormatter.format(monthlyTotals.total)}
            </p>
          </div>

          {(
            [
              ['Feed', monthlyTotals.byCategory.Feed],
              ['Bedding', monthlyTotals.byCategory.Bedding],
              ['Medication', monthlyTotals.byCategory.Medication],
              ['Vet', monthlyTotals.byCategory.Vet],
              ['Other', monthlyTotals.byCategory.Other],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-lime-100 bg-lime-50/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                {label}
              </p>
              <p className="text-lg font-bold text-emerald-900">
                {moneyFormatter.format(value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-emerald-900 mb-3 text-sm uppercase tracking-wide">
          Recent Expenses
        </h3>

        {entries.length === 0 ? (
          <p className="text-emerald-700 text-sm italic">No expenses recorded yet</p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-3 border border-lime-100 hover:border-lime-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${CATEGORY_STYLES[entry.category]}`}>
                        {entry.category}
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-emerald-900 truncate">
                        {entry.description}
                      </p>
                      <p className="font-bold text-emerald-800 shrink-0">
                        {moneyFormatter.format(entry.amount)}
                      </p>
                    </div>

                    {entry.notes && (
                      <p className="text-emerald-900 text-sm wrap-break-words">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-emerald-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
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
  );
}