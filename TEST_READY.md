# CineWave TV - Test Readiness Declaration (`TEST_READY.md`)

**Date**: 2026-11-04  
**Author**: `teamwork_test_writer_e2e`  
**Track**: E2E Testing Track  
**Status**: READY FOR MILESTONE INTEGRATION  

---

## 1. Executive Summary
The comprehensive, 4-tier opaque-box E2E test suite for CineWave TV is fully designed, implemented, and operational under `frontend/src/tests/e2e.test.ts`.

All 41 test cases strictly adhere to the authoritative requirements in `ORIGINAL_REQUEST.md` and architecture contracts in `PROJECT.md`. The test runner executes cleanly via `npm test --prefix frontend`, providing a clear validation harness for Milestones M1, M2, M3, and M4.

---

## 2. Test Execution Baseline
- **Execution Command**: `npm test --prefix frontend`
- **Total Test Files**: 2 (`focus.test.ts`, `e2e.test.ts`)
- **Total Test Cases**: 63
  - **Passed**: 43 (68.3%)
  - **Failed (Pending Implementation)**: 20 (31.7%)
  - **Execution Duration**: ~7.6s

### Test Results Breakdown by Suite
| Suite | File | Tests | Passing | Failing | Status |
|---|---|---|---|---|---|
| TV Navigation & UX | `frontend/src/tests/focus.test.ts` | 22 | 22 (100%) | 0 | PASSED |
| 4-Tier E2E Suite | `frontend/src/tests/e2e.test.ts` | 41 | 21 (51.2%) | 20 (48.8%) | ACTIVE / READY |
| **Total** | | **63** | **43** | **20** | **READY** |

---

## 3. 4-Tier Test Suite Inventory & Coverage

### Tier 1: Feature Coverage (Isolation)
| ID | Requirement | Feature | Description | Status |
|---|---|---|---|---|
| R1.1 | R1 | F1 | Embed server priority orders clean servers (FrameX/AutoEmbed) at indices 0 and 1, demoting VidSrc | PASS |
| R1.2 | R1 | F2 | VideoPlayer iframe sandbox restricts popups, modals, and top-level navigation | FAIL (F2 Pending) |
| R1.3 | R1 | F3 | VideoPlayer fallback watchdog triggers rotation to next server after 10s timeout | PASS |
| R1.4 | R1 | F4 | Native Android WebView host blocks external redirects, ad schemes, and multi-window popups | PASS |
| R1.5 | R1 | F5 | Android WebView User-Agent is normalized to TV Chrome without "; wv)" bot gate indicator | PASS |
| R2.1 | R2 | F6 | Universal Subtitle Parser parses SubRip (.srt) cues with comma millisecond timestamps | FAIL (F6 Pending) |
| R2.2 | R2 | F6 | Universal Subtitle Parser parses WebVTT cues with period timestamps and optional headers | FAIL (F6 Pending) |
| R2.3 | R2 | F6 | Universal Subtitle Parser parses ASS/SSA dialogue lines and strips formatting override tags | FAIL (F6 Pending) |
| R2.4 | R2 | F9 | Switching or disabling subtitle tracks immediately clears active on-screen cues (0ms clear) | PASS |
| R2.5 | R2 | F8 | Subtitle metadata tracks are preserved during embed server fallback in resolvePlayback | PASS |
| R3.1 | R3 | F13 | Settings service initializes and persists default AppSettings matching interface contract | FAIL (F13 Pending) |
| R3.2 | R3 | F13 | Settings service updateAppSettings supports partial patching and persists changes | FAIL (F13 Pending) |
| R3.3 | R3 | F14 | Automatic update check executes conditionally based on autoCheckOnLaunch preference | PASS |
| R3.4 | R3 | F15 | Manual update check queries remote version manifest and interfaces with native updater | PASS |
| R3.5 | R3 | F16 | Subtitle styling controls and preview generate valid 10-foot TV CSS styling rules | PASS |

### Tier 2: Boundary & Corner Cases
| ID | Requirement | Feature | Description | Status |
|---|---|---|---|---|
| 2.R1.1 | R1 | F3 | VideoPlayer reaches terminal error UI gracefully after all fallback servers are exhausted | PASS |
| 2.R1.2 | R1 | F1/F3 | Server URL parameter concatenation handles existing queries without duplicating ? or corrupting tokens | PASS |
| 2.R1.3 | R1 | - | VideoPlayer guards against zero, NaN, or infinite duration values to avoid divide-by-zero crashes | PASS |
| 2.R1.4 | R1 | F3 | Rapid manual server switching clears in-flight watchdog timer to prevent stale fallback race | PASS |
| 2.R1.5 | R1 | F2/F4 | VideoPlayer safely rejects malformed or untrusted postMessage events without exception | PASS |
| 2.R2.1 | R2 | F6 | Empty or whitespace-only subtitle payloads return an empty cues array without crashing | FAIL (F6 Pending) |
| 2.R2.2 | R2 | F6 | Malformed timecodes in subtitle cues are dropped or sanitized without producing NaN timestamps | FAIL (F6 Pending) |
| 2.R2.3 | R2 | F6/F7 | Overlapping and chronologically disordered subtitle cues are sorted and queried accurately | FAIL (F6 Pending) |
| 2.R2.4 | R2 | F6/F7 | Subtitle cue text sanitization removes script injection and formatting tags cleanly | FAIL (F6 Pending) |
| 2.R2.5 | R2 | F10 | Subtitle CDN fetch failure or CORS rejection fails gracefully without halting playback | PASS |
| 2.R3.1 | R3 | F13 | Corrupted or unparseable JSON in localStorage settings falls back safely to default AppSettings | FAIL (F13 Pending) |
| 2.R3.2 | R3 | F13/F16 | Extreme or out-of-bounds subtitle styling patches are clamped to valid schema values | FAIL (F13 Pending) |
| 2.R3.3 | R3 | F14/F15 | App update check handles network timeout or HTTP 500 error without throwing uncaught exceptions | PASS |
| 2.R3.4 | R3 | F14/F15 | Version comparison logic rejects manifests with lower or identical version codes and commit hashes | PASS |
| 2.R3.5 | R3 | F12 | Rapid TV D-pad navigation at boundary items does not cause focus loss or undefined active key | PASS |

