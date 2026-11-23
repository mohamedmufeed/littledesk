import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Pin, Trash2 } from 'lucide-react';
import { Note, NoteColor } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface PaperNoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
  onToggleCollapse?: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const COLOR_CLASSES: Record<NoteColor, { bg: string; border: string; tape: string }> = {
  yellow: { bg: 'bg-[#FEF9C3]', border: 'border-[#FACC15]', tape: 'bg-amber-200/80' },
  cream: { bg: 'bg-[#FAF3E0]', border: 'border-[#E2D5B5]', tape: 'bg-stone-200/80' },
  white: { bg: 'bg-[#FFFFFF]', border: 'border-slate-300', tape: 'bg-slate-200/80' },
  pink: { bg: 'bg-[#FFE4E6]', border: 'border-[#FDA4AF]', tape: 'bg-rose-200/80' },
  blue: { bg: 'bg-[#E0F2FE]', border: 'border-[#7DD3FC]', tape: 'bg-sky-200/80' },
  green: { bg: 'bg-[#DCFCE7]', border: 'border-[#86EFAC]', tape: 'bg-emerald-200/80' },
  purple: { bg: 'bg-[#F3E8FF]', border: 'border-[#D8B4FE]', tape: 'bg-purple-200/80' },
};

const COLOR_OPTIONS: NoteColor[] = ['yellow', 'cream', 'white', 'pink', 'blue', 'green', 'purple'];

export const PaperNoteCard: React.FC<PaperNoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onColorChange,
  onToggleCollapse,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState({ x: note.position.x, y: note.position.y });

  const colorConfig = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag when clicking card body, not buttons or inputs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
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
      const newX = Math.max(10, Math.min(window.innerWidth - 240, startPosX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 120, startPosY + deltaY));
      setCurrentPos({ x: newX, y: newY });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      const deltaX = upEvent.clientX - startClientX;
      const deltaY = upEvent.clientY - startClientY;
      const finalX = Math.max(10, Math.min(window.innerWidth - 240, startPosX + deltaX));
      const finalY = Math.max(10, Math.min(window.innerHeight - 120, startPosY + deltaY));
      onDragEnd(note.id, finalX, finalY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isCollapsed = Boolean(note.isCollapsed);

  const sizeClasses = isCollapsed
    ? 'w-56 py-2 px-3'
    : {
      sm: 'w-56 min-h-[140px]',
      md: 'w-64 min-h-[160px]',
      lg: 'w-76 min-h-[200px]',
    }[note.size || 'md'];

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0) rotate(${note.rotation || 0}deg)`,
        zIndex: isDragging ? 100 : note.position.zIndex || 10,
        position: 'absolute',
      }}
      className={`group ${sizeClasses} ${colorConfig.bg} border-2 border-slate-900/40 rounded-sm p-3.5 flex flex-col justify-between paper-curl-br select-none cursor-grab active:cursor-grabbing transition-all duration-150 ${isDragging ? 'shadow-paperDrag scale-[1.02]' : 'shadow-paper hover:shadow-paperHover'
        }`}
    >
      {/* Pin or Tape Header */}
      {note.pinType === 'red' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pushpin pushpin-red pointer-events-none" />
      )}
      {note.pinType === 'yellow' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pushpin pushpin-yellow pointer-events-none" />
      )}
      {note.pinType === 'blue' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pushpin pushpin-blue pointer-events-none" />
      )}
      {note.pinType === 'tape-corner' && (
        <div className="absolute -top-3 -left-3 masking-tape h-4 w-12 rotate-[-45deg] z-10 pointer-events-none" />
      )}
      {(!note.pinType || note.pinType === 'tape-top') && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 masking-tape h-4 w-24 opacity-90 rounded-xs pointer-events-none z-10" />
      )}

      {/* Top: Title & Controls */}
      <div>
          <div className="flex items-center justify-between gap-1.5 border-b border-slate-900/15 pb-1 mb-1">
            <h3
              onClick={() => onEdit(note)}
              className="font-comic text-sm sm:text-base text-slate-900 tracking-wide font-bold line-clamp-1 hover:text-desk-comicRed cursor-pointer flex-1"
            >
              {note.title || 'Untitled Note'}
            </h3>

              <div className="flex items-center gap-0.5">
                {/* Collapse / Expand Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playPaperRustle();
                    onToggleCollapse?.(note.id);
                  }}
                  title={isCollapsed ? 'Unfold note' : 'Fold note'}
                  className="p-1 rounded hover:bg-black/5 text-slate-600"
                >
                  {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                {!isCollapsed && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playComicClick();
                        onTogglePin(note.id);
                      }}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      className={`p-1 rounded hover:bg-black/5 ${note.isPinned ? 'text-desk-comicRed font-bold' : 'text-slate-500'
                        }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playPaperRustle();
                        onEdit(note);
                      }}
                      title="Edit note"
                      className="p-1 rounded hover:bg-black/5 text-slate-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
            </>
            )}
          </div>
        </div>

      {/* Note Content (Only shown when not collapsed) */}
      {!isCollapsed && (
        <div
          onClick={() => onEdit(note)}
          className="font-handwritten text-base leading-snug text-slate-800 whitespace-pre-wrap line-clamp-5 cursor-pointer mt-1"
        >
          {note.content || 'Tap here to scribble thoughts...'}
        </div>
      )}
    </div>

    {/* Footer: Color Switcher & Delete Button (Only shown when not collapsed) */}
    {!isCollapsed && (
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-900/10">
        <div className="flex items-center gap-1">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={(e) => {
                e.stopPropagation();
                sounds.playComicClick();
                onColorChange(note.id, c);
              }}
        className={`w-3.5 h-3.5 rounded-full border border-slate-900/30 transition-transform ${note.color === c ? 'scale-125 ring-1 ring-slate-900' : 'hover:scale-110'
          }`}
        style={{ backgroundColor: COLOR_CLASSES[c].bg.replace('bg-[', '').replace(']', '') }}
              />
            ))}
      </div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        sounds.playComicClick();
        onDelete(note.id);
      }}
      title="Delete note"
      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 transition-opacity"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
      )}
    </div >
  );
};
