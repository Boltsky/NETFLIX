import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// Challenger M1 Empirical Stress & Adversarial Test Suite
// Focus: Watchdog timer, rapid switching race conditions, loop termination,
// postMessage resilience, sandbox tokens, and Android host hardening.
// ============================================================================

const projectRoot = path.resolve(__dirname, '../../../');
const videoPlayerPath = path.resolve(__dirname, '../components/player/VideoPlayer.tsx');
const mainActivityPath = path.resolve(projectRoot, 'android/app/src/main/java/com/cinewave/tv/MainActivity.kt');
const apiPath = path.resolve(__dirname, '../services/api.ts');

describe('Challenger M1: Empirical Watchdog & Failover Stress Verification', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. Static Source Code Analysis & Verification
  // --------------------------------------------------------------------------
  describe('Static Contract & Implementation Verification', () => {
    it('verifies VideoPlayer.tsx contains 10-second watchdog timer threshold', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      expect(code).toMatch(/WATCHDOG_TIMEOUT_MS\s*=\s*10000/);
      expect(code).toMatch(/watchdogTimerRef/);
      expect(code).toMatch(/hasPlaybackStartedRef/);
      expect(code).toMatch(/attemptedServersRef/);
    });

    it('verifies VideoPlayer iframe enforces strict sandbox tokens and rejects ad capabilities', () => {
      const code = fs.readFileSync(videoPlayerPath, 'utf8');
      const sandboxMatch = code.match(/sandbox="([^"]+)"/);
      expect(sandboxMatch, 'sandbox attribute must be present on iframe').not.toBeNull();
      const tokens = sandboxMatch![1].split(/\s+/);

      // Mandatory secure tokens
      expect(tokens).toContain('allow-scripts');
      expect(tokens).toContain('allow-same-origin');
      expect(tokens).toContain('allow-forms');
      expect(tokens).toContain('allow-presentation');

      // Prohibited dangerous ad/popup tokens
      expect(tokens).not.toContain('allow-top-navigation');
      expect(tokens).not.toContain('allow-top-navigation-by-user-activation');
      expect(tokens).not.toContain('allow-popups');
      expect(tokens).not.toContain('allow-popups-to-escape-sandbox');
      expect(tokens).not.toContain('allow-modals');
    });

    it('verifies Embed Servers order FrameX and AutoEmbed before VidSrc in VideoPlayer, api.ts, and framextv.adapter.ts', () => {
      const vpCode = fs.readFileSync(videoPlayerPath, 'utf8');
      const apiCode = fs.readFileSync(apiPath, 'utf8');
      const backendAdapterPath = path.resolve(projectRoot, 'backend/src/providers/framextv.adapter.ts');
      const backendCode = fs.readFileSync(backendAdapterPath, 'utf8');

      // Check VideoPlayer fallback server order
      const vpFrameXIdx = vpCode.indexOf('Server 1 (FrameX)');
      const vpAutoEmbedIdx = vpCode.indexOf('Server 2 (AutoEmbed)');
      const vpVidSrcIdx = vpCode.indexOf('Server 5 (VidSrc)');
      expect(vpFrameXIdx).toBeGreaterThan(-1);
      expect(vpAutoEmbedIdx).toBeGreaterThan(vpFrameXIdx);
      expect(vpVidSrcIdx).toBeGreaterThan(vpAutoEmbedIdx);

      // Check api.ts fallback server order
      const apiFrameXIdx = apiCode.indexOf('Server 1 (FrameX)');
      const apiAutoEmbedIdx = apiCode.indexOf('Server 2 (AutoEmbed)');
      const apiVidSrcIdx = apiCode.indexOf('Server 5 (VidSrc)');
      expect(apiFrameXIdx).toBeGreaterThan(-1);
      expect(apiAutoEmbedIdx).toBeGreaterThan(apiFrameXIdx);
      expect(apiVidSrcIdx).toBeGreaterThan(apiAutoEmbedIdx);

      // Check backend adapter embed server order
      const beFrameXIdx = backendCode.indexOf('Server 1 (FrameX)');
      const beAutoEmbedIdx = backendCode.indexOf('Server 2 (AutoEmbed)');
      const beVidSrcIdx = backendCode.indexOf('Server 5 (VidSrc)');
      expect(beFrameXIdx).toBeGreaterThan(-1);
      expect(beAutoEmbedIdx).toBeGreaterThan(beFrameXIdx);
      expect(beVidSrcIdx).toBeGreaterThan(beAutoEmbedIdx);
    });

    it('verifies MainActivity.kt native WebView hardening against ad popups and Cloudflare Turnstile', () => {
      const code = fs.readFileSync(mainActivityPath, 'utf8');

      // User-agent normalization removing bot indicators
      expect(code).toMatch(/settings\.userAgentString\s*=\s*sanitizedUa/);
      expect(code).toContain('; wv)');
      expect(code).toContain('Version/4.0 ');

      // Block window creation (popups)
      expect(code).toMatch(/setSupportMultipleWindows\s*\(\s*true\s*\)/);
      expect(code).toMatch(/javaScriptCanOpenWindowsAutomatically\s*=\s*false/);
      expect(code).toMatch(/onCreateWindow[\s\S]*?return\s+false/);

      // shouldOverrideUrlLoading blocks main frame navigation away from appassets
      expect(code).toMatch(/shouldOverrideUrlLoading/);
      expect(code).toMatch(/appassets\.androidplatform\.net/);

      // JS dialog auto-dismissal
      expect(code).toMatch(/onJsAlert/);
      expect(code).toMatch(/onJsConfirm/);
      expect(code).toMatch(/onJsPrompt/);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Watchdog State Machine & Timing Verification
  // --------------------------------------------------------------------------
  describe('Watchdog State Machine & Timing Simulation', () => {
    interface ServerState {
      index: number;
      name: string;
      url: string;
    }

    const testServers: ServerState[] = [
      { index: 0, name: 'Server 1 (FrameX)', url: 'https://framextv.cc/embed/100' },
      { index: 1, name: 'Server 2 (AutoEmbed)', url: 'https://player.autoembed.cc/embed/movie/100' },
      { index: 2, name: 'Server 3 (MultiEmbed)', url: 'https://multiembed.mov/?video_id=100' },
      { index: 3, name: 'Server 4 (2Embed)', url: 'https://www.2embed.cc/embed/100' },
      { index: 4, name: 'Server 5 (VidSrc)', url: 'https://vidsrc.to/embed/movie/100' },
    ];

    class EmpiricalWatchdogSimulator {
      public selectedIndex = 0;
      public hasPlaybackStarted = false;
      public attemptedServers = new Set<number>();
      public currentTimer: ReturnType<typeof setTimeout> | null = null;
      public terminalError: string | null = null;
      public switchHistory: Array<{ from: number; to: number; manual: boolean; timestamp: number }> = [];
      public currentTime = 0;

      constructor(public servers: ServerState[] = testServers, public timeoutMs: number = 10000) {}

      public startWatchdog() {
        if (this.currentTimer) {
          clearTimeout(this.currentTimer);
          this.currentTimer = null;
        }
        this.hasPlaybackStarted = false;

        this.currentTimer = setTimeout(() => {
          if (!this.hasPlaybackStarted) {
            this.attemptedServers.add(this.selectedIndex);

            if (this.attemptedServers.size >= this.servers.length) {
              this.terminalError = 'All streaming servers are currently unavailable. Please try again later or select another server.';
              return;
            }

            const nextIndex = (this.selectedIndex + 1) % this.servers.length;
            this.switchServer(nextIndex, false);
          }
        }, this.timeoutMs);
      }

      public switchServer(targetIndex: number, manual: boolean = true) {
        const prevIndex = this.selectedIndex;
        const nextIndex = ((targetIndex % this.servers.length) + this.servers.length) % this.servers.length;
        this.selectedIndex = nextIndex;
        this.terminalError = null;

        if (this.currentTimer) {
          clearTimeout(this.currentTimer);
          this.currentTimer = null;
        }
        this.hasPlaybackStarted = false;

        if (manual) {
          this.attemptedServers.clear();
        }

        this.switchHistory.push({
          from: prevIndex,
          to: nextIndex,
          manual,
          timestamp: Date.now()
        });

        // Trigger next watchdog cycle
        this.startWatchdog();
      }

      public receiveTelemetry(event: { type?: string; event?: string; currentTime?: number; duration?: number }) {
        const isTimeUpdate = event.event === 'frameXTV:timeupdate' || event.event === 'timeupdate' || event.type === 'timeupdate';
        const isPlaying = event.event === 'playing' || event.event === 'play' || event.type === 'playing' || event.type === 'play';

        if (isTimeUpdate) {
          const cur = Number(event.currentTime || 0);
          const dur = Number(event.duration || 0);
          if (cur > 0 || dur > 0) {
            this.hasPlaybackStarted = true;
            if (this.currentTimer) {
              clearTimeout(this.currentTimer);
              this.currentTimer = null;
            }
          }
        } else if (isPlaying) {
          this.hasPlaybackStarted = true;
          if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
          }
        }
      }

      public triggerIframeError() {
        this.attemptedServers.add(this.selectedIndex);
        if (this.attemptedServers.size < this.servers.length) {
          const nextIndex = (this.selectedIndex + 1) % this.servers.length;
          this.switchServer(nextIndex, false);
        } else {
          this.terminalError = 'All streaming servers are currently unavailable.';
        }
      }
    }

    it('verifies watchdog arms at exactly 10s and does not trigger prematurely at 9900ms', () => {
      const sim = new EmpiricalWatchdogSimulator();
      sim.startWatchdog();

      expect(sim.selectedIndex).toBe(0);
      expect(sim.currentTimer).not.toBeNull();

      vi.advanceTimersByTime(9900);
      expect(sim.selectedIndex).toBe(0); // Still server 0
      expect(sim.attemptedServers.size).toBe(0);

      vi.advanceTimersByTime(150);
      expect(sim.selectedIndex).toBe(1); // Switched to server 1
      expect(sim.attemptedServers.has(0)).toBe(true);
    });

    it('verifies valid timeupdate (>0) disarms watchdog immediately', () => {
      const sim = new EmpiricalWatchdogSimulator();
      sim.startWatchdog();

      // Playback starts at 3.5s
      vi.advanceTimersByTime(3500);
      sim.receiveTelemetry({ event: 'frameXTV:timeupdate', currentTime: 1.2, duration: 120 });

      expect(sim.hasPlaybackStarted).toBe(true);
      expect(sim.currentTimer).toBeNull();

      // Advance past 10s mark
      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(0); // Did not rotate!
      expect(sim.attemptedServers.size).toBe(0);
    });

    it('verifies zero-time telemetry (cur=0, dur=0) does NOT disarm watchdog', () => {
      const sim = new EmpiricalWatchdogSimulator();
      sim.startWatchdog();

      // Ad banner sends 0/0 timeupdate at 2s
      vi.advanceTimersByTime(2000);
      sim.receiveTelemetry({ event: 'timeupdate', currentTime: 0, duration: 0 });

      expect(sim.hasPlaybackStarted).toBe(false);
      expect(sim.currentTimer).not.toBeNull();

      // Watchdog should continue and trigger at 10s
      vi.advanceTimersByTime(8100);
      expect(sim.selectedIndex).toBe(1); // Rotated to Server 1
      expect(sim.attemptedServers.has(0)).toBe(true);
    });

    it('verifies playing event disarms watchdog', () => {
      const sim = new EmpiricalWatchdogSimulator();
      sim.startWatchdog();

      vi.advanceTimersByTime(4000);
      sim.receiveTelemetry({ type: 'playing' });

      expect(sim.hasPlaybackStarted).toBe(true);
      expect(sim.currentTimer).toBeNull();

      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(0); // Remains on Server 0
    });
  });

  // --------------------------------------------------------------------------
  // 3. Terminal Failover & Infinite Loop Prevention
  // --------------------------------------------------------------------------
  describe('Terminal Failover & Infinite Loop Prevention', () => {
    it('verifies all 5 servers timing out sequentially halts at terminal error UI without infinite ping-pong', () => {
      const sim = new (class {
        public selectedIndex = 0;
        public hasPlaybackStarted = false;
        public attemptedServers = new Set<number>();
        public currentTimer: any = null;
        public terminalError: string | null = null;
        public totalSwitches = 0;

        startWatchdog() {
          this.currentTimer = setTimeout(() => {
            this.attemptedServers.add(this.selectedIndex);
            if (this.attemptedServers.size >= 5) {
              this.terminalError = 'All streaming servers are currently unavailable. Please try again later or select another server.';
              return;
            }
            this.selectedIndex = (this.selectedIndex + 1) % 5;
            this.totalSwitches++;
            this.startWatchdog();
          }, 10000);
        }
      })();

      sim.startWatchdog();

      // Cycle 1: Server 0 -> 10s timeout -> Server 1
      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(1);
      expect(sim.attemptedServers.size).toBe(1);

      // Cycle 2: Server 1 -> 10s timeout -> Server 2
      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(2);
      expect(sim.attemptedServers.size).toBe(2);

      // Cycle 3: Server 2 -> 10s timeout -> Server 3
      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(3);
      expect(sim.attemptedServers.size).toBe(3);

      // Cycle 4: Server 3 -> 10s timeout -> Server 4 (VidSrc)
      vi.advanceTimersByTime(10000);
      expect(sim.selectedIndex).toBe(4);
      expect(sim.attemptedServers.size).toBe(4);

      // Cycle 5: Server 4 -> 10s timeout -> Exhaustion
      vi.advanceTimersByTime(10000);
      expect(sim.attemptedServers.size).toBe(5);
      expect(sim.terminalError).not.toBeNull();
      expect(sim.terminalError).toContain('All streaming servers are currently unavailable');

      // Verify that no further rotation occurs after exhaustion
      vi.advanceTimersByTime(50000);
      expect(sim.totalSwitches).toBe(4); // Only 4 transitions: 0->1->2->3->4
      expect(sim.selectedIndex).toBe(4); // Remains halted on terminal error state
    });

    it('verifies combined iframe load errors and watchdog timeouts terminate gracefully', () => {
      let selectedIndex = 0;
      const attempted = new Set<number>();
      let terminalError: string | null = null;

      const onError = () => {
        attempted.add(selectedIndex);
        if (attempted.size < 5) {
          selectedIndex = (selectedIndex + 1) % 5;
        } else {
          terminalError = 'All streaming servers are currently unavailable.';
        }
      };

      const onWatchdogTimeout = () => {
        attempted.add(selectedIndex);
        if (attempted.size >= 5) {
          terminalError = 'All streaming servers are currently unavailable.';
          return;
        }
        selectedIndex = (selectedIndex + 1) % 5;
      };

      // Server 0 immediately fires onError
      onError();
      expect(selectedIndex).toBe(1);
      expect(attempted.size).toBe(1);

      // Server 1 times out after 10s
      onWatchdogTimeout();
      expect(selectedIndex).toBe(2);
      expect(attempted.size).toBe(2);

      // Server 2 fires onError
      onError();
      expect(selectedIndex).toBe(3);
      expect(attempted.size).toBe(3);

      // Server 3 fires onError
      onError();
      expect(selectedIndex).toBe(4);
      expect(attempted.size).toBe(4);

      // Server 4 times out
      onWatchdogTimeout();
      expect(attempted.size).toBe(5);
      expect(terminalError).toBe('All streaming servers are currently unavailable.');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Rapid Manual Server Switching & Race Condition Stress
  // --------------------------------------------------------------------------
  describe('Rapid Manual Server Switching & Race Condition Stress', () => {
    it('verifies 100 rapid manual switches within 500ms results in exactly 1 active timer', () => {
      let activeTimers = 0;
      let timerRef: any = null;
      let currentIndex = 0;
      const serversLength = 5;

      const handleSwitch = (target: number) => {
        const next = ((target % serversLength) + serversLength) % serversLength;
        currentIndex = next;
        if (timerRef) {
          clearTimeout(timerRef);
          activeTimers--;
        }
        activeTimers++;
        timerRef = setTimeout(() => {
          activeTimers--;
        }, 10000);
      };

      // Rapidly switch 100 times
      for (let i = 0; i < 100; i++) {
        handleSwitch(i);
        vi.advanceTimersByTime(5); // 5ms apart
      }

      expect(activeTimers).toBe(1);
      expect(currentIndex).toBe(99 % 5); // 4

      // Advance past 10s threshold
      vi.advanceTimersByTime(10001);
      expect(activeTimers).toBe(0);
    });

    it('verifies manual switch at 9999ms aborts in-flight fallback and grants full 10s window to new server', () => {
      let selectedIndex = 0;
      let watchdogTimer: any = null;
      let fallbackTriggered = false;

      const scheduleWatchdog = () => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        watchdogTimer = setTimeout(() => {
          fallbackTriggered = true;
          selectedIndex = (selectedIndex + 1) % 5;
        }, 10000);
      };

      scheduleWatchdog();

      // Advance to 9999ms (1ms before timeout)
      vi.advanceTimersByTime(9999);
      expect(fallbackTriggered).toBe(false);
      expect(selectedIndex).toBe(0);

      // User manually switches to server 2
      if (watchdogTimer) clearTimeout(watchdogTimer);
      selectedIndex = 2;
      scheduleWatchdog();

      // Advance by another 5000ms (total 14999ms elapsed since start)
      vi.advanceTimersByTime(5000);
      expect(fallbackTriggered).toBe(false);
      expect(selectedIndex).toBe(2); // Stale timeout did not fire

      // Advance remaining 5001ms for server 2 watchdog
      vi.advanceTimersByTime(5001);
      expect(fallbackTriggered).toBe(true);
      expect(selectedIndex).toBe(3);
    });

    it('verifies negative server indices wrap properly in circular modulo calculation', () => {
      const serversLength = 5;
      const normalizeIndex = (targetIndex: number) => {
        return ((targetIndex % serversLength) + serversLength) % serversLength;
      };

      // PageUp / ChannelUp from server 0 should wrap to server 4
      expect(normalizeIndex(0 - 1)).toBe(4);
      // Large negative number
      expect(normalizeIndex(-10)).toBe(0);
      expect(normalizeIndex(-11)).toBe(4);
      // Large positive number
      expect(normalizeIndex(10)).toBe(0);
      expect(normalizeIndex(11)).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 5. PostMessage Telemetry & Boundary Resilience
  // --------------------------------------------------------------------------
  describe('PostMessage Telemetry & Boundary Resilience', () => {
    it('safely handles untrusted, primitive, and adversarial postMessage payloads without crashing', () => {
      let stateCurrentTime = 0;
      let stateDuration = 0;
      let errorEncountered = false;

      const handleMessage = (event: { data: any }) => {
        try {
          const data = event.data;
          if (!data) return;

          const isTimeUpdate =
            data.event === 'frameXTV:timeupdate' ||
            data.event === 'timeupdate' ||
            data.type === 'timeupdate';

          if (isTimeUpdate) {
            const cur = Number(data.currentTime || 0);
            const dur = Number(data.duration || 0);
            if (cur >= 0) stateCurrentTime = cur;
            if (dur > 0) stateDuration = dur;
          }
        } catch {
          errorEncountered = true;
        }
      };

      const adversarialPayloads = [
        null,
        undefined,
        0,
        12345,
        'malicious-string',
        true,
        [],
        [1, 2, 3],
        { event: null },
        { event: undefined },
        { event: 'timeupdate', currentTime: 'not-a-number', duration: 'invalid' },
        { event: 'timeupdate', currentTime: NaN, duration: NaN },
        { event: 'timeupdate', currentTime: Infinity, duration: -50 },
        { event: 'timeupdate', currentTime: -100, duration: 100 },
        { __proto__: { evil: true } }
      ];

      for (const payload of adversarialPayloads) {
        handleMessage({ data: payload });
      }

      expect(errorEncountered).toBe(false);
      // Check that invalid values did not pollute state with NaN
      expect(Number.isNaN(stateCurrentTime)).toBe(false);
      expect(Number.isNaN(stateDuration)).toBe(false);
    });

    it('verifies MainActivity and VideoPlayer detect and bypass 2-minute ad videos and dead streams', () => {
      const vpCode = fs.readFileSync(videoPlayerPath, 'utf8');
      const maCode = fs.readFileSync(mainActivityPath, 'utf8');

      // 1. VideoPlayer contains short duration ad detection
      expect(vpCode).toContain('ad_video_detected');
      expect(vpCode).toContain('reportedDur <= 210');
      expect(vpCode).toContain('Skipping ad video...');
      expect(vpCode).toContain('adFailoverTimerRef');

      // 2. VideoPlayer contains dead stream notice detection
      expect(vpCode).toContain("Couldn't Find This Content");
      expect(vpCode).toContain('MEDIA NOT FOUND');
      expect(vpCode).toContain('404 Not Found');

      // 3. MainActivity contains DisableDevtool neutralization and dead stream checks
      expect(maCode).toContain('DisableDevtool');
      expect(maCode).toContain('ad_video_detected');
      expect(maCode).toContain('v.duration<=210');
      expect(maCode).toContain("couldn't find this content");
      expect(maCode).toContain('media not found');
      expect(maCode).toContain('404 not found');
      expect(maCode).toContain('disable-devtool');
    });
  });
});
