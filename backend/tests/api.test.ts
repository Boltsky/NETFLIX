import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('CineWave TV Backend API Tests', () => {
  it('GET /api/v1/health should return ok status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('CineWave TV Backend');
    expect(res.body.upstream).toBeDefined();
  });

  it('GET /api/v1/catalog/home should return hero and rails', async () => {
    const res = await request(app).get('/api/v1/catalog/home');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rails).toBeInstanceOf(Array);
    expect(res.body.data.rails.length).toBeGreaterThan(0);
  }, 10000);

  it('GET /api/v1/catalog/search should return search results', async () => {
    const res = await request(app).get('/api/v1/catalog/search?q=fight');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toBeInstanceOf(Array);
  }, 10000);

  it('GET /api/v1/catalog/category should return paginated category movies', async () => {
    const res = await request(app).get('/api/v1/catalog/category?category=trending&page=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.results).toBeInstanceOf(Array);
    expect(res.body.results.length).toBeGreaterThan(0);
  }, 10000);

  it('GET /api/v1/catalog/category should return genre movies by genreId', async () => {
    const res = await request(app).get('/api/v1/catalog/category?genreId=28&page=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toBeInstanceOf(Array);
    expect(res.body.results.length).toBeGreaterThan(0);
  }, 10000);

  it('GET /api/v1/titles/:id should return details', async () => {
    const res = await request(app).get('/api/v1/titles/550?type=movie');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBeDefined();
    expect(res.body.data.cast).toBeInstanceOf(Array);
  }, 10000);

  it('POST /api/v1/playback/resolve should return stream and embed sources', async () => {
    const res = await request(app)
      .post('/api/v1/playback/resolve')
      .send({ contentId: '550', type: 'movie' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sources).toBeInstanceOf(Array);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.embedUrl).toContain('framextv.cc/embed/550');
    expect(res.body.embedServers).toBeInstanceOf(Array);
    expect(res.body.embedServers[0].name).toContain('FrameX');
    expect(res.body.embedServers[1].name).toContain('AutoEmbed');
    expect(res.body.embedServers[4].name).toContain('VidSrc');
  }, 10000);

  it('GET /api/v1/playback/resolve should return stream and embed sources via query params', async () => {
    const res = await request(app)
      .get('/api/v1/playback/resolve?contentId=550&type=movie');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sources).toBeInstanceOf(Array);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.embedUrl).toContain('framextv.cc/embed/550');
    expect(res.body.embedServers).toBeInstanceOf(Array);
    expect(res.body.embedServers[0].name).toContain('FrameX');
    expect(res.body.embedServers[1].name).toContain('AutoEmbed');
    expect(res.body.embedServers[4].name).toContain('VidSrc');
  }, 10000);

  it('Watchlist CRUD operations should succeed and persist', async () => {
    const testItem = {
      profileId: 'test-profile',
      contentId: 'test-101',
      mediaType: 'movie',
      title: 'Test Movie',
      poster: 'https://example.com/poster.jpg'
    };

    // Add
    const addRes = await request(app).post('/api/v1/users/me/watchlist').send(testItem);
    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);

    // Get
    const getRes = await request(app).get('/api/v1/users/me/watchlist?profileId=test-profile');
    expect(getRes.status).toBe(200);
    expect(getRes.body.items.some((i: any) => i.contentId === 'test-101')).toBe(true);

    // Remove
    const delRes = await request(app).delete('/api/v1/users/me/watchlist/test-101?profileId=test-profile');
    expect(delRes.status).toBe(200);
    expect(delRes.body.removed).toBe(true);
  });

  it('Progress Save & Retrieve operations should succeed and persist', async () => {
    const progressData = {
      profileId: 'test-profile',
      mediaType: 'movie',
      positionMs: 65000,
      durationMs: 7200000,
      title: 'Progress Test Title'
    };

    const putRes = await request(app)
      .put('/api/v1/users/me/progress/prog-101')
      .send(progressData);
    expect(putRes.status).toBe(200);
    expect(putRes.body.success).toBe(true);

    const getRes = await request(app).get('/api/v1/users/me/progress?profileId=test-profile');
    expect(getRes.status).toBe(200);
    expect(getRes.body.progress.some((p: any) => p.contentId === 'prog-101')).toBe(true);
  });

  it('POST /api/v1/analytics/visit should record visitor telemetry anonymously with OS and duration', async () => {
    const payload = {
      visitorId: 'test-visitor-123',
      sessionId: 'test-session-456',
      device: 'mobile',
      os: 'iOS',
      screen: 'home',
      timezone: 'Africa/Kampala',
      language: 'en-US',
      durationSec: 185
    };

    const res = await request(app)
      .post('/api/v1/analytics/visit')
      .set('cf-ipcountry', 'UG')
      .set('cf-ipcity', 'Kampala')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/analytics/stats should reject unauthorized access without admin password', async () => {
    const res = await request(app).get('/api/v1/analytics/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/analytics/verify should validate admin password', async () => {
    const badRes = await request(app)
      .post('/api/v1/analytics/verify')
      .send({ password: 'wrongpassword' });
    expect(badRes.status).toBe(401);
    expect(badRes.body.success).toBe(false);

    const goodRes = await request(app)
      .post('/api/v1/analytics/verify')
      .send({ password: 'bolt2026' });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.success).toBe(true);
  });

  it('GET /api/v1/analytics/stats should return aggregated visitor, location, OS, and time spent statistics with valid password', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/stats')
      .set('x-admin-key', 'bolt2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalVisits).toBeGreaterThanOrEqual(1);
    expect(res.body.data.summary.uniqueVisitors).toBeGreaterThanOrEqual(1);
    expect(res.body.data.summary.avgTimeSpentFormatted).toBeDefined();
    expect(typeof res.body.data.summary.avgTimeSpentSec).toBe('number');
    expect(res.body.data.osBreakdown).toBeInstanceOf(Array);
    expect(res.body.data.osBreakdown.some((o: any) => o.os === 'iOS')).toBe(true);
    expect(res.body.data.devices).toBeDefined();
    expect(res.body.data.topCountries).toBeInstanceOf(Array);
    expect(res.body.data.topCities).toBeInstanceOf(Array);
    expect(res.body.data.recentVisits).toBeInstanceOf(Array);
    expect(res.body.data.recentVisits[0].timeVisited).toBeDefined();
    expect(res.body.data.recentVisits[0].timeSpentFormatted).toBeDefined();
  });

  it('should track movie playback and include in topTitles and recentWatchedMovies with query param key', async () => {
    const moviePayload = {
      visitorId: 'test-visitor-movie',
      sessionId: 'test-session-movie',
      device: 'desktop',
      os: 'Windows',
      screen: 'player',
      titleName: 'The Notebook',
      titleId: 11036,
      durationSec: 120
    };

    const visitRes = await request(app)
      .post('/api/v1/analytics/visit')
      .send(moviePayload);
    expect(visitRes.status).toBe(200);

    // Verify retrieval via ?key=bolt2026 query param
    const statsRes = await request(app)
      .get('/api/v1/analytics/stats?key=bolt2026');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data.topTitles.some((t: any) => t.title === 'The Notebook')).toBe(true);
    expect(statsRes.body.data.recentWatchedMovies.some((m: any) => m.title === 'The Notebook')).toBe(true);
  });
});
