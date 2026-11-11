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
  CategoryResponse,
  StreamSource,
  SubtitleTrack
} from '../types';
import { MOCK_HOME_CATALOG, MOCK_TITLES, MOCK_SEASONS, MOCK_ITEMS } from './mock.data';

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

// Global in-memory cache for all loaded media items, ensuring exact titles, posters and types
const mediaItemCache = new Map<string, MediaItem>();

// Seed cache with verified reference titles
if (typeof MOCK_ITEMS !== 'undefined') {
  Object.values(MOCK_ITEMS).forEach((item) => {
    if (item && item.id) {
      mediaItemCache.set(String(item.id), item);
    }
  });
}

export function cacheMediaItem(item: MediaItem): void {
  if (item && item.id) {
    const existing = mediaItemCache.get(String(item.id));
    if (!existing || (!existing.poster && item.poster) || (!existing.overview && item.overview)) {
      mediaItemCache.set(String(item.id), item);
    }
  }
}

export function getCachedMediaItem(id: string): MediaItem | undefined {
  return mediaItemCache.get(String(id));
}

// Normalizes stream URLs (unwrapping any expired proxy workers to direct streaming origins)
export function normalizeStreamUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  if (rawUrl.includes('multi.amnestyinternational.dev') && rawUrl.includes('url=')) {
    const match = rawUrl.match(/url=([^&]+)/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return rawUrl;
}

// Validates that a resolved stream source belongs to the expected title, rejecting fuzzy scraper mismatches
export function isStreamUrlAccurate(sourceUrl: string, expectedTitle?: string): boolean {
  if (!sourceUrl) return false;
  const decoded = decodeURIComponent(sourceUrl).toLowerCase();

  // Reject garbage, placeholder, fake geo-blocked cards, or offensive stream URLs
  const BLACKLIST = [
    'fastcloud',
    'dummy_stream',
    'placeholder_url',
    '/error.m3u8',
    '/404.m3u8',
    'atlantic.st',
    'classroom.best',
    'fprime.at',
    'transcode.cfd',
    'totallyacdn.cc',
    'amnestyinternational.dev'
  ];
  if (BLACKLIST.some((b) => decoded.includes(b))) {
    return false;
  }

  if (!expectedTitle) return true;

  // Check if the stream URL includes a movie/tv title slug (ignore raw playlist/segment filenames)
  const slugMatch = decoded.match(/\/(?:movie|tv)\/[a-f0-9-]+\/([^/?&#]+)/i);
  if (slugMatch && slugMatch[1]) {
    const rawSlug = slugMatch[1].toLowerCase();
    // Do not treat playlist/segment media files as movie title slugs
    if (rawSlug.endsWith('.m3u8') || rawSlug.endsWith('.mp4') || rawSlug.endsWith('.ts') || rawSlug.endsWith('.mkv')) {
      return true;
    }
    const streamTitleSlug = rawSlug.replace(/[+_.-]+/g, ' ').trim();
    const cleanExpected = expectedTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const cleanStream = streamTitleSlug.replace(/[^a-z0-9 ]/g, '').trim();

    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'part', 'movie', 'film']);
    const expectedWords = cleanExpected.split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w));
    const streamWords = cleanStream.split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w));

    if (expectedWords.length > 0 && streamWords.length > 0) {
      const sharedWords = streamWords.filter((w) =>
        expectedWords.some((ew) => ew === w || ew.includes(w) || w.includes(ew))
      );

      // If zero words match, it's definitely an incorrect title
      if (sharedWords.length === 0) return false;

      // Check distinct contradictory keywords
      if (cleanStream.includes('now') && !cleanExpected.includes('now')) return false;
      if (cleanStream.includes('university') && !cleanExpected.includes('university')) return false;

      const streamMatchRatio = sharedWords.length / streamWords.length;
      if (streamMatchRatio < 0.4 && sharedWords.length < 2) return false;
    }
  }

  return true;
}

