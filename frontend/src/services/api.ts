import {
  HomeCatalog,
  CatalogRail,
  TitleDetails,
  Episode,
  PlaybackResolution,
  MediaItem,
  WatchlistItem,
  PlaybackProgress,
  CategoryQueryParams,
  CategoryResponse
} from '../types';
import { MOCK_HOME_CATALOG, MOCK_TITLES, MOCK_SEASONS } from './mock.data';

declare global {
  interface Window {
    CINEWAVE_BACKEND_URL?: string;
  }
}

const FRAMEX_BACKENDS = [
  'https://api.framextv.tech',
  'https://api.framextv.cc',
  'https://api.framextv.pro',
  'https://api.framextv.xyz'
];

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

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function optimizeTmdbImageUrl(url?: string, size: 'poster' | 'backdrop' = 'poster'): string | undefined {
  if (!url) return undefined;
  if (url.includes('image.tmdb.org/t/p/')) {
    if (size === 'poster') {
      return url.replace(/\/t\/p\/(w500|original|w780|w1280)\//, '/t/p/w342/');
    } else {
      return url.replace(/\/t\/p\/(original|w1280)\//, '/t/p/w780/');
    }
  }
  return url;
}

function mapMediaItem(item: any, defaultType: 'movie' | 'tv' | 'anime' = 'movie'): MediaItem {
  const rawPoster = item.poster || item.poster_path || item.image || item.backdrop || item.backdrop_path;
  const rawBackdrop = item.backdrop || item.backdrop_path || item.poster || item.poster_path;

  return {
    id: String(item.id || item.contentId || ''),
    title: item.title || item.name || 'Untitled',
    type: (item.type === 'tv' || item.type === 'anime') ? item.type : defaultType,
    rating: item.rating ? String(item.rating) : (item.vote_average ? String(item.vote_average) : undefined),
    year: item.year || (item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : undefined)),
    poster: optimizeTmdbImageUrl(rawPoster, 'poster'),
    backdrop: optimizeTmdbImageUrl(rawBackdrop, 'backdrop'),
    overview: item.overview || '',
    genres: Array.isArray(item.genres) ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name)) : []
  };
}

function normalizeHomeCatalog(raw: any): HomeCatalog {
  if (!raw) return MOCK_HOME_CATALOG;

  // Case 1: Backend wrapped format { success: true, data: { hero, rails: [...] } }
  if (raw.data && Array.isArray(raw.data.rails) && raw.data.rails.length > 0) {
    return {
      hero: raw.data.hero ? mapMediaItem(raw.data.hero, raw.data.hero.type || 'movie') : null,
      rails: raw.data.rails.map((r: any) => ({
        ...r,
        items: Array.isArray(r.items) ? r.items.map((i: any) => mapMediaItem(i, r.type || 'movie')) : []
      }))
    };
  }

  // Case 2: Array rails directly on raw
  if (Array.isArray(raw.rails) && raw.rails.length > 0) {
    return {
      hero: raw.hero ? mapMediaItem(raw.hero, raw.hero.type || 'movie') : (raw.rails[0]?.items?.[0] || null),
      rails: raw.rails.map((r: any) => ({
        ...r,
        items: Array.isArray(r.items) ? r.items.map((i: any) => mapMediaItem(i, r.type || 'movie')) : []
      }))
    };
  }

  // Case 3: Direct FrameXTV format with rails object { trending_movies: { results: [...] }, ... }
  if (raw.rails && typeof raw.rails === 'object') {
    const rails: CatalogRail[] = [];
    const railConfigs: Array<{ key: string; title: string; type: 'movie' | 'tv' | 'anime'; category: string }> = [
      { key: 'trending_movies', title: 'Trending Now', type: 'movie', category: 'trending' },
      { key: 'popular_movies', title: 'Popular Movies', type: 'movie', category: 'popular' },
      { key: 'popular_tv', title: 'Popular TV Series', type: 'tv', category: 'popular' },
      { key: 'popular_anime', title: 'Acclaimed Anime', type: 'anime', category: 'popular' },
      { key: 'new_releases', title: 'New Releases', type: 'movie', category: 'new_releases' },
      { key: 'action_movies', title: 'Action & Adventure', type: 'movie', category: 'action' },
      { key: 'scifi_movies', title: 'Sci-Fi & Fantasy', type: 'movie', category: 'scifi' },
      { key: 'thriller_movies', title: 'Thrillers & Suspense', type: 'movie', category: 'thriller' },
      { key: 'comedy_movies', title: 'Comedy', type: 'movie', category: 'comedy' },
      { key: 'airing_anime', title: 'Top Anime', type: 'anime', category: 'popular' }
    ];

    for (const config of railConfigs) {
      const rawRail = raw.rails[config.key];
      if (rawRail && Array.isArray(rawRail.results) && rawRail.results.length > 0) {
        rails.push({
          id: `rail-${config.key}`,
          title: config.title,
          type: config.type,
          category: config.category,
          items: rawRail.results.map((r: any) => mapMediaItem(r, config.type))
        });
      }
    }

    const hero = raw.hero ? mapMediaItem(raw.hero, raw.hero.type || 'movie') : (rails[0]?.items[0] || null);

    if (rails.length > 0) {
      return { hero, rails };
    }
  }

  return MOCK_HOME_CATALOG;
}

