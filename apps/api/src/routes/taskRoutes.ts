import { Router } from 'express';
import { createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get('/', getTasks);
taskRouter.post('/', createTask);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
