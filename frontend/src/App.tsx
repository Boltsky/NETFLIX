import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HomeCatalog, MediaItem, PlaybackProgress, WatchlistItem } from './types';
import { api } from './services/api';
import { FocusProvider, useFocus } from './components/focus/FocusContext';
import { NetflixSidebar, NetflixNavTab } from './components/common/NetflixSidebar';
import { ProfileSelector, NetflixProfile, BOLT_PROFILE } from './components/profile/ProfileSelector';
import { HeroBanner } from './components/home/HeroBanner';
import { ContentRail } from './components/home/ContentRail';
import { ContentDetails } from './components/details/ContentDetails';
import { VideoPlayer } from './components/player/VideoPlayer';
import { SearchScreen } from './components/search/SearchScreen';
import { WatchlistScreen } from './components/watchlist/WatchlistScreen';
import { CategoriesScreen } from './components/categories/CategoriesScreen';

const DEFAULT_PROFILE: NetflixProfile = BOLT_PROFILE;

type Screen = 'profiles' | 'home' | 'series' | 'movies' | 'popular' | 'watchlist' | 'categories' | 'search' | 'details' | 'player';

const ScreenFocusController: React.FC<{
  screen: Screen;
  lastFocusedSearchCardId?: string | null;
}> = ({ screen, lastFocusedSearchCardId }) => {
  const { setFocusedKey } = useFocus();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (screen === 'profiles') {
        setFocusedKey('profile-bolt');
      } else if (screen === 'home') {
        setFocusedKey('hero-play');
      } else if (screen === 'details') {
        setFocusedKey('detail-play');
      } else if (screen === 'search') {
        if (lastFocusedSearchCardId) {
          setFocusedKey(`search-card-${lastFocusedSearchCardId}`);
        } else {
          setFocusedKey('kb-Q');
        }
      } else if (screen === 'categories') {
        setFocusedKey('cat-pill-cat-trending');
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [screen, lastFocusedSearchCardId, setFocusedKey]);

  return null;
};

