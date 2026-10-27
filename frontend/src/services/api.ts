import {
  HomeCatalog,
  TitleDetails,
  Episode,
  PlaybackResolution,
  MediaItem,
  WatchlistItem,
  PlaybackProgress
} from '../types';
import { MOCK_HOME_CATALOG, MOCK_TITLES, MOCK_SEASONS } from './mock.data';

declare global {
  interface Window {
    CINEWAVE_BACKEND_URL?: string;
  }
}

function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined' && window.CINEWAVE_BACKEND_URL) {
    return window.CINEWAVE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'appassets.androidplatform.net') {
      return ''; // Intercepted and proxied natively by MainActivity
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:8080`;
    }
  }
  return '';
}

const BASE_URL = getBackendBaseUrl();
console.log(`[CineWave API] Using Backend Base: "${BASE_URL}"`);

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      throw new Error(`API HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[CineWave API] Error calling ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Catalog
  async getHomeCatalog(): Promise<HomeCatalog> {
    try {
      const res = await apiFetch<{ success: boolean; data: HomeCatalog }>('/catalog/home');
      if (res && res.data) return res.data;
      return MOCK_HOME_CATALOG;
    } catch {
      console.warn('[Netflix API] Falling back to offline home catalog');
      return MOCK_HOME_CATALOG;
    }
  },

  async search(query: string): Promise<MediaItem[]> {
    const q = query.trim();
    if (!q) return [];
    try {
      const res = await apiFetch<{ success: boolean; results: MediaItem[] }>(`/catalog/search?q=${encodeURIComponent(q)}`);
      if (res && Array.isArray(res.results) && res.results.length > 0) {
        return res.results;
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local search failed, attempting direct FrameX failover:', err?.message);
    }

    // Direct FrameXTV search fallback across backends
    const backends = [
      'https://api.framextv.tech',
      'https://api.framextv.cc',
      'https://api.framextv.pro',
      'https://api.framextv.xyz'
    ];
    for (const b of backends) {
      try {
        const directRes = await fetch(`${b}/api/search?q=${encodeURIComponent(q)}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && data.success && Array.isArray(data.results) && data.results.length > 0) {
            return data.results.map((r: any) => ({
              id: String(r.id),
              title: r.title || r.name || 'Untitled',
              type: (r.type === 'tv' || r.type === 'anime') ? r.type : 'movie',
              rating: r.rating ? String(r.rating) : (r.vote_average ? String(r.vote_average) : undefined),
              year: r.year || (r.release_date ? r.release_date.substring(0, 4) : (r.first_air_date ? r.first_air_date.substring(0, 4) : undefined)),
              poster: r.poster || r.poster_path || r.image,
              backdrop: r.backdrop || r.backdrop_path,
              overview: r.overview || ''
            }));
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Search failover on ${b} failed:`, e?.message);
      }
    }

    const lower = q.toLowerCase();
    return Object.values(MOCK_TITLES).filter(t => t.title.toLowerCase().includes(lower));
  },

  async getTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): Promise<TitleDetails> {
    try {
      const res = await apiFetch<{ success: boolean; data: TitleDetails }>(`/titles/${encodeURIComponent(id)}?type=${type}`);
      if (res && res.data) return res.data;
      return MOCK_TITLES[id] || MOCK_TITLES['550'];
    } catch {
      return MOCK_TITLES[id] || MOCK_TITLES['550'];
    }
  },

  async getSeasonEpisodes(id: string, seasonNumber: number): Promise<Episode[]> {
    try {
      const res = await apiFetch<{ success: boolean; episodes: Episode[] }>(`/titles/${encodeURIComponent(id)}/episodes?season=${seasonNumber}`);
      if (res && res.episodes) return res.episodes;
      return MOCK_SEASONS[`${id}-s${seasonNumber}`] || [];
    } catch {
      return MOCK_SEASONS[`${id}-s${seasonNumber}`] || [];
    }
  },

  async resolvePlayback(
    contentId: string,
    type: 'movie' | 'tv' | 'anime',
    season?: number,
    episode?: number
  ): Promise<PlaybackResolution> {
    const params = new URLSearchParams({
      contentId: String(contentId),
      type: type || 'movie'
    });
    if (season !== undefined) params.set('season', String(season));
    if (episode !== undefined) params.set('episode', String(episode));

    try {
      return await apiFetch<PlaybackResolution>(`/playback/resolve?${params.toString()}`);
    } catch (err: any) {
      console.warn('[Netflix API] resolvePlayback failed, generating embed fallback:', err?.message);
      const isEpisodic = type === 'tv' || type === 'anime';
      const s = season || 1;
      const e = episode || 1;
      const embedUrl = isEpisodic
        ? `https://framextv.cc/embed/${contentId}/${s}/${e}?autoplay=1`
        : `https://framextv.cc/embed/${contentId}?autoplay=1`;

      const embedServers = [
        {
          name: 'Server 1 (FrameX)',
          url: isEpisodic
            ? `https://framextv.cc/embed/${contentId}/${s}/${e}?autoplay=1`
            : `https://framextv.cc/embed/${contentId}?autoplay=1`
        },
        {
          name: 'Server 2 (VidSrc)',
          url: isEpisodic
            ? `https://vidsrc.to/embed/tv/${contentId}/${s}/${e}`
            : `https://vidsrc.to/embed/movie/${contentId}`
        },
        {
          name: 'Server 3 (AutoEmbed)',
          url: isEpisodic
            ? `https://player.autoembed.cc/embed/tv/${contentId}/${s}/${e}`
            : `https://player.autoembed.cc/embed/movie/${contentId}`
        }
      ];

      return {
        success: true,
        contentId: String(contentId),
        mediaType: type,
        season: isEpisodic ? s : undefined,
        episode: isEpisodic ? e : undefined,
        provider: 'FrameXTV Embed Fallback',
        sources: [],
        subtitles: [],
        embedUrl,
        embedServers,
        alternates: ['cinejoy', 'titan', 'bowler']
      };
    }
  },

  // Watchlist
  async getWatchlist(profileId: string = 'default-profile'): Promise<WatchlistItem[]> {
    try {
      const res = await apiFetch<{ success: boolean; items: WatchlistItem[] }>(`/users/me/watchlist?profileId=${encodeURIComponent(profileId)}`);
      return res.items || [];
    } catch {
      const stored = localStorage.getItem(`cinewave_watchlist_${profileId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  async addToWatchlist(item: {
    profileId?: string;
    contentId: string;
    mediaType: 'movie' | 'tv' | 'anime';
    title: string;
    poster?: string;
    year?: string;
    rating?: string;
  }): Promise<WatchlistItem> {
    const profileId = item.profileId || 'default-profile';
    try {
      const res = await apiFetch<{ success: boolean; item: WatchlistItem }>('/users/me/watchlist', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      return res.item;
    } catch {
      const stored = localStorage.getItem(`cinewave_watchlist_${profileId}`);
      const list: WatchlistItem[] = stored ? JSON.parse(stored) : [];
      const newItem: WatchlistItem = {
        ...item,
        profileId,
        addedAt: new Date().toISOString()
      };
      const updated = [newItem, ...list.filter(w => w.contentId !== item.contentId)];
      localStorage.setItem(`cinewave_watchlist_${profileId}`, JSON.stringify(updated));
      return newItem;
    }
  },

  async removeFromWatchlist(contentId: string, profileId: string = 'default-profile'): Promise<boolean> {
    try {
      const res = await apiFetch<{ success: boolean; removed: boolean }>(`/users/me/watchlist/${encodeURIComponent(contentId)}?profileId=${encodeURIComponent(profileId)}`, {
        method: 'DELETE'
      });
      return res.removed;
    } catch {
      const stored = localStorage.getItem(`cinewave_watchlist_${profileId}`);
      if (stored) {
        const list: WatchlistItem[] = JSON.parse(stored);
        const filtered = list.filter(w => w.contentId !== contentId);
        localStorage.setItem(`cinewave_watchlist_${profileId}`, JSON.stringify(filtered));
        return true;
      }
      return false;
    }
  },

  // Progress
  async getProgress(profileId: string = 'bolt'): Promise<PlaybackProgress[]> {
    let localList: PlaybackProgress[] = [];
    try {
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch {}

    try {
      const res = await apiFetch<{ success: boolean; progress: PlaybackProgress[] }>(
        `/users/me/progress?profileId=${encodeURIComponent(profileId)}`
      );
      const remoteList = res.progress || [];

      // Merge remote & local, preferring items with valid title & poster
      const map = new Map<string, PlaybackProgress>();
      [...remoteList, ...localList].forEach((p) => {
        const key = `${p.contentId}-${p.season || 0}-${p.episode || 0}`;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, p);
        } else {
          // If existing has missing poster or untitled, overwrite with better one
          const existingScore = (existing.poster ? 2 : 0) + (existing.title && existing.title !== 'Untitled' ? 2 : 0) + (existing.positionMs > 0 ? 1 : 0);
          const newScore = (p.poster ? 2 : 0) + (p.title && p.title !== 'Untitled' ? 2 : 0) + (p.positionMs > 0 ? 1 : 0);
          if (newScore > existingScore) {
            map.set(key, p);
          }
        }
      });

      return Array.from(map.values())
        .filter(p => !(p.durationMs === 0 && p.positionMs === 0 && (!p.poster || p.title === 'Untitled')))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return localList.filter(p => !(p.durationMs === 0 && p.positionMs === 0 && (!p.poster || p.title === 'Untitled')));
    }
  },

  async saveProgress(
    contentId: string,
    data: {
      profileId?: string;
      mediaType: 'movie' | 'tv' | 'anime';
      season?: number;
      episode?: number;
      positionMs: number;
      durationMs: number;
      title: string;
      poster?: string;
    }
  ): Promise<PlaybackProgress> {
    const profileId = data.profileId || 'bolt';

    // 1. Immediately persist to localStorage for instant UI reactivity
    const newProgress: PlaybackProgress = {
      ...data,
      profileId,
      contentId,
      updatedAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      const list: PlaybackProgress[] = stored ? JSON.parse(stored) : [];
      const updated = [
        newProgress,
        ...list.filter(p => !(p.contentId === contentId && p.season === data.season && p.episode === data.episode))
      ];
      localStorage.setItem(`cinewave_progress_${profileId}`, JSON.stringify(updated));
    } catch {}

    // 2. Sync to backend with query params (ensuring Android WebView forwarding preserves title & poster)
    try {
      const qParams = new URLSearchParams({
        profileId,
        title: data.title,
        mediaType: data.mediaType,
        pos: String(data.positionMs),
        dur: String(data.durationMs)
      });
      if (data.poster) qParams.set('poster', data.poster);
      if (data.season !== undefined) qParams.set('season', String(data.season));
      if (data.episode !== undefined) qParams.set('episode', String(data.episode));

      const res = await apiFetch<{ success: boolean; progress: PlaybackProgress }>(
        `/users/me/progress/${encodeURIComponent(contentId)}?${qParams.toString()}`,
        {
          method: 'PUT',
          body: JSON.stringify(data)
        }
      );
      return res.progress || newProgress;
    } catch {
      return newProgress;
    }
  }
};
