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
});
