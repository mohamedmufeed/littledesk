import { Response } from 'express';
import { TaskSchema } from '@littledesk/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { TaskModel } from '../models/Task.js';
import { getDbStatus } from '../config/db.js';

export async function getTasks(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    if (getDbStatus()) {
      const tasks = await TaskModel.find({ userId, deletedAt: null }).sort({ position: 1 });
      return res.json(tasks);
    }
    return res.json([]);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const parse = TaskSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });

    if (getDbStatus()) {
      const task = await TaskModel.create({ ...parse.data, userId });
      return res.status(201).json(task);
    }
    return res.status(201).json({ ...parse.data, userId });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      const task = await TaskModel.findOneAndUpdate(
        { userId, id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });
      return res.json(task);
    }
    return res.json({ id, ...req.body });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    if (getDbStatus()) {
      await TaskModel.findOneAndUpdate({ userId, id }, { deletedAt: new Date() });
    }
    return res.json({ success: true, message: 'Task deleted' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
}
