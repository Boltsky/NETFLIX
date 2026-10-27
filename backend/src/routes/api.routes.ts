import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller.js';

const router = Router();

// Health
router.get('/health', CatalogController.getHealth);

// Catalog
router.get('/catalog/home', CatalogController.getHome);
router.get('/catalog/search', CatalogController.search);

// Titles & Seasons
router.get('/titles/:id', CatalogController.getTitleDetails);
router.get('/titles/:id/episodes', CatalogController.getEpisodes);
router.get('/seasons/:id/episodes', CatalogController.getEpisodes);

// Playback Resolution
router.get('/playback/resolve', CatalogController.resolvePlayback);
router.post('/playback/resolve', CatalogController.resolvePlayback);

// Profiles
router.get('/users/me/profiles', CatalogController.getProfiles);

// Watchlist
router.get('/users/me/watchlist', CatalogController.getWatchlist);
router.post('/users/me/watchlist', CatalogController.addToWatchlist);
router.delete('/users/me/watchlist/:contentId', CatalogController.removeFromWatchlist);

// Viewing Progress
router.get('/users/me/progress', CatalogController.getProgress);
router.put('/users/me/progress/:contentId', CatalogController.saveProgress);

// Settings
router.get('/settings', CatalogController.getSettings);
router.post('/settings', CatalogController.updateSetting);

export default router;
