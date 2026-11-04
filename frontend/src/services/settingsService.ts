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

export const DEFAULT_SETTINGS: AppSettings = {
  playback: {
    preferredServerIndex: 0,
    defaultQuality: 'auto',
    autoplayNextEpisode: true,
    autoServerFailover: true
  },
  subtitles: {
    fontSize: 'medium',
    textColor: '#FFFFFF',
    backgroundOpacity: 75,
    edgeStyle: 'dropshadow'
  },
  updates: {
    autoCheckOnLaunch: true,
    lastCheckTimestamp: 0
  }
};

export const SETTINGS_STORAGE_KEY = 'cinewave_settings';

const ALLOWED_FONT_SIZES = ['small', 'medium', 'large', 'extralarge'] as const;
const ALLOWED_OPACITIES = [0, 50, 75, 100] as const;
const ALLOWED_EDGE_STYLES = ['none', 'dropshadow', 'outline'] as const;
const ALLOWED_QUALITIES = ['auto', '1080p', '720p', '480p'] as const;

function sanitizeSettings(data: any): AppSettings {
  const result: AppSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  if (!data || typeof data !== 'object') {
    return result;
  }

  // Sanitize Playback
  if (data.playback && typeof data.playback === 'object') {
    if (typeof data.playback.preferredServerIndex === 'number' && Number.isFinite(data.playback.preferredServerIndex)) {
      result.playback.preferredServerIndex = Math.max(0, Math.min(4, Math.floor(data.playback.preferredServerIndex)));
    }
    if (ALLOWED_QUALITIES.includes(data.playback.defaultQuality)) {
      result.playback.defaultQuality = data.playback.defaultQuality;
    }
    if (typeof data.playback.autoplayNextEpisode === 'boolean') {
      result.playback.autoplayNextEpisode = data.playback.autoplayNextEpisode;
    }
    if (typeof data.playback.autoServerFailover === 'boolean') {
      result.playback.autoServerFailover = data.playback.autoServerFailover;
    }
  }

  // Sanitize Subtitles
  if (data.subtitles && typeof data.subtitles === 'object') {
    if (ALLOWED_FONT_SIZES.includes(data.subtitles.fontSize)) {
      result.subtitles.fontSize = data.subtitles.fontSize;
    } else {
      result.subtitles.fontSize = DEFAULT_SETTINGS.subtitles.fontSize;
    }

    if (typeof data.subtitles.textColor === 'string' && data.subtitles.textColor.trim()) {
      result.subtitles.textColor = data.subtitles.textColor.trim();
    }

    if (ALLOWED_OPACITIES.includes(data.subtitles.backgroundOpacity)) {
      result.subtitles.backgroundOpacity = data.subtitles.backgroundOpacity;
    } else if (typeof data.subtitles.backgroundOpacity === 'number') {
      // Find closest allowable opacity
      const target = data.subtitles.backgroundOpacity;
      let closest: 0 | 50 | 75 | 100 = 75;
      let minDiff = Infinity;
      for (const op of ALLOWED_OPACITIES) {
        const diff = Math.abs(op - target);
        if (diff < minDiff) {
          minDiff = diff;
          closest = op;
        }
      }
      result.subtitles.backgroundOpacity = closest;
    } else {
      result.subtitles.backgroundOpacity = DEFAULT_SETTINGS.subtitles.backgroundOpacity;
    }

    if (ALLOWED_EDGE_STYLES.includes(data.subtitles.edgeStyle)) {
      result.subtitles.edgeStyle = data.subtitles.edgeStyle;
    } else {
      result.subtitles.edgeStyle = DEFAULT_SETTINGS.subtitles.edgeStyle;
    }
  }

  // Sanitize Updates
  if (data.updates && typeof data.updates === 'object') {
    if (typeof data.updates.autoCheckOnLaunch === 'boolean') {
      result.updates.autoCheckOnLaunch = data.updates.autoCheckOnLaunch;
    }
    if (typeof data.updates.lastCheckTimestamp === 'number' && Number.isFinite(data.updates.lastCheckTimestamp)) {
      result.updates.lastCheckTimestamp = data.updates.lastCheckTimestamp;
    }
  }

  return result;
}

/**
 * Returns current AppSettings from localStorage or fallback defaults.
 * Resilient against missing storage or corrupted JSON.
 */
export function getAppSettings(): AppSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
    const parsed = JSON.parse(raw);
    return sanitizeSettings(parsed);
  } catch (err) {
    console.warn('[SettingsService] Failed to parse cinewave_settings from localStorage:', err);
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
}

/**
 * Partially updates AppSettings, validates and clamps fields, persists to localStorage,
 * and returns the updated AppSettings.
 */
export function updateAppSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();

  const merged: any = {
    playback: {
      ...current.playback,
      ...(patch.playback || {})
    },
    subtitles: {
      ...current.subtitles,
      ...(patch.subtitles || {})
    },
    updates: {
      ...current.updates,
      ...(patch.updates || {})
    }
  };

  const sanitized = sanitizeSettings(merged);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.warn('[SettingsService] Failed to persist cinewave_settings to localStorage:', err);
    }
  }

  return sanitized;
}

/**
 * Resets AppSettings to original defaults in memory and localStorage.
 */
export function resetAppSettings(): AppSettings {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaults));
    } catch (err) {
      console.warn('[SettingsService] Failed to reset cinewave_settings in localStorage:', err);
    }
  }
  return defaults;
}

export const settingsService = {
  getAppSettings,
  updateAppSettings,
  resetAppSettings
};

export default settingsService;
