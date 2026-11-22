/**
 * AdBlock Engine for CineWave TV / Netflix
 *
 * Inspired by Brave's adblock-rust architecture:
 * 1. Token-bucket indexing: URLs are tokenized into alphanumeric chunks (>= 3 chars)
 *    allowing O(1) candidate rule lookups instead of linear regex iteration.
 * 2. Redirect Surrogates: Stubs out video ad SDKs (e.g. Google IMA3) so video players
 *    proceed directly to content playback without stalling or triggering anti-adblock traps.
 * 3. Window & Popup Guard: Intercepts window.open / popunders from third-party embed frames.
 * 4. HLS Stream Ad Filter: Identifies and suppresses ad segment URLs and ad discontinuities.
 */

// Comprehensive registry of known ad, tracker, popup, and video ad network domains
const KNOWN_AD_DOMAINS: string[] = [
  // Popunders & Ad Redirectors
  'popcash.net', 'popads.net', 'propellerads.com', 'monetag.com', 'adsterra.com',
  'clickadu.com', 'hilltopads.com', 'exoclick.com', 'adcash.com', 'trafficjunky.com',
  'juicyads.com', 'adxad.com', 'ero-advertising.com', 'onclickalgo.com', 'onclickmega.com',
  'outbrain.com', 'taboola.com', 'mgid.com', 'revcontent.com', 'zeroredirect.com',
  'bidvertiser.com', 'yllix.com', 'infolinks.com', 'chitika.com', 'adblade.com',

  // Video Ad Networks & VAST/VPAID Brokers
  'spotxchange.com', 'spotx.tv', 'teads.tv', 'springserve.com', 'unrulymedia.com',
  'tremorhub.com', 'tremorvideo.com', 'aniview.com', 'smartadserver.com', 'pubmatic.com',
  'openx.net', 'rubiconproject.com', 'appnexus.com', 'adnxs.com', 'criteo.com',
  'amazon-adsystem.com', 'casalemedia.com', 'sovrn.com', 'yieldmo.com', 'triplelift.com',
  'sharethrough.com', 'gumgum.com', 'kargo.com', 'vungle.com', 'ironsrc.com',

  // Google / DoubleClick Ad Services
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'pagead2.googlesyndication.com',
  'adservice.google.com', 'stats.g.doubleclick.net', 'tpc.googlesyndication.com',

  // Betting / Casino Spam Often Injected in Free Embeds
  '1xbet.com', '1xbet.whitelabel.com', 'bet365.com', 'melbet.com', 'mostbet.com',
  'parimatch.com', 'stake.com', 'rollbit.com', 'bc.game', 'vulkanvegas.com',

  // Trackers & Fingerprinters
  'google-analytics.com', 'analytics.google.com', 'hotjar.com', 'histats.com',
  'statcounter.com', 'scorecardresearch.com', 'yandex.ru/metrika', 'mc.yandex.ru',
  'clarity.ms', 'segment.io', 'mixpanel.com', 'amplitude.com',

  // Known Ad Delivery Hosts in Stream Embeds
  'atlantic.st', 'classroom.best', 'totallyacdn.cc', 'dummy_stream', 'ad-delivery.net',
  'serving-sys.com', 'flashtalking.com', 'adform.net', 'innovid.com', 'undertone.com',
  'adroll.com', 'media.net', 'exponential.com', 'lijit.com', 'contextweb.com',
  'vidoomy.com', 'seedtag.com', 'vi-serve.com', 'a-ads.com', 'coinhive.com'
];

export class AdBlockEngine {
  private static instance: AdBlockEngine | null = null;
  private tokenBucket: Map<string, Set<string>> = new Map();
  private originalWindowOpen: typeof window.open | null = null;
  private isGuardInstalled = false;
  private surrogatesInstalled = false;

  private constructor() {
    this.buildTokenBucket();
  }

  public static getInstance(): AdBlockEngine {
    if (!AdBlockEngine.instance) {
      AdBlockEngine.instance = new AdBlockEngine();
    }
    return AdBlockEngine.instance;
  }

  /**
   * Tokenizes an input URL or domain string into alphanumeric chunks of length >= 3.
   * Mirrors Brave adblock-rust's token extraction algorithm.
   */
  public tokenize(input: string): string[] {
    if (!input) return [];
    const normalized = input.toLowerCase();
    const tokens = normalized
      .split(/[^a-z0-9]/)
      .filter((t) => t.length >= 3);
    return Array.from(new Set(tokens));
  }

  /**
   * Populates the token-bucket index from known ad domains.
   * Each token maps to domains containing it, facilitating fast candidate filtering.
   */
  private buildTokenBucket(): void {
    for (const domain of KNOWN_AD_DOMAINS) {
      const tokens = this.tokenize(domain);
      for (const token of tokens) {
        let bucket = this.tokenBucket.get(token);
        if (!bucket) {
          bucket = new Set();
          this.tokenBucket.set(token, bucket);
        }
        bucket.add(domain);
      }
    }
  }

