import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface TaskChecklistProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
}

const CATEGORIES: TaskCategory[] = ['Today', 'Personal', 'Development', 'Ideas', 'Later'];

const PRIORITY_STYLES: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: { label: 'URGENT!', bg: 'bg-rose-500', text: 'text-white', border: 'border-slate-900' },
  high: { label: 'HIGH', bg: 'bg-amber-400', text: 'text-slate-900', border: 'border-slate-900' },
  medium: { label: 'MED', bg: 'bg-sky-200', text: 'text-slate-800', border: 'border-slate-800' },
  low: { label: 'LOW', bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-400' },
};

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdatePriority,
}) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'All'>('Today');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [isInputOpen, setIsInputOpen] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeCategory === 'All') return true;
    return t.category === activeCategory;
  });

  const remainingCount = tasks.filter((t) => !t.completed).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sounds.playComicClick();
    onAddTask({
      title: newTitle.trim(),
      description: '',
      completed: false,
      priority: newPriority,
      category: activeCategory === 'All' ? 'Today' : activeCategory,
      position: tasks.length,
      dueDate: 'Today',
    });

    setNewTitle('');
    setIsInputOpen(false);
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      sounds.playCheckmark();
      // Check if this was the last remaining task
      if (remainingCount === 1) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      sounds.playComicClick();
    }
    onToggleTask(id);
  };

  return (
    <div className="relative w-full max-w-md bg-[#FEFDF0] border-2 border-slate-900 rounded-xl shadow-comic p-4 pt-6 paper-curl-br z-20">
      {/* Red Pushpin on Top Center of Notepad */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 pushpin pushpin-red" />

      {/* Notepad Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
        <div>
          <h2 className="font-comic text-xl text-slate-900 tracking-wider flex items-center gap-1.5">
            <span>📋</span>
            <span>TODAY'S LITTLE GOALS</span>
          </h2>
          <p className="font-handwritten text-xs font-bold text-slate-600">
            {remainingCount === 0 ? '🎉 All caught up!' : `${remainingCount} task${remainingCount === 1 ? '' : 's'} remaining`}
          </p>
        </div>

        {/* Quick Add Toggle Button */}
        <button
          onClick={() => {
            sounds.playPaperRustle();
            setIsInputOpen(!isInputOpen);
          }}
          className="comic-btn bg-desk-comicYellow text-slate-950 p-1.5 rounded-md text-xs font-bold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
        <button
          onClick={() => {
            sounds.playComicClick();
            setActiveCategory('All');
          }}
          className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
            activeCategory === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sounds.playComicClick();
              setActiveCategory(cat);
            }}
            className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task Input Form (Expandable) */}
      {isInputOpen && (
        <form onSubmit={handleCreateTask} className="mb-3 bg-amber-50 border border-slate-900 rounded-lg p-2 shadow-xs">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Scribble a new task..."
            autoFocus
            className="w-full bg-white border border-slate-900/30 rounded px-2.5 py-1 text-sm font-medium focus:outline-none focus:border-slate-900 mb-2"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <span className="font-comic font-bold text-slate-600">Priority:</span>
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    newPriority === p ? `${PRIORITY_STYLES[p].bg} ${PRIORITY_STYLES[p].text} border-slate-900` : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {p[0]}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="comic-btn bg-desk-comicGreen text-white text-xs font-comic font-bold px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-handwritten text-base font-semibold">
            ✨ No tasks in this list. Take a breather or scribble one!
          </div>
        ) : (
          filteredTasks.map((task) => {
            const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-150 ${
                  task.completed
                    ? 'bg-slate-100/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-900/30 hover:border-slate-900 shadow-xs'
                }`}
              >
                {/* Checkbox & Title */}
                <div
                  className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                  onClick={() => handleToggle(task.id, task.completed)}
                >
                  {/* Custom Comic Checkbox with Animated Checkmark */}
                  <div
                    className={`w-5 h-5 rounded border-2 border-slate-900 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-desk-comicGreen text-white' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {task.completed && (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none"
                        style={{
                          strokeDasharray: 20,
                          strokeDashoffset: 0,
                          animation: 'dash 0.2s ease-in-out',
                        }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <span
                    className={`font-handwritten text-base leading-tight font-bold transition-all ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Priority Badge & Delete Button */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span
                    onClick={() => {
                      // Cycle priority on click
                      const order: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
                      const next = order[(order.indexOf(task.priority) + 1) % order.length];
                      onUpdatePriority(task.id, next);
                    }}
                    title="Click to change priority"
                    className={`text-[9px] font-comic font-black tracking-wider px-1.5 py-0.5 rounded cursor-pointer border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                  >
                    {pStyle.label}
                  </span>

                  <button
                    onClick={() => {
                      sounds.playComicClick();
                      onDeleteTask(task.id);
                    }}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