function normalizeTitleDetails(raw: any, fallbackId: string, type: 'movie' | 'tv' | 'anime'): TitleDetails {
  const d = raw?.data || raw;
  if (!d || (!d.title && !d.name)) {
    return MOCK_TITLES[fallbackId] || MOCK_TITLES['66732'] || MOCK_TITLES['550'];
  }

  const seasons = Array.isArray(d.seasons)
    ? d.seasons
        .filter((s: any) => (s.season_number ?? s.number ?? 0) > 0)
        .map((s: any) => ({
          id: s.id || s.season_number,
          number: s.season_number ?? s.number ?? 1,
          name: s.name || `Season ${s.season_number ?? s.number ?? 1}`,
          overview: s.overview || '',
          poster: s.poster || s.poster_path,
          episodeCount: s.episode_count ?? s.episodeCount ?? 0,
          airDate: s.air_date
        }))
    : undefined;

  const cast = Array.isArray(d.cast)
    ? d.cast.slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profile: c.profile || c.profile_path
      }))
    : [];

  let recommendations = Array.isArray(d.recommendations || d.similar)
    ? (d.recommendations || d.similar).slice(0, 12).map((r: any) => mapMediaItem(r, type))
    : [];

  // Guarantee high-quality "More Like This" recommendations for all titles
  if (recommendations.length === 0) {
    const fallbackPool = (MOCK_HOME_CATALOG.rails || []).flatMap((r) => r.items);
    recommendations = fallbackPool
      .filter((item) => String(item.id) !== String(d.id || fallbackId))
      .slice(0, 10);
  }

  return {
    id: String(d.id || fallbackId),
    title: d.title || d.name || 'Untitled',
    type: type === 'tv' ? 'tv' : 'movie',
    tagline: d.tagline,
    rating: d.rating ? String(d.rating) : (d.vote_average ? String(d.vote_average) : undefined),
    year: d.year || (d.release_date ? d.release_date.substring(0, 4) : (d.first_air_date ? d.first_air_date.substring(0, 4) : undefined)),
    releaseDate: d.release_date || d.first_air_date,
    poster: optimizeTmdbImageUrl(d.poster || d.poster_path || d.image, 'poster'),
    backdrop: optimizeTmdbImageUrl(d.backdrop || d.backdrop_path, 'backdrop'),
    overview: d.overview || '',
    genres: Array.isArray(d.genres) ? d.genres.map((g: any) => (typeof g === 'string' ? g : g.name)) : [],
    runtime: d.runtime || (Array.isArray(d.episode_run_time) ? d.episode_run_time[0] : undefined),
    status: d.status,
    voteCount: d.vote_count,
    cast,
    recommendations,
    numberOfSeasons: d.number_of_seasons ?? d.numberOfSeasons,
    numberOfEpisodes: d.number_of_episodes ?? d.numberOfEpisodes,
    seasons
  };
}

