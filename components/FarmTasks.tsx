'use client';

import { useState } from 'react';
import { getFarmTasks, addFarmTask, removeFarmTask, toggleFarmTask, getTaskStats } from '@/lib/storage';
import { useHydrated, useSyncedStorageValue } from '@/lib/hooks';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';

export default function FarmTasks() {
  const tasks = useSyncedStorageValue(getFarmTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const isHydrated = useHydrated();

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addFarmTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const handleToggle = (id: string) => {
    toggleFarmTask(id);
  };

  const handleRemove = (id: string) => {
    removeFarmTask(id);
  };

  const { completed, remaining } = useSyncedStorageValue(getTaskStats);

  if (!isHydrated) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-6 h-6 text-amber-700" />
        <h2 className="text-2xl font-bold text-amber-900">Today&apos;s Farm Tasks</h2>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1 whitespace-nowrap">Tasks</p>
          <p className="text-2xl font-bold text-amber-900">{tasks.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1 whitespace-nowrap">Done</p>
          <p className="text-2xl font-bold text-green-900">{completed}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 text-center">
          <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1 whitespace-nowrap">Left</p>
          <p className="text-2xl font-bold text-orange-900">{remaining}</p>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100 mb-4">
        <h3 className="font-semibold text-amber-900 mb-3 text-sm uppercase tracking-wide">
          Add New Task
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Enter a task..."
            className="sm:flex-1 sm:min-w-0 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm bg-white text-amber-900 placeholder-amber-400 transition"
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 active:scale-95 transition font-medium inline-flex items-center gap-2 sm:shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-amber-900 mb-3 text-sm uppercase tracking-wide">
          Tasks
        </h3>
        {tasks.length === 0 ? (
          <p className="text-amber-700 text-sm italic">No tasks yet. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                  task.completed
                    ? 'bg-green-50 border-green-100'
                    : 'bg-white border-amber-100 hover:border-amber-200'
                }`}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className="shrink-0 text-amber-700 hover:text-amber-900 transition"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm font-medium transition ${
                    task.completed
                      ? 'line-through text-green-600'
                      : 'text-amber-900'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleRemove(task.id)}
                  className="text-amber-600 hover:text-red-600 p-1 hover:bg-red-50 rounded transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
