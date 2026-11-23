import React from 'react';
import { Edit2, ExternalLink, Globe, Plus, Trash2 } from 'lucide-react';
import { Bookmark } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface ShortcutsGridProps {
  bookmarks: Bookmark[];
  onOpenBookmark: (url: string) => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onAddBookmark: () => void;
}

export const ShortcutsGrid: React.FC<ShortcutsGridProps> = ({
  bookmarks,
  onOpenBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onAddBookmark,
}) => {
  // Extract domain for favicon if not explicitly provided
  const getFaviconUrl = (bookmark: Bookmark) => {
    if (bookmark.favicon) return bookmark.favicon;
    try {
      const parsed = new URL(bookmark.url);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
      <div className="w-full max-w-5xl mx-auto px-4 z-10 my-3">
        {/* Launchpad Header Tag */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-slate-900 rounded-md px-2.5 py-1 shadow-sm">
            <span className="text-xs">📌</span>
            <span className="font-comic text-xs uppercase tracking-wider font-bold text-slate-800">
              Desk Shortcuts
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
              {bookmarks.length}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playPaperRustle();
              onAddBookmark();
            }}
            className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shortcut</span>
          </button>
        </div>

        {/* Grid of Polaroid & Stamp Bookmark Tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {bookmarks.map((bm, index) => {
            const rotation = bm.rotation ?? ((index % 3) - 1) * 1.5;

            return (
              <div
                key={bm.id}
                className="group relative flex flex-col items-center"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
                }}
              >
                {/* Mini masking tape on top of tile */}
                <div className="masking-tape h-2.5 w-10 -mb-1 opacity-75 z-10 rounded-xs pointer-events-none" />

                {/* Card Container */}
                <div
                  onClick={() => {
                    sounds.playComicClick();
                    onOpenBookmark(bm.url);
                  }}
                  className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer shadow-comic transition-all duration-150 hover:-translate-y-1 hover:shadow-comicLg group-hover:border-slate-950"
                >
                  {/* Tile Icon Area */}
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center mb-1.5 p-1 border border-slate-900/10 shadow-inner"
                    style={{ backgroundColor: bm.iconBgColor || '#FEF3C7' }}
                  >
                    <img
                      src={getFaviconUrl(bm)}
                      alt={bm.title}
                      onError={(e) => {
                        // Fallback icon on image error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-6 h-6 object-contain rounded"
                    />
                    <Globe className="w-5 h-5 text-slate-700 hidden only:block" />
                  </div>

                  {/* Bookmark Title */}
                  <span className="font-comic text-xs font-bold text-slate-900 text-center truncate max-w-full tracking-wide">
                    {bm.title}
                  </span>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playComicClick();
                        onEditBookmark(bm);
                      }}
                      title="Edit shortcut"
                      className="p-1 bg-amber-400 hover:bg-amber-500 border border-slate-900 rounded-full shadow text-slate-950"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playComicClick();
                        onDeleteBookmark(bm.id);
                      }}
                      title="Delete shortcut"
                      className="p-1 bg-rose-400 hover:bg-rose-500 border border-slate-900 rounded-full shadow text-white"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Shortcut dashed card */}
          <button
            onClick={() => {
              sounds.playPaperRustle();
              onAddBookmark();
            }}
            className="border-2 border-dashed border-slate-400 hover:border-slate-900 bg-white/40 hover:bg-white/80 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-comic h-[84px] group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-400 group-hover:border-slate-900 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-comic font-bold text-slate-600 group-hover:text-slate-900 mt-1">
              + New
            </span>
          </button>
        </div>
      </div>
      );
};
