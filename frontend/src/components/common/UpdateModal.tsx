import React, { useState, useEffect, useRef } from 'react';
import { Download, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { AppUpdateManifest, CURRENT_APP_VERSION } from '../../version';
import { updateService } from '../../services/updateService';

interface UpdateModalProps {
  update: AppUpdateManifest;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ update, onClose }) => {
  const [focusedBtn, setFocusedBtn] = useState<'update' | 'later'>('update');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Subscribe to native Android download progress
  useEffect(() => {
    const unsubscribe = updateService.subscribeProgress((percent, status) => {
      setDownloadProgress(percent);
      if (status.startsWith('error')) {
        setIsError(true);
        setStatusMessage(status);
      } else if (status === 'ready_to_install' || status === 'installed_prompted') {
        setStatusMessage('Opening Android Package Installer...');
      } else {
        setStatusMessage(`Downloading update: ${percent}%`);
      }
    });

    return () => unsubscribe();
  }, []);

  // TV Remote Key Controls
  useEffect(() => {
    const handleRemoteKey = (e: KeyboardEvent) => {
      if (e.key === 'Back' || e.key === 'Escape') {
        e.preventDefault();
        updateService.dismissUpdate(update.versionCode);
        onClose();
        return;
      }

      if (downloadProgress !== null && downloadProgress >= 0 && downloadProgress < 100) {
        // While downloading, prevent accidental button presses
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          setFocusedBtn('later');
          break;
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          setFocusedBtn('update');
          break;
        case 'Enter':
        case 'Select':
          e.preventDefault();
          if (focusedBtn === 'update') {
            handleStartUpdate();
          } else {
            updateService.dismissUpdate(update.versionCode);
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleRemoteKey);
    return () => window.removeEventListener('keydown', handleRemoteKey);
  }, [focusedBtn, downloadProgress, update.versionCode, onClose]);

  const handleStartUpdate = () => {
    setStatusMessage('Connecting to GitHub repository...');
    setIsError(false);
    setDownloadProgress(0);
    const handledByNative = updateService.startDownloadAndInstall(update.apkUrl);
    if (!handledByNative) {
      setStatusMessage('Update opened in browser download.');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleDismiss = () => {
    updateService.dismissUpdate(update.versionCode);
    onClose();
  };

  const isDownloading = downloadProgress !== null && downloadProgress >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="bg-[#181818] border border-zinc-700/80 rounded-[8px] max-w-xl w-full p-8 shadow-2xl relative">
        {/* Close Button */}
        {!isDownloading && (
          <button
            onClick={handleDismiss}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header Ribbon & Title */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-12 flex-shrink-0 flex items-center justify-center bg-black/60 rounded-md border border-white/10 p-1">
            <svg viewBox="0 0 100 160" width="22" height="36" className="filter drop-shadow">
              <path d="M0 0h34v160H0z" fill="#B81D24" />
              <path d="M66 0h34v160H66z" fill="#B81D24" />
              <path d="M0 0h34l66 160H66z" fill="#E50914" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white tracking-tight">New Update Available</h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>v{update.versionName}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Current: v{CURRENT_APP_VERSION.versionName} ({CURRENT_APP_VERSION.commitHash.substring(0, 7)}) ➔ New: v{update.versionName} ({update.commitHash.substring(0, 7)})
            </p>
          </div>
        </div>

        {/* Changelog Box */}
        <div className="bg-black/40 border border-white/5 rounded-md p-4 my-5 max-h-48 overflow-y-auto no-scrollbar">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">What's New</h4>
          <ul className="space-y-2 text-xs text-zinc-200">
            {update.changelog && update.changelog.length > 0 ? (
              update.changelog.map((entry, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#E50914] font-bold text-sm leading-none">•</span>
                  <span>{entry}</span>
                </li>
              ))
            ) : (
              <li className="text-zinc-400">Performance enhancements and bug fixes.</li>
            )}
          </ul>
        </div>

        {/* Download Progress Bar */}
        {isDownloading && (
          <div className="my-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
              <span className="flex items-center space-x-1.5">
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : downloadProgress === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
                )}
                <span>{statusMessage || 'Downloading...'}</span>
              </span>
              <span className="font-mono text-white">{downloadProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  isError ? 'bg-red-600' : 'bg-[#E50914]'
                }`}
                style={{ width: `${Math.max(3, downloadProgress || 0)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            Remote: ◀ / ▶ select • Enter confirm • Back dismiss
          </span>
          <div className="flex items-center space-x-3">
            {!update.isMandatory && !isDownloading && (
              <button
                onClick={handleDismiss}
                className={`px-5 py-2.5 rounded-[4px] text-xs font-bold transition-all ${
                  focusedBtn === 'later'
                    ? 'bg-white text-black ring-4 ring-white/50 scale-105 shadow-xl'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Later
              </button>
            )}

            <button
              onClick={handleStartUpdate}
              disabled={isDownloading && !isError}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-[4px] text-xs font-bold transition-all ${
                focusedBtn === 'update' && (!isDownloading || isError)
                  ? 'bg-[#E50914] text-white ring-4 ring-red-500/50 scale-105 shadow-2xl font-black'
                  : 'bg-[#B81D24] text-white hover:bg-[#E50914]'
              } ${isDownloading && !isError ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Download className="w-4 h-4" />
              <span>{isError ? 'Retry Update' : isDownloading ? 'Updating...' : 'Update Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
