import {
  AuthResponse,
  Bookmark,
  Note,
  SyncPullResponse,
  SyncPushPayload,
  Task,
  UserSettings,
} from '@littledesk/shared';
import { storage } from './storage.js';

let customBaseUrl: string | null = null;

export const setApiBaseUrl = (url: string | null) => {
  if (url && url.trim()) {
    let clean = url.trim().replace(/\/$/, '');
    if (!clean.endsWith('/api')) {
      clean += '/api';
    }
    customBaseUrl = clean;
  } else {
    customBaseUrl = null;
  }
};

export const getApiBaseUrl = (): string => {
  if (customBaseUrl) return customBaseUrl;
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return 'http://localhost:5001/api';
};

export const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const { accessToken } = await storage.getAuthTokens();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }

    const data: AuthResponse = await res.json();
    await storage.setAuthTokens(data.tokens);
    await storage.setUserInfo(data.user);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
      throw new Error(err.message || 'Invalid email or password');
    }

    const data: AuthResponse = await res.json();
    await storage.setAuthTokens(data.tokens);
    await storage.setUserInfo(data.user);
    return data;
  }

  async logout(): Promise<void> {
    try {
      const { refreshToken } = await storage.getAuthTokens();
      if (refreshToken) {
        await fetch(`${getApiBaseUrl()}/auth/logout`, {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.setAuthTokens(null);
    }
  }

  async getMe(): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  }

  async pushSync(payload: SyncPushPayload): Promise<{ success: boolean; syncedAt: string }> {
    const res = await fetch(`${getApiBaseUrl()}/sync/push`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Push sync failed' }));
      throw new Error(err.message || 'Push sync failed');
    }
    return res.json();
  }

  async pullSync(lastSyncedAt?: string): Promise<SyncPullResponse> {
    const url = new URL(`${getApiBaseUrl()}/sync/pull`);
    if (lastSyncedAt) {
      url.searchParams.set('since', lastSyncedAt);
    }

    const res = await fetch(url.toString(), {
      headers: await this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Pull sync failed' }));
      throw new Error(err.message || 'Pull sync failed');
    }
    return res.json();
  }
}

export const api = new ApiService();
