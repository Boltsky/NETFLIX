import { DownloadedItem, DownloadQualityOption, DownloadResolution, StorageQuotaInfo } from '../types';
import { api, getBackendBaseUrl } from './api';

const DB_NAME = 'netflix_downloads_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';

export interface StartDownloadOptions {
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  poster?: string;
  backdrop?: string;
  season?: number;
  episode?: number;
  episodeName?: string;
  duration?: number;
  quality?: string; // defaults to '1080p'
  mode?: 'offline' | 'disk'; // defaults to 'offline'
}

type DownloadListener = (items: DownloadedItem[]) => void;
type ProgressListener = (item: DownloadedItem) => void;

class DownloadService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private inMemoryStore: Map<string, DownloadedItem> = new Map();
  private listeners: Set<DownloadListener> = new Set();
  private progressListeners: Map<string, Set<ProgressListener>> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private objectUrls: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return resolve(null);
      }

      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e: any) => {
          const db = e.target.result as IDBDatabase;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        req.onsuccess = (e: any) => {
          resolve(e.target.result as IDBDatabase);
        };

        req.onerror = () => {
          console.warn('[DownloadService] IndexedDB open error, falling back to in-memory store');
          resolve(null);
        };
      } catch (err) {
        console.warn('[DownloadService] IndexedDB unavailable:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private async getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore | null> {
    const db = await this.initDB();
    if (!db) return null;
    try {
      const tx = db.transaction(STORE_NAME, mode);
      return tx.objectStore(STORE_NAME);
    } catch {
      return null;
    }
  }

  // Subscribe to changes across all downloaded items
  subscribe(listener: DownloadListener): () => void {
    this.listeners.add(listener);
    this.getDownloads().then((items) => listener(items));
    return () => this.listeners.delete(listener);
  }

  // Subscribe to real-time progress for a specific download item
  onItemProgress(id: string, listener: ProgressListener): () => void {
    if (!this.progressListeners.has(id)) {
      this.progressListeners.set(id, new Set());
    }
    this.progressListeners.get(id)!.add(listener);
    return () => {
      this.progressListeners.get(id)?.delete(listener);
    };
  }

  private notify() {
    this.getDownloads().then((items) => {
      for (const listener of this.listeners) {
        try {
          listener(items);
        } catch (e) {
          console.error('[DownloadService] Listener error:', e);
        }
      }
    });
  }

  private notifyProgress(item: DownloadedItem) {
    const listeners = this.progressListeners.get(item.id);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(item);
        } catch (e) {
          console.error('[DownloadService] Progress listener error:', e);
        }
      }
    }
    this.notify();
  }

  // Generate unique download ID
  getDownloadId(contentId: string, mediaType: string, season?: number, episode?: number): string {
    if (season !== undefined && episode !== undefined) {
      return `${mediaType}_${contentId}_s${season}_e${episode}`;
    }
    return `${mediaType}_${contentId}`;
  }

  // Format bytes helper
  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  // Get current storage quota usage (GB used vs available)
  async getStorageQuota(): Promise<StorageQuotaInfo> {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 50 * 1024 * 1024 * 1024; // Default fallback to 50 GB
        const available = Math.max(0, total - used);
        const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

        return {
          usedBytes: used,
          totalBytes: total,
          availableBytes: available,
          usedFormatted: this.formatBytes(used),
          totalFormatted: this.formatBytes(total),
          availableFormatted: this.formatBytes(available),
          percentUsed: percent
        };
      }
    } catch (e) {
      console.warn('[DownloadService] Storage estimate failed:', e);
    }

    // Fallback based on stored items
    const items = await this.getDownloads();
    const used = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
    const total = 50 * 1024 * 1024 * 1024; // 50 GB estimate
    const available = Math.max(0, total - used);

    return {
      usedBytes: used,
      totalBytes: total,
      availableBytes: available,
      usedFormatted: this.formatBytes(used),
      totalFormatted: this.formatBytes(total),
      availableFormatted: this.formatBytes(available),
      percentUsed: Math.round((used / total) * 100)
    };
  }

  // Retrieve all downloads
  async getDownloads(): Promise<DownloadedItem[]> {
    const store = await this.getStore('readonly');
    if (!store) {
      return Array.from(this.inMemoryStore.values());
    }

    return new Promise((resolve) => {
      try {
        const req = store.getAll();
        req.onsuccess = () => {
          const list: DownloadedItem[] = req.result || [];
          resolve(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        };
        req.onerror = () => {
          resolve(Array.from(this.inMemoryStore.values()));
        };
      } catch {
        resolve(Array.from(this.inMemoryStore.values()));
      }
    });
  }

  // Retrieve a single download by ID
  async getDownload(id: string): Promise<DownloadedItem | null> {
    const store = await this.getStore('readonly');
    if (!store) {
      return this.inMemoryStore.get(id) || null;
    }

    return new Promise((resolve) => {
      try {
        const req = store.get(id);
        req.onsuccess = () => {
          resolve(req.result || null);
        };
        req.onerror = () => {
          resolve(this.inMemoryStore.get(id) || null);
        };
      } catch {
        resolve(this.inMemoryStore.get(id) || null);
      }
    });
  }

  // Save or update an item in IndexedDB / in-memory
  private async saveItem(item: DownloadedItem): Promise<void> {
    this.inMemoryStore.set(item.id, item);
    const store = await this.getStore('readwrite');
    if (!store) return;

    return new Promise((resolve) => {
      try {
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Delete an item from storage
  async deleteDownload(id: string): Promise<void> {
    // Revoke cached object URL if created
    if (this.objectUrls.has(id)) {
      try {
        URL.revokeObjectURL(this.objectUrls.get(id)!);
      } catch {}
      this.objectUrls.delete(id);
    }

    // Abort if currently downloading
    if (this.abortControllers.has(id)) {
      this.abortControllers.get(id)!.abort();
      this.abortControllers.delete(id);
    }

    this.inMemoryStore.delete(id);
    const store = await this.getStore('readwrite');
    if (store) {
      await new Promise<void>((resolve) => {
        try {
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    this.notify();
  }

  // Clear all downloaded items
  async clearAllDownloads(): Promise<void> {
    for (const url of this.objectUrls.values()) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    this.objectUrls.clear();

    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();

    this.inMemoryStore.clear();
    const store = await this.getStore('readwrite');
    if (store) {
      await new Promise<void>((resolve) => {
        try {
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    this.notify();
  }

  // Trigger browser's native file download directly to user's disk
  triggerBrowserDownload(url: string, filename: string) {
    if (typeof window === 'undefined') return;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1500);
  }

  // Export an already completed IndexedDB offline item directly to PC disk
  async exportToDisk(id: string, fallbackStreamUrl?: string, fallbackFilename?: string): Promise<boolean> {
    const item = await this.getDownload(id);
    const safeTitle = (item?.title || 'video').replace(/[^a-zA-Z0-9_\-\. ]/g, '').trim().replace(/\s+/g, '_');
    const filename = fallbackFilename || ((item?.season !== undefined && item?.episode !== undefined)
      ? `${safeTitle}_S${String(item.season).padStart(2, '0')}E${String(item.episode).padStart(2, '0')}_${item?.quality || '1080p'}.mp4`
      : `${safeTitle}_${item?.quality || '1080p'}.mp4`);

    if (item && item.blob && item.blob.size > 0) {
      const blobUrl = URL.createObjectURL(item.blob);
      this.triggerBrowserDownload(blobUrl, filename);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 60000);
      return true;
    }

    if (fallbackStreamUrl) {
      this.triggerBrowserDownload(fallbackStreamUrl, filename);
      return true;
    }

    return false;
  }

  // Obtain playable Blob URL for offline player
  async getOfflinePlaybackUrl(id: string): Promise<string | null> {
    if (this.objectUrls.has(id)) {
      return this.objectUrls.get(id)!;
    }

    const item = await this.getDownload(id);
    if (!item || !item.blob) return null;

    try {
      const url = URL.createObjectURL(item.blob);
      this.objectUrls.set(id, url);
      return url;
    } catch (e) {
      console.error('[DownloadService] Failed to create object URL:', e);
      return null;
    }
  }

  // Start download (In-App Offline IndexedDB or Direct Disk file save)
  async startDownload(opts: StartDownloadOptions): Promise<DownloadedItem> {
    const id = this.getDownloadId(opts.contentId, opts.mediaType, opts.season, opts.episode);
    const quality = opts.quality || '1080p'; // Default to 1080p as requested
    const mode = opts.mode || 'offline';

    // Check if already downloading or completed
    const existing = await this.getDownload(id);
    if (existing && existing.status === 'completed' && existing.blob) {
      if (mode === 'disk') {
        await this.exportToDisk(id);
      }
      return existing;
    }

    // Step 1: Resolve download metadata and size metrics from backend
    const resolution: DownloadResolution = await api.resolveDownload(opts.contentId, opts.mediaType, {
      season: opts.season,
      episode: opts.episode,
      title: opts.title,
      duration: opts.duration
    });

    const chosenQuality = resolution.qualities.find((q) => q.quality === quality) || resolution.qualities[0];
    const safeTitle = opts.title.replace(/[^a-zA-Z0-9_\-\. ]/g, '').trim().replace(/\s+/g, '_');
    const filename = (opts.season !== undefined && opts.episode !== undefined)
      ? `${safeTitle}_S${String(opts.season).padStart(2, '0')}E${String(opts.episode).padStart(2, '0')}_${quality}.mp4`
      : `${safeTitle}_${quality}.mp4`;

    const backendBase = getBackendBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
    let downloadStreamUrl = chosenQuality?.streamProxyUrl
      ? (chosenQuality.streamProxyUrl.startsWith('http') ? chosenQuality.streamProxyUrl : `${backendBase}${chosenQuality.streamProxyUrl}`)
      : (chosenQuality?.url ? api.getDownloadStreamUrl(chosenQuality.url, filename) : '');

    // Client-side stream fallback if backend could not reach upstream provider (e.g. cloud host IP blocked)
    if (!downloadStreamUrl || !chosenQuality?.url) {
      try {
        const clientRes = await api.resolvePlayback(opts.contentId, opts.mediaType, opts.season, opts.episode, opts.title);
        if (clientRes && clientRes.sources && clientRes.sources.length > 0) {
          const directSrc = clientRes.sources[0].url;
          downloadStreamUrl = api.getDownloadStreamUrl(directSrc, filename);
        }
      } catch (err) {
        console.warn('[DownloadService] Client stream resolution fallback failed:', err);
      }
    }

    // High-definition reliable stream fallback so local download NEVER fails with empty stream error
    if (!downloadStreamUrl) {
      const fallbackUrl = `https://api.framextv.tech/api/stream?id=${encodeURIComponent(opts.contentId)}&type=${opts.mediaType === 'tv' ? 'tv' : 'movie'}&provider=bowler`;
      downloadStreamUrl = api.getDownloadStreamUrl(fallbackUrl, filename);
    }

    const item: DownloadedItem = {
      id,
      contentId: opts.contentId,
      mediaType: opts.mediaType,
      title: opts.title,
      poster: opts.poster,
      backdrop: opts.backdrop,
      season: opts.season,
      episode: opts.episode,
      episodeName: opts.episodeName,
      quality,
      sizeBytes: chosenQuality ? chosenQuality.sizeBytes : 0,
      formattedSize: chosenQuality ? chosenQuality.formattedSize : 'Calculating...',
      createdAt: new Date().toISOString(),
      status: 'downloading',
      progressPercent: 0
    };

    await this.saveItem(item);
    this.notifyProgress(item);

    // If user clicked direct disk download, trigger native browser save immediately
    if (mode === 'disk') {
      const targetUrl = downloadStreamUrl || chosenQuality?.url;
      if (targetUrl) {
        this.triggerBrowserDownload(targetUrl, filename);
      }
      item.status = 'completed';
      item.progressPercent = 100;
      await this.saveItem(item);
      this.notifyProgress(item);
      return item;
    }

    // Mode: Offline in-app storage (IndexedDB chunk accumulator)
    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);

    // Run async chunked download in background without blocking caller
    (async () => {
      try {
        const streamUrlToFetch = downloadStreamUrl || chosenQuality?.url;
        if (!streamUrlToFetch) {
          throw new Error('No stream URL available for download');
        }

        const res = await fetch(streamUrlToFetch, {
          signal: abortController.signal
        });

        if (!res.ok && res.status !== 206) {
          throw new Error(`Download server responded with HTTP ${res.status}`);
        }

        const totalBytes = Number(res.headers.get('content-length')) || item.sizeBytes || 100 * 1024 * 1024;
        if (totalBytes > 0 && totalBytes !== item.sizeBytes) {
          item.sizeBytes = totalBytes;
          item.formattedSize = this.formatBytes(totalBytes);
        }

        const reader = res.body?.getReader();
        if (!reader) {
          // If stream reader not supported, fallback to whole blob
          const fullBlob = await res.blob();
          item.blob = fullBlob;
          item.sizeBytes = fullBlob.size;
          item.formattedSize = this.formatBytes(fullBlob.size);
          item.status = 'completed';
          item.progressPercent = 100;
          await this.saveItem(item);
          this.notifyProgress(item);
          return;
        }

        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;
        let lastTime = Date.now();
        let lastReceived = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            receivedBytes += value.length;

            const now = Date.now();
            if (now - lastTime >= 500) {
              const deltaBytes = receivedBytes - lastReceived;
              const deltaTime = (now - lastTime) / 1000;
              const speedBytesSec = deltaBytes / deltaTime;
              item.downloadSpeed = `${this.formatBytes(speedBytesSec)}/s`;
              lastTime = now;
              lastReceived = receivedBytes;

              const percent = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
              item.progressPercent = percent;
              await this.saveItem(item);
              this.notifyProgress(item);
            }
          }
        }

        const finalBlob = new Blob(chunks as any[], { type: 'video/mp4' });
        item.blob = finalBlob;
        item.sizeBytes = finalBlob.size;
        item.formattedSize = this.formatBytes(finalBlob.size);
        item.status = 'completed';
        item.progressPercent = 100;
        item.downloadSpeed = undefined;
        await this.saveItem(item);
        this.notifyProgress(item);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log(`[DownloadService] Download ${id} aborted`);
          item.status = 'paused';
        } else {
          console.error(`[DownloadService] Download ${id} error:`, err);
          item.status = 'error';
          item.error = err?.message || 'Download failed';
        }
        await this.saveItem(item);
        this.notifyProgress(item);
      } finally {
        this.abortControllers.delete(id);
      }
    })();

    return item;
  }
}

export const downloadService = new DownloadService();
