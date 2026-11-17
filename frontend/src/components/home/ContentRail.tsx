import React, { useRef, useCallback } from 'react';
import { CatalogRail, MediaItem } from '../../types';
import { MediaCard } from './MediaCard';
import { Top10Card } from './Top10Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentRailProps {
  rail: CatalogRail;
  isTop10?: boolean;
  onSelectItem: (item: MediaItem) => void;
  progressMap?: Record<string, number>;
  onNearEnd?: (railId: string) => void;
}

export const ContentRail: React.FC<ContentRailProps> = ({
  rail,
  isTop10 = false,
  onSelectItem,
  progressMap = {},
  onNearEnd
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Trigger continuous loading on horizontal scroll near the right end
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || !onNearEnd) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 600) {
      onNearEnd(rail.id);
    }
  }, [onNearEnd, rail.id]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -450, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 450, behavior: 'smooth' });
    }
  };

  if (!rail.items || rail.items.length === 0) return null;

  return (
    <div className="relative group space-y-1.5 py-1.5 sm:py-2 select-none">
      {/* Rail Title */}
      <div className="px-4 sm:px-6 md:pl-20 md:pr-8 flex items-baseline justify-between">
        <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white flex items-center space-x-2">
          <span>{rail.title}</span>
          {isTop10 && (
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#E50914] bg-[#E50914]/15 px-1.5 sm:px-2 py-0.5 rounded-[2px] border border-[#E50914]/30">
              TOP 10
            </span>
          )}
        </h2>
      </div>

      {/* Desktop Chevron Scroll Left */}
      <button
        onClick={handleScrollLeft}
        className="hidden md:group-hover:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-2/3 bg-black/70 hover:bg-black/90 text-white items-center justify-center transition-opacity rounded-r-md cursor-pointer border-r border-white/10"
        title="Scroll left"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-center space-x-2.5 sm:space-x-3 overflow-x-auto overflow-y-visible py-2 sm:py-3 px-4 sm:px-6 md:pl-20 md:pr-8 no-scrollbar scroll-smooth scroll-px-4 md:scroll-px-20"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {rail.items.map((item, index) => {
          if (isTop10 && index < 10) {
            return (
              <Top10Card
                key={`top10-${item.id}-${index}`}
                item={item}
                rank={index + 1}
                onSelect={onSelectItem}
              />
            );
          }

          const progress = progressMap[item.id];
          // Pre-fetch 8 cards early for seamless continuous horizontal scrolling
          const isNearEnd = index >= Math.max(0, rail.items.length - 8);

          return (
            <MediaCard
              key={`${rail.id}-${item.id}-${index}`}
              item={item}
              railId={rail.id}
              index={index}
              progressPercent={progress}
              onSelect={onSelectItem}
              onNearEnd={isNearEnd && onNearEnd ? () => onNearEnd(rail.id) : undefined}
            />
          );
        })}

        {/* End of list loading/action card */}
        {onNearEnd && !isTop10 && rail.items.length >= 8 && (
          <div
            onClick={() => onNearEnd(rail.id)}
            className="flex-shrink-0 w-24 sm:w-28 md:w-36 lg:w-40 aspect-[2/3] rounded-[4px] border border-dashed border-zinc-700/60 bg-zinc-900/40 flex flex-col items-center justify-center p-2 sm:p-3 text-center cursor-pointer hover:border-[#E50914]/60 transition-colors"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin mb-1 sm:mb-2" />
            <span className="text-[11px] sm:text-xs font-bold text-zinc-300">Loading More</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-0.5">Scroll to browse</span>
          </div>
        )}
      </div>

      {/* Desktop Chevron Scroll Right */}
      <button
        onClick={handleScrollRight}
        className="hidden md:group-hover:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-2/3 bg-black/70 hover:bg-black/90 text-white items-center justify-center transition-opacity rounded-l-md cursor-pointer border-l border-white/10"
        title="Scroll right"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
};
