"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_DB = {
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
class Database {
    filePath;
    data;
    constructor(filePath) {
        const dataDir = path_1.default.resolve(process.cwd(), 'data');
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        this.filePath = filePath || path_1.default.join(dataDir, 'cinewave.json');
        this.data = this.load();
    }
    load() {
        try {
            if (fs_1.default.existsSync(this.filePath)) {
                const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                return {
                    ...DEFAULT_DB,
                    ...parsed,
                    profiles: parsed.profiles?.length ? parsed.profiles : DEFAULT_DB.profiles
                };
            }
        }
        catch (err) {
            console.warn(`[Database] Failed to read ${this.filePath}, initializing new default:`, err);
        }
        this.save(DEFAULT_DB);
        return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    save(dataToSave) {
        try {
            const tempPath = `${this.filePath}.tmp`;
            fs_1.default.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
            fs_1.default.renameSync(tempPath, this.filePath);
        }
        catch (err) {
            console.error(`[Database] Atomic write failed for ${this.filePath}:`, err);
        }
    }
    // Profiles
    getProfiles() {
        return this.data.profiles;
    }
    getProfile(id) {
        return this.data.profiles.find(p => p.id === id);
    }
    addProfile(name, avatar) {
        const profile = {
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
    getWatchlist(profileId) {
        return this.data.watchlist.filter(w => w.profileId === profileId);
    }
    addToWatchlist(item) {
        const existingIndex = this.data.watchlist.findIndex(w => w.profileId === item.profileId && w.contentId === item.contentId);
        const fullItem = {
            ...item,
            addedAt: new Date().toISOString()
        };
        if (existingIndex >= 0) {
            this.data.watchlist[existingIndex] = fullItem;
        }
        else {
            this.data.watchlist.unshift(fullItem);
        }
        this.save(this.data);
        return fullItem;
    }
    removeFromWatchlist(profileId, contentId) {
        const initialLen = this.data.watchlist.length;
        this.data.watchlist = this.data.watchlist.filter(w => !(w.profileId === profileId && w.contentId === contentId));
        const changed = this.data.watchlist.length < initialLen;
        if (changed) {
            this.save(this.data);
        }
        return changed;
    }
    isInWatchlist(profileId, contentId) {
        return this.data.watchlist.some(w => w.profileId === profileId && w.contentId === contentId);
    }
    // Playback Progress
    getProgress(profileId) {
        return this.data.progress
            .filter(p => p.profileId === profileId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    getItemProgress(profileId, contentId, season, episode) {
        return this.data.progress.find(p => p.profileId === profileId &&
            p.contentId === contentId &&
            (season === undefined || p.season === season) &&
            (episode === undefined || p.episode === episode));
    }
    saveProgress(progress) {
        const fullProgress = {
            ...progress,
            updatedAt: new Date().toISOString()
        };
        const existingIndex = this.data.progress.findIndex(p => p.profileId === progress.profileId &&
            p.contentId === progress.contentId &&
            p.season === progress.season &&
            p.episode === progress.episode);
        if (existingIndex >= 0) {
            this.data.progress[existingIndex] = fullProgress;
        }
        else {
            this.data.progress.unshift(fullProgress);
        }
        this.save(this.data);
        return fullProgress;
    }
    removeProgress(profileId, contentId) {
        const initialLen = this.data.progress.length;
        this.data.progress = this.data.progress.filter(p => !(p.profileId === profileId && p.contentId === contentId));
        const changed = this.data.progress.length < initialLen;
        if (changed) {
            this.save(this.data);
        }
        return changed;
    }
    // Settings
    getSettings() {
        return { ...this.data.settings };
    }
    setSetting(key, value) {
        this.data.settings[key] = value;
        this.save(this.data);
    }
}
exports.Database = Database;
exports.db = new Database();
