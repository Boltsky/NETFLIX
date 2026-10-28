import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusable, useFocus } from '../focus/FocusContext';
import { MediaItem, GenreCategory } from '../../types';
import { api } from '../../services/api';
import { Flame, Film, Tv, Zap, Rocket, Skull, Laugh, Ghost, Sparkles, Heart, ShieldAlert, Compass, Globe, Award, HelpCircle } from 'lucide-react';

const GENRE_CATEGORIES: Array<GenreCategory & { icon: any }> = [
  { id: 'cat-trending', label: 'Trending Now', category: 'trending', icon: Flame },
  { id: 'cat-popular', label: 'Popular Movies', category: 'popular', icon: Film },
  { id: 'cat-tv', label: 'TV Shows', category: 'tv', type: 'tv', icon: Tv },
  { id: 'cat-action', label: 'Action & Adventure', category: 'action', genreId: 28, icon: Zap },
  { id: 'cat-scifi', label: 'Sci-Fi & Fantasy', category: 'scifi', genreId: 878, icon: Rocket },
  { id: 'cat-thriller', label: 'Thrillers & Suspense', category: 'thriller', genreId: 53, icon: Skull },
  { id: 'cat-comedy', label: 'Comedy', category: 'comedy', genreId: 35, icon: Laugh },
  { id: 'cat-horror', label: 'Horror', category: 'horror', genreId: 27, icon: Ghost },
  { id: 'cat-animation', label: 'Animation', category: 'animation', genreId: 16, icon: Sparkles },
  { id: 'cat-drama', label: 'Drama', category: 'drama', genreId: 18, icon: Compass },
  { id: 'cat-romance', label: 'Romance', category: 'romance', genreId: 10749, icon: Heart },
  { id: 'cat-crime', label: 'Crime', category: 'crime', genreId: 80, icon: ShieldAlert },
  { id: 'cat-adventure', label: 'Adventure', category: 'adventure', genreId: 12, icon: Globe },
  { id: 'cat-mystery', label: 'Mystery', category: 'mystery', genreId: 9648, icon: HelpCircle },
  { id: 'cat-documentary', label: 'Documentaries', category: 'documentary', genreId: 99, icon: Award },
  { id: 'cat-family', label: 'Family & Kids', category: 'family', genreId: 10751, icon: Laugh }
];

const COLS = 5;
const MAX_LOADED_ITEMS = 500; // Protection against OOM on Android TV while providing deep continuous catalog

