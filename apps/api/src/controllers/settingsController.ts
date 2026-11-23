import { Response } from 'express';
import { UserSettingsSchema } from '@littledesk/shared';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserSettingsModel } from '../models/UserSettings.js';
import { getDbStatus } from '../config/db.js';

export async function getSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    if (getDbStatus()) {
      const settings = await UserSettingsModel.findOne({ userId });
      return res.json(settings);
    }
    return res.json(null);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to get settings', error: err.message });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId!;
    if (getDbStatus()) {
      const settings = await UserSettingsModel.findOneAndUpdate(
        { userId },
        { ...req.body, userId, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return res.json(settings);
    }
    return res.json({ ...req.body, userId });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
}
