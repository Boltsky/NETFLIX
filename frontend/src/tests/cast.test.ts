import { describe, it, expect } from 'vitest';
import { generateQRCodeMatrix } from '../utils/qrGenerator';

describe('CineWave Multi-Screen Cast System Tests', () => {
  it('generates a valid QR Code matrix for a movie watch URL', () => {
    const url = 'https://netflix-bolt.onrender.com/#/watch/550?time=120&type=movie';
    const qr = generateQRCodeMatrix(url);

    expect(qr).toBeDefined();
    expect(qr.version).toBeGreaterThanOrEqual(1);
    expect(qr.size).toBe(qr.version * 4 + 17);
    expect(qr.modules.length).toBe(qr.size);
    expect(qr.modules[0].length).toBe(qr.size);

    // Verify top-left finder pattern corner is dark
    expect(qr.modules[0][0]).toBe(true);
    expect(qr.modules[0][6]).toBe(true);
    expect(qr.modules[6][0]).toBe(true);
    expect(qr.modules[6][6]).toBe(true);

    // Verify top-right finder pattern
    expect(qr.modules[0][qr.size - 7]).toBe(true);
    expect(qr.modules[0][qr.size - 1]).toBe(qr.modules[0][qr.size - 7]);

    // Verify bottom-left finder pattern
    expect(qr.modules[qr.size - 7][0]).toBe(true);
    expect(qr.modules[qr.size - 1][0]).toBe(qr.modules[qr.size - 7][0]);
  });

  it('correctly handles long episodic TV URLs with timestamps in QR generator', () => {
    const longUrl = 'https://netflix-bolt.onrender.com/#/watch/66732?time=1845&season=4&episode=9&type=tv&autoplay=1&cast=1';
    const qr = generateQRCodeMatrix(longUrl);

    expect(qr.version).toBeGreaterThanOrEqual(4);
    expect(qr.size).toBe(qr.version * 4 + 17);
    expect(qr.modules).toBeInstanceOf(Array);
  });

  it('verifies URL search params extraction for casting to Smart TV & PC', () => {
    const route = 'watch/550?time=340&season=1&episode=3&type=tv&autoplay=1&cast=1';
    const [pathPart, queryPart] = route.split('?');
    const id = pathPart.split('/')[1];
    const params = new URLSearchParams(queryPart || '');

    expect(id).toBe('550');
    expect(params.get('time')).toBe('340');
    expect(params.get('season')).toBe('1');
    expect(params.get('episode')).toBe('3');
    expect(params.get('type')).toBe('tv');
    expect(params.get('cast')).toBe('1');
  });

  it('preserves clean playback start position when casting movie', () => {
    const currentTimeSec = 142.6;
    const item = { id: '550', type: 'movie' as const };
    const params = new URLSearchParams({
      time: String(Math.max(0, Math.floor(currentTimeSec))),
      type: item.type,
      autoplay: '1',
      cast: '1'
    });

    const castUrl = `https://netflix-bolt.onrender.com/#/watch/${item.id}?${params.toString()}`;
    expect(castUrl).toContain('/#/watch/550?time=142&type=movie&autoplay=1&cast=1');
  });
});
