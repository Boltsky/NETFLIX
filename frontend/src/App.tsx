import React, { useState, useEffect, useCallback } from 'react';
import { HomeCatalog, MediaItem, PlaybackProgress, WatchlistItem } from './types';
import { api } from './services/api';
import { FocusProvider, useFocus } from './components/focus/FocusContext';
import { NetflixSidebar, NetflixNavTab } from './components/common/NetflixSidebar';
import { ProfileSelector, NetflixProfile } from './components/profile/ProfileSelector';
import { HeroBanner } from './components/home/HeroBanner';
import { ContentRail } from './components/home/ContentRail';
import { ContentDetails } from './components/details/ContentDetails';
import { VideoPlayer } from './components/player/VideoPlayer';
import { SearchScreen } from './components/search/SearchScreen';
import { WatchlistScreen } from './components/watchlist/WatchlistScreen';

const DEFAULT_PROFILE: NetflixProfile = {
  id: 'p1',
  name: 'Alex',
  avatarBg: 'bg-[#E50914]'
};

type Screen = 'profiles' | 'home' | 'series' | 'movies' | 'popular' | 'watchlist' | 'categories' | 'search' | 'details' | 'player';

const ScreenFocusController: React.FC<{ screen: Screen }> = ({ screen }) => {
  const { setFocusedKey } = useFocus();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (screen === 'profiles') {
        setFocusedKey('profile-p1');
      } else if (screen === 'home') {
        setFocusedKey('hero-play');
      } else if (screen === 'details') {
        setFocusedKey('detail-play');
      } else if (screen === 'search') {
        setFocusedKey('search-char-A');
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [screen, setFocusedKey]);

  return null;
};

export const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<NetflixProfile>(DEFAULT_PROFILE);
  const [currentScreen, setCurrentScreen] = useState<Screen>('profiles');
  const [catalog, setCatalog] = useState<HomeCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState<PlaybackProgress[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Selected media for details / player
  const [selectedTitle, setSelectedTitle] = useState<MediaItem | null>(null);
  const [playerTarget, setPlayerTarget] = useState<{
    item: MediaItem;
    season?: number;
    episode?: number;
  } | null>(null);

  // Load home catalog & progress
  const loadData = useCallback(() => {
    setLoading(true);

    Promise.allSettled([
      api.getHomeCatalog(),
      api.getProgress(),
      api.getWatchlist()
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Back key handler
  useEffect(() => {
    const handleGlobalBack = (e: KeyboardEvent) => {
      if (e.key === 'Back' || e.key === 'Escape') {
        e.preventDefault();
        if (currentScreen === 'player') {
          // Handled inside VideoPlayer
        } else if (currentScreen === 'details') {
          setCurrentScreen('home');
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
  }, [currentScreen]);

  // Open Details Screen
  const handleOpenDetails = (item: MediaItem) => {
    setSelectedTitle(item);
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
    setCurrentScreen(selectedTitle ? 'details' : 'home');
    api.getProgress().then(setProgressList).catch(() => {});
  };

  // Watchlist Toggle
  const handleToggleWatchlist = async (item: MediaItem) => {
    const isSaved = watchlist.some((w) => w.contentId === item.id);
    if (isSaved) {
      await api.removeFromWatchlist(item.id);
      setWatchlist((prev) => prev.filter((w) => w.contentId !== item.id));
    } else {
      const added = await api.addToWatchlist({
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
    if (currentScreen === 'series') return r.type === 'tv' || r.type === 'anime';
    if (currentScreen === 'movies') return r.type === 'movie';
    if (currentScreen === 'popular') return r.category === 'trending' || r.category === 'popular';
    return true; // 'home'
  });

  // Continue Watching Rail
  const continueWatchingItems: MediaItem[] = progressList.map((p) => ({
    id: p.contentId,
    title: p.title,
    type: p.mediaType,
    poster: p.poster
  }));

  // Top 10 Rail items
  const top10Items = catalog?.rails?.find((r) => r.category === 'trending' || r.category === 'popular')?.items.slice(0, 10) || [];

  // When profile is chosen
  const handleSelectProfile = (profile: NetflixProfile) => {
    setActiveProfile(profile);
    setCurrentScreen('home');
  };

  return (
    <FocusProvider>
      <ScreenFocusController screen={currentScreen} />
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
                ? 'home'
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
            onExit={handleExitPlayer}
          />
        )}

        {/* SCREEN 2: Title Details */}
        {currentScreen === 'details' && selectedTitle && (
          <ContentDetails
            contentId={selectedTitle.id}
            mediaType={selectedTitle.type}
            onPlay={handleLaunchPlayer}
            onBack={() => setCurrentScreen('home')}
            isInWatchlist={isInWatchlist(selectedTitle.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectRelated={handleOpenDetails}
          />
        )}

        {/* SCREEN 3: Netflix Search */}
        {currentScreen === 'search' && (
          <div className="pl-18">
            <SearchScreen onSelectTitle={handleOpenDetails} />
          </div>
        )}

        {/* SCREEN 4: My List */}
        {currentScreen === 'watchlist' && (
          <div className="pl-18">
            <WatchlistScreen onSelectTitle={handleOpenDetails} />
          </div>
        )}

        {/* SCREEN 5: Main TV Browsing (Home, Series, Movies, New & Popular, Categories) */}
        {(currentScreen === 'home' ||
          currentScreen === 'series' ||
          currentScreen === 'movies' ||
          currentScreen === 'popular' ||
          currentScreen === 'categories') && (
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

                  {/* Dynamic Rails */}
                  {filteredRails.map((rail) => (
                    <ContentRail
                      key={rail.id}
                      rail={rail}
                      onSelectItem={handleOpenDetails}
                      progressMap={progressMap}
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
