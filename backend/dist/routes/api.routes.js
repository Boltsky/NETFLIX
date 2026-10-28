"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalog_controller_js_1 = require("../controllers/catalog.controller.js");
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
exports.default = router;
