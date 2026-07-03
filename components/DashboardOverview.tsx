'use client';

import React from 'react';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { getDashboardStats, getFarmTasks, getTaskStats } from '@/lib/storage';
import { formatDate } from '@/lib/dateUtils';
import { Egg, Heart, Droplets, Leaf, Scale, CheckCircle2, Circle, Wallet } from 'lucide-react';

const formatUSD = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const StatCard = ({
  iconElement,
  label,
  value,
  subtext,
  color,
}: {
  iconElement: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) => (
  <div className={`rounded-lg p-4 border transition ${color}`}>
    <div className="flex items-start justify-between mb-2">
      <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{label}</p>
      <div className="w-5 h-5 opacity-75">{iconElement}</div>
    </div>
    <p className="text-3xl font-bold mb-1">{value}</p>
    {subtext && <p className="text-xs opacity-75">{subtext}</p>}
  </div>
);

export default function DashboardOverview() {
  const stats = useSyncedStorageValue(getDashboardStats);
  const tasks = useSyncedStorageValue(getFarmTasks);
  const taskStats = useSyncedStorageValue(getTaskStats);

  const isHydrated = useHydrated();

  if (!isHydrated) return null;

  // Get incomplete tasks for display (first 3)
  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-amber-900 mb-4 drop-shadow-sm">
        🌾 Farm Dashboard
      </h2>

      {/* Today's Tasks Summary */}
      <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-amber-700" />
          <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wide">
            Today&apos;s Tasks
          </h3>
        </div>
        
        {/* Task Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded p-2 border border-amber-100 text-center">
            <p className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide whitespace-nowrap">Tasks</p>
            <p className="text-lg font-bold text-amber-900">{tasks.length}</p>
          </div>
          <div className="bg-green-50 rounded p-2 border border-green-100 text-center">
            <p className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide whitespace-nowrap">Done</p>
            <p className="text-lg font-bold text-green-900">{taskStats.completed}</p>
          </div>
          <div className="bg-orange-50 rounded p-2 border border-orange-100 text-center">
            <p className="text-xs text-orange-700 font-semibold mb-1 uppercase tracking-wide whitespace-nowrap">Left</p>
            <p className="text-lg font-bold text-orange-900">{taskStats.remaining}</p>
          </div>
        </div>

        {/* Incomplete Tasks List */}
        {taskStats.remaining === 0 ? (
          <p className="text-sm text-green-700 font-medium">✓ All tasks completed for today!</p>
        ) : (
          <div className="space-y-1">
            {incompleteTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 text-sm text-amber-900 bg-white rounded px-2 py-1 border border-amber-100">
                <Circle className="w-3 h-3 text-amber-700 shrink-0" />
                <span className="truncate">{task.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Hens */}
        <StatCard
          iconElement={<span className="text-2xl">🐓</span>}
          label="Total Hens"
          value={stats.totalHens}
          color="bg-rose-50 border-rose-100 text-rose-900"
        />

        {/* Eggs Today */}
        <StatCard
          iconElement={<Egg className="w-5 h-5" />}
          label="Eggs Today"
          value={stats.eggsToday}
          color="bg-amber-50 border-amber-100 text-amber-900"
        />

        {/* Eggs This Week */}
        <StatCard
          iconElement={<Egg className="w-5 h-5" />}
          label="Eggs This Week"
          value={stats.eggsThisWeek}
          color="bg-yellow-50 border-yellow-100 text-yellow-900"
        />

        {/* Active Health Cases */}
        <StatCard
          iconElement={<Heart className="w-5 h-5" />}
          label="Active Health Cases"
          value={stats.activeHealthCases}
          color="bg-red-50 border-red-100 text-red-900"
        />

        {/* Last Cleaning Date */}
        <StatCard
          iconElement={<Droplets className="w-5 h-5" />}
          label="Last Cleaning"
          value={stats.lastCleaningDate ? formatDate(stats.lastCleaningDate) : 'Never'}
          color="bg-emerald-50 border-emerald-100 text-emerald-900"
        />

        {/* Feed Logs This Week */}
        <StatCard
          iconElement={<Leaf className="w-5 h-5" />}
          label="Feed Logs This Week"
          value={stats.feedLogsThisWeek}
          color="bg-green-50 border-green-100 text-green-900"
        />

        {/* Most Recent Weight Entry */}
        <StatCard
          iconElement={<Scale className="w-5 h-5" />}
          label="Latest Weight"
          value={stats.mostRecentWeight ? `${stats.mostRecentWeight.weight} lbs` : 'No data'}
          subtext={stats.mostRecentWeight ? `${stats.mostRecentWeight.henName} on ${formatDate(stats.mostRecentWeight.date)}` : undefined}
          color="bg-blue-50 border-blue-100 text-blue-900"
        />

        {/* Expenses This Month */}
        <StatCard
          iconElement={<Wallet className="w-5 h-5" />}
          label="Expenses This Month"
          value={formatUSD(stats.expensesThisMonth)}
          color="bg-lime-50 border-lime-100 text-lime-900"
        />
      </div>
    </div>
  );
}
