import { CURRENT_APP_VERSION, VERSION_MANIFEST_URL, AppUpdateManifest } from '../version';

declare global {
  interface Window {
    AndroidUpdater?: {
      isAndroidApp: () => boolean;
      getAppVersionCode: () => number;
      getAppVersionName: () => string;
      downloadAndInstallApk: (url: string) => void;
    };
    onUpdateDownloadProgress?: (percent: number, status: string) => void;
  }
}

const STORAGE_KEY_DISMISSED = 'netflix_dismissed_version';
const STORAGE_KEY_LAST_CHECK = 'netflix_last_update_check';
const CHECK_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown for auto-checks

const getStorageItem = (key: string): string | null => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, val: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch {}
};

const removeStorageItem = (key: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
};

export function isNewerVersion(remote: AppUpdateManifest): boolean {
  // 1. versionCode check
  if (remote.versionCode > CURRENT_APP_VERSION.versionCode) {
    return true;
  }
  // 2. Different commit check if versionCode is the same
  if (
    remote.versionCode === CURRENT_APP_VERSION.versionCode &&
    remote.commitHash &&
    CURRENT_APP_VERSION.commitHash &&
    remote.commitHash.toLowerCase() !== CURRENT_APP_VERSION.commitHash.toLowerCase()
  ) {
    return true;
  }
  return false;
}

export const updateService = {
  /**
   * Checks GitHub repository for an update manifest.
   * @param forceManual If true, ignores cooldown and dismissal checks.
   */
  async checkForAppUpdate(forceManual = false): Promise<AppUpdateManifest | null> {
    const now = Date.now();
    const lastCheckStr = getStorageItem(STORAGE_KEY_LAST_CHECK);
    const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) : 0;

    if (!forceManual && now - lastCheck < CHECK_COOLDOWN_MS) {
      return null;
    }

    try {
      // Append cache-busting timestamp to avoid CDN stale cache
      const res = await fetch(`${VERSION_MANIFEST_URL}?t=${now}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn(`[UpdateService] Version check failed with status ${res.status}`);
        return null;
      }

      const manifest: AppUpdateManifest = await res.json();
      setStorageItem(STORAGE_KEY_LAST_CHECK, String(now));

      if (isNewerVersion(manifest)) {
        const dismissedVersion = getStorageItem(STORAGE_KEY_DISMISSED);
        const isDismissed = dismissedVersion === String(manifest.versionCode);

        // If forceManual or not dismissed or mandatory, prompt
        if (forceManual || !isDismissed || manifest.isMandatory) {
          return manifest;
        }
      }

      return null;
    } catch (err: any) {
      console.warn('[UpdateService] Update check network error:', err?.message);
      return null;
    }
  },

  /**
   * Records that the user dismissed this update version until next session/restart.
   */
  dismissUpdate(versionCode: number) {
    setStorageItem(STORAGE_KEY_DISMISSED, String(versionCode));
  },

  /**
   * Clears dismissed update state.
   */
  clearDismissedUpdate() {
    removeStorageItem(STORAGE_KEY_DISMISSED);
  },

  /**
   * Initiates in-app APK download on Android TV / BlueStacks, or browser fallback.
   */
  startDownloadAndInstall(apkUrl: string): boolean {
    if (typeof window !== 'undefined' && window.AndroidUpdater?.downloadAndInstallApk) {
      try {
        window.AndroidUpdater.downloadAndInstallApk(apkUrl);
        return true;
      } catch (err) {
        console.warn('[UpdateService] Failed to call native AndroidUpdater:', err);
      }
    }

    // Web browser fallback
    if (typeof window !== 'undefined') {
      window.open(apkUrl, '_blank');
    }
    return false;
  },

  /**
   * Subscribe to native download progress callbacks.
   */
  subscribeProgress(callback: (percent: number, status: string) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    window.onUpdateDownloadProgress = (percent: number, status: string) => {
      callback(percent, status);
    };

    return () => {
      if (window.onUpdateDownloadProgress) {
        delete window.onUpdateDownloadProgress;
      }
    };
  }
};
