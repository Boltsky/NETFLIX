import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  onExit: () => void;
  onNextEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  season,
  episode,
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
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1);
  const [showAudioSubtitleModal, setShowAudioSubtitleModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Save viewing progress
  const saveCurrentProgress = useCallback((posSec: number, durSec: number) => {
    if (durSec > 0) {
      api.saveProgress(item.id, {
        mediaType: item.type,
        season,
        episode,
        positionMs: Math.round(posSec * 1000),
        durationMs: Math.round(durSec * 1000),
        title: item.title,
        poster: item.poster || item.backdrop
      }).catch((e) => console.warn('Failed to save progress:', e));
    }
  }, [item, season, episode]);

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

  // Resolve playback source
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api.resolvePlayback(item.id, item.type, season, episode)
      .then((res) => {
        if (!isMounted) return;
        setResolution(res);
        setLoading(false);

        const hasDirectSource = res.sources && res.sources.length > 0;
        if (!hasDirectSource && res.embedUrl) {
          setUseIframeFallback(true);
        }
      })
      .catch((err) => {
        console.error('Playback resolve failed:', err);
        if (isMounted) {
          setError(err.message || 'Unable to resolve playback source');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [item.id, item.type, season, episode]);

  // Initialize Native / HLS Player
  useEffect(() => {
    if (!resolution || useIframeFallback) return;

    const source: StreamSource | undefined = resolution.sources?.[0];
    if (!source || !source.url) {
      setUseIframeFallback(true);
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
          backBufferLength: 90
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
            setUseIframeFallback(true);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.play().catch(() => setIsPlaying(false));
      } else {
        setUseIframeFallback(true);
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
      setUseIframeFallback(true);
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
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showAudioSubtitleModal) {
        setShowControls(false);
      }
    }, 4500);
  }, [showAudioSubtitleModal]);

  // Remote key controller for TV
  useEffect(() => {
    const handleRemoteKey = (e: KeyboardEvent) => {
      resetControlsTimeout();

      if (showAudioSubtitleModal) {
        if (e.key === 'Back' || e.key === 'Escape') {
          e.preventDefault();
          setShowAudioSubtitleModal(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          seekBy(10);
          break;
        case 'ArrowUp':
        case 'Up':
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          setShowControls((prev) => !prev);
          break;
        case 'Enter':
        case 'Select':
          e.preventDefault();
          togglePlayPause();
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
  }, [resetControlsTimeout, handleExit, showAudioSubtitleModal]);

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
          <h2 className="text-xl font-bold text-white">Playback Error</h2>
          <p className="text-xs text-zinc-400">{error}</p>
          <button
            onClick={handleExit}
            className="px-6 py-2.5 rounded-[4px] bg-[#E50914] hover:bg-red-700 text-white font-bold text-sm"
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

      {/* Engine 2: FrameXTV PostMessage Embedded Iframe */}
      {useIframeFallback && resolution && (
        <iframe
          ref={iframeRef}
          src={resolution.embedUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; encrypted-media"
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
              className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Exit (Back)"
            >
              <ArrowLeft className="w-6 h-6" />
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
          <div className="flex items-center space-x-4">
            <div className="relative h-1.5 flex-1 bg-zinc-700/80 rounded-full overflow-visible">
              {/* Buffer / progress */}
              <div
                className="h-full bg-[#E50914] rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* White scrub head handle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md transform translate-x-1/2" />
              </div>
            </div>
            {/* Netflix Time Remaining */}
            <span className="text-xs font-mono font-bold text-zinc-300 w-16 text-right">
              {formatRemainingTime(currentTime, duration)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-6">
              {/* Play / Pause */}
              <button
                onClick={togglePlayPause}
                className="p-2 text-white hover:text-zinc-200 transition-colors"
                title="Play/Pause (Enter)"
              >
                {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white" />}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => seekBy(-10)}
                className="p-2 text-white hover:text-zinc-200 transition-colors relative flex items-center justify-center"
                title="Rewind 10s"
              >
                <RotateCcw className="w-6 h-6" />
                <span className="absolute text-[8px] font-bold">10</span>
              </button>

              {/* Fast Forward 10s */}
              <button
                onClick={() => seekBy(10)}
                className="p-2 text-white hover:text-zinc-200 transition-colors relative flex items-center justify-center"
                title="Fast Forward 10s"
              >
                <RotateCw className="w-6 h-6" />
                <span className="absolute text-[8px] font-bold">10</span>
              </button>

              {/* Next Episode (if series) */}
              {season && episode && onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="p-2 text-white hover:text-zinc-200 transition-colors"
                  title="Next Episode"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Audio & Subtitles Menu Trigger */}
            <button
              onClick={() => setShowAudioSubtitleModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-[4px] hover:bg-white/10 text-white text-xs font-bold transition-colors"
            >
              <Subtitles className="w-5 h-5 text-zinc-300" />
              <span>Audio & Subtitles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Netflix Dual-Column Audio & Subtitles Dialog */}
      {showAudioSubtitleModal && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-[#181818] border border-zinc-700/80 rounded-[4px] max-w-2xl w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAudioSubtitleModal(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Audio & Subtitles</h3>

            <div className="grid grid-cols-2 gap-8 text-sm">
              {/* Left Column: Audio */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Audio</h4>
                <div className="flex items-center space-x-2 text-white font-bold cursor-pointer">
                  <Check className="w-4 h-4 text-white" />
                  <span>English [Original] (5.1)</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-400 cursor-pointer pl-6">
                  <span>English - Audio Description</span>
                </div>
                <div className="flex items-center space-x-2 text-zinc-400 cursor-pointer pl-6">
                  <span>Español (5.1)</span>
                </div>
              </div>

              {/* Right Column: Subtitles */}
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Subtitles</h4>
                <div
                  onClick={() => selectSubtitle(-1)}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    activeSubtitle === -1 ? 'text-white font-bold' : 'text-zinc-400 pl-6'
                  }`}
                >
                  {activeSubtitle === -1 && <Check className="w-4 h-4 text-white" />}
                  <span>Off</span>
                </div>

                {resolution?.subtitles?.map((sub, i) => (
                  <div
                    key={`sub-select-${i}`}
                    onClick={() => selectSubtitle(i)}
                    className={`flex items-center space-x-2 cursor-pointer ${
                      activeSubtitle === i ? 'text-white font-bold' : 'text-zinc-400 pl-6'
                    }`}
                  >
                    {activeSubtitle === i && <Check className="w-4 h-4 text-white" />}
                    <span>{sub.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-700/80 flex justify-end">
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
