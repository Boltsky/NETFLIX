import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { PlaybackResolution, MediaItem, StreamSource, SubtitleTrack } from '../../types';
import { api } from '../../services/api';
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

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1);
  const [showAudioSubtitleModal, setShowAudioSubtitleModal] = useState(false);
  const [modalCol, setModalCol] = useState(2); // default focus on Servers column (0=audio, 1=subs, 2=server)
  const [modalRow, setModalRow] = useState(0);

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
        name: 'Server 1 (VidSrc)',
        url: isEpisodic
          ? `https://vidsrc.to/embed/tv/${item.id}/${s}/${e}`
          : `https://vidsrc.to/embed/movie/${item.id}`
      },
      {
        name: 'Server 2 (MultiEmbed)',
        url: isEpisodic
          ? `https://multiembed.mov/?video_id=${item.id}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${item.id}&tmdb=1`
      },
      {
        name: 'Server 3 (2Embed)',
        url: isEpisodic
          ? `https://www.2embed.cc/embedtv/${item.id}&s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${item.id}`
      },
      {
        name: 'Server 4 (VidSrc.xyz)',
        url: isEpisodic
          ? `https://vidsrc.xyz/embed/tv/${item.id}/${s}/${e}`
          : `https://vidsrc.xyz/embed/movie/${item.id}`
      },
      {
        name: 'Server 5 (FrameX)',
        url: isEpisodic
          ? `https://framextv.cc/embed/${item.id}/${s}/${e}?autoplay=1`
          : `https://framextv.cc/embed/${item.id}?autoplay=1`
      }
    ];
  }, [resolution, item, season, episode]);

  const bottomControls = useMemo<Array<'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'>>(() => {
    const list: Array<'play' | 'rewind' | 'forward' | 'next-ep' | 'server' | 'subtitles'> = ['play', 'rewind', 'forward'];
    if (season && episode && onNextEpisode) {
      list.push('next-ep');
    }
    if (useIframeFallback && servers.length > 1) {
      list.push('server');
    }
    list.push('subtitles');
    return list;
  }, [season, episode, onNextEpisode, useIframeFallback, servers.length]);

  const bottomControlsRef = useRef(bottomControls);
  bottomControlsRef.current = bottomControls;

  const currentEmbedUrl = servers[selectedServerIndex]?.url || resolution?.embedUrl;

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
        season,
        episode,
        positionMs: Math.round(posSec * 1000),
        durationMs: Math.round(durSec * 1000),
        title: item.title,
        poster: item.poster || item.backdrop
      }).catch((e) => console.warn('Failed to save progress:', e));
    }
  }, [item, season, episode, profileId]);

  // Record initial watch progress entry so Continue Watching always has valid title & poster
  useEffect(() => {
    if (item?.id) {
      api.saveProgress(item.id, {
        profileId: profileId || 'bolt',
        mediaType: item.type,
        season,
        episode,
        positionMs: 15000,
        durationMs: 7200000,
        title: item.title,
        poster: item.poster || item.backdrop
      }).catch(() => {});
    }
  }, [item, season, episode, profileId]);

  // Clean exit: stops all media and audio
  const handleExit = useCallback(() => {
    if (videoRef.current) {
      const pos = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      saveCurrentProgress(pos, dur);
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
  }, [saveCurrentProgress, onExit]);

  // Ensure media resources are fully released on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
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
    };
  }, []);

  // Resolve playback source
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.resolvePlayback(item.id, item.type, season, episode, item.title)
      .then((res) => {
        if (!isMounted) return;
        setResolution(res);
        setLoading(false);

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

    const source: StreamSource | undefined = resolution.sources?.[0];
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
        hlsRef.current = hls;

        hls.loadSource(source.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn('[Netflix Player] HLS Fatal Error, falling back to embed:', data);
            if (resolution.embedUrl) {
              setUseIframeFallback(true);
            } else {
              setError('Unable to load stream for this title.');
            }
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

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      console.warn('[Netflix Player] Native video error, falling back to embed');
      if (resolution.embedUrl) {
        setUseIframeFallback(true);
      } else {
        setError('Unable to load stream for this title.');
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolution, useIframeFallback]);

  // FrameXTV PostMessage Telemetry
  useEffect(() => {
    if (!useIframeFallback) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.event === 'frameXTV:timeupdate') {
        const cur = Number(event.data.currentTime || 0);
        const dur = Number(event.data.duration || 0);
        setCurrentTime(cur);
        setDuration(dur);
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
      if (!showAudioSubtitleModalRef.current) {
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
              setSelectedServerIndex(modalRow);
              setUseIframeFallback(true);
              setError(null);
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
            seekBy(-10);
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
            seekBy(10);
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
          } else if (curCtrl === 'scrubber' || curCtrl === 'play') {
            togglePlayPause();
          } else if (curCtrl === 'rewind') {
            seekBy(-10);
          } else if (curCtrl === 'forward') {
            seekBy(10);
          } else if (curCtrl === 'next-ep') {
            if (onNextEpisode) onNextEpisode();
          } else if (curCtrl === 'server') {
            setShowAudioSubtitleModal(true);
            setModalCol(2);
            setModalRow(selectedServerIndex);
          } else if (curCtrl === 'subtitles') {
            setShowAudioSubtitleModal(true);
            setModalCol(1);
            setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
          }
          break;

        case 's':
        case 'S':
          e.preventDefault();
          setSelectedServerIndex((prev) => (prev + 1) % servers.length);
          setUseIframeFallback(true);
          setError(null);
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
    modalRow
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

  // Seek offset
  const seekBy = (sec: number) => {
    if (useIframeFallback) {
      iframeRef.current?.contentWindow?.postMessage({ action: 'seekBy', seconds: sec }, '*');
      setCurrentTime((prev) => Math.max(0, prev + sec));
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + sec);
    }
  };

  // Subtitle switch
  const selectSubtitle = (index: number) => {
    setActiveSubtitle(index);
    if (useIframeFallback) {
      iframeRef.current?.contentWindow?.postMessage({ action: 'setSubtitle', index }, '*');
    } else if (videoRef.current) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        videoRef.current.textTracks[i].mode = i === index ? 'showing' : 'disabled';
      }
    }
  };

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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
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
          className="w-full h-full object-contain bg-black"
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
              default={sub.isDefault}
            />
          ))}
        </video>
      )}

      {/* Engine 2: Multi-Server Embedded Iframe */}
      {useIframeFallback && currentEmbedUrl && (
        <iframe
          key={currentEmbedUrl}
          ref={iframeRef}
          src={currentEmbedUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          title="Netflix Player"
        />
      )}

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
              {season && episode && (
                <p className="text-xs font-bold text-zinc-300">
                  S{season}:E{episode}
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
                {formatRemainingTime(currentTime, duration)}
              </span>
            </div>

            {/* TV remote prompt when scrubber is active */}
            {focusedControl === 'scrubber' && (
              <div className="flex items-center justify-between pt-1 px-1 text-[11px] font-bold">
                <span className="text-[#E50914] flex items-center space-x-1 animate-pulse">
                  <span>◄</span>
                  <span>Rewind 10s</span>
                  <span className="mx-1 text-zinc-500">|</span>
                  <span>Fast-Forward 10s</span>
                  <span>►</span>
                </span>
                <span className="text-zinc-400 font-mono text-[10px]">
                  Press ENTER to {isPlaying ? 'Pause' : 'Play'} • Press DOWN for Controls
                </span>
              </div>
            )}
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

              {/* Rewind 10s */}
              <button
                onClick={() => {
                  setFocusedControl('rewind');
                  seekBy(-10);
                }}
                className={`p-2.5 rounded-full transition-all relative flex items-center justify-center ${
                  focusedControl === 'rewind'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Rewind 10s"
              >
                <RotateCcw className={`w-6 h-6 ${focusedControl === 'rewind' ? 'text-black' : 'text-white'}`} />
                <span className={`absolute text-[8px] font-bold ${focusedControl === 'rewind' ? 'text-black' : 'text-white'}`}>10</span>
              </button>

              {/* Fast Forward 10s */}
              <button
                onClick={() => {
                  setFocusedControl('forward');
                  seekBy(10);
                }}
                className={`p-2.5 rounded-full transition-all relative flex items-center justify-center ${
                  focusedControl === 'forward'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl'
                    : 'text-white hover:text-zinc-200'
                }`}
                title="Fast Forward 10s"
              >
                <RotateCw className={`w-6 h-6 ${focusedControl === 'forward' ? 'text-black' : 'text-white'}`} />
                <span className={`absolute text-[8px] font-bold ${focusedControl === 'forward' ? 'text-black' : 'text-white'}`}>10</span>
              </button>

              {/* Next Episode (if series) */}
              {season && episode && onNextEpisode && (
                <button
                  onClick={() => {
                    setFocusedControl('next-ep');
                    onNextEpisode();
                  }}
                  className={`p-2.5 rounded-full transition-all ${
                    focusedControl === 'next-ep'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-115 shadow-2xl'
                      : 'text-white hover:text-zinc-200'
                  }`}
                  title="Next Episode"
                >
                  <SkipForward className={`w-6 h-6 ${focusedControl === 'next-ep' ? 'text-black' : 'text-white'}`} />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Server Switcher Button */}
              {useIframeFallback && servers.length > 1 && (
                <button
                  onClick={() => {
                    setFocusedControl('server');
                    setShowAudioSubtitleModal(true);
                    setModalCol(2);
                    setModalRow(selectedServerIndex);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-[4px] text-xs font-bold transition-all ${
                    focusedControl === 'server'
                      ? 'bg-white text-black ring-4 ring-white/60 scale-105 shadow-2xl'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Switch streaming server"
                >
                  <Server className="w-4 h-4 text-[#E50914]" />
                  <span>{servers[selectedServerIndex]?.name || 'Server 1'}</span>
                </button>
              )}

              {/* Audio & Subtitles Menu Trigger */}
              <button
                onClick={() => {
                  setFocusedControl('subtitles');
                  setShowAudioSubtitleModal(true);
                  setModalCol(1);
                  setModalRow(activeSubtitle === -1 ? 0 : activeSubtitle + 1);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-[4px] text-xs font-bold transition-all ${
                  focusedControl === 'subtitles'
                    ? 'bg-white text-black ring-4 ring-white/60 scale-105 shadow-2xl'
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Audio & Subtitles"
              >
                <Subtitles className={`w-5 h-5 ${focusedControl === 'subtitles' ? 'text-black' : 'text-zinc-300'}`} />
                <span>Audio & Subtitles</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Netflix Multi-Column Audio, Subtitles & Server Dialog */}
      {showAudioSubtitleModal && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-[#181818] border border-zinc-700/80 rounded-[4px] max-w-3xl w-full p-8 shadow-2xl relative">
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
                  Audio {modalCol === 0 && '◄'}
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
                  Subtitles {modalCol === 1 && '◄'}
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
                  Stream Server {modalCol === 2 && '◄'}
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
