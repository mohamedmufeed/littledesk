import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Cloud,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { UserSettings } from '@littledesk/shared';
import { sounds } from '../utils/sound.js';

interface HeaderProps {
  settings: UserSettings;
  syncState: 'synced' | 'syncing' | 'offline' | 'error';
  user: any;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  onNewNote: () => void;
  onNewSheet: () => void;
  onManualSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  syncState,
  user,
  onOpenSettings,
  onOpenAccount,
  onNewNote,
  onNewSheet,
  onManualSync,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Greeting by hour
  const hour = currentTime.getHours();
  let greetingText = 'Good morning';
  if (hour >= 12 && hour < 17) greetingText = 'Good afternoon';
  if (hour >= 17) greetingText = 'Good evening';

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Greeting & Calendar Note Tag */}
      <div className="flex items-center gap-3.5">
        <div className="relative bg-white border-2 border-slate-900 rounded-lg px-4 py-2 shadow-comic rotate-[-1deg] transition-transform hover:rotate-0">
          {/* Mini push pin */}
          <div className="absolute -top-2 left-3 pushpin pushpin-red" />
          <h1 className="font-comic text-2xl sm:text-3xl tracking-wide text-slate-900 leading-tight">
            {greetingText},{' '}
            <span className="text-desk-comicRed underline decoration-wavy decoration-desk-comicYellow decoration-2">
              {user?.name || settings.userName || 'Mufeed'}
            </span>
            !
          </h1>
          <p className="font-handwritten text-sm text-slate-600 font-bold mt-0.5">
            📅 {formattedDate}
          </p>
        </div>

        {/* Live Clock Comic Badge */}
        <div className="hidden sm:flex items-center bg-[#FEF08A] border-2 border-slate-900 rounded-md px-3 py-1.5 shadow-comic rotate-[1.5deg]">
          <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
            ⏱️ {formattedTime}
          </span>
        </div>
      </div>

      {/* Right: Weather, Sync Status, Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* Weather Badge */}
        {settings.enableWeather && (
          <div className="flex items-center gap-1.5 bg-sky-100 border-2 border-slate-900 rounded-md px-2.5 py-1 text-xs font-bold shadow-comic">
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span className="text-slate-800">72°F Partly Sunny</span>
          </div>
        )}

        {/* Sync Status Button */}
        <button
          onClick={() => {
            sounds.playComicClick();
            onManualSync();
          }}
          title={`Status: ${syncState.toUpperCase()} - Click to sync`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border-2 border-slate-900 shadow-comic bg-white hover:bg-slate-50 transition-all active:translate-y-0.5"
        >
          {syncState === 'synced' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700">Synced</span>
            </>
          )}
          {syncState === 'syncing' && (
            <>
              <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
              <span className="text-sky-700">Syncing...</span>
            </>
          )}
          {syncState === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">Offline</span>
            </>
          )}
          {syncState === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-700">Sync Failed</span>
            </>
          )}
        </button>

        {/* Add To-Do Sheet Button */}
        <button
          onClick={() => {
            sounds.playPaperRustle();
            onNewSheet();
          }}
          className="comic-btn flex items-center gap-1.5 bg-white text-slate-900 font-comic font-bold tracking-wide px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-slate-50"
        >
          <ClipboardList className="w-4 h-4 text-desk-comicRed" />
          <span>New To-Do Sheet</span>
        </button>

        {/* Add Note Button */}
        <button
          onClick={() => {
            sounds.playPaperRustle();
            onNewNote();
          }}
          className="comic-btn flex items-center gap-1.5 bg-desk-comicYellow text-slate-950 font-comic font-bold tracking-wide px-3.5 py-1.5 rounded-md text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Note</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            sounds.playComicClick();
            onOpenSettings();
          }}
          aria-label="Settings"
          className="comic-btn p-1.5 bg-white text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Account Button */}
        <button
          onClick={() => {
            sounds.playComicClick();
            onOpenAccount();
          }}
          aria-label="Account"
          className="comic-btn p-1.5 bg-white text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer relative"
        >
          <UserIcon className="w-4 h-4" />
          {user && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
          )}
        </button>
      </div>
    </header>
  );
};
