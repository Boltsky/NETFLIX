import React, { useEffect, useState } from 'react';
import { DownloadedItem, StorageQuotaInfo, MediaItem } from '../../types';
import { downloadService } from '../../services/downloadService';
import { Download, Play, Trash2, HardDrive, AlertCircle, CheckCircle, RefreshCw, Film, ArrowDownToLine, Sparkles } from 'lucide-react';

interface DownloadsScreenProps {
  onPlayOffline: (item: DownloadedItem, blobUrl: string) => void;
  onExplore?: () => void;
  onSelectTitle?: (item: MediaItem) => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  onPlayOffline,
  onExplore,
  onSelectTitle
}) => {
  const [items, setItems] = useState<DownloadedItem[]>([]);
  const [storage, setStorage] = useState<StorageQuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const [downloadedItems, quota] = await Promise.all([
        downloadService.getDownloads(),
        downloadService.getStorageQuota()
      ]);
      if (isMounted) {
        setItems(downloadedItems);
        setStorage(quota);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to download events and updates
    const unsubscribe = downloadService.subscribe((updatedItems) => {
      if (isMounted) {
        setItems(updatedItems);
        downloadService.getStorageQuota().then((q) => {
          if (isMounted) setStorage(q);
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handlePlay = async (item: DownloadedItem) => {
    setActionLoadingId(item.id);
    try {
      const blobUrl = await downloadService.getOfflinePlaybackUrl(item.id);
      if (blobUrl) {
        onPlayOffline(item, blobUrl);
      } else {
        setStatusMessage(`Could not prepare offline stream for "${item.title}".`);
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (e: any) {
      setStatusMessage(`Offline playback error: ${e?.message || 'unknown error'}`);
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportToDisk = async (item: DownloadedItem) => {
    setActionLoadingId(item.id);
    try {
      const success = await downloadService.exportToDisk(item.id);
      if (success) {
        setStatusMessage(`Saving "${item.title}" (${item.quality}) to your PC Downloads folder...`);
      } else {
        setStatusMessage(`Could not save file to disk.`);
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e: any) {
      setStatusMessage(`Disk save failed: ${e?.message || 'error'}`);
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (item: DownloadedItem) => {
    if (window.confirm(`Delete "${item.title}" from local offline storage to free up space?`)) {
      await downloadService.deleteDownload(item.id);
      const quota = await downloadService.getStorageQuota();
      setStorage(quota);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete ALL downloaded titles and free up all local storage?')) {
      await downloadService.clearAllDownloads();
      const quota = await downloadService.getStorageQuota();
      setStorage(quota);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-24 min-h-screen text-white select-none px-4 sm:px-6 md:px-12 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Storage Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Downloads
              {items.length > 0 && (
                <span className="text-sm font-semibold text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'title' : 'titles'}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Watch offline anytime without buffering or internet connection
            </p>
          </div>
        </div>

        {/* Storage Bar & Clear Button */}
        {storage && (
          <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800/80 px-4 py-2.5 rounded-xl shadow-lg">
            <HardDrive className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="w-36 sm:w-48 space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <span>Used: {storage.usedFormatted}</span>
                <span className="text-zinc-500">Free: {storage.availableFormatted}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, storage.percentUsed)}%` }}
                />
              </div>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors border-l border-zinc-800 pl-3 py-0.5"
                title="Clear all local downloads"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Status Message Toast */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-red-500/30 text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-2 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-red-500" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-zinc-400">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
          <p className="text-sm">Loading your local downloads...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-5">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-xl">
            <Download className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Never be without Netflix
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Download your favorite movies and shows to watch on flights, road trips, or whenever you don't have internet access.
            </p>
          </div>
          {onExplore && (
            <button
              onClick={onExplore}
              className="bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-2.5 rounded-md text-sm transition-all duration-200 shadow-lg flex items-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Find Something to Download</span>
            </button>
          )}
        </div>
      ) : (
        /* Downloaded Items Grid / List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => {
            const isDownloading = item.status === 'downloading';
            const isCompleted = item.status === 'completed';
            const isFailed = item.status === 'error';
            const isLoadingAction = actionLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-md hover:shadow-xl"
              >
                {/* Poster & Thumbnail Header */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                  {item.backdrop || item.poster ? (
                    <img
                      src={item.backdrop || item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Film className="w-12 h-12" />
                    </div>
                  )}

                  {/* Top Badge: Quality & Size */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-black/75 backdrop-blur-md text-[11px] font-bold text-white px-2 py-0.5 rounded border border-white/10 uppercase">
                      {item.quality}
                    </span>
                    <span className="bg-black/75 backdrop-blur-md text-[11px] font-medium text-zinc-300 px-2 py-0.5 rounded border border-white/10">
                      {item.formattedSize}
                    </span>
                  </div>

                  {/* Play Action Overlay Button */}
                  {isCompleted && (
                    <button
                      onClick={() => handlePlay(item)}
                      disabled={isLoadingAction}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
                      title="Play offline"
                    >
                      {isLoadingAction ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  )}

                  {/* In-Progress Download Overlay Bar */}
                  {isDownloading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                        <span>Downloading {item.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-600 h-full rounded-full transition-all duration-200"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                      {item.downloadSpeed && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.downloadSpeed}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Content & Action Controls */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight line-clamp-1">
                      {item.title}
                    </h3>
                    {item.season !== undefined && item.episode !== undefined ? (
                      <p className="text-xs text-zinc-400 font-medium">
                        Season {item.season}, Ep {item.episode}
                        {item.episodeName && ` • ${item.episodeName}`}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500 capitalize">
                        {item.mediaType}
                      </p>
                    )}
                  </div>

                  {/* Status & Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center space-x-1.5 text-xs">
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-400 font-medium text-[11px]">Offline Ready</span>
                        </>
                      ) : isFailed ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-400 font-medium text-[11px]">Failed</span>
                        </>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Downloading...</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Save to PC disk button */}
                      {isCompleted && item.blob && (
                        <button
                          onClick={() => handleExportToDisk(item)}
                          disabled={isLoadingAction}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                          title="Save MP4 file to PC Downloads folder"
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete from local storage */}
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete from offline storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
