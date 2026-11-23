import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, TaskPriority, TodoSheet } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface TaskChecklistProps {
  sheets: TodoSheet[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
  onSheetDragEnd: (sheetId: string, x: number, y: number) => void;
  onDeleteSheet: (sheetId: string) => void;
  onToggleCollapseSheet: (sheetId: string) => void;
  onOpenNewSheetModal: () => void;
}

const PRIORITY_STYLES: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: { label: 'URGENT!', bg: 'bg-rose-500', text: 'text-white', border: 'border-slate-900' },
  high: { label: 'HIGH', bg: 'bg-amber-400', text: 'text-slate-900', border: 'border-slate-900' },
  medium: { label: 'MED', bg: 'bg-sky-200', text: 'text-slate-800', border: 'border-slate-800' },
  low: { label: 'LOW', bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-400' },
};

const PAPER_COLORS: Record<TodoSheet['paperColor'], string> = {
  yellow: 'bg-[#FEFDF0]',
  cream: 'bg-[#FAF3E0]',
  white: 'bg-[#FFFFFF]',
  pink: 'bg-[#FFE4E6]',
  blue: 'bg-[#E0F2FE]',
  green: 'bg-[#DCFCE7]',
};

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  sheets,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdatePriority,
  onSheetDragEnd,
  onDeleteSheet,
  onToggleCollapseSheet,
  onOpenNewSheetModal,
}) => {
  return (
    <>
      {sheets.map((sheet, index) => {
        // Filter tasks for this sheet
        const sheetTasks = tasks.filter(
          (t) => t.category.toLowerCase() === sheet.category.toLowerCase()
        );

        return (
          <DraggableNotepadSheet
            key={sheet.id}
            sheet={sheet}
            sheetIdx={index}
            totalSheets={sheets.length}
            tasks={sheetTasks}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onUpdatePriority={onUpdatePriority}
            onDragEnd={onSheetDragEnd}
            onDeleteSheet={onDeleteSheet}
            onToggleCollapse={onToggleCollapseSheet}
          />
        );
      })}
    </>
  );
};

interface DraggableNotepadSheetProps {
  sheet: TodoSheet;
  sheetIdx: number;
  totalSheets: number;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
  onDragEnd: (sheetId: string, x: number, y: number) => void;
  onDeleteSheet: (sheetId: string) => void;
  onToggleCollapse: (sheetId: string) => void;
}

const DraggableNotepadSheet: React.FC<DraggableNotepadSheetProps> = ({
  sheet,
  sheetIdx,
  totalSheets,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdatePriority,
  onDragEnd,
  onDeleteSheet,
  onToggleCollapse,
}) => {
  const [currentPos, setCurrentPos] = useState(sheet.position);
  const [isDragging, setIsDragging] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    setCurrentPos(sheet.position);
  }, [sheet.position.x, sheet.position.y, sheet.position.zIndex]);

  const isCollapsed = Boolean(sheet.isCollapsed);
  const remainingCount = tasks.filter((t) => !t.completed).length;
  const paperBg = PAPER_COLORS[sheet.paperColor] || PAPER_COLORS.yellow;

  const pinClass =
    sheet.pinType === 'yellow'
      ? 'pushpin-yellow'
      : sheet.pinType === 'blue'
      ? 'pushpin-blue'
      : 'pushpin-red';

  // Dragging handler
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('svg') ||
      (e.target as HTMLElement).closest('.task-item')
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
      onDragEnd(sheet.id, startPosX + deltaX, startPosY + deltaY);
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
      category: sheet.category,
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

  // Compact Folded View
  if (isCollapsed) {
    return (
      <div
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0) rotate(${sheet.rotation || 0}deg)`,
          zIndex: isDragging ? 80 : currentPos.zIndex || 15,
          position: 'absolute',
        }}
        className={`w-72 ${paperBg} border-2 border-slate-900 rounded-xl p-2.5 px-3 shadow-comic select-none cursor-grab active:cursor-grabbing flex items-center justify-between transition-all hover:shadow-comicLg`}
      >
        {sheet.pinType !== 'tape' && (
          <div className={`absolute -top-3 left-6 pushpin ${pinClass}`} />
        )}
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-sm">📋</span>
          <span className="font-comic text-sm font-bold text-slate-900 truncate">
            {sheet.title}
          </span>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sounds.playPaperRustle();
              onToggleCollapse(sheet.id);
            }}
            title="Unfold sheet"
            className="p-1 rounded hover:bg-black/10 text-slate-700"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Notepad Sheet View
  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0) rotate(${sheet.rotation || 0}deg)`,
        zIndex: isDragging ? 80 : currentPos.zIndex || 15,
        position: 'absolute',
      }}
      className={`w-80 sm:w-[340px] ${paperBg} border-2 border-slate-900 rounded-xl p-4 pt-6 paper-curl-br select-none cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
        isDragging ? 'shadow-paperDrag scale-[1.02]' : 'shadow-comic hover:shadow-comicLg'
      }`}
    >
      {/* Pin or Tape Header Graphic */}
      {sheet.pinType === 'tape' ? (
        <div className="masking-tape h-3.5 w-24 mx-auto -mt-8 mb-4 opacity-90 rounded-xs" />
      ) : (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 pushpin ${pinClass}`} />
      )}

      {/* Sheet Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
        <div className="pr-2 truncate">
          <h3 className="font-comic text-lg text-slate-900 tracking-wider flex items-center gap-1.5 leading-tight truncate">
            <span>📋</span>
            <span className="truncate">{sheet.title}</span>
          </h3>
          <p className="font-handwritten text-xs font-bold text-slate-600">
            {remainingCount === 0 ? '🎉 All caught up!' : `${remainingCount} task${remainingCount === 1 ? '' : 's'} remaining`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Fold / Collapse Button */}
          <button
            onClick={() => {
              sounds.playPaperRustle();
              onToggleCollapse(sheet.id);
            }}
            title="Fold sheet"
            className="p-1 rounded hover:bg-black/10 text-slate-700"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => {
              sounds.playPaperRustle();
              setIsInputOpen(!isInputOpen);
            }}
            title="Scribble a new task on this sheet"
            className="comic-btn bg-desk-comicYellow text-slate-950 p-1.5 rounded-md text-xs font-bold"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {totalSheets > 1 && (
            <button
              onClick={() => {
                if (window.confirm(`Remove the "${sheet.title}" to-do sheet?`)) {
                  sounds.playComicClick();
                  onDeleteSheet(sheet.id);
                }
              }}
              title="Remove this sheet"
              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Add Task Form */}
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
            ✨ Clean sheet! Tap '+' above to scribble a task.
          </div>
        ) : (
          tasks.map((task) => {
            const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

            return (
              <div
                key={task.id}
                className={`task-item group flex items-center justify-between p-2 rounded-lg border transition-all duration-150 ${
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

      {/* Sheet Footer */}
      <div className="mt-3 pt-2 border-t border-slate-900/10 flex items-center justify-between text-[10px] text-slate-400 font-comic">
        <span className="flex items-center gap-1 text-slate-500">
          <GripHorizontal className="w-3 h-3 text-slate-400" />
          <span>Sheet {sheetIdx + 1} of {totalSheets} • Drag to move</span>
        </span>
        {tasks.length >= 4 && (
          <span className="text-desk-comicRed font-bold">4 tasks</span>
        )}
      </div>
    </div>
  );
};
