import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Check,
  ChevronRight,
  Filter,
  GripHorizontal,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface TaskChecklistProps {
  tasks: Task[];
  sheetPositions: Record<string, { x: number; y: number; zIndex: number }>;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
  onSheetDragEnd: (sheetKey: string, x: number, y: number) => void;
}

const CATEGORIES: TaskCategory[] = ['Today', 'Personal', 'Development', 'Ideas', 'Later'];
const TASKS_PER_CARD = 4; // Maximum tasks per physical sheet before expanding to the right!

const PRIORITY_STYLES: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: { label: 'URGENT!', bg: 'bg-rose-500', text: 'text-white', border: 'border-slate-900' },
  high: { label: 'HIGH', bg: 'bg-amber-400', text: 'text-slate-900', border: 'border-slate-900' },
  medium: { label: 'MED', bg: 'bg-sky-200', text: 'text-slate-800', border: 'border-slate-800' },
  low: { label: 'LOW', bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-400' },
};

const SHEET_PINS = ['pushpin-red', 'pushpin-yellow', 'pushpin-blue'];
const SHEET_ROTATIONS = [-1, 1.4, -1.8, 1.2];

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  tasks,
  sheetPositions,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdatePriority,
  onSheetDragEnd,
}) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory | 'All'>('Today');

  // Filter tasks based on active category
  const filteredTasks = tasks.filter((t) => {
    if (activeCategory === 'All') return true;
    return t.category === activeCategory;
  });

  const remainingCount = tasks.filter((t) => !t.completed).length;

  // Split tasks into sheets of 4 items max (No scrollbars! Overflow forms a new sheet)
  const taskSheets: Task[][] = [];
  if (filteredTasks.length === 0) {
    taskSheets.push([]);
  } else {
    for (let i = 0; i < filteredTasks.length; i += TASKS_PER_CARD) {
      taskSheets.push(filteredTasks.slice(i, i + TASKS_PER_CARD));
    }
  }

  return (
    <>
      {/* Category Filter Toolbar docked above the canvas */}
      <div className="w-full flex items-center justify-between max-w-5xl mx-auto px-4 mb-2 z-20">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="font-comic text-xs uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>List:</span>
          </span>
          <button
            onClick={() => {
              sounds.playComicClick();
              setActiveCategory('All');
            }}
            className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
              activeCategory === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-comicPressed'
                : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
            }`}
          >
            All Goals
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playComicClick();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-comicPressed'
                  : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-comic font-bold text-slate-500">
          <Layers className="w-3.5 h-3.5 text-desk-comicRed" />
          <span>
            {taskSheets.length} Draggable Sheet{taskSheets.length > 1 ? 's' : ''} • Grab & move anywhere!
          </span>
        </div>
      </div>

      {/* Render Each To-Do Sheet as a Freely Draggable Paper Card */}
      {taskSheets.map((sheetTasks, sheetIdx) => {
        const sheetKey = `sheet-${activeCategory}-${sheetIdx}`;
        const defaultX = 320 + sheetIdx * 360;
        const defaultY = 15;
        const savedPos = sheetPositions[sheetKey] || { x: defaultX, y: defaultY, zIndex: 15 + sheetIdx };

        return (
          <DraggableTaskCard
            key={sheetKey}
            sheetKey={sheetKey}
            sheetIdx={sheetIdx}
            totalSheets={taskSheets.length}
            tasks={sheetTasks}
            initialPos={savedPos}
            activeCategory={activeCategory}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onUpdatePriority={onUpdatePriority}
            onDragEnd={onSheetDragEnd}
            remainingCount={remainingCount}
          />
        );
      })}
    </>
  );
};

interface DraggableTaskCardProps {
  sheetKey: string;
  sheetIdx: number;
  totalSheets: number;
  tasks: Task[];
  initialPos: { x: number; y: number; zIndex: number };
  activeCategory: TaskCategory | 'All';
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
  onDragEnd: (sheetKey: string, x: number, y: number) => void;
  remainingCount: number;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  sheetKey,
  sheetIdx,
  totalSheets,
  tasks,
  initialPos,
  activeCategory,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdatePriority,
  onDragEnd,
  remainingCount,
}) => {
  const [currentPos, setCurrentPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    setCurrentPos(initialPos);
  }, [initialPos.x, initialPos.y, initialPos.zIndex]);

  const pinColor = SHEET_PINS[sheetIdx % SHEET_PINS.length];
  const rotation = SHEET_ROTATIONS[sheetIdx % SHEET_ROTATIONS.length];
  const isFirstSheet = sheetIdx === 0;

  // Freeform Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('svg') ||
      (e.target as HTMLElement).closest('.task-interactive')
    ) {
      return;
    }

    sounds.playPaperRustle();
    setIsDragging(true);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPosX = currentPos.x;
    const startPosY = currentPos.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;
      setCurrentPos({
        ...currentPos,
        x: startPosX + deltaX,
        y: startPosY + deltaY,
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      const deltaX = upEvent.clientX - startClientX;
      const deltaY = upEvent.clientY - startClientY;
      onDragEnd(sheetKey, startPosX + deltaX, startPosY + deltaY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0) rotate(${rotation}deg)`,
        zIndex: isDragging ? 80 : currentPos.zIndex || 15,
        position: 'absolute',
      }}
      className={`w-80 sm:w-[340px] bg-[#FEFDF0] border-2 border-slate-900 rounded-xl p-4 pt-6 paper-curl-br select-none cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
        isDragging ? 'shadow-paperDrag scale-[1.02]' : 'shadow-comic hover:shadow-comicLg'
      }`}
    >
      {/* Pushpin on Top Center of the Sheet Card */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 pushpin ${pinColor}`} />

      {/* Sheet Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
        <div>
          <h3 className="font-comic text-lg text-slate-900 tracking-wider flex items-center gap-1.5 leading-tight">
            <span>{isFirstSheet ? '📋' : '📑'}</span>
            <span>
              {isFirstSheet
                ? activeCategory === 'All'
                  ? "TODAY'S LITTLE GOALS"
                  : `${activeCategory.toUpperCase()} GOALS`
                : `${activeCategory.toUpperCase()} • SHEET ${sheetIdx + 1}`}
            </span>
          </h3>
          <p className="font-handwritten text-xs font-bold text-slate-600">
            {isFirstSheet
              ? remainingCount === 0
                ? '🎉 All caught up!'
                : `${remainingCount} task${remainingCount === 1 ? '' : 's'} remaining`
              : `Overflow Sheet (${tasks.length}/${TASKS_PER_CARD} tasks)`}
          </p>
        </div>

        {/* Quick Add Toggle Button on this Sheet */}
        <button
          onClick={() => {
            sounds.playPaperRustle();
            setIsInputOpen(!isInputOpen);
          }}
          title="Scribble a task on this sheet"
          className="comic-btn bg-desk-comicYellow text-slate-950 p-1.5 rounded-md text-xs font-bold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Expandable Add Task Form on this Sheet */}
      {isInputOpen && (
        <form
          onSubmit={handleCreateTask}
          className="mb-3 bg-amber-50 border border-slate-900 rounded-lg p-2.5 shadow-xs"
        >
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
                    newPriority === p
                      ? `${PRIORITY_STYLES[p].bg} ${PRIORITY_STYLES[p].text} border-slate-900`
                      : 'bg-white text-slate-600 border-slate-300'
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

      {/* Tasks List — Exactly max 4 per card, NO scrollbars! */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-7 text-slate-400 font-handwritten text-base font-semibold">
            ✨ No tasks here. Tap '+' above to scribble one!
          </div>
        ) : (
          tasks.map((task) => {
            const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

            return (
              <div
                key={task.id}
                className={`task-interactive group flex items-center justify-between p-2 rounded-lg border transition-all duration-150 ${
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
                  <div
                    className={`w-5 h-5 rounded border-2 border-slate-900 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-desk-comicGreen text-white'
                        : 'bg-white hover:bg-slate-50'
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

                {/* Priority Badge & Delete */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span
                    onClick={() => {
                      const order: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
                      const next = order[(order.indexOf(task.priority) + 1) % order.length];
                      onUpdatePriority(task.id, next);
                    }}
                    title="Click to toggle priority"
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

      {/* Sheet Footer with subtle Drag Handle Hint */}
      <div className="mt-3 pt-2 border-t border-slate-900/10 flex items-center justify-between text-[10px] text-slate-400 font-comic">
        <span className="flex items-center gap-1 text-slate-500">
          <GripHorizontal className="w-3 h-3 text-slate-400" />
          <span>Sheet {sheetIdx + 1} of {totalSheets} • Drag to move</span>
        </span>
        {tasks.length >= TASKS_PER_CARD && (
          <span className="text-desk-comicRed font-bold">Full sheet →</span>
        )}
      </div>
    </div>
  );
};
