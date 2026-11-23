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
        className="relative w-full max-w-xl bg-white border-2 border-slate-900 rounded-xl shadow-comicLg p-6 transition-all"
        style={{
          backgroundColor: COLOR_OPTIONS.find((c) => c.id === color)?.hex || '#FEF9C3',
        }}
      >
        {/* Top Pin/Tape Attachment Graphic */}
        <div className="masking-tape h-4 w-28 mx-auto -mt-8 mb-4 opacity-90 rounded-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-comic text-xl text-slate-900 font-bold">
              ✍️ EDIT PAPER NOTE
            </span>
            {isSaved ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                Saved ✓
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Unsaved edits
              </span>
            )}
          </div>

          <button
            onClick={() => {
              sounds.playComicClick();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-black/10 text-slate-700"
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
          className="w-full bg-white/70 border-2 border-slate-900 rounded-lg px-3 py-2 text-lg font-comic font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white mb-3"
        />

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 mb-2 bg-white/60 p-1 rounded-lg border border-slate-900/20">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
            className="p-1.5 hover:bg-white rounded text-slate-700 font-bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic"
            className="p-1.5 hover:bg-white rounded text-slate-700 italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('• ')}
            title="Bullet list"
            className="p-1.5 hover:bg-white rounded text-slate-700"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[ ] ')}
            title="Checklist item"
            className="p-1.5 hover:bg-white rounded text-slate-700"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-400 mx-1" />

          {/* Pin Type Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-comic text-slate-600 font-bold ml-1">Pin:</span>
            {(['tape-top', 'red', 'yellow', 'blue'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPinType(p);
                  setIsSaved(false);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  pinType === p ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border-slate-300'
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
          className="w-full bg-white/70 border-2 border-slate-900 rounded-lg p-3 font-handwritten text-lg font-bold text-slate-900 focus:outline-none focus:bg-white resize-none mb-4"
        />

        {/* Note Customization Bar: Color Picker & Size */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-900/15 pt-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="font-comic text-xs font-bold text-slate-700">Paper:</span>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColor(c.id);
                  setIsSaved(false);
                }}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 border-slate-900 transition-transform ${
                  color === c.id ? 'scale-125 shadow-sm ring-2 ring-slate-900' : 'hover:scale-110'
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
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-300"
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
