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
  alternates: string[];
  error?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
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

export interface IContentProvider {
  name: string;
  getHomeCatalog(): Promise<HomeCatalog>;
  search(query: string): Promise<MediaItem[]>;
  getTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): Promise<TitleDetails>;
  getSeasonEpisodes(id: string, seasonNumber: number): Promise<Episode[]>;
  resolvePlayback(id: string, type: 'movie' | 'tv' | 'anime', season?: number, episode?: number): Promise<PlaybackResolution>;
  checkHealth(): Promise<boolean>;
}
