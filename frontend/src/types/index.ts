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
  format: 'vtt' | 'srt' | 'ass';
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

export interface LocationInfo {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  flag: string;
}

export interface VisitPayload {
  visitorId: string;
  sessionId: string;
  device?: 'mobile' | 'tablet' | 'desktop' | 'tv';
  os?: string;
  screen?: string;
  titleId?: string | number;
  titleName?: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
  referrer?: string;
  durationSec?: number;
  sessionStartTime?: number;
}

export interface VisitRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  timestamp: string;
  timeVisited: string;
  timeSpentSec: number;
  timeSpentFormatted: string;
  device: 'mobile' | 'tablet' | 'desktop' | 'tv';
  screen: string;
  titleName?: string;
  location: LocationInfo;
  ip?: string;
  browser: string;
  os: string;
  referrer?: string;
}

export interface CountryStat {
  country: string;
  countryCode: string;
  flag: string;
  count: number;
  percentage: number;
}

export interface CityStat {
  city: string;
  country: string;
  flag: string;
  count: number;
}

export interface OSStat {
  os: string;
  count: number;
  percentage: number;
}

export interface WatchedMovieRecord {
  id: string;
  visitorId: string;
  title: string;
  titleId?: string | number;
  type?: string;
  season?: number;
  episode?: number;
  timestamp: string;
  timeWatched: string;
  location: LocationInfo;
  ip?: string;
  device: 'mobile' | 'tablet' | 'desktop' | 'tv';
  os: string;
}

export interface TopTitleStat {
  title: string;
  count: number;
  percentage: number;
}

export interface UserPlayedMovie {
  title: string;
  titleId?: string | number;
  type?: string;
  season?: number;
  episode?: number;
  playCount: number;
  firstPlayed: string;
  lastPlayed: string;
}

export interface UserProfileRecord {
  visitorId: string;
  displayName: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  totalTimeSpentSec: number;
  totalTimeSpentFormatted: string;
  isActiveNow: boolean;
  location: LocationInfo;
  ip?: string;
  device: 'mobile' | 'tablet' | 'desktop' | 'tv';
  os: string;
  browser: string;
  moviesPlayed: UserPlayedMovie[];
}

export interface AnalyticsStats {
  summary: {
    totalVisits: number;
    uniqueVisitors: number;
    activeNow: number;
    visitsToday: number;
    visitsLast7Days: number;
    avgTimeSpentSec: number;
    avgTimeSpentFormatted: string;
    totalTimeSpentSec: number;
  };
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
    tv: number;
  };
  osBreakdown: OSStat[];
  topCountries: CountryStat[];
  topCities: CityStat[];
  topScreens: Array<{ screen: string; count: number }>;
  topTitles: TopTitleStat[];
  recentWatchedMovies?: WatchedMovieRecord[];
  users?: UserProfileRecord[];
  recentVisits: VisitRecord[];
  lastUpdated: string;
}

export interface AdminAccountConfig {
  email: string;
  username: string;
  password?: string;
  lastUpdated: string;
}

export interface UpdateAdminAccountPayload {
  email?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}
