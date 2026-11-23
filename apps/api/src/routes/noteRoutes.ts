import { Router } from 'express';
import { createNote, deleteNote, getNotes, updateNote } from '../controllers/noteController.js';
import { requireAuth } from '../middleware/auth.js';

export const noteRouter = Router();

noteRouter.use(requireAuth);
noteRouter.get('/', getNotes);
noteRouter.post('/', createNote);
noteRouter.patch('/:id', updateNote);
noteRouter.delete('/:id', deleteNote);
