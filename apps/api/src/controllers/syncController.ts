import { Response } from 'express';
import { SyncPushSchema } from '@littledesk/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NoteModel } from '../models/Note.js';
import { TaskModel } from '../models/Task.js';
import { BookmarkModel } from '../models/Bookmark.js';
import { UserSettingsModel } from '../models/UserSettings.js';
import { getDbStatus } from '../config/db.js';

// In-memory sync store fallback
const memoryNotes = new Map<string, any[]>();
const memoryTasks = new Map<string, any[]>();
const memoryBookmarks = new Map<string, any[]>();
const memorySettings = new Map<string, any>();

export async function pushSync(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const parseResult = SyncPushSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid sync payload', errors: parseResult.error.flatten() });
    }

    const { notes, tasks, bookmarks, settings } = parseResult.data;

    if (getDbStatus()) {
      // 1. Process Notes with revisions and soft deletes
      if (notes && notes.length > 0) {
        for (const note of notes) {
          const existing = await NoteModel.findOne({ userId, id: note.id });
          if (!existing || note.revision >= existing.revision) {
            await NoteModel.findOneAndUpdate(
              { userId, id: note.id },
              {
                ...note,
                userId,
                deletedAt: note.deletedAt ? new Date(note.deletedAt) : null,
              },
              { upsert: true, new: true }
            );
          }
        }
      }

      // 2. Process Tasks
      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          const existing = await TaskModel.findOne({ userId, id: task.id });
          if (!existing || task.revision >= existing.revision) {
            await TaskModel.findOneAndUpdate(
              { userId, id: task.id },
              {
                ...task,
                userId,
                deletedAt: task.deletedAt ? new Date(task.deletedAt) : null,
              },
              { upsert: true, new: true }
            );
          }
        }
      }

      // 3. Process Bookmarks
      if (bookmarks && bookmarks.length > 0) {
        for (const bm of bookmarks) {
          const existing = await BookmarkModel.findOne({ userId, id: bm.id });
          if (!existing || bm.revision >= existing.revision) {
            await BookmarkModel.findOneAndUpdate(
              { userId, id: bm.id },
              {
                ...bm,
                userId,
                deletedAt: bm.deletedAt ? new Date(bm.deletedAt) : null,
              },
              { upsert: true, new: true }
            );
          }
        }
      }

      // 4. Process Settings
      if (settings) {
        await UserSettingsModel.findOneAndUpdate(
          { userId },
          { ...settings, userId },
          { upsert: true, new: true }
        );
      }
    } else {
      // Fallback in-memory sync
      if (notes) memoryNotes.set(userId, notes);
      if (tasks) memoryTasks.set(userId, tasks);
      if (bookmarks) memoryBookmarks.set(userId, bookmarks);
      if (settings) memorySettings.set(userId, settings);
    }

    return res.json({
      success: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Push Sync Error]', err);
    return res.status(500).json({ message: 'Push sync failed', error: err.message });
  }
}

export async function pullSync(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const since = req.query.since as string | undefined;
    const sinceDate = since ? new Date(since) : null;

    if (getDbStatus()) {
      const query: any = { userId };
      if (sinceDate && !isNaN(sinceDate.getTime())) {
        query.updatedAt = { $gt: sinceDate };
      } else {
        // Return active (non-deleted) records on full pull
        query.deletedAt = null;
      }

      const [notes, tasks, bookmarks, settings] = await Promise.all([
        NoteModel.find(query).lean(),
        TaskModel.find(query).lean(),
        BookmarkModel.find(query).lean(),
        UserSettingsModel.findOne({ userId }).lean(),
      ]);

      return res.json({
        notes: notes.map((n) => ({ ...n, id: n.id })),
        tasks: tasks.map((t) => ({ ...t, id: t.id })),
        bookmarks: bookmarks.map((b) => ({ ...b, id: b.id })),
        settings: settings || null,
        serverTimestamp: new Date().toISOString(),
      });
    }

    // In-memory fallback
    return res.json({
      notes: memoryNotes.get(userId) || [],
      tasks: memoryTasks.get(userId) || [],
      bookmarks: memoryBookmarks.get(userId) || [],
      settings: memorySettings.get(userId) || null,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Pull Sync Error]', err);
    return res.status(500).json({ message: 'Pull sync failed', error: err.message });
  }
}
