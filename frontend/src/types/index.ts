export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime';
  rating?: string;
  year?: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  genres?: string[];
}

export interface CatalogRail {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime';
  category: string;
  items: MediaItem[];
}

export interface GenreCategory {
  id: string;
  label: string;
  category?: string;
  genreId?: number;
  type?: 'movie' | 'tv' | 'anime';
}

export interface CategoryQueryParams {
  category?: string;
  genreId?: number;
  type?: 'movie' | 'tv' | 'anime';
  page?: number;
}

export interface CategoryResponse {
  success: boolean;
  category: string;
  genreId?: number;
  page: number;
  totalPages: number;
  totalResults: number;
  results: MediaItem[];
}

export interface HomeCatalog {
  hero: MediaItem | null;
  rails: CatalogRail[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile?: string;
}

export interface SeasonSummary {
  id: number;
  number: number;
  name: string;
  overview: string;
  poster?: string;
  episodeCount: number;
  airDate?: string;
}

export interface Episode {
  id: number;
  number: number;
  name: string;
  overview: string;
  still?: string;
  airDate?: string;
  rating?: number;
}

export interface TitleDetails extends MediaItem {
  tagline?: string;
  releaseDate?: string;
  runtime?: number;
  status?: string;
  voteCount?: number;
  cast: CastMember[];
  recommendations: MediaItem[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: SeasonSummary[];
}

export interface StreamSource {
  url: string;
  quality: string;
  type: 'hls' | 'mp4' | 'dash';
  server: string;
  skipProxy?: boolean;
}

export interface SubtitleTrack {
  url: string;
  label: string;
  lang: string;
  language?: string;
  format: 'vtt' | 'srt';
  isDefault?: boolean;
}

export interface EmbedServer {
  name: string;
  url: string;
}

export interface PlaybackResolution {
  success: boolean;
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  season?: number;
  episode?: number;
  provider: string;
  sources: StreamSource[];
  subtitles: SubtitleTrack[];
  embedUrl: string;
  embedServers?: EmbedServer[];
  alternates: string[];
  error?: string;
}

export interface WatchlistItem {
  profileId: string;
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  poster?: string;
  year?: string;
  rating?: string;
  addedAt: string;
}

export interface PlaybackProgress {
  profileId: string;
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  season?: number;
  episode?: number;
  positionMs: number;
  durationMs: number;
  title: string;
  poster?: string;
  updatedAt: string;
}

export interface NetflixProfile {
  id: string;
  name: string;
  avatarBg: string;
  isKids?: boolean;
  isVip?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}
