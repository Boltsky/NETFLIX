import fs from 'fs';
import path from 'path';
import { UserProfile, WatchlistItem, PlaybackProgress } from '../types/index.js';

interface DatabaseSchema {
  profiles: UserProfile[];
  watchlist: WatchlistItem[];
  progress: PlaybackProgress[];
  settings: Record<string, string>;
}

const DEFAULT_DB: DatabaseSchema = {
  profiles: [
    {
      id: 'default-profile',
      name: 'Primary Viewer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      createdAt: new Date().toISOString()
    }
  ],
  watchlist: [],
  progress: [],
  settings: {
    theme: 'netflix-dark',
    autoplay: 'true',
    defaultQuality: '1080p'
  }
};

export class Database {
  private filePath: string;
  private data: DatabaseSchema;

  constructor(filePath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = filePath || path.join(dataDir, 'cinewave.json');
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DB,
          ...parsed,
          profiles: parsed.profiles?.length ? parsed.profiles : DEFAULT_DB.profiles
        };
      }
    } catch (err) {
      console.warn(`[Database] Failed to read ${this.filePath}, initializing new default:`, err);
    }
    this.save(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  private save(dataToSave: DatabaseSchema): void {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`[Database] Atomic write failed for ${this.filePath}:`, err);
    }
  }

  // Profiles
  getProfiles(): UserProfile[] {
    return this.data.profiles;
  }

  getProfile(id: string): UserProfile | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  addProfile(name: string, avatar?: string): UserProfile {
    const profile: UserProfile = {
      id: `profile-${Date.now()}`,
      name,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      createdAt: new Date().toISOString()
    };
    this.data.profiles.push(profile);
    this.save(this.data);
    return profile;
  }

  // Watchlist
  getWatchlist(profileId: string): WatchlistItem[] {
    return this.data.watchlist.filter(w => w.profileId === profileId);
  }

  addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): WatchlistItem {
    const existingIndex = this.data.watchlist.findIndex(
      w => w.profileId === item.profileId && w.contentId === item.contentId
    );
    const fullItem: WatchlistItem = {
      ...item,
      addedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      this.data.watchlist[existingIndex] = fullItem;
    } else {
      this.data.watchlist.unshift(fullItem);
    }
    this.save(this.data);
    return fullItem;
  }

  removeFromWatchlist(profileId: string, contentId: string): boolean {
    const initialLen = this.data.watchlist.length;
    this.data.watchlist = this.data.watchlist.filter(
      w => !(w.profileId === profileId && w.contentId === contentId)
    );
    const changed = this.data.watchlist.length < initialLen;
    if (changed) {
      this.save(this.data);
    }
    return changed;
  }

  isInWatchlist(profileId: string, contentId: string): boolean {
    return this.data.watchlist.some(
      w => w.profileId === profileId && w.contentId === contentId
    );
  }

  // Playback Progress
  getProgress(profileId: string): PlaybackProgress[] {
    return this.data.progress
      .filter(p => p.profileId === profileId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getItemProgress(profileId: string, contentId: string, season?: number, episode?: number): PlaybackProgress | undefined {
    return this.data.progress.find(p =>
      p.profileId === profileId &&
      p.contentId === contentId &&
      (season === undefined || p.season === season) &&
      (episode === undefined || p.episode === episode)
    );
  }

  saveProgress(progress: Omit<PlaybackProgress, 'updatedAt'>): PlaybackProgress {
    const fullProgress: PlaybackProgress = {
      ...progress,
      updatedAt: new Date().toISOString()
    };
    const existingIndex = this.data.progress.findIndex(p =>
      p.profileId === progress.profileId &&
      p.contentId === progress.contentId &&
      p.season === progress.season &&
      p.episode === progress.episode
    );
    if (existingIndex >= 0) {
      this.data.progress[existingIndex] = fullProgress;
    } else {
      this.data.progress.unshift(fullProgress);
    }
    this.save(this.data);
    return fullProgress;
  }

  removeProgress(profileId: string, contentId: string): boolean {
    const initialLen = this.data.progress.length;
    this.data.progress = this.data.progress.filter(
      p => !(p.profileId === profileId && p.contentId === contentId)
    );
    const changed = this.data.progress.length < initialLen;
    if (changed) {
      this.save(this.data);
    }
    return changed;
  }

  // Settings
  getSettings(): Record<string, string> {
    return { ...this.data.settings };
  }

  setSetting(key: string, value: string): void {
    this.data.settings[key] = value;
    this.save(this.data);
  }
}

export const db = new Database();