// Multi-provider alternate stream retriever (e.g. executioner, bowler) for pristine 1080p playback
async function fetchAlternateSources(
  contentId: string,
  type: 'movie' | 'tv' | 'anime',
  provider: string,
  season?: number,
  episode?: number,
  expectedTitle?: string
): Promise<StreamSource[]> {
  const s = season || 1;
  const e = episode || 1;
  const isEpisodic = type === 'tv' || type === 'anime';

  // 1. Try local/native proxy first (guarantees zero CORS in Android TV WebView)
  try {
    const params = new URLSearchParams({
      contentId: String(contentId),
      type: isEpisodic ? 'tv' : 'movie',
      provider: provider
    });
    if (isEpisodic) {
      params.set('season', String(s));
      params.set('episode', String(e));
    }
    const d = await apiFetch<any>(`/playback/resolve?${params.toString()}`);
    if (d && d.success && Array.isArray(d.sources) && d.sources.length > 0) {
      const valid = d.sources
        .map((src: any) => ({
          ...src,
          url: normalizeStreamUrl(src.url)
        }))
        .filter((src: any) => isStreamUrlAccurate(src.url, expectedTitle))
        .map((src: any) => ({
          url: src.url,
          quality: src.quality || '1080p',
          type: src.type === 'hls' ? 'hls' : 'mp4',
          server: src.server || provider
        }));
      if (valid.length > 0) return valid;
    }
  } catch {}

  // 2. Direct upstream failover across backends
  for (const b of FRAMEX_BACKENDS) {
    try {
      let p = `${b}/api/stream?id=${encodeURIComponent(contentId)}&type=${isEpisodic ? 'tv' : 'movie'}&provider=${encodeURIComponent(provider)}`;
      if (isEpisodic) {
        p += `&season=${s}&episode=${e}`;
      }
      const r = await fetch(p, { headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const d = await r.json();
        if (d && d.success && Array.isArray(d.sources) && d.sources.length > 0) {
          return d.sources
            .map((src: any) => ({
              ...src,
              url: normalizeStreamUrl(src.url)
            }))
            .filter((src: any) => isStreamUrlAccurate(src.url, expectedTitle))
            .map((src: any) => ({
              url: src.url,
              quality: src.quality || '1080p',
              type: src.type === 'hls' ? 'hls' : 'mp4',
              server: src.server || provider
            }));
        }
      }
    } catch {}
  }
  return [];
}

// Dedicated multi-server stream resolver for FrameXTV's official Backup provider (VidBolt)
export async function fetchVidboltSources(
  contentId: string,
  type: 'movie' | 'tv' | 'anime',
  season?: number,
  episode?: number,
  expectedTitle?: string
): Promise<StreamSource[]> {
  const isEpisodic = type === 'tv' || type === 'anime';
  const s = season || 1;
  const e = episode || 1;
  const preferServers = ['orion', 'callisto', 'vega', 'quantum'];

  for (const server of preferServers) {
    try {
      let url = `https://vidbolt.xyz/api/resolve?type=${isEpisodic ? 'tv' : 'movie'}&id=${encodeURIComponent(contentId)}&prefer=${server}`;
      if (isEpisodic) {
        url += `&season=${s}&episode=${e}`;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://vidbolt.xyz/'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.stream && Array.isArray(data.stream.sources) && data.stream.sources.length > 0) {
          // Sort sources: prioritize English, or French (if title is French), then 1080p
          const sorted = [...data.stream.sources].sort((a: any, b: any) => {
            const langA = (a.language || '').toLowerCase();
            const langB = (b.language || '').toLowerCase();
            if (langA === 'english' && langB !== 'english') return -1;
            if (langB === 'english' && langA !== 'english') return 1;
            if (langA === 'french' && langB !== 'french') return -1;
            if (langB === 'french' && langA !== 'french') return 1;
            return 0;
          });

          const sources: StreamSource[] = sorted
            .filter((src: any) => src.url && isStreamUrlAccurate(src.url, expectedTitle))
            .map((src: any) => ({
              url: src.url,
              quality: src.quality || '1080p',
              type: 'hls' as const,
              server: `Backup / VidBolt (${src.language || server})`
            }));

          if (sources.length > 0) {
            return sources;
          }
        }
      }
    } catch {}
  }
  return [];
}

