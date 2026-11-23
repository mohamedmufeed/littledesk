import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Clock, Globe, Search, Trash2, X } from 'lucide-react';
import { SearchProvider } from '@littledesk/shared';
import { fetchSearchSuggestions, performSearch, SEARCH_PROVIDERS } from '../services/search.js';
import { sounds } from '../utils/sound.js';

interface SearchBarProps {
  provider: SearchProvider;
  recentSearches: string[];
  onProviderChange: (provider: SearchProvider) => void;
  onAddRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  provider,
  recentSearches,
  onProviderChange,
  onAddRecentSearch,
  onClearRecentSearches,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await fetchSearchSuggestions(query, provider);
      setSuggestions(results);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, provider]);

  // Global keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsProviderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (targetQuery?: string) => {
    const finalQuery = targetQuery !== undefined ? targetQuery : (selectedIndex >= 0 && suggestions[selectedIndex]) ? suggestions[selectedIndex] : query;
    if (!finalQuery.trim()) return;

    sounds.playComicClick();
    onAddRecentSearch(finalQuery.trim());
    setIsOpen(false);
    performSearch(finalQuery, provider);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const activeProvider = SEARCH_PROVIDERS[provider] || SEARCH_PROVIDERS.google;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto px-4 z-40 my-4">
      {/* Decorative Masking Tape on Top of Search Panel */}
      <div className="masking-tape h-4 w-32 mx-auto -mb-2 rotate-[-1deg] opacity-90 rounded-sm z-10" />

      {/* Main Physical Search Banner */}
      <div className="relative bg-white border-2 border-slate-900 rounded-xl shadow-comic p-1.5 transition-all focus-within:shadow-comicLg">
        <div className="flex items-center gap-2">
          {/* Provider Selector Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sounds.playComicClick();
                setIsProviderMenuOpen(!isProviderMenuOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-900 rounded-lg text-xs font-bold text-slate-800 transition-colors"
            >
              <span>{activeProvider.icon}</span>
              <span className="hidden sm:inline font-comic tracking-wide">{activeProvider.name}</span>
              <span className="text-[10px] text-slate-500">▼</span>
            </button>

            {/* Provider Dropdown Menu */}
            {isProviderMenuOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white border-2 border-slate-900 rounded-lg shadow-comic py-1.5 z-50">
                {(Object.keys(SEARCH_PROVIDERS) as SearchProvider[]).map((pKey) => {
                  const p = SEARCH_PROVIDERS[pKey];
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        sounds.playComicClick();
                        onProviderChange(pKey);
                        setIsProviderMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left font-bold transition-colors ${
                        provider === pKey ? 'bg-amber-100 text-slate-900' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                      {provider === pKey && <span className="ml-auto text-desk-comicRed font-extrabold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={activeProvider.placeholder}
              className="w-full bg-transparent px-2 py-1.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Submit Search Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="comic-btn bg-desk-comicBlue text-white font-comic px-3.5 py-1.5 rounded-lg text-sm flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Go</span>
          </button>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-900 rounded-xl shadow-comicLg overflow-hidden z-50 py-1">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSubmit(suggestion)}
                className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors ${
                  selectedIndex === idx ? 'bg-amber-100 text-slate-950 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>{suggestion}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches Tags Strip */}
      {recentSearches.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 mt-2.5 px-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-comic">
            <Clock className="w-3 h-3" />
            <span>Recent:</span>
          </div>
          {recentSearches.slice(0, 5).map((term, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(term);
                handleSubmit(term);
              }}
              className="bg-white/80 hover:bg-white border border-slate-900/30 text-slate-700 hover:text-slate-900 text-xs px-2.5 py-0.5 rounded-full font-medium transition-all shadow-sm hover:shadow"
            >
              {term}
            </button>
          ))}
          {recentSearches.length > 0 && (
            <button
              onClick={onClearRecentSearches}
              title="Clear recent searches"
              className="text-slate-400 hover:text-rose-600 text-xs p-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
