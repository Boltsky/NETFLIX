import React, { useMemo } from 'react';
import type { SubtitleCue } from '../../utils/subtitleParser';

export type { SubtitleCue };

/**
 * Subtitle styling preferences.
 * Conforms to PROJECT.md settingsService interface contract.
 */
export interface SubtitleStyles {
  fontSize: 'small' | 'medium' | 'large' | 'extralarge'; // 18px, 24px, 32px, 40px
  textColor: string; // '#FFFFFF', '#FFEB3B', '#00E5FF', '#76FF03'
  backgroundOpacity: 0 | 50 | 75 | 100; // 0%, 50%, 75%, 100%
  edgeStyle: 'none' | 'dropshadow' | 'outline';
}

/**
 * Default styling matching Netflix TV standard 10-foot UI captions.
 */
export const DEFAULT_SUBTITLE_STYLES: SubtitleStyles = {
  fontSize: 'medium',       // 24px
  textColor: '#FFFFFF',     // Crisp White
  backgroundOpacity: 75,    // rgba(0, 0, 0, 0.75)
  edgeStyle: 'dropshadow'   // 2px 2px 4px rgba(0,0,0,0.9)
};

export const FONT_SIZE_MAP: Record<SubtitleStyles['fontSize'], string> = {
  small: '18px',
  medium: '24px',
  large: '32px',
  extralarge: '40px'
};

export const EDGE_STYLE_MAP: Record<SubtitleStyles['edgeStyle'], string> = {
  none: 'none',
  dropshadow: '2px 2px 4px rgba(0,0,0,0.9)',
  outline: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

/**
 * Resolves CSS styling rules from preferences and optional props overrides.
 * Directly satisfies E2E test R3.5 and Cross-Feature test 3.1.
 */
export function resolveSubtitleCss(styles?: Partial<SubtitleStyles>): {
  fontSize: string;
  color: string;
  backgroundColor: string;
  textShadow: string;
} {
  let base: SubtitleStyles = { ...DEFAULT_SUBTITLE_STYLES };

  // Read stored preferences from localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('cinewave_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.subtitles && typeof parsed.subtitles === 'object') {
          base = { ...base, ...parsed.subtitles };
        }
      }
    } catch {
      // Fall back safely to defaults
    }
  }

  const merged: SubtitleStyles = {
    ...base,
    ...(styles || {})
  };

  const fontSize = FONT_SIZE_MAP[merged.fontSize] || '24px';
  const color = merged.textColor || '#FFFFFF';
  const opacity = typeof merged.backgroundOpacity === 'number'
    ? Math.max(0, Math.min(100, merged.backgroundOpacity))
    : 75;
  const backgroundColor = `rgba(0, 0, 0, ${opacity / 100})`;
  const textShadow = EDGE_STYLE_MAP[merged.edgeStyle] || 'none';

  return {
    fontSize,
    color,
    backgroundColor,
    textShadow
  };
}

export interface SubtitleOverlayProps {
  cues?: SubtitleCue[];
  currentTime: number;
  activeSubtitle: number; // -1 = Disabled, >= 0 = Track Index
  styles?: Partial<SubtitleStyles>;
  className?: string;
}

/**
 * SubtitleOverlay Component for CineWave Android TV
 *
 * Requirements:
 * 1. Positioned at z-25 above <video> (Engine 1) and <iframe> (Engine 2) inside TV safe margin.
 * 2. pointer-events-none to prevent interception of TV remote D-pad focus.
 * 3. 0ms instantaneous clearing when switched or disabled (activeSubtitle = -1).
 * 4. Accurate cue display synchronized with playback currentTime.
 * 5. Dynamic styling support (font size, text color, background opacity, text outline/shadow).
 */
export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  cues,
  currentTime,
  activeSubtitle,
  styles,
  className = ''
}) => {
  // 1. Instantaneous 0ms clear: if disabled (-1) or no cues loaded, return null immediately
  if (activeSubtitle === -1 || !cues || cues.length === 0) {
    return null;
  }

  // 2. Filter active cues matching playback timestamp
  const activeCues = useMemo(() => {
    if (!Number.isFinite(currentTime) || currentTime < 0) {
      return [];
    }
    return cues.filter((cue) => currentTime >= cue.start && currentTime <= cue.end);
  }, [cues, currentTime]);

  if (activeCues.length === 0) {
    return null;
  }

  // 3. Compute dynamic CSS styling
  const computedCss = resolveSubtitleCss(styles);

  // 4. Combine text from all concurrent active cues (preserves multi-speaker dialogues)
  const cueText = activeCues.map((c) => c.text).join('\n').trim();

  if (!cueText) {
    return null;
  }

  return (
    <div
      className={`absolute inset-x-0 bottom-12 md:bottom-16 z-[25] pointer-events-none flex flex-col items-center justify-end px-8 md:px-16 ${className}`}
      style={{ zIndex: 25 }}
      aria-live="polite"
      aria-atomic="true"
      data-testid="subtitle-overlay"
    >
      <div
        className="inline-block max-w-[85vw] text-center px-4 py-1.5 rounded-[4px] leading-snug tracking-normal transition-opacity duration-75 whitespace-pre-line font-medium select-none"
        style={{
          fontSize: computedCss.fontSize,
          color: computedCss.color,
          backgroundColor: computedCss.backgroundColor,
          textShadow: computedCss.textShadow,
          fontFamily: "'Netflix Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        data-testid="subtitle-cue-text"
      >
        {cueText}
      </div>
    </div>
  );
};
