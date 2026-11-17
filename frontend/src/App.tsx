import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HomeCatalog, MediaItem, PlaybackProgress, WatchlistItem, CatalogRail } from './types';
import { api } from './services/api';
import { FocusProvider, useFocus } from './components/focus/FocusContext';
import { NetflixSidebar, NetflixNavTab } from './components/common/NetflixSidebar';
import { NetflixMobileNav } from './components/common/NetflixMobileNav';
import { ProfileSelector, NetflixProfile, BOLT_PROFILE } from './components/profile/ProfileSelector';
import { HeroBanner } from './components/home/HeroBanner';
import { ContentRail } from './components/home/ContentRail';
import { ContentDetails } from './components/details/ContentDetails';
import { VideoPlayer } from './components/player/VideoPlayer';
import { SearchScreen } from './components/search/SearchScreen';
import { WatchlistScreen } from './components/watchlist/WatchlistScreen';
import { CategoriesScreen } from './components/categories/CategoriesScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { updateService } from './services/updateService';
import { getAppSettings } from './services/settingsService';
import { AppUpdateManifest, CURRENT_APP_VERSION } from './version';
import { UpdateModal } from './components/common/UpdateModal';

const DEFAULT_PROFILE: NetflixProfile = BOLT_PROFILE;

type Screen = 'profiles' | 'home' | 'series' | 'movies' | 'popular' | 'watchlist' | 'categories' | 'search' | 'details' | 'player' | 'settings';

