import { api } from './api';
import { VisitPayload } from '../types';

class AnalyticsService {
  private visitorId: string = '';
  private sessionId: string = '';
  private lastTrackedScreen: string = '';
  private lastTrackedTime: number = 0;
  private heartbeatInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVisitor();
      this.startHeartbeat();
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
    } catch {
      this.visitorId = `v_fallback_${Date.now()}`;
      this.sessionId = `s_fallback_${Date.now()}`;
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
      screen,
      titleName,
      titleId,
      timezone: Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || undefined,
      language: navigator.language || undefined,
      screenResolution: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
      referrer: document.referrer || undefined
    };

    api.logVisit(payload).catch(() => {});
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    // Heartbeat every 2.5 minutes to keep "Active Now" counter accurate
    this.heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.trackVisit(this.lastTrackedScreen || 'home');
      }
    }, 150000);
  }

  public getVisitorId(): string {
    return this.visitorId;
  }
}

export const analytics = new AnalyticsService();
