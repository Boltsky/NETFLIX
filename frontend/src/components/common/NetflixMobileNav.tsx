import React from 'react';
import {
  Home,
  Tv,
  Film,
  Search,
  LayoutGrid,
  Bookmark,
  Settings,
  Download
} from 'lucide-react';
import { NetflixProfile } from '../profile/ProfileSelector';
import { NetflixNavTab } from './NetflixSidebar';

interface NetflixMobileNavProps {
  currentTab: NetflixNavTab;
  onSelectTab: (tab: NetflixNavTab) => void;
  activeProfile: NetflixProfile;
  onSwitchProfile: () => void;
  onOpenSettings?: () => void;
}

export const NetflixMobileNav: React.FC<NetflixMobileNavProps> = ({
  currentTab,
  onSelectTab,
  activeProfile,
  onSwitchProfile,
  onOpenSettings
}) => {
  const navItems: Array<{ id: NetflixNavTab; label: string; icon: any }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'watchlist', label: 'My List', icon: Bookmark }
  ];

  return (
    <>
      {/* Mobile Top App Bar (< 768px) */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-gradient-to-b from-black/95 via-black/80 to-transparent px-4 py-2.5 flex items-center justify-between pointer-events-auto">
        {/* Netflix Red "N" Ribbon Logo & Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <svg viewBox="0 0 100 160" width="18" height="28" className="w-4.5 h-7 filter drop-shadow">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
          <span className="text-lg font-black tracking-tighter text-[#E50914] font-sans">
            NETFLIX
          </span>
        </div>

        {/* Action Controls: Settings & Profile Avatar */}
        <div className="flex items-center space-x-3.5">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`p-1.5 rounded-full transition-colors ${
                currentTab === 'settings' ? 'text-[#E50914] bg-white/10' : 'text-zinc-300 hover:text-white'
              }`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Profile Switcher Button */}
          <button
            onClick={onSwitchProfile}
            className={`w-7 h-7 rounded-sm flex items-center justify-center relative cursor-pointer ring-1 ring-white/20 active:scale-95 transition-transform ${activeProfile.avatarBg}`}
            title={`Active: ${activeProfile.name}`}
            aria-label="Switch Profile"
          >
            <div className="w-3 h-1 border-b-2 border-white rounded-b-full" />
            {activeProfile.isVip && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black flex items-center justify-center text-[7px] text-black font-black leading-none">
                ★
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#121212]/95 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-around h-14 px-1 safe-area-bottom select-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={`mob-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors active:scale-95 ${
                isActive ? 'text-[#E50914]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[9px] tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