// Verifies that a retrieved title is consistent with what was displayed on the clicked poster
export function isTitleConsistent(retrievedTitle?: string, expectedTitle?: string): boolean {
  if (!retrievedTitle || !expectedTitle) return true;
  const cleanRetrieved = retrievedTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const cleanExpected = expectedTitle.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (cleanRetrieved === cleanExpected) return true;

  const rWords = cleanRetrieved.split(/\s+/).filter((w) => w.length > 2);
  const eWords = cleanExpected.split(/\s+/).filter((w) => w.length > 2);
  if (rWords.length === 0 || eWords.length === 0) return true;

  return rWords.some((rw) => eWords.some((ew) => ew === rw || ew.includes(rw) || rw.includes(ew)));
}

function mapMediaItem(item: any, defaultType: 'movie' | 'tv' | 'anime' = 'movie'): MediaItem {
  const rawPoster = item.poster || item.poster_path || item.image || item.backdrop || item.backdrop_path;
  const rawBackdrop = item.backdrop || item.backdrop_path || item.poster || item.poster_path;

  // Accurately determine media type (tv vs movie)
  const isTv =
    item.type === 'tv' ||
    item.type === 'anime' ||
    item.media_type === 'tv' ||
    Boolean(item.first_air_date) ||
    Boolean(item.number_of_seasons) ||
    Boolean(item.numberOfSeasons);

  const mapped: MediaItem = {
    id: String(item.id || item.contentId || ''),
    title: item.title || item.name || 'Untitled',
    type: isTv ? (item.type === 'anime' ? 'anime' : 'tv') : defaultType,
    rating: item.rating ? String(item.rating) : (item.vote_average ? String(item.vote_average) : undefined),
    year: item.year || (item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : undefined)),
    poster: optimizeTmdbImageUrl(rawPoster, 'poster'),
    backdrop: optimizeTmdbImageUrl(rawBackdrop, 'backdrop'),
    overview: item.overview || '',
    genres: Array.isArray(item.genres) ? item.genres.map((g: any) => (typeof g === 'string' ? g : g.name)) : []
  };

  cacheMediaItem(mapped);
  return mapped;
}

function deduplicateRailItems(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  const out: MediaItem[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(String(item.id))) {
      seen.add(String(item.id));
      out.push(item);
    }
  }
  return out;
}

function deduplicateRails(rails: CatalogRail[]): CatalogRail[] {
  const seen = new Set<string>();
  const out: CatalogRail[] = [];
  for (const r of rails) {
    if (r && r.id && !seen.has(r.id)) {
      seen.add(r.id);
      out.push({
        ...r,
        items: deduplicateRailItems(r.items || [])
      });
    }
  }
  return out;
}