export const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<NetflixProfile>(DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<Screen>('profiles');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState<PlaybackProgress[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Search state lifted for persistence
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [lastFocusedSearchCardId, setLastFocusedSearchCardId] = useState<string | null>(null);

  // Selected media for details / player
  const [selectedTitle, setSelectedTitle] = useState<MediaItem | null>(null);
  const [playerTarget, setPlayerTarget] = useState<{
    item: MediaItem;
    season?: number;
    episode?: number;
  } | null>(null);

  // Load home catalog & progress for active profile
  const loadData = useCallback((profileId: string = activeProfile.id) => {
    setLoading(true);

    Promise.allSettled([
      api.getHomeCatalog(),
      api.getProgress(profileId),
      api.getWatchlist(profileId)
    ]).then(([catRes, progRes, watchRes]) => {
      if (catRes.status === 'fulfilled') {
        setCatalog(catRes.value);
      }
      if (progRes.status === 'fulfilled') {
        setProgressList(progRes.value);
      }
      if (watchRes.status === 'fulfilled') {
        setWatchlist(watchRes.value);
      }
      setLoading(false);
    });
  }, [activeProfile.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize progress and watchlist whenever active profile changes
  useEffect(() => {
    api.getProgress(activeProfile.id).then(setProgressList).catch(() => {});
    api.getWatchlist(activeProfile.id).then(setWatchlist).catch(() => {});
  }, [activeProfile.id]);

  // Global Back key handler
  useEffect(() => {
    const handleGlobalBack = (e: KeyboardEvent) => {
      if (e.key === 'Back' || e.key === 'Escape') {
        e.preventDefault();
        if (currentScreen === 'player') {
          // Handled inside VideoPlayer
        } else if (currentScreen === 'details') {
          setCurrentScreen(previousScreen);
        } else if (
          currentScreen === 'search' ||
          currentScreen === 'watchlist' ||
          currentScreen === 'series' ||
          currentScreen === 'movies' ||
          currentScreen === 'popular' ||
          currentScreen === 'categories' ||
          currentScreen === 'profiles'
        ) {
          setCurrentScreen('home');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalBack);
    return () => window.removeEventListener('keydown', handleGlobalBack);
  }, [currentScreen, previousScreen]);

  // Open Details Screen
  const handleOpenDetails = (item: MediaItem) => {
    setSelectedTitle(item);
    setPreviousScreen(currentScreen);
    setCurrentScreen('details');
  };

  // Launch Player
  const handleLaunchPlayer = (item: MediaItem, season?: number, episode?: number) => {
    setPlayerTarget({ item, season, episode });
    setCurrentScreen('player');
  };

  // Exit Player
  const handleExitPlayer = () => {
    setPlayerTarget(null);
    setCurrentScreen(selectedTitle ? 'details' : previousScreen);
    api.getProgress(activeProfile.id).then(setProgressList).catch(() => {});
  };

  // Continuous horizontal rail pagination
  const [railPages, setRailPages] = useState<Record<string, number>>({});
  const railLoadingRef = useRef<Record<string, boolean>>({});

  const handleRailNearEnd = useCallback(async (railId: string) => {
    if (railLoadingRef.current[railId]) return;

    const currentPage = railPages[railId] || 1;
    if (currentPage >= 25) return; // Cap at 25 pages (~500 items per rail) for deep catalog with TV memory safety

    railLoadingRef.current[railId] = true;
    const nextPage = currentPage + 1;

    const RAIL_CONFIG_MAP: Record<string, { category?: string; genreId?: number; type?: 'movie' | 'tv' | 'anime' }> = {
      'rail-trending_movies': { category: 'trending', type: 'movie' },
      'rail-popular_movies': { category: 'popular', type: 'movie' },
      'rail-popular_tv': { category: 'tv', type: 'tv' },
      'rail-popular_anime': { category: 'anime', type: 'anime' },
      'rail-new_releases': { category: 'new_releases', type: 'movie' },
      'rail-action_movies': { genreId: 28, type: 'movie' },
      'rail-scifi_movies': { genreId: 878, type: 'movie' },
      'rail-thriller_movies': { genreId: 53, type: 'movie' },
      'rail-comedy_movies': { genreId: 35, type: 'movie' },
      'rail-drama_movies': { genreId: 18, type: 'movie' },
      'rail-horror_movies': { genreId: 27, type: 'movie' },
      'rail-animation_movies': { genreId: 16, type: 'movie' },
      'rail-crime_movies': { genreId: 80, type: 'movie' },
      'rail-trending_tv': { category: 'tv', type: 'tv' }
    };

    const config = RAIL_CONFIG_MAP[railId] || { category: railId.replace('rail-', ''), type: 'movie' };

    try {
      const res = await api.getCategoryMovies({
        category: config.genreId ? undefined : config.category,
        genreId: config.genreId,
        type: config.type,
        page: nextPage
      });

      if (res && Array.isArray(res.results) && res.results.length > 0) {
        setCatalog((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rails: prev.rails.map((r) => {
              if (r.id === railId) {
                const existingIds = new Set(r.items.map((i) => i.id));
                const uniqueNew = res.results.filter((i) => !existingIds.has(i.id));
                return {
                  ...r,
                  items: [...r.items, ...uniqueNew]
                };
              }
              return r;
            })
          };
        });
        setRailPages((prev) => ({ ...prev, [railId]: nextPage }));
      }
    } catch (err) {
      console.warn(`[App] Failed to load more items for rail ${railId}:`, err);
    } finally {
      railLoadingRef.current[railId] = false;
    }
  }, [railPages]);

  // Watchlist Toggle
  const handleToggleWatchlist = async (item: MediaItem) => {
    const isSaved = watchlist.some((w) => w.contentId === item.id);
    if (isSaved) {
      await api.removeFromWatchlist(item.id, activeProfile.id);
      setWatchlist((prev) => prev.filter((w) => w.contentId !== item.id));
    } else {
      const added = await api.addToWatchlist({
        profileId: activeProfile.id,
        contentId: item.id,
        mediaType: item.type,
        title: item.title,
        poster: item.poster || item.backdrop,
        year: item.year,
        rating: item.rating
      });
      setWatchlist((prev) => [added, ...prev]);
    }
  };

  const isInWatchlist = (id: string) => watchlist.some((w) => w.contentId === id);

  // Map progress into percentage
  const progressMap: Record<string, number> = {};
  progressList.forEach((p) => {
    if (p.durationMs > 0) {
      progressMap[p.contentId] = Math.round((p.positionMs / p.durationMs) * 100);
    }
  });

  // Filter rails for tab views
  const filteredRails = (catalog?.rails || []).filter((r) => {
    if (r.id === 'rail-top-10' || r.category === 'top-10') return false;
    if (currentScreen === 'series') return r.type === 'tv' || r.type === 'anime';
    if (currentScreen === 'movies') return r.type === 'movie';
    if (currentScreen === 'popular') return r.category === 'trending' || r.category === 'popular';
    return true; // 'home'
  });

  // Continue Watching Rail with catalog poster & title enrichment
  const continueWatchingItems: MediaItem[] = progressList
    .filter((p) => {
      // Exclude invalid placeholder items with no duration, position, or poster
      if (p.durationMs === 0 && p.positionMs === 0 && (!p.poster || p.title === 'Untitled')) {
        return false;
      }
      return true;
    })
    .map((p) => {
      // Lookup from loaded catalog rails if poster or real title is missing
      const allCatalogItems = catalog?.rails?.flatMap((r) => r.items) || [];
      const matchedCatalogItem = allCatalogItems.find((item) => String(item.id) === String(p.contentId));
      const resolvedPoster = p.poster || matchedCatalogItem?.poster || matchedCatalogItem?.backdrop;
      const resolvedTitle = (p.title && p.title !== 'Untitled') ? p.title : (matchedCatalogItem?.title || p.title);

      return {
        id: p.contentId,
        title: resolvedTitle,
        type: p.mediaType,
        poster: resolvedPoster,
        backdrop: matchedCatalogItem?.backdrop
      };
    });

  // Top 10 Rail items
  const top10Items = catalog?.rails?.find((r) => r.category === 'top-10' || r.category === 'trending' || r.category === 'popular')?.items.slice(0, 10) || [];

  // When profile is chosen
  const handleSelectProfile = (profile: NetflixProfile) => {
    setActiveProfile(profile);
    setCurrentScreen('home');
  };

  return (
    <FocusProvider>
      <ScreenFocusController
        screen={currentScreen}
        lastFocusedSearchCardId={lastFocusedSearchCardId}
      />
      <div className="relative min-h-screen bg-[#141414] text-white">
        {/* SCREEN 0: Who's Watching? Profile Selection */}
        {currentScreen === 'profiles' && (
          <ProfileSelector onSelectProfile={handleSelectProfile} />
        )}

        {/* Netflix Left Sidebar Drawer (visible whenever logged in and not in full-screen player) */}
        {currentScreen !== 'profiles' && currentScreen !== 'player' && (
          <NetflixSidebar
            currentTab={
              currentScreen === 'details'
                ? (previousScreen as NetflixNavTab)
                : (currentScreen as NetflixNavTab)
            }
            onSelectTab={(tab) => setCurrentScreen(tab as Screen)}
            activeProfile={activeProfile}
            onSwitchProfile={() => setCurrentScreen('profiles')}
          />
        )}

        {/* SCREEN 1: Netflix Video Player */}
        {currentScreen === 'player' && playerTarget && (
          <VideoPlayer
            item={playerTarget.item}
            season={playerTarget.season}
            episode={playerTarget.episode}
            profileId={activeProfile.id}
            onExit={handleExitPlayer}
          />
        )}

        {/* SCREEN 2: Title Details */}
        {currentScreen === 'details' && selectedTitle && (
          <ContentDetails
            contentId={selectedTitle.id}
            mediaType={selectedTitle.type}
            onPlay={handleLaunchPlayer}
            onBack={() => setCurrentScreen(previousScreen)}
            isInWatchlist={isInWatchlist(selectedTitle.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectRelated={handleOpenDetails}
          />
        )}

        {/* SCREEN 3: Netflix Search */}
        {currentScreen === 'search' && (
          <div className="pl-18">
            <SearchScreen
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={searchResults}
              onResultsChange={setSearchResults}
              profileId={activeProfile.id}
              onSelectTitle={handleOpenDetails}
              onSelectCardFocus={(cardId) => setLastFocusedSearchCardId(cardId)}
              recommendedTitles={top10Items.length > 0 ? top10Items : (catalog?.rails?.[0]?.items || [])}
            />
          </div>
        )}

        {/* SCREEN 4: My List */}
        {currentScreen === 'watchlist' && (
          <div className="pl-18">
            <WatchlistScreen
              profileId={activeProfile.id}
              onSelectTitle={handleOpenDetails}
            />
          </div>
        )}

        {/* SCREEN 5: Categories & Genres Explorer */}
        {currentScreen === 'categories' && (
          <CategoriesScreen onSelectTitle={handleOpenDetails} />
        )}

        {/* SCREEN 6: Main TV Browsing (Home, Series, Movies, New & Popular) */}
        {(currentScreen === 'home' ||
          currentScreen === 'series' ||
          currentScreen === 'movies' ||
          currentScreen === 'popular') && (
          <main className="pb-24">
            {loading ? (
              <div className="h-[75vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {/* Hero Spotlight */}
                <HeroBanner
                  item={catalog?.hero || null}
                  onPlay={(item) => handleLaunchPlayer(item)}
                  onMoreInfo={handleOpenDetails}
                  isInWatchlist={catalog?.hero ? isInWatchlist(catalog.hero.id) : false}
                  onToggleWatchlist={handleToggleWatchlist}
                />

                {/* Content Rows */}
                <div className="relative z-20 -mt-10 space-y-3">
                  {/* Continue Watching Row (if any progress) */}
                  {continueWatchingItems.length > 0 && currentScreen === 'home' && (
                    <ContentRail
                      rail={{
                        id: 'rail-continue-watching',
                        title: `Continue Watching for ${activeProfile.name}`,
                        type: 'movie',
                        category: 'continue-watching',
                        items: continueWatchingItems
                      }}
                      onSelectItem={handleOpenDetails}
                      progressMap={progressMap}
                    />
                  )}

                  {/* Top 10 in TV & Movies Today (Iconic numbered row) */}
                  {top10Items.length > 0 && currentScreen === 'home' && (
                    <ContentRail
                      rail={{
                        id: 'rail-top-10',
                        title: 'Top 10 in Movies & TV Today',
                        type: 'movie',
                        category: 'top-10',
                        items: top10Items
                      }}
                      isTop10={true}
                      onSelectItem={handleOpenDetails}
                    />
                  )}

                  {/* Dynamic Rails */}
                  {filteredRails.map((rail) => (
                    <ContentRail
                      key={rail.id}
                      rail={rail}
                      onSelectItem={handleOpenDetails}
                      progressMap={progressMap}
                      onNearEnd={handleRailNearEnd}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        )}
      </div>
    </FocusProvider>
  );
};
