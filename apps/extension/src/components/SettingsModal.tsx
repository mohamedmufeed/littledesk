import React, { useEffect, useState } from 'react';
import {
  Cloud,
  Check,
  Eye,
  KeyRound,
  LogIn,
  LogOut,
  Palette,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Type,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { SearchProvider, UserSettings, WallpaperTheme } from '@littledesk/shared';
import { api, getApiBaseUrl, setApiBaseUrl } from '../services/api.js';
import { storage } from '../services/storage.js';
import { sounds } from '../utils/sound.js';

interface SettingsModalProps {
  settings: UserSettings;
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetDefaults: () => void;
  onAuthSuccess: (user: any) => void;
  onLogout: () => void;
  onManualSync: () => void;
  syncState: 'synced' | 'syncing' | 'offline' | 'error';
}

const WALLPAPER_THEMES: { id: WallpaperTheme; name: string; previewClass: string; desc: string }[] = [
  {
    id: 'comic-studio',
    name: 'Comic Studio Desk',
    previewClass: 'bg-[#F6F1EA] graph-paper-pattern',
    desc: 'Cutting mat grid with warm cream paper and subtle ink accents.',
  },
  {
    id: 'vintage-corkboard',
    name: 'Vintage Pinboard',
    previewClass: 'corkboard-pattern',
    desc: 'Classic natural corkboard texture for a physical wall feel.',
  },
  {
    id: 'pastel-grid',
    name: 'Pastel Grid Paper',
    previewClass: 'bg-[#FDFBF7] graph-paper-pattern',
    desc: 'Soft minimal graph paper with gentle pastel highlights.',
  },
  {
    id: 'blueprint-desk',
    name: 'Architect Blueprint',
    previewClass: 'bg-[#1E3A5F] text-white',
    desc: 'Technical draft blueprint deep blue with white guidelines.',
  },
  {
    id: 'kraft-paper',
    name: 'Kraft Cardboard',
    previewClass: 'bg-[#E5D3B3]',
    desc: 'Earthy organic craft paper texture with fibrous warmth.',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  user,
  onClose,
  onUpdateSettings,
  onResetDefaults,
  onAuthSuccess,
  onLogout,
  onManualSync,
  syncState,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'general'>('appearance');

  // Auth form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Custom Cloud Server URL
  const [serverUrl, setServerUrl] = useState('');
  const [serverSavedMsg, setServerSavedMsg] = useState('');

  useEffect(() => {
    storage.getCustomApiUrl().then((saved) => {
      setServerUrl(saved || getApiBaseUrl());
    });
  }, [isOpen]);

  const handleSaveServerUrl = async () => {
    sounds.playPaperRustle();
    await storage.saveCustomApiUrl(serverUrl);
    setApiBaseUrl(serverUrl);
    setServerSavedMsg('Saved! Testing connection...');
    setTimeout(() => {
      onManualSync();
      setServerSavedMsg('');
    }, 1200);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isRegistering) {
        const res = await api.register(authName, authEmail, authPassword);
        onAuthSuccess(res.user);
      } else {
        const res = await api.login(authEmail, authPassword);
        onAuthSuccess(res.user);
      }
      sounds.playComicClick();
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-900 rounded-xl shadow-comicLg p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Masking tape on top */}
        <div className="masking-tape h-4 w-32 mx-auto -mt-8 mb-3 opacity-90 rounded-sm" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-comic text-2xl text-slate-900 font-bold">
              ⚙️ DESK SETTINGS
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playComicClick();
              onClose();
            }}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              sounds.playComicClick();
              setActiveTab('appearance');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-bold tracking-wide transition-all ${
              activeTab === 'appearance'
                ? 'bg-desk-comicYellow text-slate-950 border-2 border-slate-900 shadow-comicPressed'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Wallpaper</span>
          </button>

          <button
            onClick={() => {
              sounds.playComicClick();
              setActiveTab('account');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-bold tracking-wide transition-all ${
              activeTab === 'account'
                ? 'bg-desk-comicYellow text-slate-950 border-2 border-slate-900 shadow-comicPressed'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Sync</span>
          </button>

          <button
            onClick={() => {
              sounds.playComicClick();
              setActiveTab('general');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-comic font-bold tracking-wide transition-all ${
              activeTab === 'general'
                ? 'bg-desk-comicYellow text-slate-950 border-2 border-slate-900 shadow-comicPressed'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block font-comic text-sm font-bold text-slate-800 mb-2">
                  Desk Wallpaper & Material:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WALLPAPER_THEMES.map((th) => (
                    <div
                      key={th.id}
                      onClick={() => {
                        sounds.playComicClick();
                        onUpdateSettings({ theme: th.id });
                      }}
                      className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                        settings.theme === th.id
                          ? 'border-slate-900 shadow-comic bg-amber-50/50'
                          : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <div className={`h-12 w-full rounded-md border border-slate-900/20 mb-2 ${th.previewClass}`} />
                      <div className="flex items-center justify-between">
                        <span className="font-comic text-xs font-bold text-slate-900">
                          {th.name}
                        </span>
                        {settings.theme === th.id && (
                          <span className="text-desk-comicRed font-black text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{th.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Preference */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block font-comic text-sm font-bold text-slate-800 mb-2">
                  Typography Style:
                </label>
                <div className="flex items-center gap-3">
                  {(['comic', 'handwritten', 'sans'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        sounds.playComicClick();
                        onUpdateSettings({ fontPreference: font });
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-bold capitalize transition-all ${
                        settings.fontPreference === font
                          ? 'border-slate-900 bg-white shadow-comic text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {font === 'comic' && 'Comic Neue & Bangers'}
                      {font === 'handwritten' && 'Caveat Handwritten'}
                      {font === 'sans' && 'Inter Clean Sans'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT & CLOUD SYNC */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Sync Status Banner */}
              <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-sky-600" />
                    <span className="font-comic text-base font-bold text-slate-900">
                      Cloud Synchronization
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Multi-device sync with revisions, conflict-resolution, and local-first offline storage.
                  </p>
                </div>
                <button
                  onClick={() => {
                    sounds.playComicClick();
                    onManualSync();
                  }}
                  className="comic-btn bg-white hover:bg-slate-50 text-slate-900 font-comic text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>

              {/* Custom Cloud Server URL config */}
              <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 shadow-xs">
                <label className="block font-comic text-xs font-bold text-slate-800 mb-1">
                  🌐 Backend Cloud API URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="https://your-api.onrender.com/api or http://localhost:5001/api"
                    className="flex-1 bg-slate-50 border border-slate-900/40 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    className="comic-btn bg-desk-comicYellow text-slate-950 font-comic text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Save URL
                  </button>
                </div>
                {serverSavedMsg && (
                  <p className="text-[11px] font-comic font-bold text-emerald-600 mt-1">{serverSavedMsg}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-1 font-comic">
                  Default: <span className="font-mono">http://localhost:5001/api</span> • When hosted on Render, Railway, etc., paste your cloud URL here.
                </p>
              </div>

              {/* User Account Details or Login/Register Form */}
              {user ? (
                <div className="bg-emerald-50 border-2 border-emerald-800/40 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-comic text-sm font-bold text-emerald-950">
                        Signed in as {user.name}
                      </p>
                      <p className="text-xs text-emerald-800">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playComicClick();
                        onLogout();
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="bg-white border-2 border-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-comic text-sm font-bold text-slate-900">
                      {isRegistering ? 'Create LittleDesk Cloud Account' : 'Log In to Sync Across Devices'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-xs text-desk-comicBlue font-bold hover:underline"
                    >
                      {isRegistering ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                  </div>

                  {authError && (
                    <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs p-2 rounded">
                      {authError}
                    </div>
                  )}

                  {isRegistering && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Mufeed"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="mufeed@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full comic-btn bg-desk-comicYellow text-slate-950 font-comic font-bold py-2 rounded-lg text-sm mt-2 flex items-center justify-center gap-1.5"
                  >
                    {isRegistering ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{authLoading ? 'Authenticating...' : isRegistering ? 'Create Account' : 'Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: GENERAL PREFERENCES */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-comic text-sm font-bold text-slate-900 block">
                    Paper & Comic Sound Effects
                  </span>
                  <span className="text-xs text-slate-500">
                    Tactile synthesized audio clicks, paper rustles, and checkmark feedback.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.soundEffects;
                    sounds.setEnabled(nextVal);
                    if (nextVal) sounds.playComicClick();
                    onUpdateSettings({ soundEffects: nextVal });
                  }}
                  className={`p-2 rounded-lg border-2 ${
                    settings.soundEffects ? 'bg-amber-100 border-slate-900 text-slate-900' : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                >
                  {settings.soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-comic text-sm font-bold text-slate-900 block">
                    Reduced Motion
                  </span>
                  <span className="text-xs text-slate-500">
                    Disables parallax tilt and entrance animations for minimal movement.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </div>

              {/* Decorative Stickers Toggle */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-comic text-sm font-bold text-slate-900 block">
                    Show Decorative Comic Artwork
                  </span>
                  <span className="text-xs text-slate-500">
                    Polaroids, speech bubbles, pencil stamps, and coffee ring details.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.workspaceSettings?.showDecorativeElements !== false}
                  onChange={(e) =>
                    onUpdateSettings({
                      workspaceSettings: {
                        ...settings.workspaceSettings,
                        showDecorativeElements: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-amber-500"
                />
              </div>

              {/* Reset Defaults */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all desk settings, notes, and shortcuts to original defaults?')) {
                      sounds.playComicClick();
                      onResetDefaults();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Desk to Original Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