export const api = {
  // Catalog
  async getHomeCatalog(): Promise<HomeCatalog> {
    try {
      const res = await apiFetch<any>('/catalog/home');
      const normalized = normalizeHomeCatalog(res);
      if (normalized.rails.length > 0 && normalized !== MOCK_HOME_CATALOG) {
        return normalized;
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local /catalog/home fetch failed:', err?.message);
    }

    // Direct multi-host fallback to upstream FrameXTV backends
    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}/api/home`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          const normalized = normalizeHomeCatalog(data);
          if (normalized.rails.length > 0) {
            return normalized;
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Direct home fallback failed on ${b}:`, e?.message);
      }
    }

    console.warn('[Netflix API] Using rich offline fallback home catalog');
    return MOCK_HOME_CATALOG;
  },

  async getCategoryMovies(options: CategoryQueryParams): Promise<CategoryResponse> {
    const page = Math.max(1, Number(options.page || 1));
    const category = options.category ? options.category.toLowerCase() : (options.genreId ? '' : 'popular');
    const genreId = options.genreId;
    const type = options.type || (category === 'tv' || category === 'popular_tv' ? 'tv' : 'movie');

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (genreId) params.set('genreId', String(genreId));
    if (type) params.set('type', type);
    params.set('page', String(page));

    // 1. Try local backend
    try {
      const res = await apiFetch<any>(`/catalog/category?${params.toString()}`);
      if (res && res.success && Array.isArray(res.results)) {
        return {
          success: true,
          category,
          genreId,
          page: Number(res.page || page),
          totalPages: Number(res.totalPages || 100),
          totalResults: Number(res.totalResults || 2000),
          results: res.results.map((r: any) => mapMediaItem(r, type))
        };
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local /catalog/category fetch failed:', err?.message);
    }

    // 2. Direct upstream failover across backends
    const GENRE_MAP: Record<string, number> = {
      action: 28,
      adventure: 12,
      animation: 16,
      comedy: 35,
      crime: 80,
      documentary: 99,
      drama: 18,
      family: 10751,
      fantasy: 14,
      history: 36,
      horror: 27,
      music: 10402,
      mystery: 9648,
      romance: 10749,
      scifi: 878,
      'sci-fi': 878,
      thriller: 53,
      war: 10752,
      western: 37
    };

    const effectiveGenreId = genreId || GENRE_MAP[category];
    let upstreamPath: string;
    if (effectiveGenreId) {
      upstreamPath = `/api/discover?genre=${effectiveGenreId}&page=${page}`;
    } else if (category === 'trending') {
      upstreamPath = `/api/trending?page=${page}`;
    } else if (category === 'popular_tv' || category === 'tv' || type === 'tv') {
      upstreamPath = `/api/tv?page=${page}`;
    } else if (category === 'popular' || category === 'popular_movies' || category === 'movies') {
      upstreamPath = `/api/movies?page=${page}`;
    } else {
      upstreamPath = `/api/movies?page=${page}`;
    }

    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}${upstreamPath}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && Array.isArray(data.results)) {
            return {
              success: true,
              category,
              genreId: effectiveGenreId,
              page: Number(data.page || page),
              totalPages: Number(data.totalPages || 100),
              totalResults: Number(data.totalResults || (data.results.length * 10)),
              results: data.results.map((r: any) => mapMediaItem(r, type))
            };
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Direct category failover failed on ${b}:`, e?.message);
      }
    }

    // 3. Fallback to mock catalog
    const allMock = (MOCK_HOME_CATALOG.rails || []).flatMap((r) => r.items);
    const pageSize = 12;
    const startIndex = ((page - 1) * pageSize) % Math.max(1, allMock.length);
    const paged = allMock.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      category,
      genreId: effectiveGenreId,
      page,
      totalPages: Math.ceil(allMock.length / pageSize) || 1,
      totalResults: allMock.length,
      results: paged
    };
  },

  async search(query: string): Promise<MediaItem[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const res = await apiFetch<any>(`/catalog/search?q=${encodeURIComponent(q)}`);
      if (res) {
        const list = Array.isArray(res.results) ? res.results : (Array.isArray(res.data) ? res.data : null);
        if (list && list.length > 0) {
          return list.map((r: any) => mapMediaItem(r, r.type || 'movie'));
        }
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local search failed, attempting direct FrameX failover:', err?.message);
    }

    // Direct FrameXTV search fallback across backends
    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}/api/search?q=${encodeURIComponent(q)}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && data.success && Array.isArray(data.results) && data.results.length > 0) {
            return data.results.map((r: any) => mapMediaItem(r, r.type || 'movie'));
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Search failover on ${b} failed:`, e?.message);
      }
    }

    const lower = q.toLowerCase();
    return Object.values(MOCK_TITLES)
      .filter(t => t.title.toLowerCase().includes(lower) || t.overview?.toLowerCase().includes(lower))
      .map(t => mapMediaItem(t, t.type));
  },

  async getTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): Promise<TitleDetails> {
    try {
      const res = await apiFetch<any>(`/titles/${encodeURIComponent(id)}?type=${type}`);
      if (res && (res.data || res.success)) {
        return normalizeTitleDetails(res, id, type);
      }
    } catch (err: any) {
      console.warn(`[Netflix API] Local getTitleDetails failed for ${id}:`, err?.message);
    }

    // Direct FrameXTV details fallback
    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}/api/details?id=${encodeURIComponent(id)}&type=${type === 'tv' ? 'tv' : 'movie'}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && (data.success || data.title || data.name)) {
            return normalizeTitleDetails(data, id, type);
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Details fallback on ${b} failed:`, e?.message);
      }
    }

    return MOCK_TITLES[id] || MOCK_TITLES['66732'] || MOCK_TITLES['550'];
  },

  async getSeasonEpisodes(id: string, seasonNumber: number): Promise<Episode[]> {
    try {
      const res = await apiFetch<any>(`/titles/${encodeURIComponent(id)}/episodes?season=${seasonNumber}`);
      if (res && Array.isArray(res.episodes)) {
        return res.episodes;
      }
    } catch (err: any) {
      console.warn(`[Netflix API] Local episodes failed for ${id}:`, err?.message);
    }

    // Direct FrameXTV season episodes fallback
    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}/api/season?id=${encodeURIComponent(id)}&season=${seasonNumber}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && data.success && Array.isArray(data.episodes)) {
            return data.episodes.map((ep: any) => ({
              id: ep.id || ep.episode_number,
              number: ep.episode_number ?? ep.number ?? 1,
              name: ep.name || `Episode ${ep.episode_number ?? ep.number ?? 1}`,
              overview: ep.overview || '',
              still: ep.still || ep.still_path,
              airDate: ep.air_date,
              rating: ep.vote_average ?? ep.rating
            }));
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Season episodes fallback on ${b} failed:`, e?.message);
      }
    }

    return MOCK_SEASONS[`${id}-s${seasonNumber}`] || [];
  },

  async resolvePlayback(
    contentId: string,
    type: 'movie' | 'tv' | 'anime',
    season?: number,
    episode?: number
  ): Promise<PlaybackResolution> {
    const s = season || 1;
    const e = episode || 1;
    const isEpisodic = type === 'tv' || type === 'anime';

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

    const fallbackResolution: PlaybackResolution = {
      success: true,
      contentId: String(contentId),
      mediaType: type,
      season: isEpisodic ? s : undefined,
      episode: isEpisodic ? e : undefined,
      provider: 'FrameXTV Embed Fallback',
      sources: [],
      subtitles: [],
      embedUrl: embedServers[0].url,
      embedServers,
      alternates: ['cinejoy', 'titan', 'bowler']
    };

    const params = new URLSearchParams({
      contentId: String(contentId),
      type: type || 'movie'
    });
    if (season !== undefined) params.set('season', String(season));
    if (episode !== undefined) params.set('episode', String(episode));

    try {
      const res = await apiFetch<PlaybackResolution>(`/playback/resolve?${params.toString()}`);
      if (res && res.success) {
        if (!res.embedServers || res.embedServers.length === 0) {
          res.embedServers = embedServers;
        }
        return res;
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local resolvePlayback failed:', err?.message);
    }

    // Direct FrameX stream fallback
    for (const b of FRAMEX_BACKENDS) {
      try {
        let streamPath = `${b}/api/stream?id=${encodeURIComponent(contentId)}&type=${type === 'tv' ? 'tv' : 'movie'}`;
        if (type === 'tv') {
          streamPath += `&season=${s}&episode=${e}`;
        }
        const directRes = await fetch(streamPath, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && data.success && Array.isArray(data.sources) && data.sources.length > 0) {
            return {
              success: true,
              contentId: String(contentId),
              mediaType: type,
              season: isEpisodic ? s : undefined,
              episode: isEpisodic ? e : undefined,
              provider: data.provider || 'FrameX Direct',
              sources: data.sources.map((src: any) => ({
                url: src.url,
                quality: src.quality || '1080p',
                type: src.type === 'hls' ? 'hls' : 'mp4',
                server: src.server || 'FrameX'
              })),
              subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
              embedUrl: embedServers[0].url,
              embedServers,
              alternates: Array.isArray(data.alternates) ? data.alternates : ['cinejoy', 'titan', 'bowler']
            };
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Stream fallback on ${b} failed:`, e?.message);
      }
    }

    return fallbackResolution;
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

    // 2. Sync to backend with query params
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
