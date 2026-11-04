import React, { useState, useEffect } from 'react';
import { useFocusable, useFocus } from '../focus/FocusContext';
import {
  Sparkles,
  RefreshCw,
  Film,
  Subtitles,
  Info,
  Check,
  ArrowLeft,
  RotateCcw,
  Download,
  Server,
  Sliders,
  Tv
} from 'lucide-react';
import {
  getAppSettings,
  updateAppSettings,
  resetAppSettings,
  AppSettings,
  SubtitleStyles
} from '../../services/settingsService';
import { updateService } from '../../services/updateService';
import { CURRENT_APP_VERSION, AppUpdateManifest } from '../../version';
import { resolveSubtitleCss } from '../player/SubtitleOverlay';

interface SettingsScreenProps {
  onBack: () => void;
  onCheckUpdates?: () => void;
}

type SettingsCategory = 'updates' | 'playback' | 'subtitles' | 'about';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('updates');
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const { setFocusedKey } = useFocus();

  // Update checking state
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateManifest, setUpdateManifest] = useState<AppUpdateManifest | null>(null);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Subscribe to update progress
  useEffect(() => {
    const unsubscribe = updateService.subscribeProgress((percent, status) => {
      setDownloadProgress(percent);
      setUpdateStatusText(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateCategoryChange = (cat: SettingsCategory) => {
    setActiveCategory(cat);
  };

  const handleToggleAutoCheck = () => {
    const updated = updateAppSettings({
      updates: {
        ...settings.updates,
        autoCheckOnLaunch: !settings.updates.autoCheckOnLaunch
      }
    });
    setSettings(updated);
  };

  const handleManualCheck = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusText('Checking remote GitHub repository...');
    try {
      const manifest = await updateService.checkForAppUpdate(true);
      if (manifest) {
        setUpdateManifest(manifest);
        setUpdateStatusText(`New update available: v${manifest.versionName}`);
      } else {
        setUpdateManifest(null);
        setUpdateStatusText(`Your app is up to date (v${CURRENT_APP_VERSION.versionName}).`);
      }
    } catch {
      setUpdateStatusText('Failed to check for updates. Check internet connection.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = () => {
    if (!updateManifest?.apkUrl) return;
    setUpdateStatusText('Starting APK download...');
    updateService.startDownloadAndInstall(updateManifest.apkUrl);
  };

  const handleSetPreferredServer = (index: number) => {
    const updated = updateAppSettings({
      playback: {
        ...settings.playback,
        preferredServerIndex: index
      }
    });
    setSettings(updated);
  };

  const handleSetDefaultQuality = (quality: 'auto' | '1080p' | '720p' | '480p') => {
    const updated = updateAppSettings({
      playback: {
        ...settings.playback,
        defaultQuality: quality
      }
    });
    setSettings(updated);
  };

  const handleToggleAutoplay = () => {
    const updated = updateAppSettings({
      playback: {
        ...settings.playback,
        autoplayNextEpisode: !settings.playback.autoplayNextEpisode
      }
    });
    setSettings(updated);
  };

  const handleToggleFailover = () => {
    const updated = updateAppSettings({
      playback: {
        ...settings.playback,
        autoServerFailover: !settings.playback.autoServerFailover
      }
    });
    setSettings(updated);
  };

  const handleUpdateSubtitleStyle = (patch: Partial<SubtitleStyles>) => {
    const updated = updateAppSettings({
      subtitles: {
        ...settings.subtitles,
        ...patch
      }
    });
    setSettings(updated);
  };

  const handleResetSettings = () => {
    const defaults = resetAppSettings();
    setSettings(defaults);
    setUpdateStatusText('Settings reset to factory defaults.');
    setTimeout(() => setUpdateStatusText(null), 3000);
  };

  // Preview CSS for subtitles
  const previewCss = resolveSubtitleCss(settings.subtitles);

  const categories: Array<{ id: SettingsCategory; label: string; icon: any }> = [
    { id: 'updates', label: 'App Updates', icon: Sparkles },
    { id: 'playback', label: 'Playback & Servers', icon: Film },
    { id: 'subtitles', label: 'Subtitle Appearance', icon: Subtitles },
    { id: 'about', label: 'About & Diagnostics', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col pl-20 pr-10 py-10">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-8">
        <div className="flex items-center space-x-4">
          <SettingsBackButton onBack={onBack} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Customize playback, subtitles, and system updates</p>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Build v{CURRENT_APP_VERSION.versionName} ({CURRENT_APP_VERSION.commitHash})
        </div>
      </div>

      {/* 2-Pane TV Layout */}
      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Left Pane: Categories */}
        <div className="col-span-4 lg:col-span-3 flex flex-col space-y-2 border-r border-zinc-800/80 pr-6">
          {categories.map((cat) => (
            <CategoryTab
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={cat.icon}
              isActive={activeCategory === cat.id}
              onSelect={() => handleUpdateCategoryChange(cat.id)}
            />
          ))}
        </div>

        {/* Right Pane: Configuration Content */}
        <div className="col-span-8 lg:col-span-9 pl-4 overflow-y-auto max-h-[75vh]">
          {/* CATEGORY 1: UPDATES */}
          {activeCategory === 'updates' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Application Version</h3>
                    <p className="text-xs text-zinc-400">Current installed Android TV release</p>
                  </div>
                  <span className="px-3 py-1 bg-zinc-800 text-zinc-200 font-mono text-sm rounded-md border border-zinc-700">
                    v{CURRENT_APP_VERSION.versionName}
                  </span>
                </div>

                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Auto-Check on Startup</div>
                    <div className="text-xs text-zinc-400">Automatically inspect GitHub releases when opening app</div>
                  </div>
                  <SettingsToggleButton
                    focusKey="settings-toggle-autocheck"
                    checked={settings.updates.autoCheckOnLaunch}
                    onToggle={handleToggleAutoCheck}
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Check for New Version</div>
                    <div className="text-xs text-zinc-400">Query remote repository manifest for newer builds</div>
                  </div>
                  <SettingsActionButton
                    focusKey="settings-btn-checkupdate"
                    label={isCheckingUpdate ? 'Checking...' : 'Check Now'}
                    icon={RefreshCw}
                    onAction={handleManualCheck}
                    disabled={isCheckingUpdate}
                  />
                </div>

                {updateStatusText && (
                  <div className="mt-2 text-xs font-medium text-amber-400 bg-amber-950/30 border border-amber-800/50 p-3 rounded-md">
                    {updateStatusText}
                  </div>
                )}

                {downloadProgress !== null && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-300">
                      <span>Downloading Update</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#E50914] h-full transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {updateManifest && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>{updateManifest.title || `Version v${updateManifest.versionName}`}</span>
                    </div>
                    {updateManifest.changelog && updateManifest.changelog.length > 0 && (
                      <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside bg-zinc-950/50 p-3 rounded border border-zinc-800">
                        {updateManifest.changelog.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    )}
                    <SettingsActionButton
                      focusKey="settings-btn-installupdate"
                      label="Download & Install Update"
                      icon={Download}
                      onAction={handleInstallUpdate}
                      variant="primary"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CATEGORY 2: PLAYBACK & SERVERS */}
          {activeCategory === 'playback' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Preferred Streaming Server */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Default Streaming Server</h3>
                  <p className="text-xs text-zinc-400">Preferred embed server prioritized upon playback initiation</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {[
                    { idx: 0, name: 'FrameX', desc: 'Ad-free & Fast (Recommended)' },
                    { idx: 1, name: 'AutoEmbed', desc: 'Direct Multi-CDN Stream' },
                    { idx: 2, name: 'MultiEmbed', desc: 'Multi-host Aggregator' },
                    { idx: 3, name: '2Embed', desc: 'Fast HLS Embed' },
                    { idx: 4, name: 'VidSrc', desc: 'Alternative Scraper' }
                  ].map((srv) => (
                    <SettingsOptionPill
                      key={srv.idx}
                      focusKey={`settings-server-${srv.idx}`}
                      title={srv.name}
                      subtitle={srv.desc}
                      isSelected={settings.playback.preferredServerIndex === srv.idx}
                      onSelect={() => handleSetPreferredServer(srv.idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Streaming Preferences */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Streaming Behavior</h3>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-sm font-bold text-white">Autoplay Next Episode</div>
                    <div className="text-xs text-zinc-400">Automatically progress to next episode when current ends</div>
                  </div>
                  <SettingsToggleButton
                    focusKey="settings-toggle-autoplay"
                    checked={settings.playback.autoplayNextEpisode}
                    onToggle={handleToggleAutoplay}
                  />
                </div>
                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Automatic Server Failover</div>
                    <div className="text-xs text-zinc-400">Watchdog automatically rotates to next server if stream hangs (10s)</div>
                  </div>
                  <SettingsToggleButton
                    focusKey="settings-toggle-failover"
                    checked={settings.playback.autoServerFailover}
                    onToggle={handleToggleFailover}
                  />
                </div>

                {/* Default Quality */}
                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="text-sm font-bold text-white mb-2">Default Resolution</div>
                  <div className="flex space-x-3">
                    {(['auto', '1080p', '720p', '480p'] as const).map((q) => (
                      <SettingsOptionPill
                        key={q}
                        focusKey={`settings-quality-${q}`}
                        title={q.toUpperCase()}
                        isSelected={settings.playback.defaultQuality === q}
                        onSelect={() => handleSetDefaultQuality(q)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: SUBTITLE APPEARANCE */}
          {activeCategory === 'subtitles' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Live Preview Box */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden relative shadow-2xl">
                <div className="h-44 bg-gradient-to-t from-black via-zinc-900/40 to-transparent flex flex-col justify-end items-center pb-6 px-6 relative">
                  <div className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Live Television Subtitle Preview
                  </div>
                  <div
                    className="inline-block max-w-[85%] text-center px-4 py-1.5 rounded-[4px] leading-snug transition-all duration-150 select-none"
                    style={{
                      fontSize: previewCss.fontSize,
                      color: previewCss.color,
                      backgroundColor: previewCss.backgroundColor,
                      textShadow: previewCss.textShadow,
                      fontFamily: "'Netflix Sans', sans-serif"
                    }}
                  >
                    "Experience every word clearly on CineWave TV."
                  </div>
                </div>
              </div>

              {/* Styling Controls */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 space-y-5">
                {/* Font Size */}
                <div>
                  <div className="text-sm font-bold text-white mb-2">Font Size</div>
                  <div className="flex space-x-3">
                    {[
                      { id: 'small', label: 'Small (18px)' },
                      { id: 'medium', label: 'Medium (24px)' },
                      { id: 'large', label: 'Large (32px)' },
                      { id: 'extralarge', label: 'Extra Large (40px)' }
                    ].map((sz) => (
                      <SettingsOptionPill
                        key={sz.id}
                        focusKey={`settings-sub-size-${sz.id}`}
                        title={sz.label}
                        isSelected={settings.subtitles.fontSize === sz.id}
                        onSelect={() => handleUpdateSubtitleStyle({ fontSize: sz.id as any })}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="text-sm font-bold text-white mb-2">Text Color</div>
                  <div className="flex space-x-3">
                    {[
                      { color: '#FFFFFF', label: 'Crisp White' },
                      { color: '#FFEB3B', label: 'Bright Yellow' },
                      { color: '#00E5FF', label: 'Cyan Blue' },
                      { color: '#76FF03', label: 'Vibrant Green' }
                    ].map((col) => (
                      <SettingsOptionPill
                        key={col.color}
                        focusKey={`settings-sub-color-${col.color.replace('#', '')}`}
                        title={col.label}
                        colorBadge={col.color}
                        isSelected={settings.subtitles.textColor.toUpperCase() === col.color.toUpperCase()}
                        onSelect={() => handleUpdateSubtitleStyle({ textColor: col.color })}
                      />
                    ))}
                  </div>
                </div>

                {/* Background Opacity */}
                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="text-sm font-bold text-white mb-2">Background Box Opacity</div>
                  <div className="flex space-x-3">
                    {[
                      { op: 0, label: 'Transparent (0%)' },
                      { op: 50, label: 'Subtle (50%)' },
                      { op: 75, label: 'Standard (75%)' },
                      { op: 100, label: 'Solid Black (100%)' }
                    ].map((op) => (
                      <SettingsOptionPill
                        key={op.op}
                        focusKey={`settings-sub-opacity-${op.op}`}
                        title={op.label}
                        isSelected={settings.subtitles.backgroundOpacity === op.op}
                        onSelect={() => handleUpdateSubtitleStyle({ backgroundOpacity: op.op as any })}
                      />
                    ))}
                  </div>
                </div>

                {/* Edge Style */}
                <div className="pt-4 border-t border-zinc-800/60">
                  <div className="text-sm font-bold text-white mb-2">Text Edge Styling</div>
                  <div className="flex space-x-3">
                    {[
                      { edge: 'none', label: 'None' },
                      { edge: 'dropshadow', label: 'Drop Shadow' },
                      { edge: 'outline', label: 'Outline' }
                    ].map((ed) => (
                      <SettingsOptionPill
                        key={ed.edge}
                        focusKey={`settings-sub-edge-${ed.edge}`}
                        title={ed.label}
                        isSelected={settings.subtitles.edgeStyle === ed.edge}
                        onSelect={() => handleUpdateSubtitleStyle({ edgeStyle: ed.edge as any })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: ABOUT & DIAGNOSTICS */}
          {activeCategory === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">System Information</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Application Name</span>
                    <span className="font-bold text-zinc-200">CineWave TV / Netflix for Android TV</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Version Code</span>
                    <span className="font-bold text-zinc-200">{CURRENT_APP_VERSION.versionCode}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Version Name</span>
                    <span className="font-bold text-zinc-200">{CURRENT_APP_VERSION.versionName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Git Commit</span>
                    <span className="font-mono text-zinc-200">{CURRENT_APP_VERSION.commitHash}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Release Date</span>
                    <span className="font-bold text-zinc-200">{CURRENT_APP_VERSION.releaseDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Target Runtime</span>
                    <span className="font-bold text-zinc-200">Android TV Leanback (WebView Engine)</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-red-400">Reset Preferences</div>
                    <div className="text-xs text-zinc-500">Restore factory default settings for playback and subtitles</div>
                  </div>
                  <SettingsActionButton
                    focusKey="settings-btn-reset"
                    label="Reset Defaults"
                    icon={RotateCcw}
                    onAction={handleResetSettings}
                    variant="danger"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// UI Focusable Subcomponents
const SettingsBackButton: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: 'settings-btn-back',
    onEnter: onBack
  });

  return (
    <button
      ref={ref}
      onClick={onBack}
      className={`p-2.5 rounded-full transition-all ${
        isFocused
          ? 'bg-white text-black ring-4 ring-white/60 scale-110 shadow-2xl font-bold'
          : 'bg-zinc-900 text-white hover:bg-zinc-800'
      }`}
      title="Back to Home"
    >
      <ArrowLeft className={`w-5 h-5 ${isFocused ? 'text-black' : 'text-white'}`} />
    </button>
  );
};

const CategoryTab: React.FC<{
  id: string;
  label: string;
  icon: any;
  isActive: boolean;
  onSelect: () => void;
}> = ({ id, label, icon: Icon, isActive, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `settings-tab-${id}`,
    groupId: 'settings-categories',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-lg text-left transition-all text-sm font-bold tv-focusable ${
        isFocused
          ? 'bg-white text-black shadow-lg scale-[1.02]'
          : isActive
          ? 'bg-zinc-800/90 text-white border-l-4 border-[#E50914]'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
      }`}
    >
      <Icon className={`w-5 h-5 ${isFocused ? 'text-black' : isActive ? 'text-[#E50914]' : 'text-zinc-400'}`} />
      <span>{label}</span>
    </button>
  );
};

const SettingsToggleButton: React.FC<{
  focusKey: string;
  checked: boolean;
  onToggle: () => void;
}> = ({ focusKey, checked, onToggle }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    onEnter: onToggle
  });

  return (
    <button
      ref={ref}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-13 rounded-full transition-colors duration-200 focus:outline-none ${
        isFocused ? 'ring-4 ring-white/70 scale-105' : ''
      } ${checked ? 'bg-[#E50914]' : 'bg-zinc-700'}`}
      style={{ width: '48px' }}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 mt-1 ml-1 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const SettingsActionButton: React.FC<{
  focusKey: string;
  label: string;
  icon: any;
  onAction: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}> = ({ focusKey, label, icon: Icon, onAction, disabled, variant = 'default' }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    onEnter: () => {
      if (!disabled) onAction();
    }
  });

  const getVariantStyles = () => {
    if (disabled) return 'bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed';
    if (isFocused) return 'bg-white text-black font-bold ring-4 ring-white/60 scale-105 shadow-xl';
    if (variant === 'primary') return 'bg-[#E50914] text-white hover:bg-red-700';
    if (variant === 'danger') return 'bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/50';
    return 'bg-zinc-800 text-white hover:bg-zinc-700';
  };

  return (
    <button
      ref={ref}
      onClick={onAction}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center space-x-2 tv-focusable ${getVariantStyles()}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

const SettingsOptionPill: React.FC<{
  focusKey: string;
  title: string;
  subtitle?: string;
  colorBadge?: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ focusKey, title, subtitle, colorBadge, isSelected, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`p-3 rounded-lg border text-left transition-all flex-1 min-w-[120px] tv-focusable relative ${
        isFocused
          ? 'bg-white text-black border-white ring-4 ring-white/60 scale-105 shadow-xl font-bold'
          : isSelected
          ? 'bg-zinc-800 border-[#E50914] text-white'
          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex items-center space-x-2">
        {colorBadge && (
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/40 flex-shrink-0"
            style={{ backgroundColor: colorBadge }}
          />
        )}
        <span className="text-xs font-bold leading-tight">{title}</span>
        {isSelected && (
          <Check className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${isFocused ? 'text-black' : 'text-[#E50914]'}`} />
        )}
      </div>
      {subtitle && (
        <p className={`text-[10px] mt-1 line-clamp-1 ${isFocused ? 'text-zinc-800 font-normal' : 'text-zinc-500'}`}>
          {subtitle}
        </p>
      )}
    </button>
  );
};
