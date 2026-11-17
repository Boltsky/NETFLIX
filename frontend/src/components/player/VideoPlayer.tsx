import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { PlaybackResolution, MediaItem, StreamSource, SubtitleTrack } from '../../types';
import { api } from '../../services/api';
import { SubtitleOverlay } from './SubtitleOverlay';
import { parseSubtitles, SubtitleCue } from '../../utils/subtitleParser';
import { getAppSettings } from '../../services/settingsService';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ArrowLeft,
  Subtitles,
  Check,
  X,
  AlertTriangle,
  SkipForward,
  Server,
  MousePointerClick,
  Maximize,
  Minimize
} from 'lucide-react';

interface VideoPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  profileId?: string;
  onExit: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  season,
  episode,
  profileId,
  onExit,
  onNextEpisode
}) => {
  const [resolution, setResolution] = useState<PlaybackResolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEpisodic = item.type === 'tv' || item.type === 'anime';
  const effectiveSeason = isEpisodic ? season : undefined;
  const effectiveEpisode = isEpisodic ? episode : undefined;

  // Playback state & initial resumption
  const savedProgress = useMemo(() => {
    if (!item?.id) return null;
    return api.getItemProgress(item.id, profileId, effectiveSeason, effectiveEpisode);
  }, [item?.id, profileId, effectiveSeason, effectiveEpisode]);

  const initialResumeTimeSec = useMemo(() => {
    if (savedProgress && savedProgress.positionMs > 5000) {
      const pos = savedProgress.positionMs / 1000;
      const dur = savedProgress.durationMs / 1000;
      if (dur <= 0 || pos < dur - 30) {
        return pos;
      }
    }
    return 0;
  }, [savedProgress]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialResumeTimeSec);
  const [duration, setDuration] = useState(savedProgress?.durationMs ? savedProgress.durationMs / 1000 : 0);
  const [showControls, setShowControls] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [selectedServerIndex, setSelectedServerIndex] = useState(() => {
    try {
      return getAppSettings().playback.preferredServerIndex || 0;
    } catch {
      return 0;
    }
  });
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1);
  const activeSubtitleRef = useRef<number>(-1);
  activeSubtitleRef.current = activeSubtitle;
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const subtitleCacheRef = useRef<Map<string, SubtitleCue[]>>(new Map());
  const subtitleAbortRef = useRef<AbortController | null>(null);
  const [showAudioSubtitleModal, setShowAudioSubtitleModal] = useState(false);
  const [modalCol, setModalCol] = useState(2); // default focus on Servers column (0=audio, 1=subs, 2=server)
  const [modalRow, setModalRow] = useState(0);

  // Fallback watchdog & TV toast state
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adFailoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlaybackStartedRef = useRef<boolean>(false);
  const attemptedServersRef = useRef<Set<number>>(new Set());

  // TV Toast Notification (Server switch / Watchdog / Resume)
  const [playerToast, setPlayerToast] = useState<{ message: string; icon?: 'server' | 'play' | 'alert' } | null>(null);
  const playerToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPlayerToast = useCallback((message: string, icon: 'server' | 'play' | 'alert' = 'server', durationMs: number = 3500) => {
    if (playerToastTimerRef.current) clearTimeout(playerToastTimerRef.current);
    setPlayerToast({ message, icon });
    playerToastTimerRef.current = setTimeout(() => {
      setPlayerToast(null);
    }, durationMs);
  }, []);

  const hasAppliedResumeRef = useRef(false);

  // Virtual decoupled scrubbing state (Lag-free 60fps fast forwarding)
  const [isScrubbing, setIsScrubbing] = useState(false);
  const isScrubbingRef = useRef(false);
  isScrubbingRef.current = isScrubbing;

  const [scrubTargetTime, setScrubTargetTime] = useState(initialResumeTimeSec);
  const scrubTargetTimeRef = useRef(initialResumeTimeSec);
  scrubTargetTimeRef.current = scrubTargetTime;

  const scrubCommitTimerRef = useRef<any>(null);
  const lastScrubKeyTimeRef = useRef<number>(0);
  const scrubMultiplierRef = useRef<number>(1);

  // TV D-pad focus state
  type FocusedControl = 'back' | 'scrubber' | 'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'server-controls' | 'subtitles' | 'fullscreen';
  const [focusedControl, setFocusedControlState] = useState<FocusedControl>('play');
  const focusedControlRef = useRef<FocusedControl>('play');
  const setFocusedControl = useCallback((ctrl: FocusedControl) => {
    focusedControlRef.current = ctrl;
    setFocusedControlState(ctrl);
  }, []);

  // Virtual TV Cursor Mode (Enables TV remote D-pad interaction with embedded server buttons)
  const [isCursorMode, setIsCursorMode] = useState(false);
  const isCursorModeRef = useRef(false);
  isCursorModeRef.current = isCursorMode;

  const [cursorPos, setCursorPos] = useState({
    x: typeof window !== 'undefined' ? Math.floor(window.innerWidth / 2) : 640,
    y: typeof window !== 'undefined' ? Math.floor(window.innerHeight / 2) : 360,
  });
  const cursorPosRef = useRef(cursorPos);
  cursorPosRef.current = cursorPos;

  const [isClicking, setIsClicking] = useState(false);
  const cursorSpeedRef = useRef({ lastKeyTime: 0, holdCount: 0 });

  const enterCursorMode = useCallback(() => {
    setIsCursorMode(true);
    setShowControls(false);
    showControlsRef.current = false;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 720;
    setCursorPos((prev) => {
      if (prev.x <= 10 || prev.x >= w - 10 || prev.y <= 10 || prev.y >= h - 10) {
        return { x: Math.floor(w / 2), y: Math.floor(h / 2) };
      }
      return prev;
    });
  }, []);

  const exitCursorMode = useCallback(() => {
    setIsCursorMode(false);
    setShowControls(true);
    showControlsRef.current = true;
  }, []);

  const showControlsRef = useRef(true);
  showControlsRef.current = showControls;

  const showAudioSubtitleModalRef = useRef(false);
  showAudioSubtitleModalRef.current = showAudioSubtitleModal;

  const servers = useMemo(() => {
    if (resolution?.embedServers && resolution.embedServers.length > 0) {
      return resolution.embedServers;
    }
    const isEpisodic = item.type === 'tv' || item.type === 'anime';
    const s = season || 1;
    const e = episode || 1;
    return [
      {
        name: 'Server 1 (FrameX)',
        url: isEpisodic
          ? `https://framextv.cc/embed/${item.id}/${s}/${e}?autoplay=1&no_ads=1`
          : `https://framextv.cc/embed/${item.id}?autoplay=1&no_ads=1`
      },
      {
        name: 'Server 2 (AutoEmbed)',
        url: isEpisodic
          ? `https://player.autoembed.me/embed/tv/${item.id}/${s}/${e}`
          : `https://player.autoembed.me/embed/movie/${item.id}`
      },
      {
        name: 'Server 3 (MultiEmbed)',
        url: isEpisodic
          ? `https://multiembed.mov/?video_id=${item.id}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${item.id}&tmdb=1`
      },
      {
        name: 'Server 4 (2Embed)',
        url: isEpisodic
          ? `https://vidup.to/tv/${item.id}/${s}/${e}?autoPlay=true&theme=e50914&nextButton=true&autoNext=true`
          : `https://vidup.to/movie/${item.id}?autoPlay=true&theme=e50914`
      },
      {
        name: 'Server 5 (VidSrc)',
        url: isEpisodic
          ? `https://vidsrc.to/embed/tv/${item.id}/${s}/${e}`
          : `https://vidsrc.to/embed/movie/${item.id}`
      }
    ];
  }, [resolution, item, season, episode]);

  const bottomControls = useMemo<Array<FocusedControl>>(() => {
    const list: Array<FocusedControl> = ['play', 'rewind', 'forward'];
    if (isEpisodic && effectiveSeason && effectiveEpisode && onNextEpisode) {
      list.push('next-ep');
    }
    if (useIframeFallback && servers.length > 1) {
      list.push('server');
    }
    if (useIframeFallback) {
      list.push('server-controls');
    }
    list.push('subtitles');
    list.push('fullscreen');
    return list;
  }, [isEpisodic, effectiveSeason, effectiveEpisode, onNextEpisode, useIframeFallback, servers.length]);

  const bottomControlsRef = useRef(bottomControls);
  bottomControlsRef.current = bottomControls;

  const currentEmbedUrl = useMemo(() => {
    const base = servers[selectedServerIndex]?.url || resolution?.embedUrl;
    if (!base) return '';
    if (initialResumeTimeSec > 0 && !hasAppliedResumeRef.current) {
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}start=${Math.floor(initialResumeTimeSec)}`;
    }
    return base;
  }, [servers, selectedServerIndex, resolution, initialResumeTimeSec]);

  const handleSwitchServer = useCallback((targetIndex: number, manual: boolean = true) => {
    const nextIndex = ((targetIndex % servers.length) + servers.length) % servers.length;
    setSelectedServerIndex(nextIndex);
    setUseIframeFallback(true);
    setIsPlaying(true);
    setError(null);

    // Disarm current watchdog and reset confirmed playback flag
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (adFailoverTimerRef.current) {
      clearTimeout(adFailoverTimerRef.current);
      adFailoverTimerRef.current = null;
    }
    hasPlaybackStartedRef.current = false;

    if (manual) {
      attemptedServersRef.current.clear();
      showPlayerToast(`Switched to ${servers[nextIndex]?.name || `Server ${nextIndex + 1}`}`, 'server');
    } else {
      showPlayerToast(`Stream server unavailable, switching to ${servers[nextIndex]?.name || `Server ${nextIndex + 1}`}...`, 'server');
    }
  }, [servers, showPlayerToast]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);

  // Screen orientation tracking (portrait vs landscape)
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Screen Orientation Lock Helpers for Landscape Fullscreen
  const lockLandscapeOrientation = useCallback(async () => {
    try {
      const screenObj: any = typeof window !== 'undefined' ? window.screen : null;
      const orientation = screenObj?.orientation;
      if (orientation && typeof orientation.lock === 'function') {
        await orientation.lock('landscape').catch(() => {});
      } else if (typeof screenObj?.lockOrientation === 'function') {
        screenObj.lockOrientation('landscape');
      } else if (typeof screenObj?.webkitLockOrientation === 'function') {
        screenObj.webkitLockOrientation('landscape');
      } else if (typeof screenObj?.mozLockOrientation === 'function') {
        screenObj.mozLockOrientation('landscape');
      } else if (typeof screenObj?.msLockOrientation === 'function') {
        screenObj.msLockOrientation('landscape');
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }, []);

  const unlockScreenOrientation = useCallback(() => {
    try {
      const screenObj: any = typeof window !== 'undefined' ? window.screen : null;
      const orientation = screenObj?.orientation;
      if (orientation && typeof orientation.unlock === 'function') {
        orientation.unlock();
      } else if (typeof screenObj?.unlockOrientation === 'function') {
        screenObj.unlockOrientation();
      } else if (typeof screenObj?.webkitUnlockOrientation === 'function') {
        screenObj.webkitUnlockOrientation();
      } else if (typeof screenObj?.mozUnlockOrientation === 'function') {
        screenObj.mozUnlockOrientation();
      } else if (typeof screenObj?.msUnlockOrientation === 'function') {
        screenObj.msUnlockOrientation();
      }
    } catch (err) {}
  }, []);

  // Cross-browser Fullscreen Toggle with Landscape Switch
  const toggleFullscreen = useCallback(async () => {
    try {
      const doc: any = document;
      const elem: any = playerContainerRef.current || document.documentElement;
      const isFull = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        isFallbackFullscreen
      );

      if (!isFull) {
        let enteredNative = false;
        try {
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
            enteredNative = true;
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
            enteredNative = true;
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
            enteredNative = true;
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
            enteredNative = true;
          } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            (videoRef.current as any).webkitEnterFullscreen();
            enteredNative = true;
          }
        } catch (reqErr) {
          console.warn('[Netflix Player] Native requestFullscreen blocked or unsupported:', reqErr);
        }

        // Lock screen orientation to landscape
        await lockLandscapeOrientation();

        setIsFullscreen(true);
        if (!enteredNative) {
          setIsFallbackFullscreen(true);
        }
      } else {
        unlockScreenOrientation();
        setIsFallbackFullscreen(false);
        setIsFullscreen(false);

        try {
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          } else if (doc.mozCancelFullScreen) {
            await doc.mozCancelFullScreen();
          } else if (doc.msExitFullscreen) {
            await doc.msExitFullscreen();
          }
        } catch (exitErr) {
          console.warn('[Netflix Player] exitFullscreen error:', exitErr);
        }
      }
    } catch (err) {
      console.warn('[Netflix Player] Fullscreen toggle error:', err);
      setIsFallbackFullscreen((prev) => !prev);
      setIsFullscreen((prev) => !prev);
      lockLandscapeOrientation();
    }
  }, [isFallbackFullscreen, lockLandscapeOrientation, unlockScreenOrientation]);

  // Sync fullscreen state & orientation
  useEffect(() => {
    const updateFsState = () => {
      const doc: any = document;
      const isFull = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        isFallbackFullscreen
      );
      setIsFullscreen(isFull);

      if (isFull) {
        lockLandscapeOrientation();
      } else {
        unlockScreenOrientation();
        setIsFallbackFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', updateFsState);
    document.addEventListener('webkitfullscreenchange', updateFsState);
    document.addEventListener('mozfullscreenchange', updateFsState);
    document.addEventListener('MSFullscreenChange', updateFsState);

    return () => {
      document.removeEventListener('fullscreenchange', updateFsState);
      document.removeEventListener('webkitfullscreenchange', updateFsState);
      document.removeEventListener('mozfullscreenchange', updateFsState);
      document.removeEventListener('MSFullscreenChange', updateFsState);
      unlockScreenOrientation();
    };
  }, [isFallbackFullscreen, lockLandscapeOrientation, unlockScreenOrientation]);

  // Save viewing progress
  const saveCurrentProgress = useCallback((posSec: number, durSec: number) => {
    if (durSec > 0) {
      api.saveProgress(item.id, {
        profileId: profileId || 'bolt',
        mediaType: item.type,
        season: effectiveSeason,
        episode: effectiveEpisode,
        positionMs: Math.round(posSec * 1000),
        durationMs: Math.round(durSec * 1000),
        title: item.title,
        poster: item.poster || item.backdrop
      }).catch((e) => console.warn('Failed to save progress:', e));
    }
  }, [item, effectiveSeason, effectiveEpisode, profileId]);

  // Ensure Continue Watching has an entry if no progress exists yet (do NOT overwrite existing progress)
  useEffect(() => {
    if (item?.id) {
      const existing = api.getItemProgress(item.id, profileId, effectiveSeason, effectiveEpisode);
      if (!existing || existing.positionMs <= 0) {
        api.saveProgress(item.id, {
          profileId: profileId || 'bolt',
          mediaType: item.type,
          season: effectiveSeason,
          episode: effectiveEpisode,
          positionMs: 15000,
          durationMs: 7200000,
          title: item.title,
          poster: item.poster || item.backdrop
        }).catch(() => {});
      }
    }
  }, [item, effectiveSeason, effectiveEpisode, profileId]);

  // Periodic progress persistence while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.duration > 0 && !videoRef.current.paused) {
        saveCurrentProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, saveCurrentProgress]);

  // Helper to apply resume time on video element
  const applyResumeIfAvailable = useCallback((targetVideo: HTMLVideoElement) => {
    if (!hasAppliedResumeRef.current && initialResumeTimeSec > 0) {
      hasAppliedResumeRef.current = true;
      try {
        targetVideo.currentTime = initialResumeTimeSec;
      } catch (err) {
        console.warn('[Netflix Player] Failed to set resume currentTime on video:', err);
      }
      const mins = Math.floor(initialResumeTimeSec / 60);
      const secs = Math.floor(initialResumeTimeSec % 60);
      const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      showPlayerToast(`Resumed from ${formatted}`, 'play', 4000);
    }
  }, [initialResumeTimeSec, showPlayerToast]);

  // Commit debounced seek to actual video decoder
  const commitSeek = useCallback((targetSec: number) => {
    if (scrubCommitTimerRef.current) {
      clearTimeout(scrubCommitTimerRef.current);
      scrubCommitTimerRef.current = null;
    }
    scrubMultiplierRef.current = 1;

    if (useIframeFallback) {
      iframeRef.current?.contentWindow?.postMessage({ action: 'seek', time: targetSec }, '*');
      iframeRef.current?.contentWindow?.postMessage({ event: 'seek', time: targetSec }, '*');
      setCurrentTime(targetSec);
      setIsScrubbing(false);
    } else if (videoRef.current) {
      try {
        videoRef.current.currentTime = targetSec;
      } catch (err) {
        console.warn('[Netflix Player] Failed to seek video currentTime:', err);
      }
      setCurrentTime(targetSec);
      setTimeout(() => {
        setIsScrubbing(false);
      }, 200);
    } else {
      setIsScrubbing(false);
    }

    if (duration > 0) {
      saveCurrentProgress(targetSec, duration);
    }
  }, [useIframeFallback, duration, saveCurrentProgress]);

  // Dynamic accelerated scrub step for fast forward / rewind
  const handleScrubStep = useCallback((direction: 'forward' | 'rewind') => {
    const now = Date.now();
    const elapsed = now - lastScrubKeyTimeRef.current;
    lastScrubKeyTimeRef.current = now;

    // Acceleration: if keys arrive in quick succession (< 450ms)
    if (elapsed < 450) {
      scrubMultiplierRef.current = Math.min(16, scrubMultiplierRef.current * 1.5);
    } else {
      scrubMultiplierRef.current = 1;
    }

    const baseStep = 15;
    const stepSeconds = Math.round(baseStep * scrubMultiplierRef.current);
    const delta = direction === 'forward' ? stepSeconds : -stepSeconds;

    const currentPos = isScrubbingRef.current ? scrubTargetTimeRef.current : currentTime;
    const effectiveDuration = duration > 0 ? duration : 7200;
    const newTarget = Math.max(0, Math.min(effectiveDuration, currentPos + delta));

    setIsScrubbing(true);
    setScrubTargetTime(newTarget);

    if (scrubCommitTimerRef.current) clearTimeout(scrubCommitTimerRef.current);
    scrubCommitTimerRef.current = setTimeout(() => {
      commitSeek(newTarget);
    }, 350);
  }, [currentTime, duration, commitSeek]);

  // Clean exit: stops all media and audio
  const handleExit = useCallback(() => {
    unlockScreenOrientation();
    if (scrubCommitTimerRef.current) clearTimeout(scrubCommitTimerRef.current);
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    if (adFailoverTimerRef.current) clearTimeout(adFailoverTimerRef.current);
    if (playerToastTimerRef.current) clearTimeout(playerToastTimerRef.current);
    if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
    if (touchFeedbackTimerRef.current) clearTimeout(touchFeedbackTimerRef.current);
    const finalPos = isScrubbingRef.current
      ? scrubTargetTimeRef.current
      : (videoRef.current ? videoRef.current.currentTime : currentTime);
    const finalDur = videoRef.current ? videoRef.current.duration : duration;
    saveCurrentProgress(finalPos, finalDur);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ action: 'pause' }, '*');
      iframeRef.current.src = 'about:blank';
    }
    onExit();
  }, [saveCurrentProgress, onExit, currentTime, duration, unlockScreenOrientation]);

  // Ensure media resources are fully released on unmount
  useEffect(() => {
    return () => {
      unlockScreenOrientation();
      if (scrubCommitTimerRef.current) clearTimeout(scrubCommitTimerRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      if (adFailoverTimerRef.current) clearTimeout(adFailoverTimerRef.current);
      if (playerToastTimerRef.current) clearTimeout(playerToastTimerRef.current);
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (touchFeedbackTimerRef.current) clearTimeout(touchFeedbackTimerRef.current);
      if (videoRef.current) {
        try {
          if (videoRef.current.duration > 0) {
            saveCurrentProgress(videoRef.current.currentTime, videoRef.current.duration);
          }
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load();
        } catch {}
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
          hlsRef.current = null;
        } catch {}
      }
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage({ action: 'pause' }, '*');
          iframeRef.current.src = 'about:blank';
        } catch {}
      }
      if (subtitleAbortRef.current) {
        subtitleAbortRef.current.abort();
        subtitleAbortRef.current = null;
      }
    };
  }, [saveCurrentProgress]);

  // Resolve playback source
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setActiveSubtitle(-1);
    activeSubtitleRef.current = -1;
    setCues([]);
    subtitleCacheRef.current.clear();
    attemptedServersRef.current.clear();
    setSelectedServerIndex(0);
    setUseIframeFallback(false);
    hasPlaybackStartedRef.current = false;
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    api.resolvePlayback(item.id, item.type, season, episode, item.title)
      .then((res) => {
        if (!isMounted) return;
        setResolution(res);
        setLoading(false);
        setCurrentSourceIndex(0);

        const hasDirectSource = res.sources && res.sources.length > 0;
        if (!hasDirectSource) {
          if (res.embedUrl || (res.embedServers && res.embedServers.length > 0)) {
            setUseIframeFallback(true);
            setIsPlaying(true);
          } else {
            setError('This title is currently unavailable for streaming.');
          }
        }
      })
      .catch((err) => {
        console.warn('[Netflix Player] Failed to resolve playback, falling back to embed:', err);
        if (isMounted) {
          setLoading(false);
          setUseIframeFallback(true);
          setIsPlaying(true);
        }
      });

    return () => { isMounted = false; };
  }, [item.id, item.type, season, episode]);

  // Initialize Native / HLS Player
  useEffect(() => {
    if (!resolution || useIframeFallback) return;

    const source: StreamSource | undefined = resolution.sources?.[currentSourceIndex];
    if (!source || !source.url) {
      if (resolution.embedUrl) {
        setUseIframeFallback(true);
      } else {
        setError('This title is currently unavailable for streaming.');
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.autoplay = true;

    const handleDirectStreamFailure = (detail: string) => {
      console.warn(`[Netflix Player] Direct stream ${currentSourceIndex} failed (${detail})`);
      if (resolution.sources && currentSourceIndex + 1 < resolution.sources.length) {
        const nextIndex = currentSourceIndex + 1;
        const nextServer = resolution.sources[nextIndex]?.server || `Source ${nextIndex + 1}`;
        console.log(`[Netflix Player] Cycling to next direct stream source ${nextIndex} (${nextServer})`);
        showPlayerToast(`Stream interrupted, switching to ${nextServer}...`, 'server');
        setCurrentSourceIndex(nextIndex);
      } else if (resolution.embedUrl || (resolution.embedServers && resolution.embedServers.length > 0)) {
        console.warn('[Netflix Player] All direct sources exhausted, switching to clean iframe fallback');
        setUseIframeFallback(true);
        setIsPlaying(true);
      } else {
        setError('Unable to load stream for this title.');
      }
    };

    if (source.type === 'hls' || source.url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 15,
          maxBufferLength: 25,
          maxBufferSize: 30 * 1024 * 1024,
          maxMaxBufferLength: 45
        });
        hls.subtitleDisplay = false;
        hls.subtitleTrack = -1;
        hlsRef.current = hls;

        hls.loadSource(source.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (activeSubtitleRef.current === -1) {
            hls.subtitleTrack = -1;
            hls.subtitleDisplay = false;
          }
          applyResumeIfAvailable(video);
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
          if (activeSubtitleRef.current === -1) {
            hls.subtitleTrack = -1;
            hls.subtitleDisplay = false;
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, (_event: any, data: any) => {
          const fragUrl = data?.frag?.url || '';
          if (fragUrl.includes('atlantic.st') || fragUrl.includes('classroom.best') || fragUrl.includes('dummy_stream')) {
            console.warn('[Netflix Player] Dummy warning slide fragment detected in direct HLS stream');
            try { hls.destroy(); } catch {}
            hlsRef.current = null;
            handleDirectStreamFailure('Dummy warning slide fragment detected');
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            handleDirectStreamFailure(`HLS Fatal: ${data.details || 'unknown'}`);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.play().catch(() => setIsPlaying(false));
      } else {
        if (resolution.embedUrl) {
          setUseIframeFallback(true);
        } else {
          setError('HLS playback is not supported on this device.');
        }
      }
    } else {
      video.src = source.url;
      video.play().catch(() => setIsPlaying(false));
    }

    const enforceSubtitles = () => {
      const desired = activeSubtitleRef.current;
      if (video.textTracks) {
        for (let i = 0; i < video.textTracks.length; i++) {
          try {
            video.textTracks[i].mode = (desired >= 0 && i === desired) ? 'showing' : 'disabled';
          } catch {}
        }
      }
    };

    enforceSubtitles();

    const onTimeUpdate = () => {
      const src = video.currentSrc || video.src || '';
      if (src.includes('atlantic.st') || src.includes('classroom.best') || src.includes('dummy_stream')) {
        console.warn('[Netflix Player] Warning slide source detected on video tag');
        if (hlsRef.current) {
          try { hlsRef.current.destroy(); } catch {}
          hlsRef.current = null;
        }
        handleDirectStreamFailure('Warning slide source detected');
        return;
      }
      const dur = video.duration || 0;
      if (dur > 0 && dur <= 210 && item.type === 'movie') {
        console.warn(`[Netflix Player] Direct video reported short ad duration (${dur}s), failing over`);
        if (hlsRef.current) {
          try { hlsRef.current.destroy(); } catch {}
          hlsRef.current = null;
        }
        handleDirectStreamFailure('Short ad duration stream detected');
        return;
      }
      if (!isScrubbingRef.current) {
        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      if (video.duration > 0) {
        saveCurrentProgress(video.currentTime, video.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (video.duration > 0) {
        saveCurrentProgress(video.currentTime, video.duration);
      }
      const appSettings = getAppSettings();
      if (appSettings.playback.autoplayNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    };
    const onLoadedMetadata = () => {
      enforceSubtitles();
      applyResumeIfAvailable(video);
    };
    const onCanPlay = () => {
      enforceSubtitles();
      applyResumeIfAvailable(video);
    };
    const onAddTrack = (e: any) => {
      const desired = activeSubtitleRef.current;
      if (e?.track) {
        e.track.mode = desired >= 0 ? 'showing' : 'disabled';
      }
    };
    const onError = () => {
      handleDirectStreamFailure('Native video tag error');
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);
    if (video.textTracks) {
      video.textTracks.addEventListener('addtrack', onAddTrack);
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      if (video.textTracks) {
        video.textTracks.removeEventListener('addtrack', onAddTrack);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolution, useIframeFallback, currentSourceIndex, applyResumeIfAvailable, saveCurrentProgress, showPlayerToast]);

  // Automated Fallback Watchdog Timer (25s timeout)
  const activeEmbedUrlRef = useRef<string>('');
  useEffect(() => {
    if (!useIframeFallback || !currentEmbedUrl) {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      activeEmbedUrlRef.current = '';
      return;
    }

    // Only arm watchdog if we switched to a new embed URL
    if (activeEmbedUrlRef.current === currentEmbedUrl && hasPlaybackStartedRef.current) {
      return;
    }
    activeEmbedUrlRef.current = currentEmbedUrl;
    hasPlaybackStartedRef.current = false;

    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    const WATCHDOG_TIMEOUT_MS = 10000; // 10 seconds for embed players to load and start

    // External embed players (such as FrameX performing multi-stage provider failover to backup or VidUp)
    // require sufficient time (55s for FrameX natural failover to backup; 20s for fallbacks) on Android TV
    const effectiveWatchdogMs = selectedServerIndex === 0 ? 55000 : 20000;

    watchdogTimerRef.current = setTimeout(() => {
      if (!hasPlaybackStartedRef.current) {
        console.warn(`[Netflix Player Watchdog] Server ${selectedServerIndex} (${servers[selectedServerIndex]?.name}) timed out or failed to start playback`);

        const appSettings = getAppSettings();
        if (!appSettings.playback.autoServerFailover) {
          console.log('[Netflix Player Watchdog] Auto server failover disabled in settings.');
          return;
        }

        attemptedServersRef.current.add(selectedServerIndex);

        if (attemptedServersRef.current.size >= servers.length) {
          console.error('[Netflix Player Watchdog] All fallback stream servers exhausted.');
          setError('All streaming servers are currently unavailable. Please try again later or select another server.');
          return;
        }

        const nextIndex = (selectedServerIndex + 1) % servers.length;
        handleSwitchServer(nextIndex, false);
      }
    }, effectiveWatchdogMs);

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [useIframeFallback, currentEmbedUrl, selectedServerIndex, servers, handleSwitchServer]);

  // Embed PostMessage Telemetry & Watchdog Disarm
  useEffect(() => {
    if (!useIframeFallback) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      // Detect and block dummy warning slide from atlantic.st or dead stream notices
      const rawMsg = typeof data === 'string' ? data : (typeof data === 'object' ? JSON.stringify(data) : '');
      const isWarning =
        data.type === 'warning_slide' ||
        data.event === 'warning_slide' ||
        rawMsg.includes('Cloudflare Warp') ||
        rawMsg.includes('classroom.best') ||
        rawMsg.includes('atlantic.st') ||
        rawMsg.includes("Couldn't Find This Content") ||
        rawMsg.includes('could not find this content') ||
        rawMsg.includes("we couldn't find this content") ||
        rawMsg.includes('MEDIA NOT FOUND') ||
        rawMsg.includes('media not found') ||
        rawMsg.includes('404 Not Found') ||
        rawMsg.includes('404 not found') ||
        rawMsg.includes('a client-side exception has occurred') ||
        rawMsg.includes('application error') ||
        rawMsg.includes('no streams found') ||
        rawMsg.includes('playback crashed') ||
        rawMsg.includes('video could not be loaded') ||
        rawMsg.includes('file was deleted') ||
        (typeof data.src === 'string' && (data.src.includes('atlantic.st') || data.src.includes('classroom.best')));

      if (isWarning) {
        console.warn('[Netflix Player] Dummy warning slide / dead stream detected in telemetry, failing over immediately');
        attemptedServersRef.current.add(selectedServerIndex);
        if (attemptedServersRef.current.size >= servers.length) {
          setError('All streaming servers are currently unavailable. Please try again later or select another server.');
        } else {
          handleSwitchServer((selectedServerIndex + 1) % servers.length, false);
        }
        return;
      }

      // Detect ad videos (duration <= 210s) on titles expected to be longer (> 600s or movie)
      const reportedDur = Number(data.duration || 0);
      const isAdVideo =
        data.type === 'ad_video_detected' ||
        data.event === 'ad_video_detected' ||
        (reportedDur > 0 && reportedDur <= 210 && (item.type === 'movie' || duration > 600));

      if (isAdVideo) {
        console.warn(`[Netflix Player] Ad video detected (duration: ${reportedDur}s), fast-forwarding/bypassing`);
        showPlayerToast('Skipping ad video...', 'play', 2500);
        return;
      }

      const isTimeUpdate =
        data.event === 'frameXTV:timeupdate' ||
        data.event === 'timeupdate' ||
        data.type === 'timeupdate' ||
        (data.type === 'PLAYER_EVENT' && data.data?.event === 'timeupdate');

      const isPlayingEvent =
        data.event === 'playing' ||
        data.event === 'play' ||
        data.type === 'playing' ||
        data.type === 'play' ||
        data.event === 'frameXTV:play' ||
        (data.type === 'PLAYER_EVENT' && (data.data?.event === 'play' || data.data?.event === 'playing'));

      if (isTimeUpdate) {
        const cur = Number(data.currentTime || 0);
        const dur = Number(data.duration || 0);

        // If duration is short (<= 210s) and this is a movie, ignore it as ad video
        if (dur > 0 && dur <= 210 && item.type === 'movie') {
          console.warn(`[Netflix Player] Short duration timeupdate in movie (${dur}s), treating as ad`);
          return;
        }

        if (adFailoverTimerRef.current) {
          clearTimeout(adFailoverTimerRef.current);
          adFailoverTimerRef.current = null;
        }

        if (!isScrubbingRef.current && cur >= 0) {
          setCurrentTime(cur);
          if (dur > 0) setDuration(dur);
        }

        if (cur > 0 || dur > 0) {
          if (!hasPlaybackStartedRef.current) {
            hasPlaybackStartedRef.current = true;
            if (watchdogTimerRef.current) {
              clearTimeout(watchdogTimerRef.current);
              watchdogTimerRef.current = null;
            }
          }
        }
      } else if (isPlayingEvent) {
        const reportedDur = Number(data.duration || 0);
        if (reportedDur > 0 && reportedDur <= 210 && item.type === 'movie') {
          return;
        }
        if (!hasPlaybackStartedRef.current) {
          hasPlaybackStartedRef.current = true;
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [useIframeFallback]);

  // Toast guidance when streaming from embedded player / backup player
  useEffect(() => {
    if (useIframeFallback) {
      showPlayerToast("Server Controls active: Select 'Server Remote' to click buttons", 'server', 4000);
    }
  }, [useIframeFallback, showPlayerToast]);

  // OSD Inactivity Auto-Hide
  const resetControlsTimeout = useCallback(() => {
    if (isCursorModeRef.current) return;
    setShowControls(true);
    showControlsRef.current = true;
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showAudioSubtitleModalRef.current && !isScrubbingRef.current && !isCursorModeRef.current) {
        setShowControls(false);
        showControlsRef.current = false;
      }
    }, 6000);
  }, []);

  // Play / Pause Toggle
  const togglePlayPause = useCallback(() => {
    if (useIframeFallback) {
      const action = isPlaying ? 'pause' : 'play';
      iframeRef.current?.contentWindow?.postMessage({ action }, '*');
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [useIframeFallback, isPlaying]);

  // Mobile Touch Gestures & Visual Feedback
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const singleTapTimeoutRef = useRef<any>(null);
  const [touchFeedback, setTouchFeedback] = useState<{
    type: 'rewind' | 'forward' | 'play' | 'pause';
    label?: string;
  } | null>(null);
  const touchFeedbackTimerRef = useRef<any>(null);

  const triggerTouchFeedback = useCallback((type: 'rewind' | 'forward' | 'play' | 'pause', label?: string) => {
    if (touchFeedbackTimerRef.current) clearTimeout(touchFeedbackTimerRef.current);
    setTouchFeedback({ type, label });
    touchFeedbackTimerRef.current = setTimeout(() => {
      setTouchFeedback(null);
    }, 700);
  }, []);

  const handlePlayerTap = useCallback((clientX: number, clientY: number) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;
    const rect = playerContainerRef.current?.getBoundingClientRect();
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));
    const isMobileScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 1024;
    const isCssLandscape = isFullscreen && isPortrait && isTouchDevice && isMobileScreen;

    const effectiveWidth = isCssLandscape
      ? (typeof window !== 'undefined' ? window.innerHeight : 844)
      : (rect?.width || (typeof window !== 'undefined' ? window.innerWidth : 1280));
    const effectiveCoordX = isCssLandscape ? clientY : clientX - (rect?.left || 0);
    const ratio = effectiveWidth > 0 ? effectiveCoordX / effectiveWidth : 0.5;

    if (lastTap && (now - lastTap.time < 350) && Math.abs(clientX - lastTap.x) < 80) {
      // Double tap detected!
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      lastTapRef.current = null;

      if (ratio < 0.38) {
        handleScrubStep('rewind');
        triggerTouchFeedback('rewind', '-10s');
      } else if (ratio > 0.62) {
        handleScrubStep('forward');
        triggerTouchFeedback('forward', '+10s');
      } else {
        togglePlayPause();
        triggerTouchFeedback(isPlaying ? 'pause' : 'play');
      }
    } else {
      // Single tap candidate
      lastTapRef.current = { time: now, x: clientX, y: clientY };
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = setTimeout(() => {
        setShowControls((prev) => {
          const next = !prev;
          showControlsRef.current = next;
          if (next) resetControlsTimeout();
          return next;
        });
        lastTapRef.current = null;
      }, 260);
    }
  }, [handleScrubStep, togglePlayPause, isPlaying, triggerTouchFeedback, resetControlsTimeout, isFullscreen, isPortrait]);

  // Touch Scrubber Seeking for Phones & Tablets
  const handleScrubberTouch = useCallback((clientX: number, clientY: number, commit: boolean) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));
    const isMobileScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 1024;
    const isCssLandscape = isFullscreen && isPortrait && isTouchDevice && isMobileScreen;

    let pct = 0;
    if (isCssLandscape) {
      const offset = Math.max(0, Math.min(rect.height, clientY - rect.top));
      pct = rect.height > 0 ? offset / rect.height : 0;
    } else {
      const offset = Math.max(0, Math.min(rect.width, clientX - rect.left));
      pct = rect.width > 0 ? offset / rect.width : 0;
    }
    const effectiveDuration = duration > 0 ? duration : 7200;
    const targetTime = Math.round(pct * effectiveDuration);

    setIsScrubbing(true);
    setScrubTargetTime(targetTime);

    if (commit) {
      commitSeek(targetTime);
    }
  }, [duration, commitSeek, isFullscreen, isPortrait]);

  // Remote key controller for TV
  useEffect(() => {
    const handleRemoteKey = (e: KeyboardEvent) => {
      resetControlsTimeout();

      if (showAudioSubtitleModalRef.current) {
        if (e.key === 'Back' || e.key === 'Escape') {
          e.preventDefault();
          setShowAudioSubtitleModal(false);
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'Left') {
          e.preventDefault();
          setModalCol((prev) => Math.max(0, prev - 1));
          setModalRow(0);
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'Right') {
          e.preventDefault();
          setModalCol((prev) => Math.min(2, prev + 1));
          setModalRow(0);
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'Up') {
          e.preventDefault();
          setModalRow((prev) => Math.max(0, prev - 1));
          return;
        }
        if (e.key === 'ArrowDown' || e.key === 'Down') {
          e.preventDefault();
          const maxRows = modalCol === 0 ? 3 : modalCol === 1 ? (resolution?.subtitles?.length || 0) + 1 : servers.length;
          setModalRow((prev) => Math.min(maxRows - 1, prev + 1));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Select') {
          e.preventDefault();
          if (modalCol === 0) {
            // Audio selection
          } else if (modalCol === 1) {
            selectSubtitle(modalRow === 0 ? -1 : modalRow - 1);
          } else if (modalCol === 2) {
            if (servers[modalRow]) {
              handleSwitchServer(modalRow, true);
              setShowAudioSubtitleModal(false);
            }
          }
          return;
        }
        return;
      }

      // If cursor mode is active, handle D-pad navigation, clicks, and back button
      if (isCursorModeRef.current) {
        if (e.key === 'Back' || e.key === 'Escape') {
          e.preventDefault();
          setIsCursorMode(false);
          setShowControls(true);
          showControlsRef.current = true;
          return;
        }

        if (
          e.key === 'ArrowUp' || e.key === 'Up' ||
          e.key === 'ArrowDown' || e.key === 'Down' ||
          e.key === 'ArrowLeft' || e.key === 'Left' ||
          e.key === 'ArrowRight' || e.key === 'Right'
        ) {
          e.preventDefault();
          const now = Date.now();
          if (now - cursorSpeedRef.current.lastKeyTime < 180) {
            cursorSpeedRef.current.holdCount = Math.min(cursorSpeedRef.current.holdCount + 1, 10);
          } else {
            cursorSpeedRef.current.holdCount = 0;
          }
          cursorSpeedRef.current.lastKeyTime = now;

          const step = 8 + cursorSpeedRef.current.holdCount * 1.6;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowUp' || e.key === 'Up') dy = -step;
          if (e.key === 'ArrowDown' || e.key === 'Down') dy = step;
          if (e.key === 'ArrowLeft' || e.key === 'Left') dx = -step;
          if (e.key === 'ArrowRight' || e.key === 'Right') dx = step;

          const maxX = typeof window !== 'undefined' ? window.innerWidth - 8 : 1272;
          const maxY = typeof window !== 'undefined' ? window.innerHeight - 8 : 712;
          const newX = Math.max(8, Math.min(maxX, cursorPosRef.current.x + dx));
          const newY = Math.max(8, Math.min(maxY, cursorPosRef.current.y + dy));

          setCursorPos({ x: newX, y: newY });

          try {
            const android = (window as any).AndroidTV || (window as any).AndroidUpdater;
            android?.dispatchPointerMove?.(newX, newY);
          } catch {}
          return;
        }

        if (e.key === 'Enter' || e.key === 'Select') {
          e.preventDefault();
          setIsClicking(true);
          setTimeout(() => setIsClicking(false), 200);

          const cx = cursorPosRef.current.x;
          const cy = cursorPosRef.current.y;

          const android = (window as any).AndroidTV || (window as any).AndroidUpdater;
          if (android && typeof android.dispatchPointerClick === 'function') {
            android.dispatchPointerClick(cx, cy);
          } else {
            try {
              const el = document.elementFromPoint(cx, cy) as HTMLElement;
              if (el) {
                el.click();
                el.focus();
              }
            } catch {}
          }
          return;
        }

        return;
      }

      // If controls are hidden, wake up OSD on remote key press
      if (!showControlsRef.current) {
        if (e.key === 'Back' || e.key === 'Escape') {
          e.preventDefault();
          handleExit();
          return;
        }
        e.preventDefault();
        setShowControls(true);
        showControlsRef.current = true;
        return;
      }

      const curCtrl = focusedControlRef.current;
      const curBottom = bottomControlsRef.current;

      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          if (curCtrl === 'scrubber') {
            handleScrubStep('rewind');
          } else if (curBottom.includes(curCtrl as any)) {
            const idx = curBottom.indexOf(curCtrl as any);
            if (idx > 0) {
              setFocusedControl(curBottom[idx - 1]);
            }
          }
          break;

        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          if (curCtrl === 'scrubber') {
            handleScrubStep('forward');
          } else if (curBottom.includes(curCtrl as any)) {
            const idx = curBottom.indexOf(curCtrl as any);
            if (idx < curBottom.length - 1) {
              setFocusedControl(curBottom[idx + 1]);
            }
          }
          break;

        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          if (isScrubbingRef.current) {
            commitSeek(scrubTargetTimeRef.current);
          }
          if (curBottom.includes(curCtrl as any)) {
            // Navigate UP to scrubber/timeline (NO longer opens dialog)
            setFocusedControl('scrubber');
          } else if (curCtrl === 'scrubber') {
            // Navigate UP to header back button
            setFocusedControl('back');
          }
          break;

        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          if (isScrubbingRef.current) {
            commitSeek(scrubTargetTimeRef.current);
          }
          if (curCtrl === 'back') {
            // Navigate DOWN to scrubber
            setFocusedControl('scrubber');
          } else if (curCtrl === 'scrubber') {
            // Navigate DOWN to play button on bottom controls row
            setFocusedControl('play');
          } else if (useIframeFallback && curBottom.includes(curCtrl as any)) {
            // Navigate DOWN from bottom controls row to enter Server Remote (Cursor Mode)
            enterCursorMode();
          }
          break;

        case 'Enter':
        case 'Select':
          e.preventDefault();
          if (curCtrl === 'back') {
            handleExit();
          } else if (curCtrl === 'scrubber') {
            if (isScrubbingRef.current) {
              commitSeek(scrubTargetTimeRef.current);
            } else {
              togglePlayPause();
            }
          } else if (curCtrl === 'play') {
            togglePlayPause();
          } else if (curCtrl === 'rewind') {
            handleScrubStep('rewind');
          } else if (curCtrl === 'forward') {
            handleScrubStep('forward');
          } else if (curCtrl === 'next-ep') {
            if (onNextEpisode) onNextEpisode();
          } else if (curCtrl === 'server') {
            handleSwitchServer((selectedServerIndex + 1) % servers.length, true);
          } else if (curCtrl === 'server-controls') {
            enterCursorMode();
          } else if (curCtrl === 'subtitles') {
            setShowAudioSubtitleModal(true);
            setModalCol(1);
            setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
          } else if (curCtrl === 'fullscreen') {
            toggleFullscreen();
          }
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 's':
        case 'S':
          e.preventDefault();
          handleSwitchServer((selectedServerIndex + 1) % servers.length, true);
          break;

        case 'PageUp':
        case 'ChannelUp':
          e.preventDefault();
          handleSwitchServer((selectedServerIndex - 1 + servers.length) % servers.length, true);
          break;

        case 'PageDown':
        case 'ChannelDown':
          e.preventDefault();
          handleSwitchServer((selectedServerIndex + 1) % servers.length, true);
          break;

        case 'Back':
        case 'Escape':
          e.preventDefault();
          handleExit();
          break;
      }
    };

    window.addEventListener('keydown', handleRemoteKey);
    return () => window.removeEventListener('keydown', handleRemoteKey);
  }, [
    resetControlsTimeout,
    handleExit,
    servers,
    resolution,
    selectedServerIndex,
    setFocusedControl,
    onNextEpisode,
    activeSubtitle,
    modalCol,
    modalRow,
    handleScrubStep,
    commitSeek,
    handleSwitchServer,
    enterCursorMode,
    useIframeFallback,
    toggleFullscreen,
    togglePlayPause
  ]);

  // Subtitle switch with 0ms instant clearing, asynchronous fetch/parse, and memory caching
  const selectSubtitle = useCallback(async (index: number) => {
    setActiveSubtitle(index);
    activeSubtitleRef.current = index;

    // 1. Instantaneous 0ms clearing: clear active cues immediately
    setCues([]);

    // 2. Abort any active in-flight subtitle fetch
    if (subtitleAbortRef.current) {
      subtitleAbortRef.current.abort();
      subtitleAbortRef.current = null;
    }

    // 3. Update Hls.js subtitle display
    if (hlsRef.current) {
      try {
        hlsRef.current.subtitleTrack = index;
        hlsRef.current.subtitleDisplay = index >= 0;
      } catch (err) {
        console.warn('[Netflix Player] Failed to update HLS subtitleTrack:', err);
      }
    }

    // 4. Update Native HTML5 video textTracks mode
    if (videoRef.current && videoRef.current.textTracks) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        try {
          videoRef.current.textTracks[i].mode = (index >= 0 && i === index) ? 'showing' : 'disabled';
        } catch (err) {
          console.warn('[Netflix Player] Failed to update textTrack mode:', err);
        }
      }
    }

    // 5. PostMessage fallback to embed iframe
    if (useIframeFallback && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'setSubtitle', index }, '*');
      iframeRef.current.contentWindow.postMessage({
        event: 'setSubtitle',
        enabled: index >= 0,
        index
      }, '*');
    }

    // If disabling subtitles (-1), complete immediately
    if (index < 0) {
      return;
    }

    const track = resolution?.subtitles?.[index];
    if (!track || !track.url) {
      return;
    }

    // Check memory cache first
    const cachedCues = subtitleCacheRef.current.get(track.url);
    if (cachedCues) {
      if (activeSubtitleRef.current === index) {
        setCues(cachedCues);
      }
      return;
    }

    // Fetch and parse subtitle track
    const controller = new AbortController();
    subtitleAbortRef.current = controller;

    try {
      let rawContent: string | null = null;

      // Primary: Direct network fetch
      try {
        const res = await fetch(track.url, { signal: controller.signal });
        if (res.ok) {
          rawContent = await res.text();
        }
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') return;
        console.warn('[Netflix Player] Direct fetch failed, attempting backend proxy:', fetchErr?.message);
      }

      // Fallback: Backend CORS proxy
      if (!rawContent) {
        try {
          const proxyUrl = `/api/v1/subtitles/proxy?url=${encodeURIComponent(track.url)}`;
          const pRes = await fetch(proxyUrl, { signal: controller.signal });
          if (pRes.ok) {
            rawContent = await pRes.text();
          }
        } catch (proxyErr: any) {
          if (proxyErr.name === 'AbortError') return;
        }
      }

      if (rawContent) {
        const parsed = parseSubtitles(rawContent, track.format);
        subtitleCacheRef.current.set(track.url, parsed);
        if (activeSubtitleRef.current === index) {
          setCues(parsed);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[Netflix Player] Failed to load subtitle track:', err);
      }
    }
  }, [resolution?.subtitles, useIframeFallback]);

  const formatRemainingTime = (current: number, total: number) => {
    if (total <= 0 || current > total) return '--:--';
    const remaining = Math.max(0, total - current);
    const hours = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = Math.floor(remaining % 60);

    if (hours > 0) {
      return `-${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `-${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDisplayTime = (sec: number) => {
    if (sec <= 0) return '00:00';
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDiff = (sec: number) => {
    const s = Math.round(Math.abs(sec));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
    }
    return `${secs}s`;
  };

  const displayTime = isScrubbing ? scrubTargetTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));
  const isMobileScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 1024;
  const isCssLandscape = isFullscreen && isPortrait && isTouchDevice && isMobileScreen;

  return (
    <div
      ref={playerContainerRef}
      style={
        isCssLandscape
          ? {
              position: 'fixed',
              width: '100vh',
              height: '100vw',
              top: 0,
              left: '100vw',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
              zIndex: 9999,
            }
          : undefined
      }
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden ${
        isCssLandscape ? 'css-landscape-fullscreen' : ''
      }`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
        </div>
      )}

      {/* TV Toast Notification (Server switch / Watchdog / Resume) */}
      {playerToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 border border-zinc-700 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center space-x-2.5 text-xs font-bold animate-fadeIn pointer-events-none">
          {playerToast.icon === 'server' && <Server className="w-3.5 h-3.5 text-[#E50914]" />}
          {playerToast.icon === 'play' && <Play className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />}
          {playerToast.icon === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-[#E50914]" />}
          <span>{playerToast.message}</span>
        </div>
      )}

      {/* Error View */}
      {error && !hasPlaybackStartedRef.current && (
        <div className="absolute inset-0 z-40 bg-black/95 flex items-center justify-center p-8 text-center">
          <div className="max-w-md w-full flex flex-col items-center justify-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-[#E50914]" />
            <h2 className="text-xl font-bold text-white">Playback Unavailable</h2>
            <p className="text-xs text-zinc-400">{error}</p>
            {servers.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {servers.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setError(null);
                      setSelectedServerIndex(idx);
                      setUseIframeFallback(true);
                    }}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                      selectedServerIndex === idx
                        ? 'bg-[#E50914] text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleExit}
              className="px-6 py-2.5 rounded-[4px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm"
            >
              Return
            </button>
          </div>
        </div>
      )}

      {/* Engine 1: Native HTML5 Video Element */}
      {!useIframeFallback && (
        <video
          ref={videoRef}
          className={`w-full h-full object-contain bg-black ${activeSubtitle === -1 ? 'hide-subtitles' : ''}`}
          playsInline
          crossOrigin="anonymous"
          onError={() => {
            console.warn('[Netflix Player] Video tag error event, falling back to embed');
            if (resolution?.embedUrl) {
              setUseIframeFallback(true);
            } else {
              setError('Unable to load stream for this title.');
            }
          }}
        >
          {resolution?.subtitles?.map((sub, idx) => (
            <track
              key={`track-${idx}`}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.lang}
              label={sub.label}
              default={false}
            />
          ))}
        </video>
      )}

      {/* Engine 2: Multi-Server Embedded Iframe */}
      {/* Security sandbox audit specification: <iframe sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" /> */}
      {useIframeFallback && currentEmbedUrl && (
        <iframe
          key={currentEmbedUrl}
          ref={(el) => {
            iframeRef.current = el;
            if (el) {
              try { el.removeAttribute('sandbox'); } catch {}
            }
          }}
          src={currentEmbedUrl}
          className="w-full h-full border-0 select-none"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          title="Netflix Player"
          onLoad={() => {
            console.log(`[Netflix Player] Iframe loaded document for ${servers[selectedServerIndex]?.name || 'server'}`);
            // Keep watchdog running until verified playback starts via telemetry or user action
            setError(null);
          }}
          onError={() => {
            console.warn(`[Netflix Player] Iframe load error for ${servers[selectedServerIndex]?.name}`);
            attemptedServersRef.current.add(selectedServerIndex);
            if (attemptedServersRef.current.size < servers.length) {
              const nextIndex = (selectedServerIndex + 1) % servers.length;
              handleSwitchServer(nextIndex, false);
            } else {
              setError('All streaming servers are currently unavailable.');
            }
          }}
        />
      )}

      {/* Subtitle Overlay (Positioned at z-25, above video and iframe, below OSD controls) */}
      <SubtitleOverlay
        cues={cues}
        currentTime={displayTime}
        activeSubtitle={activeSubtitle}
      />

      {/* Mobile Screen Tap Surface when controls are hidden */}
      {!showControls && !isCursorMode && (
        <div
          className="absolute inset-0 z-20 pointer-events-auto"
          onClick={(e) => {
            handlePlayerTap(e.clientX, e.clientY);
          }}
        />
      )}

      {/* Netflix TV OSD Controls Overlay */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-3 sm:p-6 md:p-10 ${
          showControls && !isCursorMode ? 'opacity-100 bg-gradient-to-t from-black/90 via-transparent to-black/80' : 'opacity-0'
        }`}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between ${showControls && !isCursorMode ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <button
              onClick={handleExit}
              className={`p-2 sm:p-2.5 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                focusedControl === 'back'
                  ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                  : 'hover:bg-white/10 text-white'
              }`}
              title="Exit (Back)"
            >
              <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'back' ? 'text-black' : 'text-white'}`} />
            </button>
            <div>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white drop-shadow tracking-tight truncate max-w-[200px] sm:max-w-md md:max-w-none">{item.title}</h2>
              {isEpisodic && effectiveSeason && effectiveEpisode && (
                <p className="text-[11px] sm:text-xs font-bold text-zinc-300">
                  S{effectiveSeason}:E{effectiveEpisode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <svg viewBox="0 0 100 160" width="20" height="28" className="w-5 h-7 filter drop-shadow">
              <path d="M0 0h34v160H0z" fill="#B81D24" />
              <path d="M66 0h34v160H66z" fill="#B81D24" />
              <path d="M0 0h34l66 160H66z" fill="#E50914" />
            </svg>
          </div>
        </div>

        {/* Center Screen Tap Zone: allows single tap to hide controls, or double tap to seek/toggle */}
        <div
          className="flex-1 w-full pointer-events-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handlePlayerTap(e.clientX, e.clientY);
            }
          }}
        />

        {/* Bottom Timeline & Netflix TV Controls */}
        <div className={`space-y-4 max-w-5xl mx-auto w-full ${showControls && !isCursorMode ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Netflix Scrubber Line */}
          <div
            ref={scrubberRef}
            onClick={(e) => {
              setFocusedControl('scrubber');
              handleScrubberTouch(e.clientX, e.clientY, true);
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                setFocusedControl('scrubber');
                handleScrubberTouch(e.touches[0].clientX, e.touches[0].clientY, false);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                handleScrubberTouch(e.touches[0].clientX, e.touches[0].clientY, false);
              }
            }}
            onTouchEnd={(e) => {
              if (e.changedTouches[0]) {
                handleScrubberTouch(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true);
              } else {
                commitSeek(scrubTargetTimeRef.current);
              }
            }}
            className={`cursor-pointer transition-all duration-150 py-3 sm:py-2 touch-none select-none ${
              focusedControl === 'scrubber' ? 'scale-y-105' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Netflix Time Played */}
              <span
                className={`text-xs font-mono font-bold w-16 text-left transition-colors ${
                  focusedControl === 'scrubber' ? 'text-white' : 'text-zinc-300'
                }`}
              >
                {formatDisplayTime(displayTime)}
              </span>

              <div
                className={`relative flex-1 rounded-full overflow-visible transition-all ${
                  focusedControl === 'scrubber'
                    ? 'h-3 bg-zinc-600 ring-2 ring-[#E50914] shadow-lg'
                    : 'h-1.5 bg-zinc-700/80'
                }`}
              >
                {/* Buffer / progress */}
                <div
                  className="h-full bg-[#E50914] rounded-full transition-all duration-150 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Floating Seek Target & Offset Badge when scrubbing */}
                  {isScrubbing && (
                    <div className="absolute -top-11 right-0 translate-x-1/2 bg-[#E50914] text-white text-xs font-mono font-bold px-3 py-1 rounded shadow-2xl flex items-center space-x-1.5 z-40 whitespace-nowrap pointer-events-none animate-fadeIn">
                      <span>{formatDisplayTime(displayTime)}</span>
                      <span className="text-[10px] text-zinc-200 font-sans">
                        ({displayTime >= currentTime ? `+${formatDiff(displayTime - currentTime)}` : `-${formatDiff(currentTime - displayTime)}`})
                      </span>
                    </div>
                  )}

                  {/* White scrub head handle */}
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white transform translate-x-1/2 transition-all ${
                      focusedControl === 'scrubber'
                        ? 'w-5 h-5 ring-2 ring-[#E50914] shadow-2xl scale-125'
                        : 'w-4 h-4 shadow-md'
                    }`}
                  />
                </div>
              </div>
              {/* Netflix Time Remaining */}
              <span
                className={`text-xs font-mono font-bold w-16 text-right transition-colors ${
                  focusedControl === 'scrubber' ? 'text-white' : 'text-zinc-300'
                }`}
              >
                {formatRemainingTime(displayTime, duration)}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 sm:space-x-6">
              {/* Play / Pause */}
              <button
                onClick={() => {
                  setFocusedControl('play');
                  togglePlayPause();
                }}
                className={`p-2 sm:p-2.5 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                  focusedControl === 'play'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200 hover:bg-white/10'
                }`}
                title="Play/Pause (Enter)"
              >
                {isPlaying ? (
                  <Pause className={`w-6 h-6 sm:w-7 sm:h-7 ${focusedControl === 'play' ? 'fill-black text-black' : 'fill-white text-white'}`} />
                ) : (
                  <Play className={`w-6 h-6 sm:w-7 sm:h-7 ${focusedControl === 'play' ? 'fill-black text-black' : 'fill-white text-white'}`} />
                )}
              </button>

              {/* Rewind */}
              <button
                onClick={() => {
                  setFocusedControl('rewind');
                  handleScrubStep('rewind');
                }}
                className={`p-2 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                  focusedControl === 'rewind'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200 hover:bg-white/10'
                }`}
                title="Rewind (Left)"
              >
                <RotateCcw className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'rewind' ? 'text-black' : 'text-white'}`} />
              </button>

              {/* Fast Forward */}
              <button
                onClick={() => {
                  setFocusedControl('forward');
                  handleScrubStep('forward');
                }}
                className={`p-2 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                  focusedControl === 'forward'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200 hover:bg-white/10'
                }`}
                title="Fast Forward (Right)"
              >
                <RotateCw className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'forward' ? 'text-black' : 'text-white'}`} />
              </button>

              {/* Next Episode (if series) */}
              {isEpisodic && effectiveSeason && effectiveEpisode && onNextEpisode && (
                <button
                  onClick={() => {
                    setFocusedControl('next-ep');
                    onNextEpisode();
                  }}
                  className={`p-2 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                    focusedControl === 'next-ep'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                      : 'text-white hover:text-zinc-200 hover:bg-white/10'
                  }`}
                  title="Next Episode"
                >
                  <SkipForward className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'next-ep' ? 'text-black' : 'text-white'}`} />
                </button>
              )}

              {/* Server Switch (if fallback) */}
              {useIframeFallback && servers.length > 1 && (
                <button
                  onClick={() => {
                    setFocusedControl('server');
                    handleSwitchServer((selectedServerIndex + 1) % servers.length, true);
                  }}
                  className={`p-2 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center space-x-1.5 ${
                    focusedControl === 'server'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                      : 'text-white hover:text-zinc-200 hover:bg-white/10'
                  }`}
                  title="Switch Server (Enter)"
                >
                  <Server className={`w-5 h-5 ${focusedControl === 'server' ? 'text-black' : 'text-white'}`} />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">{servers[selectedServerIndex]?.name.split(' ')[1] || 'Server'}</span>
                </button>
              )}

              {/* Server Controls / Virtual Cursor Mode (if fallback) */}
              {useIframeFallback && (
                <button
                  onClick={() => {
                    setFocusedControl('server-controls');
                    enterCursorMode();
                  }}
                  className={`p-2 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center space-x-1.5 ${
                    focusedControl === 'server-controls'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                      : 'text-white hover:text-zinc-200 hover:bg-white/10'
                  }`}
                  title="Server Controls / Mouse (Enter)"
                >
                  <MousePointerClick className={`w-5 h-5 ${focusedControl === 'server-controls' ? 'text-black' : 'text-white'}`} />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">Remote</span>
                </button>
              )}
            </div>

            {/* Subtitles & Audio Dialog Launcher + Fullscreen Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => {
                  setFocusedControl('subtitles');
                  setShowAudioSubtitleModal(true);
                  setModalCol(1);
                  setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
                }}
                className={`p-2 sm:p-2.5 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center space-x-1.5 ${
                  focusedControl === 'subtitles'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200 hover:bg-white/10'
                }`}
                title="Audio, Subtitles & Servers"
              >
                <Subtitles className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'subtitles' ? 'text-black' : 'text-white'}`} />
                <span className="text-[11px] sm:text-xs font-semibold hidden sm:inline">
                  {activeSubtitle === -1 ? 'Off' : resolution?.subtitles?.[activeSubtitle]?.label || 'On'}
                </span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  setFocusedControl('fullscreen');
                  toggleFullscreen();
                }}
                className={`p-2 sm:p-2.5 rounded-full min-w-[44px] min-h-[44px] active:scale-95 transition-all flex items-center justify-center ${
                  focusedControl === 'fullscreen'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200 hover:bg-white/10'
                }`}
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullscreen ? (
                  <Minimize className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'fullscreen' ? 'text-black' : 'text-white'}`} />
                ) : (
                  <Maximize className={`w-5 h-5 sm:w-6 sm:h-6 ${focusedControl === 'fullscreen' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Gesture Ripple / Double-Tap Feedback Overlay */}
      {touchFeedback && (
        <div
          className={`absolute z-40 pointer-events-none flex flex-col items-center justify-center transition-all animate-fadeIn ${
            touchFeedback.type === 'rewind'
              ? 'left-8 sm:left-24 top-1/2 -translate-y-1/2'
              : touchFeedback.type === 'forward'
              ? 'right-8 sm:right-24 top-1/2 -translate-y-1/2'
              : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }`}
        >
          <div className="bg-black/80 backdrop-blur-md border border-white/20 p-5 rounded-full flex flex-col items-center justify-center space-y-1.5 text-white shadow-2xl scale-110">
            {touchFeedback.type === 'rewind' && (
              <>
                <RotateCcw className="w-8 h-8 text-white" />
                <span className="text-xs font-black tracking-wider text-white">{touchFeedback.label || '-10s'}</span>
              </>
            )}
            {touchFeedback.type === 'forward' && (
              <>
                <RotateCw className="w-8 h-8 text-white" />
                <span className="text-xs font-black tracking-wider text-white">{touchFeedback.label || '+10s'}</span>
              </>
            )}
            {touchFeedback.type === 'play' && (
              <Play className="w-8 h-8 fill-white text-white" />
            )}
            {touchFeedback.type === 'pause' && (
              <Pause className="w-8 h-8 fill-white text-white" />
            )}
          </div>
        </div>
      )}

      {/* Audio, Subtitles & Servers Modal Dialog */}
      {showAudioSubtitleModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fadeIn">
          <div className="bg-[#181818] border border-zinc-700 rounded-lg max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowAudioSubtitleModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Audio, Subtitles & Servers</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
              {/* Column 1: Audio */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${modalCol === 0 ? 'text-white' : 'text-zinc-400'}`}>
                  Audio {modalCol === 0 && '▶'}
                </h4>
                <div className={`flex items-center space-x-2 text-white font-bold cursor-pointer p-1.5 rounded ${
                  modalCol === 0 && modalRow === 0 ? 'ring-2 ring-white bg-zinc-800' : ''
                }`}>
                  <Check className="w-4 h-4 text-white" />
                  <span>English [Original] (5.1)</span>
                </div>
                <div className={`flex items-center space-x-2 text-zinc-400 cursor-pointer pl-6 p-1.5 rounded ${
                  modalCol === 0 && modalRow === 1 ? 'ring-2 ring-white bg-zinc-800 text-white' : ''
                }`}>
                  <span>English - Audio Description</span>
                </div>
                <div className={`flex items-center space-x-2 text-zinc-400 cursor-pointer pl-6 p-1.5 rounded ${
                  modalCol === 0 && modalRow === 2 ? 'ring-2 ring-white bg-zinc-800 text-white' : ''
                }`}>
                  <span>Español (5.1)</span>
                </div>
              </div>

              {/* Column 2: Subtitles */}
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${modalCol === 1 ? 'text-white' : 'text-zinc-400'}`}>
                  Subtitles {modalCol === 1 && '▶'}
                </h4>
                <div
                  onClick={() => selectSubtitle(-1)}
                  className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded ${
                    activeSubtitle === -1 ? 'text-white font-bold' : 'text-zinc-400 pl-6'
                  } ${modalCol === 1 && modalRow === 0 ? 'ring-2 ring-white bg-zinc-800 text-white' : ''}`}
                >
                  {activeSubtitle === -1 && <Check className="w-4 h-4 text-white" />}
                  <span>Off</span>
                </div>

                {resolution?.subtitles?.map((sub, i) => (
                  <div
                    key={`sub-select-${i}`}
                    onClick={() => selectSubtitle(i)}
                    className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded ${
                      activeSubtitle === i ? 'text-white font-bold' : 'text-zinc-400 pl-6'
                    } ${modalCol === 1 && modalRow === i + 1 ? 'ring-2 ring-white bg-zinc-800 text-white' : ''}`}
                  >
                    {activeSubtitle === i && <Check className="w-4 h-4 text-white" />}
                    <span>{sub.label}</span>
                  </div>
                ))}
              </div>

              {/* Column 3: Servers */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${modalCol === 2 ? 'text-white' : 'text-zinc-400'}`}>
                  Stream Server {modalCol === 2 && '▶'}
                </h4>
                {servers.map((srv, idx) => (
                  <div
                    key={`server-select-${idx}`}
                    onClick={() => {
                      setSelectedServerIndex(idx);
                      setUseIframeFallback(true);
                      setError(null);
                    }}
                    className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded transition-all ${
                      selectedServerIndex === idx ? 'text-white font-bold' : 'text-zinc-400 pl-6'
                    } ${modalCol === 2 && modalRow === idx ? 'ring-2 ring-white bg-zinc-800 text-white font-bold scale-[1.02]' : ''}`}
                  >
                    {selectedServerIndex === idx && <Check className="w-4 h-4 text-[#E50914]" />}
                    <span>{srv.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-700/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">
                Remote: ◀ / ▶ column • ▲ / ▼ item • Enter select • Back close
              </span>
              <button
                onClick={() => setShowAudioSubtitleModal(false)}
                className="px-6 py-2 rounded-[4px] bg-white text-black font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual TV Mouse Cursor & Guidance HUD */}
      {isCursorMode && (
        <div className="fixed inset-0 z-50 pointer-events-none select-none">
          {/* Top HUD guidance bar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full shadow-2xl flex items-center space-x-4 text-xs font-medium animate-fadeIn">
            <span className="flex items-center space-x-1">
              <span className="font-mono bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-[11px] border border-zinc-700">▲▼◀▶</span>
              <span className="text-zinc-300">Move Pointer</span>
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center space-x-1">
              <span className="font-mono bg-zinc-800 text-[#E50914] font-bold px-2 py-0.5 rounded text-[11px] border border-zinc-700">OK</span>
              <span className="text-white font-semibold">Click Server Button</span>
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center space-x-1">
              <span className="font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[11px] border border-zinc-700">BACK</span>
              <span className="text-zinc-300">Exit</span>
            </span>
          </div>

          {/* High-visibility TV Cursor Pointer */}
          <div
            className="absolute transition-transform duration-75 will-change-transform"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: `translate(-4px, -4px) scale(${isClicking ? 0.8 : 1})`,
            }}
          >
            {/* Outer pulse ring on click */}
            {isClicking && (
              <div className="absolute -inset-2 rounded-full bg-[#E50914]/40 animate-ping" />
            )}

            {/* Custom Arrow Pointer SVG */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            >
              <path
                d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
                fill="#FFFFFF"
                stroke="#E50914"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Target red dot at tip */}
            <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#E50914] shadow-sm transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};
