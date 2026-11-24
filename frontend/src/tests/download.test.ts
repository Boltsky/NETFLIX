import { describe, it, expect, beforeEach, vi } from 'vitest';
import { downloadService } from '../services/downloadService';
import { api } from '../services/api';

describe('Download Engine & IndexedDB Offline Storage Suite', () => {
  beforeEach(async () => {
    await downloadService.clearAllDownloads();
  });

  it('generates consistent unique download IDs for movies and TV show episodes', () => {
    const movieId = downloadService.getDownloadId('550', 'movie');
    expect(movieId).toBe('movie_550');

    const episodeId = downloadService.getDownloadId('60574', 'tv', 1, 3);
    expect(episodeId).toBe('tv_60574_s1_e3');
  });

  it('formats byte metrics accurately across units', () => {
    expect(downloadService.formatBytes(0)).toBe('0 B');
    expect(downloadService.formatBytes(512)).toBe('1 KB');
    expect(downloadService.formatBytes(50 * 1024 * 1024)).toBe('50 MB');
    expect(downloadService.formatBytes(1.4 * 1024 * 1024 * 1024)).toBe('1.40 GB');
  });

  it('retrieves storage quota information', async () => {
    const quota = await downloadService.getStorageQuota();
    expect(quota).toBeDefined();
    expect(quota.totalBytes).toBeGreaterThan(0);
    expect(quota.usedBytes).toBeGreaterThanOrEqual(0);
    expect(quota.usedFormatted).toBeDefined();
    expect(quota.availableFormatted).toBeDefined();
    expect(quota.percentUsed).toBeGreaterThanOrEqual(0);
  });

  it('resolves download options and returns video sizes with 1080p default', async () => {
    const res = await api.resolveDownload('550', 'movie', {
      title: 'Fight Club',
      duration: 139
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.defaultQuality).toBe('1080p');
    expect(res.qualities).toBeInstanceOf(Array);
    expect(res.qualities.length).toBeGreaterThanOrEqual(3);

    // Verify 1080p quality option and pre-download size metrics
    const q1080 = res.qualities.find((q) => q.quality === '1080p');
    expect(q1080).toBeDefined();
    expect(q1080?.sizeBytes).toBeGreaterThan(0);
    expect(q1080?.formattedSize).toBeDefined();
    expect(q1080?.formattedSize).toContain('GB');

    // Verify 720p quality option
    const q720 = res.qualities.find((q) => q.quality === '720p');
    expect(q720).toBeDefined();
    expect(q720?.sizeBytes).toBeGreaterThan(0);
    expect(q720?.formattedSize).toBeDefined();
  });

  it('starts direct disk download mode and marks completed with 100% progress', async () => {
    const triggerSpy = vi.spyOn(downloadService, 'triggerBrowserDownload').mockImplementation(() => {});

    const item = await downloadService.startDownload({
      contentId: '11036',
      mediaType: 'movie',
      title: 'The Notebook',
      duration: 124,
      quality: '1080p',
      mode: 'disk'
    });

    expect(item).toBeDefined();
    expect(item.contentId).toBe('11036');
    expect(item.quality).toBe('1080p');
    expect(item.status).toBe('completed');
    expect(item.progressPercent).toBe(100);

    triggerSpy.mockRestore();
  });

  it('manages download lifecycle: save, get, delete, and clear', async () => {
    vi.spyOn(downloadService, 'triggerBrowserDownload').mockImplementation(() => {});

    await downloadService.startDownload({
      contentId: '550',
      mediaType: 'movie',
      title: 'Fight Club',
      duration: 139,
      quality: '1080p',
      mode: 'disk'
    });

    let items = await downloadService.getDownloads();
    expect(items.length).toBe(1);
    expect(items[0].contentId).toBe('550');

    const retrieved = await downloadService.getDownload('movie_550');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Fight Club');

    // Delete single item
    await downloadService.deleteDownload('movie_550');
    items = await downloadService.getDownloads();
    expect(items.length).toBe(0);
  });
});
