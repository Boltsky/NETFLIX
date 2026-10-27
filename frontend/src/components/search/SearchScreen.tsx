import React, { useState, useEffect, useCallback } from 'react';
import { MediaItem } from '../../types';
import { api } from '../../services/api';
import { useFocusable } from '../focus/FocusContext';
import { Search as SearchIcon, Delete, CornerDownLeft, X, Film, Star } from 'lucide-react';

interface SearchScreenProps {
  onSelectTitle: (item: MediaItem) => void;
}

const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '0'],
  ['SPACE', 'BACKSPACE', 'CLEAR']
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectTitle }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      api.search(trimmed)
        .then((res) => {
          setResults(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Search error:', err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'SPACE') {
      setQuery((prev) => prev + ' ');
    } else if (key === 'BACKSPACE') {
      setQuery((prev) => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setQuery('');
    } else {
      setQuery((prev) => prev + key);
    }
  }, []);

  return (
    <div className="pt-24 pb-20 tv-safe-container min-h-screen text-white select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: TV Keyboard & Input */}
        <div className="lg:col-span-5 space-y-6">
          {/* Search Input Box */}
          <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-3 shadow-inner">
            <SearchIcon className="w-5 h-5 text-red-500 shrink-0" />
            <input
              type="text"
              readOnly
              value={query}
              placeholder="Search movies, series, genres..."
              className="w-full bg-transparent text-white font-medium placeholder-zinc-500 focus:outline-none text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* On-Screen Keyboard */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-2">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={`key-row-${rowIndex}`} className="flex space-x-2 justify-center">
                {row.map((char) => (
                  <KeyButton
                    key={`key-${char}`}
                    char={char}
                    onPress={() => handleKeyPress(char)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Search Results Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-300">
              {query ? `Results for "${query}"` : 'Recommended Titles'}
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {results.length} TITLES FOUND
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-red-600 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-zinc-500">Searching catalog...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[75vh] overflow-y-auto no-scrollbar p-1">
              {results.map((item, idx) => (
                <SearchResultCard
                  key={`search-res-${item.id}-${idx}`}
                  item={item}
                  index={idx}
                  onSelect={() => onSelectTitle(item)}
                />
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-20 text-center space-y-2">
              <Film className="w-12 h-12 text-zinc-700 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No matching titles found for "{query}".</p>
              <p className="text-xs text-zinc-500">Try searching by title or keyword.</p>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Use your TV remote to select letters and search the catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KeyButton: React.FC<{ char: string; onPress: () => void }> = ({ char, onPress }) => {
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
      className={`h-11 rounded-lg font-bold text-xs flex items-center justify-center transition-all tv-focusable ${
        isSpecial ? 'flex-1 px-3 bg-zinc-800 text-zinc-300' : 'w-11 bg-zinc-900 text-white'
      } ${isFocused ? 'tv-button-focused' : 'hover:bg-zinc-700'}`}
    >
      {char === 'SPACE' ? (
        'SPACE'
      ) : char === 'BACKSPACE' ? (
        <Delete className="w-4 h-4" />
      ) : char === 'CLEAR' ? (
        'CLEAR'
      ) : (
        char
      )}
    </button>
  );
};

const SearchResultCard: React.FC<{
  item: MediaItem;
  index: number;
  onSelect: () => void;
}> = ({ item, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `search-card-${item.id}-${index}`,
    groupId: 'search-results',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer tv-focusable ${
        isFocused ? 'tv-focused' : 'hover:scale-102'
      }`}
    >
      {item.poster ? (
        <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs text-center p-2">
          {item.title}
        </div>
      )}

      {item.rating && (
        <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 flex items-center">
          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
          {item.rating}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
        <p className="text-[9px] font-mono text-zinc-400">{item.year || item.type?.toUpperCase()}</p>
      </div>
    </div>
  );
};
