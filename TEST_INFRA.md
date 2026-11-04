# CineWave TV - Test Infrastructure (`TEST_INFRA.md`)

## 1. Overview
The CineWave TV test infrastructure provides comprehensive, opaque-box end-to-end verification across the hybrid Android TV Leanback host, React TV frontend SPA, and catalog stream resolution adapters.

All test suites are automated, deterministic, and runnable locally or in CI environments without external cloud dependencies.

---

## 2. Test Architecture & Framework
- **Test Runner**: Vitest 2.1.9 (native Vite integration, ESM support, sub-second execution).
- **Environment**: Node.js with built-in DOM EventTarget polyfills, memory-backed `localStorage` emulation, and mock window bridge interfaces (`AndroidUpdater`, `handleTvKeyEvent`).
- **Execution Target**: Headless execution via npm scripts:
  ```bash
  npm test --prefix frontend
  ```

---

## 3. Test Suites Inventory
The frontend testing infrastructure is organized into two primary suites under `frontend/src/tests/`:

### 3.1. `frontend/src/tests/focus.test.ts` (22 Tests)
Focuses on 2D spatial TV D-pad navigation, Leanback remote keyboard layout, catalog rail pagination, memory-optimized image URL resolution, profile isolation, and playback progress persistence.

### 3.2. `frontend/src/tests/e2e.test.ts` (41 Tests)
The comprehensive, 4-tier opaque-box E2E test suite covering Requirements R1, R2, and R3:
- **Tier 1: Feature Coverage (Isolation)** — 15 Tests (5 per feature):
  - R1: Server priority reordering (F1), iframe sandbox policies (F2), 10s watchdog fallback (F3), Android WebView host protection (F4), User-Agent normalization (F5).
  - R2: SubRip .srt parsing (F6), WebVTT parsing (F6), ASS/SSA dialogue parsing (F6), 0ms immediate subtitle clearing (F9), subtitle metadata preservation during failover (F8).
  - R3: Centralized settings persistence schema (F13), partial patching (F13), launch update check toggle (F14), manual update check & install bridge (F15), subtitle TV styling CSS generation (F16).
- **Tier 2: Boundary & Corner Cases** — 15 Tests (5 per feature):
  - R1: Exhaustion of all fallback servers, URL parameter formatting with existing queries, non-finite (0/NaN/Infinity) duration handling, rapid server switching watchdog race cancellation, malformed postMessage rejection.
  - R2: Empty/whitespace subtitle payloads, malformed/inverted timecodes, overlapping & disordered cues, script injection / ASS tag sanitization, CDN/CORS network failure resilience.
  - R3: Corrupted localStorage JSON fallback, out-of-bounds styling value clamping, update check HTTP 500 / network offline handling, version manifest comparison rejection, rapid D-pad boundary navigation clamping.
- **Tier 3: Cross-Feature Interactions** — 6 Tests (Pairwise Combinations):
  - Settings Subtitle Styling ↔ SubtitleOverlay rendering.
  - Settings Preferred Server ↔ VideoPlayer initial server selection.
  - Automatic Server Fallback ↔ Subtitle & timestamp continuity.
  - Launch Update Check ↔ Settings screen navigation isolation.
  - Settings Autoplay Toggle ↔ VideoPlayer next episode progression.
  - Settings Auto Failover Toggle ↔ Watchdog activation control.
- **Tier 4: Real-World Application Scenarios** — 5 Tests (Complete TV User Workflows):
  - Scenario 4.1: Cold App Launch -> Startup Update Check -> D-pad to Settings -> Configure Preferred Server -> Return Home.
  - Scenario 4.2: Catalog Browse -> Select Movie -> Direct Playback Failure -> Watchdog Rotates to Clean Sandboxed Embed.
  - Scenario 4.3: Movie Playback -> TV Remote Subtitle Menu -> Select Spanish SRT -> Visible Subtitle Rendering.
  - Scenario 4.4: Active Subtitles -> Exit to Settings -> Customize Subtitle Style -> Resume Playback -> Immediate Style Refresh.
  - Scenario 4.5: Primary Embed Server Hangs / Ads Gated -> Watchdog Auto-switches to Secondary Clean Server -> Subtitle & Resume Continuity.

---

## 4. How to Run the Tests
### Full Test Suite (Recommended)
```bash
npm test --prefix frontend
```

### Run Specific Test Suite
```bash
# Run only E2E 4-Tier test suite:
npx vitest run src/tests/e2e.test.ts --dir frontend

# Run only Navigation & Focus suite:
npx vitest run src/tests/focus.test.ts --dir frontend
```

### Run in Watch / Interactive Mode
```bash
npx vitest src/tests/e2e.test.ts --dir frontend
```

---

## 5. Progressive Testability & Milestone Integration
The E2E test suite incorporates dynamic module loaders (`getSettingsService()`, `getSubtitleParser()`) and contract-based assertions designed for dual-track development:
1. **Milestone E2E (Current)**: Test infrastructure and 41 test cases deployed. 21/41 E2E tests passing; 20 pending features cleanly asserted.
2. **Milestone 1 (M1 - Ad & Robot Suppression)**: Implementation of F2 (Iframe Sandbox) will flip R1.2 from FAIL to PASS.
3. **Milestone 2 (M2 - Universal Subtitle Engine)**: Implementation of `subtitleParser.ts` (F6) and `SubtitleOverlay.tsx` (F7) will flip R2.1–R2.3, 2.R2.1–2.R2.4, and Scenario 4.3 to PASS.
4. **Milestone 3 (M3 - Settings Page, App Updates & Preferences)**: Implementation of `settingsService.ts` (F13) and `SettingsScreen.tsx` (F11) will flip R3.1–R3.2, 2.R3.1–2.R3.2, 3.1–3.6, and Scenarios 4.1, 4.4 to PASS.
5. **Milestone 4 (M4 - Final Hardening)**: Full test suite achieves 100% (63/63) passing rate.
