import { Response } from 'express';
import { NoteSchema } from '@littledesk/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NoteModel } from '../models/Note.js';
import { getDbStatus } from '../config/db.js';

export async function getNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    if (getDbStatus()) {
      const notes = await NoteModel.find({ userId, deletedAt: null }).sort({ updatedAt: -1 });
      return res.json(notes);
    }
    return res.json([]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const parse = NoteSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });

    if (getDbStatus()) {
      const note = await NoteModel.create({ ...parse.data, userId });
      return res.status(201).json(note);
    }
    return res.status(201).json({ ...parse.data, userId });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create note', error: err.message });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      const note = await NoteModel.findOneAndUpdate(
        { userId, id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!note) return res.status(404).json({ message: 'Note not found' });
      return res.json(note);
    }
    return res.json({ id, ...req.body });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      await NoteModel.findOneAndUpdate({ userId, id }, { deletedAt: new Date() });
    }
    return res.json({ success: true, message: 'Note deleted' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete note', error: err.message });
  }
}
