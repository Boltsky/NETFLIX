import React from 'react';
import { MediaItem } from '../../types';
import { useFocusable } from '../focus/FocusContext';

interface Top10CardProps {
  item: MediaItem;
  rank: number; // 1 to 10
  onSelect: (item: MediaItem) => void;
}

export const Top10Card: React.FC<Top10CardProps> = ({ item, rank, onSelect }) => {
  const focusKey = `top10-card-${item.id}-${rank}`;
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'rail-top10',
    onEnter: () => onSelect(item)
  });

  const posterUrl = item.poster || item.backdrop;

  return (
    <div
      ref={ref}
      onClick={() => onSelect(item)}
      className="relative flex items-center flex-shrink-0 cursor-pointer group tv-focusable select-none"
    >
      {/* Massive Netflix Stylized Rank Number */}
      <div className="relative -mr-6 md:-mr-8 z-0">
        <span
          className="text-8xl md:text-9xl font-black italic tracking-tighter select-none font-sans"
          style={{
            color: '#141414',
            WebkitTextStroke: '3.5px #595959',
            textShadow: '0 0 10px rgba(0,0,0,0.9), 3px 3px 0 #000000'
          }}
        >
          {rank}
        </span>
      </div>

      {/* Poster Card */}
      <div
        className={`relative z-10 w-36 md:w-44 aspect-[2/3] rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-200 ${
          isFocused
            ? 'scale-110 border-white shadow-2xl ring-2 ring-[#E50914]'
            : 'group-hover:scale-105'
        }`}
      >
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-xs font-bold text-zinc-500 p-2 text-center">
            {item.title}
          </div>
        )}

        {/* Netflix Red "N" Badge on Top Left */}
        <div className="absolute top-1.5 left-1.5 z-20">
          <svg viewBox="0 0 100 160" width="14" height="20" className="w-3.5 h-5 filter drop-shadow">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
        </div>

        {/* Recently Added / Top 10 Red Banner */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
          <p className="text-[11px] font-bold text-white truncate drop-shadow">{item.title}</p>
        </div>
      </div>
    </div>
  );
};
