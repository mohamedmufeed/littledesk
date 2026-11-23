import { Router } from 'express';
import { createBookmark, deleteBookmark, getBookmarks, updateBookmark } from '../controllers/bookmarkController.js';
import { requireAuth } from '../middleware/auth.js';

export const bookmarkRouter = Router();

bookmarkRouter.use(requireAuth);
bookmarkRouter.get('/', getBookmarks);
bookmarkRouter.post('/', createBookmark);
bookmarkRouter.patch('/:id', updateBookmark);
bookmarkRouter.delete('/:id', deleteBookmark);
