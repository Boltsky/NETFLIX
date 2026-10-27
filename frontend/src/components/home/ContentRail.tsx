import React from 'react';
import { CatalogRail, MediaItem } from '../../types';
import { MediaCard } from './MediaCard';
import { Top10Card } from './Top10Card';

interface ContentRailProps {
  rail: CatalogRail;
  isTop10?: boolean;
  onSelectItem: (item: MediaItem) => void;
  progressMap?: Record<string, number>;
}

export const ContentRail: React.FC<ContentRailProps> = ({
  rail,
  isTop10 = false,
  onSelectItem,
  progressMap = {}
}) => {
  if (!rail.items || rail.items.length === 0) return null;

  return (
    <div className="space-y-2 py-3 select-none">
      {/* Rail Title */}
      <div className="pl-24 pr-8 flex items-baseline justify-between">
        <h2 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center space-x-2">
          <span>{rail.title}</span>
          {isTop10 && (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E50914] bg-[#E50914]/15 px-2 py-0.5 rounded-[2px] border border-[#E50914]/30">
              TOP 10
            </span>
          )}
        </h2>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center space-x-3 md:space-x-4 overflow-x-auto overflow-y-visible py-4 pl-24 pr-8 no-scrollbar scroll-smooth">
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
          return (
            <MediaCard
              key={`${rail.id}-${item.id}-${index}`}
              item={item}
              railId={rail.id}
              index={index}
              progressPercent={progress}
              onSelect={onSelectItem}
            />
          );
        })}
      </div>
    </div>
  );
};
