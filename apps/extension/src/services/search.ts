import { SearchProvider } from '@littledesk/shared';

export interface SearchSuggestion {
  query: string;
}

export const SEARCH_PROVIDERS: Record<
  SearchProvider,
  {
    name: string;
    url: string;
    icon: string;
    placeholder: string;
  }
> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍',
    placeholder: 'Search with Google or enter URL...',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '🌐',
    placeholder: 'Search with Bing...',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆',
    placeholder: 'Search privately with DuckDuckGo...',
  },
};

export async function fetchSearchSuggestions(
  query: string,
  provider: SearchProvider = 'google'
): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // If query is an exact URL or looks like one, don't necessarily fetch suggestions
  if (/^https?:\/\//i.test(trimmed)) {
    return [trimmed];
  }

  try {
    // For DuckDuckGo suggestions
    if (provider === 'duckduckgo') {
      const response = await fetch(
        `https://duckduckgo.com/ac/?q=${encodeURIComponent(trimmed)}&type=list`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && Array.isArray(data[1])) {
          return data[1].slice(0, 6);
        }
      }
    }

    // Google suggestion endpoint supported in browser/extension
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(trimmed)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return (data[1] as string[]).slice(0, 6);
      }
    }
  } catch (err) {
    // Graceful fallback on network blockage or CORS in local dev
    console.debug('[Search] Suggestion fetch skipped or blocked, using heuristic completion');
  }

  // Fallback intelligent suggestions if offline or blocked
  const localFallbacks = [
    `${trimmed} tutorial`,
    `${trimmed} github`,
    `${trimmed} documentation`,
    `${trimmed} tips and tricks`,
  ];
  return localFallbacks.slice(0, 4);
}

export function performSearch(query: string, provider: SearchProvider = 'google') {
  const trimmed = query.trim();
  if (!trimmed) return;

  // If input is a direct URL or domain (e.g. "github.com" or "localhost:3000")
  if (/^https?:\/\//i.test(trimmed)) {
    window.location.href = trimmed;
    return;
  }
  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(:\d+)?(\/.*)?$/i.test(trimmed)) {
    window.location.href = `https://${trimmed}`;
    return;
  }

  const target = SEARCH_PROVIDERS[provider].url + encodeURIComponent(trimmed);
  window.location.href = target;
}
