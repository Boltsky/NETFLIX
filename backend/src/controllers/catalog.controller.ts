import { Request, Response } from 'express';
import { Readable } from 'stream';
import { FrameXTVAdapter } from '../providers/framextv.adapter.js';
import { db } from '../db/database.js';
import { DownloadQualityOption } from '../types/index.js';

const provider = new FrameXTVAdapter();

export class CatalogController {
  static async getHealth(req: Request, res: Response) {
    const upstream = await provider.checkHealth();
    res.json({
      status: 'ok',
      service: 'CineWave TV Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      upstream: {
        provider: provider.name,
        connected: upstream
      }
    });
  }

  static async getHome(req: Request, res: Response) {
    try {
      const catalog = await provider.getHomeCatalog();
      res.json({
        success: true,
        data: catalog
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve home catalog'
      });
    }
  }

  static async getCategory(req: Request, res: Response) {
    try {
      const category = req.query.category
        ? String(req.query.category)
        : req.query.c
        ? String(req.query.c)
        : req.query.genreId
        ? ''
        : 'popular';
      const genreId = req.query.genreId ? Number(req.query.genreId) : undefined;
      const type = (req.query.type as any) || undefined;
      const page = req.query.page ? Number(req.query.page) : 1;

      const data = await provider.getCategory({ category, genreId, type, page });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve category items'
      });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const q = String(req.query.q || '');
      const results = await provider.search(q);
      res.json({
        success: true,
        query: q,
        count: results.length,
        results
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Search failed'
      });
    }
  }

  static async getTitleDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const type = (req.query.type as any) || 'movie';
      const details = await provider.getTitleDetails(id, type);
      res.json({
        success: true,
        data: details
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error: err.message || `Title ${req.params.id} not found`
      });
    }
  }

  static async getEpisodes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const season = parseInt(String(req.query.season || '1'), 10);
      const episodes = await provider.getSeasonEpisodes(id, season);
      res.json({
        success: true,
        contentId: id,
        season,
        count: episodes.length,
        episodes
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve episodes'
      });
    }
  }

  static async resolvePlayback(req: Request, res: Response) {
    try {
      const contentId = (req.query.contentId as string) || req.body?.contentId;
      const type = ((req.query.type as string) || req.body?.type || 'movie') as 'movie' | 'tv' | 'anime';
      const season = req.query.season ? parseInt(String(req.query.season), 10) : (req.body?.season ? parseInt(String(req.body.season), 10) : undefined);
      const episode = req.query.episode ? parseInt(String(req.query.episode), 10) : (req.body?.episode ? parseInt(String(req.body.episode), 10) : undefined);

      if (!contentId) {
        return res.status(400).json({
          success: false,
          error: 'contentId is required'
        });
      }
      const resolution = await provider.resolvePlayback(
        String(contentId),
        type,
        season,
        episode
      );
      res.json(resolution);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Playback resolution failed'
      });
    }
  }

  // Profile endpoints
  static getProfiles(req: Request, res: Response) {
    const profiles = db.getProfiles();
    res.json({ success: true, profiles });
  }

  // Watchlist endpoints
  static getWatchlist(req: Request, res: Response) {
    const profileId = String(req.query.profileId || 'default-profile');
    const watchlist = db.getWatchlist(profileId);
    res.json({ success: true, profileId, count: watchlist.length, items: watchlist });
  }

  static addToWatchlist(req: Request, res: Response) {
    const { profileId = 'default-profile', contentId, mediaType, title, poster, year, rating } = req.body;
    if (!contentId || !title) {
      return res.status(400).json({ success: false, error: 'contentId and title are required' });
    }
    const item = db.addToWatchlist({
      profileId,
      contentId: String(contentId),
      mediaType: mediaType || 'movie',
      title,
      poster,
      year,
      rating
    });
    res.json({ success: true, item });
  }

  static removeFromWatchlist(req: Request, res: Response) {
    const { contentId } = req.params;
    const profileId = String(req.query.profileId || 'default-profile');
    const removed = db.removeFromWatchlist(profileId, contentId);
    res.json({ success: true, removed });
  }

  // Progress endpoints
  static getProgress(req: Request, res: Response) {
    const profileId = String(req.query.profileId || 'default-profile');
    const progressList = db.getProgress(profileId);
    res.json({ success: true, profileId, count: progressList.length, progress: progressList });
  }

  static saveProgress(req: Request, res: Response) {
    const { contentId } = req.params;
    const profileId = String(req.body?.profileId || req.query.profileId || 'bolt');
    const mediaType = (req.body?.mediaType || req.query.mediaType || 'movie') as 'movie' | 'tv' | 'anime';
    const season = req.body?.season !== undefined ? Number(req.body.season) : (req.query.season ? Number(req.query.season) : undefined);
    const episode = req.body?.episode !== undefined ? Number(req.body.episode) : (req.query.episode ? Number(req.query.episode) : undefined);
    const positionMs = Number(req.body?.positionMs ?? req.query.pos ?? req.query.positionMs ?? 0);
    const durationMs = Number(req.body?.durationMs ?? req.query.dur ?? req.query.durationMs ?? 0);
    const title = String(req.body?.title || req.query.title || 'Untitled');
    const poster = (req.body?.poster || req.query.poster) as string | undefined;

    const saved = db.saveProgress({
      profileId,
      contentId: String(contentId),
      mediaType,
      season,
      episode,
      positionMs,
      durationMs,
      title,
      poster
    });

    res.json({ success: true, progress: saved });
  }

  // Settings
  static getSettings(req: Request, res: Response) {
    res.json({ success: true, settings: db.getSettings() });
  }

  static updateSetting(req: Request, res: Response) {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: 'key and value required' });
    }
    db.setSetting(key, String(value));
    res.json({ success: true, settings: db.getSettings() });
  }

  // Subtitle CORS Proxy
  static async proxySubtitle(req: Request, res: Response) {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).send('Missing url parameter');
      }
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).send('Invalid protocol');
      }
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch upstream subtitle');
      }
      const text = await response.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(text);
    } catch (err: any) {
      res.status(500).send('Subtitle proxy error: ' + (err?.message || 'unknown error'));
    }
  }

  // Format byte counts into human-readable strings
  static formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(0) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  // Download Resolution endpoint: returns available qualities, file sizes (exact or estimated), and stream proxy URLs
  static async resolveDownload(req: Request, res: Response) {
    try {
      const contentId = (req.query.contentId as string) || req.body?.contentId;
      const type = ((req.query.type as string) || req.body?.type || 'movie') as 'movie' | 'tv' | 'anime';
      const season = req.query.season ? parseInt(String(req.query.season), 10) : (req.body?.season ? parseInt(String(req.body.season), 10) : undefined);
      const episode = req.query.episode ? parseInt(String(req.query.episode), 10) : (req.body?.episode ? parseInt(String(req.body.episode), 10) : undefined);
      const title = (req.query.title as string) || req.body?.title || 'Video';
      const rawDuration = req.query.duration ? parseInt(String(req.query.duration), 10) : (req.body?.duration ? parseInt(String(req.body.duration), 10) : undefined);
      const durationMinutes = rawDuration && rawDuration > 0 ? rawDuration : (type === 'tv' ? 45 : 105);

      if (!contentId) {
        return res.status(400).json({
          success: false,
          error: 'contentId is required'
        });
      }

      const resolution = await provider.resolvePlayback(
        String(contentId),
        type,
        season,
        episode
      );

      let sources = resolution.sources || [];

      // If primary upstream returned no direct sources, query alternate stream providers
      if (sources.length === 0) {
        const alternates = ['bowler', 'giant', 'executioner'];
        const backends = ['https://api.framextv.tech', 'https://api.framextv.xyz', 'https://api.framextv.cc'];
        for (const alt of alternates) {
          try {
            let altPath = `/api/stream?id=${encodeURIComponent(contentId)}&type=${type === 'tv' ? 'tv' : 'movie'}&provider=${alt}`;
            if (type === 'tv') altPath += `&season=${season || 1}&episode=${episode || 1}`;
            for (const b of backends) {
              try {
                const altRes = await fetch(`${b}${altPath}`, {
                  headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://framextv.cc/'
                  },
                  signal: AbortSignal.timeout(2500)
                });
                if (altRes.ok) {
                  const altData: any = await altRes.json();
                  if (altData && altData.success && Array.isArray(altData.sources) && altData.sources.length > 0) {
                    sources = altData.sources.map((s: any) => ({
                      url: s.url,
                      quality: s.quality || '1080p',
                      type: s.type || 'hls',
                      server: s.server || alt
                    }));
                    break;
                  }
                }
              } catch {}
            }
            if (sources.length > 0) break;
          } catch {}
        }
      }

      // If still empty, supply the direct stream resolver URL so streamProxyUrl is always populated
      if (sources.length === 0) {
        const fallbackResolverUrl = `https://api.framextv.tech/api/stream?id=${encodeURIComponent(contentId)}&type=${type === 'tv' ? 'tv' : 'movie'}${type === 'tv' ? `&season=${season || 1}&episode=${episode || 1}` : ''}&provider=bowler`;
        sources = [
          { url: fallbackResolverUrl, quality: '1080p', type: 'hls', server: 'Bowler' },
          { url: fallbackResolverUrl, quality: '720p', type: 'hls', server: 'Bowler' }
        ];
      }

      const safeTitle = title.replace(/[^a-zA-Z0-9_\-\. ]/g, '').trim().replace(/\s+/g, '_');
      const baseFilename = (season !== undefined && episode !== undefined)
        ? `${safeTitle}_S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`
        : safeTitle;

      // Quality tiers configuration with default bitrates (1080p Full HD default)
      const qualityConfigs = [
        { quality: '1080p', label: '1080p (Full HD)', bytesPerMin: 18 * 1024 * 1024 }, // ~2.4 Mbps (~1.8 GB for 100m)
        { quality: '720p', label: '720p (Standard HD)', bytesPerMin: 9 * 1024 * 1024 },  // ~1.2 Mbps (~900 MB for 100m)
        { quality: '480p', label: '480p (Data Saver)', bytesPerMin: 4.5 * 1024 * 1024 }  // ~0.6 Mbps (~450 MB for 100m)
      ];

      const qualities: DownloadQualityOption[] = [];

      for (const config of qualityConfigs) {
        // Find matching direct source or first available
        const matchedSource = sources.find(s => s.quality === config.quality) || sources[0];
        let url = matchedSource ? matchedSource.url : '';
        let isEstimated = true;
        let sizeBytes = Math.round(durationMinutes * config.bytesPerMin);

        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          try {
            // Attempt fast HEAD probe to obtain exact Content-Length
            const headRes = await fetch(url, {
              method: 'HEAD',
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              signal: AbortSignal.timeout(1800)
            });
            const cl = headRes.headers.get('content-length');
            if (cl) {
              const parsedCl = parseInt(cl, 10);
              if (parsedCl > 5000000) {
                sizeBytes = parsedCl;
                isEstimated = false;
              }
            }
          } catch {
            // Use estimated duration-based calculation
          }
        }

        const filename = `${baseFilename}_${config.quality}.mp4`;
        const streamProxyUrl = url 
          ? `/api/v1/download/stream?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
          : '';

        qualities.push({
          quality: config.quality,
          label: config.label,
          sizeBytes,
          formattedSize: CatalogController.formatBytes(sizeBytes),
          isEstimated,
          url,
          streamProxyUrl
        });
      }

      res.json({
        success: true,
        contentId: String(contentId),
        type,
        title,
        season,
        episode,
        defaultQuality: '1080p',
        qualities,
        downloadFilename: `${baseFilename}_1080p.mp4`
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Download resolution failed'
      });
    }
  }

  // Stream Proxy endpoint: pipes video stream with Content-Disposition: attachment for direct file saving & CORS-free chunking
  static async streamDownload(req: Request, res: Response) {
    try {
      const url = req.query.url as string;
      const filename = (req.query.filename as string) || 'video.mp4';

      if (!url) {
        return res.status(400).send('Missing url parameter');
      }

      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).send('Invalid protocol');
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      };

      if (req.headers.range) {
        headers['Range'] = String(req.headers.range);
      }

      const abortController = new AbortController();
      req.on('close', () => {
        abortController.abort();
      });

      let targetUrl = url;

      // If url is a stream resolver API endpoint, resolve target stream URL first
      if (url.includes('/api/stream')) {
        try {
          const apiRes = await fetch(url, { headers, signal: abortController.signal });
          if (apiRes.ok) {
            const apiData: any = await apiRes.json();
            if (apiData && apiData.success && Array.isArray(apiData.sources) && apiData.sources.length > 0) {
              targetUrl = apiData.sources[0].url;
            }
          }
        } catch {}
      }

      const response = await fetch(targetUrl, {
        headers,
        signal: abortController.signal
      });

      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send(`Upstream download server returned HTTP ${response.status}`);
      }

      // Check if upstream is an HLS playlist (.m3u8)
      const rawContentType = (response.headers.get('content-type') || '').toLowerCase();
      const isM3U8 = targetUrl.includes('.m3u8') || rawContentType.includes('mpegurl') || rawContentType.includes('x-mpegurl');

      if (isM3U8) {
        const playlistText = await response.text();
        let mediaPlaylistUrl = targetUrl;
        let mediaText = playlistText;

        // If master playlist with variant streams, pick the highest quality or first media playlist
        if (playlistText.includes('#EXT-X-STREAM-INF')) {
          const lines = playlistText.split('\n');
          let bestVariantUrl = '';
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXT-X-STREAM-INF')) {
              for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('#')) {
                  bestVariantUrl = new URL(nextLine, targetUrl).href;
                  break;
                }
              }
              if (bestVariantUrl) break;
            }
          }
          if (bestVariantUrl) {
            mediaPlaylistUrl = bestVariantUrl;
            const subRes = await fetch(bestVariantUrl, { headers, signal: abortController.signal });
            if (subRes.ok) {
              mediaText = await subRes.text();
            }
          }
        }

        // Extract segment URLs
        const segmentUrls: string[] = [];
        const lines = mediaText.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            try {
              segmentUrls.push(new URL(trimmed, mediaPlaylistUrl).href);
            } catch {}
          }
        }

        res.status(200);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Accept-Ranges');

        for (const segUrl of segmentUrls) {
          if (abortController.signal.aborted) break;
          try {
            const segRes = await fetch(segUrl, {
              headers: {
                ...headers,
                'Referer': new URL(mediaPlaylistUrl).origin
              },
              signal: abortController.signal
            });
            if (segRes.ok && segRes.body) {
              const segBuffer = await segRes.arrayBuffer();
              res.write(Buffer.from(segBuffer));
            }
          } catch (e: any) {
            if (e.name === 'AbortError') break;
          }
        }
        res.end();
        return;
      }

      // Forward relevant headers for direct video streams
      const contentType = response.headers.get('content-type') || 'video/mp4';
      const contentLength = response.headers.get('content-length');
      const contentRange = response.headers.get('content-range');
      const acceptRanges = response.headers.get('accept-ranges') || 'bytes';

      res.status(response.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', acceptRanges);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Disposition, Accept-Ranges');

      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }

      if (response.body) {
        Readable.fromWeb(response.body as any).pipe(res);
      } else {
        res.end();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      if (!res.headersSent) {
        res.status(500).send('Download stream proxy error: ' + (err?.message || 'unknown error'));
      }
    }
  }
}
