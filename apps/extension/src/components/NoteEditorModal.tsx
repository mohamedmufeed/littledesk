import React, { useState } from 'react';
import {
  Bold,
  Check,
  CheckSquare,
  Italic,
  List,
  Pin,
  Trash2,
  X,
} from 'lucide-react';
import { Note, NoteColor, NoteSize } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}

const COLOR_OPTIONS: { id: NoteColor; label: string; hex: string }[] = [
  { id: 'yellow', label: 'Sticky Yellow', hex: '#FEF9C3' },
  { id: 'cream', label: 'Vintage Cream', hex: '#FAF3E0' },
  { id: 'white', label: 'Cardstock White', hex: '#FFFFFF' },
  { id: 'pink', label: 'Pastel Pink', hex: '#FFE4E6' },
  { id: 'blue', label: 'Blueprint Blue', hex: '#E0F2FE' },
  { id: 'green', label: 'Mint Green', hex: '#DCFCE7' },
  { id: 'purple', label: 'Lavender', hex: '#F3E8FF' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !note) return null;

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState<NoteColor>(note.color);
  const [size, setSize] = useState<NoteSize>(note.size || 'md');
  const [pinType, setPinType] = useState(note.pinType || 'tape-top');
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [isSaved, setIsSaved] = useState(true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsSaved(false);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setIsSaved(false);
  };

  const handleSave = () => {
    sounds.playPaperRustle();
    const updated: Note = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      color,
      size,
      pinType,
      isPinned,
      updatedAt: new Date().toISOString(),
      revision: (note.revision || 1) + 1,
    };
    onSave(updated);
    setIsSaved(true);
    onClose();
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-modal-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setIsSaved(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#1A2234] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-comicLg dark:shadow-[5px_5px_0px_#090D15] p-6 transition-all"
      >
        {/* Top Pin/Tape Attachment Graphic */}
        <div className="masking-tape h-4 w-28 mx-auto -mt-8 mb-4 opacity-90 rounded-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/20 dark:border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-comic text-xl text-slate-900 dark:text-slate-100 font-bold">
              ✍️ EDIT PAPER NOTE
            </span>
            {isSaved ? (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                Saved ✓
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                Unsaved edits
              </span>
            )}
          </div>

          <button
            onClick={() => {
              sounds.playComicClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Field */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title (e.g. Creative Spark)..."
          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg px-3 py-2 text-lg font-comic font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 mb-3"
        />

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 mb-2 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-900/20 dark:border-slate-700">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic"
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('• ')}
            title="Bullet list"
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[ ] ')}
            title="Checklist item"
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-400 dark:bg-slate-600 mx-1" />

          {/* Pin Type Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-comic text-slate-600 dark:text-slate-400 font-bold ml-1">Pin:</span>
            {(['tape-top', 'red', 'yellow', 'blue'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPinType(p);
                  setIsSaved(false);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${pinType === p
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-slate-900 dark:border-amber-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
              >
                {p === 'tape-top' ? 'Tape' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          id="note-modal-textarea"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Scribble your thoughts, links, or to-dos..."
          rows={7}
          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg p-3 font-handwritten text-lg font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 resize-none mb-4"
        />

        {/* Note Customization Bar: Color Picker & Size */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-900/15 dark:border-slate-700 pt-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="font-comic text-xs font-bold text-slate-700 dark:text-slate-300">Paper:</span>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColor(c.id);
                  setIsSaved(false);
                }}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 border-slate-900 dark:border-slate-600 transition-transform ${color === c.id ? 'scale-125 shadow-sm ring-2 ring-slate-900 dark:ring-amber-400' : 'hover:scale-110'
                  }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playComicClick();
                onDelete(note.id);
                onClose();
              }}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-800"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="comic-btn bg-desk-comicYellow text-slate-950 font-comic font-bold px-4 py-2 rounded-lg text-sm"
            >
              Save to Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
