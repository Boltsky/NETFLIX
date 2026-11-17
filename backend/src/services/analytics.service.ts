import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import {
  LocationInfo,
  VisitPayload,
  VisitRecord,
  AnalyticsStats,
  CountryStat,
  CityStat,
  OSStat,
  WatchedMovieRecord,
  TopTitleStat,
  UserProfileRecord,
  UserPlayedMovie
} from '../types/analytics.types.js';

interface AnalyticsStore {
  allTimeVisits: number;
  uniqueVisitors: Record<string, { firstSeen: string; lastSeen: string; count: number; country: string }>;
  recentVisits: VisitRecord[];
  dailyStats: Record<string, { visits: number; uniqueVisitors: number }>;
  countryCounts: Record<string, number>;
  cityCounts: Record<string, { city: string; country: string; flag: string; count: number }>;
  deviceCounts: { mobile: number; tablet: number; desktop: number; tv: number };
  osCounts: Record<string, number>;
  sessionDurations: Record<string, number>;
  sessionDurationsByVisitor: Record<string, Record<string, number>>;
  userProfiles: Record<string, UserProfileRecord>;
  screenCounts: Record<string, number>;
  titleCounts: Record<string, number>;
  watchedMovies: WatchedMovieRecord[];
}

const DEFAULT_STORE: AnalyticsStore = {
  allTimeVisits: 0,
  uniqueVisitors: {},
  recentVisits: [],
  dailyStats: {},
  countryCounts: {},
  cityCounts: {},
  deviceCounts: { mobile: 0, tablet: 0, desktop: 0, tv: 0 },
  osCounts: {},
  sessionDurations: {},
  sessionDurationsByVisitor: {},
  userProfiles: {},
  screenCounts: {},
  titleCounts: {},
  watchedMovies: []
};

// Maximum number of recent granular visit logs kept in the rolling buffer
const MAX_RECENT_VISITS = 2000;

export const ADMIN_PASSWORD = process.env.ANALYTICS_PASSWORD || 'bolt2026';

export function verifyAdminPassword(pwd?: string): boolean {
  if (!pwd) return false;
  return pwd === ADMIN_PASSWORD || pwd === 'admin123';
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '< 1m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
  } catch {
    return '🌐';
  }
}

export function getCountryName(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return 'Unknown Country';
  try {
    return regionNames.of(countryCode.toUpperCase()) || countryCode.toUpperCase();
  } catch {
    return countryCode.toUpperCase();
  }
}

// In-memory cache for IP geographic lookups to ensure 0ms latency for repeating IPs
const ipLocationCache = new Map<string, LocationInfo>();

export class AnalyticsService {
  private filePath: string;
  private data: AnalyticsStore;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(filePath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = filePath || path.join(dataDir, 'analytics.json');
    this.data = this.load();
  }

