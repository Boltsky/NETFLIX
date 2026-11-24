"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_controller_js_1 = require("../controllers/catalog.controller.js");
const analytics_controller_js_1 = require("../controllers/analytics.controller.js");
const router = (0, express_1.Router)();
// Health
router.get('/health', catalog_controller_js_1.CatalogController.getHealth);
// Catalog
router.get('/catalog/home', catalog_controller_js_1.CatalogController.getHome);
router.get('/catalog/category', catalog_controller_js_1.CatalogController.getCategory);
router.get('/catalog/search', catalog_controller_js_1.CatalogController.search);
// Titles & Seasons
router.get('/titles/:id', catalog_controller_js_1.CatalogController.getTitleDetails);
router.get('/titles/:id/episodes', catalog_controller_js_1.CatalogController.getEpisodes);
router.get('/seasons/:id/episodes', catalog_controller_js_1.CatalogController.getEpisodes);
// Playback Resolution
router.get('/playback/resolve', catalog_controller_js_1.CatalogController.resolvePlayback);
router.post('/playback/resolve', catalog_controller_js_1.CatalogController.resolvePlayback);
// Video Download Resolution & Streaming Bridge
router.get('/download/resolve', catalog_controller_js_1.CatalogController.resolveDownload);
router.post('/download/resolve', catalog_controller_js_1.CatalogController.resolveDownload);
router.get('/download/stream', catalog_controller_js_1.CatalogController.streamDownload);
// Profiles
router.get('/users/me/profiles', catalog_controller_js_1.CatalogController.getProfiles);
// Watchlist
router.get('/users/me/watchlist', catalog_controller_js_1.CatalogController.getWatchlist);
router.post('/users/me/watchlist', catalog_controller_js_1.CatalogController.addToWatchlist);
router.delete('/users/me/watchlist/:contentId', catalog_controller_js_1.CatalogController.removeFromWatchlist);
// Viewing Progress
router.get('/users/me/progress', catalog_controller_js_1.CatalogController.getProgress);
router.put('/users/me/progress/:contentId', catalog_controller_js_1.CatalogController.saveProgress);
// Settings
router.get('/settings', catalog_controller_js_1.CatalogController.getSettings);
router.post('/settings', catalog_controller_js_1.CatalogController.updateSetting);
// Subtitles CORS Proxy
router.get('/subtitles/proxy', catalog_controller_js_1.CatalogController.proxySubtitle);
// Visitor Analytics (Anonymous telemetry & audience dashboard)
router.post('/analytics/visit', analytics_controller_js_1.AnalyticsController.recordVisit);
router.post('/analytics/verify', analytics_controller_js_1.AnalyticsController.verifyPassword);
router.get('/analytics/stats', analytics_controller_js_1.AnalyticsController.getStats);
router.get('/analytics/account', analytics_controller_js_1.AnalyticsController.getAccount);
router.post('/analytics/account', analytics_controller_js_1.AnalyticsController.updateAccount);
router.put('/analytics/account', analytics_controller_js_1.AnalyticsController.updateAccount);
exports.default = router;
