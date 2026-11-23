import {
  Note,
  Task,
  Bookmark,
  TodoSheet,
  UserSettings,
  DEFAULT_NOTES,
  DEFAULT_TASKS,
  DEFAULT_BOOKMARKS,
  DEFAULT_TODO_SHEETS,
  DEFAULT_USER_SETTINGS,
} from '@littledesk/shared';

const STORAGE_KEYS = {
  NOTES: 'littledesk_notes',
  TASKS: 'littledesk_tasks',
  TODO_SHEETS: 'littledesk_todo_sheets',
  BOOKMARKS: 'littledesk_bookmarks',
  SETTINGS: 'littledesk_settings',
  RECENT_SEARCHES: 'littledesk_recent_searches',
  OFFLINE_QUEUE: 'littledesk_offline_queue',
  AUTH_TOKEN: 'littledesk_auth_token',
  REFRESH_TOKEN: 'littledesk_refresh_token',
  USER_INFO: 'littledesk_user_info',
  LAST_SYNC: 'littledesk_last_sync',
  SHEET_POSITIONS: 'littledesk_sheet_positions',
};

// Check if running inside Chrome extension environment
const isChromeExtension = typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

class StorageService {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    if (isChromeExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError || result[key] === undefined) {
            resolve(defaultValue);
          } else {
            resolve(result[key]);
          }
        });
      });
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (isChromeExtension) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key} to localStorage`, e);
    }
  }

  async loadWorkspace(): Promise<{
    notes: Note[];
    tasks: Task[];
    sheets: TodoSheet[];
    bookmarks: Bookmark[];
    settings: UserSettings;
    recentSearches: string[];
  }> {
    const [notes, tasks, sheets, bookmarks, settings, recentSearches] = await Promise.all([
      this.getItem<Note[]>(STORAGE_KEYS.NOTES, DEFAULT_NOTES),
      this.getItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS),
      this.getItem<TodoSheet[]>(STORAGE_KEYS.TODO_SHEETS, DEFAULT_TODO_SHEETS),
      this.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, DEFAULT_BOOKMARKS),
      this.getItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS),
      this.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES, ['Vite React 19', 'Tailwind CSS', 'Comic illustration tips']),
    ]);

    return { notes, tasks, sheets, bookmarks, settings, recentSearches };
  }

  async saveNotes(notes: Note[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.NOTES, notes);
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  async saveTodoSheets(sheets: TodoSheet[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.TODO_SHEETS, sheets);
  }

  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async saveRecentSearches(searches: string[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.RECENT_SEARCHES, searches.slice(0, 8));
  }

  async getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null),
      this.getItem<string | null>(STORAGE_KEYS.REFRESH_TOKEN, null),
    ]);
    return { accessToken, refreshToken };
  }

  async setAuthTokens(tokens: { accessToken: string; refreshToken: string } | null): Promise<void> {
    if (!tokens) {
      await Promise.all([
        this.setItem(STORAGE_KEYS.AUTH_TOKEN, null),
        this.setItem(STORAGE_KEYS.REFRESH_TOKEN, null),
        this.setItem(STORAGE_KEYS.USER_INFO, null),
      ]);
    } else {
      await Promise.all([
        this.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken),
        this.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);
    }
  }

  async getUserInfo(): Promise<any> {
    return this.getItem(STORAGE_KEYS.USER_INFO, null);
  }

  async setUserInfo(user: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_INFO, user);
  }

  async getLastSync(): Promise<string | null> {
    return this.getItem<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  }

  async setLastSync(timestamp: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  async getSheetPositions(): Promise<Record<string, { x: number; y: number; zIndex: number }>> {
    return this.getItem(STORAGE_KEYS.SHEET_POSITIONS, {});
  }

  async saveSheetPositions(positions: Record<string, { x: number; y: number; zIndex: number }>): Promise<void> {
    await this.setItem(STORAGE_KEYS.SHEET_POSITIONS, positions);
  }
}

export const storage = new StorageService();
