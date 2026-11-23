import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmarkDocument extends Document {
  id: string;
  userId: string;
  title: string;
  url: string;
  favicon?: string;
  category?: string;
  position: number;
  iconBgColor?: string;
  stickerStyle: string;
  rotation: number;
  revision: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmarkDocument>(
  {
    id: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    favicon: { type: String, default: '' },
    category: { type: String, default: 'General' },
    position: { type: Number, default: 0 },
    iconBgColor: { type: String, default: '#4285F4' },
    stickerStyle: { type: String, default: 'polaroid' },
    rotation: { type: Number, default: 0 },
    revision: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, id: 1 }, { unique: true });

export const BookmarkModel = mongoose.model<IBookmarkDocument>('Bookmark', BookmarkSchema);
