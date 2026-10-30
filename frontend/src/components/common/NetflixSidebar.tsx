import React, { useState } from 'react';
import { useFocusable, useFocus } from '../focus/FocusContext';
import {
  Search,
  Home,
  Tv,
  Film,
  Flame,
  Bookmark,
  LayoutGrid,
  Users,
  LogOut
} from 'lucide-react';
import { NetflixProfile } from '../profile/ProfileSelector';

export type NetflixNavTab = 'search' | 'home' | 'series' | 'movies' | 'popular' | 'watchlist' | 'categories';

interface NetflixSidebarProps {
  currentTab: NetflixNavTab;
  onSelectTab: (tab: NetflixNavTab) => void;
  activeProfile: NetflixProfile;
  onSwitchProfile: () => void;
  onExitApp?: () => void;
}

export const NetflixSidebar: React.FC<NetflixSidebarProps> = ({
  currentTab,
  onSelectTab,
  activeProfile,
  onSwitchProfile,
  onExitApp
}) => {
  const { focusedKey, setFocusedKey } = useFocus();
  const [isHovered, setIsHovered] = useState(false);
  const isSidebarFocused = Boolean(focusedKey && focusedKey.startsWith('sidebar-'));
  const isExpanded = isSidebarFocused || isHovered;

  const handleSelectTab = (tab: NetflixNavTab) => {
    onSelectTab(tab);
    // Auto-fold sidebar immediately by transferring focus to the destination screen's primary interactive element
    const transferFocus = () => {
      if (tab === 'home' || tab === 'series' || tab === 'movies' || tab === 'popular') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        setFocusedKey('hero-play');
      } else if (tab === 'categories') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        setFocusedKey('cat-pill-cat-trending');
      } else if (tab === 'search') {
        setFocusedKey('kb-Q');
      } else if (tab === 'watchlist') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        setFocusedKey('watch-explore-btn');
      }
    };

    transferFocus();
    setTimeout(transferFocus, 50);
    setTimeout(transferFocus, 150);
  };

  const navItems: Array<{ id: NetflixNavTab; label: string; icon: any }> = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'series', label: 'TV Shows', icon: Tv },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'popular', label: 'New & Popular', icon: Flame },
    { id: 'watchlist', label: 'My List', icon: Bookmark },
    { id: 'categories', label: 'Categories', icon: LayoutGrid }
  ];

  return (
    <>
      {/* Background glass scrim when sidebar is expanded */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Netflix Left Sidebar Drawer */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 bottom-0 z-50 bg-gradient-to-r from-black via-black/95 to-black/80 border-r border-white/5 transition-all duration-300 flex flex-col justify-between py-6 select-none ${
          isExpanded ? 'w-64 shadow-2xl' : 'w-18'
        }`}
      >
        {/* Top: Iconic Netflix Red "N" Ribbon */}
        <div className="px-5 mb-6 flex items-center space-x-3">
          <div className="w-8 h-10 flex-shrink-0 flex items-center justify-center">
            {/* SVG Netflix "N" Ribbon */}
            <svg viewBox="0 0 100 160" width="24" height="40" className="w-6 h-10 filter drop-shadow">
              <path d="M0 0h34v160H0z" fill="#B81D24" />
              <path d="M66 0h34v160H66z" fill="#B81D24" />
              <path d="M0 0h34l66 160H66z" fill="#E50914" />
            </svg>
          </div>
          {isExpanded && (
            <span className="text-xl font-black tracking-tighter text-[#E50914] font-sans">
              NETFLIX
            </span>
          )}
        </div>

        {/* Center: Navigation Menu Items */}
        <nav className="flex-1 flex flex-col space-y-1.5 px-3">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentTab === item.id}
              isExpanded={isExpanded}
              onSelect={() => handleSelectTab(item.id)}
            />
          ))}
        </nav>

        {/* Bottom: Profile & Switch Profile Actions */}
        <div className="px-3 pt-4 border-t border-white/10 space-y-1.5">
          {/* Active Profile */}
          <SidebarActionButton
            id="sidebar-profile"
            label={activeProfile.name}
            badge={activeProfile.isVip ? 'VIP' : undefined}
            isExpanded={isExpanded}
            onAction={onSwitchProfile}
            avatar={
              <div
                className={`w-6 h-6 rounded-sm flex items-center justify-center relative ${activeProfile.avatarBg}`}
              >
                <div className="w-2.5 h-1 border-b-2 border-white rounded-b-full" />
                {activeProfile.isVip && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black flex items-center justify-center text-[7px] text-black font-black leading-none">
                    ★
                  </span>
                )}
              </div>
            }
          />

          {/* Switch Profile Action */}
          <SidebarActionButton
            id="sidebar-switch"
            label="Switch Profiles"
            icon={Users}
            isExpanded={isExpanded}
            onAction={onSwitchProfile}
          />

          {/* Exit / Help */}
          <SidebarActionButton
            id="sidebar-exit"
            label="Exit Netflix"
            icon={LogOut}
            isExpanded={isExpanded}
            onAction={onExitApp || onSwitchProfile}
          />
        </div>
      </aside>
    </>
  );
};

const SidebarItem: React.FC<{
  id: string;
  label: string;
  icon: any;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
}> = ({ id, label, icon: Icon, isActive, isExpanded, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `sidebar-nav-${id}`,
    groupId: 'netflix-sidebar',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`relative w-full flex items-center h-11 px-3 rounded-md transition-all duration-150 tv-focusable text-left ${
        isFocused
          ? 'bg-white text-black font-bold shadow-lg'
          : isActive
          ? 'text-white font-bold'
          : 'text-zinc-400 hover:text-white'
      }`}
    >
      {/* Active Indicator Bar */}
      {isActive && !isFocused && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E50914] rounded-r-full" />
      )}

      {/* Icon */}
      <Icon
        className={`w-5 h-5 flex-shrink-0 transition-colors ${
          isFocused ? 'text-black' : isActive ? 'text-[#E50914]' : 'text-zinc-400'
        }`}
      />

      {/* Label (Revealed on expand) */}
      <span
        className={`ml-4 text-sm whitespace-nowrap transition-opacity duration-200 ${
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

const SidebarActionButton: React.FC<{
  id: string;
  label: string;
  badge?: string;
  icon?: any;
  avatar?: React.ReactNode;
  isExpanded: boolean;
  onAction: () => void;
}> = ({ id, label, badge, icon: Icon, avatar, isExpanded, onAction }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'netflix-sidebar',
    onEnter: onAction
  });

  return (
    <button
      ref={ref}
      onClick={onAction}
      className={`w-full flex items-center h-10 px-3 rounded-md transition-all tv-focusable text-left ${
        isFocused
          ? 'bg-white text-black font-bold shadow-lg'
          : 'text-zinc-400 hover:text-white'
      }`}
    >
      {avatar ? (
        <div className="flex-shrink-0">{avatar}</div>
      ) : (
        Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${isFocused ? 'text-black' : 'text-zinc-400'}`} />
      )}
      <div
        className={`ml-4 flex items-center space-x-1.5 whitespace-nowrap transition-opacity duration-200 ${
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-xs font-medium">{label}</span>
        {badge && (
          <span className="text-[9px] font-black uppercase tracking-wider px-1 py-0.2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded shadow-sm">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};
