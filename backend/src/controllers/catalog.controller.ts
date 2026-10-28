import { Request, Response } from 'express';
import { FrameXTVAdapter } from '../providers/framextv.adapter.js';
import { db } from '../db/database.js';

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
}
