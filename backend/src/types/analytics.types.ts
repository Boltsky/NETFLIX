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
  screen?: string;
  titleId?: string | number;
  titleName?: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
  referrer?: string;
}

export interface VisitRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  timestamp: string;
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

export interface AnalyticsStats {
  summary: {
    totalVisits: number;
    uniqueVisitors: number;
    activeNow: number;
    visitsToday: number;
    visitsLast7Days: number;
  };
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
    tv: number;
  };
  topCountries: CountryStat[];
  topCities: CityStat[];
  topScreens: Array<{ screen: string; count: number }>;
  topTitles: Array<{ title: string; count: number }>;
  recentVisits: VisitRecord[];
  lastUpdated: string;
}
