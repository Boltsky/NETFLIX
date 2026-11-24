/**
 * Platform Detection Utility
 * Strictly differentiates between the CineWave Android TV Native APK and the Netflix Web Application clone.
 */
export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Android Native WebView Javascript Bridges injected by MainActivity.kt
  if (Boolean((window as any).AndroidTV || (window as any).AndroidUpdater)) {
    return true;
  }

  // 2. Android WebView Asset Domain (https://appassets.androidplatform.net/)
  if (
    typeof window.location !== 'undefined' &&
    window.location.hostname === 'appassets.androidplatform.net'
  ) {
    return true;
  }

  return false;
}
