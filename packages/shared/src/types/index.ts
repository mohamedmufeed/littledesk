export type NoteColor = 'white' | 'cream' | 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export type NoteSize = 'sm' | 'md' | 'lg';

export interface NotePosition {
  x: number; // percentage or px
  y: number;
  zIndex: number;
}

export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  color: NoteColor;
  position: NotePosition;
  rotation: number; // degrees -6 to +6
  size: NoteSize;
  isPinned: boolean;
  isArchived: boolean;
  pinnedToDesk?: boolean;
  pinType?: 'red' | 'yellow' | 'blue' | 'tape-top' | 'tape-corner' | 'none';
  revision: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'Today' | 'Personal' | 'Development' | 'Ideas' | 'Later' | string;

export interface TodoSheet {
  id: string;
  title: string;
  category: string;
  paperColor: 'yellow' | 'cream' | 'white' | 'pink' | 'blue' | 'green';
  pinType: 'red' | 'yellow' | 'blue' | 'tape';
  position: { x: number; y: number; zIndex: number };
  rotation: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
  category: TaskCategory;
  position: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Bookmark {
  id: string;
  userId?: string;
  title: string;
  url: string;
  favicon?: string;
  category?: string;
  position: number;
  iconBgColor?: string;
  stickerStyle?: 'polaroid' | 'badge' | 'comic-ticket' | 'stamp';
  rotation?: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type SearchProvider = 'google' | 'bing' | 'duckduckgo';

export type WallpaperTheme =
  | 'vintage-corkboard'
  | 'comic-studio'
  | 'pastel-grid'
  | 'blueprint-desk'
  | 'kraft-paper';

export interface UserSettings {
  userId?: string;
  userName: string;
  searchProvider: SearchProvider;
  theme: WallpaperTheme;
  wallpaper: string;
  fontPreference: 'comic' | 'handwritten' | 'sans';
  soundEffects: boolean;
  reducedMotion: boolean;
  animationIntensity: number; // 0 to 1
  parallaxSensitivity: number; // 0 to 1
  enableWeather: boolean;
  weatherLocation?: string;
  workspaceSettings: {
    snapToGrid: boolean;
    showDecorativeElements: boolean;
    deskItemsVisible: boolean;
  };
  revision: number;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SyncPushPayload {
  notes?: Note[];
  tasks?: Task[];
  bookmarks?: Bookmark[];
  settings?: UserSettings;
  lastSyncedAt?: string;
}

export interface SyncPullResponse {
  notes: Note[];
  tasks: Task[];
  bookmarks: Bookmark[];
  settings: UserSettings | null;
  serverTimestamp: string;
}
