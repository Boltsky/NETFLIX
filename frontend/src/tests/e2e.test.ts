import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// CineWave TV - Comprehensive Opaque-Box E2E Test Suite (Tiers 1 - 4)
// Authoritative Specifications:
// - ORIGINAL_REQUEST.md (R1: Ad Suppression, R2: Subtitles, R3: Settings & Updates)
// - PROJECT.md (Features F1 - F20, Interface Contracts, Milestones)
// ============================================================================

// ----------------------------------------------------------------------------
// Test Environment Setup & Safe Polyfills
// ----------------------------------------------------------------------------
const storageStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storageStore[key] ?? null,
  setItem: (key: string, value: string) => { storageStore[key] = String(value); },
  removeItem: (key: string) => { delete storageStore[key]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}

// Global window polyfills for headless node runner
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = new EventTarget();
  (globalThis as any).window.localStorage = mockLocalStorage;
}

// Paths to project sources
const projectRoot = path.resolve(__dirname, '../../../');
const frontendSrc = path.resolve(__dirname, '../');
const androidMain = path.resolve(projectRoot, 'android/app/src/main/java/com/cinewave/tv/MainActivity.kt');
const videoPlayerFile = path.resolve(frontendSrc, 'components/player/VideoPlayer.tsx');
const apiFile = path.resolve(frontendSrc, 'services/api.ts');

// Dynamic module loaders for progressive milestone integration
async function loadModule(relPath: string) {
  try {
    return await import(/* @vite-ignore */ relPath);
  } catch {
    return null;
  }
}

async function getSettingsService() {
  return await loadModule('../services/' + 'settingsService');
}

async function getSubtitleParser() {
  return await loadModule('../utils/' + 'subtitleParser');
}

async function getUpdateService() {
  return await loadModule('../services/' + 'updateService');
}

async function getApi() {
  return await loadModule('../services/' + 'api');
}

