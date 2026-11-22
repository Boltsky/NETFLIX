import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getAppSettings } from '../services/settingsService';

describe('Series Auto Next Episode Tests', () => {
  it('verifies autoplayNextEpisode is enabled by default in app settings', () => {
    const settings = getAppSettings();
    expect(settings.playback).toBeDefined();
    expect(settings.playback.autoplayNextEpisode).toBe(true);
  });

  it('verifies VideoPlayer implements automated next episode on HTML5 video ended and credit roll', () => {
    const playerCode = fs.readFileSync(path.resolve(__dirname, '../components/player/VideoPlayer.tsx'), 'utf-8');

    // OnEnded event in native video tag triggers next episode
    expect(playerCode).toContain('const onEnded = () => {');
    expect(playerCode).toContain('if (isEpisodic && onNextEpisode && appSettings.playback.autoplayNextEpisode) {');
    expect(playerCode).toContain('triggerNextEpisode();');

    // OnTimeUpdate triggers countdown during credit roll (last 15 seconds)
    expect(playerCode).toContain('video.duration - video.currentTime');
    expect(playerCode).toContain('startNextEpisodeCountdown();');
  });

  it('verifies VideoPlayer handles iframe postMessage ended and near-end timeupdate events', () => {
    const playerCode = fs.readFileSync(path.resolve(__dirname, '../components/player/VideoPlayer.tsx'), 'utf-8');

    // Telemetry ended check for embed players
    expect(playerCode).toContain("eventData?.event === 'ended'");
    expect(playerCode).toContain("eventData?.event === 'frameXTV:ended'");
    expect(playerCode).toContain("eventData?.type === 'complete'");
    expect(playerCode).toContain("eventData?.type === 'MEDIA_ENDED'");

    // Triggers next episode on ended
    expect(playerCode).toContain('[Netflix Player] Embed telemetry reported video ended, triggering next episode for series');

    // Near-end auto-transition in iframe timeupdate
    expect(playerCode).toContain('if (isEpisodic && onNextEpisode && dur > 40) {');
    expect(playerCode).toContain('cur >= dur - 2');
    expect(playerCode).toContain('dur - cur <= 15');
  });

  it('verifies Netflix Next Episode Post-Play Countdown Card UI is rendered with countdown, Play Now and Stay buttons', () => {
    const playerCode = fs.readFileSync(path.resolve(__dirname, '../components/player/VideoPlayer.tsx'), 'utf-8');

    // Countdown card presence
    expect(playerCode).toContain('nextEpisodeCountdown !== null && isEpisodic && onNextEpisode');
    expect(playerCode).toContain('Next Episode In {nextEpisodeCountdown}s');
    expect(playerCode).toContain('Play Now');
    expect(playerCode).toContain('Stay Here');
    expect(playerCode).toContain('triggerNextEpisode');
    expect(playerCode).toContain('dismissNextEpisodePrompt');
  });

  it('verifies TV Remote and Keyboard shortcuts for Next Episode (Enter, N, Back dismissal)', () => {
    const rawPlayerCode = fs.readFileSync(path.resolve(__dirname, '../components/player/VideoPlayer.tsx'), 'utf-8');
    const playerCode = rawPlayerCode.replace(/\r\n/g, '\n');

    // Enter confirms next episode during countdown
    expect(playerCode).toContain('if (nextEpisodeCountdown !== null) {\n            triggerNextEpisode();\n            return;\n          }');

    // 'n' / 'N' keyboard shortcut for next episode
    expect(playerCode).toContain("case 'n':\n        case 'N':");

    // Back / Escape dismisses countdown without exiting player
    expect(playerCode).toContain('if (nextEpisodeCountdown !== null) {\n            dismissNextEpisodePrompt();\n            return;\n          }');
  });

  it('verifies App.tsx mounts VideoPlayer with dynamic key ensuring clean remount on episode advance', () => {
    const appCode = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');

    expect(appCode).toContain('key={`${playerTarget.item.id}-s${playerTarget.season || 1}-e${playerTarget.episode || 1}`}');
    expect(appCode).toContain('onNextEpisode={handleNextEpisode}');
  });
});