function normalizeHomeCatalog(raw: any): HomeCatalog {
  if (!raw) return MOCK_HOME_CATALOG;

  // Verified blockbuster pool to guarantee rich, playable Hero and rails
  const verifiedHeroCandidates: MediaItem[] = [
    MOCK_ITEMS['693134'], // Dune: Part Two
    MOCK_ITEMS['155'],    // The Dark Knight
    MOCK_ITEMS['66732'],  // Stranger Things
    MOCK_ITEMS['157336'], // Interstellar
    MOCK_ITEMS['27205']   // Inception
  ];

  // Case 1: Backend wrapped format { success: true, data: { hero, rails: [...] } }
  if (raw.data && Array.isArray(raw.data.rails) && raw.data.rails.length > 0) {
    const rails: CatalogRail[] = raw.data.rails.map((r: any) => ({
      ...r,
      items: Array.isArray(r.items) ? r.items.map((i: any) => mapMediaItem(i, r.type || 'movie')) : []
    }));

    let hero: MediaItem | null = raw.data.hero ? mapMediaItem(raw.data.hero, raw.data.hero.type || 'movie') : null;
    // Replace unreleased/future hero with an acclaimed released title
    if (!hero || (hero.year && parseInt(hero.year, 10) >= 2026)) {
      hero = rails[0]?.items.find((i) => !i.year || parseInt(i.year, 10) <= 2025) || verifiedHeroCandidates[0];
    }

    return { hero, rails: deduplicateRails(rails) };
  }

  // Case 2: Array rails directly on raw
  if (Array.isArray(raw.rails) && raw.rails.length > 0) {
    const rails: CatalogRail[] = raw.rails.map((r: any) => ({
      ...r,
      items: Array.isArray(r.items) ? r.items.map((i: any) => mapMediaItem(i, r.type || 'movie')) : []
    }));

    let hero: MediaItem | null = raw.hero ? mapMediaItem(raw.hero, raw.hero.type || 'movie') : (rails[0]?.items?.[0] || null);
    if (!hero || (hero.year && parseInt(hero.year, 10) >= 2026)) {
      hero = rails[0]?.items.find((i) => !i.year || parseInt(i.year, 10) <= 2025) || verifiedHeroCandidates[0];
    }

    return { hero, rails: deduplicateRails(rails) };
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
      let items: MediaItem[] = [];

      if (rawRail && Array.isArray(rawRail.results) && rawRail.results.length > 0) {
        items = rawRail.results.map((r: any) => mapMediaItem(r, config.type));
      }

      // If upstream anime rail is empty, augment with rich verified anime catalog
      if (items.length === 0 && (config.type === 'anime' || config.category === 'popular_anime')) {
        const mockAnime = MOCK_HOME_CATALOG.rails.find((r) => r.id === 'rail-anime');
        if (mockAnime) items = mockAnime.items.map((i) => mapMediaItem(i, 'anime'));
      }

      if (items.length > 0) {
        rails.push({
          id: `rail-${config.key}`,
          title: config.title,
          type: config.type,
          category: config.category,
          items
        });
      }
    }

    // Include dedicated Top 10 rail if not present
    if (!rails.some((r) => r.id === 'rail-top-10' || r.category === 'top-10')) {
      const top10Rail = MOCK_HOME_CATALOG.rails.find((r) => r.id === 'rail-top-10');
      if (top10Rail) {
        rails.splice(1, 0, {
          ...top10Rail,
          items: top10Rail.items.map((i) => mapMediaItem(i, 'movie'))
        });
      }
    }

    // Select a verified, released hero banner (never an unreleased future title)
    let hero: MediaItem | null = raw.hero ? mapMediaItem(raw.hero, raw.hero.type || 'movie') : null;
    if (!hero || (hero.year && parseInt(hero.year, 10) >= 2026)) {
      hero = rails[0]?.items.find((i) => !i.year || parseInt(i.year, 10) <= 2025) || verifiedHeroCandidates[0];
    }

    if (rails.length > 0) {
      return { hero, rails: deduplicateRails(rails) };
    }
  }

  return {
    hero: MOCK_HOME_CATALOG.hero ? mapMediaItem(MOCK_HOME_CATALOG.hero, 'tv') : null,
    rails: deduplicateRails(MOCK_HOME_CATALOG.rails.map((r) => ({
      ...r,
      items: r.items.map((i) => mapMediaItem(i, r.type))
    })))
  };
}

