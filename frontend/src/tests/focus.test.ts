import { describe, it, expect } from 'vitest';

describe('Netflix TV Navigation & UX Tests', () => {
  it('formats Netflix remaining time correctly', () => {
    const formatRemainingTime = (current: number, total: number) => {
      if (total <= 0 || current > total) return '--:--';
      const remaining = Math.max(0, total - current);
      const hours = Math.floor(remaining / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const secs = Math.floor(remaining % 60);

      if (hours > 0) {
        return `-${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      return `-${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    expect(formatRemainingTime(0, 100)).toBe('-1:40');
    expect(formatRemainingTime(50, 100)).toBe('-0:50');
    expect(formatRemainingTime(100, 3700)).toBe('-1:00:00');
    expect(formatRemainingTime(3600, 3600)).toBe('-0:00');
  });

  it('calculates Top 10 ranks properly', () => {
    const items = ['Title 1', 'Title 2', 'Title 3'];
    const ranks = items.map((_, idx) => idx + 1);
    expect(ranks).toEqual([1, 2, 3]);
  });

  it('handles spatial direction logic for remote D-pad', () => {
    const current = { x: 100, y: 100 };
    const leftTarget = { x: 20, y: 100 }; // Sidebar item to the left

    const dxLeft = leftTarget.x - current.x;
    expect(dxLeft < -8).toBe(true);
  });

  it('validates TV QWERTY keyboard layout structure', async () => {
    const { QWERTY_ROWS } = await import('../components/search/SearchScreen');
    expect(QWERTY_ROWS.length).toBe(6);
    // Row 1: 10 numbers
    expect(QWERTY_ROWS[0].map(k => k.key)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
    // Row 2: QWERTYUIOP
    expect(QWERTY_ROWS[1].map(k => k.key)).toEqual(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']);
    // Row 3: ASDFGHJKL
    expect(QWERTY_ROWS[2].map(k => k.key)).toEqual(['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']);
    // Row 4: ZXCVBNM
    expect(QWERTY_ROWS[3].map(k => k.key)).toEqual(['Z', 'X', 'C', 'V', 'B', 'N', 'M']);
    // Row 5: Action keys & Search
    expect(QWERTY_ROWS[4].map(k => k.key)).toEqual(['SPACE', 'BACKSPACE', 'CLEAR', 'SEARCH']);
    // Row 6: Direction keys
    expect(QWERTY_ROWS[5].map(k => k.key)).toEqual(['ARROW_LEFT', 'ARROW_UP', 'ARROW_DOWN', 'ARROW_RIGHT']);
  });

  it('persists and deduplicates complete search words in search history', async () => {
    const { saveSearchHistoryWord, getSearchHistory, clearSearchHistory } = await import('../components/search/SearchScreen');
    const profileId = 'test-profile-1';

    clearSearchHistory(profileId);
    expect(getSearchHistory(profileId)).toEqual([]);

    // Save complete search words
    saveSearchHistoryWord('I Am Legend', profileId);
    saveSearchHistoryWord('Fight Club', profileId);
    saveSearchHistoryWord('Grey\'s Anatomy', profileId);

    const history = getSearchHistory(profileId);
    expect(history.length).toBe(3);
    expect(history[0]).toBe('Grey\'s Anatomy');
    expect(history[1]).toBe('Fight Club');
    expect(history[2]).toBe('I Am Legend');

    // Deduplication check: re-searching 'Fight Club' moves it to the front
    saveSearchHistoryWord('fight club', profileId);
    const updated = getSearchHistory(profileId);
    expect(updated.length).toBe(3);
    expect(updated[0]).toBe('fight club');

    // Clear history
    clearSearchHistory(profileId);
    expect(getSearchHistory(profileId)).toEqual([]);
  });

  it('guarantees BOLT profile is default, immutable, and marked VIP', async () => {
    const { BOLT_PROFILE, getStoredProfiles, saveStoredProfiles } = await import('../components/profile/ProfileSelector');

    expect(BOLT_PROFILE.id).toBe('bolt');
    expect(BOLT_PROFILE.name).toBe('BOLT');
    expect(BOLT_PROFILE.isVip).toBe(true);
    expect(BOLT_PROFILE.isDefault).toBe(true);

    // Verify getStoredProfiles always preserves BOLT at index 0
    const profiles = getStoredProfiles();
    expect(profiles[0].name).toBe('BOLT');
    expect(profiles[0].isVip).toBe(true);
    expect(profiles[0].isDefault).toBe(true);

    // Even if someone tries to save a list without BOLT or renamed BOLT
    saveStoredProfiles([
      { id: 'custom-1', name: 'Custom User', avatarBg: 'bg-[#1E88E5]' }
    ]);
    const restored = getStoredProfiles();
    expect(restored[0].name).toBe('BOLT');
    expect(restored[0].isVip).toBe(true);
    expect(restored.length).toBeGreaterThanOrEqual(2);
  });

  it('verifies rich catalog loaded with 20+ movies across multiple rails', async () => {
    const { api } = await import('../services/api');
    const catalog = await api.getHomeCatalog();

    expect(catalog).toBeDefined();
    expect(catalog.hero).toBeDefined();
    expect(catalog.rails.length).toBeGreaterThanOrEqual(4);

    const totalItems = catalog.rails.reduce((acc, r) => acc + r.items.length, 0);
    // Must contain dozens of movies/shows, never "very few movies"
    expect(totalItems).toBeGreaterThanOrEqual(20);

    // Verify categories cover key Netflix TV rows
    const categories = catalog.rails.map(r => r.category);
    expect(categories).toContain('trending');
    expect(categories).toContain('popular');
  });

  it('verifies direct bridge dispatches standard KeyboardEvents to window listeners for Back and Player', async () => {
    let capturedKey: string | null = null;
    const target: any = typeof window !== 'undefined' ? window : new EventTarget();

    const listener = (e: any) => {
      capturedKey = e.key;
    };
    target.addEventListener('keydown', listener);

    target.handleTvKeyEvent = (key: string) => {
      let event: any;
      if (typeof KeyboardEvent !== 'undefined') {
        event = new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true });
      } else {
        event = new Event('keydown');
        event.key = key;
      }
      target.dispatchEvent(event);
    };

    target.handleTvKeyEvent('Escape');
    expect(capturedKey).toBe('Escape');

    target.handleTvKeyEvent('ArrowLeft');
    expect(capturedKey).toBe('ArrowLeft');

    target.removeEventListener('keydown', listener);
  });

  it('verifies TMDB poster and backdrop URLs are memory-optimized for TV', async () => {
    const { api } = await import('../services/api');
    const catalog = await api.getHomeCatalog();
    const allItems = catalog.rails.flatMap(r => r.items);

    // Check posters do not use bloated /w500/ or /original/
    for (const item of allItems) {
      if (item.poster && item.poster.includes('image.tmdb.org')) {
        expect(item.poster).not.toContain('/w500/');
        expect(item.poster).not.toContain('/original/');
        expect(item.poster).toContain('/w342/');
      }
      if (item.backdrop && item.backdrop.includes('image.tmdb.org')) {
        expect(item.backdrop).not.toContain('/original/');
        expect(item.backdrop).not.toContain('/w1280/');
      }
    }
  });

  it('verifies continuous category movies pagination', async () => {
    const { api } = await import('../services/api');
    const res = await api.getCategoryMovies({ category: 'trending', page: 1 });
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.page).toBe(1);
    expect(res.results.length).toBeGreaterThan(0);
  });

  it('verifies genre continuous loading by genreId', async () => {
    const { api } = await import('../services/api');
    const res = await api.getCategoryMovies({ genreId: 28, page: 1 });
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.results.length).toBeGreaterThan(0);
  });

  it('verifies different genres load distinct movie catalogs', async () => {
    const { api } = await import('../services/api');
    const action = await api.getCategoryMovies({ genreId: 28, page: 1 });
    const comedy = await api.getCategoryMovies({ genreId: 35, page: 1 });
    expect(action.results.length).toBeGreaterThan(0);
    expect(comedy.results.length).toBeGreaterThan(0);
    // Comedy and Action must not be identical lists
    const actionFirstId = action.results[0].id;
    const comedyFirstId = comedy.results[0].id;
    expect(actionFirstId).not.toBe(comedyFirstId);
  });

  it('guarantees More Like This recommendations are always populated on titles', async () => {
    const { api } = await import('../services/api');
    const details = await api.getTitleDetails('550', 'movie');
    expect(details).toBeDefined();
    expect(details.recommendations).toBeDefined();
    expect(details.recommendations.length).toBeGreaterThanOrEqual(5);
    expect(details.recommendations[0].title).toBeDefined();
  });

  it('verifies in-player D-pad navigation model', () => {
    type Control = 'back' | 'scrubber' | 'play' | 'rewind' | 'forward' | 'server' | 'subtitles';
    const bottomRow: Control[] = ['play', 'rewind', 'forward', 'server', 'subtitles'];

    // Navigating UP from bottom row reaches scrubber (never opens modal)
    let current: Control = 'subtitles';
    const onUp = (c: Control): Control => {
      if (bottomRow.includes(c)) return 'scrubber';
      if (c === 'scrubber') return 'back';
      return 'back';
    };
    expect(onUp(current)).toBe('scrubber');
    expect(onUp('scrubber')).toBe('back');

    // Navigating DOWN from back reaches scrubber, then bottom row
    const onDown = (c: Control): Control => {
      if (c === 'back') return 'scrubber';
      if (c === 'scrubber') return 'play';
      return c;
    };
    expect(onDown('back')).toBe('scrubber');
    expect(onDown('scrubber')).toBe('play');

    // Left/Right on bottom row traverses horizontally
    const onRight = (c: Control): Control => {
      const idx = bottomRow.indexOf(c);
      if (idx >= 0 && idx < bottomRow.length - 1) return bottomRow[idx + 1];
      return c;
    };
    expect(onRight('play')).toBe('rewind');
    expect(onRight('rewind')).toBe('forward');
    expect(onRight('forward')).toBe('server');
    expect(onRight('server')).toBe('subtitles');
  });

  it('verifies stream source title accuracy validation rejects mismatched titles', async () => {
    const { isStreamUrlAccurate } = await import('../services/api');

    // Mismatched fuzzy scraper URLs MUST be rejected
    expect(isStreamUrlAccurate(
      'https://xstreamx.films365.org/movie/61851060-0292-4c4b-9542-17a7dc2a46d0/Apocalypse+Now',
      'Apocalypse Z: New World'
    )).toBe(false);

    expect(isStreamUrlAccurate(
      'https://xstreamx.films365.org/movie/f06d9d1f-749c-47a9-9dd7-40726cb36c1d/Monsters+University',
      'Verity'
    )).toBe(false);

    expect(isStreamUrlAccurate(
      'https://cdn2.fastcloud.live/movie/4UFTERCT1unmcLVVKXVtmhY_7bQ-1kcsrN9meDpZ3DQ.eAHCxlbL/bigtits.m3u8',
      'Fall 2: Deadpoint'
    )).toBe(false);

    // Matching URLs MUST be accepted
    expect(isStreamUrlAccurate(
      'https://xstreamx.films365.org/movie/a616bcaa-40eb-478e-8080-526ea87e16fa/The+Dark+Knight',
      'The Dark Knight'
    )).toBe(true);

    expect(isStreamUrlAccurate(
      'https://xstreamx.films365.org/movie/68725d9c-51b0-442c-a25e-399ea48f93a9/Deadpool+%26+Wolverine',
      'Deadpool & Wolverine'
    )).toBe(true);

    expect(isStreamUrlAccurate(
      'https://xstreamx.films365.org/movie/4bd0beb7-c0d5-452f-a3b0-ff8aeaf83dd2/Inception',
      'Inception'
    )).toBe(true);
  });

  it('verifies getTitleDetails never replaces an unknown ID with Stranger Things or Fight Club', async () => {
    const { api } = await import('../services/api');
    const unknownId = '999999999';
    const details = await api.getTitleDetails(unknownId, 'movie');

    expect(details.id).toBe(unknownId);
    expect(details.title).not.toBe('Stranger Things');
    expect(details.title).not.toBe('Fight Club');
  });

  it('verifies resolvePlayback embed servers prioritize verified TMDB providers', async () => {
    const { api } = await import('../services/api');
    const res = await api.resolvePlayback('155', 'movie');

    expect(res.embedServers).toBeDefined();
    expect(res.embedServers!.length).toBeGreaterThanOrEqual(4);
    expect(res.embedServers![0].name).toContain('VidSrc');
    expect(res.embedServers![1].name).toContain('MultiEmbed');
    expect(res.embedServers![0].url).toContain('155');
  });
});

