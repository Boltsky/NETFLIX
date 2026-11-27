import {
  MediaItem,
  TitleDetails,
  Episode,
  CategoryQueryParams,
  CategoryResponse,
  HomeCatalog,
  CatalogRail
} from '../types/index.js';

const TMDB_API_KEYS = [
  '8265bd1679663a7ea12ac168da84d2e8',
  '4113f36a5fa39233075242c75e340294',
  'b86ae9481977e13e00e0fe7ce13a9ba0',
  '15d2ade0fe30e38371f7d329acfb97d5'
];

let activeKeyIndex = 0;
let homeCatalogCache: HomeCatalog | null = null;
let homeCatalogCacheTime = 0;

function getApiKey(): string {
  return TMDB_API_KEYS[activeKeyIndex % TMDB_API_KEYS.length];
}

function rotateApiKey(): void {
  activeKeyIndex = (activeKeyIndex + 1) % TMDB_API_KEYS.length;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T | null> {
  for (let attempt = 0; attempt < TMDB_API_KEYS.length; attempt++) {
    const key = getApiKey();
    const query = new URLSearchParams({
      api_key: key,
      language: 'en-US',
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    });

    const url = `https://api.themoviedb.org/3${endpoint}?${query.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as T;
      }

      if (res.status === 401 || res.status === 429) {
        rotateApiKey();
        continue;
      }

      return null;
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn(`[TMDB] Fetch error for ${endpoint}:`, e.message);
      rotateApiKey();
    }
  }
  return null;
}

export function mapTmdbMediaItem(raw: any, defaultType: 'movie' | 'tv' | 'anime' = 'movie'): MediaItem {
  const isTv = raw.media_type === 'tv' || raw.first_air_date !== undefined || raw.number_of_seasons !== undefined;
  const isAnime =
    raw.genre_ids?.includes(16) ||
    raw.genres?.some((g: any) => (typeof g === 'string' ? g : g.name)?.toLowerCase().includes('animation'));

  const type = isTv ? (isAnime ? 'anime' : 'tv') : (isAnime ? 'anime' : (raw.type || defaultType));
  const poster = raw.poster_path
    ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
    : (raw.poster || raw.image);
  const backdrop = raw.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}`
    : (raw.backdrop || poster);

  const year = raw.release_date
    ? raw.release_date.slice(0, 4)
    : (raw.first_air_date ? raw.first_air_date.slice(0, 4) : raw.year);

  const rating = raw.vote_average
    ? String(Number(raw.vote_average).toFixed(1))
    : (raw.rating ? String(raw.rating) : undefined);

  const genres = Array.isArray(raw.genres)
    ? raw.genres.map((g: any) => (typeof g === 'string' ? g : g.name))
    : [];

  return {
    id: String(raw.id),
    title: raw.title || raw.name || 'Untitled',
    type,
    rating,
    year,
    poster,
    backdrop,
    overview: raw.overview || '',
    genres
  };
}

export const tmdbService = {
  async getHomeCatalog(): Promise<HomeCatalog | null> {
    const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in-memory cache
    if (homeCatalogCache && (Date.now() - homeCatalogCacheTime < CACHE_TTL_MS)) {
      return homeCatalogCache;
    }

    try {
      const [
        nowPlayingData,
        trendingData,
        popularMoviesData,
        popularTvData,
        upcomingData,
        onTheAirData,
        actionData,
        scifiData,
        thrillerData,
        comedyData,
        animeData
      ] = await Promise.all([
        tmdbFetch<any>('/movie/now_playing', { page: 1 }),
        tmdbFetch<any>('/trending/all/day', { page: 1 }),
        tmdbFetch<any>('/movie/popular', { page: 1 }),
        tmdbFetch<any>('/tv/popular', { page: 1 }),
        tmdbFetch<any>('/movie/upcoming', { page: 1 }),
        tmdbFetch<any>('/tv/on_the_air', { page: 1 }),
        tmdbFetch<any>('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc', page: 1 }),
        tmdbFetch<any>('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc', page: 1 }),
        tmdbFetch<any>('/discover/movie', { with_genres: 53, sort_by: 'popularity.desc', page: 1 }),
        tmdbFetch<any>('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc', page: 1 }),
        tmdbFetch<any>('/discover/movie', { with_genres: 16, sort_by: 'popularity.desc', page: 1 })
      ]);

      const rails: CatalogRail[] = [];

      if (nowPlayingData && Array.isArray(nowPlayingData.results) && nowPlayingData.results.length > 0) {
        rails.push({
          id: 'rail-new-releases',
          title: 'Newly Released in Theaters & Streaming',
          type: 'movie',
          category: 'new_releases',
          items: nowPlayingData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (trendingData && Array.isArray(trendingData.results) && trendingData.results.length > 0) {
        rails.push({
          id: 'rail-trending',
          title: 'Trending Now',
          type: 'movie',
          category: 'trending',
          items: trendingData.results.map((r: any) => mapTmdbMediaItem(r, r.media_type === 'tv' ? 'tv' : 'movie'))
        });
      }

      if (popularMoviesData && Array.isArray(popularMoviesData.results) && popularMoviesData.results.length > 0) {
        rails.push({
          id: 'rail-popular-movies',
          title: 'Blockbuster Movies',
          type: 'movie',
          category: 'popular',
          items: popularMoviesData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (popularTvData && Array.isArray(popularTvData.results) && popularTvData.results.length > 0) {
        rails.push({
          id: 'rail-popular-tv',
          title: 'Popular TV Series',
          type: 'tv',
          category: 'tv',
          items: popularTvData.results.map((r: any) => mapTmdbMediaItem(r, 'tv'))
        });
      }

      if (upcomingData && Array.isArray(upcomingData.results) && upcomingData.results.length > 0) {
        rails.push({
          id: 'rail-upcoming',
          title: 'Upcoming & In Theaters',
          type: 'movie',
          category: 'upcoming',
          items: upcomingData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (actionData && Array.isArray(actionData.results) && actionData.results.length > 0) {
        rails.push({
          id: 'rail-action',
          title: 'Action & Adventure',
          type: 'movie',
          category: 'action',
          items: actionData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (scifiData && Array.isArray(scifiData.results) && scifiData.results.length > 0) {
        rails.push({
          id: 'rail-scifi',
          title: 'Sci-Fi & Fantasy',
          type: 'movie',
          category: 'scifi',
          items: scifiData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (thrillerData && Array.isArray(thrillerData.results) && thrillerData.results.length > 0) {
        rails.push({
          id: 'rail-thriller',
          title: 'Thrillers & Suspense',
          type: 'movie',
          category: 'thriller',
          items: thrillerData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (comedyData && Array.isArray(comedyData.results) && comedyData.results.length > 0) {
        rails.push({
          id: 'rail-comedy',
          title: 'Comedy Hits',
          type: 'movie',
          category: 'comedy',
          items: comedyData.results.map((r: any) => mapTmdbMediaItem(r, 'movie'))
        });
      }

      if (animeData && Array.isArray(animeData.results) && animeData.results.length > 0) {
        rails.push({
          id: 'rail-anime',
          title: 'Acclaimed Anime & Animation',
          type: 'anime',
          category: 'anime',
          items: animeData.results.map((r: any) => mapTmdbMediaItem(r, 'anime'))
        });
      }

      if (onTheAirData && Array.isArray(onTheAirData.results) && onTheAirData.results.length > 0) {
        rails.push({
          id: 'rail-tv-airing',
          title: 'Currently Airing Series',
          type: 'tv',
          category: 'tv_airing',
          items: onTheAirData.results.map((r: any) => mapTmdbMediaItem(r, 'tv'))
        });
      }

      if (rails.length < 4) {
        return null;
      }

      // Pick the best backdrop candidate for Hero Spotlight from trending or new releases
      const heroPool = [
        ...(trendingData?.results || []),
        ...(nowPlayingData?.results || []),
        ...(popularMoviesData?.results || [])
      ];

      const heroCandidate = heroPool.find((r: any) => r.backdrop_path && r.poster_path && r.overview && r.overview.length > 20) || heroPool[0];
      const hero = heroCandidate ? mapTmdbMediaItem(heroCandidate, heroCandidate.media_type === 'tv' ? 'tv' : 'movie') : (rails[0]?.items[0] || null);

      const catalog: HomeCatalog = {
        hero,
        rails
      };

      homeCatalogCache = catalog;
      homeCatalogCacheTime = Date.now();
      return catalog;
    } catch (err: any) {
      console.warn('[TMDB] getHomeCatalog error:', err.message);
      return null;
    }
  },

  async search(query: string): Promise<MediaItem[]> {
    const q = query.trim();
    if (!q) return [];

    const data = await tmdbFetch<any>('/search/multi', {
      query: q,
      include_adult: 'false',
      page: 1
    });

    if (!data || !Array.isArray(data.results)) {
      return [];
    }

    return data.results
      .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv' || !r.media_type)
      .map((r: any) => mapTmdbMediaItem(r, r.media_type || 'movie'));
  },

  async getCategory(options: CategoryQueryParams): Promise<CategoryResponse> {
    const page = Math.max(1, Number(options.page || 1));
    const category = (options.category || 'popular').toLowerCase();
    const type = options.type || (category === 'tv' || category === 'popular_tv' ? 'tv' : 'movie');

    const isTv = type === 'tv' || category === 'tv' || category === 'popular_tv';
    let endpoint = '/movie/popular';
    const params: Record<string, string | number> = { page };

    if (category === 'trending') {
      endpoint = '/trending/all/day';
    } else if (category === 'new_releases' || category === 'new-releases' || category === 'now_playing') {
      endpoint = '/movie/now_playing';
    } else if (category === 'upcoming') {
      endpoint = '/movie/upcoming';
    } else if (category === 'tv_airing' || category === 'airing_tv' || category === 'on_the_air') {
      endpoint = '/tv/on_the_air';
    } else if (options.genreId) {
      endpoint = isTv ? '/discover/tv' : '/discover/movie';
      params.with_genres = options.genreId;
      params.sort_by = 'popularity.desc';
    } else if (isTv) {
      endpoint = '/tv/popular';
    } else {
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
      if (GENRE_MAP[category]) {
        endpoint = '/discover/movie';
        params.with_genres = GENRE_MAP[category];
        params.sort_by = 'popularity.desc';
      }
    }

    const data = await tmdbFetch<any>(endpoint, params);

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      return {
        success: true,
        category,
        genreId: options.genreId,
        page: Number(data.page || page),
        totalPages: Math.min(100, Number(data.total_pages || 100)),
        totalResults: Number(data.total_results || (data.results.length * 10)),
        results: data.results.map((r: any) => mapTmdbMediaItem(r, type))
      };
    }

    return {
      success: true,
      category,
      genreId: options.genreId,
      page,
      totalPages: 1,
      totalResults: 0,
      results: []
    };
  },

  async getTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): Promise<TitleDetails | null> {
    const isTv = type === 'tv' || type === 'anime';
    const endpoint = isTv ? `/tv/${id}` : `/movie/${id}`;

    const data = await tmdbFetch<any>(endpoint, {
      append_to_response: 'credits,recommendations,similar'
    });

    if (!data || (!data.title && !data.name)) {
      return null;
    }

    const seasons = Array.isArray(data.seasons)
      ? data.seasons
          .filter((s: any) => (s.season_number ?? s.number ?? 0) > 0)
          .map((s: any) => ({
            id: s.id || s.season_number,
            number: s.season_number ?? s.number ?? 1,
            name: s.name || `Season ${s.season_number ?? s.number ?? 1}`,
            overview: s.overview || '',
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : undefined,
            episodeCount: s.episode_count ?? s.episodeCount ?? 0,
            airDate: s.air_date
          }))
      : undefined;

    const cast = Array.isArray(data.credits?.cast)
      ? data.credits.cast.slice(0, 15).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character || '',
          profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined
        }))
      : [];

    const rawRecs = Array.isArray(data.recommendations?.results) && data.recommendations.results.length > 0
      ? data.recommendations.results
      : (data.similar?.results || []);

    const recommendations = Array.isArray(rawRecs)
      ? rawRecs.slice(0, 12).map((r: any) => mapTmdbMediaItem(r, type))
      : [];

    const baseItem = mapTmdbMediaItem(data, type);

    return {
      ...baseItem,
      tagline: data.tagline,
      releaseDate: data.release_date || data.first_air_date,
      runtime: data.runtime || (Array.isArray(data.episode_run_time) ? data.episode_run_time[0] : undefined),
      status: data.status,
      voteCount: data.vote_count,
      cast,
      recommendations,
      numberOfSeasons: isTv ? (data.number_of_seasons ?? seasons?.length) : undefined,
      numberOfEpisodes: isTv ? data.number_of_episodes : undefined,
      seasons
    };
  },

  async getSeasonEpisodes(id: string, seasonNumber: number): Promise<Episode[]> {
    const data = await tmdbFetch<any>(`/tv/${id}/season/${seasonNumber}`);

    if (data && Array.isArray(data.episodes)) {
      return data.episodes.map((ep: any) => ({
        id: ep.id || ep.episode_number,
        number: ep.episode_number ?? ep.number ?? 1,
        name: ep.name || `Episode ${ep.episode_number ?? ep.number ?? 1}`,
        overview: ep.overview || '',
        still: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : undefined,
        airDate: ep.air_date,
        rating: ep.vote_average
      }));
    }

    return [];
  }
};
