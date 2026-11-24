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

  it('GET /api/v1/download/resolve should return size metrics and 1080p default quality', async () => {
    const res = await request(app)
      .get('/api/v1/download/resolve?contentId=550&type=movie&title=Fight+Club&duration=139');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.defaultQuality).toBe('1080p');
    expect(res.body.qualities).toBeInstanceOf(Array);
    expect(res.body.qualities.length).toBeGreaterThanOrEqual(2);
    
    // Check 1080p quality option and pre-download size metrics
    const q1080 = res.body.qualities.find((q: any) => q.quality === '1080p');
    expect(q1080).toBeDefined();
    expect(q1080.sizeBytes).toBeGreaterThan(0);
    expect(q1080.formattedSize).toBeDefined();
    expect(typeof q1080.formattedSize).toBe('string');
    expect(res.body.downloadFilename).toContain('Fight_Club');
  }, 10000);

  it('GET /api/v1/download/stream should validate url parameter', async () => {
    const res = await request(app).get('/api/v1/download/stream');
    expect(res.status).toBe(400);
  });

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
    expect(statsRes.body.data.users).toBeInstanceOf(Array);
    const movieUser = statsRes.body.data.users.find((u: any) => u.visitorId === 'test-visitor-movie');
    expect(movieUser).toBeDefined();
    expect(movieUser.moviesPlayed.some((m: any) => m.title === 'The Notebook')).toBe(true);
    expect(movieUser.totalTimeSpentSec).toBeGreaterThanOrEqual(120);
    expect(movieUser.totalTimeSpentFormatted).toBeDefined();
    expect(movieUser.ip).toBeDefined();
    expect(statsRes.body.data.recentVisits[0].ip).toBeDefined();
    expect(statsRes.body.data.recentWatchedMovies[0].ip).toBeDefined();
  });

  it('GET /api/v1/analytics/account should reject unauthorized requests and return account data when authenticated', async () => {
    // 401 without auth
    const unauthorizedRes = await request(app).get('/api/v1/analytics/account');
    expect(unauthorizedRes.status).toBe(401);
    expect(unauthorizedRes.body.success).toBe(false);

    // 200 with valid key
    const authRes = await request(app)
      .get('/api/v1/analytics/account')
      .set('x-admin-key', 'bolt2026');
    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.data.email).toBeDefined();
    expect(authRes.body.data.username).toBeDefined();
    expect(authRes.body.data.password).toBeUndefined(); // Must never leak password
  });

  it('POST /api/v1/analytics/account should update email and password correctly', async () => {
    // Attempt password change without currentPassword -> fail
    const invalidPwdRes = await request(app)
      .post('/api/v1/analytics/account')
      .set('x-admin-key', 'bolt2026')
      .send({ newPassword: 'newsecurepass123' });
    expect(invalidPwdRes.status).toBe(400);

    // Attempt password change with wrong currentPassword -> fail
    const wrongCurrentRes = await request(app)
      .post('/api/v1/analytics/account')
      .set('x-admin-key', 'bolt2026')
      .send({ currentPassword: 'wrongpassword', newPassword: 'newsecurepass123' });
    expect(wrongCurrentRes.status).toBe(400);

    // Successful update of email, username, and password
    const updateRes = await request(app)
      .post('/api/v1/analytics/account')
      .set('x-admin-key', 'bolt2026')
      .send({
        email: 'cinewave.owner@gmail.com',
        username: 'CineWave Master',
        currentPassword: 'bolt2026',
        newPassword: 'master2026password'
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.email).toBe('cinewave.owner@gmail.com');
    expect(updateRes.body.data.username).toBe('CineWave Master');
    expect(updateRes.body.token).toBe('master2026password');

    // Access stats with new password -> 200
    const newStatsRes = await request(app)
      .get('/api/v1/analytics/stats')
      .set('x-admin-key', 'master2026password');
    expect(newStatsRes.status).toBe(200);

    // Access stats with old password -> 401
    const oldStatsRes = await request(app)
      .get('/api/v1/analytics/stats')
      .set('x-admin-key', 'oldboltpasswordrandom');
    expect(oldStatsRes.status).toBe(401);

    // Reset password back to bolt2026 so other tests or session defaults continue to work cleanly
    await request(app)
      .post('/api/v1/analytics/account')
      .set('x-admin-key', 'master2026password')
      .send({
        email: 'admin@cinewave.tv',
        username: 'Administrator',
        currentPassword: 'master2026password',
        newPassword: 'bolt2026'
      });
  });
});