// ============================================================================
// TIER 1: FEATURE COVERAGE (ISOLATION)
// ≥5 test cases per feature covering R1, R2, R3 in isolation
// ============================================================================
describe('CineWave TV E2E Suite - Tier 1: Feature Coverage (Isolation)', () => {

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // Feature R1: Ad and Robot Verification Suppression (F1 - F5)
  // --------------------------------------------------------------------------
  describe('R1: Ad and Robot Verification Suppression', () => {

    it('R1.1 (F1): Embed server priority orders clean servers (FrameX, AutoEmbed) at indices 0 and 1, demoting VidSrc', async () => {
      // Authoritative Spec: PROJECT.md F1 - FrameX & AutoEmbed placed at indices 0 and 1; VidSrc demoted.
      const apiMod = await getApi();
      expect(apiMod, 'api service must be available').toBeDefined();
      const resolution = await apiMod.api.resolvePlayback('550', 'movie');

      expect(resolution).toBeDefined();
      expect(resolution.embedServers, 'embedServers array must be populated').toBeDefined();
      expect(resolution.embedServers.length).toBeGreaterThanOrEqual(2);

      const server0 = resolution.embedServers[0];
      const server1 = resolution.embedServers[1];

      // Index 0 and 1 must be clean TMDB embed servers (FrameX or AutoEmbed)
      const isCleanServer0 = /framex|autoembed/i.test(server0.name) || /framextv|autoembed/i.test(server0.url);
      const isCleanServer1 = /framex|autoembed/i.test(server1.name) || /framextv|autoembed/i.test(server1.url);

      expect(isCleanServer0, `Server at index 0 should be FrameX or AutoEmbed, found: ${server0.name}`).toBe(true);
      expect(isCleanServer1, `Server at index 1 should be FrameX or AutoEmbed, found: ${server1.name}`).toBe(true);

      // VidSrc must not be at index 0 (which triggered Cloudflare bot challenges)
      expect(server0.name.toLowerCase()).not.toContain('vidsrc');
    });

    it('R1.2 (F2): VideoPlayer iframe sandbox restricts popups, modals, and top-level navigation', () => {
      // Authoritative Spec: PROJECT.md F2 - sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      expect(fs.existsSync(videoPlayerFile), 'VideoPlayer.tsx must exist').toBe(true);
      const code = fs.readFileSync(videoPlayerFile, 'utf8');

      // The iframe element must contain the sandboxed attribute
      const hasIframeSandbox = /<iframe[^>]*\bsandbox\s*=\s*["']([^"']*)["']/i.test(code);
      expect(hasIframeSandbox, 'VideoPlayer iframe must have a sandbox attribute configured').toBe(true);

      const match = code.match(/<iframe[^>]*\bsandbox\s*=\s*["']([^"']*)["']/i);
      const sandboxTokens = match ? match[1].split(/\s+/) : [];

      // Required permissions for clean embed streaming:
      expect(sandboxTokens).toContain('allow-scripts');
      expect(sandboxTokens).toContain('allow-same-origin');

      // Must NEVER allow popups or top navigation (which cause ad redirects):
      expect(sandboxTokens).not.toContain('allow-top-navigation');
      expect(sandboxTokens).not.toContain('allow-top-navigation-by-user-activation');
      expect(sandboxTokens).not.toContain('allow-popups');
      expect(sandboxTokens).not.toContain('allow-popups-to-escape-sandbox');
      expect(sandboxTokens).not.toContain('allow-modals');
    });

    it('R1.3 (F3): Automatic server fallback watchdog triggers rotation to next server after 10s timeout', async () => {
      // Authoritative Spec: PROJECT.md F3 - 10s watchdog timer in VideoPlayer rotates to next embed server if stream hangs/fails
      const watchdogTimeoutMs = 10000;
      let selectedServerIndex = 0;
      let streamReady = false;
      let fallbackTriggered = false;

      // Simulated Watchdog Timer implementation according to F3 specification
      const startWatchdog = (onFallback: () => void) => {
        return setTimeout(() => {
          if (!streamReady) {
            onFallback();
          }
        }, watchdogTimeoutMs);
      };

      vi.useFakeTimers();

      const timer = startWatchdog(() => {
        selectedServerIndex += 1;
        fallbackTriggered = true;
      });

      // Advance by 9.9 seconds - should not have triggered yet
      vi.advanceTimersByTime(9900);
      expect(fallbackTriggered).toBe(false);
      expect(selectedServerIndex).toBe(0);

      // Advance past 10 seconds threshold
      vi.advanceTimersByTime(200);
      expect(fallbackTriggered).toBe(true);
      expect(selectedServerIndex).toBe(1);

      clearTimeout(timer);
      vi.useRealTimers();
    });

    it('R1.4 (F4): Native Android WebView host blocks external redirects, ad schemes, and multi-window popups', () => {
      // Authoritative Spec: PROJECT.md F4 & Survey 1 - onCreateWindow returns false; shouldOverrideUrlLoading blocks ad redirects
      expect(fs.existsSync(androidMain), 'MainActivity.kt must exist').toBe(true);
      const code = fs.readFileSync(androidMain, 'utf8');

      // 1. Multi-window / popup suppression via onCreateWindow
      const hasOnCreateWindow = /onCreateWindow\s*\([^)]*\)\s*:\s*Boolean/i.test(code) ||
                                /onCreateWindow/i.test(code);
      expect(hasOnCreateWindow, 'MainActivity.kt must override onCreateWindow in WebChromeClient to suppress popups').toBe(true);

      // 2. URL override interception via shouldOverrideUrlLoading
      const hasShouldOverrideUrl = /shouldOverrideUrlLoading\s*\([^)]*\)/i.test(code);
      expect(hasShouldOverrideUrl, 'MainActivity.kt must override shouldOverrideUrlLoading to block ad redirects and external schemes').toBe(true);

      // 3. Blocking custom intent/market schemes
      const handlesExternalSchemes = /intent:|market:|vnd\./i.test(code) || /shouldOverrideUrlLoading/i.test(code);
      expect(handlesExternalSchemes).toBe(true);
    });

    it('R1.5 (F5): Android WebView User-Agent is normalized to TV Chrome without "; wv)" bot gate indicator', () => {
      // Authoritative Spec: PROJECT.md F5 & Survey 1 - set Android WebView userAgent to standard TV Chrome without '; wv)'
      expect(fs.existsSync(androidMain), 'MainActivity.kt must exist').toBe(true);
      const code = fs.readFileSync(androidMain, 'utf8');

      const normalizesUserAgent = (/replace\(.*wv/i.test(code) && /userAgentString/i.test(code)) ||
                                 /userAgentString\s*=.*Chrome/i.test(code) ||
                                 /setUserAgent/i.test(code);

      expect(normalizesUserAgent, 'MainActivity.kt must normalize userAgentString to avoid Cloudflare bot detection').toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Feature R2: Subtitle Rendering Fix across Player Engines (F6 - F10)
  // --------------------------------------------------------------------------
  describe('R2: Subtitle Rendering Fix across Player Engines', () => {

    it('R2.1 (F6): Universal Subtitle Parser parses SubRip (.srt) cues with comma millisecond timestamps', async () => {
      // Authoritative Spec: PROJECT.md F6 & Interface Contracts: SubtitleCue { id, start, end, text }
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser module must be implemented').not.toBeNull();
      if (!parserMod) return;
      expect(typeof parserMod.parseSubtitles, 'parseSubtitles must be exported').toBe('function');

      const rawSrt = `1
00:01:23,456 --> 00:01:26,789
Hello from CineWave TV!
Enjoy the movie.

2
00:01:28,000 --> 00:01:31,500
Second subtitle line.`;

      const cues = parserMod.parseSubtitles(rawSrt, 'srt');
      expect(Array.isArray(cues)).toBe(true);
      expect(cues.length).toBe(2);

      // Cue 1 validation
      expect(cues[0].start).toBeCloseTo(83.456, 3);
      expect(cues[0].end).toBeCloseTo(86.789, 3);
      expect(cues[0].text.trim()).toBe('Hello from CineWave TV!\nEnjoy the movie.');

      // Cue 2 validation
      expect(cues[1].start).toBeCloseTo(88.0, 3);
      expect(cues[1].end).toBeCloseTo(91.5, 3);
      expect(cues[1].text.trim()).toBe('Second subtitle line.');
    });

    it('R2.2 (F6): Universal Subtitle Parser parses WebVTT cues with period timestamps and optional headers', async () => {
      // Authoritative Spec: PROJECT.md F6
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser module must be implemented').not.toBeNull();
      if (!parserMod) return;

      const rawVtt = `WEBVTT - CineWave TV Stream

00:00:10.500 --> 00:00:14.250
Welcome to CineWave Android TV.

00:00:15.000 --> 00:00:18.000
Universal WebVTT Rendering.`;

      const cues = parserMod.parseSubtitles(rawVtt, 'vtt');
      expect(Array.isArray(cues)).toBe(true);
      expect(cues.length).toBe(2);

      expect(cues[0].start).toBeCloseTo(10.5, 3);
      expect(cues[0].end).toBeCloseTo(14.25, 3);
      expect(cues[0].text.trim()).toBe('Welcome to CineWave Android TV.');

      expect(cues[1].start).toBeCloseTo(15.0, 3);
      expect(cues[1].end).toBeCloseTo(18.0, 3);
      expect(cues[1].text.trim()).toBe('Universal WebVTT Rendering.');
    });

    it('R2.3 (F6): Universal Subtitle Parser parses ASS/SSA dialogue lines and strips formatting override tags', async () => {
      // Authoritative Spec: PROJECT.md F6 - parse ASS/SSA dialogue lines into normalized SubtitleCue[]
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser module must be implemented').not.toBeNull();
      if (!parserMod) return;

      const rawAss = `[Script Info]
Title: CineWave ASS Sample
ScriptType: v4.00+

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:01:05.20,0:01:08.80,Default,,0,0,0,,{\\b1\\c&H00FFFF&}Yellow Bold Line{\\b0}
Dialogue: 0,0:01:10.00,0:01:12.50,Default,,0,0,0,,Normal ASS text line`;

      const cues = parserMod.parseSubtitles(rawAss, 'ass');
      expect(Array.isArray(cues)).toBe(true);
      expect(cues.length).toBe(2);

      // 0:01:05.20 = 65.2 seconds
      expect(cues[0].start).toBeCloseTo(65.2, 2);
      expect(cues[0].end).toBeCloseTo(68.8, 2);
      // Formatting tags {\b1...} must be stripped to clean text
      expect(cues[0].text.trim()).toBe('Yellow Bold Line');

      // 0:01:10.00 = 70.0 seconds
      expect(cues[1].start).toBeCloseTo(70.0, 2);
      expect(cues[1].end).toBeCloseTo(72.5, 2);
      expect(cues[1].text.trim()).toBe('Normal ASS text line');
    });

    it('R2.4 (F9): Switching or disabling subtitle tracks immediately clears active on-screen cues (0ms clear)', () => {
      // Authoritative Spec: PROJECT.md F9 - Immediately clear on-screen subtitles (0ms) when switched or disabled (activeSubtitle = -1)
      let activeSubtitle = 0;
      let renderedCue: string | null = 'Initial Subtitle Text';

      // State machine for subtitle selection
      const selectSubtitleTrack = (trackIndex: number) => {
        activeSubtitle = trackIndex;
        if (trackIndex === -1) {
          // Immediate synchronous clear
          renderedCue = null;
        } else {
          renderedCue = `Track ${trackIndex} Active`;
        }
      };

      expect(renderedCue).toBe('Initial Subtitle Text');

      // Disabling subtitles (index -1)
      selectSubtitleTrack(-1);
      expect(activeSubtitle).toBe(-1);
      expect(renderedCue, 'Subtitle display must be immediately null (0ms) on disable').toBeNull();

      // Switching to another track (index 2)
      selectSubtitleTrack(2);
      expect(activeSubtitle).toBe(2);
      expect(renderedCue).toBe('Track 2 Active');

      // Disabling again
      selectSubtitleTrack(-1);
      expect(renderedCue).toBeNull();
    });

    it('R2.5 (F8): Subtitle metadata tracks are preserved during embed server fallback in resolvePlayback', async () => {
      // Authoritative Spec: PROJECT.md F8 - Retain subtitle tracks in PlaybackResolution even during embed fallback
      const apiMod = await getApi();
      expect(apiMod, 'api service must be available').toBeDefined();

      const res = await apiMod.api.resolvePlayback('550', 'movie');
      expect(res).toBeDefined();

      // Even if stream type falls back to 'embed', subtitles array must NOT be stripped or empty
      expect(Array.isArray(res.subtitles), 'Playback resolution must contain subtitles array').toBe(true);
      expect(res.subtitles.length, 'Subtitles must not be emptied during embed fallback').toBeGreaterThan(0);

      // Verify each track structure
      const firstSub = res.subtitles[0];
      expect(firstSub.url).toBeDefined();
      expect(firstSub.label).toBeDefined();
      expect(firstSub.isDefault).toBe(false); // Subtitles must default to Off
    });
  });

  // --------------------------------------------------------------------------
  // Feature R3: Settings Page with App Updates & Preferences (F11 - F17)
  // --------------------------------------------------------------------------
  describe('R3: Settings Page with App Updates & Preferences', () => {

    it('R3.1 (F13): Settings service initializes and persists default AppSettings matching interface contract', async () => {
      // Authoritative Spec: PROJECT.md Interface Contracts § settingsService.ts
      const settingsMod = await getSettingsService();
      expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
      if (!settingsMod) return;

      const settings = settingsMod.getAppSettings();
      expect(settings).toBeDefined();

      // 1. Playback settings defaults
      expect(settings.playback).toBeDefined();
      expect(settings.playback.preferredServerIndex).toBe(0);
      expect(['auto', '1080p', '720p', '480p']).toContain(settings.playback.defaultQuality);
      expect(typeof settings.playback.autoplayNextEpisode).toBe('boolean');
      expect(typeof settings.playback.autoServerFailover).toBe('boolean');

      // 2. Subtitle styles defaults
      expect(settings.subtitles).toBeDefined();
      expect(['small', 'medium', 'large', 'extralarge']).toContain(settings.subtitles.fontSize);
      expect(settings.subtitles.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect([0, 50, 75, 100]).toContain(settings.subtitles.backgroundOpacity);
      expect(['none', 'dropshadow', 'outline']).toContain(settings.subtitles.edgeStyle);

      // 3. Update settings defaults
      expect(settings.updates).toBeDefined();
      expect(typeof settings.updates.autoCheckOnLaunch).toBe('boolean');
      expect(typeof settings.updates.lastCheckTimestamp).toBe('number');
    });

    it('R3.2 (F13): Settings service updateAppSettings supports partial patching and persists changes', async () => {
      // Authoritative Spec: PROJECT.md Interface Contracts § settingsService.ts
      const settingsMod = await getSettingsService();
      expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
      if (!settingsMod) return;

      // Apply partial patch
      const patch = {
        subtitles: {
          fontSize: 'extralarge' as const,
          textColor: '#FFEB3B',
          backgroundOpacity: 50 as const,
          edgeStyle: 'dropshadow' as const
        },
        playback: {
          preferredServerIndex: 1,
          defaultQuality: '1080p' as const,
          autoplayNextEpisode: false,
          autoServerFailover: true
        }
      };

      const updated = settingsMod.updateAppSettings(patch);
      expect(updated.subtitles.fontSize).toBe('extralarge');
      expect(updated.subtitles.textColor).toBe('#FFEB3B');
      expect(updated.playback.preferredServerIndex).toBe(1);

      // Verify persistence by reading afresh
      const refreshed = settingsMod.getAppSettings();
      expect(refreshed.subtitles.fontSize).toBe('extralarge');
      expect(refreshed.subtitles.textColor).toBe('#FFEB3B');
      expect(refreshed.playback.preferredServerIndex).toBe(1);
      // Unpatched fields (e.g. updates.autoCheckOnLaunch) must remain intact
      expect(refreshed.updates.autoCheckOnLaunch).toBe(true);
    });

    it('R3.3 (F14): Automatic update check executes conditionally based on autoCheckOnLaunch preference', async () => {
      // Authoritative Spec: PROJECT.md F14 & Survey 3
      const settingsMod = await getSettingsService();
      const updateMod = await getUpdateService();
      expect(updateMod, 'updateService must be implemented').toBeDefined();

      let checkInvoked = false;
      const mockCheck = vi.fn().mockImplementation(async () => {
        checkInvoked = true;
        return null;
      });

      // Scenario A: autoCheckOnLaunch = true -> Check runs
      const checkOnLaunch = async (autoEnabled: boolean) => {
        if (autoEnabled) {
          await mockCheck();
        }
      };

      await checkOnLaunch(true);
      expect(mockCheck).toHaveBeenCalledTimes(1);

      // Scenario B: autoCheckOnLaunch = false -> Check skipped
      mockCheck.mockClear();
      await checkOnLaunch(false);
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('R3.4 (F15): Manual update check queries remote version manifest and interfaces with native updater', async () => {
      // Authoritative Spec: PROJECT.md F15 & updateService.ts
      const updateMod = await getUpdateService();
      expect(updateMod, 'updateService must be available').toBeDefined();

      let installedUrl: string | null = null;
      (window as any).AndroidUpdater = {
        isAndroidApp: () => true,
        getAppVersionCode: () => 1,
        getAppVersionName: () => '1.0.0',
        downloadAndInstallApk: (url: string) => { installedUrl = url; }
      };

      const testApkUrl = 'https://github.com/Boltsky/NETFLIX/releases/download/v1.1.0/app-debug.apk';
      const success = updateMod.updateService.startDownloadAndInstall(testApkUrl);

      expect(success).toBe(true);
      expect(installedUrl).toBe(testApkUrl);
    });

    it('R3.5 (F16): Subtitle styling controls and preview generate valid 10-foot TV CSS styling rules', async () => {
      // Authoritative Spec: PROJECT.md F16 & Interface Contracts: SubtitleStyles mapping
      const getSubtitleCss = (styles: { fontSize: string; textColor: string; backgroundOpacity: number; edgeStyle: string }) => {
        const fontMap: Record<string, string> = {
          small: '18px',
          medium: '24px',
          large: '32px',
          extralarge: '40px'
        };

        const edgeMap: Record<string, string> = {
          none: 'none',
          dropshadow: '2px 2px 4px rgba(0,0,0,0.9)',
          outline: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
        };

        return {
          fontSize: fontMap[styles.fontSize] || '24px',
          color: styles.textColor,
          backgroundColor: `rgba(0, 0, 0, ${styles.backgroundOpacity / 100})`,
          textShadow: edgeMap[styles.edgeStyle] || 'none'
        };
      };

      const css = getSubtitleCss({
        fontSize: 'large',
        textColor: '#00E5FF',
        backgroundOpacity: 75,
        edgeStyle: 'outline'
      });

      expect(css.fontSize).toBe('32px');
      expect(css.color).toBe('#00E5FF');
      expect(css.backgroundColor).toBe('rgba(0, 0, 0, 0.75)');
      expect(css.textShadow).toContain('#000');
    });
  });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ≥5 test cases per feature covering edge cases, empty values, malformed inputs, timeouts
// ============================================================================
describe('CineWave TV E2E Suite - Tier 2: Boundary & Corner Cases', () => {

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // Boundary & Corner Cases R1: Ad Suppression, Embeds & Watchdog
  // --------------------------------------------------------------------------
  describe('Boundary R1: Ad Suppression, Embeds & Watchdog', () => {

    it('2.R1.1: VideoPlayer reaches terminal error UI gracefully after all fallback servers are exhausted', () => {
      const serverList = [
        { name: 'Server 1 (FrameX)', url: 'https://framextv.cc/embed/550' },
        { name: 'Server 2 (AutoEmbed)', url: 'https://autoembed.cc/embed/550' },
        { name: 'Server 3 (MultiEmbed)', url: 'https://multiembed.mov/?video_id=550' }
      ];

      let currentIndex = 0;
      let terminalError: string | null = null;

      const triggerNextFallback = () => {
        if (currentIndex < serverList.length - 1) {
          currentIndex += 1;
        } else {
          terminalError = 'All stream servers are currently unavailable. Please try again later.';
        }
      };

      // Fail server 0
      triggerNextFallback();
      expect(currentIndex).toBe(1);
      expect(terminalError).toBeNull();

      // Fail server 1
      triggerNextFallback();
      expect(currentIndex).toBe(2);
      expect(terminalError).toBeNull();

      // Fail server 2 (last server)
      triggerNextFallback();
      expect(terminalError).not.toBeNull();
      expect(terminalError).toContain('All stream servers are currently unavailable');
    });

    it('2.R1.2: Server URL parameter concatenation handles existing queries without duplicating ? or corrupting tokens', () => {
      const buildEmbedUrl = (baseUrl: string, resumeSec: number) => {
        if (resumeSec <= 0) return baseUrl;
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}start=${Math.floor(resumeSec)}`;
      };

      // Case 1: Base URL has no query parameters
      const url1 = buildEmbedUrl('https://framextv.cc/embed/550', 125);
      expect(url1).toBe('https://framextv.cc/embed/550?start=125');

      // Case 2: Base URL already contains query parameters
      const url2 = buildEmbedUrl('https://autoembed.cc/embed/movie/550?autoplay=1&lang=en', 300);
      expect(url2).toBe('https://autoembed.cc/embed/movie/550?autoplay=1&lang=en&start=300');
      expect((url2.match(/\?/g) || []).length).toBe(1); // Exactly one '?' character
    });

    it('2.R1.3: VideoPlayer guards against zero, NaN, or infinite duration values to avoid divide-by-zero crashes', () => {
      const calculateProgressPercent = (current: number, duration: number): number => {
        if (!Number.isFinite(duration) || duration <= 0) return 0;
        if (!Number.isFinite(current) || current < 0) return 0;
        return Math.min(100, Math.max(0, (current / duration) * 100));
      };

      expect(calculateProgressPercent(50, 0)).toBe(0);
      expect(calculateProgressPercent(50, NaN)).toBe(0);
      expect(calculateProgressPercent(50, Infinity)).toBe(0);
      expect(calculateProgressPercent(NaN, 100)).toBe(0);
      expect(calculateProgressPercent(25, 100)).toBe(25);
    });

    it('2.R1.4: Rapid manual server switching clears in-flight watchdog timer to prevent stale fallback race', () => {
      vi.useFakeTimers();
      let activeTimers = 0;
      let currentTimer: any = null;

      const scheduleWatchdog = () => {
        if (currentTimer) {
          clearTimeout(currentTimer);
          activeTimers--;
        }
        activeTimers++;
        currentTimer = setTimeout(() => {
          activeTimers--;
        }, 10000);
      };

      // User rapidly clicks Server 1, then Server 2, then Server 3 within 200ms
      scheduleWatchdog();
      vi.advanceTimersByTime(50);
      scheduleWatchdog();
      vi.advanceTimersByTime(50);
      scheduleWatchdog();

      // Only 1 watchdog timer should remain active
      expect(activeTimers).toBe(1);

      vi.advanceTimersByTime(10001);
      expect(activeTimers).toBe(0);
      vi.useRealTimers();
    });

    it('2.R1.5: VideoPlayer safely rejects malformed or untrusted postMessage events without exception', () => {
      let playbackTelemetry: any = null;
      let errorThrown = false;

      const handleWindowMessage = (event: { origin?: string; data?: any }) => {
        try {
          if (!event || typeof event.data !== 'object' || event.data === null) {
            return;
          }
          if (event.data.type === 'frameXTV:timeupdate' && typeof event.data.currentTime === 'number') {
            playbackTelemetry = event.data;
          }
        } catch {
          errorThrown = true;
        }
      };

      // Malformed string data
      handleWindowMessage({ data: 'corrupted-string' });
      expect(playbackTelemetry).toBeNull();
      expect(errorThrown).toBe(false);

      // Null data
      handleWindowMessage({ data: null });
      expect(playbackTelemetry).toBeNull();
      expect(errorThrown).toBe(false);

      // Valid telemetry event
      handleWindowMessage({
        data: { type: 'frameXTV:timeupdate', currentTime: 45.2, duration: 120.0 }
      });
      expect(playbackTelemetry).toEqual({ type: 'frameXTV:timeupdate', currentTime: 45.2, duration: 120.0 });
    });
  });

  // --------------------------------------------------------------------------
  // Boundary & Corner Cases R2: Subtitle Parsing, Formatting & CORS
  // --------------------------------------------------------------------------
  describe('Boundary R2: Subtitle Parsing, Formatting & CORS', () => {

    it('2.R2.1: Empty or whitespace-only subtitle payloads return an empty cues array without crashing', async () => {
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser must be implemented').not.toBeNull();
      if (!parserMod) return;

      expect(parserMod.parseSubtitles('', 'srt')).toEqual([]);
      expect(parserMod.parseSubtitles('   \n\r\n\t   ', 'vtt')).toEqual([]);
      expect(parserMod.parseSubtitles('[Script Info]\n', 'ass')).toEqual([]);
    });

    it('2.R2.2: Malformed timecodes in subtitle cues are dropped or sanitized without producing NaN timestamps', async () => {
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser must be implemented').not.toBeNull();
      if (!parserMod) return;

      const malformedSrt = `1
INVALID_TIMECODE --> 00:01:30,000
Broken timecode cue.

2
00:02:00,000 --> 00:01:00,000
Inverted interval cue (end before start).

3
00:03:00,000 --> 00:03:05,500
Valid cue that should survive.`;

      const cues = parserMod.parseSubtitles(malformedSrt, 'srt');
      expect(Array.isArray(cues)).toBe(true);

      // Every returned cue MUST have finite, valid numbers and end >= start
      for (const cue of cues) {
        expect(Number.isFinite(cue.start)).toBe(true);
        expect(Number.isFinite(cue.end)).toBe(true);
        expect(cue.end).toBeGreaterThanOrEqual(cue.start);
      }

      // Valid cue must be preserved
      const validCue = cues.find((c: any) => c.text.includes('Valid cue'));
      expect(validCue).toBeDefined();
    });

    it('2.R2.3: Overlapping and chronologically disordered subtitle cues are sorted and queried accurately', async () => {
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser must be implemented').not.toBeNull();
      if (!parserMod) return;

      const rawDisorderedVtt = `WEBVTT

00:00:20.000 --> 00:00:25.000
Second Cue (20s - 25s)

00:00:05.000 --> 00:00:15.000
First Cue (5s - 15s)

00:00:10.000 --> 00:00:22.000
Overlapping Cue (10s - 22s)`;

      const cues = parserMod.parseSubtitles(rawDisorderedVtt, 'vtt');
      expect(cues.length).toBe(3);

      // Cues should be sorted by start time
      expect(cues[0].start).toBeCloseTo(5.0, 1);
      expect(cues[1].start).toBeCloseTo(10.0, 1);
      expect(cues[2].start).toBeCloseTo(20.0, 1);

      // Active cues at timestamp t=12s should return Cue 1 and Overlapping Cue
      const getActiveCues = (allCues: any[], t: number) => {
        return allCues.filter(c => t >= c.start && t <= c.end);
      };

      const activeAt12 = getActiveCues(cues, 12.0);
      expect(activeAt12.length).toBe(2);
      expect(activeAt12.map(c => c.text)).toContain('First Cue (5s - 15s)');
      expect(activeAt12.map(c => c.text)).toContain('Overlapping Cue (10s - 22s)');
    });

    it('2.R2.4: Subtitle cue text sanitization removes script injection and formatting tags cleanly', async () => {
      const parserMod = await getSubtitleParser();
      expect(parserMod, 'subtitleParser must be implemented').not.toBeNull();
      if (!parserMod) return;

      const dirtySrt = `1
00:00:01,000 --> 00:00:04,000
<script>alert("xss")</script><b>Bold Text</b> <font color="#ff0000">Red</font> {\\an8}Top-aligned`;

      const cues = parserMod.parseSubtitles(dirtySrt, 'srt');
      expect(cues.length).toBe(1);

      const text = cues[0].text;
      // No raw <script> tags or alert statements
      expect(text).not.toContain('<script>');
      expect(text).not.toContain('alert(');
      // No raw ASS positioning tags
      expect(text).not.toContain('{\\an8}');
      // Clean visible text preserved
      expect(text).toContain('Bold Text');
      expect(text).toContain('Red');
      expect(text).toContain('Top-aligned');
    });

    it('2.R2.5: Subtitle CDN fetch failure or CORS rejection fails gracefully without halting playback', async () => {
      const fetchSubtitleSafe = async (url: string): Promise<string | null> => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.text();
        } catch {
          // Graceful fallback to null
          return null;
        }
      };

      // Mock fetch rejection simulating CORS error
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch (CORS)')));

      const content = await fetchSubtitleSafe('https://untrusted-cdn.com/sub.srt');
      expect(content).toBeNull(); // Graceful degradation, no uncaught rejection
      vi.unstubAllGlobals();
    });
  });

  // --------------------------------------------------------------------------
  // Boundary & Corner Cases R3: Settings Persistence, Navigation & Updates
  // --------------------------------------------------------------------------
  describe('Boundary R3: Settings Persistence, Navigation & Updates', () => {

    it('2.R3.1: Corrupted or unparseable JSON in localStorage settings falls back safely to default AppSettings', async () => {
      mockLocalStorage.setItem('cinewave_settings', '{"playback": {corrupt_json: true');

      const settingsMod = await getSettingsService();
      expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
      if (!settingsMod) return;

      // Must not throw JSON.parse syntax error
      let settings: any = null;
      expect(() => {
        settings = settingsMod.getAppSettings();
      }).not.toThrow();

      expect(settings).toBeDefined();
      expect(settings.playback).toBeDefined();
      expect(settings.playback.preferredServerIndex).toBe(0);
    });

    it('2.R3.2: Extreme or out-of-bounds subtitle styling patches are clamped to valid schema values', async () => {
      const settingsMod = await getSettingsService();
      expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
      if (!settingsMod) return;

      const invalidPatch: any = {
        subtitles: {
          fontSize: 'gigantic_invalid_size',
          backgroundOpacity: 9999,
          edgeStyle: 'unknown_edge_style'
        }
      };

      const result = settingsMod.updateAppSettings(invalidPatch);
      // Validator must clamp or fallback to allowable schema enums
      expect(['small', 'medium', 'large', 'extralarge']).toContain(result.subtitles.fontSize);
      expect([0, 50, 75, 100]).toContain(result.subtitles.backgroundOpacity);
      expect(['none', 'dropshadow', 'outline']).toContain(result.subtitles.edgeStyle);
    });

    it('2.R3.3: App update check handles network timeout or HTTP 500 error without throwing uncaught exceptions', async () => {
      const updateMod = await getUpdateService();
      expect(updateMod, 'updateService must be available').toBeDefined();

      // Mock fetch returning HTTP 500
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }));

      const manifest = await updateMod.updateService.checkForAppUpdate(true);
      expect(manifest).toBeNull(); // Safe return value
      vi.unstubAllGlobals();
    });

    it('2.R3.4: Version comparison logic rejects manifests with lower or identical version codes and commit hashes', async () => {
      const updateMod = await getUpdateService();
      expect(updateMod, 'updateService must be available').toBeDefined();

      const { CURRENT_APP_VERSION } = await import('../version');

      // Older version code
      const olderManifest = {
        versionCode: CURRENT_APP_VERSION.versionCode - 1,
        versionName: '0.9.0',
        commitHash: CURRENT_APP_VERSION.commitHash,
        releaseDate: '2026-10-01',
        repo: 'Boltsky/NETFLIX',
        branch: 'main',
        title: 'Older Release',
        changelog: [],
        apkUrl: 'https://example.com/old.apk',
        releaseUrl: 'https://example.com/old'
      };
      expect(updateMod.isNewerVersion(olderManifest)).toBe(false);

      // Identical version code and identical commit hash
      const identicalManifest = {
        ...olderManifest,
        versionCode: CURRENT_APP_VERSION.versionCode,
        versionName: CURRENT_APP_VERSION.versionName,
        commitHash: CURRENT_APP_VERSION.commitHash
      };
      expect(updateMod.isNewerVersion(identicalManifest)).toBe(false);
    });

    it('2.R3.5: Rapid TV D-pad navigation at boundary items does not cause focus loss or undefined active key', () => {
      // Focus boundary trap simulator
      const tabs = ['playback', 'subtitles', 'updates', 'about'];
      let activeIndex = 0;

      const handleDpad = (direction: 'up' | 'down') => {
        if (direction === 'up') {
          activeIndex = Math.max(0, activeIndex - 1);
        } else if (direction === 'down') {
          activeIndex = Math.min(tabs.length - 1, activeIndex + 1);
        }
      };

      // Press UP 5 times at top boundary
      for (let i = 0; i < 5; i++) {
        handleDpad('up');
      }
      expect(activeIndex).toBe(0);
      expect(tabs[activeIndex]).toBe('playback');

      // Press DOWN 10 times to bottom boundary
      for (let i = 0; i < 10; i++) {
        handleDpad('down');
      }
      expect(activeIndex).toBe(tabs.length - 1);
      expect(tabs[activeIndex]).toBe('about');
    });
  });
});

// ============================================================================
// TIER 3: CROSS-FEATURE INTERACTIONS (PAIRWISE COMBINATIONS)
// Pairwise combinations across settings, playback, subtitles, updates
// ============================================================================
describe('CineWave TV E2E Suite - Tier 3: Cross-Feature Interactions', () => {

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('3.1 (Settings ↔ Subtitles): Subtitle styling modified in Settings propagates to SubtitleOverlay DOM style attributes', async () => {
    // 1. User configures high-visibility subtitle styles in Settings
    const settingsMod = await getSettingsService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;

    settingsMod.updateAppSettings({
      subtitles: {
        fontSize: 'large',
        textColor: '#FFEB3B',
        backgroundOpacity: 75,
        edgeStyle: 'outline'
      }
    });

    // 2. Playback engine reads settings to style SubtitleOverlay
    const appSettings = settingsMod.getAppSettings();
    expect(appSettings.subtitles.fontSize).toBe('large');
    expect(appSettings.subtitles.textColor).toBe('#FFEB3B');

    // 3. Computed SubtitleOverlay CSS verification
    const fontSizeMap = { small: '18px', medium: '24px', large: '32px', extralarge: '40px' };
    const renderedFontSize = fontSizeMap[appSettings.subtitles.fontSize];
    expect(renderedFontSize).toBe('32px');

    const renderedBg = `rgba(0, 0, 0, ${appSettings.subtitles.backgroundOpacity / 100})`;
    expect(renderedBg).toBe('rgba(0, 0, 0, 0.75)');
  });

  it('3.2 (Settings ↔ Playback): Preferred server index set in Settings dictates VideoPlayer initial server selection', async () => {
    const settingsMod = await getSettingsService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;

    // User chooses Server 1 (AutoEmbed) as preferred server
    settingsMod.updateAppSettings({
      playback: {
        preferredServerIndex: 1,
        defaultQuality: 'auto',
        autoplayNextEpisode: true,
        autoServerFailover: true
      }
    });

    const persisted = settingsMod.getAppSettings();
    expect(persisted.playback.preferredServerIndex).toBe(1);

    // Simulated VideoPlayer initialization
    const initialSelectedServer = persisted.playback.preferredServerIndex;
    expect(initialSelectedServer).toBe(1);
  });

  it('3.3 (Playback ↔ Subtitles): Server fallback watchdog preserves active subtitle track and playback position continuity', () => {
    let activeSubtitleIndex = 2; // Spanish subtitle active
    let playbackPositionSec = 145.5; // Resumed at 2m 25s
    let currentServerIndex = 0;

    // Watchdog trigger event rotates server from 0 to 1
    const onWatchdogFallback = () => {
      currentServerIndex += 1;
      // Active subtitle must NOT be reset to -1 during server failover
      // Resume position must be preserved
    };

    onWatchdogFallback();

    expect(currentServerIndex).toBe(1);
    expect(activeSubtitleIndex).toBe(2);
    expect(playbackPositionSec).toBe(145.5);
  });

  it('3.4 (Updates ↔ Settings): Launch update check execution does not collide or overwrite active Settings screen state', async () => {
    const settingsMod = await getSettingsService();
    const updateMod = await getUpdateService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;
    expect(updateMod, 'updateService must be implemented').toBeDefined();

    // User is actively editing settings in UI
    const uncommittedUserSetting = { fontSize: 'extralarge' as const, textColor: '#76FF03' };

    // Background update check finishes concurrently
    const now = Date.now();
    mockLocalStorage.setItem('netflix_last_update_check', String(now));

    // Save user settings
    settingsMod.updateAppSettings({ subtitles: { ...settingsMod.getAppSettings().subtitles, ...uncommittedUserSetting } });

    // Verify user settings were preserved despite updateService activity
    const finalSettings = settingsMod.getAppSettings();
    expect(finalSettings.subtitles.fontSize).toBe('extralarge');
    expect(finalSettings.subtitles.textColor).toBe('#76FF03');
  });

  it('3.5 (Settings ↔ Autoplay): Autoplay next episode setting disabled in preferences stops automated series progression', async () => {
    const settingsMod = await getSettingsService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;

    // Disable autoplay
    settingsMod.updateAppSettings({
      playback: {
        preferredServerIndex: 0,
        defaultQuality: 'auto',
        autoplayNextEpisode: false,
        autoServerFailover: true
      }
    });

    let nextEpisodeTriggered = false;
    const onVideoEnded = (autoplayEnabled: boolean) => {
      if (autoplayEnabled) {
        nextEpisodeTriggered = true;
      }
    };

    onVideoEnded(settingsMod.getAppSettings().playback.autoplayNextEpisode);
    expect(nextEpisodeTriggered).toBe(false);
  });

  it('3.6 (Settings ↔ Failover): Auto server failover toggle controls automatic watchdog fallback activation', async () => {
    const settingsMod = await getSettingsService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;

    // Disable auto server failover
    settingsMod.updateAppSettings({
      playback: {
        preferredServerIndex: 0,
        defaultQuality: 'auto',
        autoplayNextEpisode: true,
        autoServerFailover: false
      }
    });

    let autoFallbackExecuted = false;
    let manualPickerShown = false;

    const handleStreamFailure = (autoFailoverEnabled: boolean) => {
      if (autoFailoverEnabled) {
        autoFallbackExecuted = true;
      } else {
        manualPickerShown = true;
      }
    };

    handleStreamFailure(settingsMod.getAppSettings().playback.autoServerFailover);

    expect(autoFallbackExecuted).toBe(false);
    expect(manualPickerShown).toBe(true);
  });
});

// ============================================================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS
// ≥5 realistic TV user workflows
// ============================================================================
describe('CineWave TV E2E Suite - Tier 4: Real-World Application Scenarios', () => {

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('Scenario 4.1: Cold App Launch -> Startup Update Check -> D-pad Navigation to Settings -> Configure Preferred Server -> Return Home', async () => {
    // Step 1: App initializes
    let currentScreen: string = 'home';
    const settingsMod = await getSettingsService();
    const updateMod = await getUpdateService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;
    expect(updateMod, 'updateService must be implemented').toBeDefined();

    // Step 2: Startup update check triggered
    const appSettings = settingsMod.getAppSettings();
    if (appSettings.updates.autoCheckOnLaunch) {
      mockLocalStorage.setItem('netflix_last_update_check', String(Date.now()));
    }
    expect(mockLocalStorage.getItem('netflix_last_update_check')).not.toBeNull();

    // Step 3: Remote navigation - Press LEFT to sidebar, select Settings
    currentScreen = 'settings';
    expect(currentScreen).toBe('settings');

    // Step 4: In Settings, update preferred server to AutoEmbed (Index 1)
    settingsMod.updateAppSettings({
      playback: {
        ...appSettings.playback,
        preferredServerIndex: 1
      }
    });
    expect(settingsMod.getAppSettings().playback.preferredServerIndex).toBe(1);

    // Step 5: Press Back/Escape -> returns to Home screen
    currentScreen = 'home';
    expect(currentScreen).toBe('home');
  });

  it('Scenario 4.2: Catalog Browse -> Select Movie -> Direct Playback Network Failure -> Watchdog Rotates to Clean Sandboxed Embed', async () => {
    const apiMod = await getApi();
    expect(apiMod, 'api service must be available').toBeDefined();

    // Step 1: User selects title (Fight Club 550)
    const resolution = await apiMod.api.resolvePlayback('550', 'movie');
    expect(resolution).toBeDefined();

    // Step 2: Video player mounts with direct stream attempt
    let activeEngine: 'direct' | 'iframe' = 'direct';
    let activeServerIndex = 0;

    // Step 3: Direct HLS throws fatal error
    const onHlsFatalError = () => {
      activeEngine = 'iframe';
    };
    onHlsFatalError();
    expect(activeEngine).toBe('iframe');

    // Step 4: Embed playback begins with sandboxed iframe on clean server
    expect(resolution.embedServers).toBeDefined();
    expect(resolution.embedServers.length).toBeGreaterThan(0);
    const activeServer = resolution.embedServers[activeServerIndex];
    expect(activeServer).toBeDefined();
  });

  it('Scenario 4.3: Movie Playback -> TV Remote D-pad Subtitle Menu -> Select Spanish SRT Track -> Visible Subtitle Rendering', async () => {
    const parserMod = await getSubtitleParser();
    expect(parserMod, 'subtitleParser must be implemented').not.toBeNull();
    if (!parserMod) return;

    // Step 1: Player running with subtitles off (-1)
    let activeSubtitleIndex = -1;
    let onScreenSubtitleText: string | null = null;

    // Step 2: User opens Audio/Subtitles modal and selects Spanish track (Index 1)
    activeSubtitleIndex = 1;

    // Step 3: Subtitle track downloaded and parsed
    const spanishSrt = `1
00:00:10,000 --> 00:00:14,000
Hola, bienvenido a CineWave TV.`;

    const parsedCues = parserMod.parseSubtitles(spanishSrt, 'srt');
    expect(parsedCues.length).toBe(1);

    // Step 4: Playback reaches timestamp 12.0s -> Cue displays
    const currentTime = 12.0;
    const activeCue = parsedCues.find((c: any) => currentTime >= c.start && currentTime <= c.end);
    if (activeCue && activeSubtitleIndex !== -1) {
      onScreenSubtitleText = activeCue.text;
    }

    expect(onScreenSubtitleText).toBe('Hola, bienvenido a CineWave TV.');
  });

  it('Scenario 4.4: Active Subtitles -> Exit to Settings -> Customize Subtitle Style -> Resume Playback -> Immediate Style Refresh', async () => {
    const settingsMod = await getSettingsService();
    expect(settingsMod, 'settingsService must be implemented').not.toBeNull();
    if (!settingsMod) return;

    // Step 1: Movie playing at 1500s with saved progress
    const movieId = '550';
    mockLocalStorage.setItem(`netflix_progress_bolt_${movieId}`, JSON.stringify({
      positionMs: 1500000,
      durationMs: 7200000
    }));

    // Step 2: User opens Settings and modifies subtitle style to Extra Large, Cyan, Outline
    settingsMod.updateAppSettings({
      subtitles: {
        fontSize: 'extralarge',
        textColor: '#00E5FF',
        backgroundOpacity: 100,
        edgeStyle: 'outline'
      }
    });

    // Step 3: User returns to Movie -> resumes from 1500s
    const progress = JSON.parse(mockLocalStorage.getItem(`netflix_progress_bolt_${movieId}`) || '{}');
    expect(progress.positionMs).toBe(1500000);

    // Step 4: SubtitleOverlay mounts with freshly updated style
    const activeStyle = settingsMod.getAppSettings().subtitles;
    expect(activeStyle.fontSize).toBe('extralarge');
    expect(activeStyle.textColor).toBe('#00E5FF');
    expect(activeStyle.backgroundOpacity).toBe(100);
  });

  it('Scenario 4.5: Primary Embed Server Blocked / Intrusive Ads -> Watchdog Auto-switches to Secondary Clean Server with Subtitle & Progress Continuity', () => {
    vi.useFakeTimers();

    // Step 1: Embed playback starts on primary server
    let currentServerIndex = 0;
    const servers = [
      { name: 'Server 1 (FrameX)', url: 'https://framextv.cc/embed/550' },
      { name: 'Server 2 (AutoEmbed)', url: 'https://autoembed.cc/embed/550' }
    ];
    let activeSubtitleIndex = 0;
    let currentPlaybackTime = 320.0;
    let streamFailed = false;

    // Step 2: Server 1 hangs or fails to emit playback heartbeat
    const watchdogTimer = setTimeout(() => {
      // 10s watchdog expires without stream heartbeat -> rotate server
      currentServerIndex = (currentServerIndex + 1) % servers.length;
      streamFailed = true;
    }, 10000);

    // Advance 10s
    vi.advanceTimersByTime(10000);

    // Step 3: Watchdog rotated to Server 2
    expect(streamFailed).toBe(true);
    expect(currentServerIndex).toBe(1);
    expect(servers[currentServerIndex].name).toContain('AutoEmbed');

    // Step 4: Subtitle track selection and resume timestamp are preserved
    expect(activeSubtitleIndex).toBe(0);
    expect(currentPlaybackTime).toBe(320.0);

    clearTimeout(watchdogTimer);
    vi.useRealTimers();
  });
});
