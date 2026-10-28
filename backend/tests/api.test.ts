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
  }, 10000);

  it('GET /api/v1/playback/resolve should return stream and embed sources via query params', async () => {
    const res = await request(app)
      .get('/api/v1/playback/resolve?contentId=550&type=movie');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sources).toBeInstanceOf(Array);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.embedUrl).toContain('framextv.cc/embed/550');
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
});
