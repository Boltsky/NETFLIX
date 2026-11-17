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
  device: 'mobile' | 'tablet' | 'desktop' | 'tv';
  os: string;
}

export interface TopTitleStat {
  title: string;
  count: number;
  percentage: number;
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
  recentWatchedMovies: WatchedMovieRecord[];
  recentVisits: VisitRecord[];
  lastUpdated: string;
}