### Tier 3: Cross-Feature Interactions
| ID | Requirements | Description | Status |
|---|---|---|---|
| 3.1 | R3 ↔ R2 | Subtitle styling modified in Settings propagates to SubtitleOverlay DOM style attributes | FAIL (F13 Pending) |
| 3.2 | R3 ↔ R1 | Preferred server index set in Settings dictates VideoPlayer initial server selection | FAIL (F13 Pending) |
| 3.3 | R1 ↔ R2 | Server fallback watchdog preserves active subtitle track and playback position continuity | PASS |
| 3.4 | R3 ↔ R3 | Launch update check execution does not collide or overwrite active Settings screen state | FAIL (F13 Pending) |
| 3.5 | R3 ↔ R1 | Autoplay next episode setting disabled in preferences stops automated series progression | FAIL (F13 Pending) |
| 3.6 | R3 ↔ R1 | Auto server failover toggle controls automatic watchdog fallback activation | FAIL (F13 Pending) |

### Tier 4: Real-World Application Scenarios
| ID | Workflow | Description | Status |
|---|---|---|---|
| 4.1 | R3 | Cold App Launch -> Startup Update Check -> D-pad to Settings -> Configure Preferred Server -> Return Home | FAIL (F13 Pending) |
| 4.2 | R1 | Catalog Browse -> Select Movie -> Direct Playback Failure -> Watchdog Rotates to Clean Sandboxed Embed | PASS |
| 4.3 | R2 | Movie Playback -> TV Remote D-pad Subtitle Menu -> Select Spanish SRT Track -> Visible Subtitle Rendering | FAIL (F6 Pending) |
| 4.4 | R3 ↔ R2 | Active Subtitles -> Exit to Settings -> Customize Subtitle Style -> Resume Playback -> Immediate Style Refresh | FAIL (F13 Pending) |
| 4.5 | R1 | Primary Embed Server Blocked / Intrusive Ads -> Watchdog Auto-switches to Secondary Clean Server | PASS |

---

## 4. Implementation Defect & Gap Escalations
The test runner has identified 3 distinct feature groups pending implementation by milestone workers:

### Escalation 1: Milestone 1 (M1) — Feature F2 (Iframe Sandbox)
- **Affects**: Test `R1.2 (F2)`
- **Defect Description**: `frontend/src/components/player/VideoPlayer.tsx` iframe element at line 929 lacks the required `sandbox` attribute.
- **Remediation**: Add `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` to the embed `<iframe>`.

### Escalation 2: Milestone 2 (M2) — Feature F6 (`subtitleParser.ts`)
- **Affects**: Tests `R2.1`, `R2.2`, `R2.3`, `2.R2.1`, `2.R2.2`, `2.R2.3`, `2.R2.4`, `Scenario 4.3`
- **Defect Description**: `frontend/src/utils/subtitleParser.ts` is not yet created.
- **Remediation**: Implement `parseSubtitles(rawContent: string, formatHint?: string): SubtitleCue[]` supporting SRT, WebVTT, and ASS formats per Interface Contracts in `PROJECT.md`.

### Escalation 3: Milestone 3 (M3) — Feature F13 (`settingsService.ts`)
- **Affects**: Tests `R3.1`, `R3.2`, `2.R3.1`, `2.R3.2`, `3.1`, `3.2`, `3.4`, `3.5`, `3.6`, `Scenario 4.1`, `Scenario 4.4`
- **Defect Description**: `frontend/src/services/settingsService.ts` is not yet created.
- **Remediation**: Implement `getAppSettings()`, `updateAppSettings(patch)`, and `resetAppSettings()` persisting `AppSettings` to `localStorage` under key `cinewave_settings` per Interface Contracts in `PROJECT.md`.

---

## 5. Next Steps
1. M1 Worker to implement Iframe Sandbox (F2) in `VideoPlayer.tsx`.
2. M2 Worker to implement `subtitleParser.ts` (F6) and `SubtitleOverlay.tsx` (F7).
3. M3 Worker to implement `settingsService.ts` (F13) and `SettingsScreen.tsx` (F11).
4. M4 Final Milestone to verify 100% pass rate (63/63) and execute adversarial hardening.