interface CategoriesScreenProps {
  onSelectTitle: (item: MediaItem) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onSelectTitle }) => {
  const [selectedCat, setSelectedCat] = useState<GenreCategory>(GENRE_CATEGORIES[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { setFocusedKey } = useFocus();
  const loadingMoreRef = useRef(false);
  loadingMoreRef.current = loadingMore;
  const pageRef = useRef(page);
  pageRef.current = page;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  // Load next page function
  const loadNextPage = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    if (items.length >= MAX_LOADED_ITEMS) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    api.getCategoryMovies({
      category: selectedCat.genreId ? undefined : selectedCat.category,
      genreId: selectedCat.genreId,
      type: selectedCat.type,
      page: nextPage
    })
      .then((res) => {
        const nextResults = res.results || [];
        if (nextResults.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const uniqueNew = nextResults.filter((i) => !existingIds.has(i.id));
            return [...prev, ...uniqueNew];
          });
          setPage(nextPage);
          setHasMore(res.page < res.totalPages && items.length + nextResults.length < MAX_LOADED_ITEMS);
        }
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error('[CategoriesScreen] Failed to load more movies:', err);
        setLoadingMore(false);
      });
  }, [selectedCat, items.length]);

  // Initial load or category change: Fetch Page 1 and Page 2 in parallel for instant rich catalog
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setHasMore(true);

    const queryParamsP1 = {
      category: selectedCat.genreId ? undefined : selectedCat.category,
      genreId: selectedCat.genreId,
      type: selectedCat.type,
      page: 1
    };

    const queryParamsP2 = {
      ...queryParamsP1,
      page: 2
    };

    Promise.all([
      api.getCategoryMovies(queryParamsP1),
      api.getCategoryMovies(queryParamsP2).catch(() => null)
    ])
      .then(([res1, res2]) => {
        if (!isMounted) return;
        const p1Results = res1?.results || [];
        const p2Results = res2?.results || [];
        const combined = [...p1Results];
        const existingIds = new Set(p1Results.map((i) => i.id));

        for (const item of p2Results) {
          if (!existingIds.has(item.id)) {
            combined.push(item);
            existingIds.add(item.id);
          }
        }

        setItems(combined);
        setTotalCount(res1?.totalResults || (combined.length * 10));
        const activePage = p2Results.length > 0 ? 2 : 1;
        setPage(activePage);
        setHasMore(combined.length > 0 && activePage < (res1?.totalPages || 100));
        setLoading(false);
      })
      .catch((err) => {
        console.error('[CategoriesScreen] Failed to load category movies:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCat]);

  // Window scroll listener: Trigger continuous loading when near the bottom of document
  useEffect(() => {
    const handleScroll = () => {
      const scrollRemaining = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
      if (scrollRemaining < 800) {
        loadNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadNextPage]);

  return (
    <div className="relative min-h-screen bg-[#141414] text-white pl-24 pr-8 pt-8 pb-28 select-none">
      {/* Category Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-black tracking-widest text-[#E50914] uppercase">Netflix Explore</span>
          <span className="text-xs text-zinc-500 font-mono">•</span>
          <span className="text-xs text-zinc-400 font-mono">
            {totalCount > 0 ? `${totalCount}+ Titles Available` : 'Continuous Catalog'}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center space-x-3">
          <span>Categories & Genres</span>
          <span className="text-lg md:text-xl font-normal text-zinc-400">({selectedCat.label})</span>
        </h1>
      </div>

      {/* Top Genre Filter Pill Rail */}
      <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-2 mb-8">
        {GENRE_CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCat.id === cat.id;
          return (
            <CategoryPill
              key={cat.id}
              category={cat}
              index={idx}
              isSelected={isSelected}
              onSelect={() => {
                if (selectedCat.id !== cat.id) {
                  setSelectedCat(cat);
                  setFocusedKey(`cat-pill-${cat.id}`);
                }
              }}
            />
          );
        })}
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
            Loading {selectedCat.label}...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item, index) => {
              // Trigger pre-fetch 10 items early (2 full rows before end)
              const isNearEnd = index >= Math.max(0, items.length - 10);
              const isLastRow = index >= items.length - COLS;

              return (
                <CategoryMovieCard
                  key={`cat-card-${item.id}-${index}`}
                  item={item}
                  index={index}
                  categoryId={selectedCat.id}
                  isLastRow={isLastRow}
                  onSelect={onSelectTitle}
                  onNearEnd={isNearEnd ? loadNextPage : undefined}
                  onBottomDown={loadNextPage}
                />
              );
            })}
          </div>

          {/* Continuous Loading Footer / Indicator at End of Grid */}
          {loadingMore && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center space-x-3 bg-zinc-900/90 px-6 py-3 rounded-full border border-zinc-700/70 shadow-2xl backdrop-blur-md">
                <div className="w-5 h-5 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
                <span className="text-xs font-bold text-zinc-200">
                  Loading more {selectedCat.label} movies...
                </span>
              </div>
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                You've reached the end of {selectedCat.label} ({items.length} titles loaded)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CategoryPillProps {
  category: GenreCategory & { icon: any };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ category, isSelected, onSelect }) => {
  const Icon = category.icon;
  const { ref, isFocused } = useFocusable({
    focusKey: `cat-pill-${category.id}`,
    groupId: 'cat-pills',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all tv-focusable ${
        isFocused
          ? 'bg-white text-black scale-105 shadow-lg shadow-white/10 ring-2 ring-white'
          : isSelected
          ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/20'
          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${isFocused ? 'text-black' : isSelected ? 'text-white' : 'text-zinc-400'}`} />
      <span>{category.label}</span>
    </button>
  );
};

interface CategoryMovieCardProps {
  item: MediaItem;
  index: number;
  categoryId: string;
  isLastRow?: boolean;
  onSelect: (item: MediaItem) => void;
  onNearEnd?: () => void;
  onBottomDown?: () => void;
}

const CategoryMovieCard: React.FC<CategoryMovieCardProps> = ({
  item,
  index,
  categoryId,
  isLastRow = false,
  onSelect,
  onNearEnd,
  onBottomDown
}) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `cat-card-${categoryId}-${item.id}-${index}`,
    groupId: 'cat-grid',
    onEnter: () => onSelect(item)
  });

  // When this card is focused, if near end of grid, trigger continuous loading
  useEffect(() => {
    if (isFocused && onNearEnd) {
      onNearEnd();
    }
  }, [isFocused, onNearEnd]);

  // Keep focused card centered comfortably
  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [isFocused]);

  const posterUrl = item.poster || item.backdrop;

  return (
    <div
      ref={ref}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' && isLastRow && onBottomDown) {
          onBottomDown();
        }
      }}
      className={`group relative aspect-[2/3] rounded-[4px] overflow-hidden bg-zinc-900 border transition-all duration-200 cursor-pointer tv-focusable ${
        isFocused
          ? 'scale-105 border-[#E50914] ring-2 ring-[#E50914] z-20 shadow-xl shadow-black/80'
          : 'border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900">
          <Film className="w-8 h-8 text-zinc-600 mb-2" />
          <span className="text-xs font-bold text-zinc-400 line-clamp-2">{item.title}</span>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-2 left-2 flex items-center space-x-1.5">
        {item.type && (
          <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-[2px] bg-black/70 backdrop-blur-sm text-zinc-300 border border-white/10">
            {item.type === 'tv' ? 'SERIES' : 'FILM'}
          </span>
        )}
      </div>

      {item.rating && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 rounded-[2px] bg-black/70 backdrop-blur-sm text-[10px] font-bold text-amber-400 border border-amber-500/20">
          <span>★</span>
          <span>{item.rating}</span>
        </div>
      )}

      {/* Bottom Gradient Overlay & Title */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-6 flex flex-col justify-end">
        <h3 className="text-xs font-bold text-white line-clamp-1">{item.title}</h3>
        <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-0.5">
          {item.year && <span>{item.year}</span>}
          <span className="text-emerald-400 font-bold">98% Match</span>
        </div>
      </div>
    </div>
  );
};
