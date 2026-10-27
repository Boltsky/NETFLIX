import React, { useState } from 'react';
import { MediaItem } from '../../types';
import { useFocusable } from '../focus/FocusContext';

interface MediaCardProps {
  item: MediaItem;
  railId: string;
  index: number;
  progressPercent?: number;
  onSelect: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  railId,
  index,
  progressPercent,
  onSelect
}) => {
  const [imageError, setImageError] = useState(false);
  const focusKey = `card-${railId}-${item.id}-${index}`;

  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: railId,
    onEnter: () => onSelect(item)
  });

  const posterUrl = item.poster || item.backdrop;

  return (
    <div
      ref={ref}
      onClick={() => onSelect(item)}
      className={`relative flex-shrink-0 w-40 md:w-48 aspect-[2/3] rounded-[4px] overflow-hidden bg-zinc-900 cursor-pointer tv-focusable transition-all duration-200 ${
        isFocused
          ? 'scale-110 z-30 shadow-2xl border-2 border-white ring-2 ring-[#E50914]'
          : 'hover:scale-104 border border-zinc-800/80'
      }`}
    >
      {/* Poster Image */}
      {posterUrl && !imageError ? (
        <img
          src={posterUrl}
          alt={item.title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900">
          <svg viewBox="0 0 100 160" width="32" height="48" className="w-8 h-12 mb-2 filter drop-shadow opacity-50">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
          <span className="text-xs font-bold text-zinc-400 line-clamp-2">{item.title}</span>
        </div>
      )}

      {/* Netflix Red "N" Ribbon Logo on Top Left */}
      <div className="absolute top-1.5 left-1.5 z-20">
        <svg viewBox="0 0 100 160" width="14" height="20" className="w-3.5 h-5 filter drop-shadow">
          <path d="M0 0h34v160H0z" fill="#B81D24" />
          <path d="M66 0h34v160H66z" fill="#B81D24" />
          <path d="M0 0h34l66 160H66z" fill="#E50914" />
        </svg>
      </div>

      {/* Top Right Type Tag */}
      <div className="absolute top-1.5 right-1.5 z-10">
        <span className="px-1 py-0.2 rounded-[2px] bg-black/70 backdrop-blur-md text-[8px] font-mono font-bold text-zinc-300 uppercase border border-white/10">
          {item.type === 'tv' ? 'SERIES' : 'FILM'}
        </span>
      </div>

      {/* Focused Mini Card Details Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-200 ${
          isFocused ? 'opacity-100' : 'opacity-85'
        }`}
      >
        <p className="text-xs font-bold text-white truncate drop-shadow">{item.title}</p>
        <div className="flex items-center space-x-2 text-[10px] font-bold mt-0.5">
          <span className="text-emerald-400">97% Match</span>
          <span className="border border-zinc-600 px-1 py-0.2 text-[8px] text-zinc-300 rounded-[2px]">
            {item.type === 'tv' ? 'TV-MA' : '16+'}
          </span>
          {item.year && <span className="text-zinc-400 font-normal">{item.year}</span>}
        </div>
      </div>

      {/* Continue Watching Red Progress Bar */}
      {progressPercent !== undefined && progressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-950/90 overflow-hidden z-20">
          <div
            className="h-full bg-[#E50914] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
};
