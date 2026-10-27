import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaItem } from '../../types';
import { api } from '../../services/api';
import { useFocusable } from '../focus/FocusContext';
import {
  Search as SearchIcon,
  Delete,
  X,
  Film,
  Star,
  Clock,
  Trash2,
  TrendingUp,
  History
} from 'lucide-react';

export interface SearchScreenProps {
  onSelectTitle: (item: MediaItem) => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: MediaItem[];
  onResultsChange: (results: MediaItem[]) => void;
  profileId?: string;
  onSelectCardFocus?: (cardId: string) => void;
  recommendedTitles?: MediaItem[];
}

export const QWERTY_ROWS: Array<Array<{ key: string; label?: string; spanClass?: string }>> = [
  // Row 1: Numbers
  [
    { key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }, { key: '5' },
    { key: '6' }, { key: '7' }, { key: '8' }, { key: '9' }, { key: '0' }
  ],
  // Row 2: QWERTYUIOP
  [
    { key: 'Q' }, { key: 'W' }, { key: 'E' }, { key: 'R' }, { key: 'T' },
    { key: 'Y' }, { key: 'U' }, { key: 'I' }, { key: 'O' }, { key: 'P' }
  ],
  // Row 3: ASDFGHJKL
  [
    { key: 'A' }, { key: 'S' }, { key: 'D' }, { key: 'F' }, { key: 'G' },
    { key: 'H' }, { key: 'J' }, { key: 'K' }, { key: 'L' }
  ],
  // Row 4: ZXCVBNM
  [
    { key: 'Z' }, { key: 'X' }, { key: 'C' }, { key: 'V' }, { key: 'B' },
    { key: 'N' }, { key: 'M' }
  ],
  // Row 5: Actions
  [
    { key: 'SPACE', label: 'SPACE', spanClass: 'flex-[3]' },
    { key: 'BACKSPACE', label: '⌫', spanClass: 'flex-[1.5]' },
    { key: 'CLEAR', label: 'CLEAR', spanClass: 'flex-[1.5]' }
  ]
];

const HISTORY_STORAGE_PREFIX = 'cinewave_search_history';
const memoryStorage: Record<string, string> = {};

function storageGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStorage[key] || null;
}

function storageSet(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch {}
  memoryStorage[key] = val;
}

function storageRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStorage[key];
}

