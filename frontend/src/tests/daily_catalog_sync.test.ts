import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  parseSubtitles,
  getActiveCues,
  adjustCueTiming,
  SubtitleCue
} from '../utils/subtitleParser';
import {
  getBackendBaseUrl,
  getCachedHomeCatalogSync
} from '../services/api';

describe('Daily Catalog Rollover, Serverless Routing, & Frame-Accurate Subtitle Sync', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
  });

  describe('1. Subtitle Parser HTML Guard & Binary-Search Active Cues', () => {
    it('rejects HTML error pages, 404 documents, and Cloudflare challenges cleanly', () => {
      expect(parseSubtitles('<!DOCTYPE html><html><body>404 Not Found</body></html>', 'srt')).toEqual([]);
      expect(parseSubtitles('<html><head><title>Attention Required! | Cloudflare</title></head></html>', 'vtt')).toEqual([]);
      expect(parseSubtitles('   \uFEFF<html><body>Just a moment...</body></html>', 'srt')).toEqual([]);
    });

    it('parses UTF-8 BOM SRT cleanly and resolves overlapping cues via O(log N) lookup', () => {
      const bomSrt =
        '\uFEFF1\n00:00:10,000 --> 00:00:25,000\nBackground sign\n\n' +
        '2\n00:00:12,000 --> 00:00:14,000\nFirst line\n\n' +
        '3\n00:00:16,000 --> 00:00:19,000\nSecond line\n';
      const cues = parseSubtitles(bomSrt, 'srt');
      expect(cues).toHaveLength(3);

      const at13 = getActiveCues(cues, 13.0);
      expect(at13.map((c) => c.text)).toEqual(['Background sign', 'First line']);

      // Cue #1 still active at t=18 even though cue #2 already ended at t=14
      const at18 = getActiveCues(cues, 18.0);
      expect(at18.map((c) => c.text)).toEqual(['Background sign', 'Second line']);
    });

    it('handles large 2000-cue subtitle files quickly and falls back safely on unsorted arrays', () => {
      const bulkCues: SubtitleCue[] = [];
      for (let i = 0; i < 2000; i++) {
        bulkCues.push({
          start: i * 3,
          end: i * 3 + 2,
          text: `Line ${i}`
        });
      }
      const match = getActiveCues(bulkCues, 1500 * 3 + 1.2);
      expect(match).toHaveLength(1);
      expect(match[0].text).toBe('Line 1500');

      const unsorted: SubtitleCue[] = [
        { start: 30, end: 35, text: 'Late' },
        { start: 5, end: 10, text: 'Early' }
      ];
      expect(getActiveCues(unsorted, 7.5).map((c) => c.text)).toEqual(['Early']);
    });

    it('computes adjustCueTiming accurately for negative/positive offset and FPS pull-down', () => {
      // Negative offset (-2.0s) shifts subtitles earlier: at t=10s video, look up t=12s in subtitle file
      expect(adjustCueTiming(10, -2.0, 1)).toBeCloseTo(12.0, 4);
      // Positive offset (+1.5s) delays subtitles: at t=10s video, look up t=8.5s in subtitle file
      expect(adjustCueTiming(10, 1.5, 1)).toBeCloseTo(8.5, 4);
      // 23.976fps SRT on 25fps stream at 1 hour (3600s) scales by ~1.0427
      const fps239To25 = 25 / 23.976023976;
      expect(adjustCueTiming(3600, 0, fps239To25)).toBeCloseTo(3753.75, 1);
    });
  });

  describe('2. Vercel Same-Origin API & Daily SWR Cache Rollover', () => {
    beforeEach(() => {
      const store = new Map<string, string>();
      (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k)
      };
    });

    it('routes vercel.app hosts to same-origin serverless /api endpoints without Render fallback latency', () => {
      (globalThis as any).window = {
        location: {
          hostname: 'netflix-bolt.vercel.app',
          protocol: 'https:',
          origin: 'https://netflix-bolt.vercel.app'
        }
      };
      expect(getBackendBaseUrl()).toBe('');
    });

    it('marks daily SWR catalog cache as stale when cached date rolls past midnight UTC', () => {
      const mockCatalog = {
        hero: null,
        rails: [
          { id: 'rail-added-daily', title: 'Added Daily • New Releases', type: 'movie', category: 'new_releases', items: [] }
        ]
      };
      const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
      localStorage.setItem(
        'cinewave_home_swr_v2',
        JSON.stringify({
          date: yesterday,
          ts: Date.now() - 1000, // Only 1s old by timestamp, but previous UTC date
          data: mockCatalog
        })
      );

      const swr = getCachedHomeCatalogSync();
      expect(swr).not.toBeNull();
      expect(swr?.isSameDay).toBe(false);
      expect(swr?.isFresh).toBe(false);

      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        'cinewave_home_swr_v2',
        JSON.stringify({
          date: today,
          ts: Date.now() - 1000,
          data: mockCatalog
        })
      );
      const todaySwr = getCachedHomeCatalogSync();
      expect(todaySwr?.isSameDay).toBe(true);
      expect(todaySwr?.isFresh).toBe(true);
    });
  });

  describe('3. Serverless Routes, Vite Code Splitting & Daily Runtime Architecture Contracts', () => {
    it('configures frontend/vercel.json rewrite to exclude /api/ from SPA index.html catch-all', () => {
      const vercelPath = path.resolve(__dirname, '../../vercel.json');
      const raw = fs.readFileSync(vercelPath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.rewrites).toContainEqual({
        source: '/((?!api/).*)',
        destination: '/index.html'
      });
    });

    it('includes all three Vercel serverless API handlers with runtime daily dates and matched subtitles', () => {
      const homeFn = fs.readFileSync(path.resolve(__dirname, '../../api/v1/catalog/home.js'), 'utf-8');
      const playbackFn = fs.readFileSync(path.resolve(__dirname, '../../api/v1/playback/resolve.js'), 'utf-8');
      const proxyFn = fs.readFileSync(path.resolve(__dirname, '../../api/v1/subtitles/proxy.js'), 'utf-8');

      expect(homeFn).toContain("new Date().toISOString().slice(0, 10)");
      expect(homeFn).toContain('Added Daily');
      expect(homeFn).toContain('s-maxage=');

      expect(playbackFn).toContain('opensubtitles-v3.strem.io');
      expect(playbackFn).toContain('external_ids');
      expect(playbackFn).toContain('api.framextv.pro');

      expect(proxyFn).toContain('Access-Control-Allow-Origin');
      expect(proxyFn).toContain('<!doctype');
    });

    it('configures manualChunks in vite.config.ts and React.lazy route splitting in App.tsx', () => {
      const viteCfg = fs.readFileSync(path.resolve(__dirname, '../../vite.config.ts'), 'utf-8');
      const appSrc = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');
      const playerSrc = fs.readFileSync(path.resolve(__dirname, '../components/player/VideoPlayer.tsx'), 'utf-8');
      const overlaySrc = fs.readFileSync(path.resolve(__dirname, '../components/player/SubtitleOverlay.tsx'), 'utf-8');

      expect(viteCfg).toContain('manualChunks');
      expect(viteCfg).toContain('vendor-hls');
      expect(appSrc).toContain('lazy(() => import');
      expect(appSrc).toContain('SERIES_EXTRA_RAILS');
      expect(playerSrc).toContain('requestAnimationFrame');
      expect(playerSrc).toContain('offsetSec={subtitleOffsetSec}');
      expect(playerSrc).not.toContain('<track');
      expect(overlaySrc).toContain('adjustCueTiming');
    });
  });
});
