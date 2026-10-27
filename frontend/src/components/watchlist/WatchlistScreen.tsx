import React, { useEffect, useState } from 'react';
import { WatchlistItem, MediaItem } from '../../types';
import { api } from '../../services/api';
import { useFocusable } from '../focus/FocusContext';
import { Bookmark, Film, Star } from 'lucide-react';

interface WatchlistScreenProps {
  onSelectTitle: (item: MediaItem) => void;
  profileId?: string;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({ onSelectTitle, profileId = 'bolt' }) => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getWatchlist(profileId)
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load watchlist:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [profileId]);

  return (
    <div className="pt-24 pb-20 tv-safe-container min-h-screen text-white select-none space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
        <Bookmark className="w-6 h-6 text-red-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">My List</h1>
          <p className="text-xs text-zinc-400">Your personalized saved movies and series.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-red-600 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Loading your saved titles...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {items.map((item, idx) => (
            <WatchlistCard
              key={`watchlist-${item.contentId}-${idx}`}
              item={item}
              index={idx}
              onSelect={() => onSelectTitle({
                id: item.contentId,
                title: item.title,
                type: item.mediaType,
                poster: item.poster,
                year: item.year,
                rating: item.rating
              })}
            />
          ))}
        </div>
      ) : (
        <div className="py-28 text-center space-y-3 max-w-md mx-auto">
          <Film className="w-16 h-16 text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold text-zinc-300">Your list is currently empty</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Explore trending movies and popular TV series on the Home screen and select "Add to My List" to bookmark your favorites here.
          </p>
        </div>
      )}
    </div>
  );
};

const WatchlistCard: React.FC<{
  item: WatchlistItem;
  index: number;
  onSelect: () => void;
}> = ({ item, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `watchlist-card-${item.contentId}-${index}`,
    groupId: 'watchlist-grid',
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
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center">
          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
          {item.rating}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-xs font-bold text-white truncate">{item.title}</p>
        <p className="text-[10px] font-mono text-zinc-400 uppercase">{item.mediaType}</p>
      </div>
    </div>
  );
};
