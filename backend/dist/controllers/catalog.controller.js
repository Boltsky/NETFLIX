"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const framextv_adapter_js_1 = require("../providers/framextv.adapter.js");
const database_js_1 = require("../db/database.js");
const provider = new framextv_adapter_js_1.FrameXTVAdapter();
class CatalogController {
    static async getHealth(req, res) {
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
    static async getHome(req, res) {
        try {
            const catalog = await provider.getHomeCatalog();
            res.json({
                success: true,
                data: catalog
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Failed to retrieve home catalog'
            });
        }
    }
    static async search(req, res) {
        try {
            const q = String(req.query.q || '');
            const results = await provider.search(q);
            res.json({
                success: true,
                query: q,
                count: results.length,
                results
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Search failed'
            });
        }
    }
    static async getTitleDetails(req, res) {
        try {
            const { id } = req.params;
            const type = req.query.type || 'movie';
            const details = await provider.getTitleDetails(id, type);
            res.json({
                success: true,
                data: details
            });
        }
        catch (err) {
            res.status(404).json({
                success: false,
                error: err.message || `Title ${req.params.id} not found`
            });
        }
    }
    static async getEpisodes(req, res) {
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
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Failed to retrieve episodes'
            });
        }
    }
    static async resolvePlayback(req, res) {
        try {
            const contentId = req.query.contentId || req.body?.contentId;
            const type = (req.query.type || req.body?.type || 'movie');
            const season = req.query.season ? parseInt(String(req.query.season), 10) : (req.body?.season ? parseInt(String(req.body.season), 10) : undefined);
            const episode = req.query.episode ? parseInt(String(req.query.episode), 10) : (req.body?.episode ? parseInt(String(req.body.episode), 10) : undefined);
            if (!contentId) {
                return res.status(400).json({
                    success: false,
                    error: 'contentId is required'
                });
            }
            const resolution = await provider.resolvePlayback(String(contentId), type, season, episode);
            res.json(resolution);
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message || 'Playback resolution failed'
            });
        }
    }
    // Profile endpoints
    static getProfiles(req, res) {
        const profiles = database_js_1.db.getProfiles();
        res.json({ success: true, profiles });
    }
    // Watchlist endpoints
    static getWatchlist(req, res) {
        const profileId = String(req.query.profileId || 'default-profile');
        const watchlist = database_js_1.db.getWatchlist(profileId);
        res.json({ success: true, profileId, count: watchlist.length, items: watchlist });
    }
    static addToWatchlist(req, res) {
        const { profileId = 'default-profile', contentId, mediaType, title, poster, year, rating } = req.body;
        if (!contentId || !title) {
            return res.status(400).json({ success: false, error: 'contentId and title are required' });
        }
        const item = database_js_1.db.addToWatchlist({
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
    static removeFromWatchlist(req, res) {
        const { contentId } = req.params;
        const profileId = String(req.query.profileId || 'default-profile');
        const removed = database_js_1.db.removeFromWatchlist(profileId, contentId);
        res.json({ success: true, removed });
    }
    // Progress endpoints
    static getProgress(req, res) {
        const profileId = String(req.query.profileId || 'default-profile');
        const progressList = database_js_1.db.getProgress(profileId);
        res.json({ success: true, profileId, count: progressList.length, progress: progressList });
    }
    static saveProgress(req, res) {
        const { contentId } = req.params;
        const { profileId = 'default-profile', mediaType = 'movie', season, episode, positionMs = 0, durationMs = 0, title = 'Untitled', poster } = req.body;
        const saved = database_js_1.db.saveProgress({
            profileId,
            contentId: String(contentId),
            mediaType,
            season: season !== undefined ? Number(season) : undefined,
            episode: episode !== undefined ? Number(episode) : undefined,
            positionMs: Number(positionMs),
            durationMs: Number(durationMs),
            title,
            poster
        });
        res.json({ success: true, progress: saved });
    }
    // Settings
    static getSettings(req, res) {
        res.json({ success: true, settings: database_js_1.db.getSettings() });
    }
    static updateSetting(req, res) {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ success: false, error: 'key and value required' });
        }
        database_js_1.db.setSetting(key, String(value));
        res.json({ success: true, settings: database_js_1.db.getSettings() });
    }
}
exports.CatalogController = CatalogController;
