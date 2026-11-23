import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  title: z.string().max(200).default(''),
  content: z.string().default(''),
  color: z.enum(['white', 'cream', 'yellow', 'pink', 'blue', 'green', 'purple']).default('yellow'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    zIndex: z.number().default(1),
  }),
  rotation: z.number().min(-45).max(45).default(0),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  pinnedToDesk: z.boolean().optional(),
  pinType: z.enum(['red', 'yellow', 'blue', 'tape-top', 'tape-corner', 'none']).default('tape-top'),
  revision: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  title: z.string().min(1).max(300),
  description: z.string().optional().default(''),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().nullable().optional(),
  category: z.string().default('Today'),
  position: z.number().default(0),
  revision: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const BookmarkSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  favicon: z.string().optional(),
  category: z.string().optional().default('General'),
  position: z.number().default(0),
  iconBgColor: z.string().optional(),
  stickerStyle: z.enum(['polaroid', 'badge', 'comic-ticket', 'stamp']).default('polaroid'),
  rotation: z.number().optional().default(0),
  revision: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const UserSettingsSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().min(1).default('Mufeed'),
  searchProvider: z.enum(['google', 'bing', 'duckduckgo']).default('google'),
  theme: z.enum(['vintage-corkboard', 'comic-studio', 'pastel-grid', 'blueprint-desk', 'kraft-paper']).default('comic-studio'),
  wallpaper: z.string().default('default'),
  fontPreference: z.enum(['comic', 'handwritten', 'sans']).default('comic'),
  soundEffects: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  animationIntensity: z.number().min(0).max(1).default(0.8),
  parallaxSensitivity: z.number().min(0).max(1).default(0.5),
  enableWeather: z.boolean().default(true),
  weatherLocation: z.string().optional().default('San Francisco, CA'),
  workspaceSettings: z.object({
    snapToGrid: z.boolean().default(false),
    showDecorativeElements: z.boolean().default(true),
    deskItemsVisible: z.boolean().default(true),
  }).default({
    snapToGrid: false,
    showDecorativeElements: true,
    deskItemsVisible: true,
  }),
  revision: z.number().default(1),
  updatedAt: z.string(),
});

export const RegisterInputSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SyncPushSchema = z.object({
  notes: z.array(NoteSchema).optional(),
  tasks: z.array(TaskSchema).optional(),
  bookmarks: z.array(BookmarkSchema).optional(),
  settings: UserSettingsSchema.optional(),
  lastSyncedAt: z.string().optional(),
});
