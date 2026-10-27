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
  if (window.CINEWAVE_BACKEND_URL) {
    return window.CINEWAVE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
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
    if (!query.trim()) return [];
    try {
      const res = await apiFetch<{ success: boolean; results: MediaItem[] }>(`/catalog/search?q=${encodeURIComponent(query)}`);
      return res.results || [];
    } catch {
      const q = query.toLowerCase();
      return Object.values(MOCK_TITLES).filter(t => t.title.toLowerCase().includes(q));
    }
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
      console.warn('[Netflix API] resolvePlayback failed, generating direct stream & embed fallback:', err?.message);
      const isEpisodic = type === 'tv' || type === 'anime';
      const s = season || 1;
      const e = episode || 1;
      const embedUrl = isEpisodic
        ? `https://framextv.xyz/embed/${contentId}/${s}/${e}?autoplay=1`
        : `https://framextv.xyz/embed/${contentId}?autoplay=1`;

      return {
        success: true,
        contentId: String(contentId),
        mediaType: type,
        season: isEpisodic ? s : undefined,
        episode: isEpisodic ? e : undefined,
        provider: 'CineWave Stream Core (Fallback)',
        sources: [
          {
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            quality: '1080p Ultra HD',
            type: 'hls',
            server: 'CineWave Edge Direct (HLS Adaptive)',
            skipProxy: true
          },
          {
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '1080p',
            type: 'mp4',
            server: 'CineWave Backup CDN (MP4)',
            skipProxy: true
          }
        ],
        subtitles: [
          {
            url: 'https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt',
            label: 'English [Original]',
            lang: 'en',
            format: 'vtt',
            isDefault: true
          },
          {
            url: 'https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_es.vtt',
            label: 'Español',
            lang: 'es',
            format: 'vtt'
          }
        ],
        embedUrl,
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
  async getProgress(profileId: string = 'default-profile'): Promise<PlaybackProgress[]> {
    try {
      const res = await apiFetch<{ success: boolean; progress: PlaybackProgress[] }>(`/users/me/progress?profileId=${encodeURIComponent(profileId)}`);
      return res.progress || [];
    } catch {
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      return stored ? JSON.parse(stored) : [];
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
    const profileId = data.profileId || 'default-profile';
    try {
      const res = await apiFetch<{ success: boolean; progress: PlaybackProgress }>(`/users/me/progress/${encodeURIComponent(contentId)}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return res.progress;
    } catch {
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      const list: PlaybackProgress[] = stored ? JSON.parse(stored) : [];
      const newProgress: PlaybackProgress = {
        ...data,
        profileId,
        contentId,
        updatedAt: new Date().toISOString()
      };
      const updated = [newProgress, ...list.filter(p => !(p.contentId === contentId && p.season === data.season && p.episode === data.episode))];
      localStorage.setItem(`cinewave_progress_${profileId}`, JSON.stringify(updated));
      return newProgress;
    }
  }
};