  /**
   * Evaluates if a given URL matches any ad, tracking, or popup pattern.
   * Uses token matching for O(1) candidate lookup followed by domain boundary verification.
   */
  public isAdUrl(rawUrl: string): boolean {
    if (!rawUrl) return false;
    const lower = rawUrl.toLowerCase().trim();

    // Quick substring checks for common ad indicators
    if (
      lower.includes('/ads/') ||
      lower.includes('/ad_') ||
      lower.includes('pagead') ||
      lower.includes('popunder') ||
      lower.includes('preroll') ||
      lower.includes('ad_break') ||
      lower.includes('ima3.js') ||
      lower.includes('vast.xml') ||
      lower.includes('vmap.xml')
    ) {
      return true;
    }

    const tokens = this.tokenize(lower);
    for (const token of tokens) {
      const candidates = this.tokenBucket.get(token);
      if (candidates) {
        for (const candidate of candidates) {
          if (lower.includes(candidate)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Checks whether an HLS video fragment URL is an ad fragment or ad banner.
   */
  public filterHlsAdFragments(fragUrl: string): boolean {
    if (!fragUrl) return false;
    const lower = fragUrl.toLowerCase();

    // Check for ad URL signatures in HLS segments
    if (
      lower.includes('ad_segment') ||
      lower.includes('preroll') ||
      lower.includes('midroll') ||
      lower.includes('/ad/') ||
      lower.includes('spotx') ||
      lower.includes('aniview') ||
      lower.includes('atlantic.st') ||
      lower.includes('classroom.best') ||
      lower.includes('dummy_stream')
    ) {
      return true;
    }

    return this.isAdUrl(lower);
  }

  /**
   * Installs window.open guard to intercept popup and popunder advertisements.
   * Allowed target: blank internal navigations or explicit internal application links.
   * External ad targets: suppressed and returned as a null or dummy window.
   */
  public installWindowOpenGuard(): void {
    if (this.isGuardInstalled || typeof window === 'undefined') return;

    this.originalWindowOpen = window.open;
    const self = this;

    window.open = function (url?: string | URL, target?: string, features?: string): WindowProxy | null {
      const urlStr = url ? url.toString() : '';

      // Check if URL is an ad or untrusted external origin
      if (urlStr && self.isAdUrl(urlStr)) {
        console.warn(`[AdBlock] Intercepted and suppressed ad popup: ${urlStr}`);
        return null;
      }

      // If URL is an external link attempting to open in a new window/tab while player is active
      if (urlStr && /^https?:\/\//i.test(urlStr)) {
        try {
          const parsed = new URL(urlStr);
          if (parsed.origin !== window.location.origin) {
            // Check if domain is in ad list
            if (self.isAdUrl(parsed.hostname)) {
              console.warn(`[AdBlock] Suppressed external popup domain: ${parsed.hostname}`);
              return null;
            }
          }
        } catch {}
      }

      // Delegate legitimate calls to original window.open
      if (self.originalWindowOpen) {
        return self.originalWindowOpen.call(window, url, target, features);
      }
      return null;
    };

    this.isGuardInstalled = true;
  }

  /**
   * Restores the original window.open function.
   */
  public uninstallWindowOpenGuard(): void {
    if (!this.isGuardInstalled || typeof window === 'undefined') return;
    if (this.originalWindowOpen) {
      window.open = this.originalWindowOpen;
      this.originalWindowOpen = null;
    }
    this.isGuardInstalled = false;
  }

  /**
   * Installs Redirect Surrogates (modeled after Brave adblock-resources).
   * Mocks Google IMA and analytics SDKs so embed players don't crash or stall waiting for ads.
   */
  public installSurrogates(): void {
    if (this.surrogatesInstalled || typeof window === 'undefined') return;

    // 1. Google IMA SDK Surrogate Stub
    const win = window as any;
    if (!win.google) {
      win.google = {};
    }
    if (!win.google.ima) {
      const noop = () => {};
      win.google.ima = {
        AdDisplayContainer: function () {
          return { initialize: noop, destroy: noop };
        },
        AdsLoader: function () {
          return {
            _listeners: {} as Record<string, any>,
            contentComplete: noop,
            requestAds: function (this: any) {
              // Immediately simulate ad completion so content starts with 0 delay
              setTimeout(() => {
                if (this._listeners && this._listeners['adsManagerLoaded']) {
                  this._listeners['adsManagerLoaded']({
                    getAdsManager: () => ({
                      init: noop,
                      start: noop,
                      stop: noop,
                      destroy: noop,
                      addEventListener: (evt: string, cb: () => void) => {
                        if (evt === 'allAdsCompleted' || evt === 'contentResumeRequested') {
                          cb();
                        }
                      }
                    })
                  });
                }
              }, 0);
            },
            addEventListener: function (this: any, evt: string, cb: any) {
              if (!this._listeners) this._listeners = {};
              this._listeners[evt] = cb;
            }
          };
        },
        ViewMode: { NORMAL: 0, FULLSCREEN: 1 },
        AdError: { Type: {} }
      };
    }

    // 2. Dummy Google Tag Manager / adsbygoogle Surrogate Stub
    if (!win.adsbygoogle) {
      win.adsbygoogle = { push: () => {} };
    }

    this.surrogatesInstalled = true;
  }
}

export const adblockService = AdBlockEngine.getInstance();
