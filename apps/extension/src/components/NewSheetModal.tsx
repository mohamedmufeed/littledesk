import React, { useState } from 'react';
import { Check, ClipboardList, Plus, X } from 'lucide-react';
import { TodoSheet } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface NewSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSheet: (sheet: Omit<TodoSheet, 'id' | 'createdAt'>, initialTask?: string) => void;
}

const PAPER_COLORS: { id: TodoSheet['paperColor']; label: string; hex: string }[] = [
  { id: 'yellow', label: 'Sticky Yellow', hex: '#FEF9C3' },
  { id: 'cream', label: 'Vintage Cream', hex: '#FAF3E0' },
  { id: 'white', label: 'Cardstock White', hex: '#FFFFFF' },
  { id: 'pink', label: 'Pastel Pink', hex: '#FFE4E6' },
  { id: 'blue', label: 'Blueprint Blue', hex: '#E0F2FE' },
  { id: 'green', label: 'Mint Green', hex: '#DCFCE7' },
];

export const NewSheetModal: React.FC<NewSheetModalProps> = ({
  isOpen,
  onClose,
  onCreateSheet,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [paperColor, setPaperColor] = useState<TodoSheet['paperColor']>('yellow');
  const [pinType, setPinType] = useState<TodoSheet['pinType']>('red');
  const [initialTask, setInitialTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playPaperRustle();
    onCreateSheet(
      {
        title: title.trim().toUpperCase(),
        category: title.trim(),
        paperColor,
        pinType,
        position: {
          x: Math.max(40, Math.min(window.innerWidth - 380, 80 + Math.random() * Math.max(200, window.innerWidth - 500))),
          y: Math.max(20, Math.min(window.innerHeight - 350, 40 + Math.random() * 120)),
          zIndex: 25,
        },
        rotation: (Math.random() * 4 - 2),
      },
      initialTask.trim() || undefined
    );

    setTitle('');
    setInitialTask('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A2234] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-comicLg dark:shadow-[5px_5px_0px_#090D15] p-6">
        {/* Masking tape on top */}
        <div className="masking-tape h-4 w-28 mx-auto -mt-8 mb-4 opacity-90 rounded-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-desk-comicRed" />
            <h2 className="font-comic text-xl text-slate-900 dark:text-slate-100 font-bold">
              PIN NEW TO-DO SHEET
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playComicClick();
              onClose();
            }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sheet Title */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sheet Title / Goal List Name:
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WORK SPRINTS, GROCERIES, IDEAS..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-comic font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Optional First Task */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              First Task (Optional):
            </label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="e.g. Finish morning review..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Paper Color */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Paper Texture & Color:
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {PAPER_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPaperColor(c.id)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 border-slate-900 dark:border-slate-700 transition-transform ${paperColor === c.id ? 'scale-125 ring-2 ring-slate-900 dark:ring-amber-400' : 'hover:scale-110'
                    }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Pin Style */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Attachment Pin:
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'red', label: '🔴 Red Pin' },
                { id: 'yellow', label: '🟡 Yellow Pin' },
                { id: 'blue', label: '🔵 Blue Pin' },
                { id: 'tape', label: '🩹 Tape' },
              ].map((pin) => (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => setPinType(pin.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${pinType === pin.id
                    ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-slate-900 dark:border-amber-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {pin.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-900 dark:border-slate-700 mt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playComicClick();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="comic-btn bg-desk-comicYellow text-slate-950 font-comic font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Pin to Desk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
