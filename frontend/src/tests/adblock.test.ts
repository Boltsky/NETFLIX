import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { adblockService, AdBlockEngine } from '../services/adblockService';

describe('AdBlock Engine & REA Anti-Ad Security Suite', () => {
  const videoPlayerPath = path.resolve(__dirname, '../components/player/VideoPlayer.tsx');

  // =========================================================================
  // 1. adblock-rust Inspired Token-Bucket Matching
  // =========================================================================
  describe('Tokenization and URL Classification', () => {
    it('tokenizes URLs into alphanumeric tokens of length >= 3', () => {
      const tokens = adblockService.tokenize('https://ads.popcash.net/serve/v1?click_id=987');
      expect(tokens).toContain('https');
      expect(tokens).toContain('ads');
      expect(tokens).toContain('popcash');
      expect(tokens).toContain('net');
      expect(tokens).toContain('serve');
      expect(tokens).toContain('click');
      expect(tokens).toContain('987');
      // Tokens < 3 characters should be excluded
      expect(tokens).not.toContain('v1');
    });

    it('correctly flags known popunder, tracking, and casino ad domains', () => {
      const adUrls = [
        'https://subdomain.popcash.net/script.js',
        'https://engine.adsterra.com/banner?id=55',
        'https://monetag.com/push/subscribe',
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'https://stats.g.doubleclick.net/r/collect',
        'https://redirect.1xbet.com/landing?tag=affiliate',
        'https://promo.bet365.com/bonus/offer',
        'https://cdn.spotxchange.com/ad/vast.xml',
        'https://aniview.com/player/vpaid.js'
      ];

      for (const url of adUrls) {
        expect(adblockService.isAdUrl(url), `Expected ${url} to be identified as an ad`).toBe(true);
      }
    });

    it('permits legitimate streaming, catalog, and image assets', () => {
      const cleanUrls = [
        'https://framextv.cc/embed/550?autoplay=1&no_ads=1',
        'https://vidlink.pro/movie/550?primaryColor=e50914&autoplay=true',
        'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        'https://api.themoviedb.org/3/movie/550',
        'https://subs5.strem.io/en/download/subencoding-stremio-utf8/src-api/file/default_550',
        'https://stream.example.com/hls/master.m3u8',
        'https://stream.example.com/hls/1080p/segment_001.ts'
      ];

      for (const url of cleanUrls) {
        expect(adblockService.isAdUrl(url), `Expected ${url} to NOT be flagged as an ad`).toBe(false);
      }
    });

    it('flags ad-specific path and query indicators', () => {
      expect(adblockService.isAdUrl('https://anydomain.org/ads/tracker.js')).toBe(true);
      expect(adblockService.isAdUrl('https://example.com/vmap.xml')).toBe(true);
      expect(adblockService.isAdUrl('https://cdn.example.com/preroll_video.mp4')).toBe(true);
      expect(adblockService.isAdUrl('https://example.com/static/ima3.js')).toBe(true);
    });
  });

  // =========================================================================
  // 2. HLS Stream Ad Segment Filtering
  // =========================================================================
  describe('HLS Fragment Ad Filter', () => {
    it('detects and suppresses ad video segments and warning slides in HLS streams', () => {
      const adFragments = [
        'https://cdn.streaming.net/hls/ad_segment_01.ts',
        'https://edge.video.com/live/preroll_clip.ts',
        'https://host.com/midroll/ad_chunk_5.m4s',
        'https://atlantic.st/stream/warning_slide.ts',
        'https://classroom.best/stream/notice.ts',
        'https://dummy_stream/warning.ts',
        'https://cdn.spotxchange.com/segment/123.ts'
      ];

      for (const frag of adFragments) {
        expect(adblockService.filterHlsAdFragments(frag), `Expected ad fragment ${frag} to be filtered`).toBe(true);
      }
    });

    it('allows clean feature movie HLS segments through unhindered', () => {
      const cleanFragments = [
        'https://cdn.movieserver.org/hls/550/1080p/chunk_0001.ts',
        'https://stream.provider.cc/episodes/s01e01/segment-12.m4s',
        'https://fastcdn.me/video/feature_film_part1.ts'
      ];

      for (const frag of cleanFragments) {
        expect(adblockService.filterHlsAdFragments(frag), `Expected clean fragment ${frag} to pass`).toBe(false);
      }
    });
  });

  // =========================================================================
  // 3. Window & Popup Interceptor Guard
  // =========================================================================
  describe('Window Open Popup Guard', () => {
    beforeEach(() => {
      if (typeof (global as any).window === 'undefined') {
        (global as any).window = {
          open: vi.fn(),
          location: { origin: 'https://netflix.bolt.onrender.com' }
        };
      }
      adblockService.uninstallWindowOpenGuard();
    });

    afterEach(() => {
      adblockService.uninstallWindowOpenGuard();
    });

    it('intercepts and blocks window.open calls targeting ad networks', () => {
      adblockService.installWindowOpenGuard();

      const blockedResult1 = window.open('https://popcash.net/click?id=123');
      expect(blockedResult1).toBeNull();

      const blockedResult2 = window.open('https://monetag.com/popunder');
      expect(blockedResult2).toBeNull();

      const blockedResult3 = window.open('https://1xbet.com/affiliate');
      expect(blockedResult3).toBeNull();
    });

    it('restores original window.open cleanly on unmount', () => {
      const mockOriginal = vi.fn().mockReturnValue({ closed: false });
      window.open = mockOriginal as any;

      adblockService.installWindowOpenGuard();
      adblockService.uninstallWindowOpenGuard();

      window.open('https://netflix.bolt.onrender.com/browse');
      expect(mockOriginal).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. Redirect Surrogates (Google IMA & Ads SDKs)
  // =========================================================================
  describe('Redirect Surrogates', () => {
    beforeEach(() => {
      if (typeof (global as any).window === 'undefined') {
        (global as any).window = {
          open: vi.fn(),
          location: { origin: 'https://netflix.bolt.onrender.com' }
        };
      }
    });

    it('installs Google IMA surrogate stubs without error', () => {
      adblockService.installSurrogates();

      const win = window as any;
      expect(win.google).toBeDefined();
      expect(win.google.ima).toBeDefined();
      expect(typeof win.google.ima.AdsLoader).toBe('function');
      expect(typeof win.google.ima.AdDisplayContainer).toBe('function');
    });

    it('Google IMA surrogate completes simulated ad requests cleanly', async () => {
      adblockService.installSurrogates();
      const win = window as any;

      const loader = new win.google.ima.AdsLoader();
      let adsManagerReceived = false;

      loader.addEventListener('adsManagerLoaded', (e: any) => {
        adsManagerReceived = true;
        const manager = e.getAdsManager();
        expect(typeof manager.init).toBe('function');
        expect(typeof manager.start).toBe('function');
      });

      loader.requestAds();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(adsManagerReceived).toBe(true);
    });
  });

  // =========================================================================
  // 5. VideoPlayer.tsx Security Sandbox Enforcement
  // =========================================================================
  describe('VideoPlayer.tsx Sandbox & Security Integration', () => {
    it('verifies strict sandbox attribute is present directly on embed iframe', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');

      // The iframe element must contain the sandboxed attribute
      const match = code.match(/<iframe[^>]*\bsandbox\s*=\s*["']([^"']*)["']/i);
      expect(match, 'Iframe with sandbox attribute must exist in VideoPlayer.tsx').not.toBeNull();

      const tokens = match![1].split(/\s+/).filter(Boolean);
      expect(tokens).toContain('allow-scripts');
      expect(tokens).toContain('allow-same-origin');
      expect(tokens).toContain('allow-forms');
      expect(tokens).toContain('allow-presentation');

      // Crucial: Must NEVER allow popups or top navigation
      expect(tokens).not.toContain('allow-top-navigation');
      expect(tokens).not.toContain('allow-top-navigation-by-user-activation');
      expect(tokens).not.toContain('allow-popups');
      expect(tokens).not.toContain('allow-popups-to-escape-sandbox');
      expect(tokens).not.toContain('allow-modals');
    });

    it('verifies el.removeAttribute("sandbox") was completely removed', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      expect(code).not.toContain("removeAttribute('sandbox')");
      expect(code).not.toContain('removeAttribute("sandbox")');
    });

    it('verifies adblockService lifecycle is wired into VideoPlayer.tsx', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      expect(code).toContain("import { adblockService } from '../../services/adblockService'");
      expect(code).toContain('adblockService.installWindowOpenGuard()');
      expect(code).toContain('adblockService.installSurrogates()');
      expect(code).toContain('adblockService.uninstallWindowOpenGuard()');
      expect(code).toContain('adblockService.filterHlsAdFragments');
    });
  });
});
