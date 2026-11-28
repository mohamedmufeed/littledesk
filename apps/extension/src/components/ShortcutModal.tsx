import React, { useState } from 'react';
import { Globe, Plus, Trash2, X } from 'lucide-react';
import { Bookmark } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface ShortcutModalProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bm: Partial<Bookmark>) => void;
  onDelete?: (id: string) => void;
}

const PRESET_COLORS = [
  '#4285F4', // Google Blue
  '#FF0000', // YouTube Red
  '#24292e', // GitHub Dark
  '#10A37F', // ChatGPT Green
  '#EA4335', // Gmail Red
  '#FBBC05', // Drive Yellow
  '#F48024', // StackOverflow Orange
  '#000000', // Vercel Black
  '#0A66C2', // LinkedIn Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Emerald
];

export const ShortcutModal: React.FC<ShortcutModalProps> = ({
  bookmark,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(bookmark?.title || '');
  const [url, setUrl] = useState(bookmark?.url || 'https://');
  const [category, setCategory] = useState(bookmark?.category || 'General');
  const [iconBgColor, setIconBgColor] = useState(bookmark?.iconBgColor || PRESET_COLORS[0]);
  const [stickerStyle, setStickerStyle] = useState<Bookmark['stickerStyle']>(bookmark?.stickerStyle || 'polaroid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    sounds.playComicClick();
    onSave({
      id: bookmark?.id,
      title: title.trim(),
      url: finalUrl,
      category: category.trim(),
      iconBgColor,
      stickerStyle,
      rotation: bookmark?.rotation ?? (Math.random() * 4 - 2),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A2234] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-comicLg dark:shadow-[5px_5px_0px_#090D15] p-6">
        {/* Masking tape on top */}
        <div className="masking-tape h-4 w-24 mx-auto -mt-8 mb-4 opacity-90 rounded-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-slate-700 mb-4">
          <h2 className="font-comic text-xl text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5">
            <span>🔖</span>
            <span>{bookmark ? 'EDIT SHORTCUT' : 'NEW DESK SHORTCUT'}</span>
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shortcut Title:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GitHub, Notion, Reddit"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Web Address (URL):
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800 font-mono"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category:
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Productivity, Development, Media..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Icon Background Color */}
          <div>
            <label className="block font-comic text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Badge Color:
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setIconBgColor(hex)}
                  className={`w-6 h-6 rounded-full border-2 border-slate-900 dark:border-slate-700 transition-transform ${iconBgColor === hex ? 'scale-125 ring-2 ring-slate-900 dark:ring-amber-400' : 'hover:scale-110'
                    }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900 dark:border-slate-700 mt-4">
            {bookmark && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  sounds.playComicClick();
                  onDelete(bookmark.id);
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                className="comic-btn bg-desk-comicYellow text-slate-950 font-comic font-bold px-4 py-1.5 rounded-lg text-sm"
              >
                {bookmark ? 'Save Changes' : 'Pin to Desk'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