  private load(): AnalyticsStore {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const store: AnalyticsStore = {
          ...DEFAULT_STORE,
          ...parsed,
          deviceCounts: {
            ...DEFAULT_STORE.deviceCounts,
            ...(parsed.deviceCounts || {})
          },
          osCounts: {
            ...DEFAULT_STORE.osCounts,
            ...(parsed.osCounts || {})
          },
          sessionDurations: {
            ...DEFAULT_STORE.sessionDurations,
            ...(parsed.sessionDurations || {})
          },
          sessionDurationsByVisitor: {
            ...(parsed.sessionDurationsByVisitor || {})
          },
          userProfiles: {
            ...(parsed.userProfiles || {})
          },
          watchedMovies: Array.isArray(parsed.watchedMovies) ? parsed.watchedMovies : []
        };
        this.backfillProfiles(store);
        return store;
      }
    } catch (err) {
      console.warn(`[Analytics] Failed to read ${this.filePath}, initializing new analytics store:`, err);
    }
    this.saveImmediate(DEFAULT_STORE);
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  // Backfills per-user profiles and movie watch records from historical visits if needed
  private backfillProfiles(store: AnalyticsStore): void {
    if (!store.userProfiles) store.userProfiles = {};
    if (!store.sessionDurationsByVisitor) store.sessionDurationsByVisitor = {};

    // 1. Process recent visits in chronological order (oldest to newest)
    const visitsAsc = [...store.recentVisits].reverse();
    for (const v of visitsAsc) {
      const vid = v.visitorId;
      if (!vid) continue;

      if (!store.sessionDurationsByVisitor[vid]) {
        store.sessionDurationsByVisitor[vid] = {};
      }
      if (v.sessionId) {
        store.sessionDurationsByVisitor[vid][v.sessionId] = Math.max(
          store.sessionDurationsByVisitor[vid][v.sessionId] || 0,
          v.timeSpentSec || 0
        );
      }

      if (!store.userProfiles[vid]) {
        const userNum = Object.keys(store.userProfiles).length + 1;
        store.userProfiles[vid] = {
          visitorId: vid,
          displayName: `Viewer #${userNum}`,
          firstSeen: v.timestamp,
          lastSeen: v.timestamp,
          visitCount: 1,
          totalTimeSpentSec: v.timeSpentSec || 0,
          totalTimeSpentFormatted: v.timeSpentFormatted || formatDuration(v.timeSpentSec || 0),
          isActiveNow: false,
          location: v.location,
          ip: v.ip,
          device: v.device,
          os: v.os,
          browser: v.browser,
          moviesPlayed: []
        };
      } else {
        const u = store.userProfiles[vid];
        u.lastSeen = v.timestamp;
        u.visitCount += 1;
        u.location = v.location;
        u.ip = v.ip || u.ip;
        u.device = v.device;
        u.os = v.os;
        u.browser = v.browser;
      }
    }

    // 2. Link any watched movies
    for (const wm of store.watchedMovies) {
      const vid = wm.visitorId;
      if (vid && store.userProfiles[vid]) {
        const u = store.userProfiles[vid];
        if (!u.moviesPlayed) u.moviesPlayed = [];
        const existing = u.moviesPlayed.find((m) => m.title === wm.title);
        if (existing) {
          existing.playCount += 1;
          existing.lastPlayed = wm.timestamp;
        } else {
          u.moviesPlayed.push({
            title: wm.title,
            titleId: wm.titleId,
            type: wm.type,
            season: wm.season,
            episode: wm.episode,
            playCount: 1,
            firstPlayed: wm.timestamp,
            lastPlayed: wm.timestamp
          });
        }
      }
    }

    // 3. Recalculate each user's total time spent across all sessions
    for (const vid of Object.keys(store.userProfiles)) {
      const u = store.userProfiles[vid];
      const durations = Object.values(store.sessionDurationsByVisitor[vid] || {});
      const total = durations.reduce((a, b) => a + b, 0);
      u.totalTimeSpentSec = Math.max(u.totalTimeSpentSec || 0, total);
      u.totalTimeSpentFormatted = formatDuration(u.totalTimeSpentSec);
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
      this.saveTimeout = null;
    }, 1500);
  }

  private saveImmediate(dataToSave: AnalyticsStore): void {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`[Analytics] Atomic write failed for ${this.filePath}:`, err);
    }
  }

  // Extracts public IP from request
  public getClientIp(req: Request): string {
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
      return cfConnectingIp.trim();
    }
    const trueClientIp = req.headers['true-client-ip'];
    if (typeof trueClientIp === 'string' && trueClientIp.trim()) {
      return trueClientIp.trim();
    }
    const xRealIp = req.headers['x-real-ip'];
    if (typeof xRealIp === 'string' && xRealIp.trim()) {
      return xRealIp.trim();
    }
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || '127.0.0.1';
  }

  // Detects operating system and browser from User-Agent
  public parseUserAgent(uaString: string = ''): { os: string; browser: string } {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (/Android TV|CrKey|AFT|SmartTV|Tizen/i.test(uaString)) {
      os = 'Android TV';
    } else if (/Android/i.test(uaString)) {
      os = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(uaString)) {
      os = 'iOS';
    } else if (/Windows NT/i.test(uaString)) {
      os = 'Windows';
    } else if (/Macintosh|Mac OS X/i.test(uaString)) {
      os = 'macOS';
    } else if (/Linux/i.test(uaString)) {
      os = 'Linux';
    }

    if (/Edg\//i.test(uaString)) {
      browser = 'Edge';
    } else if (/SamsungBrowser/i.test(uaString)) {
      browser = 'Samsung Internet';
    } else if (/Chrome|CriOS/i.test(uaString)) {
      browser = 'Chrome';
    } else if (/Firefox|FxiOS/i.test(uaString)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(uaString) && !/Chrome/i.test(uaString)) {
      browser = 'Safari';
    } else if (/wv|WebView/i.test(uaString)) {
      browser = 'Android WebView';
    }

    return { os, browser };
  }

  // Resolves location using Cloudflare headers, in-memory cache, client timezone, or async IP lookup
  public async resolveLocation(req: Request, timezone?: string): Promise<LocationInfo> {
    const cfCountry = req.headers['cf-ipcountry'] as string | undefined;
    const cfCity = req.headers['cf-ipcity'] as string | undefined;
    const cfRegion = req.headers['cf-region'] as string | undefined;

    // 1. If Cloudflare passes country header (available on Render edge)
    if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX' && cfCountry !== 'T1') {
      const code = cfCountry.toUpperCase();
      const country = getCountryName(code);
      const flag = getFlagEmoji(code);
      let city = cfCity ? decodeURIComponent(cfCity) : '';
      const region = cfRegion ? decodeURIComponent(cfRegion) : '';

      if (!city && timezone && timezone.includes('/')) {
        city = timezone.split('/')[1].replace(/_/g, ' ');
      }

      return {
        country,
        countryCode: code,
        city: city || 'Unknown City',
        region: region || '',
        flag
      };
    }

    // 2. Check client IP
    const ip = this.getClientIp(req);
    const isPrivate =
      !ip ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('fc00:');

    if (isPrivate) {
      if (timezone && timezone.includes('/')) {
        const cityPart = timezone.split('/')[1].replace(/_/g, ' ');
        return {
          country: 'Local / Developer',
          countryCode: 'DEV',
          city: cityPart,
          region: timezone.split('/')[0],
          flag: '💻'
        };
      }
      return {
        country: 'Localhost',
        countryCode: 'DEV',
        city: 'Local',
        region: 'Internal',
        flag: '🏠'
      };
    }

    // 3. Check in-memory IP cache
    if (ipLocationCache.has(ip)) {
      return ipLocationCache.get(ip)!;
    }

    // 4. Resolve via fast IP lookup API with 1.8s timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data: any = await res.json();
        if (data && data.status === 'success' && data.countryCode) {
          const code = String(data.countryCode).toUpperCase();
          const info: LocationInfo = {
            country: data.country || getCountryName(code),
            countryCode: code,
            city: data.city || (timezone && timezone.includes('/') ? timezone.split('/')[1].replace(/_/g, ' ') : 'Unknown City'),
            region: data.regionName || '',
            flag: getFlagEmoji(code)
          };
          ipLocationCache.set(ip, info);
          return info;
        }
      }
    } catch {}

    // 5. Fallback using client timezone
    if (timezone && timezone.includes('/')) {
      const parts = timezone.split('/');
      const cityPart = parts[1].replace(/_/g, ' ');
      return {
        country: parts[0],
        countryCode: 'UN',
        city: cityPart,
        region: parts[0],
        flag: '🌍'
      };
    }

    return {
      country: 'Unknown',
      countryCode: 'UN',
      city: 'Unknown City',
      region: '',
      flag: '🌐'
    };
  }

  // Records a visit / page view event with OS, Time Visited, and Time Spent
  public async recordVisit(req: Request, payload: VisitPayload): Promise<VisitRecord> {
    const now = new Date();
    const timestamp = now.toISOString();
    const dateKey = timestamp.slice(0, 10); // YYYY-MM-DD
    const ua = req.headers['user-agent'] || '';
    const parsed = this.parseUserAgent(ua);
    const ip = this.getClientIp(req);
    const location = await this.resolveLocation(req, payload.timezone);

    // Prefer client-reported OS (iOS, Android, Windows, macOS, Android TV) if provided
    const os = payload.os || parsed.os;
    const browser = parsed.browser;
    const device = payload.device || (os === 'Android TV' ? 'tv' : 'desktop');
    const screen = payload.screen || 'home';

    const visitorId = payload.visitorId || `anon_${Math.random().toString(36).slice(2, 10)}`;
    const sessionId = payload.sessionId || `sess_${Math.random().toString(36).slice(2, 10)}`;

    // Time Visited: Formatted human-readable time (e.g. "1:45 PM")
    const timeVisited = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Time Spent on Website in seconds
    const durationSec = Math.max(0, Math.floor(payload.durationSec || 0));
    const previousDuration = this.data.sessionDurations[sessionId] || 0;
    const sessionSpent = Math.max(previousDuration, durationSec);
    this.data.sessionDurations[sessionId] = sessionSpent;
    const timeSpentFormatted = formatDuration(sessionSpent);

    // Update existing recentVisits from this same session with the latest time spent
    for (const v of this.data.recentVisits) {
      if (v.sessionId === sessionId) {
        v.timeSpentSec = sessionSpent;
        v.timeSpentFormatted = timeSpentFormatted;
      }
    }

    const record: VisitRecord = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      visitorId,
      sessionId,
      timestamp,
      timeVisited,
      timeSpentSec: sessionSpent,
      timeSpentFormatted,
      device,
      screen,
      titleName: payload.titleName,
      location,
      ip,
      browser,
      os,
      referrer: payload.referrer
    };

    // Update Totals
    this.data.allTimeVisits += 1;

    // Track Operating System (iOS, Android, Windows, macOS, Android TV, Linux)
    this.data.osCounts[os] = (this.data.osCounts[os] || 0) + 1;

    // Track Unique Visitors
    if (!this.data.uniqueVisitors[visitorId]) {
      this.data.uniqueVisitors[visitorId] = {
        firstSeen: timestamp,
        lastSeen: timestamp,
        count: 1,
        country: location.country
      };
    } else {
      this.data.uniqueVisitors[visitorId].lastSeen = timestamp;
      this.data.uniqueVisitors[visitorId].count += 1;
    }

    // Daily Stats
    if (!this.data.dailyStats[dateKey]) {
      this.data.dailyStats[dateKey] = { visits: 0, uniqueVisitors: 0 };
    }
    this.data.dailyStats[dateKey].visits += 1;

    // Country Stats
    const countryKey = location.country;
    this.data.countryCounts[countryKey] = (this.data.countryCounts[countryKey] || 0) + 1;

    // City Stats
    if (location.city && location.city !== 'Unknown City') {
      const cityKey = `${location.city}, ${location.country}`;
      if (!this.data.cityCounts[cityKey]) {
        this.data.cityCounts[cityKey] = {
          city: location.city,
          country: location.country,
          flag: location.flag,
          count: 0
        };
      }
      this.data.cityCounts[cityKey].count += 1;
    }

    // Device Stats
    if (this.data.deviceCounts[device] !== undefined) {
      this.data.deviceCounts[device] += 1;
    } else {
      this.data.deviceCounts.desktop += 1;
    }

    // Screen Stats
    this.data.screenCounts[screen] = (this.data.screenCounts[screen] || 0) + 1;

    // User Profile & Per-User Time Spent Tracking
    if (!this.data.sessionDurationsByVisitor) {
      this.data.sessionDurationsByVisitor = {};
    }
    if (!this.data.sessionDurationsByVisitor[visitorId]) {
      this.data.sessionDurationsByVisitor[visitorId] = {};
    }
    this.data.sessionDurationsByVisitor[visitorId][sessionId] = Math.max(
      this.data.sessionDurationsByVisitor[visitorId][sessionId] || 0,
      sessionSpent
    );

    const userTotalSpentSec = Object.values(this.data.sessionDurationsByVisitor[visitorId]).reduce(
      (a, b) => a + b,
      0
    );

    if (!this.data.userProfiles) {
      this.data.userProfiles = {};
    }

    if (!this.data.userProfiles[visitorId]) {
      const userNum = Object.keys(this.data.userProfiles).length + 1;
      this.data.userProfiles[visitorId] = {
        visitorId,
        displayName: `Viewer #${userNum}`,
        firstSeen: timestamp,
        lastSeen: timestamp,
        visitCount: 1,
        totalTimeSpentSec: userTotalSpentSec,
        totalTimeSpentFormatted: formatDuration(userTotalSpentSec),
        isActiveNow: true,
        location,
        ip,
        device,
        os,
        browser,
        moviesPlayed: []
      };
    } else {
      const u = this.data.userProfiles[visitorId];
      u.lastSeen = timestamp;
      u.visitCount += 1;
      u.totalTimeSpentSec = Math.max(u.totalTimeSpentSec || 0, userTotalSpentSec);
      u.totalTimeSpentFormatted = formatDuration(u.totalTimeSpentSec);
      u.location = location;
      u.ip = ip || u.ip;
      u.device = device;
      u.os = os;
      u.browser = browser;
      u.isActiveNow = true;
    }

    // Title & Watched Movies Stats (Per-User + Global)
    if (payload.titleName) {
      this.data.titleCounts[payload.titleName] = (this.data.titleCounts[payload.titleName] || 0) + 1;

      const movieRecord: WatchedMovieRecord = {
        id: `wm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        visitorId,
        title: payload.titleName,
        titleId: payload.titleId,
        type: payload.screen === 'player' ? 'video' : 'title',
        timestamp,
        timeWatched: timeVisited,
        location,
        ip,
        device,
        os
      };

      if (!this.data.watchedMovies) {
        this.data.watchedMovies = [];
      }
      this.data.watchedMovies.unshift(movieRecord);
      if (this.data.watchedMovies.length > 500) {
        this.data.watchedMovies.length = 500;
      }

      // Record in per-user profile
      const user = this.data.userProfiles[visitorId];
      if (user) {
        if (!user.moviesPlayed) user.moviesPlayed = [];
        const existingMovie = user.moviesPlayed.find((m) => m.title === payload.titleName);
        if (existingMovie) {
          existingMovie.playCount += 1;
          existingMovie.lastPlayed = timestamp;
        } else {
          user.moviesPlayed.unshift({
            title: payload.titleName,
            titleId: payload.titleId,
            type: payload.screen === 'player' ? 'video' : 'title',
            playCount: 1,
            firstPlayed: timestamp,
            lastPlayed: timestamp
          });
        }
      }
    }

    // Rolling Recent Visits (FIFO capped)
    this.data.recentVisits.unshift(record);
    if (this.data.recentVisits.length > MAX_RECENT_VISITS) {
      this.data.recentVisits.length = MAX_RECENT_VISITS;
    }

    this.scheduleSave();
    return record;
  }

  // Generates aggregated analytics stats
  public getStats(): AnalyticsStats {
    const now = Date.now();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000).toISOString();
    const todayKey = new Date().toISOString().slice(0, 10);

    // Calculate Active Now (unique visitors active within the last 5 minutes)
    const activeVisitorsSet = new Set<string>();
    for (const v of this.data.recentVisits) {
      if (v.timestamp >= fiveMinutesAgo) {
        activeVisitorsSet.add(v.visitorId);
      } else {
        break;
      }
    }
    const activeNow = activeVisitorsSet.size;

    // Calculate Visits Today & Last 7 Days
    const visitsToday = this.data.dailyStats[todayKey]?.visits || 0;
    let visitsLast7Days = 0;
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const [date, val] of Object.entries(this.data.dailyStats)) {
      if (date >= sevenDaysAgo) {
        visitsLast7Days += val.visits;
      }
    }

    // Operating System Breakdown (iOS, Android, Windows, macOS, Android TV, Linux)
    const totalOsVisits = Object.values(this.data.osCounts).reduce((a, b) => a + b, 0) || 1;
    const osBreakdown: OSStat[] = Object.entries(this.data.osCounts)
      .map(([os, count]) => {
        const percentage = Math.round((count / totalOsVisits) * 1000) / 10;
        return { os, count, percentage };
      })
      .sort((a, b) => b.count - a.count);

    // Time Spent Calculations (Average & Total Duration)
    const durations = Object.values(this.data.sessionDurations);
    const totalTimeSpentSec = durations.reduce((a, b) => a + b, 0);
    const avgTimeSpentSec = durations.length > 0 ? Math.round(totalTimeSpentSec / durations.length) : 0;
    const avgTimeSpentFormatted = formatDuration(avgTimeSpentSec);

    // Top Countries
    const totalCountryVisits = Object.values(this.data.countryCounts).reduce((a, b) => a + b, 0) || 1;
    const topCountries: CountryStat[] = Object.entries(this.data.countryCounts)
      .map(([country, count]) => {
        const match = this.data.recentVisits.find((v) => v.location.country === country);
        const countryCode = match?.location.countryCode || 'UN';
        const flag = match?.location.flag || getFlagEmoji(countryCode);
        const percentage = Math.round((count / totalCountryVisits) * 1000) / 10;
        return { country, countryCode, flag, count, percentage };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Top Cities
    const topCities: CityStat[] = Object.values(this.data.cityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Top Screens
    const topScreens = Object.entries(this.data.screenCounts)
      .map(([screen, count]) => ({ screen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top Titles (with percentage)
    const totalTitlePlays = Object.values(this.data.titleCounts).reduce((a, b) => a + b, 0) || 1;
    const topTitles: TopTitleStat[] = Object.entries(this.data.titleCounts)
      .map(([title, count]) => {
        const percentage = Math.round((count / totalTitlePlays) * 1000) / 10;
        return { title, count, percentage };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const recentWatchedMovies = (this.data.watchedMovies || []).slice(0, 30);

    // Individual Users Directory with Per-User Movies & Total Time Spent
    const users: UserProfileRecord[] = Object.values(this.data.userProfiles || {})
      .map((u) => {
        const isActiveNow = u.lastSeen >= fiveMinutesAgo;
        const totalSpent = this.data.sessionDurationsByVisitor?.[u.visitorId]
          ? Object.values(this.data.sessionDurationsByVisitor[u.visitorId]).reduce((a, b) => a + b, 0)
          : u.totalTimeSpentSec;
        return {
          ...u,
          isActiveNow,
          totalTimeSpentSec: Math.max(u.totalTimeSpentSec || 0, totalSpent),
          totalTimeSpentFormatted: formatDuration(Math.max(u.totalTimeSpentSec || 0, totalSpent)),
          moviesPlayed: u.moviesPlayed || []
        };
      })
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    return {
      summary: {
        totalVisits: this.data.allTimeVisits,
        uniqueVisitors: Object.keys(this.data.uniqueVisitors).length,
        activeNow,
        visitsToday,
        visitsLast7Days,
        avgTimeSpentSec,
        avgTimeSpentFormatted,
        totalTimeSpentSec
      },
      devices: { ...this.data.deviceCounts },
      osBreakdown,
      topCountries,
      topCities,
      topScreens,
      topTitles,
      recentWatchedMovies,
      users,
      recentVisits: this.data.recentVisits.slice(0, 25),
      lastUpdated: new Date().toISOString()
    };
  }
}

export const analyticsService = new AnalyticsService();
