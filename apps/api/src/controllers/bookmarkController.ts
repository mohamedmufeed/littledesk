import { Response } from 'express';
import { BookmarkSchema } from '@littledesk/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BookmarkModel } from '../models/Bookmark.js';
import { getDbStatus } from '../config/db.js';

export async function getBookmarks(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    if (getDbStatus()) {
      const bookmarks = await BookmarkModel.find({ userId, deletedAt: null }).sort({ position: 1 });
      return res.json(bookmarks);
    }
    return res.json([]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch bookmarks', error: err.message });
  }
}

export async function createBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const parse = BookmarkSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });

    if (getDbStatus()) {
      const bm = await BookmarkModel.create({ ...parse.data, userId });
      return res.status(201).json(bm);
    }
    return res.status(201).json({ ...parse.data, userId });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create bookmark', error: err.message });
  }
}

export async function updateBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      const bm = await BookmarkModel.findOneAndUpdate(
        { userId, id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!bm) return res.status(404).json({ message: 'Bookmark not found' });
      return res.json(bm);
    }
    return res.json({ id, ...req.body });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update bookmark', error: err.message });
  }
}

export async function deleteBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      await BookmarkModel.findOneAndUpdate({ userId, id }, { deletedAt: new Date() });
    }
    return res.json({ success: true, message: 'Bookmark deleted' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete bookmark', error: err.message });
  }
}