function normalizeTitleDetails(raw: any, fallbackId: string, type: 'movie' | 'tv' | 'anime'): TitleDetails {
  const d = raw?.data || raw;
  const cached = mediaItemCache.get(String(fallbackId));

  // If upstream payload is empty or invalid, fall back to cached media item or ID-specific mock (never overwrite with random title!)
  if (!d || (!d.title && !d.name)) {
    if (cached) {
      return {
        id: String(cached.id),
        title: cached.title,
        type: cached.type === 'tv' ? 'tv' : 'movie',
        poster: cached.poster,
        backdrop: cached.backdrop || cached.poster,
        overview: cached.overview || 'Streaming in Ultra HD.',
        year: cached.year,
        rating: cached.rating,
        genres: cached.genres || [],
        cast: [],
        recommendations: (MOCK_HOME_CATALOG.rails || []).flatMap((r) => r.items).filter((i) => String(i.id) !== String(cached.id)).slice(0, 10),
        numberOfSeasons: cached.type === 'tv' ? 1 : undefined,
        seasons: cached.type === 'tv' ? [{ id: 1, number: 1, name: 'Season 1', overview: '', episodeCount: 10 }] : undefined
      };
    }
    if (MOCK_TITLES[fallbackId]) {
      return MOCK_TITLES[fallbackId];
    }
    return {
      id: String(fallbackId),
      title: 'Title Details',
      type: type === 'tv' ? 'tv' : 'movie',
      poster: undefined,
      backdrop: undefined,
      overview: 'Now streaming on Netflix.',
      genres: [],
      cast: [],
      recommendations: []
    };
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

  // Preserve expected poster and title if retrieved response had inconsistent or missing title
  const resolvedTitle = (cached && !isTitleConsistent(d.title || d.name, cached.title)) ? cached.title : (d.title || d.name || cached?.title || 'Untitled');
  const resolvedPoster = optimizeTmdbImageUrl(d.poster || d.poster_path || d.image, 'poster') || cached?.poster;
  const resolvedBackdrop = optimizeTmdbImageUrl(d.backdrop || d.backdrop_path, 'backdrop') || cached?.backdrop;

  return {
    id: String(d.id || fallbackId),
    title: resolvedTitle,
    type: type === 'tv' ? 'tv' : 'movie',
    tagline: d.tagline,
    rating: d.rating ? String(d.rating) : (d.vote_average ? String(d.vote_average) : undefined),
    year: d.year || (d.release_date ? d.release_date.substring(0, 4) : (d.first_air_date ? d.first_air_date.substring(0, 4) : undefined)),
    releaseDate: d.release_date || d.first_air_date,
    poster: resolvedPoster,
    backdrop: resolvedBackdrop,
    overview: d.overview || cached?.overview || '',
    genres: Array.isArray(d.genres) ? d.genres.map((g: any) => (typeof g === 'string' ? g : g.name)) : (cached?.genres || []),
    runtime: d.runtime || (Array.isArray(d.episode_run_time) ? d.episode_run_time[0] : undefined),
    status: d.status,
    voteCount: d.vote_count,
    cast,
    recommendations,
    numberOfSeasons: (type === 'tv' || type === 'anime') ? (d.number_of_seasons ?? d.numberOfSeasons) : undefined,
    numberOfEpisodes: (type === 'tv' || type === 'anime') ? (d.number_of_episodes ?? d.numberOfEpisodes) : undefined,
    seasons: (type === 'tv' || type === 'anime') ? seasons : undefined
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const directRes = await fetch(`${b}/api/home`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
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
    const cached = mediaItemCache.get(String(id));
    const effectiveType = cached?.type || type || 'movie';

    try {
      const res = await apiFetch<any>(`/titles/${encodeURIComponent(id)}?type=${effectiveType}`);
      if (res && (res.data || res.success)) {
        const details = normalizeTitleDetails(res, id, effectiveType);
        if (details && (!cached || isTitleConsistent(details.title, cached.title))) {
          return details;
        }
      }
    } catch (err: any) {
      console.warn(`[Netflix API] Local getTitleDetails failed for ${id}:`, err?.message);
    }

    // Direct FrameXTV details fallback
    for (const b of FRAMEX_BACKENDS) {
      try {
        const directRes = await fetch(`${b}/api/details?id=${encodeURIComponent(id)}&type=${effectiveType === 'tv' ? 'tv' : 'movie'}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && (data.success || data.title || data.name)) {
            const details = normalizeTitleDetails(data, id, effectiveType);
            if (details && (!cached || isTitleConsistent(details.title, cached.title))) {
              return details;
            }
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Details fallback on ${b} failed:`, e?.message);
      }
    }

    // Fallback to cached media item if available (guarantees title & poster match the clicked poster!)
    if (cached) {
      return {
        id: String(cached.id),
        title: cached.title,
        type: cached.type === 'tv' ? 'tv' : 'movie',
        poster: cached.poster,
        backdrop: cached.backdrop || cached.poster,
        overview: cached.overview || 'Now streaming in Ultra HD.',
        year: cached.year,
        rating: cached.rating,
        genres: cached.genres || [],
        cast: [],
        recommendations: (MOCK_HOME_CATALOG.rails || []).flatMap((r) => r.items).filter((i) => String(i.id) !== String(cached.id)).slice(0, 10),
        numberOfSeasons: cached.type === 'tv' ? 1 : undefined,
        seasons: cached.type === 'tv' ? [{ id: 1, number: 1, name: 'Season 1', overview: '', episodeCount: 10 }] : undefined
      };
    }

    // Fallback to exact ID in mock titles
    if (MOCK_TITLES[id]) {
      return MOCK_TITLES[id];
    }

    // Safe fallback retaining id and type (never returning Stranger Things or Fight Club for unrelated IDs!)
    return {
      id: String(id),
      title: 'Title Details',
      type: effectiveType === 'tv' ? 'tv' : 'movie',
      poster: undefined,
      backdrop: undefined,
      overview: 'Now streaming on Netflix.',
      genres: [],
      cast: [],
      recommendations: (MOCK_HOME_CATALOG.rails || []).flatMap((r) => r.items).slice(0, 10)
    };
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
    episode?: number,
    title?: string
  ): Promise<PlaybackResolution> {
    const s = season || 1;
    const e = episode || 1;
    const cached = mediaItemCache.get(String(contentId));
    const effectiveType = (cached?.type || type || 'movie') as 'movie' | 'tv' | 'anime';
    const expectedTitle = title || cached?.title || '';
    const isEpisodic = effectiveType === 'tv' || effectiveType === 'anime';

    // Prioritize clean, ad-free embed servers: FrameX and AutoEmbed (VidLink) without robot verification prompts
    const embedServers = [
      {
        name: 'Server 1 (FrameX)',
        url: isEpisodic
          ? `https://framextv.cc/embed/${contentId}/${s}/${e}?autoplay=1&no_ads=1`
          : `https://framextv.cc/embed/${contentId}?autoplay=1&no_ads=1`
      },
      {
        name: 'Server 2 (AutoEmbed)',
        url: isEpisodic
          ? `https://player.autoembed.me/embed/tv/${contentId}/${s}/${e}`
          : `https://player.autoembed.me/embed/movie/${contentId}`
      },
      {
        name: 'Server 3 (MultiEmbed)',
        url: isEpisodic
          ? `https://multiembed.mov/?video_id=${contentId}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${contentId}&tmdb=1`
      },
      {
        name: 'Server 4 (2Embed)',
        url: isEpisodic
          ? `https://vidup.to/tv/${contentId}/${s}/${e}?autoPlay=true&theme=e50914&nextButton=true&autoNext=true`
          : `https://vidup.to/movie/${contentId}?autoPlay=true&theme=e50914`
      },
      {
        name: 'Server 5 (VidSrc)',
        url: isEpisodic
          ? `https://vidsrc.to/embed/tv/${contentId}/${s}/${e}`
          : `https://vidsrc.to/embed/movie/${contentId}`
      }
    ];

    const defaultFallbackSubtitles: SubtitleTrack[] = [
      {
        url: `https://subs5.strem.io/en/download/subencoding-stremio-utf8/src-api/file/default_${contentId}`,
        label: 'English',
        lang: 'en',
        language: 'en',
        format: 'vtt',
        isDefault: false
      }
    ];

    const fallbackResolution: PlaybackResolution = {
      success: true,
      contentId: String(contentId),
      mediaType: effectiveType,
      season: isEpisodic ? s : undefined,
      episode: isEpisodic ? e : undefined,
      provider: 'Verified Multi-Server Embed',
      sources: [],
      subtitles: defaultFallbackSubtitles,
      embedUrl: embedServers[0].url,
      embedServers,
      alternates: ['framex', 'autoembed', '2embed', 'vidsrc', 'vidlink']
    };

    const params = new URLSearchParams({
      contentId: String(contentId),
      type: effectiveType
    });
    if (season !== undefined) params.set('season', String(season));
    if (episode !== undefined) params.set('episode', String(episode));

    try {
      const res = await apiFetch<PlaybackResolution>(`/playback/resolve?${params.toString()}`);
      if (res && res.success) {
        // Validate sources to verify they match the requested movie title and normalize streams
        let validSources = (res.sources || [])
          .map((src: any) => ({
            ...src,
            url: normalizeStreamUrl(src.url)
          }))
          .filter((src: any) => isStreamUrlAccurate(src.url, expectedTitle));

        // Multi-provider alternate stream resolution for instant 1080p playback
        const candidateAlternates = Array.isArray(res.alternates) && res.alternates.length > 0
          ? res.alternates
          : ['bowler', 'super_pekka', 'miner', 'headhunter', 'super_barbarian', 'giant'];

        if (validSources.length === 0) {
          for (const altProvider of candidateAlternates) {
            try {
              const altSources = await fetchAlternateSources(contentId, effectiveType, altProvider, season, episode, expectedTitle);
              if (altSources.length > 0) {
                validSources = altSources;
                break;
              }
            } catch {}
          }
        }



        return {
          ...res,
          mediaType: effectiveType,
          sources: validSources,
          subtitles: (res.subtitles || []).map((sub: any) => ({
            ...sub,
            isDefault: false
          })),
          embedServers: embedServers,
          embedUrl: res.embedUrl || embedServers[0].url
        };
      }
    } catch (err: any) {
      console.warn('[Netflix API] Local resolvePlayback failed:', err?.message);
    }

    // Direct FrameX stream fallback
    for (const b of FRAMEX_BACKENDS) {
      try {
        let streamPath = `${b}/api/stream?id=${encodeURIComponent(contentId)}&type=${effectiveType === 'tv' ? 'tv' : 'movie'}`;
        if (effectiveType === 'tv') {
          streamPath += `&season=${s}&episode=${e}`;
        }
        const directRes = await fetch(streamPath, {
          headers: { 'Accept': 'application/json' }
        });
        if (directRes.ok) {
          const data = await directRes.json();
          if (data && data.success && Array.isArray(data.sources) && data.sources.length > 0) {
            // Strictly validate every direct source before accepting and normalize streams
            let validSources = data.sources
              .map((src: any) => ({
                ...src,
                url: normalizeStreamUrl(src.url)
              }))
              .filter((src: any) => isStreamUrlAccurate(src.url, expectedTitle))
              .map((src: any) => ({
                url: src.url,
                quality: src.quality || '1080p',
                type: src.type === 'hls' ? 'hls' : 'mp4',
                server: src.server || data.provider || 'FrameX'
              }));

            // Multi-provider alternate stream failover if primary sources were filtered or empty
            if (validSources.length === 0) {
              const directAlts = Array.isArray(data.alternates) && data.alternates.length > 0
                ? data.alternates
                : ['bowler', 'giant', 'executioner', 'grand_warden'];
              for (const alt of directAlts) {
                try {
                  const altSources = await fetchAlternateSources(contentId, effectiveType, alt, season, episode, expectedTitle);
                  if (altSources.length > 0) {
                    validSources = altSources;
                    break;
                  }
                } catch {}
              }
            }



            return {
              success: true,
              contentId: String(contentId),
              mediaType: effectiveType,
              season: isEpisodic ? s : undefined,
              episode: isEpisodic ? e : undefined,
              provider: data.provider || 'FrameX Direct',
              sources: validSources,
              subtitles: (Array.isArray(data.subtitles) ? data.subtitles : []).map((sub: any) => ({
                ...sub,
                isDefault: false
              })),
              embedUrl: embedServers[0].url,
              embedServers,
              alternates: Array.isArray(data.alternates) ? data.alternates : ['framex', 'autoembed', 'vidbolt', 'vidup', 'vidsrc']
            };
          }
        }
      } catch (e: any) {
        console.warn(`[Netflix API] Stream fallback on ${b} failed:`, e?.message);
      }
    }

    // Direct multi-provider failover across provider pool before embed fallback
    for (const alt of ['bowler', 'giant', 'executioner', 'grand_warden']) {
      try {
        const altSources = await fetchAlternateSources(contentId, effectiveType, alt, season, episode, expectedTitle);
        if (altSources.length > 0) {
          return {
            success: true,
            contentId: String(contentId),
            mediaType: effectiveType,
            season: isEpisodic ? s : undefined,
            episode: isEpisodic ? e : undefined,
            provider: `FrameX ${alt} Direct`,
            sources: altSources,
            subtitles: defaultFallbackSubtitles,
            embedUrl: embedServers[0].url,
            embedServers,
            alternates: ['framex', 'autoembed', 'vidbolt', 'vidup', 'vidsrc']
          };
        }
      } catch {}
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
  getItemProgress(
    contentId: string,
    profileId: string = 'bolt',
    season?: number,
    episode?: number
  ): PlaybackProgress | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      if (!stored) return null;
      const list: PlaybackProgress[] = JSON.parse(stored);
      if (!Array.isArray(list)) return null;
      const match = list.find((p) => {
        if (!p || String(p.contentId) !== String(contentId)) return false;
        const isEpisodic = p.mediaType === 'tv' || p.mediaType === 'anime';
        if (!isEpisodic) return true; // Singles/movies match directly by contentId
        return (season === undefined || p.season === season) &&
               (episode === undefined || p.episode === episode);
      });
      return match || null;
    } catch {
      return null;
    }
  },

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

      // Merge remote & local, strictly deduplicating by contentId for movies, and contentId-season-episode for episodic
      const map = new Map<string, PlaybackProgress>();
      [...remoteList, ...localList].forEach((p) => {
        if (!p || !p.contentId) return;
        const isEpisodic = p.mediaType === 'tv' || p.mediaType === 'anime';
        const key = isEpisodic
          ? `${p.contentId}-s${p.season || 1}-e${p.episode || 1}`
          : String(p.contentId);

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
      const map = new Map<string, PlaybackProgress>();
      localList.forEach((p) => {
        if (!p || !p.contentId) return;
        const isEpisodic = p.mediaType === 'tv' || p.mediaType === 'anime';
        const key = isEpisodic
          ? `${p.contentId}-s${p.season || 1}-e${p.episode || 1}`
          : String(p.contentId);
        if (!map.has(key)) map.set(key, p);
      });
      return Array.from(map.values())
        .filter(p => !(p.durationMs === 0 && p.positionMs === 0 && (!p.poster || p.title === 'Untitled')))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    const isEpisodic = data.mediaType === 'tv' || data.mediaType === 'anime';
    const cleanSeason = isEpisodic ? data.season : undefined;
    const cleanEpisode = isEpisodic ? data.episode : undefined;

    // 1. Immediately persist to localStorage for instant UI reactivity
    const newProgress: PlaybackProgress = {
      ...data,
      profileId,
      contentId: String(contentId),
      season: cleanSeason,
      episode: cleanEpisode,
      updatedAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(`cinewave_progress_${profileId}`);
      const list: PlaybackProgress[] = stored ? JSON.parse(stored) : [];
      const updated = [
        newProgress,
        ...list.filter((p) => {
          if (!p || !p.contentId) return false;
          if (String(p.contentId) !== String(contentId)) return true;
          if (!isEpisodic) return false; // For movies, clear any prior entry with matching contentId
          return !(p.season === cleanSeason && p.episode === cleanEpisode);
        })
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
      if (cleanSeason !== undefined) qParams.set('season', String(cleanSeason));
      if (cleanEpisode !== undefined) qParams.set('episode', String(cleanEpisode));

      const res = await apiFetch<{ success: boolean; progress: PlaybackProgress }>(
        `/users/me/progress/${encodeURIComponent(contentId)}?${qParams.toString()}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            ...data,
            season: cleanSeason,
            episode: cleanEpisode
          })
        }
      );
      return res.progress || newProgress;
    } catch {
      return newProgress;
    }
  }
};
