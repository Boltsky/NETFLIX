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
  Server
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
  const [focusedControl, setFocusedControlState] = useState<'back' | 'scrubber' | 'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'>('play');
  const focusedControlRef = useRef<'back' | 'scrubber' | 'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'>('play');
  const setFocusedControl = useCallback((ctrl: 'back' | 'scrubber' | 'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles') => {
    focusedControlRef.current = ctrl;
    setFocusedControlState(ctrl);
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
          ? `https://framextv.cc/embed/${item.id}/${s}/${e}?autoplay=1`
          : `https://framextv.cc/embed/${item.id}?autoplay=1`
      },
      {
        name: 'Server 2 (AutoEmbed)',
        url: isEpisodic
          ? `https://player.autoembed.cc/embed/tv/${item.id}/${s}/${e}`
          : `https://player.autoembed.cc/embed/movie/${item.id}`
      },
      {
        name: 'Server 3 (MultiEmbed)',
        url: isEpisodic
          ? `https://vidlink.pro/tv/${item.id}/${s}/${e}`
          : `https://vidlink.pro/movie/${item.id}`
      },
      {
        name: 'Server 4 (2Embed)',
        url: isEpisodic
          ? `https://www.2embed.cc/embedtv/${item.id}&s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${item.id}`
      },
      {
        name: 'Server 5 (VidSrc)',
        url: isEpisodic
          ? `https://vidsrc.pm/embed/tv/${item.id}/${s}/${e}`
          : `https://vidsrc.pm/embed/movie/${item.id}`
      }
    ];
  }, [resolution, item, season, episode]);

  const bottomControls = useMemo<Array<'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'>>(() => {
    const list: Array<'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'> = ['play', 'rewind', 'forward'];
    if (isEpisodic && effectiveSeason && effectiveEpisode && onNextEpisode) {
      list.push('next-ep');
    }
    if (useIframeFallback && servers.length > 1) {
      list.push('server');
    }
    list.push('subtitles');
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
    setError(null);

    // Disarm current watchdog and reset confirmed playback flag
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
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
    if (scrubCommitTimerRef.current) clearTimeout(scrubCommitTimerRef.current);
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    if (playerToastTimerRef.current) clearTimeout(playerToastTimerRef.current);
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
  }, [saveCurrentProgress, onExit, currentTime, duration]);

  // Ensure media resources are fully released on unmount
  useEffect(() => {
    return () => {
      if (scrubCommitTimerRef.current) clearTimeout(scrubCommitTimerRef.current);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      if (playerToastTimerRef.current) clearTimeout(playerToastTimerRef.current);
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

  // Automated Fallback Watchdog Timer (10s timeout)
  useEffect(() => {
    if (!useIframeFallback || !currentEmbedUrl) {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      return;
    }

    hasPlaybackStartedRef.current = false;

    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    const WATCHDOG_TIMEOUT_MS = 10000; // 10 seconds

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
    }, WATCHDOG_TIMEOUT_MS);

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

      const isTimeUpdate =
        data.event === 'frameXTV:timeupdate' ||
        data.event === 'timeupdate' ||
        data.type === 'timeupdate';

      const isPlayingEvent =
        data.event === 'playing' ||
        data.event === 'play' ||
        data.type === 'playing' ||
        data.type === 'play';

      if (isTimeUpdate) {
        const cur = Number(data.currentTime || 0);
        const dur = Number(data.duration || 0);
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

  // OSD Inactivity Auto-Hide
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    showControlsRef.current = true;
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showAudioSubtitleModalRef.current && !isScrubbingRef.current) {
        setShowControls(false);
        showControlsRef.current = false;
      }
    }, 6000);
  }, []);

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
          } else if (curCtrl === 'subtitles') {
            setShowAudioSubtitleModal(true);
            setModalCol(1);
            setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
          }
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
    handleSwitchServer
  ]);

  // Play / Pause Toggle
  const togglePlayPause = () => {
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
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden">
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
      {error && (
        <div className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center space-y-4 p-8 text-center max-w-md">
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
            // Note: Do NOT mark hasPlaybackStartedRef.current = true or disarm watchdog on onLoad!
            // Error pages ("We Couldn't Find This Content") or captcha pages also trigger onLoad.
            // Confirmed playback telemetry arrives via postMessage ('timeupdate', 'playing', etc.).
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

      {/* Netflix TV OSD Controls Overlay */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-10 ${
          showControls ? 'opacity-100 bg-gradient-to-t from-black/90 via-transparent to-black/80' : 'opacity-0'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExit}
              className={`p-2.5 rounded-full transition-all ${
                focusedControl === 'back'
                  ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                  : 'hover:bg-white/10 text-white'
              }`}
              title="Exit (Back)"
            >
              <ArrowLeft className={`w-6 h-6 ${focusedControl === 'back' ? 'text-black' : 'text-white'}`} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-white drop-shadow tracking-tight">{item.title}</h2>
              {isEpisodic && effectiveSeason && effectiveEpisode && (
                <p className="text-xs font-bold text-zinc-300">
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

        {/* Center Play / Pause Indicator */}
        {!isPlaying && (
          <div className="self-center p-6 rounded-full bg-black/60 border border-white/20 backdrop-blur-md">
            <Pause className="w-14 h-14 text-white fill-white" />
          </div>
        )}

        {/* Bottom Timeline & Netflix TV Controls */}
        <div className="space-y-4 pointer-events-auto max-w-5xl mx-auto w-full">
          {/* Netflix Scrubber Line */}
          <div
            onClick={() => {
              setFocusedControl('scrubber');
              togglePlayPause();
            }}
            className={`cursor-pointer transition-all duration-150 py-2 ${
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
            <div className="flex items-center space-x-6">
              {/* Play / Pause */}
              <button
                onClick={() => {
                  setFocusedControl('play');
                  togglePlayPause();
                }}
                className={`p-2.5 rounded-full transition-all ${
                  focusedControl === 'play'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Play/Pause (Enter)"
              >
                {isPlaying ? (
                  <Pause className={`w-7 h-7 ${focusedControl === 'play' ? 'fill-black text-black' : 'fill-white text-white'}`} />
                ) : (
                  <Play className={`w-7 h-7 ${focusedControl === 'play' ? 'fill-black text-black' : 'fill-white text-white'}`} />
                )}
              </button>

              {/* Rewind */}
              <button
                onClick={() => {
                  setFocusedControl('rewind');
                  handleScrubStep('rewind');
                }}
                className={`p-2 rounded-full transition-all ${
                  focusedControl === 'rewind'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Rewind (Left)"
              >
                <RotateCcw className={`w-6 h-6 ${focusedControl === 'rewind' ? 'text-black' : 'text-white'}`} />
              </button>

              {/* Fast Forward */}
              <button
                onClick={() => {
                  setFocusedControl('forward');
                  handleScrubStep('forward');
                }}
                className={`p-2 rounded-full transition-all ${
                  focusedControl === 'forward'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Fast Forward (Right)"
              >
                <RotateCw className={`w-6 h-6 ${focusedControl === 'forward' ? 'text-black' : 'text-white'}`} />
              </button>

              {/* Next Episode (if series) */}
              {isEpisodic && effectiveSeason && effectiveEpisode && onNextEpisode && (
                <button
                  onClick={() => {
                    setFocusedControl('next-ep');
                    onNextEpisode();
                  }}
                  className={`p-2 rounded-full transition-all ${
                    focusedControl === 'next-ep'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl font-bold'
                      : 'text-white hover:text-zinc-200'
                  }`}
                  title="Next Episode"
                >
                  <SkipForward className={`w-6 h-6 ${focusedControl === 'next-ep' ? 'text-black' : 'text-white'}`} />
                </button>
              )}

              {/* Server Switch (if fallback) */}
              {useIframeFallback && servers.length > 1 && (
                <button
                  onClick={() => {
                    setFocusedControl('server');
                    handleSwitchServer((selectedServerIndex + 1) % servers.length, true);
                  }}
                  className={`p-2 rounded-full transition-all flex items-center space-x-1.5 ${
                    focusedControl === 'server'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                      : 'text-white hover:text-zinc-200'
                  }`}
                  title="Switch Server (Enter)"
                >
                  <Server className={`w-5 h-5 ${focusedControl === 'server' ? 'text-black' : 'text-white'}`} />
                  <span className="text-[10px] font-bold uppercase">{servers[selectedServerIndex]?.name.split(' ')[1] || 'Server'}</span>
                </button>
              )}
            </div>

            {/* Subtitles & Audio Dialog Launcher */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setFocusedControl('subtitles');
                  setShowAudioSubtitleModal(true);
                  setModalCol(1);
                  setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
                }}
                className={`p-2 rounded-full transition-all flex items-center space-x-2 ${
                  focusedControl === 'subtitles'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Audio, Subtitles & Servers"
              >
                <Subtitles className={`w-6 h-6 ${focusedControl === 'subtitles' ? 'text-black' : 'text-white'}`} />
                <span className="text-xs font-semibold">
                  {activeSubtitle === -1 ? 'Off' : resolution?.subtitles?.[activeSubtitle]?.label || 'On'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio, Subtitles & Servers Modal Dialog */}
      {showAudioSubtitleModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-fadeIn">
          <div className="bg-[#181818] border border-zinc-700 rounded-lg max-w-2xl w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAudioSubtitleModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Audio, Subtitles & Servers</h3>

            <div className="grid grid-cols-3 gap-6 text-sm">
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
    </div>
  );
};
