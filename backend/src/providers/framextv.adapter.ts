import {
  IContentProvider,
  HomeCatalog,
  CatalogRail,
  MediaItem,
  TitleDetails,
  Episode,
  PlaybackResolution,
  StreamSource,
  SubtitleTrack,
  CategoryQueryParams,
  CategoryResponse
} from '../types/index.js';
import { MOCK_HOME_CATALOG, MOCK_TITLES, MOCK_SEASONS, MOCK_ITEMS } from './mock.data.js';

export class FrameXTVAdapter implements IContentProvider {
  public name = 'FrameXTV';
  private backends = [
    'https://api.framextv.tech',
    'https://api.framextv.xyz',
    'https://api.framextv.cc',
    'https://api.framextv.pro'
  ];
  private activeBackendIndex = 0;
  private embedOrigin = 'https://framextv.cc';

  private get activeBackend(): string {
    return this.backends[this.activeBackendIndex];
  }

  private rotateBackend(): string {
    this.activeBackendIndex = (this.activeBackendIndex + 1) % this.backends.length;
    console.warn(`[FrameXTV] Rotated active backend to: ${this.activeBackend}`);
    return this.activeBackend;
  }

  private async fetchWithFailover(path: string, options: RequestInit = {}): Promise<Response> {
    const isStream = path.startsWith('/api/stream');
    const timeoutMs = isStream ? 16000 : 7000;
    const attempts = isStream ? 2 : this.backends.length;
    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      const url = `${this.activeBackend}${path}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CineWaveTV/1.0 (AndroidTV; Linux)',
            ...(options.headers || {})
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          return res;
        }

        if (res.status >= 500) {
          console.warn(`[FrameXTV] Backend ${this.activeBackend} returned HTTP ${res.status} for ${path}`);
          this.rotateBackend();
          continue;
        }

        return res;
      } catch (err: any) {
        lastError = err;
        console.warn(`[FrameXTV] Network error contacting ${this.activeBackend}${path}: ${err.message}`);
        this.rotateBackend();
      }
    }

    throw lastError || new Error(`[FrameXTV] All failover backends failed for ${path}`);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await this.fetchWithFailover('/');
      const data: any = await res.json();
      return !!(data && data.status === 'ok');
    } catch {
      return false;
    }
  }

  async getHomeCatalog(): Promise<HomeCatalog> {
    try {
      const res = await this.fetchWithFailover('/api/home');
      const data: any = await res.json();

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to retrieve home catalog');
      }

      const rails: CatalogRail[] = [];
      const rawRails = data.rails || {};

      const railConfigs: Array<{ key: string; title: string; type: 'movie' | 'tv' | 'anime'; category: string }> = [
        { key: 'trending_movies', title: 'Trending Now', type: 'movie', category: 'trending' },
        { key: 'popular_movies', title: 'Popular Movies', type: 'movie', category: 'popular' },
        { key: 'popular_tv', title: 'Popular TV Series', type: 'tv', category: 'popular' },
        { key: 'popular_anime', title: 'Acclaimed Anime', type: 'anime', category: 'popular' },
        { key: 'new_releases', title: 'New Releases', type: 'movie', category: 'new_releases' },
        { key: 'action_movies', title: 'Action & Adventure', type: 'movie', category: 'action' },
        { key: 'scifi_movies', title: 'Sci-Fi & Fantasy', type: 'movie', category: 'scifi' },
        { key: 'thriller_movies', title: 'Thrillers & Suspense', type: 'movie', category: 'thriller' },
        { key: 'comedy_movies', title: 'Comedy', type: 'movie', category: 'comedy' }
      ];

      for (const config of railConfigs) {
        const rawRail = rawRails[config.key];
        if (rawRail && Array.isArray(rawRail.results) && rawRail.results.length > 0) {
          rails.push({
            id: `rail-${config.key}`,
            title: config.title,
            type: config.type,
            category: config.category,
            items: rawRail.results.map((r: any) => this.mapMediaItem(r, config.type))
          });
        }
      }

      const hero = data.hero ? this.mapMediaItem(data.hero, data.hero.type || 'movie') : (rails[0]?.items[0] || null);

      return {
        hero,
        rails
      };
    } catch (err: any) {
      console.warn('[FrameXTV] getHomeCatalog failed, falling back to cached mock catalog:', err.message);
      return MOCK_HOME_CATALOG;
    }
  }

  async getCategory(options: CategoryQueryParams): Promise<CategoryResponse> {
    const page = Math.max(1, Number(options.page || 1));
    const category = (options.category || 'popular').toLowerCase();
    const type = options.type || (category === 'tv' || category === 'popular_tv' ? 'tv' : 'movie');

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

    let genreId = options.genreId;
    if (!genreId && GENRE_MAP[category]) {
      genreId = GENRE_MAP[category];
    }

    let upstreamPath: string;
    if (genreId) {
      upstreamPath = `/api/discover?genre=${genreId}&page=${page}`;
    } else if (category === 'trending') {
      upstreamPath = `/api/trending?page=${page}`;
    } else if (category === 'popular_tv' || category === 'tv' || type === 'tv') {
      upstreamPath = `/api/tv?page=${page}`;
    } else if (category === 'popular' || category === 'popular_movies' || category === 'movies') {
      upstreamPath = `/api/movies?page=${page}`;
    } else {
      upstreamPath = `/api/movies?page=${page}`;
    }

    try {
      const res = await this.fetchWithFailover(upstreamPath);
      const data: any = await res.json();

      if (data && Array.isArray(data.results)) {
        return {
          success: true,
          category,
          genreId,
          page: Number(data.page || page),
          totalPages: Number(data.totalPages || 100),
          totalResults: Number(data.totalResults || (data.results.length * 10)),
          results: data.results.map((r: any) => this.mapMediaItem(r, type))
        };
      }
    } catch (err: any) {
      console.warn(`[FrameXTV] getCategory failed for ${category} (page ${page}):`, err.message);
    }

    // Fallback: paginate MOCK_ITEMS
    const allMock = Object.values(MOCK_ITEMS);
    let filtered = allMock;
    if (category === 'tv' || category === 'popular_tv') {
      filtered = allMock.filter((m) => m.type === 'tv');
    } else if (genreId) {
      const genreName = Object.keys(GENRE_MAP).find((k) => GENRE_MAP[k] === genreId) || '';
      filtered = allMock.filter((m) => m.genres?.some((g) => g.toLowerCase().includes(genreName)));
      if (filtered.length === 0) filtered = allMock;
    }

    const pageSize = 12;
    const startIndex = ((page - 1) * pageSize) % Math.max(1, filtered.length);
    const paged = filtered.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      category,
      genreId,
      page,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
      totalResults: filtered.length,
      results: paged
    };
  }

  async search(query: string): Promise<MediaItem[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const res = await this.fetchWithFailover(`/api/search?q=${encodeURIComponent(q)}`);
      const data: any = await res.json();

      if (!data || !data.success || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((r: any) => this.mapMediaItem(r, r.type || 'movie'));
    } catch (err: any) {
      console.warn('[FrameXTV] search failed, filtering mock data:', err.message);
      const lower = q.toLowerCase();
      return Object.values(MOCK_TITLES)
        .filter(t => t.title.toLowerCase().includes(lower) || t.overview?.toLowerCase().includes(lower))
        .map(t => this.mapMediaItem(t, t.type));
    }
  }

  async getTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): Promise<TitleDetails> {
    try {
      const res = await this.fetchWithFailover(`/api/details?id=${encodeURIComponent(id)}&type=${type === 'tv' ? 'tv' : 'movie'}`);
      const data: any = await res.json();

      if (!data || !data.success) {
        throw new Error(data?.error || `Failed to retrieve title details for ${id}`);
      }

      const seasons = Array.isArray(data.seasons)
        ? data.seasons
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

      const cast = Array.isArray(data.cast)
        ? data.cast.slice(0, 15).map((c: any) => ({
            id: c.id,
            name: c.name,
            character: c.character || '',
            profile: c.profile || c.profile_path
          }))
        : [];

      const recommendations = Array.isArray(data.recommendations || data.similar)
        ? (data.recommendations || data.similar).slice(0, 12).map((r: any) => this.mapMediaItem(r, type))
        : [];

      return {
        id: String(data.id || id),
        title: data.title || data.name || 'Untitled',
        type: type === 'tv' ? 'tv' : 'movie',
        tagline: data.tagline,
        rating: data.rating ? String(data.rating) : (data.vote_average ? String(data.vote_average) : undefined),
        year: data.year || (data.release_date ? data.release_date.substring(0, 4) : (data.first_air_date ? data.first_air_date.substring(0, 4) : undefined)),
        releaseDate: data.release_date || data.first_air_date,
        poster: data.poster || data.poster_path,
        backdrop: data.backdrop || data.backdrop_path,
        overview: data.overview || '',
        genres: Array.isArray(data.genres) ? data.genres.map((g: any) => typeof g === 'string' ? g : g.name) : [],
        runtime: data.runtime || (Array.isArray(data.episode_run_time) ? data.episode_run_time[0] : undefined),
        status: data.status,
        voteCount: data.vote_count,
        cast,
        recommendations,
        numberOfSeasons: data.number_of_seasons ?? data.numberOfSeasons,
        numberOfEpisodes: data.number_of_episodes ?? data.numberOfEpisodes,
        seasons
      };
    } catch (err: any) {
      console.warn(`[FrameXTV] getTitleDetails failed for ${id}, using mock title:`, err.message);
      if (MOCK_TITLES[id]) {
        return MOCK_TITLES[id];
      }
      throw err;
    }
  }

  async getSeasonEpisodes(id: string, seasonNumber: number): Promise<Episode[]> {
    try {
      const res = await this.fetchWithFailover(`/api/season?id=${encodeURIComponent(id)}&season=${seasonNumber}`);
      const data: any = await res.json();

      if (!data || !data.success || !Array.isArray(data.episodes)) {
        throw new Error(data?.error || `Failed to retrieve season ${seasonNumber} episodes for ${id}`);
      }

      return data.episodes.map((ep: any) => ({
        id: ep.id || ep.episode_number,
        number: ep.episode_number ?? ep.number ?? 1,
        name: ep.name || `Episode ${ep.episode_number ?? ep.number ?? 1}`,
        overview: ep.overview || '',
        still: ep.still || ep.still_path,
        airDate: ep.air_date,
        rating: ep.vote_average ?? ep.rating
      }));
    } catch (err: any) {
      console.warn(`[FrameXTV] getSeasonEpisodes failed for ${id} S${seasonNumber}, checking mock seasons:`, err.message);
      const mockKey = `${id}-s${seasonNumber}`;
      if (MOCK_SEASONS[mockKey]) {
        return MOCK_SEASONS[mockKey];
      }
      return [];
    }
  }

  async resolvePlayback(
    id: string,
    type: 'movie' | 'tv' | 'anime',
    season?: number,
    episode?: number
  ): Promise<PlaybackResolution> {
    const s = season || 1;
    const e = episode || 1;
    const embedUrl = type === 'tv'
      ? `${this.embedOrigin}/embed/${id}/${s}/${e}?autoplay=1`
      : `${this.embedOrigin}/embed/${id}?autoplay=1`;

    const isEpisodic = type === 'tv';
    const embedServers = [
      {
        name: 'Server 1 (VidSrc)',
        url: isEpisodic
          ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
          : `https://vidsrc.to/embed/movie/${id}`
      },
      {
        name: 'Server 2 (MultiEmbed)',
        url: isEpisodic
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1`
      },
      {
        name: 'Server 3 (2Embed)',
        url: isEpisodic
          ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${id}`
      },
      {
        name: 'Server 4 (VidSrc.xyz)',
        url: isEpisodic
          ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
          : `https://vidsrc.xyz/embed/movie/${id}`
      },
      {
        name: 'Server 5 (FrameX)',
        url: isEpisodic
          ? `https://framextv.cc/embed/${id}/${s}/${e}?autoplay=1`
          : `https://framextv.cc/embed/${id}?autoplay=1`
      }
    ];

    try {
      let streamPath = `/api/stream?id=${encodeURIComponent(id)}&type=${type === 'tv' ? 'tv' : 'movie'}`;
      if (type === 'tv') {
        streamPath += `&season=${s}&episode=${e}`;
      }

      const res = await this.fetchWithFailover(streamPath);
      const data: any = await res.json();

      if (data && data.success && Array.isArray(data.sources) && data.sources.length > 0) {
        const sources: StreamSource[] = data.sources.map((src: any) => ({
          url: src.url,
          quality: src.quality || '1080p',
          type: src.type === 'hls' ? 'hls' : 'mp4',
          server: src.server || data.provider || 'FrameX',
          skipProxy: !!src.skipProxy
        }));

        const subtitles: SubtitleTrack[] = Array.isArray(data.subtitles)
          ? data.subtitles.map((sub: any) => ({
              url: sub.url,
              label: sub.label || sub.language || 'English',
              lang: sub.lang || sub.language || 'en',
              language: sub.language || sub.lang,
              format: sub.format === 'srt' ? 'srt' : 'vtt',
              isDefault: false
            }))
          : [];

        return {
          success: true,
          contentId: id,
          mediaType: type,
          season: type === 'tv' ? s : undefined,
          episode: type === 'tv' ? e : undefined,
          provider: data.provider || 'FrameXTV',
          sources,
          subtitles,
          embedUrl,
          embedServers,
          alternates: Array.isArray(data.alternates) ? data.alternates : []
        };
      }
    } catch (err: any) {
      console.warn(`[FrameXTV] Direct stream resolution error for ${id}:`, err.message);
    }

    // Fallback: If external direct extraction failed or has no direct stream, provide FrameXTV Embed.
    // sources is left empty so VideoPlayer activates the verified multi-source FrameXTV player for this exact title!
    return {
      success: true,
      contentId: id,
      mediaType: type,
      season: type === 'tv' ? s : undefined,
      episode: type === 'tv' ? e : undefined,
      provider: 'FrameXTV Embed',
      sources: [],
      subtitles: [],
      embedUrl,
      embedServers,
      alternates: ['cinejoy', 'titan', 'bowler']
    };
  }

  private mapMediaItem(item: any, defaultType: 'movie' | 'tv' | 'anime'): MediaItem {
    return {
      id: String(item.id),
      title: item.title || item.name || 'Untitled',
      type: (item.type === 'tv' || item.type === 'anime') ? item.type : defaultType,
      rating: item.rating ? String(item.rating) : (item.vote_average ? String(item.vote_average) : undefined),
      year: item.year || (item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : undefined)),
      poster: item.poster || item.poster_path || item.image,
      backdrop: item.backdrop || item.backdrop_path,
      overview: item.overview || '',
      genres: Array.isArray(item.genres) ? item.genres : []
    };
  }
}
