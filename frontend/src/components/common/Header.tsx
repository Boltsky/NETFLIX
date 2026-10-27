import React from 'react';
import { useFocusable } from '../focus/FocusContext';
import { Film, Search, Bookmark, Tv, Home, Clapperboard } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'series' | 'movies' | 'watchlist' | 'search';
  onSelectTab: (tab: 'home' | 'series' | 'movies' | 'watchlist' | 'search') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: 'home' | 'series' | 'movies' | 'watchlist' | 'search'; label: string; icon: any }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'series', label: 'TV Shows', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Clapperboard },
    { id: 'watchlist', label: 'My List', icon: Bookmark },
    { id: 'search', label: 'Search', icon: Search }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4 tv-safe-container flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
          <Film className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-wider text-white">
          CINE<span className="text-red-600">WAVE</span>
          <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 font-mono font-bold">TV</span>
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-6">
        {tabs.map((tab) => {
          return (
            <NavTabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={currentTab === tab.id}
              onSelect={() => onSelectTab(tab.id)}
            />
          );
        })}
      </nav>

      {/* Clock / Profile */}
      <div className="flex items-center space-x-4 text-xs font-mono text-zinc-400">
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white">
          P1
        </div>
      </div>
    </header>
  );
};

const NavTabButton: React.FC<{
  id: string;
  label: string;
  icon: any;
  isActive: boolean;
  onSelect: () => void;
}> = ({ id, label, icon: Icon, isActive, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `nav-${id}`,
    groupId: 'header-nav',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`flex items-center space-x-2 py-1.5 px-3 rounded-md transition-all text-sm font-semibold tv-focusable ${
        isFocused
          ? 'tv-nav-focused'
          : isActive
          ? 'text-white border-b-2 border-red-600'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive || isFocused ? 'text-red-500' : 'text-zinc-400'}`} />
      <span>{label}</span>
    </button>
  );
};
