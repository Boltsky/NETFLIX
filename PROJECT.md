# Project: CineWave TV Enhancements

## Architecture
CineWave TV is an Android TV application utilizing a hybrid architecture:
- **Native Host (`android/`)**: Android TV Leanback host (`MainActivity.kt`) loading an embedded SPA via `WebViewAssetLoader` from `https://appassets.androidplatform.net/assets/index.html`. Handles hardware key capture (`KEYCODE_DPAD_*`, `ENTER`, `BACK`), bridge interfaces (`AndroidUpdater`), and native WebView request lifecycle (`WebChromeClient`, `WebViewClient`).
- **Frontend SPA (`frontend/`)**: React 18, TypeScript, TailwindCSS, and Hls.js. Features 2D spatial TV navigation (`FocusContext.tsx`), dual playback engines (HTML5/Hls.js direct video and sandboxed multi-server iframe embed in `VideoPlayer.tsx`), local-first state persistence in `localStorage`, and TV-first 10-foot UI layouts.
- **Backend Service (`backend/`)**: Node.js, Express, and TypeScript service delivering catalog metadata and stream resolution adapters (`framextv.adapter.ts`).

### Data & Control Flow
1. **Navigation**: Native key events -> `window.handleTvKeyEvent` -> `FocusContext.tsx` 2D spatial calculations -> active focus element. Screen switches governed by `currentScreen: Screen` in `App.tsx`.
2. **Playback & Fallback**: User selects title -> `api.resolvePlayback` queries direct stream and embed servers (FrameX/AutoEmbed prioritized) -> `VideoPlayer.tsx` attempts direct HLS/MP4 playback. If stream fails or resolution is fallback, switches to sandboxed iframe embed with an automated watchdog fallback timer.
3. **Subtitles**: Subtitle tracks extracted from `PlaybackResolution` -> fetched and parsed via `subtitleParser.ts` into normalized `SubtitleCue[]` -> rendered on TV via `SubtitleOverlay.tsx` with user-defined styling -> synchronized via `currentTime` (HTML5) or `frameXTV:timeupdate` postMessage (embed).
4. **Settings & Preferences**: Managed locally via `settingsService.ts` in `localStorage`. Provides synchronous configuration for preferred server, autoplay, default quality, and subtitle styling.
5. **App Updates**: `updateService.ts` checks `version.json` via GitHub raw manifest -> compares `versionCode` and commit hash -> triggers native APK download & `FileProvider` package installation via `window.AndroidUpdater` (`AppUpdateBridge`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Embed Server Priority Reordering | Place verified clean servers (FrameX, AutoEmbed) at indices 0 and 1; demote VidSrc to avoid Cloudflare bot verification | M1 | Survey R1 |
| F2 | HTML5 Iframe Sandbox Protection | Configure `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` in VideoPlayer iframe, blocking top-level navigation and popups | M1 | Survey R1 |
| F3 | Automatic Server Fallback Watchdog | 10s watchdog timer in VideoPlayer to rotate to next embed server if stream hangs, fails, or gates | M1 | Survey R1 |
| F4 | Native WebView Hardening | Implement `onCreateWindow` (return false), `shouldOverrideUrlLoading` (block main-frame external redirects & custom schemes), ad domain filtering, and JS dialog silencing in `MainActivity.kt` | M1 | Survey R1 |
| F5 | User-Agent Normalization | Set Android WebView userAgent to standard TV Chrome without `; wv)` to prevent bot gate detection | M1 | Survey R1 |
| F6 | Universal Subtitle Parser | Parse SRT (comma timecodes), WebVTT, and ASS/SSA subtitle formats into normalized `SubtitleCue[]` | M2 | Survey R2 |
| F7 | Television Subtitle Overlay | Render synchronized subtitles on screen above video and iframe engines with TV safe margins | M2 | Survey R2 |
| F8 | Subtitle Metadata Preservation | Retain subtitle tracks in `PlaybackResolution` even during embed server fallback in `api.ts` and `framextv.adapter.ts` | M2 | Survey R2 |
| F9 | Instantaneous Subtitle Clear & Switch | Immediately clear on-screen subtitles (0ms) when switched or disabled (`activeSubtitle = -1`) | M2 | Survey R2 |
| F10 | Subtitle CORS & Proxy Fallback | Proxy or resolve external subtitle CDNs lacking CORS headers | M2 | Survey R2 |
| F11 | Dedicated Settings Screen UI | 2-pane 10-foot TV settings screen (`SettingsScreen.tsx`) with category tabs on left and options on right | M3 | Survey R3 |
| F12 | Settings TV Navigation Integration | Add `'settings'` route to `App.tsx`, sidebar button in `NetflixSidebar.tsx`, and spatial D-pad navigation rules | M3 | Survey R3 |
| F13 | Centralized Preferences Persistence | `settingsService.ts` persisting preferred server, quality, autoplay, and subtitle styles in `localStorage` | M3 | Survey R3 |
| F14 | Automatic Update Check on Launch | Check for app updates upon startup (with user toggle) and display notification/modal if available | M3 | Survey R3 |
| F15 | Manual Update Check & Install UI | In Settings, display version info, manual check button, changelog, and download progress bar | M3 | Survey R3 |
| F16 | Subtitle Styling Controls & Live Preview | Settings controls for font size, text color, background opacity, edge style, and real-time preview | M3 | Survey R3 |
| F17 | Playback Preferences Wiring | Wire preferred server, quality, and autoplay from settings into `VideoPlayer.tsx` and `api.ts` | M3 | Survey R3 |
| F18 | Comprehensive Opaque-Box E2E Test Suite | Design and implement 4-tier opaque-box test suite (Tiers 1-4) published via `TEST_READY.md` | E2E Track | Dual Track |
| F19 | E2E Test Suite Verification | Pass 100% of E2E tests (Tiers 1-4) across all features and edge cases | M4 | Final Milestone Phase 1 |
| F20 | Adversarial Coverage Hardening | White-box source analysis and adversarial testing (Tier 5) with Challenger | M4 | Final Milestone Phase 2 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Comprehensive opaque-box test suite (Tiers 1-4), test runner, and `TEST_READY.md` | None | DONE |
| M1 | Ad & Robot Verification Suppression | Features F1, F2, F3, F4, F5: Embed server priority, iframe sandbox, fallback watchdog, native WebView hardening, User-Agent normalization | None | DONE |
| M2 | Universal Subtitle Engine & Rendering Fix | Features F6, F7, F8, F9, F10: Universal parser (SRT/WebVTT/ASS), SubtitleOverlay, metadata preservation, instant clearing, CORS handling | None | IN_PROGRESS |
| M3 | Settings Page, App Updates & Preferences | Features F11, F12, F13, F14, F15, F16, F17: Settings UI, TV D-pad navigation, settingsService, update checks, subtitle styling, playback preferences wiring | None | PLANNED |
| M4 | Final Milestone: E2E Verification & Hardening | Features F19, F20: 100% E2E test pass (Tiers 1-4), adversarial test hardening (Tier 5) | E2E, M1, M2, M3 | PLANNED |

---

## Interface Contracts

### `settingsService.ts` ↔ Player & UI Components
```typescript
export interface SubtitleStyles {
  fontSize: 'small' | 'medium' | 'large' | 'extralarge'; // 18px, 24px, 32px, 40px
  textColor: string; // '#FFFFFF', '#FFEB3B', '#00E5FF', '#76FF03'
  backgroundOpacity: 0 | 50 | 75 | 100; // 0%, 50%, 75%, 100%
  edgeStyle: 'none' | 'dropshadow' | 'outline';
}

export interface PlaybackSettings {
  preferredServerIndex: number; // 0: FrameX, 1: AutoEmbed, 2: MultiEmbed, 3: 2Embed, 4: VidSrc
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  autoplayNextEpisode: boolean;
  autoServerFailover: boolean;
}

export interface UpdateSettings {
  autoCheckOnLaunch: boolean;
  lastCheckTimestamp: number;
}

export interface AppSettings {
  playback: PlaybackSettings;
  subtitles: SubtitleStyles;
  updates: UpdateSettings;
}

// Synchronous local-first API:
export function getAppSettings(): AppSettings;
export function updateAppSettings(patch: Partial<AppSettings>): AppSettings;
export function resetAppSettings(): AppSettings;
```

### `subtitleParser.ts` ↔ `SubtitleOverlay.tsx`
```typescript
export interface SubtitleCue {
  id: string | number;
  start: number; // in seconds (float)
  end: number;   // in seconds (float)
  text: string;  // clean sanitized string (newlines preserved, tags stripped)
}

export function parseSubtitles(rawContent: string, formatHint?: string): SubtitleCue[];
```

### `api.ts` ↔ `VideoPlayer.tsx`
```typescript
export interface SubtitleTrack {
  url: string;
  label: string;
  lang: string;
  language?: string;
  format?: 'vtt' | 'srt' | 'ass';
  isDefault?: boolean;
}

export interface EmbedServer {
  name: string;
  url: string;
}

export interface PlaybackResolution {
  type: 'direct' | 'embed';
  sources?: Array<{ url: string; quality?: string; type?: string }>;
  subtitles: SubtitleTrack[]; // Must never be empty when upstream subtitles exist
  embedUrl?: string;
  embedServers?: EmbedServer[];
}
```

---

## Code Layout
- `android/app/src/main/java/com/cinewave/tv/MainActivity.kt`: Native Android host, WebView hardening, AppUpdateBridge.
- `frontend/src/App.tsx`: Screen routing, sidebar rendering, launch update check.
- `frontend/src/components/common/NetflixSidebar.tsx`: TV navigation sidebar with Settings button.
- `frontend/src/components/focus/FocusContext.tsx`: 2D spatial TV D-pad navigation context.
- `frontend/src/components/player/VideoPlayer.tsx`: Dual-engine video player with iframe sandboxing, watchdog fallback, and SubtitleOverlay.
- `frontend/src/components/player/SubtitleOverlay.tsx`: TV safe subtitle rendering overlay.
- `frontend/src/components/settings/SettingsScreen.tsx`: 2-pane 10-foot TV settings screen.
- `frontend/src/services/api.ts`: Stream resolution, embed server order, subtitle metadata.
- `frontend/src/services/settingsService.ts`: Centralized local-first preferences persistence.
- `frontend/src/services/updateService.ts`: GitHub release manifest check, version comparison, download/install triggers.
- `frontend/src/utils/subtitleParser.ts`: Universal parser for WebVTT, SRT, ASS/SSA.
- `backend/src/providers/framextv.adapter.ts`: Upstream stream/subtitle provider adapter.
- `tests/e2e/*`: Opaque-box E2E test suite and runner.
