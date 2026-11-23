import mongoose, { Document, Schema } from 'mongoose';

export interface INoteDocument extends Document {
  id: string; // client id
  userId: string;
  title: string;
  content: string;
  color: string;
  position: {
    x: number;
    y: number;
    zIndex: number;
  };
  rotation: number;
  size: string;
  isPinned: boolean;
  isArchived: boolean;
  pinType: string;
  revision: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    color: { type: String, default: 'yellow' },
    position: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 180 },
      zIndex: { type: Number, default: 1 },
    },
    rotation: { type: Number, default: 0 },
    size: { type: String, default: 'md' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    pinType: { type: String, default: 'tape-top' },
    revision: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, id: 1 }, { unique: true });

export const NoteModel = mongoose.model<INoteDocument>('Note', NoteSchema);
