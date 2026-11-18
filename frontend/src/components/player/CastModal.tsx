import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Cast,
  Tv,
  Monitor,
  Smartphone,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  Laptop,
  Radio,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { MediaItem } from '../../types';
import { generateQRCodeMatrix } from '../../utils/qrGenerator';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  videoElement?: HTMLVideoElement | null;
  onTogglePip?: () => Promise<void>;
  isPipActive?: boolean;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  item,
  currentTime,
  duration,
  season,
  episode,
  videoElement,
  onTogglePip,
  isPipActive = false
}) => {
  const [copied, setCopied] = useState(false);
  const [castStatus, setCastStatus] = useState<'idle' | 'searching' | 'connected' | 'unsupported'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tv' | 'pc' | 'qr'>('tv');

  // Compute the direct sync watch link with timestamp and metadata
  const castUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const timeSec = Math.max(0, Math.floor(currentTime || 0));
    const isEpisodic = item.type === 'tv' || item.type === 'anime';
    const params = new URLSearchParams({
      time: String(timeSec),
      type: item.type,
      autoplay: '1',
      cast: '1'
    });
    if (isEpisodic && season) params.set('season', String(season));
    if (isEpisodic && episode) params.set('episode', String(episode));

    return `${origin}/#/watch/${item.id}?${params.toString()}`;
  }, [item.id, item.type, currentTime, season, episode]);

  // Generate SVG QR Matrix for the castUrl
  const qrData = useMemo(() => {
    if (!castUrl) return null;
    try {
      return generateQRCodeMatrix(castUrl);
    } catch (err) {
      console.warn('[CastModal] QR generation error:', err);
      return null;
    }
  }, [castUrl]);

  // Listen to remote playback events if supported
  useEffect(() => {
    if (!videoElement) return;

    const remote = (videoElement as any).remote;
    if (remote && typeof remote.addEventListener === 'function') {
      const handleConnecting = () => {
        setCastStatus('searching');
        setStatusMessage('Connecting to wireless display...');
      };
      const handleConnect = () => {
        setCastStatus('connected');
        setStatusMessage('Casting live to external TV / screen!');
      };
      const handleDisconnect = () => {
        setCastStatus('idle');
        setStatusMessage('');
      };

      remote.addEventListener('connecting', handleConnecting);
      remote.addEventListener('connect', handleConnect);
      remote.addEventListener('disconnect', handleDisconnect);

      if (remote.state === 'connected') {
        setCastStatus('connected');
      }

      return () => {
        remote.removeEventListener('connecting', handleConnecting);
        remote.removeEventListener('connect', handleConnect);
        remote.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, [videoElement]);

  // Reset copied toast after 2.5s
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Copy TV link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(castUrl);
        setCopied(true);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = castUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
      }
    } catch (err) {
      console.warn('[CastModal] Copy link failed:', err);
    }
  }, [castUrl]);

  // Native Web Share API
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Watch ${item.title} on CineWave TV`,
          text: `Cast ${item.title} to your Smart TV or PC screen!`,
          url: castUrl
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  }, [item.title, castUrl, handleCopyLink]);

  // Trigger Google Cast / Remote Playback API
  const handleNativeCast = useCallback(async () => {
    setStatusMessage('');

    // 1. Try Remote Playback API (Chromium / Chrome / Edge)
    const remote = videoElement ? (videoElement as any).remote : null;
    if (remote && typeof remote.prompt === 'function') {
      try {
        setCastStatus('searching');
        setStatusMessage('Opening device picker (Chromecast / Smart TV)...');
        await remote.prompt();
        return;
      } catch (err: any) {
        if (err.name === 'NotFoundError') {
          setStatusMessage('No cast devices detected on this Wi-Fi network.');
          setCastStatus('idle');
          return;
        }
        if (err.name !== 'NotAllowedError') {
          console.warn('[CastModal] remote.prompt error:', err);
        }
      }
    }

    // 2. Try WebKit Playback Target Picker (Safari / iOS AirPlay)
    if (videoElement && typeof (videoElement as any).webkitShowPlaybackTargetPicker === 'function') {
      try {
        setCastStatus('searching');
        (videoElement as any).webkitShowPlaybackTargetPicker();
        return;
      } catch (err) {
        console.warn('[CastModal] AirPlay picker error:', err);
      }
    }

    // 3. Try Presentation API (Wireless display / Miracast / Second PC Screen)
    const windowWithPres = window as any;
    if (windowWithPres.PresentationRequest && castUrl) {
      try {
        setCastStatus('searching');
        setStatusMessage('Searching for wireless monitors & TVs...');
        const request = new windowWithPres.PresentationRequest([castUrl]);
        await request.start();
        setCastStatus('connected');
        setStatusMessage('Connected to presentation screen!');
        return;
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.warn('[CastModal] PresentationRequest error:', err);
        }
      }
    }

    // Fallback: switch to QR Code & Direct Link tab
    setActiveTab('qr');
    setStatusMessage('Use the QR Code or TV Link below to connect any Smart TV or PC!');
    setCastStatus('idle');
  }, [videoElement, castUrl]);

  // Open in a standalone popout player window on this PC
  const handleOpenPopoutWindow = useCallback(() => {
    if (typeof window === 'undefined') return;
    const width = 1200;
    const height = 675;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      castUrl,
      `cinewave_cast_${item.id}`,
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no`
    );
  }, [castUrl, item.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              castStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-red-500/15 text-[#E50914] border border-red-500/25'
            }`}>
              <Cast className={`w-5 h-5 ${castStatus === 'searching' ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Cast to TV or PC
                </h2>
                {castStatus === 'connected' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Casting Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-[280px] sm:max-w-md">
                {item.title} {season && episode ? `(S${season}:E${episode})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950/40 px-5 pt-1">
          <button
            onClick={() => setActiveTab('tv')}
            className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tv'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Smart TV & Chromecast</span>
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC & Second Screen</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>QR Code & TV Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
              castStatus === 'connected'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-800/80 text-zinc-200 border-zinc-700/60'
            }`}>
              <Radio className="w-4 h-4 text-[#E50914] shrink-0 animate-pulse" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: Smart TV & Chromecast */}
          {activeTab === 'tv' && (
            <div className="space-y-4">
              <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-zinc-800 text-white shrink-0">
                    <Radio className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Chromecast, Google TV & AirPlay</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Wirelessly stream this movie directly to your TV or sound system. Make sure your device and TV are connected to the same Wi-Fi network.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleNativeCast}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-red-700 active:scale-98 font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-950/60 cursor-pointer"
                  >
                    <Cast className="w-4 h-4" />
                    <span>Connect to Nearby TV</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 border border-zinc-700/60 cursor-pointer"
                  >
                    <Tv className="w-4 h-4" />
                    <span>TV Browser Mode</span>
                  </button>
                </div>
              </div>

              {/* Supported TV Brands Grid */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/70 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Supported TVs & Receivers
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-300">
                  <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-center">Google TV / Chromecast</span>
                  <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-center">Samsung Tizen Smart TV</span>
                  <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-center">LG webOS Smart TV</span>
                  <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-center">Apple TV & AirPlay 2</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PC & Second Screen */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Picture in Picture */}
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Picture-in-Picture</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Pop out a floating, always-on-top player to watch movies while working or across multiple PC monitors.
                    </p>
                  </div>
                  <button
                    onClick={onTogglePip}
                    className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all flex items-center justify-center space-x-1.5 border border-zinc-700/60 cursor-pointer"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{isPipActive ? 'Exit Picture-in-Picture' : 'Pop Out Floating Player'}</span>
                  </button>
                </div>

                {/* Popout Window */}
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Dedicated PC Window</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Open in a clean, borderless standalone video window on your second PC display or projector.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenPopoutWindow}
                    className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all flex items-center justify-center space-x-1.5 border border-zinc-700/60 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Second Screen</span>
                  </button>
                </div>
              </div>

              {/* Windows Wireless Display Tip */}
              <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-start space-x-3 text-xs text-zinc-400">
                <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  On Windows 10/11: Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-white font-mono text-[11px]">Win + K</kbd> anytime to project this PC wirelessly to another TV or monitor.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: QR Code & TV Link */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
                {/* High Contrast Rendered QR Code */}
                <div className="bg-white p-3 rounded-xl shadow-2xl shrink-0 flex items-center justify-center">
                  {qrData ? (
                    <svg
                      viewBox={`0 0 ${qrData.size} ${qrData.size}`}
                      className="w-36 h-36 sm:w-44 sm:h-44 shape-rendering-crisp"
                    >
                      {qrData.modules.map((row, r) =>
                        row.map((isDark, c) =>
                          isDark ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width={1}
                              height={1}
                              fill="#000000"
                            />
                          ) : null
                        )
                      )}
                    </svg>
                  ) : (
                    <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center text-zinc-400 text-xs text-center p-2">
                      Generating TV QR code...
                    </div>
                  )}
                </div>

                {/* QR Guide Instructions */}
                <div className="space-y-2.5 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[11px] font-bold border border-red-500/20">
                    <Smartphone className="w-3 h-3" />
                    <span>Instant Smart TV Connect</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Scan with Camera or TV Remote</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Point your smartphone camera or Smart TV remote at this QR code. The movie will instantly open on your TV or second PC synced to <span className="text-white font-semibold">{Math.floor(currentTime)}s</span>.
                  </p>
                </div>
              </div>

              {/* Direct Link Copy & Share */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 block">
                  Direct TV / PC Playback Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={castUrl}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/60'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-all cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800/80 bg-zinc-950/70 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-zinc-400" />
            <span>CineWave Seamless Multi-Screen Cast</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