const ScreenFocusController: React.FC<{
  screen: Screen;
  lastFocusedSearchCardId?: string | null;
}> = ({ screen, lastFocusedSearchCardId }) => {
  const { setFocusedKey } = useFocus();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (screen === 'profiles') {
        setFocusedKey('profile-bolt');
      } else if (screen === 'home' || screen === 'series' || screen === 'movies' || screen === 'popular') {
        window.scrollTo({ top: 0, behavior: 'auto' });
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
        window.scrollTo({ top: 0, behavior: 'auto' });
        setFocusedKey('cat-pill-cat-trending');
      } else if (screen === 'watchlist') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (screen === 'settings') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        setFocusedKey('settings-tab-updates');
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

  // App version control & update states
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateManifest | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  // Background GitHub update check on startup
  useEffect(() => {
    const settings = getAppSettings();
    if (!settings.updates.autoCheckOnLaunch) {
      return;
    }

    const checkTimer = setTimeout(() => {
      updateService
        .checkForAppUpdate(false)
        .then((manifest) => {
          if (manifest) {
            setAvailableUpdate(manifest);
            setShowUpdateModal(true);
          }
        })
        .catch(() => {});
    }, 2500);

    return () => clearTimeout(checkTimer);
  }, []);

  // Manual Check for Updates
  const handleManualCheckUpdate = async () => {
    setUpdateToast('Checking GitHub for updates...');
    try {
      const manifest = await updateService.checkForAppUpdate(true);
      if (manifest) {
        setAvailableUpdate(manifest);
        setShowUpdateModal(true);
        setUpdateToast(null);
      } else {
        setUpdateToast(`You're on the latest version (v${CURRENT_APP_VERSION.versionName})`);
        setTimeout(() => setUpdateToast(null), 3500);
      }
    } catch {
      setUpdateToast('Unable to check for updates right now.');
      setTimeout(() => setUpdateToast(null), 3500);
    }
  };

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

  // History state model for browser and mobile device navigation
  interface HistoryStateData {
    screen: Screen;
    item?: MediaItem;
    season?: number;
    episode?: number;
    previousScreen?: Screen;
  }

  const isPopstateNavigatingRef = useRef(false);

  // Navigate forward with history.pushState so mobile hardware/virtual back key works
  const navigateTo = useCallback((screen: Screen, data?: { item?: MediaItem; season?: number; episode?: number }) => {
    const prev = currentScreen !== 'details' && currentScreen !== 'player' ? currentScreen : previousScreen;

    const nextState: HistoryStateData = {
      screen,
      item: data?.item || (screen === 'details' ? selectedTitle || undefined : undefined),
      season: data?.season,
      episode: data?.episode,
      previousScreen: prev
    };

    let hash = `#/${screen}`;
    if (screen === 'details' && data?.item) {
      hash = `#/title/${data.item.id}`;
      setSelectedTitle(data.item);
      setPreviousScreen(prev);
    } else if (screen === 'player' && data?.item) {
      hash = `#/watch/${data.item.id}`;
      const isEpisodic = data.item.type === 'tv' || data.item.type === 'anime';
      setPlayerTarget({
        item: data.item,
        season: isEpisodic ? data.season : undefined,
        episode: isEpisodic ? data.episode : undefined
      });
    }

    try {
      window.history.pushState(nextState, '', hash);
    } catch (err) {
      console.warn('[Navigation] pushState failed:', err);
    }

    setCurrentScreen(screen);
  }, [currentScreen, previousScreen, selectedTitle]);

  // Navigate back using browser history or safe fallback
  const navigateBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state && window.history.length > 1) {
      window.history.back();
    } else {
      if (currentScreen === 'player') {
        setPlayerTarget(null);
        setCurrentScreen(selectedTitle ? 'details' : previousScreen);
      } else if (currentScreen === 'details') {
        setSelectedTitle(null);
        setCurrentScreen(previousScreen);
      } else if (currentScreen !== 'home') {
        setCurrentScreen('home');
      }
    }
  }, [currentScreen, previousScreen, selectedTitle]);

  // Mobile Device Back Key & Browser Popstate Navigation Listener
  useEffect(() => {
    // 1. Establish initial root history state if null
    if (!window.history.state) {
      const initialHash = window.location.hash || '#/profiles';
      window.history.replaceState({ screen: 'profiles' }, '', initialHash);
    }

    // 2. Parse initial hash on fresh load / direct link
    const initialHash = window.location.hash;
    if (initialHash && initialHash.startsWith('#/')) {
      const route = initialHash.slice(2);
      if (route.startsWith('title/')) {
        const id = route.split('/')[1];
        if (id) {
          api.getTitleDetails(id, 'movie').then((item) => {
            if (item) {
              setSelectedTitle(item);
              setCurrentScreen('details');
              window.history.replaceState({ screen: 'details', item }, '', initialHash);
            }
          }).catch(() => {});
        }
      } else if (route.startsWith('watch/')) {
        const id = route.split('/')[1];
        if (id) {
          api.getTitleDetails(id, 'movie').then((item) => {
            if (item) {
              setPlayerTarget({ item });
              setCurrentScreen('player');
              window.history.replaceState({ screen: 'player', item }, '', initialHash);
            }
          }).catch(() => {});
        }
      } else {
        const validScreens: Screen[] = ['home', 'series', 'movies', 'popular', 'watchlist', 'categories', 'search', 'settings'];
        if (validScreens.includes(route as Screen)) {
          setCurrentScreen(route as Screen);
          window.history.replaceState({ screen: route }, '', initialHash);
        }
      }
    }

    // 3. Popstate event listener: triggers whenever mobile phone back button is pressed
    const handlePopState = (e: PopStateEvent) => {
      isPopstateNavigatingRef.current = true;
      const state: HistoryStateData | null = e.state;

      if (!state || !state.screen) {
        setPlayerTarget(null);
        setSelectedTitle(null);
        setCurrentScreen('home');
        setTimeout(() => { isPopstateNavigatingRef.current = false; }, 50);
        return;
      }

      if (state.screen === 'player' && state.item) {
        setPlayerTarget({
          item: state.item,
          season: state.season,
          episode: state.episode
        });
        setCurrentScreen('player');
      } else if (state.screen === 'details' && state.item) {
        setPlayerTarget(null);
        setSelectedTitle(state.item);
        setCurrentScreen('details');
        if (state.previousScreen) {
          setPreviousScreen(state.previousScreen);
        }
      } else {
        setPlayerTarget(null);
        setSelectedTitle(null);
        setCurrentScreen(state.screen);
      }

      setTimeout(() => { isPopstateNavigatingRef.current = false; }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Back key handler (TV Remote D-Pad Escape/Back)
  useEffect(() => {
    const handleGlobalBack = (e: KeyboardEvent) => {
      if (e.key === 'Back' || e.key === 'Escape') {
        e.preventDefault();
        if (currentScreen === 'player') {
          // Handled inside VideoPlayer
        } else {
          navigateBack();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalBack);
    return () => window.removeEventListener('keydown', handleGlobalBack);
  }, [currentScreen, navigateBack]);

  // Open Details Screen
  const handleOpenDetails = useCallback((item: MediaItem) => {
    navigateTo('details', { item });
  }, [navigateTo]);

  // Launch Player
  const handleLaunchPlayer = useCallback((item: MediaItem, season?: number, episode?: number) => {
    navigateTo('player', { item, season, episode });
  }, [navigateTo]);

  useEffect(() => {
    (window as any).cinewavePlay = (id: string, title?: string, type: 'movie' | 'tv' = 'movie', season?: number, episode?: number) => {
      const isEpisodic = type === 'tv';
      handleLaunchPlayer(
        { id: String(id), title: title || 'Title', type },
        isEpisodic ? season : undefined,
        isEpisodic ? episode : undefined
      );
    };
    return () => {
      delete (window as any).cinewavePlay;
    };
  }, [handleLaunchPlayer]);

  // Exit Player
  const handleExitPlayer = useCallback(() => {
    api.getProgress(activeProfile.id).then(setProgressList).catch(() => {});
    navigateBack();
  }, [activeProfile.id, navigateBack]);

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
    if (!item || !item.id) return;
    const isSaved = (watchlist || []).some((w) => w && w.contentId === item.id);
    if (isSaved) {
      await api.removeFromWatchlist(item.id, activeProfile.id);
      setWatchlist((prev) => (prev || []).filter((w) => w && w.contentId !== item.id));
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
      setWatchlist((prev) => [added, ...(prev || []).filter(Boolean)]);
    }
  };

  const isInWatchlist = (id: string) => (watchlist || []).some((w) => w && w.contentId === id);

  // Map progress into percentage
  const progressMap: Record<string, number> = {};
  (progressList || []).forEach((p) => {
    if (p && p.contentId && p.durationMs > 0) {
      progressMap[p.contentId] = Math.round((p.positionMs / p.durationMs) * 100);
    }
  });

  // Filter rails for tab views (guarantee unique rail IDs)
  const filteredRails: CatalogRail[] = useMemo(() => {
    const seenRailIds = new Set<string>();
    return (catalog?.rails || []).filter((r) => {
      if (!r || !r.id) return false;
      if (seenRailIds.has(r.id)) return false;
      seenRailIds.add(r.id);

      if (r.id === 'rail-top-10' || r.category === 'top-10') return false;
      if (currentScreen === 'series') return r.type === 'tv' || r.type === 'anime';
      if (currentScreen === 'movies') return r.type === 'movie';
      if (currentScreen === 'popular') return r.category === 'trending' || r.category === 'popular';
      return true; // 'home'
    });
  }, [catalog?.rails, currentScreen]);

  // Continue Watching Rail with catalog poster & title enrichment and strict deduplication by contentId
  const continueWatchingItems: MediaItem[] = useMemo(() => {
    const seenContentIds = new Set<string>();
    const items: MediaItem[] = [];
    const allCatalogItems = catalog?.rails?.flatMap((r) => r.items) || [];

    for (const p of progressList || []) {
      if (!p || !p.contentId) continue;
      const cid = String(p.contentId);
      if (seenContentIds.has(cid)) continue;

      // Exclude invalid placeholder items with no duration, position, or poster
      if (p.durationMs === 0 && p.positionMs === 0 && (!p.poster || p.title === 'Untitled')) {
        continue;
      }
      seenContentIds.add(cid);

      // Lookup from loaded catalog rails if poster or real title is missing
      const matchedCatalogItem = allCatalogItems.find((item) => item && String(item.id) === cid);
      const resolvedPoster = p.poster || matchedCatalogItem?.poster || matchedCatalogItem?.backdrop;
      const resolvedTitle = (p.title && p.title !== 'Untitled') ? p.title : (matchedCatalogItem?.title || p.title);

      items.push({
        id: cid,
        title: resolvedTitle,
        type: p.mediaType,
        poster: resolvedPoster,
        backdrop: matchedCatalogItem?.backdrop
      });
    }

    return items;
  }, [progressList, catalog]);

  // Top 10 Rail items
  const top10Items = catalog?.rails?.find((r) => r.category === 'top-10' || r.category === 'trending' || r.category === 'popular')?.items.slice(0, 10) || [];

  // When profile is chosen
  const handleSelectProfile = (profile: NetflixProfile) => {
    setActiveProfile(profile);
    window.history.replaceState({ screen: 'home' }, '', '#/home');
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

        {/* Navigation (visible whenever logged in and not in full-screen player) */}
        {currentScreen !== 'profiles' && currentScreen !== 'player' && (
          <>
            {/* Desktop & TV Sidebar Drawer (Tablets, Laptops & TV D-Pad) */}
            <NetflixSidebar
              currentTab={
                currentScreen === 'details'
                  ? (previousScreen as NetflixNavTab)
                  : (currentScreen as NetflixNavTab)
              }
              onSelectTab={(tab) => navigateTo(tab as Screen)}
              activeProfile={activeProfile}
              onSwitchProfile={() => navigateTo('profiles')}
              hasUpdate={Boolean(availableUpdate)}
              onCheckUpdate={handleManualCheckUpdate}
              onOpenSettings={() => navigateTo('settings')}
              isSettingsActive={currentScreen === 'settings'}
            />

            {/* Mobile Top & Bottom Navigation Bars (< 768px) */}
            <NetflixMobileNav
              currentTab={
                currentScreen === 'details'
                  ? (previousScreen as NetflixNavTab)
                  : (currentScreen as NetflixNavTab)
              }
              onSelectTab={(tab) => navigateTo(tab as Screen)}
              activeProfile={activeProfile}
              onSwitchProfile={() => navigateTo('profiles')}
              onOpenSettings={() => navigateTo('settings')}
            />
          </>
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
            profileId={activeProfile.id}
            onPlay={handleLaunchPlayer}
            onBack={navigateBack}
            isInWatchlist={isInWatchlist(selectedTitle.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectRelated={handleOpenDetails}
          />
        )}

        {/* SCREEN 3: Netflix Search */}
        {currentScreen === 'search' && (
          <div className="md:pl-18 pl-0 pb-16 md:pb-0">
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
          <div className="md:pl-18 pl-0 pb-16 md:pb-0">
            <WatchlistScreen
              profileId={activeProfile.id}
              onSelectTitle={handleOpenDetails}
              onExplore={() => navigateTo('home')}
            />
          </div>
        )}

        {/* SCREEN 5: Categories & Genres Explorer */}
        {currentScreen === 'categories' && (
          <CategoriesScreen onSelectTitle={handleOpenDetails} />
        )}

        {/* SCREEN 6: Settings Screen */}
        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={navigateBack}
            onCheckUpdates={handleManualCheckUpdate}
          />
        )}

        {/* SCREEN 6: Main TV Browsing (Home, Series, Movies, New & Popular) */}
        {(currentScreen === 'home' ||
          currentScreen === 'series' ||
          currentScreen === 'movies' ||
          currentScreen === 'popular') && (
          <main className="pb-28 md:pb-24">
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
                  hasProgress={catalog?.hero ? Boolean(progressMap[catalog.hero.id]) : false}
                />

                {/* Content Rows */}
                <div className="relative z-20 mt-2 md:mt-4 space-y-5 md:space-y-7">
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

        {/* Update Notification Toast */}
        {updateToast && (
          <div className="fixed bottom-8 right-8 z-50 bg-[#181818]/95 border border-zinc-700 text-white px-5 py-3 rounded-md shadow-2xl flex items-center space-x-3 text-xs font-bold animate-fadeIn">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
            <span>{updateToast}</span>
          </div>
        )}

        {/* In-App Update Modal */}
        {showUpdateModal && availableUpdate && (
          <UpdateModal
            update={availableUpdate}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
      </div>
    </FocusProvider>
  );
};
