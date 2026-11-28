import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettingsDocument extends Document {
  userId: string;
  userName: string;
  searchProvider: string;
  theme: string;
  wallpaper: string;
  fontPreference: string;
  darkMode?: boolean;
  soundEffects: boolean;
  reducedMotion: boolean;
  animationIntensity: number;
  parallaxSensitivity: number;
  enableWeather: boolean;
  weatherLocation: string;
  workspaceSettings: {
    snapToGrid: boolean;
    showDecorativeElements: boolean;
    deskItemsVisible: boolean;
  };
  revision: number;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettingsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    userName: { type: String, default: 'Mufeed' },
    searchProvider: { type: String, default: 'google' },
    theme: { type: String, default: 'comic-studio' },
    wallpaper: { type: String, default: 'default' },
    fontPreference: { type: String, default: 'comic' },
    darkMode: { type: Boolean, default: false },
    soundEffects: { type: Boolean, default: true },
    reducedMotion: { type: Boolean, default: false },
    animationIntensity: { type: Number, default: 0.8 },
    parallaxSensitivity: { type: Number, default: 0.5 },
    enableWeather: { type: Boolean, default: true },
    weatherLocation: { type: String, default: 'San Francisco, CA' },
    workspaceSettings: {
      snapToGrid: { type: Boolean, default: false },
      showDecorativeElements: { type: Boolean, default: true },
      deskItemsVisible: { type: Boolean, default: true },
    },
    revision: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const UserSettingsModel = mongoose.model<IUserSettingsDocument>('UserSettings', UserSettingsSchema);
