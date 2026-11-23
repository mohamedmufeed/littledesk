import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskDocument extends Document {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date | null;
  priority: string;
  dueDate?: string | null;
  category: string;
  position: number;
  revision: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    priority: { type: String, default: 'medium' },
    dueDate: { type: String, default: null },
    category: { type: String, default: 'Today' },
    position: { type: Number, default: 0 },
    revision: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, id: 1 }, { unique: true });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
