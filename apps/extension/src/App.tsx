import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Bookmark,
  DEFAULT_BOOKMARKS,
  DEFAULT_NOTES,
  DEFAULT_TASKS,
  DEFAULT_TODO_SHEETS,
  DEFAULT_USER_SETTINGS,
  Note,
  NoteColor,
  SearchProvider,
  Task,
  TaskPriority,
  TodoSheet,
  UserSettings,
} from '@littledesk/shared';
import { DecorativeCollage } from './components/DecorativeCollage.js';
import { Desk3DCanvas } from './components/Desk3DCanvas.js';
import { Header } from './components/Header.js';
import { NewSheetModal } from './components/NewSheetModal.js';
import { NoteEditorModal } from './components/NoteEditorModal.js';
import { PaperNoteCard } from './components/PaperNoteCard.js';
import { SearchBar } from './components/SearchBar.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ShortcutModal } from './components/ShortcutModal.js';
import { ShortcutsGrid } from './components/ShortcutsGrid.js';
import { TaskChecklist } from './components/TaskChecklist.js';
import { api } from './services/api.js';
import { storage } from './services/storage.js';
import { sounds } from './utils/sound.js';

export default function App() {
  // Main Workspace State
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [todoSheets, setTodoSheets] = useState<TodoSheet[]>(DEFAULT_TODO_SHEETS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(DEFAULT_BOOKMARKS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Sync state
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // Mouse Parallax coordinates (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);

  const deskRef = useRef<HTMLDivElement>(null);

  // 1. Initial Workspace Load from Local-First Storage
  useEffect(() => {
    async function initWorkspace() {
      try {
        const data = await storage.loadWorkspace();
        setNotes(data.notes || DEFAULT_NOTES);
        setTasks(data.tasks || DEFAULT_TASKS);
        setTodoSheets(data.sheets || DEFAULT_TODO_SHEETS);
        setBookmarks(data.bookmarks || DEFAULT_BOOKMARKS);
        setSettings(data.settings || DEFAULT_USER_SETTINGS);
        setRecentSearches(data.recentSearches || []);

        // Load saved user info
        const savedUser = await storage.getUserInfo();
        if (savedUser) setUser(savedUser);

        // Sound configuration
        if (data.settings?.soundEffects !== undefined) {
          sounds.setEnabled(data.settings.soundEffects);
        }

        // Check backend connectivity and sync
        attemptBackgroundSync(data.notes, data.tasks, data.bookmarks, data.settings);
      } catch (err) {
        console.error('[LittleDesk] Error initializing workspace', err);
      }
    }
    initWorkspace();
  }, []);

  // 2. Entrance Animation with GSAP
  useEffect(() => {
    if (settings.reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        opacity: 0,
        y: -15,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
      gsap.from('.gsap-pop', {
        scale: 0.85,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.7)',
        delay: 0.1,
      });
    }, deskRef);

    return () => ctx.revert();
  }, [settings.reducedMotion]);

  // 3. Mouse Movement Parallax Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (settings.reducedMotion) return;
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x: normX, y: normY });
  };

  // --- Background Sync Engine ---
  const attemptBackgroundSync = async (
    currentNotes: Note[],
    currentTasks: Task[],
    currentBookmarks: Bookmark[],
    currentSettings: UserSettings
  ) => {
    setSyncState('syncing');
    try {
      const isHealthy = await api.checkHealth();
      if (!isHealthy) {
        setSyncState('offline');
        return;
      }

      const { accessToken } = await storage.getAuthTokens();
      if (!accessToken) {
        // Not logged in to remote cloud, working locally
        setSyncState('offline');
        return;
      }

      // 1. Push local changes
      await api.pushSync({
        notes: currentNotes,
        tasks: currentTasks,
        bookmarks: currentBookmarks,
        settings: currentSettings,
      });

      // 2. Pull server changes
      const lastSync = await storage.getLastSync();
      const pullRes = await api.pullSync(lastSync || undefined);

      if (pullRes.notes?.length) {
        setNotes(pullRes.notes);
        await storage.saveNotes(pullRes.notes);
      }
      if (pullRes.tasks?.length) {
        setTasks(pullRes.tasks);
        await storage.saveTasks(pullRes.tasks);
      }
      if (pullRes.bookmarks?.length) {
        setBookmarks(pullRes.bookmarks);
        await storage.saveBookmarks(pullRes.bookmarks);
      }
      if (pullRes.settings) {
        setSettings(pullRes.settings);
        await storage.saveSettings(pullRes.settings);
      }

      await storage.setLastSync(pullRes.serverTimestamp || new Date().toISOString());
      setSyncState('synced');
    } catch (e) {
      console.warn('[Sync] Background sync check failed', e);
      setSyncState('offline');
    }
  };

  const handleManualSync = async () => {
    await attemptBackgroundSync(notes, tasks, bookmarks, settings);
  };

  // --- Notes Actions ---
  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Paper Note',
      content: '',
      color: 'yellow',
      position: {
        x: Math.min(window.innerWidth - 320, Math.max(40, Math.random() * (window.innerWidth - 400))),
        y: Math.min(window.innerHeight - 260, Math.max(160, 180 + Math.random() * 200)),
        zIndex: 20,
      },
      rotation: Math.random() * 6 - 3,
      size: 'md',
      isPinned: false,
      isArchived: false,
      pinType: 'tape-top',
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingNote(newNote);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (updated: Note) => {
    const exists = notes.some((n) => n.id === updated.id);
    const newNotes = exists
      ? notes.map((n) => (n.id === updated.id ? updated : n))
      : [updated, ...notes];

    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const handleDeleteNote = (id: string) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const handleToggleNotePin = (id: string) => {
    const newNotes = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned, position: { ...n.position, zIndex: n.isPinned ? 10 : 50 } } : n
    );
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const handleNoteColorChange = (id: string, color: NoteColor) => {
    const newNotes = notes.map((n) => (n.id === id ? { ...n, color, updatedAt: new Date().toISOString() } : n));
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const handleNoteDragEnd = (id: string, newX: number, newY: number) => {
    const newNotes = notes.map((n) =>
      n.id === id
        ? {
          ...n,
          position: { ...n.position, x: newX, y: newY, zIndex: 30 },
          updatedAt: new Date().toISOString(),
        }
        : n
    );
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const handleSheetDragEnd = (sheetId: string, newX: number, newY: number) => {
    const updated = todoSheets.map((s) =>
      s.id === sheetId
        ? {
            ...s,
            position: { ...s.position, x: newX, y: newY, zIndex: 30 },
          }
        : s
    );
    setTodoSheets(updated);
    storage.saveTodoSheets(updated);
  };

  const handleCreateTodoSheet = (
    sheetData: Omit<TodoSheet, 'id' | 'createdAt'>,
    initialTask?: string
  ) => {
    const newSheet: TodoSheet = {
      ...sheetData,
      id: `sheet-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedSheets = [...todoSheets, newSheet];
    setTodoSheets(updatedSheets);
    storage.saveTodoSheets(updatedSheets);

    if (initialTask) {
      handleAddTask({
        title: initialTask,
        description: '',
        completed: false,
        priority: 'medium',
        category: newSheet.category,
        position: tasks.length,
        dueDate: 'Today',
      });
    }
  };

  const handleDeleteTodoSheet = (sheetId: string) => {
    const updated = todoSheets.filter((s) => s.id !== sheetId);
    setTodoSheets(updated);
    storage.saveTodoSheets(updated);
  };

  // --- Tasks Actions ---
  const handleToggleTask = (id: string) => {
    const newTasks = tasks.map((t) =>
      t.id === id
        ? {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        }
        : t
    );
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'revision'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleUpdateTaskPriority = (id: string, priority: TaskPriority) => {
    const newTasks = tasks.map((t) => (t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t));
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  // --- Bookmarks Actions ---
  const handleOpenBookmark = (url: string) => {
    window.location.href = url;
  };

  const handleSaveBookmark = (bmData: Partial<Bookmark>) => {
    if (bmData.id) {
      // Edit existing
      const updated = bookmarks.map((b) =>
        b.id === bmData.id ? ({ ...b, ...bmData, updatedAt: new Date().toISOString() } as Bookmark) : b
      );
      setBookmarks(updated);
      storage.saveBookmarks(updated);
    } else {
      // Create new
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        title: bmData.title || 'Shortcut',
        url: bmData.url || 'https://google.com',
        category: bmData.category || 'General',
        iconBgColor: bmData.iconBgColor || '#4285F4',
        stickerStyle: bmData.stickerStyle || 'polaroid',
        position: bookmarks.length,
        rotation: bmData.rotation ?? (Math.random() * 4 - 2),
        revision: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...bookmarks, newBm];
      setBookmarks(updated);
      storage.saveBookmarks(updated);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    storage.saveBookmarks(updated);
  };

  // --- Search Actions ---
  const handleProviderChange = (provider: SearchProvider) => {
    const updated: UserSettings = {
      ...settings,
      searchProvider: provider,
      updatedAt: new Date().toISOString(),
    };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleAddRecentSearch = (q: string) => {
    const filtered = recentSearches.filter((item) => item.toLowerCase() !== q.toLowerCase());
    const updated = [q, ...filtered].slice(0, 8);
    setRecentSearches(updated);
    storage.saveRecentSearches(updated);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    storage.saveRecentSearches([]);
  };

  // --- Settings Actions ---
  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated: UserSettings = {
      ...settings,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleResetDefaults = () => {
    setNotes(DEFAULT_NOTES);
    setTasks(DEFAULT_TASKS);
    setBookmarks(DEFAULT_BOOKMARKS);
    setSettings(DEFAULT_USER_SETTINGS);
    setRecentSearches([]);
    storage.saveNotes(DEFAULT_NOTES);
    storage.saveTasks(DEFAULT_TASKS);
    storage.saveBookmarks(DEFAULT_BOOKMARKS);
    storage.saveSettings(DEFAULT_USER_SETTINGS);
    storage.saveRecentSearches([]);
  };

  // Background Theme Class
  const themeClassMap: Record<string, string> = {
    'comic-studio': 'bg-[#F6F1EA] graph-paper-pattern',
    'vintage-corkboard': 'corkboard-pattern',
    'pastel-grid': 'bg-[#FDFBF7] graph-paper-pattern',
    'blueprint-desk': 'bg-[#1E3A5F] text-white',
    'kraft-paper': 'bg-[#E5D3B3]',
  };
  const activeThemeClass = themeClassMap[settings.theme] || themeClassMap['comic-studio'];

  return (
    <div
      ref={deskRef}
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between transition-colors duration-300 ${activeThemeClass}`}
    >
      {/* Halftone texture overlay */}
      <div className="halftone-dots fixed inset-0 pointer-events-none z-0" />

      {/* Decorative comic artwork (stickers, polaroids, HB pencil, coffee stain) */}
      <DecorativeCollage
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        sensitivity={settings.parallaxSensitivity ?? 0.5}
        visible={settings.workspaceSettings?.showDecorativeElements !== false}
      />

      {/* Three.js 3D depth canvas with origami paper plane & sticky note */}
      <Desk3DCanvas
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        sensitivity={settings.parallaxSensitivity ?? 0.5}
        enabled={!settings.reducedMotion && settings.workspaceSettings?.deskItemsVisible !== false}
      />

      {/* Top Header */}
      <div className="gsap-fade-in z-20">
        <Header
          settings={settings}
          syncState={syncState}
          user={user}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAccount={() => setIsSettingsOpen(true)}
          onNewNote={handleCreateNote}
          onNewSheet={() => setIsNewSheetModalOpen(true)}
          onManualSync={handleManualSync}
        />
      </div>

      {/* Main Workspace Area: Search + Shortcuts + Checklist + Freeform Notes */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Prominent Search Bar */}
        <div className="gsap-fade-in w-full">
          <SearchBar
            provider={settings.searchProvider}
            recentSearches={recentSearches}
            onProviderChange={handleProviderChange}
            onAddRecentSearch={handleAddRecentSearch}
            onClearRecentSearches={handleClearRecentSearches}
          />
        </div>

        {/* Website Shortcuts Launchpad */}
        <div className="gsap-pop w-full">
          <ShortcutsGrid
            bookmarks={bookmarks}
            onOpenBookmark={handleOpenBookmark}
            onEditBookmark={(bm) => {
              setEditingBookmark(bm);
              setIsBookmarkModalOpen(true);
            }}
            onDeleteBookmark={handleDeleteBookmark}
            onAddBookmark={() => {
              setEditingBookmark(null);
              setIsBookmarkModalOpen(true);
            }}
          />
        </div>

          {/* Unified Freeform Scrapbook Wall: Draggable To-Do Sheets & Draggable Paper Notes */}
          <div className="w-full relative min-h-[680px] my-3 pb-16">
            <TaskChecklist
              sheets={todoSheets}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdatePriority={handleUpdateTaskPriority}
              onSheetDragEnd={handleSheetDragEnd}
              onDeleteSheet={handleDeleteTodoSheet}
              onOpenNewSheetModal={() => setIsNewSheetModalOpen(true)}
            />

            {notes.map((note) => (
              <PaperNoteCard
                key={note.id}
                note={note}
                onEdit={(n) => {
                  setEditingNote(n);
                  setIsNoteModalOpen(true);
                }}
                onDelete={handleDeleteNote}
                onTogglePin={handleToggleNotePin}
                onColorChange={handleNoteColorChange}
                onDragEnd={handleNoteDragEnd}
              />
            ))}
          </div>
      </main>

      {/* Subtle Footer Watermark */}
      <footer className="w-full text-center py-2.5 z-10 select-none opacity-50 hover:opacity-100 transition-opacity">
        <span className="font-comic text-xs tracking-wider font-bold text-slate-800">
          LittleDesk — Your Personal 3D Comic Scrapbook • Press '/' to search
        </span>
      </footer>

      {/* --- Modals --- */}
      {/* 1. Note Editor Modal */}
      <NoteEditorModal
        note={editingNote}
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* 2. Shortcut Add/Edit Modal */}
      <ShortcutModal
        bookmark={editingBookmark}
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsBookmarkModalOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        onDelete={handleDeleteBookmark}
      />

      {/* 3. Settings & Cloud Sync Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        user={user}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetDefaults}
        onAuthSuccess={(u) => setUser(u)}
        onLogout={() => {
          setUser(null);
          storage.setAuthTokens(null);
          setSyncState('offline');
        }}
        onManualSync={handleManualSync}
        syncState={syncState}
      />

      {/* 4. Pin New To-Do Sheet Modal */}
      <NewSheetModal
        isOpen={isNewSheetModalOpen}
        onClose={() => setIsNewSheetModalOpen(false)}
        onCreateSheet={handleCreateTodoSheet}
      />
    </div>
  );
}
