import React from 'react';
import { MediaItem } from '../../types';
import { useFocusable } from '../focus/FocusContext';
import { Play, Info, Plus, Check } from 'lucide-react';

interface HeroBannerProps {
  item: MediaItem | null;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  onPlay,
  onMoreInfo,
  isInWatchlist,
  onToggleWatchlist
}) => {
  if (!item) {
    return (
      <div className="w-full h-[70vh] bg-[#141414] animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
      </div>
    );
  }

  const backdropUrl = item.backdrop || item.poster || 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg';

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[760px] overflow-hidden select-none pl-18">
      {/* Cinematic Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        {/* Netflix Multi-Layered Dark Vignette Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 to-transparent w-3/4" />
      </div>

      {/* Hero Content */}
      <div className="relative h-full flex flex-col justify-end pb-16 px-12 max-w-3xl space-y-3.5 z-10">
        {/* Netflix Series / Film Prefix */}
        <div className="flex items-center space-x-2">
          {/* Netflix Red "N" */}
          <svg viewBox="0 0 100 160" width="16" height="24" className="w-4 h-6 filter drop-shadow">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
          <span className="text-xs font-black tracking-[0.25em] text-zinc-300 font-sans uppercase">
            {item.type === 'tv' ? 'S E R I E S' : 'F I L M'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg line-clamp-2">
          {item.title}
        </h1>

        {/* Netflix Official Top 10 Badge & Metadata Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white">
          {/* Top 10 Red Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-[#B81D24] to-[#E50914] px-2 py-0.5 rounded-[2px] shadow">
            <span className="text-[10px] font-black tracking-tight text-white uppercase">TOP 10</span>
          </div>
          <span className="text-white text-xs font-bold tracking-tight">
            #1 in {item.type === 'tv' ? 'TV Shows' : 'Movies'} Today
          </span>

          <span className="text-emerald-400 font-bold ml-1">98% Match</span>

          <span className="px-1.5 py-0.2 border border-zinc-500 text-zinc-300 text-[10px] rounded-[2px]">
            {item.type === 'tv' ? 'TV-MA' : '16+'}
          </span>

          {item.year && <span className="text-zinc-300">{item.year}</span>}

          <span className="px-1.5 py-0.2 border border-zinc-600 text-zinc-300 text-[10px] rounded-[2px] font-mono">
            4K Ultra HD
          </span>

          <span className="px-1.5 py-0.2 border border-zinc-600 text-zinc-300 text-[10px] rounded-[2px] font-mono">
            5.1
          </span>
        </div>

        {/* Overview */}
        <p className="text-zinc-200 text-sm md:text-base leading-relaxed line-clamp-3 max-w-2xl text-shadow font-normal">
          {item.overview || 'Watch this acclaimed Netflix release in Ultra HD streaming now.'}
        </p>

        {/* Netflix White Pill Play Button & Translucent More Info Button */}
        <div className="flex items-center space-x-4 pt-2">
          <NetflixPlayButton
            focusKey="hero-play"
            label="Play"
            onClick={() => onPlay(item)}
          />
          <NetflixInfoButton
            focusKey="hero-info"
            label="More Info"
            onClick={() => onMoreInfo(item)}
          />
          <NetflixMyListButton
            focusKey="hero-watchlist"
            isInWatchlist={isInWatchlist}
            onClick={() => onToggleWatchlist(item)}
          />
        </div>
      </div>
    </div>
  );
};

const NetflixPlayButton: React.FC<{
  focusKey: string;
  label: string;
  onClick: () => void;
}> = ({ focusKey, label, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'hero-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2.5 px-7 py-2.5 rounded-[4px] font-black text-sm tracking-wide transition-all tv-focusable ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-white text-black hover:bg-zinc-200 shadow-md'
      }`}
    >
      <Play className="w-5 h-5 fill-black text-black" />
      <span>{label}</span>
    </button>
  );
};

const NetflixInfoButton: React.FC<{
  focusKey: string;
  label: string;
  onClick: () => void;
}> = ({ focusKey, label, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'hero-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-2.5 rounded-[4px] font-bold text-sm tracking-wide transition-all tv-focusable ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-zinc-600/70 hover:bg-zinc-500/70 text-white backdrop-blur-md border border-white/10'
      }`}
    >
      <Info className="w-5 h-5 text-white" />
      <span>{label}</span>
    </button>
  );
};

const NetflixMyListButton: React.FC<{
  focusKey: string;
  isInWatchlist: boolean;
  onClick: () => void;
}> = ({ focusKey, isInWatchlist, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'hero-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all tv-focusable ${
        isFocused
          ? 'scale-110 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-black/60 hover:bg-zinc-800 text-white border-2 border-white/40'
      }`}
      title={isInWatchlist ? 'In My List' : 'Add to My List'}
    >
      {isInWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
    </button>
  );
};
