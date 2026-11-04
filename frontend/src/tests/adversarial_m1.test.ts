import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Adversarial M1 Hardening & Sandbox Verification Suite', () => {
  const mainActivityPath = path.resolve(__dirname, '../../../android/app/src/main/java/com/cinewave/tv/MainActivity.kt');
  const videoPlayerPath = path.resolve(__dirname, '../components/player/VideoPlayer.tsx');
  const apiPath = path.resolve(__dirname, '../services/api.ts');
  const backendAdapterPath = path.resolve(__dirname, '../../../backend/src/providers/framextv.adapter.ts');

  // =========================================================================
  // 1. MainActivity.kt Structural & Policy Audit
  // =========================================================================
  describe('MainActivity.kt Source Analysis & Hardening', () => {
    it('verifies MainActivity.kt exists and reads without error', () => {
      expect(fs.existsSync(mainActivityPath), `MainActivity.kt not found at ${mainActivityPath}`).toBe(true);
      const content = fs.readFileSync(mainActivityPath, 'utf8');
      expect(content.length).toBeGreaterThan(1000);
    });

    it('confirms WebChromeClient.onCreateWindow strictly returns false to block popups', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');
      const match = code.match(/override\s+fun\s+onCreateWindow\s*\([^)]*\)\s*:\s*Boolean\s*\{([\s\S]*?)\}/);
      expect(match, 'onCreateWindow must be overridden in WebChromeClient').not.toBeNull();
      const body = match![1];
      expect(body).toContain('return false');
      expect(body).not.toContain('transport.webView');
      expect(body).not.toContain('return true');
    });

    it('confirms JavaScript modal dialog suppression in WebChromeClient', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');
      expect(code).toMatch(/override\s+fun\s+onJsAlert\s*\([^)]*\)\s*:\s*Boolean\s*\{[\s\S]*?result\?\.confirm\(\)[\s\S]*?return\s+true/);
      expect(code).toMatch(/override\s+fun\s+onJsConfirm\s*\([^)]*\)\s*:\s*Boolean\s*\{[\s\S]*?result\?\.cancel\(\)[\s\S]*?return\s+true/);
      expect(code).toMatch(/override\s+fun\s+onJsPrompt\s*\([^)]*\)\s*:\s*Boolean\s*\{[\s\S]*?result\?\.cancel\(\)[\s\S]*?return\s+true/);
      expect(code).toMatch(/override\s+fun\s+onJsBeforeUnload\s*\([^)]*\)\s*:\s*Boolean\s*\{[\s\S]*?result\?\.confirm\(\)[\s\S]*?return\s+true/);
    });

    it('confirms WebSettings window controls', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');
      expect(code).toContain('settings.javaScriptCanOpenWindowsAutomatically = false');
      expect(code).toContain('settings.setSupportMultipleWindows(true)');
    });

    it('confirms shouldInterceptRequest handles assets, api proxy, and ad blocking', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');
      expect(code).toContain('shouldInterceptRequest');
      expect(code).toContain('isAdOrBlockedUrl');
      expect(code).toContain('createEmptyResourceResponse()');
      expect(code).toContain('assetLoader.shouldInterceptRequest(url)');
    });

    it('confirms createEmptyResourceResponse generates safe HTTP 200 payload with CORS headers', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');
      expect(code).toMatch(/fun\s+createEmptyResourceResponse\s*\(\)\s*:\s*WebResourceResponse/);
      expect(code).toContain('headers["Access-Control-Allow-Origin"] = "*"');
      expect(code).toContain('ByteArrayInputStream(emptyBytes)');
      expect(code).toContain('"text/plain"');
      expect(code).toContain('200');
    });
  });

  // =========================================================================
  // 2. Empirical URL Override & Ad Blocking Oracle (Simulating Kotlin Logic)
  // =========================================================================
  describe('Adversarial URL Filtering Oracle', () => {
    const BLOCKED_HOST_PATTERNS = [
      "popads", "popcash", "adsterra", "propellerads", "exoclick", "hilltopads",
      "monetag", "onclickalgo", "onclickperformance", "clickadu", "ad-delivery",
      "admaven", "doubleclick", "googlesyndication", "google-analytics", "adnxs",
      "adxpose", "moatads", "criteo", "outbrain", "taboola", "trafficfactory",
      "juicyads", "ero-advertising", "tsyndicate", "adfox", "aniview",
      "spotxchange", "springserve", "vlitag", "vidazoo", "yieldmo",
      "revcontent", "mgid", "adskeeper", "richaudience", "teads",
      "bet365", "1xbet", "mostbet", "melbet", "parimatch"
    ];

    function isAdOrBlockedUrl(urlString: string): boolean {
      try {
        const parsed = new URL(urlString);
        const host = parsed.hostname.toLowerCase();
        const urlStr = urlString.toLowerCase();

        // Whitelist app assets, internal endpoints, and legitimate embed providers
        if (
          host === "appassets.androidplatform.net" ||
          host.includes("framextv") ||
          host.includes("autoembed") ||
          host.includes("multiembed") ||
          host.includes("2embed") ||
          host.includes("vidsrc") ||
          host.includes("themoviedb.org") ||
          host.includes("tmdb.org")
        ) {
          return false;
        }

        return BLOCKED_HOST_PATTERNS.some(pattern => host.includes(pattern) || urlStr.includes(pattern));
      } catch {
        return false;
      }
    }

    function handleUrlOverride(urlString: string, isForMainFrame: boolean): boolean {
      let parsed: URL;
      try {
        parsed = new URL(urlString);
      } catch {
        const schemeMatch = urlString.match(/^([a-zA-Z0-9+.-]+):/);
        const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : null;
        if (scheme !== "http" && scheme !== "https") {
          return true;
        }
        return false;
      }

      const scheme = parsed.protocol.replace(':', '').toLowerCase();

      // 1. Always allow local app assets
      if (urlString.startsWith("https://appassets.androidplatform.net/") || parsed.hostname === "appassets.androidplatform.net") {
        return false;
      }

      // 2. Block non-http/https schemes
      if (scheme !== "http" && scheme !== "https") {
        return true;
      }

      // 3. Protect main application frame from top-level hijacking/redirects
      if (isForMainFrame) {
        return true;
      }

      // 4. Block known ad/malware domains in subframes
      if (isAdOrBlockedUrl(urlString)) {
        return true;
      }

      // Allow legitimate subframe navigations
      return false;
    }

    it('blocks malicious and external custom schemes', () => {
      const maliciousSchemes = [
        'market://details?id=com.malicious.adware',
        'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end',
        'itms-apps://itunes.apple.com/app/id123456',
        'javascript:alert("exploit")',
        'data:text/html,<script>window.location="https://evil.com"</script>',
        'tel:+18005550199',
        'sms:+18005550199?body=spam',
        'mailto:phishing@attacker.com',
        'vnd.youtube:dQw4w9WgXcQ'
      ];

      for (const uri of maliciousSchemes) {
        expect(handleUrlOverride(uri, true), `Custom scheme should be blocked: ${uri}`).toBe(true);
        expect(handleUrlOverride(uri, false), `Custom scheme in subframe should be blocked: ${uri}`).toBe(true);
      }
    });

    it('strictly blocks main-frame redirects to any external domain', () => {
      const externalMainFrameUrls = [
        'https://google.com',
        'https://evil-redirect.com/adgate',
        'https://framextv.cc/embed/550',
        'https://vidsrc.to/embed/movie/550',
        'https://cloudflare.com/challenge',
        'http://insecure-domain.org'
      ];

      for (const uri of externalMainFrameUrls) {
        expect(handleUrlOverride(uri, true), `Main frame redirect must be blocked: ${uri}`).toBe(true);
      }
    });

    it('permits internal app asset navigation in main frame', () => {
      const localAssets = [
        'https://appassets.androidplatform.net/assets/index.html',
        'https://appassets.androidplatform.net/assets/index.html#/player/550',
        'https://appassets.androidplatform.net/assets/index.html#/settings',
        'https://appassets.androidplatform.net/assets/main.js'
      ];

      for (const uri of localAssets) {
        expect(handleUrlOverride(uri, true), `Internal asset must be allowed: ${uri}`).toBe(false);
      }
    });

    it('blocks 20+ prominent ad and tracker networks in subframes', () => {
      const adUrls = [
        'https://serve.popads.net/serve.js',
        'https://cdn.popcash.net/pop.js',
        'https://engine.adsterra.com/tag.js',
        'https://s.propellerads.com/track.php',
        'https://syndication.exoclick.com/splash.php',
        'https://hilltopads.net/banner',
        'https://ad.monetag.com/push',
        'https://onclickalgo.com/script',
        'https://clickadu.com/pop',
        'https://ad-delivery.net/serve',
        'https://admaven.com/popunder',
        'https://securepubads.g.doubleclick.net/gampad/ads',
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'https://www.google-analytics.com/analytics.js',
        'https://ib.adnxs.com/jpt',
        'https://static.criteo.net/tag.js',
        'https://widgets.outbrain.com/outbrain.js',
        'https://cdn.taboola.com/libtrc/unip/loader.js',
        'https://ads.juicyads.com/show.php',
        'https://mgid.com/widget',
        'https://adskeeper.com/news',
        'https://bet365.com/landing',
        'https://1xbet.com/affiliate'
      ];

      for (const uri of adUrls) {
        expect(isAdOrBlockedUrl(uri), `isAdOrBlockedUrl should detect: ${uri}`).toBe(true);
        expect(handleUrlOverride(uri, false), `Subframe redirect should be blocked: ${uri}`).toBe(true);
      }
    });

    it('permits legitimate video player embeds and upstream TMDB resources in subframes', () => {
      const legitimateEmbeds = [
        'https://framextv.cc/embed/550?autoplay=1',
        'https://player.autoembed.cc/embed/movie/550',
        'https://multiembed.mov/?video_id=550&tmdb=1',
        'https://www.2embed.cc/embed/550',
        'https://vidsrc.to/embed/movie/550',
        'https://api.themoviedb.org/3/movie/550?api_key=xyz',
        'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg'
      ];

      for (const uri of legitimateEmbeds) {
        expect(isAdOrBlockedUrl(uri), `Legitimate embed should NOT be blocked: ${uri}`).toBe(false);
        expect(handleUrlOverride(uri, false), `Legitimate subframe should be allowed: ${uri}`).toBe(false);
      }
    });

    it('resists URL and query spoofing attacks targeting the whitelist', () => {
      // Attacker appends legitimate provider name in query or path of ad server
      const spoofAttempts = [
        'https://popads.net/serve.js?target=framextv.cc',
        'https://adsterra.com/embed/autoembed/script.js',
        'https://exoclick.com/vidsrc/track',
        'https://onclickperformance.com/themoviedb.org/pop'
      ];

      for (const uri of spoofAttempts) {
        // Because host check uses hostname, not full URL query string, the ad host is properly blocked
        expect(isAdOrBlockedUrl(uri), `Spoofed URL must still be detected: ${uri}`).toBe(true);
        expect(handleUrlOverride(uri, false), `Spoofed URL in subframe must be blocked: ${uri}`).toBe(true);
      }
    });
  });

  // =========================================================================
  // 3. User-Agent Normalization Stress Harness
  // =========================================================================
  describe('User-Agent Normalization Resilience', () => {
    function sanitizeUserAgent(defaultUa: string): string {
      return (defaultUa || '')
        .replace("; wv)", ")")
        .replace("; wv", "")
        .replace("Version/4.0 ", "");
    }

    it('removes Android WebView markers (; wv) and Version/4.0 cleanly across device archetypes', () => {
      const testCases = [
        {
          name: 'Nexus Player TV (Android 8.0 WebView)',
          raw: 'Mozilla/5.0 (Linux; U; Android 8.0.0; en-us; Nexus Player Build/OPR6.170623.021) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.158 Mobile Safari/537.36; wv)',
          expectedToContain: ['Chrome/66.0.3359.158', 'Mobile Safari/537.36)'],
          forbidden: ['; wv', 'Version/4.0']
        },
        {
          name: 'Sony Bravia 4K TV (Android 10 WebView)',
          raw: 'Mozilla/5.0 (Linux; Android 10; BRAVIA 4K UR3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Safari/537.36',
          expectedToContain: ['Chrome/92.0.4515.159', 'Safari/537.36'],
          forbidden: ['; wv', 'Version/4.0']
        },
        {
          name: 'Nvidia Shield TV Pro (Android 11 WebView)',
          raw: 'Mozilla/5.0 (Linux; Android 11; SHIELD Android TV; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Safari/537.36',
          expectedToContain: ['Chrome/108.0.5359.128', 'Safari/537.36'],
          forbidden: ['; wv', 'Version/4.0']
        },
        {
          name: 'BlueStacks 5 Android Emulator',
          raw: 'Mozilla/5.0 (Linux; Android 9; SM-G988N Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.5195.136 Mobile Safari/537.36',
          expectedToContain: ['Chrome/105.0.5195.136', 'Mobile Safari/537.36'],
          forbidden: ['; wv', 'Version/4.0']
        },
        {
          name: 'Chromecast with Google TV',
          raw: 'Mozilla/5.0 (Linux; Android 12; Chromecast Build/STTE.220620.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Safari/537.36',
          expectedToContain: ['Chrome/114.0.5735.196', 'Safari/537.36'],
          forbidden: ['; wv', 'Version/4.0']
        }
      ];

      for (const tc of testCases) {
        const sanitized = sanitizeUserAgent(tc.raw);
        for (const exp of tc.expectedToContain) {
          expect(sanitized, `${tc.name} should preserve: ${exp}`).toContain(exp);
        }
        for (const forb of tc.forbidden) {
          expect(sanitized, `${tc.name} should not contain: ${forb}`).not.toContain(forb);
        }
      }
    });

    it('handles empty or malformed user-agent safely without throw', () => {
      expect(sanitizeUserAgent('')).toBe('');
      expect(sanitizeUserAgent('Chrome/120.0.0.0 Safari/537.36')).toBe('Chrome/120.0.0.0 Safari/537.36');
    });
  });

  // =========================================================================
  // 4. VideoPlayer.tsx Iframe Sandbox Token Hardening
  // =========================================================================
  describe('VideoPlayer.tsx Iframe Sandbox Verification', () => {
    it('verifies exact sandbox tokens in VideoPlayer.tsx embed iframe', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');

      const match = code.match(/<iframe[^>]*\bsandbox\s*=\s*["']([^"']*)["']/i);
      expect(match, 'Iframe with sandbox attribute must exist in VideoPlayer.tsx').not.toBeNull();
      const rawTokens = match![1];
      const tokens = rawTokens.split(/\s+/).filter(Boolean);

      // Required positive tokens
      expect(tokens).toContain('allow-scripts');
      expect(tokens).toContain('allow-same-origin');
      expect(tokens).toContain('allow-forms');
      expect(tokens).toContain('allow-presentation');

      // Strict security exclusions
      const dangerousTokens = [
        'allow-top-navigation',
        'allow-top-navigation-by-user-activation',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-modals',
        'allow-pointer-lock',
        'allow-orientation-lock'
      ];

      for (const dangerous of dangerousTokens) {
        expect(tokens, `Dangerous token '${dangerous}' must NOT be in iframe sandbox`).not.toContain(dangerous);
      }
    });

    it('verifies allow attribute on embed iframe for media capabilities', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      const match = code.match(/<iframe[^>]*\ballow\s*=\s*["']([^"']*)["']/i);
      expect(match, 'Iframe must have allow attribute for autoplay/fullscreen').not.toBeNull();
      const allowVal = match![1];
      expect(allowVal).toContain('autoplay');
      expect(allowVal).toContain('fullscreen');
      expect(allowVal).toContain('encrypted-media');
    });
  });

  // =========================================================================
  // 5. Watchdog Failover Oracle
  // =========================================================================
  describe('Watchdog Failover Simulation Oracle', () => {
    it('cycles through fallback servers sequentially and terminates without infinite loop', () => {
      const servers = [
        { name: 'Server 1 (FrameX)', url: 'https://framextv.cc/embed/155' },
        { name: 'Server 2 (AutoEmbed)', url: 'https://player.autoembed.cc/embed/movie/155' },
        { name: 'Server 3 (MultiEmbed)', url: 'https://multiembed.mov/?video_id=155' },
        { name: 'Server 4 (2Embed)', url: 'https://www.2embed.cc/embed/155' },
        { name: 'Server 5 (VidSrc)', url: 'https://vidsrc.to/embed/movie/155' }
      ];

      let currentIndex = 0;
      const attempted = new Set<number>();
      let terminalError: string | null = null;

      const triggerWatchdogTimeout = () => {
        attempted.add(currentIndex);
        if (attempted.size >= servers.length) {
          terminalError = 'All streaming servers are currently unavailable.';
          return;
        }
        currentIndex = (currentIndex + 1) % servers.length;
      };

      // 1st failure: moves to Server 2 (AutoEmbed)
      triggerWatchdogTimeout();
      expect(currentIndex).toBe(1);
      expect(terminalError).toBeNull();

      // 2nd failure: moves to Server 3 (MultiEmbed)
      triggerWatchdogTimeout();
      expect(currentIndex).toBe(2);
      expect(terminalError).toBeNull();

      // 3rd failure: moves to Server 4 (2Embed)
      triggerWatchdogTimeout();
      expect(currentIndex).toBe(3);
      expect(terminalError).toBeNull();

      // 4th failure: moves to Server 5 (VidSrc)
      triggerWatchdogTimeout();
      expect(currentIndex).toBe(4);
      expect(terminalError).toBeNull();

      // 5th failure: all servers exhausted -> triggers terminal error
      triggerWatchdogTimeout();
      expect(terminalError).toBe('All streaming servers are currently unavailable.');
      expect(attempted.size).toBe(5);
    });

    it('disarms watchdog when playback starts via postMessage', () => {
      vi.useFakeTimers();

      let hasPlaybackStarted = false;
      let watchdogTimer: any = null;
      let switchedServer = false;

      // Arm watchdog
      watchdogTimer = setTimeout(() => {
        if (!hasPlaybackStarted) {
          switchedServer = true;
        }
      }, 10000);

      // Simulate receiving frameXTV:timeupdate at t = 3s
      vi.advanceTimersByTime(3000);
      hasPlaybackStarted = true;
      clearTimeout(watchdogTimer);
      watchdogTimer = null;

      // Advance past 10s
      vi.advanceTimersByTime(8000);
      expect(switchedServer).toBe(false);

      vi.useRealTimers();
    });
  });

  // =========================================================================
  // 6. Embed Server Order & Clean Prioritization
  // =========================================================================
  describe('Embed Server Clean Prioritization across Services', () => {
    it('verifies VideoPlayer fallback servers list order', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      expect(code).toContain("name: 'Server 1 (FrameX)'");
      expect(code).toContain("name: 'Server 2 (AutoEmbed)'");
      expect(code).toContain("name: 'Server 3 (MultiEmbed)'");
      expect(code).toContain("name: 'Server 4 (2Embed)'");
      expect(code).toContain("name: 'Server 5 (VidSrc)'");

      const idxFrameX = code.indexOf("name: 'Server 1 (FrameX)'");
      const idxAutoEmbed = code.indexOf("name: 'Server 2 (AutoEmbed)'");
      const idxVidSrc = code.indexOf("name: 'Server 5 (VidSrc)'");

      expect(idxFrameX).toBeLessThan(idxAutoEmbed);
      expect(idxAutoEmbed).toBeLessThan(idxVidSrc);
    });

    it('verifies frontend api.ts embedServers order', () => {
      const code = fs.readFileSync(apiPath, 'utf8');
      const idxFrameX = code.indexOf("Server 1 (FrameX)");
      const idxAutoEmbed = code.indexOf("Server 2 (AutoEmbed)");
      const idxVidSrc = code.indexOf("Server 5 (VidSrc)");

      expect(idxFrameX).toBeGreaterThanOrEqual(0);
      expect(idxAutoEmbed).toBeGreaterThanOrEqual(0);
      expect(idxVidSrc).toBeGreaterThanOrEqual(0);

      expect(idxFrameX).toBeLessThan(idxAutoEmbed);
      expect(idxAutoEmbed).toBeLessThan(idxVidSrc);
    });

    it('verifies backend framextv.adapter.ts embedServers order', () => {
      const code = fs.readFileSync(backendAdapterPath, 'utf8');
      const idxFrameX = code.indexOf("Server 1 (FrameX)");
      const idxAutoEmbed = code.indexOf("Server 2 (AutoEmbed)");
      const idxVidSrc = code.indexOf("Server 5 (VidSrc)");

      expect(idxFrameX).toBeGreaterThanOrEqual(0);
      expect(idxAutoEmbed).toBeGreaterThanOrEqual(0);
      expect(idxVidSrc).toBeGreaterThanOrEqual(0);

      expect(idxFrameX).toBeLessThan(idxAutoEmbed);
      expect(idxAutoEmbed).toBeLessThan(idxVidSrc);
    });
  });
});
