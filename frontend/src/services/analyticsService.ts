import { api } from './api';
import { VisitPayload } from '../types';

class AnalyticsService {
  private visitorId: string = '';
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private lastTrackedScreen: string = '';
  private lastTrackedTime: number = 0;
  private heartbeatInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVisitor();
      this.startHeartbeat();
      this.initLeaveListeners();
    }
  }

  private initVisitor(): void {
    try {
      // 1. Persistent Anonymous Visitor ID (survives tab and browser restarts)
      let vid = localStorage.getItem('cinewave_visitor_id');
      if (!vid) {
        vid = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('cinewave_visitor_id', vid);
      }
      this.visitorId = vid;

      // 2. Session ID (isolated to current browser session)
      let sid = sessionStorage.getItem('cinewave_session_id');
      if (!sid) {
        sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('cinewave_session_id', sid);
      }
      this.sessionId = sid;

      // 3. Session Start Time (tracks total dwell time on website)
      let sstart = sessionStorage.getItem('cinewave_session_start');
      if (!sstart) {
        sstart = String(Date.now());
        sessionStorage.setItem('cinewave_session_start', sstart);
      }
      this.sessionStartTime = Number(sstart) || Date.now();
    } catch {
      this.visitorId = `v_fallback_${Date.now()}`;
      this.sessionId = `s_fallback_${Date.now()}`;
      this.sessionStartTime = Date.now();
    }
  }

  public detectDevice(): 'mobile' | 'tablet' | 'desktop' | 'tv' {
    if (typeof window === 'undefined') return 'desktop';

    // 1. Android TV / Smart Display
    if (
      (window as any).AndroidTV ||
      /Android TV|CrKey|AFT|SmartTV|Tizen/i.test(navigator.userAgent)
    ) {
      return 'tv';
    }

    const width = window.innerWidth;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 2. Mobile Phone
    if (width < 768) {
      return 'mobile';
    }

    // 3. Tablet
    if (width < 1024 && isTouch) {
      return 'tablet';
    }

    // 4. Laptop / Desktop
    return 'desktop';
  }

  // Detect Operating System (iOS, Android, Windows, macOS, Android TV, Linux)
  public detectOS(): string {
    if (typeof window === 'undefined') return 'Unknown OS';

    const ua = navigator.userAgent;

    // 1. Android TV
    if ((window as any).AndroidTV || /Android TV|CrKey|AFT|SmartTV|Tizen/i.test(ua)) {
      return 'Android TV';
    }

    // 2. iOS (iPhone, iPad, iPod - including iPadOS desktop user-agent mode)
    const isIosDevice =
      /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIosDevice) {
      return 'iOS';
    }

    // 3. Android Phone / Tablet
    if (/Android/i.test(ua)) {
      return 'Android';
    }

    // 4. Windows PC / Laptop
    if (/Windows NT/i.test(ua)) {
      return 'Windows';
    }

    // 5. Apple macOS
    if (/Macintosh|Mac OS X/i.test(ua)) {
      return 'macOS';
    }

    // 6. Linux
    if (/Linux/i.test(ua)) {
      return 'Linux';
    }

    return 'Other OS';
  }

  public getSessionDurationSec(): number {
    if (!this.sessionStartTime) return 0;
    return Math.max(0, Math.floor((Date.now() - this.sessionStartTime) / 1000));
  }

  // Dedicated movie & show playback tracker
  public trackMovieWatch(
    item: { id?: string | number; title: string; type?: string },
    season?: number,
    episode?: number
  ): void {
    if (typeof window === 'undefined' || !item?.title) return;

    let fullTitle = item.title;
    if (item.type === 'tv' || item.type === 'anime' || (season && episode)) {
      fullTitle = `${item.title} (S${season || 1}:E${episode || 1})`;
    }

    const payload: VisitPayload = {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      device: this.detectDevice(),
      os: this.detectOS(),
      screen: 'player',
      titleName: fullTitle,
      titleId: item.id,
      timezone: Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || undefined,
      language: navigator.language || undefined,
      screenResolution: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
      referrer: document.referrer || undefined,
      durationSec: this.getSessionDurationSec(),
      sessionStartTime: this.sessionStartTime
    };

    this.lastTrackedScreen = 'player';
    this.lastTrackedTime = Date.now();
    api.logVisit(payload).catch(() => {});
  }

  public trackVisit(screen: string, titleName?: string, titleId?: string | number): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    // Avoid double logging the exact same screen within 3 seconds
    if (this.lastTrackedScreen === screen && now - this.lastTrackedTime < 3000) {
      return;
    }
    this.lastTrackedScreen = screen;
    this.lastTrackedTime = now;

    const payload: VisitPayload = {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      device: this.detectDevice(),
      os: this.detectOS(),
      screen,
      titleName,
      titleId,
      timezone: Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || undefined,
      language: navigator.language || undefined,
      screenResolution: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
      referrer: document.referrer || undefined,
      durationSec: this.getSessionDurationSec(),
      sessionStartTime: this.sessionStartTime
    };

    api.logVisit(payload).catch(() => {});
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    // Heartbeat every 45 seconds while tab is open to update dwell time spent & active status
    this.heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.trackVisit(this.lastTrackedScreen || 'home');
      }
    }, 45000);
  }

  private initLeaveListeners(): void {
    const handleLeave = () => {
      const payload: VisitPayload = {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        device: this.detectDevice(),
        os: this.detectOS(),
        screen: this.lastTrackedScreen || 'home',
        durationSec: this.getSessionDurationSec(),
        sessionStartTime: this.sessionStartTime
      };
      // Send beacon on exit
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon('/api/v1/analytics/visit', blob);
        } else {
          api.logVisit(payload).catch(() => {});
        }
      } catch {}
    };

    window.addEventListener('pagehide', handleLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    });
  }

  public getVisitorId(): string {
    return this.visitorId;
  }
}

export const analytics = new AnalyticsService();