export function getSearchHistory(profileId: string = 'default'): string[] {
  try {
    const raw = storageGet(`${HISTORY_STORAGE_PREFIX}_${profileId}`) ||
                storageGet(HISTORY_STORAGE_PREFIX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSearchHistoryWord(word: string, profileId: string = 'default'): string[] {
  const trimmed = word.trim();
  if (trimmed.length < 2) return getSearchHistory(profileId);

  try {
    const existing = getSearchHistory(profileId);
    const filtered = existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 10);
    storageSet(`${HISTORY_STORAGE_PREFIX}_${profileId}`, JSON.stringify(updated));
    storageSet(HISTORY_STORAGE_PREFIX, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearSearchHistory(profileId: string = 'default'): void {
  storageRemove(`${HISTORY_STORAGE_PREFIX}_${profileId}`);
  storageRemove(HISTORY_STORAGE_PREFIX);
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectTitle,
  query,
  onQueryChange,
  results,
  onResultsChange,
  profileId = 'default',
  onSelectCardFocus,
  recommendedTitles = []
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => getSearchHistory(profileId));

  // Reload history when profile changes
  useEffect(() => {
    setHistory(getSearchHistory(profileId));
  }, [profileId]);

  // Debounced search when query changes
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      onResultsChange([]);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      api.search(trimmed)
        .then((res) => {
          onResultsChange(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Search error:', err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [query, onResultsChange]);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'SPACE') {
      onQueryChange(query + ' ');
    } else if (key === 'BACKSPACE') {
      onQueryChange(query.slice(0, -1));
    } else if (key === 'CLEAR') {
      onQueryChange('');
    } else {
      onQueryChange(query + key);
    }
  }, [query, onQueryChange]);

  const handleSelectHistory = useCallback((term: string) => {
    onQueryChange(term);
    const updated = saveSearchHistoryWord(term, profileId);
    setHistory(updated);
    setLoading(true);
    api.search(term)
      .then((res) => {
        onResultsChange(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onQueryChange, profileId, onResultsChange]);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory(profileId);
    setHistory([]);
  }, [profileId]);

  const handleSelectCard = useCallback((item: MediaItem) => {
    if (query.trim().length >= 2) {
      const updated = saveSearchHistoryWord(query.trim(), profileId);
      setHistory(updated);
    }
    if (onSelectCardFocus) {
      onSelectCardFocus(item.id);
    }
    onSelectTitle(item);
  }, [query, profileId, onSelectCardFocus, onSelectTitle]);

  return (
    <div className="pt-24 pb-20 tv-safe-container min-h-screen text-white select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: TV Keyboard & Search Input */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Input Box */}
          <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-3 shadow-inner">
            <SearchIcon className="w-5 h-5 text-[#E50914] shrink-0" />
            <input
              type="text"
              readOnly
              value={query}
              placeholder="Search movies, series, genres..."
              className="w-full bg-transparent text-white font-medium placeholder-zinc-500 focus:outline-none text-base"
            />
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="text-zinc-400 hover:text-white p-1"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Search History Chips (if any recent searches exist) */}
          {history.length > 0 && (
            <div className="space-y-1.5 px-0.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold px-1">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#E50914]" />
                  Recent Searches
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.slice(0, 5).map((term, i) => (
                  <HistoryChip
                    key={`quick-hist-${term}-${i}`}
                    term={term}
                    onSelect={() => handleSelectHistory(term)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Android TV QWERTY Keyboard */}
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-3 shadow-2xl space-y-1.5">
            {QWERTY_ROWS.map((row, rowIndex) => (
              <div key={`qwerty-row-${rowIndex}`} className="flex space-x-1.5 justify-center">
                {row.map((item) => (
                  <KeyButton
                    key={`kb-${item.key}`}
                    char={item.key}
                    label={item.label}
                    spanClass={item.spanClass}
                    onPress={() => handleKeyPress(item.key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Search Results / Recent Searches / Recommendations */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-200">
              {query ? `Results for "${query}"` : 'Browse Catalog & Recent Searches'}
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {query ? `${results.length} TITLES FOUND` : `${history.length} RECENT SEARCHES`}
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-[#E50914] border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-zinc-400">Searching catalog...</p>
            </div>
          ) : results.length > 0 ? (
            /* Active Results Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[75vh] overflow-y-auto no-scrollbar p-1">
              {results.map((item, idx) => (
                <SearchResultCard
                  key={`search-card-${item.id}`}
                  item={item}
                  index={idx}
                  onSelect={() => handleSelectCard(item)}
                />
              ))}
            </div>
          ) : query.trim() ? (
            /* No Results for Query */
            <div className="py-20 text-center space-y-2">
              <Film className="w-12 h-12 text-zinc-700 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">
                No matching titles found for "{query}".
              </p>
              <p className="text-xs text-zinc-500">Try searching by another title, actor, or genre.</p>
            </div>
          ) : (
            /* Default State: Recent Searches Grid & Recommended Content */
            <div className="space-y-6">
              {history.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                      Search History
                    </h4>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {history.map((term, i) => (
                      <HistoryCard
                        key={`history-card-${term}-${i}`}
                        term={term}
                        index={i}
                        onSelect={() => handleSelectHistory(term)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended / Trending Titles Row */}
              {recommendedTitles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#E50914]" />
                    Recommended for You
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {recommendedTitles.slice(0, 8).map((item, idx) => (
                      <SearchResultCard
                        key={`search-rec-${item.id}`}
                        item={item}
                        index={idx}
                        onSelect={() => handleSelectCard(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {history.length === 0 && recommendedTitles.length === 0 && (
                <div className="py-20 text-center text-zinc-500 text-sm">
                  Use your TV remote to select letters and search the catalog.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* TV QWERTY Key Button Component */
const KeyButton: React.FC<{
  char: string;
  label?: string;
  spanClass?: string;
  onPress: () => void;
}> = ({ char, label, spanClass, onPress }) => {
  const isSpecial = char === 'SPACE' || char === 'BACKSPACE' || char === 'CLEAR';
  const { ref, isFocused } = useFocusable({
    focusKey: `kb-${char}`,
    groupId: 'tv-keyboard',
    onEnter: onPress
  });

  return (
    <button
      ref={ref}
      onClick={onPress}
      className={`h-10 rounded font-bold text-xs flex items-center justify-center transition-all tv-focusable ${
        spanClass || 'flex-1 min-w-[28px] max-w-[44px]'
      } ${
        isSpecial
          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700/80 px-2'
          : 'bg-zinc-900 text-white border border-zinc-800'
      } ${isFocused ? 'tv-button-focused ring-2 ring-white scale-105' : 'hover:bg-zinc-700'}`}
    >
      {char === 'SPACE' ? (
        'SPACE'
      ) : char === 'BACKSPACE' ? (
        <span className="flex items-center gap-1">
          <Delete className="w-3.5 h-3.5" />
        </span>
      ) : char === 'CLEAR' ? (
        'CLEAR'
      ) : (
        label || char
      )}
    </button>
  );
};

/* Quick History Pill Chip Component */
const HistoryChip: React.FC<{
  term: string;
  onSelect: () => void;
}> = ({ term, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `hist-chip-${term}`,
    groupId: 'search-history-chips',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all tv-focusable ${
        isFocused
          ? 'bg-white text-black font-bold ring-2 ring-white scale-105'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      <Clock className="w-3 h-3 text-[#E50914]" />
      <span className="truncate max-w-[120px]">{term}</span>
    </button>
  );
};

/* Full Search History Card for Default Results Pane */
const HistoryCard: React.FC<{
  term: string;
  index: number;
  onSelect: () => void;
}> = ({ term, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `hist-card-${index}`,
    groupId: 'search-history-cards',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer transition-all tv-focusable ${
        isFocused ? 'tv-focused ring-2 ring-white bg-zinc-800' : 'hover:bg-zinc-800/80'
      }`}
    >
      <div className="flex items-center space-x-2.5 truncate">
        <Clock className="w-4 h-4 text-[#E50914] shrink-0" />
        <span className="text-xs font-bold text-white truncate">{term}</span>
      </div>
      <SearchIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
    </div>
  );
};

/* Search Result Poster Card */
const SearchResultCard: React.FC<{
  item: MediaItem;
  index: number;
  onSelect: () => void;
}> = ({ item, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `search-card-${item.id}`,
    groupId: 'search-results',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer tv-focusable transition-all duration-200 ${
        isFocused ? 'tv-focused ring-4 ring-white scale-105 z-10' : 'hover:scale-102'
      }`}
    >
      {item.poster ? (
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs text-center p-2 font-bold">
          {item.title}
        </div>
      )}

      {item.rating && (
        <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 flex items-center">
          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
          {item.rating}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
        <p className="text-[9px] font-mono text-zinc-400">{item.year || item.type?.toUpperCase()}</p>
      </div>
    </div>
  );
};
