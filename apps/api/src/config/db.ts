import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (!ENV.MONGO_URI) {
    console.warn('[Database] No MONGO_URI provided. Running with in-memory sync support.');
    return false;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection skipped/unavailable: ${err.message}. Running fallback mode.`);
    isConnected = false;
    return false;
  }
}

export function getDbStatus(): boolean {
  return isConnected;
}
